import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../../config/firebase";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CaregiverCharges() {
  const [hourlyCharge, setHourlyCharge] = useState("");
  const [fullDayCharge, setFullDayCharge] = useState("");
  const [monthlyCharge, setMonthlyCharge] = useState("");
  const [experience, setExperience] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCharges();
  }, []);

  async function loadCharges() {
    try {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      const caregiverRef = doc(
        db,
        "caregivers",
        user.uid
      );

      const caregiverDoc = await getDoc(caregiverRef);

      if (caregiverDoc.exists()) {
        const data = caregiverDoc.data();

        setHourlyCharge(
          data.hourlyCharge?.toString() || ""
        );

        setFullDayCharge(
          data.fullDayCharge?.toString() || ""
        );

        setMonthlyCharge(
          data.monthlyCharge?.toString() || ""
        );

        setExperience(
          data.experience?.toString() || ""
        );
      }
    } catch (error) {
      console.log(
        "Load caregiver charges error:",
        error
      );

      Alert.alert(
        "Error",
        "Could not load your charges."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveCharges() {
    const hourly = Number(hourlyCharge);
    const fullDay = Number(fullDayCharge);
    const monthly = Number(monthlyCharge);

    if (
      !hourlyCharge.trim() ||
      !fullDayCharge.trim() ||
      !monthlyCharge.trim()
    ) {
      Alert.alert(
        "Missing Details",
        "Please enter charges for 1 hour, full day, and 1 month."
      );
      return;
    }

    if (
      !Number.isFinite(hourly) ||
      hourly <= 0 ||
      !Number.isFinite(fullDay) ||
      fullDay <= 0 ||
      !Number.isFinite(monthly) ||
      monthly <= 0
    ) {
      Alert.alert(
        "Invalid Charges",
        "Please enter valid positive prices."
      );
      return;
    }

    try {
      setSaving(true);

      const user = auth.currentUser;

      if (!user) {
        Alert.alert(
          "Not Signed In",
          "Please sign in again."
        );
        return;
      }

      await setDoc(
        doc(db, "caregivers", user.uid),
        {
          caregiverId: user.uid,
          email: user.email || "",

          hourlyCharge: hourly,
          fullDayCharge: fullDay,
          monthlyCharge: monthly,

          experience: experience.trim(),

          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      Alert.alert(
        "Charges Updated",
        "Users can now see your 1-hour, full-day, and monthly prices."
      );
    } catch (error: any) {
      console.log(
        "Save caregiver charges error:",
        error
      );

      Alert.alert(
        "Save Failed",
        error?.message ||
          "Could not update charges."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#4A3FB5"
        />

        <Text style={styles.loadingText}>
          Loading your charges...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          💰 My Charges
        </Text>

        <Text style={styles.subtitle}>
          Set your care service prices. Elderly
          users and family members can view these
          prices before booking you.
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Care Service Pricing
          </Text>

          <Text style={styles.label}>
            ⏱️ 1 Hour Charge
          </Text>

          <View style={styles.priceInput}>
            <Text style={styles.currency}>
              ₹
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: 300"
              placeholderTextColor="#9999A8"
              keyboardType="numeric"
              value={hourlyCharge}
              onChangeText={setHourlyCharge}
            />

            <Text style={styles.unit}>
              / 1 hr
            </Text>
          </View>

          <Text style={styles.label}>
            ☀️ Full Day Charge
          </Text>

          <View style={styles.priceInput}>
            <Text style={styles.currency}>
              ₹
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: 1500"
              placeholderTextColor="#9999A8"
              keyboardType="numeric"
              value={fullDayCharge}
              onChangeText={setFullDayCharge}
            />

            <Text style={styles.unit}>
              / full day
            </Text>
          </View>

          <Text style={styles.label}>
            📅 1 Month Charge
          </Text>

          <View style={styles.priceInput}>
            <Text style={styles.currency}>
              ₹
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: 25000"
              placeholderTextColor="#9999A8"
              keyboardType="numeric"
              value={monthlyCharge}
              onChangeText={setMonthlyCharge}
            />

            <Text style={styles.unit}>
              / month
            </Text>
          </View>

          <Text style={styles.label}>
            👩‍⚕️ Experience
          </Text>

          <TextInput
            style={styles.normalInput}
            placeholder="Example: 4 years"
            placeholderTextColor="#9999A8"
            value={experience}
            onChangeText={setExperience}
          />

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving && styles.disabledButton,
            ]}
            onPress={saveCharges}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.saveText}>
                Save Charges
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>
            👀 User Price Preview
          </Text>

          <Text style={styles.previewSubtitle}>
            This is how users can see your pricing
          </Text>

          <View style={styles.previewRow}>
            <View>
              <Text style={styles.previewLabel}>
                ⏱️ 1 Hour
              </Text>

              <Text style={styles.previewSmall}>
                Short-term assistance
              </Text>
            </View>

            <Text style={styles.previewPrice}>
              ₹{hourlyCharge || "0"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.previewRow}>
            <View>
              <Text style={styles.previewLabel}>
                ☀️ Full Day
              </Text>

              <Text style={styles.previewSmall}>
                Full-day elderly care
              </Text>
            </View>

            <Text style={styles.previewPrice}>
              ₹{fullDayCharge || "0"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.previewRow}>
            <View>
              <Text style={styles.previewLabel}>
                📅 1 Month
              </Text>

              <Text style={styles.previewSmall}>
                Long-term monthly care
              </Text>
            </View>

            <Text style={styles.previewPrice}>
              ₹{monthlyCharge || "0"}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            ℹ️ Price Visibility
          </Text>

          <Text style={styles.infoText}>
            After saving, these charges are stored
            in Firestore and can be displayed on
            the elderly caregiver-booking page.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FC",
  },

  loadingText: {
    marginTop: 12,
    color: "#77778A",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  subtitle: {
    fontSize: 15,
    color: "#77778A",
    marginTop: 8,
    marginBottom: 25,
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E1E2F",
    marginBottom: 22,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333344",
    marginBottom: 8,
  },

  priceInput: {
    height: 56,
    borderWidth: 1,
    borderColor: "#DDDBE8",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },

  currency: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4A3FB5",
  },

  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
    color: "#1E1E2F",
  },

  unit: {
    color: "#77778A",
    fontSize: 13,
  },

  normalInput: {
    height: 56,
    borderWidth: 1,
    borderColor: "#DDDBE8",
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 22,
    color: "#1E1E2F",
  },

  saveButton: {
    height: 55,
    backgroundColor: "#4A3FB5",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  previewCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    marginTop: 20,
    elevation: 2,
  },

  previewTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  previewSubtitle: {
    fontSize: 13,
    color: "#77778A",
    marginTop: 5,
    marginBottom: 20,
  },

  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  previewLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333344",
  },

  previewSmall: {
    fontSize: 12,
    color: "#888899",
    marginTop: 3,
  },

  previewPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#15803D",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEF3",
    marginVertical: 16,
  },

  infoCard: {
    backgroundColor: "#EDE9FE",
    padding: 17,
    borderRadius: 15,
    marginTop: 18,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#4A3FB5",
    marginBottom: 6,
  },

  infoText: {
    color: "#5B5575",
    lineHeight: 20,
    fontSize: 14,
  },
});