import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function HealthScreen() {

  // Temporary data
  // Later replace this with Firebase data

  const health = {
    condition: "No Health Report Yet",
    bloodPressure: "--",
    heartRate: "--",
    bloodSugar: "--",
    temperature: "--",
    oxygenLevel: "--",
    weight: "--",
    notes:
      "The caregiver has not updated today's health report yet.",
    updatedBy: "--",
    updatedAt: "--",
  };

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
          Health Status
        </Text>

        <Text style={styles.subtitle}>
          Latest health information of your loved one.
        </Text>

        {/* Overall Health */}

        <View style={styles.overallCard}>

          <Ionicons
            name="heart"
            size={50}
            color="#4A3FB5"
          />

          <Text style={styles.overallTitle}>
            {health.condition}
          </Text>

        </View>

        {/* Vital Signs */}

        <Text style={styles.sectionTitle}>
          Vital Signs
        </Text>

        <View style={styles.card}>

          <View style={styles.row}>
            <Text style={styles.label}>
              Blood Pressure
            </Text>

            <Text style={styles.value}>
              {health.bloodPressure}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Heart Rate
            </Text>

            <Text style={styles.value}>
              {health.heartRate}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Blood Sugar
            </Text>

            <Text style={styles.value}>
              {health.bloodSugar}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Temperature
            </Text>

            <Text style={styles.value}>
              {health.temperature}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Oxygen Level
            </Text>

            <Text style={styles.value}>
              {health.oxygenLevel}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Weight
            </Text>

            <Text style={styles.value}>
              {health.weight}
            </Text>
          </View>

        </View>

        {/* Caregiver Notes */}

        <Text style={styles.sectionTitle}>
          Caregiver Notes
        </Text>

        <View style={styles.card}>

          <Text style={styles.notes}>
            {health.notes}
          </Text>

        </View>

        {/* Last Updated */}

        <Text style={styles.sectionTitle}>
          Last Updated
        </Text>

        <View style={styles.card}>

          <View style={styles.row}>
            <Text style={styles.label}>
              Updated By
            </Text>

            <Text style={styles.value}>
              {health.updatedBy}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Updated At
            </Text>

            <Text style={styles.value}>
              {health.updatedAt}
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

  overallCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 3,
    marginBottom: 25,
  },

  overallTitle: {
    marginTop: 15,
    fontSize: 22,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E1E2F",
    marginBottom: 15,
    marginTop: 5,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    elevation: 3,
    marginBottom: 22,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  label: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },

  value: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A3FB5",
  },

  notes: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },

});