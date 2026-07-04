import React, { useState } from "react";
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

export default function CaregiverScreen() {

  const [caregiver, setCaregiver] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [instructions, setInstructions] = useState("");

  function handleBookCaregiver() {

    if (
      !caregiver ||
      !service ||
      !date ||
      !time ||
      !instructions
    ) {
      Alert.alert(
        "Missing Details",
        "Please fill all fields."
      );
      return;
    }

    Alert.alert(
      "Caregiver Booked",
      "Caregiver visit has been scheduled successfully."
    );

    setCaregiver("");
    setService("");
    setDate("");
    setTime("");
    setInstructions("");
  }

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Caregiver
        </Text>

        <Text style={styles.subtitle}>
          Schedule caregiver visits and monitor upcoming care.
        </Text>

        <Text style={styles.sectionTitle}>
          Upcoming Visit
        </Text>

        <View style={styles.card}>

          <Ionicons
            name="people"
            size={40}
            color="#4A3FB5"
          />

          <View style={{ marginLeft: 15 }}>

            <Text style={styles.cardTitle}>
              No Upcoming Visit
            </Text>

            <Text style={styles.cardText}>
              Schedule a caregiver visit below.
            </Text>

          </View>

        </View>

        <Text style={styles.sectionTitle}>
          Book Caregiver
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Caregiver Name"
          value={caregiver}
          onChangeText={setCaregiver}
        />

        <TextInput
          style={styles.input}
          placeholder="Service Required"
          value={service}
          onChangeText={setService}
        />

        <TextInput
          style={styles.input}
          placeholder="Visit Date (DD/MM/YYYY)"
          value={date}
          onChangeText={setDate}
        />

        <TextInput
          style={styles.input}
          placeholder="Visit Time"
          value={time}
          onChangeText={setTime}
        />

        <TextInput
          style={[styles.input,{height:100}]}
          multiline
          placeholder="Special Instructions"
          value={instructions}
          onChangeText={setInstructions}
        />

        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookCaregiver}
        >

          <Ionicons
            name="people-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.bookButtonText}>
            Book Caregiver
          </Text>

        </TouchableOpacity>
        {/* Caregiver Visit History */}

        <Text style={styles.sectionTitle}>
          Caregiver Visit History
        </Text>

        <View style={styles.historyCard}>
          <Ionicons
            name="time-outline"
            size={24}
            color="#4A3FB5"
          />

          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={styles.historyTitle}>
              No previous caregiver visits
            </Text>

            <Text style={styles.historySubtitle}>
              Scheduled caregiver visits will appear here.
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