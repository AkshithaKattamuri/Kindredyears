import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
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

type ConsultationMode = "video" | "in-person";

type Doctor = {
  id: string;
  uid: string;
  fullName: string;
  email?: string;
  phone?: string;
  specialization?: string;
  experience?: number | string;
  consultationFee?: number;
  hospitalName?: string;
  qualification?: string;
  bio?: string;
  available?: boolean;
};

type AppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

type Appointment = {
  id: string;
  elderlyId: string;
  doctorId: string;
  doctorName: string;
  specialization?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  appointmentDateTime?: Timestamp;
  consultationMode: ConsultationMode;
  reason: string;
  symptoms?: string | null;
  contactPhone: string;
  consultationFee?: number | null;
  status: AppointmentStatus;
};

export default function DoctorAppointmentScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [myAppointments, setMyAppointments] =
    useState<Appointment[]>([]);

  const [selectedDoctor, setSelectedDoctor] =
    useState<Doctor | null>(null);

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [selectedTime, setSelectedTime] =
    useState<Date | null>(null);

  const [consultationMode, setConsultationMode] =
    useState<ConsultationMode>("video");

  const [reason, setReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [loadingDoctors, setLoadingDoctors] =
    useState(true);

  const [loadingAppointments, setLoadingAppointments] =
    useState(true);

  const [booking, setBooking] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  // --------------------------------------------------
  // LOAD APPROVED DOCTORS
  // --------------------------------------------------

  useEffect(() => {
    let unsubscribeDoctors:
      | (() => void)
      | undefined;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        if (unsubscribeDoctors) {
          unsubscribeDoctors();
          unsubscribeDoctors = undefined;
        }

        if (!user) {
          setDoctors([]);
          setLoadingDoctors(false);

          Alert.alert(
            "Not Signed In",
            "Please sign in again."
          );

          router.replace("/sign-in");
          return;
        }

        setLoadingDoctors(true);

        const doctorsQuery = query(
          collection(db, "users"),
          where("role", "==", "doctor"),
          where(
            "verificationStatus",
            "==",
            "approved"
          )
        );

        unsubscribeDoctors = onSnapshot(
          doctorsQuery,
          (snapshot) => {
            const doctorList: Doctor[] =
              snapshot.docs.map((doctorDoc) => {
                const data = doctorDoc.data();

                return {
                  id: doctorDoc.id,
                  uid:
                    data.uid ||
                    doctorDoc.id,

                  fullName:
                    data.fullName ||
                    "Doctor",

                  email:
                    data.email || "",

                  phone:
                    data.phone || "",

                  specialization:
                    data.specialization,

                  experience:
                    data.experience,

                  consultationFee:
                    data.consultationFee,

                  hospitalName:
                    data.hospitalName,

                  qualification:
                    data.qualification,

                  bio:
                    data.bio,

                  available:
                    data.available,
                };
              });

            setDoctors(doctorList);
            setLoadingDoctors(false);
          },
          (error) => {
            console.log(
              "Load doctors error:",
              error
            );

            setLoadingDoctors(false);

            Alert.alert(
              "Unable to Load",
              "Could not load approved doctors."
            );
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();

      if (unsubscribeDoctors) {
        unsubscribeDoctors();
      }
    };
  }, []);

  // --------------------------------------------------
  // LOAD ELDERLY USER APPOINTMENTS IN REAL TIME
  // --------------------------------------------------

  useEffect(() => {
    let unsubscribeAppointments:
      | (() => void)
      | undefined;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        if (unsubscribeAppointments) {
          unsubscribeAppointments();
          unsubscribeAppointments = undefined;
        }

        if (!user) {
          setMyAppointments([]);
          setLoadingAppointments(false);
          return;
        }

        setLoadingAppointments(true);

        const appointmentsQuery = query(
          collection(db, "doctorAppointments"),
          where("elderlyId", "==", user.uid)
        );

        unsubscribeAppointments = onSnapshot(
          appointmentsQuery,
          (snapshot) => {
            const appointments: Appointment[] =
              snapshot.docs.map(
                (appointmentDoc) => {
                  const data =
                    appointmentDoc.data();

                  return {
                    id:
                      appointmentDoc.id,

                    elderlyId:
                      data.elderlyId || "",

                    doctorId:
                      data.doctorId || "",

                    doctorName:
                      data.doctorName ||
                      "Doctor",

                    specialization:
                      data.specialization ||
                      null,

                    appointmentDate:
                      data.appointmentDate ||
                      "",

                    appointmentTime:
                      data.appointmentTime ||
                      "",

                    appointmentDateTime:
                      data.appointmentDateTime,

                    consultationMode:
                      data.consultationMode ||
                      "video",

                    reason:
                      data.reason || "",

                    symptoms:
                      data.symptoms || null,

                    contactPhone:
                      data.contactPhone ||
                      "",

                    consultationFee:
                      data.consultationFee ??
                      null,

                    status:
                      data.status ||
                      "pending",
                  };
                }
              );

            appointments.sort((a, b) => {
              const aTime =
                a.appointmentDateTime
                  ?.toMillis?.() ?? 0;

              const bTime =
                b.appointmentDateTime
                  ?.toMillis?.() ?? 0;

              return bTime - aTime;
            });

            setMyAppointments(appointments);
            setLoadingAppointments(false);
          },
          (error) => {
            console.log(
              "Appointments listener error:",
              error
            );

            setLoadingAppointments(false);

            Alert.alert(
              "Unable to Load Appointments",
              "Could not load your appointments."
            );
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();

      if (unsubscribeAppointments) {
        unsubscribeAppointments();
      }
    };
  }, []);

  // --------------------------------------------------
  // OPEN BOOKING MODAL
  // --------------------------------------------------

  function openAppointmentModal(
    doctor: Doctor
  ) {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedTime(null);
    setConsultationMode("video");
    setReason("");
    setSymptoms("");
    setContactPhone("");
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowModal(true);
  }

  // --------------------------------------------------
  // RESET BOOKING FORM
  // --------------------------------------------------

  function resetAppointmentForm() {
    setShowModal(false);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setConsultationMode("video");
    setReason("");
    setSymptoms("");
    setContactPhone("");
    setShowDatePicker(false);
    setShowTimePicker(false);
  }

  // --------------------------------------------------
  // CLOSE BOOKING MODAL
  // --------------------------------------------------

  function closeAppointmentModal() {
    if (booking) {
      return;
    }

    resetAppointmentForm();
  }

  // --------------------------------------------------
  // DATE FORMAT
  // --------------------------------------------------

  function formatDate(date: Date) {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // --------------------------------------------------
  // TIME FORMAT
  // --------------------------------------------------

  function formatTime(date: Date) {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // --------------------------------------------------
  // DATE KEY FOR FIRESTORE
  // --------------------------------------------------

  function getDateKey(date: Date) {
    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // --------------------------------------------------
  // DATE PICKER
  // --------------------------------------------------

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

  // --------------------------------------------------
  // TIME PICKER
  // --------------------------------------------------

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

  // --------------------------------------------------
  // CREATE COMPLETE APPOINTMENT DATE + TIME
  // --------------------------------------------------

  function createAppointmentDateTime() {
    if (!selectedDate || !selectedTime) {
      return null;
    }

    return new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0,
      0
    );
  }

  // --------------------------------------------------
  // BOOK APPOINTMENT
  // --------------------------------------------------

  async function handleBookAppointment() {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Not Signed In",
        "Please sign in again."
      );
      return;
    }

    if (!selectedDoctor) {
      Alert.alert(
        "Doctor Required",
        "Please select a doctor."
      );
      return;
    }

    if (!selectedDate) {
      Alert.alert(
        "Date Required",
        "Please select an appointment date."
      );
      return;
    }

    if (!selectedTime) {
      Alert.alert(
        "Time Required",
        "Please select an appointment time."
      );
      return;
    }

    const appointmentDateTime =
      createAppointmentDateTime();

    if (
      !appointmentDateTime ||
      appointmentDateTime.getTime() <=
        Date.now()
    ) {
      Alert.alert(
        "Invalid Time",
        "Please select a future date and time."
      );
      return;
    }

    if (!reason.trim()) {
      Alert.alert(
        "Reason Required",
        "Please enter the reason for consultation."
      );
      return;
    }

    if (!contactPhone.trim()) {
      Alert.alert(
        "Phone Required",
        "Please enter a contact phone number."
      );
      return;
    }

    try {
      setBooking(true);

      await addDoc(
        collection(
          db,
          "doctorAppointments"
        ),
        {
          elderlyId:
            user.uid,

          doctorId:
            selectedDoctor.uid,

          doctorName:
            selectedDoctor.fullName,

          specialization:
            selectedDoctor.specialization ||
            null,

          appointmentDate:
            getDateKey(selectedDate),

          appointmentTime:
            formatTime(selectedTime),

          appointmentDateTime:
            Timestamp.fromDate(
              appointmentDateTime
            ),

          consultationMode:
            consultationMode,

          reason:
            reason.trim(),

          symptoms:
            symptoms.trim() || null,

          contactPhone:
            contactPhone.trim(),

          consultationFee:
            selectedDoctor
              .consultationFee ??
            null,

          status:
            "pending",

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      const doctorName =
        selectedDoctor.fullName;

      // Important:
      // Reset directly instead of calling
      // closeAppointmentModal(), because
      // booking is still true here.
      resetAppointmentForm();

      Alert.alert(
        "Appointment Requested",
        `Your appointment request has been sent to Dr. ${doctorName}.`
      );
    } catch (error: any) {
      console.log(
        "Appointment booking error:",
        error
      );

      Alert.alert(
        "Booking Failed",
        error?.message ||
          "Could not create the appointment."
      );
    } finally {
      setBooking(false);
    }
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        {/* HEADER */}

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
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            Doctor Appointment
          </Text>

          <Text style={styles.subtitle}>
            Find an approved doctor and request
            a consultation.
          </Text>

          {/* INFO CARD */}

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>
                +
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Approved doctors
              </Text>

              <Text style={styles.infoText}>
                Only approved doctor accounts
                are displayed here.
              </Text>
            </View>
          </View>

          {/* MY APPOINTMENTS */}

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              My Appointments
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {myAppointments.length}
              </Text>
            </View>
          </View>

          {loadingAppointments ? (
            <View style={styles.smallLoadingBox}>
              <ActivityIndicator
                color="#4A3FB5"
              />

              <Text style={styles.loadingText}>
                Loading appointments...
              </Text>
            </View>
          ) : myAppointments.length === 0 ? (
            <View
              style={styles.noAppointmentCard}
            >
              <Text
                style={styles.noAppointmentTitle}
              >
                No appointments booked
              </Text>

              <Text
                style={styles.noAppointmentText}
              >
                Your doctor appointment requests
                will appear here.
              </Text>
            </View>
          ) : (
            myAppointments.map(
              (appointment) => (
                <View
                  key={appointment.id}
                  style={styles.appointmentCard}
                >
                  <View
                    style={
                      styles.appointmentTopRow
                    }
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={
                          styles.appointmentDoctor
                        }
                      >
                        Dr.{" "}
                        {appointment.doctorName}
                      </Text>

                      <Text
                        style={
                          styles.appointmentSpecialization
                        }
                      >
                        {appointment.specialization ||
                          "General Physician"}
                      </Text>
                    </View>

                    <StatusBadge
                      status={
                        appointment.status
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.appointmentDetails
                    }
                  >
                    <Text
                      style={
                        styles.appointmentDetailText
                      }
                    >
                      Date:{" "}
                      {
                        appointment.appointmentDate
                      }
                    </Text>

                    <Text
                      style={
                        styles.appointmentDetailText
                      }
                    >
                      Time:{" "}
                      {
                        appointment.appointmentTime
                      }
                    </Text>

                    <Text
                      style={
                        styles.appointmentDetailText
                      }
                    >
                      Mode:{" "}
                      {appointment.consultationMode ===
                      "video"
                        ? "Video Call"
                        : "In Person"}
                    </Text>

                    <Text
                      style={
                        styles.appointmentDetailText
                      }
                    >
                      Reason:{" "}
                      {appointment.reason}
                    </Text>
                  </View>

                  {appointment.status ===
                  "pending" ? (
                    <Text
                      style={styles.pendingMessage}
                    >
                      Waiting for doctor approval
                    </Text>
                  ) : null}

                  {appointment.status ===
                  "accepted" ? (
                    <Text
                      style={
                        styles.acceptedMessage
                      }
                    >
                      Appointment confirmed by
                      doctor
                    </Text>
                  ) : null}

                  {appointment.status ===
                  "rejected" ? (
                    <Text
                      style={
                        styles.rejectedMessage
                      }
                    >
                      Appointment request was
                      declined
                    </Text>
                  ) : null}

                  {appointment.status ===
                  "completed" ? (
                    <Text
                      style={
                        styles.completedMessage
                      }
                    >
                      Appointment completed
                    </Text>
                  ) : null}

                  {appointment.status ===
                  "cancelled" ? (
                    <Text
                      style={
                        styles.cancelledMessage
                      }
                    >
                      Appointment cancelled
                    </Text>
                  ) : null}
                </View>
              )
            )
          )}

          {/* AVAILABLE DOCTORS */}

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              Available Doctors
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {doctors.length}
              </Text>
            </View>
          </View>

          {loadingDoctors ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator
                size="large"
                color="#4A3FB5"
              />

              <Text style={styles.loadingText}>
                Loading doctors...
              </Text>
            </View>
          ) : doctors.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Text
                  style={styles.emptyIconText}
                >
                  +
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No approved doctors
              </Text>

              <Text style={styles.emptyText}>
                Approved doctor accounts will
                appear here automatically.
              </Text>
            </View>
          ) : (
            doctors.map((doctor) => (
              <View
                key={doctor.id}
                style={styles.doctorCard}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.avatar}>
                    <Text
                      style={styles.avatarText}
                    >
                      {doctor.fullName
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.doctorInfo}>
                    <Text
                      style={styles.doctorName}
                    >
                      Dr. {doctor.fullName}
                    </Text>

                    <Text
                      style={
                        styles.specializationText
                      }
                    >
                      {doctor.specialization ||
                        "General Physician"}
                    </Text>

                    <View
                      style={styles.approvedRow}
                    >
                      <View
                        style={styles.approvedDot}
                      />

                      <Text
                        style={styles.approvedText}
                      >
                        Approved Doctor
                      </Text>
                    </View>
                  </View>
                </View>

                {doctor.qualification ? (
                  <Text
                    style={styles.qualification}
                  >
                    {doctor.qualification}
                  </Text>
                ) : null}

                <View style={styles.detailsGrid}>
                  <DetailBox
                    label="Experience"
                    value={
                      doctor.experience !==
                      undefined
                        ? `${doctor.experience} yrs`
                        : "Not added"
                    }
                  />

                  <DetailBox
                    label="Consultation"
                    value={
                      doctor.consultationFee !==
                      undefined
                        ? `₹${doctor.consultationFee}`
                        : "Not added"
                    }
                  />
                </View>

                {doctor.hospitalName ? (
                  <View
                    style={styles.hospitalBox}
                  >
                    <Text
                      style={styles.hospitalLabel}
                    >
                      Hospital / Clinic
                    </Text>

                    <Text
                      style={styles.hospitalValue}
                    >
                      {doctor.hospitalName}
                    </Text>
                  </View>
                ) : null}

                {doctor.bio ? (
                  <Text style={styles.bioText}>
                    {doctor.bio}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() =>
                    openAppointmentModal(
                      doctor
                    )
                  }
                >
                  <Text
                    style={styles.bookButtonText}
                  >
                    Book Appointment
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* BOOKING MODAL */}

        <Modal
          visible={showModal}
          animationType="slide"
          transparent
          onRequestClose={
            closeAppointmentModal
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
                  <View style={{ flex: 1 }}>
                    <Text
                      style={styles.modalTitle}
                    >
                      Book Appointment
                    </Text>

                    <Text
                      style={
                        styles.modalSubtitle
                      }
                    >
                      Dr.{" "}
                      {selectedDoctor?.fullName}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={
                      closeAppointmentModal
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

                {/* CONSULTATION MODE */}

                <Text style={styles.label}>
                  Consultation Mode
                </Text>

                <View style={styles.modeRow}>
                  <ModeButton
                    label="Video Call"
                    selected={
                      consultationMode ===
                      "video"
                    }
                    onPress={() =>
                      setConsultationMode(
                        "video"
                      )
                    }
                  />

                  <ModeButton
                    label="In Person"
                    selected={
                      consultationMode ===
                      "in-person"
                    }
                    onPress={() =>
                      setConsultationMode(
                        "in-person"
                      )
                    }
                  />
                </View>

                {/* DATE */}

                <Text style={styles.label}>
                  Appointment Date
                </Text>

                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() =>
                    setShowDatePicker(true)
                  }
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

                  <Text
                    style={styles.pickerSymbol}
                  >
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
                    display="default"
                    onChange={handleDateChange}
                  />
                ) : null}

                {/* TIME */}

                <Text style={styles.label}>
                  Appointment Time
                </Text>

                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() =>
                    setShowTimePicker(true)
                  }
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

                  <Text
                    style={styles.pickerSymbol}
                  >
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
                    display="default"
                    onChange={handleTimeChange}
                  />
                ) : null}

                {/* PHONE */}

                <Text style={styles.label}>
                  Contact Phone Number
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter contact number"
                  placeholderTextColor="#9999A8"
                  keyboardType="phone-pad"
                  value={contactPhone}
                  onChangeText={setContactPhone}
                />

                {/* REASON */}

                <Text style={styles.label}>
                  Reason for Consultation
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.reasonInput,
                  ]}
                  placeholder="Example: Regular checkup, joint pain"
                  placeholderTextColor="#9999A8"
                  multiline
                  textAlignVertical="top"
                  value={reason}
                  onChangeText={setReason}
                />

                {/* SYMPTOMS */}

                <Text style={styles.label}>
                  Symptoms
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.symptomsInput,
                  ]}
                  placeholder="Describe symptoms, if any"
                  placeholderTextColor="#9999A8"
                  multiline
                  textAlignVertical="top"
                  value={symptoms}
                  onChangeText={setSymptoms}
                />

                {/* FEE */}

                {selectedDoctor &&
                selectedDoctor.consultationFee !==
                  undefined ? (
                  <View style={styles.feeCard}>
                    <Text
                      style={styles.feeLabel}
                    >
                      Consultation Fee
                    </Text>

                    <Text
                      style={styles.feeValue}
                    >
                      ₹
                      {
                        selectedDoctor
                          .consultationFee
                      }
                    </Text>
                  </View>
                ) : null}

                {/* CONFIRM */}

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    booking &&
                      styles.disabledButton,
                  ]}
                  onPress={
                    handleBookAppointment
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
                      Send Appointment Request
                    </Text>
                  )}
                </TouchableOpacity>

                {/* CANCEL */}

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={
                    closeAppointmentModal
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

// --------------------------------------------------
// STATUS BADGE
// --------------------------------------------------

function StatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  let statusStyle =
    styles.statusPending;

  let label = "PENDING";

  if (status === "accepted") {
    statusStyle =
      styles.statusAccepted;

    label = "ACCEPTED";
  } else if (status === "rejected") {
    statusStyle =
      styles.statusRejected;

    label = "REJECTED";
  } else if (status === "completed") {
    statusStyle =
      styles.statusCompleted;

    label = "COMPLETED";
  } else if (status === "cancelled") {
    statusStyle =
      styles.statusCancelled;

    label = "CANCELLED";
  }

  return (
    <View
      style={[
        styles.statusBadge,
        statusStyle,
      ]}
    >
      <Text style={styles.statusBadgeText}>
        {label}
      </Text>
    </View>
  );
}

// --------------------------------------------------
// DETAIL BOX
// --------------------------------------------------

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

// --------------------------------------------------
// MODE BUTTON
// --------------------------------------------------

function ModeButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.modeButton,
        selected &&
          styles.selectedModeButton,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.modeButtonText,
          selected &&
            styles.selectedModeText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

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
    fontSize: 24,
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

  smallLoadingBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    minHeight: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
    elevation: 2,
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
    fontSize: 26,
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

  noAppointmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 26,
    elevation: 2,
  },

  noAppointmentTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  noAppointmentText: {
    fontSize: 13,
    color: "#77778A",
    marginTop: 6,
    lineHeight: 19,
  },

  appointmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },

  appointmentTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  appointmentDoctor: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  appointmentSpecialization: {
    fontSize: 13,
    color: "#77778A",
    marginTop: 4,
  },

  appointmentDetails: {
    backgroundColor: "#F8F7FF",
    borderRadius: 13,
    padding: 13,
    marginTop: 14,
  },

  appointmentDetailText: {
    fontSize: 13,
    color: "#55556A",
    marginBottom: 5,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },

  statusPending: {
    backgroundColor: "#F2A93B",
  },

  statusAccepted: {
    backgroundColor: "#2D9D5C",
  },

  statusRejected: {
    backgroundColor: "#D9534F",
  },

  statusCompleted: {
    backgroundColor: "#4A3FB5",
  },

  statusCancelled: {
    backgroundColor: "#77778A",
  },

  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  pendingMessage: {
    color: "#B7791F",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
  },

  acceptedMessage: {
    color: "#2D9D5C",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
  },

  rejectedMessage: {
    color: "#D9534F",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
  },

  completedMessage: {
    color: "#4A3FB5",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
  },

  cancelledMessage: {
    color: "#77778A",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
  },

  doctorCard: {
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

  doctorInfo: {
    flex: 1,
  },

  doctorName: {
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

  qualification: {
    marginTop: 14,
    fontSize: 13,
    color: "#4A3FB5",
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

  hospitalBox: {
    backgroundColor: "#F8F7FF",
    borderRadius: 13,
    padding: 12,
    marginTop: 10,
  },

  hospitalLabel: {
    fontSize: 10,
    color: "#888899",
    fontWeight: "700",
  },

  hospitalValue: {
    fontSize: 13,
    color: "#303044",
    fontWeight: "700",
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
    backgroundColor: "rgba(20,20,35,0.45)",
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
    marginBottom: 22,
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

  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  modeButton: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#DDDCE8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  selectedModeButton: {
    backgroundColor: "#4A3FB5",
    borderColor: "#4A3FB5",
  },

  modeButtonText: {
    color: "#4A3FB5",
    fontSize: 14,
    fontWeight: "700",
  },

  selectedModeText: {
    color: "#FFFFFF",
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

  pickerSymbol: {
    color: "#4A3FB5",
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

  reasonInput: {
    minHeight: 95,
    paddingTop: 14,
    paddingBottom: 14,
  },

  symptomsInput: {
    minHeight: 105,
    paddingTop: 14,
    paddingBottom: 14,
  },

  feeCard: {
    backgroundColor: "#EEEAFE",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  feeLabel: {
    fontSize: 12,
    color: "#666677",
    fontWeight: "700",
  },

  feeValue: {
    fontSize: 24,
    color: "#4A3FB5",
    fontWeight: "900",
    marginTop: 4,
  },

  confirmButton: {
    height: 56,
    backgroundColor: "#4A3FB5",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
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
});