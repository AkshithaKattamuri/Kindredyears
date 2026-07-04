import { router } from "expo-router";
import { useState } from "react";

import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password) {
      Alert.alert(
        "Missing Details",
        "Please enter your email and password."
      );
      return;
    }

    try {
      setSigningIn(true);

      // Step 1: Sign in using Firebase Authentication
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

      const user = userCredential.user;

      // Step 2: Read user profile from Firestore
      const userDoc = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!userDoc.exists()) {
        await signOut(auth);

        Alert.alert(
          "Profile Not Found",
          "Your Kindred Years profile was not found."
        );

        return;
      }

      const userData = userDoc.data();

      const role = userData.role;
      const verificationStatus =
        userData.verificationStatus;

      // Step 3: Block unapproved caregiver/doctor accounts
      if (
        (role === "caregiver" || role === "doctor") &&
        verificationStatus !== "approved"
      ) {
        await signOut(auth);

        Alert.alert(
          "Verification Pending",
          "Your account is waiting for admin approval."
        );

        return;
      }

      // Step 4: Route according to role

      if (role === "elderly") {
        router.replace(
          "/elderly/elderly-dashboard"
        );
        return;
      }

      if (role === "caregiver") {
        router.replace(
          "/caregiver/dashboard" as any
        );
        return;
      }

      // Family dashboard is being added by teammate
      if (role === "family") {
        await signOut(auth);

        Alert.alert(
          "Dashboard Not Available",
          "The Family dashboard is being added."
        );

        return;
      }

      // Doctor dashboard is being added by teammate
      if (role === "doctor") {
        await signOut(auth);

        Alert.alert(
          "Dashboard Not Available",
          "The Doctor dashboard is being added."
        );

        return;
      }

      // Unknown role
      await signOut(auth);

      Alert.alert(
        "Invalid Role",
        "Your account role could not be recognized."
      );
    } catch (error: any) {
      console.log("Sign in error:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        Alert.alert(
          "Sign In Failed",
          "Invalid email or password."
        );
      } else if (
        error.code === "auth/invalid-email"
      ) {
        Alert.alert(
          "Invalid Email",
          "Please enter a valid email address."
        );
      } else if (
        error.code === "auth/network-request-failed"
      ) {
        Alert.alert(
          "Network Error",
          "Please check your internet connection."
        );
      } else if (
        error.code === "auth/too-many-requests"
      ) {
        Alert.alert(
          "Too Many Attempts",
          "Please wait a while and try again."
        );
      } else {
        Alert.alert(
          "Sign In Failed",
          error.message || "Something went wrong."
        );
      }
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              {"< Back"}
            </Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue to Kindred Years
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>
              Email Address
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9999A8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!signingIn}
            />

            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9999A8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!signingIn}
            />

            <TouchableOpacity
              style={styles.forgotButton}
              disabled={signingIn}
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Password reset will be added next."
                )
              }
            >
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.signInButton,
                signingIn &&
                  styles.signInButtonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={signingIn}
              activeOpacity={0.85}
            >
              <Text
                style={styles.signInButtonText}
              >
                {signingIn
                  ? "Signing In..."
                  : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push("/sign-up")
              }
              disabled={signingIn}
            >
              <Text style={styles.createText}>
                Create Account
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
    marginBottom: 20,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 25,
  },

  forgotText: {
    color: "#4A3FB5",
    fontSize: 14,
    fontWeight: "600",
  },

  signInButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#4A3FB5",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  signInButtonDisabled: {
    opacity: 0.6,
  },

  signInButtonText: {
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

  createText: {
    color: "#4A3FB5",
    fontSize: 15,
    fontWeight: "700",
  },
});