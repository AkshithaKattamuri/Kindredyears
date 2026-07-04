import { router } from "expo-router";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
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

type UserRole = "elderly" | "family" | "caregiver" | "doctor";

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  async function handleCreateAccount() {
  
  if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
    Alert.alert("Missing Details", "Please fill in all fields.");
    return;
  }

  if (!selectedRole) {
    Alert.alert("Select Role", "Please select your role.");
    return;
  }

  if (password.length < 6) {
    Alert.alert(
      "Weak Password",
      "Password must contain at least 6 characters."
    );
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const user = userCredential.user;

    const verificationStatus =
      selectedRole === "caregiver" || selectedRole === "doctor"
        ? "pending"
        : "approved";

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: selectedRole,
      verificationStatus,
      createdAt: serverTimestamp(),
    });

    Alert.alert(
      "Account Created",
      selectedRole === "caregiver" || selectedRole === "doctor"
        ? "Your account is waiting for admin verification."
        : "Your account was created successfully."
    );

    router.replace("/sign-in");
  } catch (error: any) {
    console.log("Signup error:", error);

    if (error.code === "auth/email-already-in-use") {
      Alert.alert(
        "Account Exists",
        "An account already exists with this email."
      );
    } else if (error.code === "auth/invalid-email") {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
    } else if (error.code === "auth/weak-password") {
      Alert.alert(
        "Weak Password",
        "Please choose a stronger password."
      );
    } else {
      Alert.alert(
        "Signup Failed",
        error.message || "Something went wrong."
      );
    }
  }
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
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>{"< Back"}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>

            <Text style={styles.subtitle}>
              Join Kindred Years and stay connected with care
            </Text>
          </View>

          <Text style={styles.label}>Full Name</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#9999A8"
            value={fullName}
            onChangeText={setFullName}
          />

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

          <Text style={styles.label}>Phone Number</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            placeholderTextColor="#9999A8"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Create a password"
            placeholderTextColor="#9999A8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.roleTitle}>I am a</Text>

          <View style={styles.roleGrid}>
            <RoleButton
              label="Elderly"
              role="elderly"
              selectedRole={selectedRole}
              onSelect={setSelectedRole}
            />

            <RoleButton
              label="Family Member"
              role="family"
              selectedRole={selectedRole}
              onSelect={setSelectedRole}
            />

            <RoleButton
              label="Caregiver"
              role="caregiver"
              selectedRole={selectedRole}
              onSelect={setSelectedRole}
            />

            <RoleButton
              label="Doctor"
              role="doctor"
              selectedRole={selectedRole}
              onSelect={setSelectedRole}
            />
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateAccount}
          >
            <Text style={styles.createButtonText}>
              Create Account
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
            </Text>

            <TouchableOpacity
              onPress={() => router.replace("/sign-in")}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type RoleButtonProps = {
  label: string;
  role: UserRole;
  selectedRole: UserRole | null;
  onSelect: (role: UserRole) => void;
};

function RoleButton({
  label,
  role,
  selectedRole,
  onSelect,
}: RoleButtonProps) {
  const isSelected = selectedRole === role;

  return (
    <TouchableOpacity
      style={[
        styles.roleButton,
        isSelected && styles.selectedRoleButton,
      ]}
      onPress={() => onSelect(role)}
    >
      <Text
        style={[
          styles.roleButtonText,
          isSelected && styles.selectedRoleText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
    paddingBottom: 40,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 12,
    marginBottom: 20,
  },

  backText: {
    color: "#4A3FB5",
    fontSize: 16,
    fontWeight: "600",
  },

  header: {
    marginBottom: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1E1E2F",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#666677",
    lineHeight: 24,
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

  roleTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E1E2F",
    marginBottom: 14,
  },

  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  roleButton: {
    width: "48%",
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#DDDCE8",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },

  selectedRoleButton: {
    backgroundColor: "#4A3FB5",
    borderColor: "#4A3FB5",
  },

  roleButtonText: {
    color: "#4A3FB5",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  selectedRoleText: {
    color: "#FFFFFF",
  },

  createButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#4A3FB5",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  createButtonText: {
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
    color: "#666677",
    fontSize: 15,
  },

  signInText: {
    color: "#4A3FB5",
    fontSize: 15,
    fontWeight: "700",
  },
});