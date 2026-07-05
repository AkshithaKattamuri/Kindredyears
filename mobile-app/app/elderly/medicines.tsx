import { router } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import * as Notifications from "expo-notifications";

import { auth, db } from "../../config/firebase";

type MedicineStatus = "pending" | "taken" | "skipped";

type Medicine = {
  id: string;
  elderlyId: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  reminderHour?: number;
  reminderMinute?: number;
  notificationId?: string;
  instructions?: string;
  status: MedicineStatus;
};

const FREQUENCIES = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "As needed",
];

export default function MedicinesScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] =
    useState("Once daily");

  const [instructions, setInstructions] =
    useState("");

  // Actual selected time
  const [selectedTime, setSelectedTime] =
    useState<Date | null>(null);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAddModal, setShowAddModal] =
    useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);

      Alert.alert(
        "Not Signed In",
        "Please sign in again."
      );

      router.replace("/sign-in");
      return;
    }

    const medicinesQuery = query(
      collection(db, "medicines"),
      where("elderlyId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      medicinesQuery,
      (snapshot) => {
        const medicineList: Medicine[] =
          snapshot.docs.map((medicineDoc) => ({
            id: medicineDoc.id,
            ...(medicineDoc.data() as Omit<
              Medicine,
              "id"
            >),
          }));

        setMedicines(medicineList);
        setLoading(false);
      },
      (error) => {
        console.log(
          "Load medicines error:",
          error
        );

        setLoading(false);

        Alert.alert(
          "Unable to Load",
          "Could not load your medicines."
        );
      }
    );

    return unsubscribe;
  }, []);

  function resetForm() {
    setName("");
    setDosage("");
    setFrequency("Once daily");
    setSelectedTime(null);
    setInstructions("");
    setShowTimePicker(false);
  }

  function closeAddModal() {
    if (saving) {
      return;
    }

    setShowAddModal(false);
    resetForm();
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleTimeChange(
    event: DateTimePickerEvent,
    date?: Date
  ) {
    // On Android, close picker after selection/cancel
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event.type === "dismissed") {
      return;
    }

    if (date) {
      setSelectedTime(date);
    }
  }

  async function ensureNotificationPermission() {
    const currentPermission =
      await Notifications.getPermissionsAsync();

    if (currentPermission.status === "granted") {
      return true;
    }

    const requestedPermission =
      await Notifications.requestPermissionsAsync();

    return requestedPermission.status === "granted";
  }

  async function scheduleMedicineNotification(
    medicineName: string,
    medicineDosage: string,
    hour: number,
    minute: number
  ) {
    const hasPermission =
      await ensureNotificationPermission();

    if (!hasPermission) {
      throw new Error(
        "Notification permission was not granted."
      );
    }

    const notificationId =
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Medicine Reminder 💊",
          body: `Time to take ${medicineName} — ${medicineDosage}`,
          sound: "default",
          data: {
            type: "medicine-reminder",
            medicineName,
          },
        },

        trigger: {
          type:
            Notifications
              .SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: "medicine-reminders",
        },
      });

    return notificationId;
  }

  async function handleAddMedicine() {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Not Signed In",
        "Please sign in again."
      );
      return;
    }

    if (!name.trim()) {
      Alert.alert(
        "Medicine Name Required",
        "Please enter the medicine name."
      );
      return;
    }

    if (!dosage.trim()) {
      Alert.alert(
        "Dosage Required",
        "Please enter the dosage."
      );
      return;
    }

    if (!selectedTime) {
      Alert.alert(
        "Reminder Time Required",
        "Please select a reminder time."
      );
      return;
    }

    let notificationId: string | null = null;

    try {
      setSaving(true);

      const hour = selectedTime.getHours();
      const minute = selectedTime.getMinutes();

      const formattedTime =
        formatTime(selectedTime);

      // 1. Schedule actual phone notification
      notificationId =
        await scheduleMedicineNotification(
          name.trim(),
          dosage.trim(),
          hour,
          minute
        );

      // 2. Save medicine + notification ID
      await addDoc(collection(db, "medicines"), {
        elderlyId: user.uid,

        name: name.trim(),

        dosage: dosage.trim(),

        frequency,

        time: formattedTime,

        reminderHour: hour,

        reminderMinute: minute,

        notificationId,

        instructions: instructions.trim(),

        status: "pending",

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      });

      resetForm();
      setShowAddModal(false);

      Alert.alert(
        "Medicine Added",
        `Reminder scheduled daily at ${formattedTime}.`
      );
    } catch (error: any) {
      console.log(
        "Add medicine error:",
        error
      );

      // If notification succeeded but Firestore failed,
      // cancel orphan notification.
      if (notificationId) {
        try {
          await Notifications
            .cancelScheduledNotificationAsync(
              notificationId
            );
        } catch (cancelError) {
          console.log(
            "Rollback notification error:",
            cancelError
          );
        }
      }

      Alert.alert(
        "Save Failed",
        error?.message ||
          "Could not save the medicine reminder."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkTaken(
    medicineId: string
  ) {
    try {
      await updateDoc(
        doc(db, "medicines", medicineId),
        {
          status: "taken",
          takenAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.log(
        "Mark taken error:",
        error
      );

      Alert.alert(
        "Update Failed",
        "Could not mark the medicine as taken."
      );
    }
  }

  async function handleMarkSkipped(
    medicineId: string
  ) {
    try {
      await updateDoc(
        doc(db, "medicines", medicineId),
        {
          status: "skipped",
          skippedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.log(
        "Mark skipped error:",
        error
      );

      Alert.alert(
        "Update Failed",
        "Could not mark the medicine as skipped."
      );
    }
  }

  async function handleResetPending(
    medicineId: string
  ) {
    try {
      await updateDoc(
        doc(db, "medicines", medicineId),
        {
          status: "pending",
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.log(
        "Reset medicine error:",
        error
      );

      Alert.alert(
        "Update Failed",
        "Could not reset the medicine status."
      );
    }
  }

  function confirmDeleteMedicine(
    medicine: Medicine
  ) {
    Alert.alert(
      "Delete Medicine",
      `Do you want to delete ${medicine.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            handleDeleteMedicine(medicine),
        },
      ]
    );
  }

  async function handleDeleteMedicine(
    medicine: Medicine
  ) {
    try {
      // Cancel scheduled reminder first
      if (medicine.notificationId) {
        try {
          await Notifications
            .cancelScheduledNotificationAsync(
              medicine.notificationId
            );
        } catch (notificationError) {
          console.log(
            "Cancel notification error:",
            notificationError
          );
        }
      }

      // Delete Firestore medicine
      await deleteDoc(
        doc(db, "medicines", medicine.id)
      );

      Alert.alert(
        "Medicine Deleted",
        "The medicine and its reminder have been removed."
      );
    } catch (error) {
      console.log(
        "Delete medicine error:",
        error
      );

      Alert.alert(
        "Delete Failed",
        "Could not delete the medicine."
      );
    }
  }

  const pendingCount = medicines.filter(
    (medicine) =>
      medicine.status === "pending"
  ).length;

  const takenCount = medicines.filter(
    (medicine) =>
      medicine.status === "taken"
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              {"< Back"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addHeaderButton}
            onPress={() =>
              setShowAddModal(true)
            }
          >
            <Text
              style={styles.addHeaderButtonText}
            >
              + Add
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            My Medicines
          </Text>

          <Text style={styles.subtitle}>
            Add your medicines and receive daily
            reminders at the selected time.
          </Text>

          <View style={styles.summaryCard}>
            <SummaryItem
              value={medicines.length}
              label="Total"
            />

            <View style={styles.divider} />

            <SummaryItem
              value={pendingCount}
              label="Pending"
            />

            <View style={styles.divider} />

            <SummaryItem
              value={takenCount}
              label="Taken"
            />
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              Medicine List
            </Text>

            <Text style={styles.sectionCount}>
              {medicines.length}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator
                size="large"
                color="#4A3FB5"
              />

              <Text style={styles.loadingText}>
                Loading medicines...
              </Text>
            </View>
          ) : medicines.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() =>
                setShowAddModal(true)
              }
              activeOpacity={0.8}
            >
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  M
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No medicines added
              </Text>

              <Text style={styles.emptySubtitle}>
                Tap here to add your first medicine.
              </Text>
            </TouchableOpacity>
          ) : (
            medicines.map((medicine) => (
              <View
                key={medicine.id}
                style={styles.medicineCard}
              >
                <View style={styles.medicineTopRow}>
                  <View style={styles.timeBox}>
                    <Text style={styles.timeText}>
                      {medicine.time || "--:--"}
                    </Text>
                  </View>

                  <View style={styles.medicineInfo}>
                    <Text
                      style={styles.medicineName}
                    >
                      {medicine.name}
                    </Text>

                    <Text style={styles.dosageText}>
                      {medicine.dosage}
                    </Text>

                    <Text
                      style={styles.frequencyText}
                    >
                      {medicine.frequency ||
                        "Frequency not added"}
                    </Text>
                  </View>

                  <StatusBadge
                    status={medicine.status}
                  />
                </View>

                {medicine.instructions ? (
                  <View
                    style={styles.instructionsBox}
                  >
                    <Text
                      style={
                        styles.instructionsLabel
                      }
                    >
                      Instructions
                    </Text>

                    <Text
                      style={
                        styles.instructionsText
                      }
                    >
                      {medicine.instructions}
                    </Text>
                  </View>
                ) : null}

                {medicine.status === "pending" ? (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.takenButton}
                      onPress={() =>
                        handleMarkTaken(
                          medicine.id
                        )
                      }
                    >
                      <Text
                        style={
                          styles.takenButtonText
                        }
                      >
                        Taken
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.skipButton}
                      onPress={() =>
                        handleMarkSkipped(
                          medicine.id
                        )
                      }
                    >
                      <Text
                        style={
                          styles.skipButtonText
                        }
                      >
                        Skip
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() =>
                      handleResetPending(
                        medicine.id
                      )
                    }
                  >
                    <Text
                      style={
                        styles.resetButtonText
                      }
                    >
                      Mark as Pending
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    confirmDeleteMedicine(
                      medicine
                    )
                  }
                >
                  <Text
                    style={styles.deleteButtonText}
                  >
                    Delete Medicine
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>

        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent
          onRequestClose={closeAddModal}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : undefined
            }
          >
            <View style={styles.modalCard}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      Add Medicine
                    </Text>

                    <Text
                      style={styles.modalSubtitle}
                    >
                      Enter your medicine details
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeAddModal}
                    disabled={saving}
                  >
                    <Text
                      style={styles.closeButtonText}
                    >
                      X
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>
                  Medicine Name
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter medicine name"
                  placeholderTextColor="#9999A8"
                  value={name}
                  onChangeText={setName}
                  editable={!saving}
                />

                <Text style={styles.label}>
                  Dosage
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Example: 1 tablet"
                  placeholderTextColor="#9999A8"
                  value={dosage}
                  onChangeText={setDosage}
                  editable={!saving}
                />

                <Text style={styles.label}>
                  Frequency
                </Text>

                <View style={styles.frequencyGrid}>
                  {FREQUENCIES.map((item) => {
                    const selected =
                      frequency === item;

                    return (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.frequencyButton,
                          selected &&
                            styles.selectedFrequencyButton,
                        ]}
                        onPress={() =>
                          setFrequency(item)
                        }
                        disabled={saving}
                      >
                        <Text
                          style={[
                            styles.frequencyButtonText,
                            selected &&
                              styles.selectedFrequencyText,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.label}>
                  Reminder Time
                </Text>

                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() =>
                    setShowTimePicker(true)
                  }
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.timePickerButtonText,
                      !selectedTime &&
                        styles.timePlaceholder,
                    ]}
                  >
                    {selectedTime
                      ? formatTime(selectedTime)
                      : "Select reminder time"}
                  </Text>

                  <Text style={styles.clockText}>
                    ⏰
                  </Text>
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={
                      selectedTime || new Date()
                    }
                    mode="time"
                    is24Hour={false}
                    display={
                      Platform.OS === "android"
                        ? "default"
                        : "spinner"
                    }
                    onChange={handleTimeChange}
                  />
                )}

                <Text style={styles.label}>
                  Instructions
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.instructionsInput,
                  ]}
                  placeholder="Example: Take after breakfast"
                  placeholderTextColor="#9999A8"
                  value={instructions}
                  onChangeText={setInstructions}
                  multiline
                  textAlignVertical="top"
                  editable={!saving}
                />

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    saving &&
                      styles.disabledButton,
                  ]}
                  onPress={handleAddMedicine}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={styles.saveButtonText}
                    >
                      Save & Schedule Reminder
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeAddModal}
                  disabled={saving}
                >
                  <Text
                    style={styles.cancelButtonText}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function SummaryItem({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryNumber}>
        {value}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>
    </View>
  );
}

function StatusBadge({
  status,
}: {
  status: MedicineStatus;
}) {
  const isTaken = status === "taken";
  const isSkipped = status === "skipped";

  return (
    <View
      style={[
        styles.statusBadge,
        isTaken && styles.takenBadge,
        isSkipped && styles.skippedBadge,
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          isTaken && styles.takenBadgeText,
          isSkipped && styles.skippedBadgeText,
        ]}
      >
        {status.charAt(0).toUpperCase() +
          status.slice(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FC",
  },

  screen: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    paddingVertical: 10,
    paddingRight: 10,
  },

  backText: {
    color: "#4A3FB5",
    fontSize: 16,
    fontWeight: "700",
  },

  addHeaderButton: {
    backgroundColor: "#4A3FB5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  addHeaderButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  subtitle: {
    fontSize: 14,
    color: "#77778A",
    lineHeight: 21,
    marginTop: 7,
    marginBottom: 22,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
    elevation: 2,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4A3FB5",
  },

  summaryLabel: {
    fontSize: 12,
    color: "#77778A",
    marginTop: 4,
  },

  divider: {
    width: 1,
    height: 34,
    backgroundColor: "#EEEEF4",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  sectionCount: {
    marginLeft: 8,
    backgroundColor: "#EEEAFE",
    color: "#4A3FB5",
    fontSize: 12,
    fontWeight: "800",
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    textAlign: "center",
    textAlignVertical: "center",
  },

  loadingBox: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#77778A",
    fontSize: 14,
    marginTop: 12,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    minHeight: 220,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyIconText: {
    color: "#4A3FB5",
    fontSize: 22,
    fontWeight: "900",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#77778A",
    textAlign: "center",
    marginTop: 7,
  },

  medicineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },

  medicineTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  timeBox: {
    width: 68,
    minHeight: 60,
    borderRadius: 14,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  timeText: {
    color: "#4A3FB5",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  medicineInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  medicineName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  dosageText: {
    fontSize: 13,
    color: "#666677",
    marginTop: 4,
  },

  frequencyText: {
    fontSize: 12,
    color: "#9999A8",
    marginTop: 3,
  },

  statusBadge: {
    backgroundColor: "#FFF4D8",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  statusBadgeText: {
    color: "#A36B00",
    fontSize: 10,
    fontWeight: "800",
  },

  takenBadge: {
    backgroundColor: "#E8F7EE",
  },

  takenBadgeText: {
    color: "#278A50",
  },

  skippedBadge: {
    backgroundColor: "#FDECEC",
  },

  skippedBadgeText: {
    color: "#C84343",
  },

  instructionsBox: {
    backgroundColor: "#F8F7FF",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },

  instructionsLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4A3FB5",
    marginBottom: 4,
  },

  instructionsText: {
    fontSize: 13,
    color: "#55556A",
    lineHeight: 19,
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },

  takenButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#E8F7EE",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  takenButtonText: {
    color: "#278A50",
    fontSize: 13,
    fontWeight: "800",
  },

  skipButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#FDECEC",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  skipButtonText: {
    color: "#C84343",
    fontSize: 13,
    fontWeight: "800",
  },

  resetButton: {
    height: 44,
    borderWidth: 1,
    borderColor: "#4A3FB5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  resetButtonText: {
    color: "#4A3FB5",
    fontSize: 13,
    fontWeight: "800",
  },

  deleteButton: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 5,
  },

  deleteButtonText: {
    color: "#C84343",
    fontSize: 12,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(20, 20, 35, 0.45)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#77778A",
    marginTop: 4,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F1F8",
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonText: {
    color: "#55556A",
    fontSize: 14,
    fontWeight: "800",
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#303044",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    minHeight: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDCE8",
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#1E1E2F",
    marginBottom: 18,
  },

  instructionsInput: {
    minHeight: 90,
    paddingTop: 14,
    paddingBottom: 14,
  },

  frequencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  frequencyButton: {
    width: "48%",
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DDDCE8",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginBottom: 10,
  },

  selectedFrequencyButton: {
    backgroundColor: "#4A3FB5",
    borderColor: "#4A3FB5",
  },

  frequencyButtonText: {
    color: "#55556A",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  selectedFrequencyText: {
    color: "#FFFFFF",
  },

  timePickerButton: {
    width: "100%",
    minHeight: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDCE8",
    borderRadius: 14,
    paddingHorizontal: 15,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timePickerButtonText: {
    fontSize: 15,
    color: "#1E1E2F",
    fontWeight: "600",
  },

  timePlaceholder: {
    color: "#9999A8",
    fontWeight: "400",
  },

  clockText: {
    fontSize: 20,
  },

  saveButton: {
    height: 56,
    backgroundColor: "#4A3FB5",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },

  cancelButton: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  cancelButtonText: {
    color: "#77778A",
    fontSize: 14,
    fontWeight: "700",
  },

  bottomSpace: {
    height: 30,
  },
});