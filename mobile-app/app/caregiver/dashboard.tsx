import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CaregiverDashboard() {
  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/sign-in" as any);
    } catch (error: any) {
      Alert.alert(
        "Logout Failed",
        error.message || "Please try again."
      );
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>
            Welcome Back 👋
          </Text>

          <Text style={styles.title}>
            Caregiver Dashboard
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
        Manage Your Care Services
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push("/caregiver/requests" as any)
        }
      >
        <Text style={styles.icon}>📩</Text>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            Booking Requests
          </Text>

          <Text style={styles.cardSubtitle}>
            Accept or reject elderly care requests
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push("/caregiver/patient" as any)
        }
      >
        <Text style={styles.icon}>👵</Text>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            Accepted Patients
          </Text>

          <Text style={styles.cardSubtitle}>
            View details of accepted patients
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push("/caregiver/updates" as any)
        }
      >
        <Text style={styles.icon}>📋</Text>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            Booking History
          </Text>

          <Text style={styles.cardSubtitle}>
            View previous and current bookings
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push("/caregiver/charges" as any)
        }
      >
        <Text style={styles.icon}>💰</Text>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            My Charges
          </Text>

          <Text style={styles.cardSubtitle}>
            Set your hourly and daily prices
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  content: {
    padding: 22,
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 35,
  },

  welcome: {
    fontSize: 15,
    color: "#77778A",
    marginBottom: 5,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  logoutButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333344",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  icon: {
    fontSize: 30,
    marginRight: 15,
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E1E2F",
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#77778A",
    lineHeight: 19,
  },

  arrow: {
    fontSize: 30,
    color: "#4A3FB5",
  },
});