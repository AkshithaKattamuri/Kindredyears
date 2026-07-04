import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
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

import { auth, db } from "../../config/firebase";

type Caregiver = {
  id: string;
  uid: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: "caregiver";
  verificationStatus: "approved";
  experience?: number | string;
  specialization?: string;
  hourlyRate?: number;
  available?: boolean;
  bio?: string;
};

export default function CaregiverBookingScreen() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] =
    useState<Caregiver | null>(null);

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [selectedTime, setSelectedTime] =
    useState<Date | null>(null);

  const [durationHours, setDurationHours] =
    useState("1");

  const [careRequirement, setCareRequirement] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [booking, setBooking] =
    useState(false);

  const [showBookingModal, setShowBookingModal] =
    useState(false);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  useEffect(() => {
    let unsubscribeCaregivers:
      | (() => void)
      | undefined;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          setLoading(false);

          Alert.alert(
            "Not Signed In",
            "Please sign in again."
          );

          router.replace("/sign-in");
          return;
        }

        const caregiversQuery = query(
          collection(db, "users"),
          where("role", "==", "caregiver"),
          where(
            "verificationStatus",
            "==",
            "approved"
          )
        );

        unsubscribeCaregivers = onSnapshot(
          caregiversQuery,
          (snapshot) => {
            const caregiverList: Caregiver[] =
              snapshot.docs.map((caregiverDoc) => {
                const data = caregiverDoc.data();

                return {
                  id: caregiverDoc.id,
                  uid:
                    data.uid ||
                    caregiverDoc.id,
                  fullName:
                    data.fullName ||
                    "Caregiver",
                  email: data.email || "",
                  phone: data.phone || "",
                  role: "caregiver",
                  verificationStatus: "approved",
                  experience:
                    data.experience,
                  specialization:
                    data.specialization,
                  hourlyRate:
                    data.hourlyRate,
                  available:
                    data.available,
                  bio:
                    data.bio,
                };
              });

            setCaregivers(caregiverList);
            setLoading(false);
          },
          (error) => {
            console.log(
              "Load caregivers error:",
              error
            );

            setLoading(false);

            Alert.alert(
              "Unable to Load",
              "Could not load available caregivers."
            );
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();

      if (unsubscribeCaregivers) {
        unsubscribeCaregivers();
      }
    };
  }, []);

  function openBookingModal(
    caregiver: Caregiver
  ) {
    setSelectedCaregiver(caregiver);

    setSelectedDate(null);
    setSelectedTime(null);
    setDurationHours("1");
    setCareRequirement("");
    setAddress("");
    setPhone("");

    setShowBookingModal(true);
  }

  function closeBookingModal() {
    if (booking) {
      return;
    }

    setShowBookingModal(false);
    setSelectedCaregiver(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setDurationHours("1");
    setCareRequirement("");
    setAddress("");
    setPhone("");
    setShowDatePicker(false);
    setShowTimePicker(false);
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function getDateKey(date: Date) {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function handleDateChange(
    event: DateTimePickerEvent,
    date?: Date
  ) {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed") {
      return;
    }

    if (date) {
      setSelectedDate(date);
    }
  }

  function handleTimeChange(
    event: DateTimePickerEvent,
    time?: Date
  ) {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event.type === "dismissed") {
      return;
    }

    if (time) {
      setSelectedTime(time);
    }
  }

  function validateFutureBooking() {
    if (!selectedDate || !selectedTime) {
      return false;
    }

    const bookingDateTime =
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        0,
        0
      );

    return (
      bookingDateTime.getTime() >
      Date.now()
    );
  }

  async function handleBookCaregiver() {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Not Signed In",
        "Please sign in again."
      );
      return;
    }

    if (!selectedCaregiver) {
      Alert.alert(
        "Caregiver Required",
        "Please select a caregiver."
      );
      return;
    }

    if (!selectedDate) {
      Alert.alert(
        "Date Required",
        "Please select a booking date."
      );
      return;
    }

    if (!selectedTime) {
      Alert.alert(
        "Time Required",
        "Please select a booking time."
      );
      return;
    }

    if (!validateFutureBooking()) {
      Alert.alert(
        "Invalid Booking Time",
        "Please select a future date and time."
      );
      return;
    }

    const parsedDuration =
      Number(durationHours);

    if (
      !Number.isFinite(parsedDuration) ||
      parsedDuration <= 0
    ) {
      Alert.alert(
        "Invalid Duration",
        "Please enter a valid number of hours."
      );
      return;
    }

    if (!careRequirement.trim()) {
      Alert.alert(
        "Care Requirement Required",
        "Please explain what assistance is needed."
      );
      return;
    }

    if (!address.trim()) {
      Alert.alert(
        "Address Required",
        "Please enter the care location."
      );
      return;
    }

    if (!phone.trim()) {
      Alert.alert(
        "Phone Required",
        "Please enter a contact phone number."
      );
      return;
    }

    try {
      setBooking(true);

      const bookingDateTime =
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          selectedTime.getHours(),
          selectedTime.getMinutes(),
          0,
          0
        );

      const estimatedAmount =
        typeof selectedCaregiver.hourlyRate ===
          "number"
          ? selectedCaregiver.hourlyRate *
            parsedDuration
          : null;

      await addDoc(
        collection(
          db,
          "caregiverBookings"
        ),
        {
          elderlyId: user.uid,

          caregiverId:
            selectedCaregiver.uid,

          caregiverName:
            selectedCaregiver.fullName,

          bookingDate:
            getDateKey(selectedDate),

          bookingTime:
            formatTime(selectedTime),

          bookingDateTime:
            bookingDateTime,

          durationHours:
            parsedDuration,

          careRequirement:
            careRequirement.trim(),

          address:
            address.trim(),

          contactPhone:
            phone.trim(),

          hourlyRate:
            selectedCaregiver.hourlyRate ??
            null,

          estimatedAmount,

          status: "pending",

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      const caregiverName =
        selectedCaregiver.fullName;

      closeBookingModal();

      Alert.alert(
        "Booking Request Sent",
        `Your request has been sent to ${caregiverName}. The caregiver can accept or reject it.`
      );
    } catch (error) {
      console.log(
        "Create caregiver booking error:",
        error
      );

      Alert.alert(
        "Booking Failed",
        "Could not create the caregiver booking."
      );
    } finally {
      setBooking(false);
    }
  }

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
        </View>

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            Find a Caregiver
          </Text>

          <Text style={styles.subtitle}>
            Browse approved caregivers and
            send a care booking request.
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>
                C
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Approved caregivers only
              </Text>

              <Text style={styles.infoText}>
                This page displays caregiver
                accounts approved by the platform.
              </Text>
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              Available Caregivers
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {caregivers.length}
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator
                size="large"
                color="#4A3FB5"
              />

              <Text style={styles.loadingText}>
                Loading caregivers...
              </Text>
            </View>
          ) : caregivers.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  C
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No approved caregivers
              </Text>

              <Text style={styles.emptyText}>
                Approved caregiver accounts will
                appear here automatically.
              </Text>
            </View>
          ) : (
            caregivers.map((caregiver) => (
              <View
                key={caregiver.id}
                style={styles.caregiverCard}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {caregiver.fullName
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.caregiverInfo}>
                    <Text
                      style={styles.caregiverName}
                    >
                      {caregiver.fullName}
                    </Text>

                    <Text
                      style={
                        styles.specializationText
                      }
                    >
                      {caregiver.specialization ||
                        "Elderly Care"}
                    </Text>

                    <View
                      style={styles.approvedRow}
                    >
                      <View
                        style={styles.approvedDot}
                      />

                      <Text
                        style={
                          styles.approvedText
                        }
                      >
                        Approved Caregiver
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsGrid}>
                  <DetailBox
                    label="Experience"
                    value={
                      caregiver.experience !==
                      undefined
                        ? `${caregiver.experience} yrs`
                        : "Not added"
                    }
                  />

                  <DetailBox
                    label="Hourly Rate"
                    value={
                      caregiver.hourlyRate !==
                      undefined
                        ? `₹${caregiver.hourlyRate}`
                        : "Not added"
                    }
                  />
                </View>

                {caregiver.bio ? (
                  <Text style={styles.bioText}>
                    {caregiver.bio}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() =>
                    openBookingModal(caregiver)
                  }
                >
                  <Text
                    style={styles.bookButtonText}
                  >
                    Book Caregiver
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>

        <Modal
          visible={showBookingModal}
          animationType="slide"
          transparent
          onRequestClose={
            closeBookingModal
          }
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
                  <View style={styles.modalHeaderText}>
                    <Text
                      style={styles.modalTitle}
                    >
                      Book Caregiver
                    </Text>

                    <Text
                      style={styles.modalSubtitle}
                    >
                      {selectedCaregiver?.fullName}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={
                      closeBookingModal
                    }
                    disabled={booking}
                  >
                    <Text
                      style={
                        styles.closeButtonText
                      }
                    >
                      X
                    </Text>
                  </TouchableOpacity>
                </View>

                {selectedCaregiver ? (
                  <View
                    style={
                      styles.selectedCaregiverCard
                    }
                  >
                    <View
                      style={
                        styles.selectedAvatar
                      }
                    >
                      <Text
                        style={
                          styles.selectedAvatarText
                        }
                      >
                        {selectedCaregiver.fullName
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={
                          styles.selectedName
                        }
                      >
                        {
                          selectedCaregiver.fullName
                        }
                      </Text>

                      <Text
                        style={
                          styles.selectedSpecialization
                        }
                      >
                        {selectedCaregiver.specialization ||
                          "Elderly Care"}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <Text style={styles.label}>
                  Booking Date
                </Text>

                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() =>
                    setShowDatePicker(true)
                  }
                  disabled={booking}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      !selectedDate &&
                        styles.placeholderText,
                    ]}
                  >
                    {selectedDate
                      ? formatDate(selectedDate)
                      : "Select date"}
                  </Text>

                  <Text style={styles.pickerIcon}>
                    D
                  </Text>
                </TouchableOpacity>

                {showDatePicker ? (
                  <DateTimePicker
                    value={
                      selectedDate ||
                      new Date()
                    }
                    mode="date"
                    minimumDate={new Date()}
                    display={
                      Platform.OS === "android"
                        ? "default"
                        : "spinner"
                    }
                    onChange={
                      handleDateChange
                    }
                  />
                ) : null}

                <Text style={styles.label}>
                  Booking Time
                </Text>

                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() =>
                    setShowTimePicker(true)
                  }
                  disabled={booking}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      !selectedTime &&
                        styles.placeholderText,
                    ]}
                  >
                    {selectedTime
                      ? formatTime(selectedTime)
                      : "Select time"}
                  </Text>

                  <Text style={styles.pickerIcon}>
                    T
                  </Text>
                </TouchableOpacity>

                {showTimePicker ? (
                  <DateTimePicker
                    value={
                      selectedTime ||
                      new Date()
                    }
                    mode="time"
                    is24Hour={false}
                    display={
                      Platform.OS === "android"
                        ? "default"
                        : "spinner"
                    }
                    onChange={
                      handleTimeChange
                    }
                  />
                ) : null}

                <Text style={styles.label}>
                  Duration in Hours
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Example: 2"
                  placeholderTextColor="#9999A8"
                  value={durationHours}
                  onChangeText={
                    setDurationHours
                  }
                  keyboardType="numeric"
                  editable={!booking}
                />

                <Text style={styles.label}>
                  Contact Phone Number
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter contact number"
                  placeholderTextColor="#9999A8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!booking}
                />

                <Text style={styles.label}>
                  Care Location
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.addressInput,
                  ]}
                  placeholder="Enter full address"
                  placeholderTextColor="#9999A8"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  textAlignVertical="top"
                  editable={!booking}
                />

                <Text style={styles.label}>
                  Care Requirement
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.requirementInput,
                  ]}
                  placeholder="Example: Need help with mobility, meals and medicine reminders"
                  placeholderTextColor="#9999A8"
                  value={careRequirement}
                  onChangeText={
                    setCareRequirement
                  }
                  multiline
                  textAlignVertical="top"
                  editable={!booking}
                />

                {selectedCaregiver &&
                typeof selectedCaregiver.hourlyRate ===
                  "number" &&
                Number(durationHours) > 0 ? (
                  <View
                    style={styles.priceCard}
                  >
                    <Text
                      style={styles.priceLabel}
                    >
                      Estimated Amount
                    </Text>

                    <Text
                      style={styles.priceValue}
                    >
                      ₹
                      {selectedCaregiver.hourlyRate *
                        Number(
                          durationHours
                        )}
                    </Text>

                    <Text
                      style={styles.priceNote}
                    >
                      ₹
                      {
                        selectedCaregiver.hourlyRate
                      }{" "}
                      × {durationHours} hour(s)
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    booking &&
                      styles.disabledButton,
                  ]}
                  onPress={
                    handleBookCaregiver
                  }
                  disabled={booking}
                >
                  {booking ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.confirmButtonText
                      }
                    >
                      Send Booking Request
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={
                    closeBookingModal
                  }
                  disabled={booking}
                >
                  <Text
                    style={
                      styles.cancelButtonText
                    }
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

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailBox}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
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
    paddingBottom: 6,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingRight: 10,
  },

  backText: {
    color: "#4A3FB5",
    fontSize: 16,
    fontWeight: "700",
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
    marginBottom: 20,
  },

  infoCard: {
    backgroundColor: "#EEEAFE",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
  },

  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#4A3FB5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  infoIconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#303044",
  },

  infoText: {
    fontSize: 12,
    color: "#666677",
    lineHeight: 18,
    marginTop: 4,
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

  countBadge: {
    minWidth: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 7,
  },

  countText: {
    color: "#4A3FB5",
    fontSize: 12,
    fontWeight: "800",
  },

  loadingBox: {
    minHeight: 220,
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
    minHeight: 230,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
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

  emptyText: {
    fontSize: 13,
    color: "#77778A",
    lineHeight: 19,
    textAlign: "center",
    marginTop: 7,
  },

  caregiverCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    marginBottom: 15,
    elevation: 2,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#4A3FB5",
    fontSize: 24,
    fontWeight: "900",
  },

  caregiverInfo: {
    flex: 1,
  },

  caregiverName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  specializationText: {
    fontSize: 13,
    color: "#666677",
    marginTop: 4,
  },

  approvedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  approvedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2D9D5C",
    marginRight: 6,
  },

  approvedText: {
    fontSize: 11,
    color: "#2D9D5C",
    fontWeight: "700",
  },

  detailsGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  detailBox: {
    flex: 1,
    backgroundColor: "#F8F7FF",
    borderRadius: 13,
    padding: 12,
  },

  detailLabel: {
    fontSize: 10,
    color: "#888899",
    fontWeight: "700",
  },

  detailValue: {
    fontSize: 13,
    color: "#303044",
    fontWeight: "800",
    marginTop: 4,
  },

  bioText: {
    fontSize: 13,
    color: "#666677",
    lineHeight: 19,
    marginTop: 14,
  },

  bookButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#4A3FB5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(20, 20, 35, 0.45)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "92%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  modalHeaderText: {
    flex: 1,
    paddingRight: 10,
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

  selectedCaregiverCard: {
    backgroundColor: "#F8F7FF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  selectedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  selectedAvatarText: {
    color: "#4A3FB5",
    fontSize: 19,
    fontWeight: "900",
  },

  selectedName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  selectedSpecialization: {
    fontSize: 12,
    color: "#77778A",
    marginTop: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#303044",
    marginBottom: 8,
  },

  pickerButton: {
    width: "100%",
    minHeight: 54,
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

  pickerText: {
    fontSize: 15,
    color: "#1E1E2F",
    fontWeight: "600",
  },

  placeholderText: {
    color: "#9999A8",
    fontWeight: "400",
  },

  pickerIcon: {
    color: "#4A3FB5",
    fontSize: 14,
    fontWeight: "900",
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

  addressInput: {
    minHeight: 90,
    paddingTop: 14,
    paddingBottom: 14,
  },

  requirementInput: {
    minHeight: 110,
    paddingTop: 14,
    paddingBottom: 14,
  },

  priceCard: {
    backgroundColor: "#EEEAFE",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  priceLabel: {
    fontSize: 12,
    color: "#666677",
    fontWeight: "700",
  },

  priceValue: {
    fontSize: 24,
    color: "#4A3FB5",
    fontWeight: "900",
    marginTop: 4,
  },

  priceNote: {
    fontSize: 11,
    color: "#77778A",
    marginTop: 4,
  },

  confirmButton: {
    height: 56,
    backgroundColor: "#4A3FB5",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  confirmButtonText: {
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