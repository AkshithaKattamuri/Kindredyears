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

export default function MedicineScreen() {

  // Temporary placeholder
  // Later this will come from Firebase

  const medicines: any[] = [];

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
          Medicines
        </Text>

        <Text style={styles.subtitle}>
          View today's medicine schedule and status.
        </Text>

        {/* Summary */}

        <View style={styles.summaryCard}>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>0</Text>
            <Text style={styles.summaryLabel}>Taken</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>0</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>0</Text>
            <Text style={styles.summaryLabel}>Missed</Text>
          </View>

        </View>

        <Text style={styles.sectionTitle}>
          Today's Medicines
        </Text>

        {medicines.length === 0 ? (

          <View style={styles.emptyCard}>

            <Ionicons
              name="medical"
              size={60}
              color="#4A3FB5"
            />

            <Text style={styles.emptyTitle}>
              No Medicine Schedule
            </Text>

            <Text style={styles.emptyText}>
              Medicines added by the elderly user or caregiver will appear here.
            </Text>

          </View>

        ) : (

          medicines.map((medicine, index) => (
            <View key={index}>
              {/* Firebase medicines will appear here later */}
            </View>
          ))

        )}

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

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    elevation: 3,
    marginBottom: 25,
  },

  summaryItem: {
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4A3FB5",
  },

  summaryLabel: {
    marginTop: 6,
    color: "#777",
    fontSize: 15,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E1E2F",
    marginBottom: 18,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    elevation: 3,
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  emptyText: {
    marginTop: 10,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
    fontSize: 15,
  },

});