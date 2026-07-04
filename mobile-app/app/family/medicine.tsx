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
  const medicines = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      time: "08:00 AM",
      status: "Taken",
      color: "#3BB273",
      icon: "checkmark-circle",
    },
    {
      id: 2,
      name: "Vitamin D",
      time: "02:00 PM",
      status: "Pending",
      color: "#F4B400",
      icon: "time",
    },
    {
      id: 3,
      name: "Blood Pressure Tablet",
      time: "08:00 PM",
      status: "Missed",
      color: "#E53935",
      icon: "close-circle",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}

        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={26}
            color="#4A3FB5"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Medicine Updates
        </Text>

        <Text style={styles.subtitle}>
          Today's medication status for Lakshmi Devi
        </Text>

        {/* Summary Card */}

        <View style={styles.summaryCard}>
          <Ionicons
            name="medical"
            size={34}
            color="#4A3FB5"
          />

          <View style={{ marginLeft: 15 }}>
            <Text style={styles.summaryTitle}>
              Today's Progress
            </Text>

            <Text style={styles.summaryText}>
              1 of 3 medicines taken
            </Text>
          </View>
        </View>

        {/* Medicine List */}

        {medicines.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.left}>
              <Ionicons
                name={item.icon as any}
                size={30}
                color={item.color}
              />
            </View>

            <View style={styles.middle}>
              <Text style={styles.medicineName}>
                {item.name}
              </Text>

              <Text style={styles.time}>
                {item.time}
              </Text>
            </View>

            <View
              style={[
                styles.status,
                { backgroundColor: item.color },
              ]}
            >
              <Text style={styles.statusText}>
                {item.status}
              </Text>
            </View>
          </View>
        ))}

        {/* Last Updated */}

        <Text style={styles.lastUpdated}>
          Last Updated: Today, 10:30 AM
        </Text>
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
    padding: 22,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1E1E2F",
    marginTop: 20,
  },

  subtitle: {
    color: "#666",
    marginTop: 6,
    marginBottom: 25,
    fontSize: 15,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    elevation: 3,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  summaryText: {
    marginTop: 5,
    color: "#666",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    elevation: 2,
  },

  left: {
    marginRight: 15,
  },

  middle: {
    flex: 1,
  },

  medicineName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  time: {
    marginTop: 5,
    color: "#777",
  },

  status: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  lastUpdated: {
    textAlign: "center",
    marginTop: 18,
    color: "#777",
    marginBottom: 30,
  },
});