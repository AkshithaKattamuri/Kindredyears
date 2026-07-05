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

export default function ReportsScreen() {

  // Later this array will come from Firebase
  const reports: any[] = [];

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
          Medical Reports
        </Text>

        <Text style={styles.subtitle}>
          View medical reports shared by your loved one.
        </Text>

        <Text style={styles.sectionTitle}>
          Reports
        </Text>

        {reports.length === 0 ? (

          <View style={styles.emptyCard}>

            <Ionicons
              name="document-text"
              size={60}
              color="#4A3FB5"
            />

            <Text style={styles.emptyTitle}>
              No Reports Available
            </Text>

            <Text style={styles.emptyText}>
              Medical reports uploaded by the elderly user or caregiver will appear here.
            </Text>

          </View>

        ) : (

          reports.map((report, index) => (

            <View key={index} style={styles.reportCard}>

              <View style={styles.reportHeader}>

                <Ionicons
                  name="document-text"
                  size={32}
                  color="#4A3FB5"
                />

                <View style={{ marginLeft: 12, flex: 1 }}>

                  <Text style={styles.reportTitle}>
                    {report.reportName}
                  </Text>

                  <Text style={styles.reportInfo}>
                    Uploaded by: {report.uploadedBy}
                  </Text>

                  <Text style={styles.reportInfo}>
                    {report.uploadedAt}
                  </Text>

                </View>

              </View>

              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>
                  View Report
                </Text>
              </TouchableOpacity>

            </View>

          ))

        )}

        <Text style={styles.lastUpdated}>
          Last Updated: --
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

  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },

  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  reportTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  reportInfo: {
    marginTop: 4,
    color: "#666",
    fontSize: 14,
  },

  viewButton: {
    backgroundColor: "#4A3FB5",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  lastUpdated: {
    marginTop: 25,
    textAlign: "center",
    color: "#777",
    fontSize: 15,
  },

});