import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FamilyDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >

        {/* Greeting */}

        <View style={styles.header}>
          <Text style={styles.goodMorning}>
            👋 Good Morning,
          </Text>

          <Text style={styles.name}>
            Akshitha
          </Text>

          <Text style={styles.monitoring}>
            Monitoring
          </Text>

          <Text style={styles.elderName}>
            👵 Lakshmi Devi
          </Text>
        </View>

        {/* Health Status */}

        <View style={styles.healthCard}>

          <View style={styles.healthRow}>

            <Text style={styles.healthIcon}>
              ❤️
            </Text>

            <View>

              <Text style={styles.healthTitle}>
                Health Status
              </Text>

              <Text style={styles.healthStatus}>
                Stable
              </Text>

              <Text style={styles.lastUpdated}>
                Last Updated: Today, 10:30 AM
              </Text>

            </View>

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

  scrollContainer: {
    padding: 22,
    paddingBottom: 40,
  },

  header: {
    marginTop: 15,
    marginBottom: 25,
  },

  goodMorning: {
    fontSize: 18,
    color: "#666677",
  },

  name: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1E1E2F",
    marginTop: 4,
  },

  monitoring: {
    marginTop: 18,
    fontSize: 15,
    color: "#777",
  },

  elderName: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700",
    color: "#4A3FB5",
  },

  healthCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 25,
  },

  healthRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  healthIcon: {
    fontSize: 38,
    marginRight: 15,
  },

  healthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  healthStatus: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700",
    color: "#3BB273",
  },

  lastUpdated: {
    marginTop: 6,
    color: "#777",
    fontSize: 14,
  },

});