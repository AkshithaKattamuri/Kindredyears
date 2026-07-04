import { router } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>KY</Text>
        </View>

        <Text style={styles.title}>Kindred Years</Text>

        <Text style={styles.subtitle}>
          Care that connects generations
        </Text>

        <Text style={styles.description}>
          Supporting elderly well-being while keeping families connected,
          informed, and close.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/sign-in")}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/sign-up")}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
    paddingHorizontal: 24,
    paddingVertical: 30,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#4A3FB5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "700",
  },

  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1E1E2F",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A3FB5",
    textAlign: "center",
    marginBottom: 18,
  },

  description: {
    fontSize: 16,
    color: "#666677",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },

  buttonContainer: {
    width: "100%",
    gap: 14,
    paddingBottom: 10,
  },

  primaryButton: {
    backgroundColor: "#4A3FB5",
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  secondaryButton: {
    borderWidth: 2,
    borderColor: "#4A3FB5",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#4A3FB5",
    fontSize: 17,
    fontWeight: "700",
  },
});