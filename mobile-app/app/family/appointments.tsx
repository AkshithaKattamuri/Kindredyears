import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getLinkedElderlyId } from "../services/linkedElderlyService";
export default function AppointmentsScreen() {
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);

  const handleBookAppointment = () => {
    if (
      !hospital ||
      !doctor ||
      !department ||
      !date ||
      !time ||
      !reason
    ) {
      Alert.alert("Missing Details", "Please fill all fields.");
      return;
    }

    Alert.alert(
      "Appointment Booked",
      "Appointment has been booked successfully for your loved one."
    );

    setHospital("");
    setDoctor("");
    setDepartment("");
    setDate("");
    setTime("");
    setReason("");
  };
  useEffect(() => {
  let unsubscribe:
    | (() => void)
    | undefined;

  async function loadAppointments() {
    try {
      const elderlyId =
        await getLinkedElderlyId();

      const q = query(
        collection(
          db,
          "doctorAppointments"
        ),
        where(
          "elderlyId",
          "==",
          elderlyId
        )
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setAppointments(data as any);
        }
      );
    } catch (error) {
      console.log(
        "Family appointments error:",
        error
      );
    }
  }

  loadAppointments();

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, []);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Appointments</Text>

        <Text style={styles.subtitle}>
          View upcoming appointments or book a new one for your loved one.
        </Text>

        {/* Upcoming Appointment */}

        <Text style={styles.sectionTitle}>
          Upcoming Appointment
        </Text>

        <View style={styles.card}>
          <Ionicons
            name="calendar"
            size={40}
            color="#4A3FB5"
          />

          <View style={{ marginLeft: 15 }}>
            <Text style={styles.cardTitle}>
              No Upcoming Appointment
            </Text>

            <Text style={styles.cardText}>
              Book an appointment below.
            </Text>
          </View>
        </View>

        {/* Booking Form */}

        <Text style={styles.sectionTitle}>
          Book Appointment
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Hospital Name"
          value={hospital}
          onChangeText={setHospital}
        />

        <TextInput
          style={styles.input}
          placeholder="Doctor Name"
          value={doctor}
          onChangeText={setDoctor}
        />

        <TextInput
          style={styles.input}
          placeholder="Department"
          value={department}
          onChangeText={setDepartment}
        />

        <TextInput
          style={styles.input}
          placeholder="Appointment Date (DD/MM/YYYY)"
          value={date}
          onChangeText={setDate}
        />

        <TextInput
          style={styles.input}
          placeholder="Appointment Time"
          value={time}
          onChangeText={setTime}
        />

        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Reason for Visit"
          multiline
          value={reason}
          onChangeText={setReason}
        />

        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookAppointment}
        >
          <Ionicons
            name="calendar-outline"
            size={22}
            color="#fff"
          />

          <Text style={styles.bookButtonText}>
            Book Appointment
          </Text>
        </TouchableOpacity>
        {/* Appointment History */}

        <Text style={styles.sectionTitle}>
          Appointment History
        </Text>

        <View style={styles.historyCard}>
          <Ionicons
            name="time-outline"
            size={24}
            color="#4A3FB5"
          />

          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={styles.historyTitle}>
              No previous appointments
            </Text>

            <Text style={styles.historySubtitle}>
              Your booked appointments will appear here.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  back: {
    color: "#4A3FB5",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    marginBottom: 25,
    lineHeight: 22,
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 15,
    fontSize: 22,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  cardText: {
    color: "#777",
    marginTop: 5,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  bookButton: {
    backgroundColor: "#4A3FB5",
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    marginTop: 5,
  },

  historyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  historySubtitle: {
    color: "#777",
    marginTop: 5,
    fontSize: 14,
  },

});