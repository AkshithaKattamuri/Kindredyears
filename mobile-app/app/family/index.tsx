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

export default function FamilyDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}

        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>
              Welcome back
            </Text>

            <Text style={styles.name}>
              Akshitha
            </Text>

            <Text style={styles.monitoring}>
              Monitoring
            </Text>

            <Text style={styles.elderName}>
              Lakshmi Devi
            </Text>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>A</Text>
          </View>
        </View>

        {/* Today's Monitoring */}

        <View style={styles.summaryCard}>

          <Text style={styles.cardTitle}>
            Today's Monitoring
          </Text>

          <View style={styles.summaryRow}>

            <View style={styles.summaryItem}>
              <Ionicons
                name="heart"
                size={28}
                color="#4A3FB5"
              />

              <Text style={styles.summaryValue}>
                Stable
              </Text>

              <Text style={styles.summaryLabel}>
                Health
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons
                name="medical"
                size={28}
                color="#4A3FB5"
              />

              <Text style={styles.summaryValue}>
                2/3
              </Text>

              <Text style={styles.summaryLabel}>
                Medicines
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons
                name="calendar"
                size={28}
                color="#4A3FB5"
              />

              <Text style={styles.summaryValue}>
                1
              </Text>

              <Text style={styles.summaryLabel}>
                Appointment
              </Text>
            </View>

          </View>

        </View>
        {/* My Family Care */}

<Text style={styles.sectionTitle}>
  My Family Care
</Text>

<Text style={styles.sectionSubtitle}>
  Stay connected with your loved one's health
</Text>

<View style={styles.grid}>

  <TouchableOpacity
  style={styles.gridCard}
  onPress={() => router.push("/family/medicine")}
>
    <Ionicons name="medical" size={28} color="#4A3FB5" />
    <Text style={styles.gridTitle}>Medicines</Text>
    <Text style={styles.gridSubtitle}>Medicine Updates</Text>
  </TouchableOpacity>

    <TouchableOpacity
  style={styles.gridCard}
  onPress={() => router.push("/family/appointments")}
>
    <Ionicons name="calendar" size={28} color="#4A3FB5" />
    <Text style={styles.gridTitle}>Appointments</Text>
    <Text style={styles.gridSubtitle}>Doctor Visits</Text>
  </TouchableOpacity>

    <TouchableOpacity
  style={styles.gridCard}
  onPress={() => router.push("/family/reports")}
>
    <Ionicons name="document-text" size={28} color="#4A3FB5" />
    <Text style={styles.gridTitle}>Reports</Text>
    <Text style={styles.gridSubtitle}>Medical Reports</Text>
  </TouchableOpacity>

    <TouchableOpacity
  style={styles.gridCard}
  onPress={() => router.push("/family/caregiver")}
>
    <Ionicons name="people" size={28} color="#4A3FB5" />
    <Text style={styles.gridTitle}>Caregiver</Text>
    <Text style={styles.gridSubtitle}>Daily Updates</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.gridCard}>
    <Ionicons name="heart" size={28} color="#4A3FB5" />
    <Text style={styles.gridTitle}>Health</Text>
    <Text style={styles.gridSubtitle}>Health Status</Text>
  </TouchableOpacity>

  <TouchableOpacity
  style={styles.gridCard}
  onPress={() => router.push("/family/sos")}
   >
  <Ionicons name="warning" size={28} color="#E53935" />
  <Text style={styles.gridTitle}>SOS Alerts</Text>
  <Text style={styles.gridSubtitle}>Emergency</Text>
</TouchableOpacity>

</View>
{/* Recent Activity */}

<Text style={styles.sectionTitle}>
  Recent Activity
</Text>

<View style={styles.activityCard}>
  <View style={styles.activityItem}>
    <Ionicons name="checkmark-circle" size={22} color="#3BB273" />
    <Text style={styles.activityText}>
      Morning medicine taken at 8:00 AM
    </Text>
  </View>

  <View style={styles.activityItem}>
    <Ionicons name="checkmark-circle" size={22} color="#3BB273" />
    <Text style={styles.activityText}>
      Blood pressure checked - Normal
    </Text>
  </View>

  <View style={styles.activityItem}>
    <Ionicons name="checkmark-circle" size={22} color="#3BB273" />
    <Text style={styles.activityText}>
      Caregiver checked in at 9:30 AM
    </Text>
  </View>
</View>

{/* Sign Out Button */}

<TouchableOpacity style={styles.logoutButton}>
  <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
  <Text style={styles.logoutText}>Sign Out</Text>
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  welcome: {
    color: "#777",
    fontSize: 16,
  },

  name: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  monitoring: {
    marginTop: 10,
    color: "#777",
    fontSize: 15,
  },

  elderName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4A3FB5",
  },

  profileCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#4A3FB5",
    justifyContent: "center",
    alignItems: "center",
  },

  profileText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E1E2F",
    marginBottom: 20,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryItem: {
    alignItems: "center",
    flex: 1,
  },

  summaryValue: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  summaryLabel: {
    marginTop: 4,
    color: "#777",
    textAlign: "center",
    fontSize: 13,
  },

  sectionTitle: {
  marginTop: 30,
  fontSize: 24,
  fontWeight: "700",
  color: "#1E1E2F",
},

sectionSubtitle: {
  color: "#777",
  marginTop: 5,
  marginBottom: 20,
},

grid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
},

gridCard: {
  width: "48%",
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  padding: 18,
  marginBottom: 16,
  elevation: 3,
},

gridTitle: {
  marginTop: 12,
  fontSize: 17,
  fontWeight: "700",
  color: "#1E1E2F",
},

gridSubtitle: {
  marginTop: 4,
  color: "#777",
  fontSize: 13,
},

activityCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  padding: 18,
  marginTop: 15,
  elevation: 3,
},

activityItem: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 15,
},

activityText: {
  marginLeft: 12,
  fontSize: 15,
  color: "#1E1E2F",
  flex: 1,
},

logoutButton: {
  marginTop: 30,
  marginBottom: 40,
  backgroundColor: "#4A3FB5",
  borderRadius: 15,
  paddingVertical: 16,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
},

logoutText: {
  color: "#FFFFFF",
  fontSize: 17,
  fontWeight: "700",
  marginLeft: 8,
},

});