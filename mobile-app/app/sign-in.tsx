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
  ActivityIndicator,
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
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing Details",
        "Please enter your email and password."
      );
      return;
    }

    try {
      setSigningIn(true);

      // 1. Sign in with Firebase Authentication
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      // 2. Get user profile from Firestore
      const userDocRef = doc(
        db,
        "users",
        user.uid
      );

      const userDoc = await getDoc(userDocRef);

      // 3. Check whether profile exists
      if (!userDoc.exists()) {
        await signOut(auth);

        Alert.alert(
          "Profile Not Found",
          "Your Kindred Years profile was not found."
        );

        return;
      }

      const userData = userDoc.data();

      const role =
        typeof userData.role === "string"
          ? userData.role.trim().toLowerCase()
          : "";

      const verificationStatus =
        typeof userData.verificationStatus === "string"
          ? userData.verificationStatus
              .trim()
              .toLowerCase()
          : "";

      console.log("Signed-in UID:", user.uid);
      console.log("Signed-in role:", role);

      // 4. Elderly user
      if (role === "elderly") {
        router.replace(
          "/elderly/elderly-dashboard" as any
        );
        return;
      }

      // 5. Family user
      if (role === "family") {
        router.replace("/family" as any);
        return;
      }

      // 6. Caregiver user
      if (role === "caregiver") {
        if (
          verificationStatus &&
          verificationStatus !== "approved"
        ) {
          await signOut(auth);

          Alert.alert(
            "Verification Pending",
            "Your caregiver account is waiting for admin approval."
          );

          return;
        }

        router.replace(
          "/caregiver/dashboard" as any
        );
        return;
      }

      // 7. Doctor user
      if (role === "doctor") {
        if (
          verificationStatus &&
          verificationStatus !== "approved"
        ) {
          await signOut(auth);

          Alert.alert(
            "Verification Pending",
            "Your doctor account is waiting for admin approval."
          );

          return;
        }

        router.replace(
          "/doctor/dashboard" as any
        );
        return;
      }

      // 8. Unknown role
      await signOut(auth);

      Alert.alert(
        "Invalid Role",
        "Your account role could not be recognized."
      );
    } catch (error: any) {
      console.log("SIGN IN ERROR:", error);

      const errorCode = error?.code || "";

      if (
        errorCode === "auth/invalid-credential" ||
        errorCode === "auth/wrong-password" ||
        errorCode === "auth/user-not-found" ||
        errorCode === "auth/invalid-email"
      ) {
        Alert.alert(
          "Sign In Failed",
          "Invalid email or password."
        );
      } else if (
        errorCode === "auth/network-request-failed"
      ) {
        Alert.alert(
          "Network Error",
          "Please check your internet connection."
        );
      } else if (
        errorCode === "auth/too-many-requests"
      ) {
        Alert.alert(
          "Too Many Attempts",
          "Please wait a while and try again."
        );
      } else {
        Alert.alert(
          "Sign In Failed",
          error?.message ||
            "Something went wrong. Please try again."
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
            disabled={signingIn}
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
              onSubmitEditing={handleSignIn}
            />

            <TouchableOpacity
              style={styles.forgotButton}
              disabled={signingIn}
            >
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.signInButton,
                signingIn &&
                  styles.disabledButton,
              ]}
              onPress={handleSignIn}
              disabled={signingIn}
              activeOpacity={0.8}
            >
              {signingIn ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={styles.signInButtonText}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push("/sign-up" as any)
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
    paddingVertical: 10,
    paddingRight: 15,
  },

  backText: {
    fontSize: 16,
    color: "#4A3FB5",
    fontWeight: "600",
  },

  header: {
    marginTop: 35,
    marginBottom: 35,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#1E1E2F",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#6B6B7A",
    lineHeight: 23,
  },

  form: {
    width: "100%",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E1E2F",
    marginBottom: 8,
  },

  input: {
    height: 55,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DDDBE8",
    color: "#1E1E2F",
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 24,
  },

  forgotText: {
    color: "#4A3FB5",
    fontSize: 14,
    fontWeight: "600",
  },

  signInButton: {
    height: 55,
    backgroundColor: "#4A3FB5",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
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
    marginTop: 28,
  },

  footerText: {
    color: "#6B6B7A",
    fontSize: 15,
  },

  createText: {
    color: "#4A3FB5",
    fontSize: 15,
    fontWeight: "700",
  },
});