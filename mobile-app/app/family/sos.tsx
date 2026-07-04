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

export default function SOSScreen() {

  // Later this will come from Firebase

  const activeSOS = null;

  const sosHistory: any[] = [];

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
          SOS Alerts
        </Text>

        <Text style={styles.subtitle}>
          Monitor emergency alerts from your loved one.
        </Text>

        <Text style={styles.sectionTitle}>
          Active Emergency
        </Text>

        {activeSOS ? (

          <View style={styles.alertCard}>
            {/* Firebase data will appear here */}
          </View>

        ) : (

          <View style={styles.emptyCard}>

            <Ionicons
              name="shield-checkmark"
              size={60}
              color="#3BB273"
            />

            <Text style={styles.emptyTitle}>
              No Active Emergency
            </Text>

            <Text style={styles.emptyText}>
              There are currently no SOS alerts from your loved one.
            </Text>

          </View>

        )}

        <Text style={styles.sectionTitle}>
          SOS History
        </Text>

        {sosHistory.length === 0 ? (

          <View style={styles.historyCard}>

            <Ionicons
              name="time-outline"
              size={40}
              color="#4A3FB5"
            />

            <Text style={styles.historyTitle}>
              No Previous Alerts
            </Text>

            <Text style={styles.historySubtitle}>
              Previous emergency alerts will appear here.
            </Text>

          </View>

        ) : (

          sosHistory.map((item, index) => (

            <View key={index}>
              {/* Firebase history */}
            </View>

          ))

        )}

        <TouchableOpacity style={styles.callButton}>

          <Ionicons
            name="call"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.callButtonText}>
            Call Elderly
          </Text>

        </TouchableOpacity>

        <TouchableOpacity style={styles.emergencyButton}>

          <Ionicons
            name="medical"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.callButtonText}>
            Call Emergency Services
          </Text>

        </TouchableOpacity>

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
    marginBottom: 25,
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

  alertCard: {
    backgroundColor: "#FFE5E5",
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E53935",
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    elevation: 3,
    marginBottom: 25,
  },

  historyTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  historySubtitle: {
    marginTop: 8,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
  },

  callButton: {
    backgroundColor: "#4A3FB5",
    borderRadius: 15,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  emergencyButton: {
    backgroundColor: "#E53935",
    borderRadius: 15,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  callButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },

});