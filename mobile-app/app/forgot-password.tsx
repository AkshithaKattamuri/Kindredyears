import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  function handleResetPassword() {
    if (!email) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }

    Alert.alert(
      "Reset Link Sent",
      `A password reset link will be sent to:\n${email}`
    );

    // Firebase password reset will be added later
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>{"< Back"}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>

            <Text style={styles.subtitle}>
              Enter your registered email address and we'll send you a password
              reset link.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9999A8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPassword}
            >
              <Text style={styles.resetButtonText}>
                Send Reset Link
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Remember your password?{" "}
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/sign-in")}
            >
              <Text style={styles.signInText}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 12,
    marginBottom: 35,
  },

  backText: {
    color: "#4A3FB5",
    fontSize: 16,
    fontWeight: "600",
  },

  header: {
    marginBottom: 35,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1E1E2F",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#666677",
    lineHeight: 24,
  },

  form: {
    width: "100%",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#303044",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDCE8",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1E1E2F",
    marginBottom: 30,
  },

  resetButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#4A3FB5",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },

  footerText: {
    color: "#666677",
    fontSize: 15,
  },

  signInText: {
    color: "#4A3FB5",
    fontSize: 15,
    fontWeight: "700",
  },
});