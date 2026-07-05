import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";

import {
  addDoc,
  collection,
  doc,
  getDoc,
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

type PlanType =
  | "hourly"
  | "fullDay"
  | "monthly";

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
  available?: boolean;
  bio?: string;

  hourlyCharge?: number;
  fullDayCharge?: number;
  monthlyCharge?: number;
};

export default function CaregiverBookingScreen() {
  const [caregivers, setCaregivers] = useState<
    Caregiver[]
  >([]);

  const [
    selectedCaregiver,
    setSelectedCaregiver,
  ] = useState<Caregiver | null>(null);

  const [
    selectedPlan,
    setSelectedPlan,
  ] = useState<PlanType | null>(null);

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<Date | null>(null);

  const [
    selectedTime,
    setSelectedTime,
  ] = useState<Date | null>(null);

  const [
    careRequirement,
    setCareRequirement,
  ] = useState("");

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [
    showBookingModal,
    setShowBookingModal,
  ] = useState(false);

  const [
    showDatePicker,
    setShowDatePicker,
  ] = useState(false);

  const [
    showTimePicker,
    setShowTimePicker,
  ] = useState(false);

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

          router.replace("/sign-in" as any);
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

          async (snapshot) => {
            try {
              const caregiverList =
                await Promise.all(
                  snapshot.docs.map(
                    async (caregiverDoc) => {
                      const userData =
                        caregiverDoc.data();

                      const caregiverUid =
                        userData.uid ||
                        caregiverDoc.id;

                      let pricingData: any = {};

                      try {
                        const pricingDoc =
                          await getDoc(
                            doc(
                              db,
                              "caregivers",
                              caregiverUid
                            )
                          );

                        if (pricingDoc.exists()) {
                          pricingData =
                            pricingDoc.data();
                        }
                      } catch (pricingError) {
                        console.log(
                          "Load caregiver pricing error:",
                          pricingError
                        );
                      }

                      const caregiver: Caregiver = {
                        id: caregiverDoc.id,

                        uid: caregiverUid,

                        fullName:
                          userData.fullName ||
                          "Caregiver",

                        email:
                          userData.email || "",

                        phone:
                          userData.phone || "",

                        role: "caregiver",

                        verificationStatus:
                          "approved",

                        experience:
                          pricingData.experience ??
                          userData.experience,

                        specialization:
                          userData.specialization ||
                          "",

                        available:
                          userData.available,

                        bio:
                          userData.bio || "",

                        hourlyCharge:
                          typeof pricingData.hourlyCharge ===
                          "number"
                            ? pricingData.hourlyCharge
                            : undefined,

                        fullDayCharge:
                          typeof pricingData.fullDayCharge ===
                          "number"
                            ? pricingData.fullDayCharge
                            : undefined,

                        monthlyCharge:
                          typeof pricingData.monthlyCharge ===
                          "number"
                            ? pricingData.monthlyCharge
                            : undefined,
                      };

                      return caregiver;
                    }
                  )
                );

              setCaregivers(caregiverList);
              setLoading(false);
            } catch (error) {
              console.log(
                "Build caregiver list error:",
                error
              );

              setLoading(false);

              Alert.alert(
                "Unable to Load",
                "Could not load caregiver details."
              );
            }
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

    setSelectedPlan(null);
    setSelectedDate(null);
    setSelectedTime(null);

    setCareRequirement("");
    setAddress("");
    setPhone("");

    setShowDatePicker(false);
    setShowTimePicker(false);

    setShowBookingModal(true);
  }

  function closeBookingModal() {
    if (booking) {
      return;
    }

    setShowBookingModal(false);

    setSelectedCaregiver(null);
    setSelectedPlan(null);

    setSelectedDate(null);
    setSelectedTime(null);

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

    const bookingDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0,
      0
    );

    return bookingDateTime.getTime() >
      Date.now();
  }

  function getPlanLabel(
    plan: PlanType | null
  ) {
    if (plan === "hourly") {
      return "1 Hour";
    }

    if (plan === "fullDay") {
      return "Full Day";
    }

    if (plan === "monthly") {
      return "1 Month";
    }

    return "";
  }

  function getSelectedPrice() {
    if (
      !selectedCaregiver ||
      !selectedPlan
    ) {
      return null;
    }

    if (selectedPlan === "hourly") {
      return (
        selectedCaregiver.hourlyCharge ??
        null
      );
    }

    if (selectedPlan === "fullDay") {
      return (
        selectedCaregiver.fullDayCharge ??
        null
      );
    }

    if (selectedPlan === "monthly") {
      return (
        selectedCaregiver.monthlyCharge ??
        null
      );
    }

    return null;
  }

  function hasAnyPrice(
    caregiver: Caregiver
  ) {
    return (
      typeof caregiver.hourlyCharge ===
        "number" ||
      typeof caregiver.fullDayCharge ===
        "number" ||
      typeof caregiver.monthlyCharge ===
        "number"
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

    if (!selectedPlan) {
      Alert.alert(
        "Care Plan Required",
        "Please select 1 Hour, Full Day, or 1 Month."
      );
      return;
    }

    const selectedPrice =
      getSelectedPrice();

    if (
      selectedPrice === null ||
      !Number.isFinite(selectedPrice) ||
      selectedPrice <= 0
    ) {
      Alert.alert(
        "Price Unavailable",
        "This caregiver has not set a valid price for the selected plan."
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

      const bookingDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        0,
        0
      );

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

          caregiverEmail:
            selectedCaregiver.email || "",

          planType:
            selectedPlan,

          planLabel:
            getPlanLabel(selectedPlan),

          selectedPrice:
            selectedPrice,

          totalPrice:
            selectedPrice,

          bookingDate:
            getDateKey(selectedDate),

          bookingDateLabel:
            formatDate(selectedDate),

          bookingTime:
            formatTime(selectedTime),

          bookingDateTime:
            bookingDateTime,

          careRequirement:
            careRequirement.trim(),

          address:
            address.trim(),

          contactPhone:
            phone.trim(),

          status:
            "pending",

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      const caregiverName =
        selectedCaregiver.fullName;

      const planLabel =
        getPlanLabel(selectedPlan);

      setShowBookingModal(false);
      setSelectedCaregiver(null);
      setSelectedPlan(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setCareRequirement("");
      setAddress("");
      setPhone("");
      setShowDatePicker(false);
      setShowTimePicker(false);

      Alert.alert(
        "Booking Request Sent",
        `Your ${planLabel} request has been sent to ${caregiverName} for ₹${selectedPrice}.`
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

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#4A3FB5"
          />

          <Text style={styles.loadingText}>
            Loading caregivers...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
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
          showsVerticalScrollIndicator={
            false
          }
        >
          <Text style={styles.title}>
            Find a Caregiver
          </Text>

          <Text style={styles.subtitle}>
            Browse approved caregivers,
            compare their prices, and send
            a care booking request.
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Text
                style={styles.infoIconText}
              >
                C
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Verified Caregivers
              </Text>

              <Text style={styles.infoText}>
                Only approved caregivers are
                displayed here.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Available Caregivers
          </Text>

          {caregivers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>
                👩‍⚕️
              </Text>

              <Text style={styles.emptyTitle}>
                No Caregivers Available
              </Text>

              <Text style={styles.emptyText}>
                Approved caregivers will
                appear here.
              </Text>
            </View>
          ) : (
            caregivers.map((caregiver) => (
              <View
                key={caregiver.id}
                style={styles.caregiverCard}
              >
                <View
                  style={
                    styles.caregiverHeader
                  }
                >
                  <View style={styles.avatar}>
                    <Text
                      style={styles.avatarText}
                    >
                      👩‍⚕️
                    </Text>
                  </View>

                  <View
                    style={
                      styles.caregiverInfo
                    }
                  >
                    <Text
                      style={
                        styles.caregiverName
                      }
                    >
                      {caregiver.fullName}
                    </Text>

                    <Text
                      style={
                        styles.specialization
                      }
                    >
                      {caregiver.specialization ||
                        "Elderly Care"}
                    </Text>

                    {caregiver.experience !==
                      undefined && (
                      <Text
                        style={
                          styles.experience
                        }
                      >
                        Experience:{" "}
                        {String(
                          caregiver.experience
                        )}
                      </Text>
                    )}
                  </View>

                  <View
                    style={
                      styles.verifiedBadge
                    }
                  >
                    <Text
                      style={
                        styles.verifiedText
                      }
                    >
                      ✓
                    </Text>
                  </View>
                </View>

                {caregiver.bio ? (
                  <Text style={styles.bio}>
                    {caregiver.bio}
                  </Text>
                ) : null}

                <View style={styles.divider} />

                <Text
                  style={styles.chargesTitle}
                >
                  Service Charges
                </Text>

                <View style={styles.priceRow}>
                  <View style={styles.priceBox}>
                    <Text
                      style={styles.priceIcon}
                    >
                      ⏱️
                    </Text>

                    <Text
                      style={styles.priceLabel}
                    >
                      1 Hour
                    </Text>

                    <Text
                      style={styles.priceValue}
                    >
                      {typeof caregiver.hourlyCharge ===
                      "number"
                        ? `₹${caregiver.hourlyCharge}`
                        : "--"}
                    </Text>
                  </View>

                  <View style={styles.priceBox}>
                    <Text
                      style={styles.priceIcon}
                    >
                      ☀️
                    </Text>

                    <Text
                      style={styles.priceLabel}
                    >
                      Full Day
                    </Text>

                    <Text
                      style={styles.priceValue}
                    >
                      {typeof caregiver.fullDayCharge ===
                      "number"
                        ? `₹${caregiver.fullDayCharge}`
                        : "--"}
                    </Text>
                  </View>

                  <View style={styles.priceBox}>
                    <Text
                      style={styles.priceIcon}
                    >
                      📅
                    </Text>

                    <Text
                      style={styles.priceLabel}
                    >
                      1 Month
                    </Text>

                    <Text
                      style={styles.priceValue}
                    >
                      {typeof caregiver.monthlyCharge ===
                      "number"
                        ? `₹${caregiver.monthlyCharge}`
                        : "--"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.bookButton,
                    !hasAnyPrice(caregiver) &&
                      styles.unavailableButton,
                  ]}
                  onPress={() =>
                    openBookingModal(caregiver)
                  }
                  disabled={
                    !hasAnyPrice(caregiver)
                  }
                >
                  <Text
                    style={styles.bookButtonText}
                  >
                    {hasAnyPrice(caregiver)
                      ? "View Plans & Book"
                      : "Pricing Not Available"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent
        onRequestClose={closeBookingModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />

            <ScrollView
              contentContainerStyle={
                styles.modalContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
            >
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={styles.modalTitle}
                  >
                    Book Caregiver
                  </Text>

                  <Text
                    style={
                      styles.modalSubtitle
                    }
                  >
                    {selectedCaregiver?.fullName}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeBookingModal}
                  disabled={booking}
                >
                  <Text
                    style={styles.closeText}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>
                Select Care Plan
              </Text>

              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === "hourly" &&
                    styles.selectedPlanCard,
                ]}
                onPress={() =>
                  setSelectedPlan("hourly")
                }
                disabled={
                  typeof selectedCaregiver?.hourlyCharge !==
                  "number"
                }
              >
                <View>
                  <Text
                    style={[
                      styles.planTitle,
                      selectedPlan ===
                        "hourly" &&
                        styles.selectedPlanText,
                    ]}
                  >
                    ⏱️ 1 Hour
                  </Text>

                  <Text
                    style={[
                      styles.planDescription,
                      selectedPlan ===
                        "hourly" &&
                        styles.selectedPlanDescription,
                    ]}
                  >
                    Short-term assistance
                  </Text>
                </View>

                <Text
                  style={[
                    styles.planPrice,
                    selectedPlan ===
                      "hourly" &&
                      styles.selectedPlanText,
                  ]}
                >
                  {typeof selectedCaregiver?.hourlyCharge ===
                  "number"
                    ? `₹${selectedCaregiver.hourlyCharge}`
                    : "Unavailable"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan ===
                    "fullDay" &&
                    styles.selectedPlanCard,
                ]}
                onPress={() =>
                  setSelectedPlan("fullDay")
                }
                disabled={
                  typeof selectedCaregiver?.fullDayCharge !==
                  "number"
                }
              >
                <View>
                  <Text
                    style={[
                      styles.planTitle,
                      selectedPlan ===
                        "fullDay" &&
                        styles.selectedPlanText,
                    ]}
                  >
                    ☀️ Full Day
                  </Text>

                  <Text
                    style={[
                      styles.planDescription,
                      selectedPlan ===
                        "fullDay" &&
                        styles.selectedPlanDescription,
                    ]}
                  >
                    Complete day assistance
                  </Text>
                </View>

                <Text
                  style={[
                    styles.planPrice,
                    selectedPlan ===
                      "fullDay" &&
                      styles.selectedPlanText,
                  ]}
                >
                  {typeof selectedCaregiver?.fullDayCharge ===
                  "number"
                    ? `₹${selectedCaregiver.fullDayCharge}`
                    : "Unavailable"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan ===
                    "monthly" &&
                    styles.selectedPlanCard,
                ]}
                onPress={() =>
                  setSelectedPlan("monthly")
                }
                disabled={
                  typeof selectedCaregiver?.monthlyCharge !==
                  "number"
                }
              >
                <View>
                  <Text
                    style={[
                      styles.planTitle,
                      selectedPlan ===
                        "monthly" &&
                        styles.selectedPlanText,
                    ]}
                  >
                    📅 1 Month
                  </Text>

                  <Text
                    style={[
                      styles.planDescription,
                      selectedPlan ===
                        "monthly" &&
                        styles.selectedPlanDescription,
                    ]}
                  >
                    Long-term monthly care
                  </Text>
                </View>

                <Text
                  style={[
                    styles.planPrice,
                    selectedPlan ===
                      "monthly" &&
                      styles.selectedPlanText,
                  ]}
                >
                  {typeof selectedCaregiver?.monthlyCharge ===
                  "number"
                    ? `₹${selectedCaregiver.monthlyCharge}`
                    : "Unavailable"}
                </Text>
              </TouchableOpacity>

              {selectedPlan && (
                <View
                  style={styles.summaryCard}
                >
                  <Text
                    style={styles.summaryTitle}
                  >
                    Selected Plan
                  </Text>

                  <View
                    style={styles.summaryRow}
                  >
                    <Text
                      style={
                        styles.summaryLabel
                      }
                    >
                      Duration
                    </Text>

                    <Text
                      style={
                        styles.summaryValue
                      }
                    >
                      {getPlanLabel(
                        selectedPlan
                      )}
                    </Text>
                  </View>

                  <View
                    style={styles.summaryRow}
                  >
                    <Text
                      style={
                        styles.totalLabel
                      }
                    >
                      Price
                    </Text>

                    <Text
                      style={
                        styles.totalPrice
                      }
                    >
                      ₹{getSelectedPrice() ?? 0}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={styles.fieldLabel}>
                Booking Date
              </Text>

              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() =>
                  setShowDatePicker(true)
                }
              >
                <Text
                  style={
                    selectedDate
                      ? styles.pickerValue
                      : styles.pickerPlaceholder
                  }
                >
                  {selectedDate
                    ? formatDate(selectedDate)
                    : "Select booking date"}
                </Text>

                <Text style={styles.pickerIcon}>
                  📅
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={
                    selectedDate ||
                    new Date()
                  }
                  mode="date"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}

              <Text style={styles.fieldLabel}>
                Booking Time
              </Text>

              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() =>
                  setShowTimePicker(true)
                }
              >
                <Text
                  style={
                    selectedTime
                      ? styles.pickerValue
                      : styles.pickerPlaceholder
                  }
                >
                  {selectedTime
                    ? formatTime(selectedTime)
                    : "Select booking time"}
                </Text>

                <Text style={styles.pickerIcon}>
                  🕒
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={
                    selectedTime ||
                    new Date()
                  }
                  mode="time"
                  onChange={handleTimeChange}
                />
              )}

              <Text style={styles.fieldLabel}>
                Care Requirement
              </Text>

              <TextInput
                style={styles.textArea}
                placeholder="Describe the assistance needed"
                placeholderTextColor="#9999A8"
                value={careRequirement}
                onChangeText={
                  setCareRequirement
                }
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.fieldLabel}>
                Care Location
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter full address"
                placeholderTextColor="#9999A8"
                value={address}
                onChangeText={setAddress}
              />

              <Text style={styles.fieldLabel}>
                Contact Phone
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#9999A8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

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
                onPress={closeBookingModal}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },

  screen: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingRight: 15,
  },

  backText: {
    fontSize: 16,
    color: "#4A3FB5",
    fontWeight: "700",
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 15,
    paddingBottom: 45,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  subtitle: {
    fontSize: 15,
    color: "#77778A",
    marginTop: 8,
    lineHeight: 22,
    marginBottom: 22,
  },

  infoCard: {
    backgroundColor: "#EDE9FE",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#4A3FB5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoIconText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3D347E",
  },

  infoText: {
    fontSize: 13,
    color: "#625B7C",
    marginTop: 3,
    lineHeight: 18,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E1E2F",
    marginBottom: 15,
  },

  caregiverCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  caregiverHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  avatarText: {
    fontSize: 27,
  },

  caregiverInfo: {
    flex: 1,
  },

  caregiverName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  specialization: {
    fontSize: 14,
    color: "#4A3FB5",
    marginTop: 3,
    fontWeight: "600",
  },

  experience: {
    fontSize: 13,
    color: "#77778A",
    marginTop: 4,
  },

  verifiedBadge: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },

  verifiedText: {
    color: "#15803D",
    fontWeight: "900",
  },

  bio: {
    fontSize: 14,
    color: "#666677",
    lineHeight: 20,
    marginTop: 15,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEF3",
    marginVertical: 16,
  },

  chargesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555566",
    marginBottom: 12,
  },

  priceRow: {
    flexDirection: "row",
    gap: 8,
  },

  priceBox: {
    flex: 1,
    backgroundColor: "#F8F7FF",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: "center",
  },

  priceIcon: {
    fontSize: 20,
  },

  priceLabel: {
    fontSize: 11,
    color: "#77778A",
    marginTop: 5,
  },

  priceValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#15803D",
    marginTop: 4,
  },

  bookButton: {
    backgroundColor: "#4A3FB5",
    height: 50,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },

  unavailableButton: {
    backgroundColor: "#AAAABB",
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 35,
    borderRadius: 18,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 45,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1E2F",
    marginTop: 12,
  },

  emptyText: {
    textAlign: "center",
    color: "#77778A",
    marginTop: 8,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#77778A",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  modalContainer: {
    maxHeight: "92%",
    backgroundColor: "#F8F7FF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  modalHandle: {
    width: 45,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CCCCD6",
    alignSelf: "center",
    marginTop: 10,
  },

  modalContent: {
    padding: 22,
    paddingBottom: 40,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  modalTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  modalSubtitle: {
    fontSize: 14,
    color: "#77778A",
    marginTop: 4,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EEEEF3",
    justifyContent: "center",
    alignItems: "center",
  },

  closeText: {
    fontSize: 17,
    color: "#555566",
    fontWeight: "700",
  },

  fieldLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333344",
    marginBottom: 8,
    marginTop: 5,
  },

  planCard: {
    minHeight: 70,
    borderWidth: 1,
    borderColor: "#DDDBE8",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  selectedPlanCard: {
    backgroundColor: "#4A3FB5",
    borderColor: "#4A3FB5",
  },

  planTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333344",
  },

  planDescription: {
    fontSize: 12,
    color: "#888899",
    marginTop: 4,
  },

  planPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: "#15803D",
  },

  selectedPlanText: {
    color: "#FFFFFF",
  },

  selectedPlanDescription: {
    color: "#E5E2FF",
  },

  summaryCard: {
    backgroundColor: "#EDE9FE",
    padding: 16,
    borderRadius: 14,
    marginTop: 7,
    marginBottom: 20,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#4A3FB5",
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#666078",
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2F2944",
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2F2944",
  },

  totalPrice: {
    fontSize: 19,
    fontWeight: "900",
    color: "#15803D",
  },

  pickerButton: {
    height: 55,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDBE8",
    borderRadius: 13,
    paddingHorizontal: 15,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pickerPlaceholder: {
    fontSize: 15,
    color: "#9999A8",
  },

  pickerValue: {
    fontSize: 15,
    color: "#1E1E2F",
    fontWeight: "600",
  },

  pickerIcon: {
    fontSize: 18,
  },

  input: {
    minHeight: 55,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDBE8",
    borderRadius: 13,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#1E1E2F",
    marginBottom: 18,
  },

  textArea: {
    minHeight: 110,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDBE8",
    borderRadius: 13,
    padding: 15,
    fontSize: 15,
    color: "#1E1E2F",
    marginBottom: 18,
  },

  confirmButton: {
    minHeight: 55,
    backgroundColor: "#4A3FB5",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
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
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  cancelButtonText: {
    color: "#77778A",
    fontSize: 15,
    fontWeight: "700",
  },
});