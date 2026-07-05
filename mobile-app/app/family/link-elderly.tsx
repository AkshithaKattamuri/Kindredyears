import React, { useState } from "react";

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

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  linkFamilyToElderly,
  type LinkedElderly,
} from "../services/familyLinkService";

export default function LinkElderlyScreen() {
  const [linkCode, setLinkCode] = useState("");
  const [relationship, setRelationship] = useState("");

  const [loading, setLoading] = useState(false);

  const [linkedElderly, setLinkedElderly] =
    useState<LinkedElderly | null>(null);

  // --------------------------------------------------
  // NORMALIZE LINK CODE
  // --------------------------------------------------

  function handleLinkCodeChange(value: string) {
    const normalized = value
      .toUpperCase()
      .replace(/\s/g, "");

    setLinkCode(normalized);
  }

  // --------------------------------------------------
  // CONNECT FAMILY TO ELDERLY
  // --------------------------------------------------

  async function handleConnect() {
    if (!linkCode.trim()) {
      Alert.alert(
        "Link Code Required",
        "Please enter the elderly member's link code."
      );
      return;
    }

    if (!relationship.trim()) {
      Alert.alert(
        "Relationship Required",
        "Please enter your relationship with the elderly member."
      );
      return;
    }

    try {
      setLoading(true);

      const elderly =
        await linkFamilyToElderly(
          linkCode,
          relationship
        );

      setLinkedElderly(elderly);

      Alert.alert(
        "Connected Successfully",
        `You are now connected with ${elderly.fullName}.`,
        [
          {
            text: "Open Dashboard",
            onPress: () => {
              router.replace("/family" as any);
            },
          },
        ]
      );
    } catch (error: any) {
      console.log(
        "Link elderly error:",
        error
      );

      Alert.alert(
        "Unable to Connect",
        error?.message ||
          "Could not connect to the elderly member."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // OPEN DASHBOARD AFTER SUCCESS
  // --------------------------------------------------

  function handleOpenDashboard() {
    router.replace("/family" as any);
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

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
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* BACK */}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.backText}>
              {"← Back"}
            </Text>
          </TouchableOpacity>

          {/* HERO ICON */}

          <View style={styles.heroIcon}>
            <Ionicons
              name="people-outline"
              size={42}
              color="#4A3FB5"
            />
          </View>

          {/* TITLE */}

          <Text style={styles.title}>
            Connect Your Loved One
          </Text>

          <Text style={styles.subtitle}>
            Enter the private family link code shown
            in the elderly member's Kindred Years
            profile.
          </Text>

          {/* SUCCESS CARD */}

          {linkedElderly ? (
            <View style={styles.successCard}>
              <View style={styles.successIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={42}
                  color="#2E9D63"
                />
              </View>

              <Text style={styles.successTitle}>
                Connection Successful
              </Text>

              <Text style={styles.successText}>
                You are now connected with
              </Text>

              <View style={styles.elderlyPreview}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {linkedElderly.fullName
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.elderlyInfo}>
                  <Text style={styles.elderlyName}>
                    {linkedElderly.fullName}
                  </Text>

                  {linkedElderly.email ? (
                    <Text
                      style={styles.elderlyDetail}
                    >
                      {linkedElderly.email}
                    </Text>
                  ) : null}

                  {linkedElderly.phone ? (
                    <Text
                      style={styles.elderlyDetail}
                    >
                      {linkedElderly.phone}
                    </Text>
                  ) : null}
                </View>
              </View>

              <TouchableOpacity
                style={styles.dashboardButton}
                onPress={handleOpenDashboard}
              >
                <Text
                  style={
                    styles.dashboardButtonText
                  }
                >
                  Open Family Dashboard
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* INFORMATION CARD */}

              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="information-circle-outline"
                    size={24}
                    color="#4A3FB5"
                  />
                </View>

                <Text style={styles.infoText}>
                  Ask the elderly member to open their
                  Profile page and share their Family
                  Link Code with you.
                </Text>
              </View>

              {/* FORM CARD */}

              <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                  Family Link Code
                </Text>

                <Text style={styles.formDescription}>
                  Enter the code exactly as shown in
                  the elderly member's profile.
                </Text>

                <Text style={styles.label}>
                  Link Code
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="key-outline"
                    size={21}
                    color="#77778A"
                  />

                  <TextInput
                    style={styles.codeInput}
                    placeholder="Example: KY-FFRX63"
                    placeholderTextColor="#9999A8"
                    value={linkCode}
                    onChangeText={
                      handleLinkCodeChange
                    }
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!loading}
                    maxLength={20}
                  />
                </View>

                <Text style={styles.label}>
                  Your Relationship
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="heart-outline"
                    size={21}
                    color="#77778A"
                  />

                  <TextInput
                    style={styles.normalInput}
                    placeholder="Example: Daughter"
                    placeholderTextColor="#9999A8"
                    value={relationship}
                    onChangeText={setRelationship}
                    editable={!loading}
                  />
                </View>

                {/* QUICK RELATIONSHIPS */}

                <Text style={styles.quickLabel}>
                  Quick Select
                </Text>

                <View style={styles.relationshipGrid}>
                  <RelationshipButton
                    label="Daughter"
                    selected={
                      relationship === "Daughter"
                    }
                    onPress={() =>
                      setRelationship("Daughter")
                    }
                  />

                  <RelationshipButton
                    label="Son"
                    selected={
                      relationship === "Son"
                    }
                    onPress={() =>
                      setRelationship("Son")
                    }
                  />

                  <RelationshipButton
                    label="Spouse"
                    selected={
                      relationship === "Spouse"
                    }
                    onPress={() =>
                      setRelationship("Spouse")
                    }
                  />

                  <RelationshipButton
                    label="Relative"
                    selected={
                      relationship === "Relative"
                    }
                    onPress={() =>
                      setRelationship("Relative")
                    }
                  />
                </View>

                {/* CONNECT BUTTON */}

                <TouchableOpacity
                  style={[
                    styles.connectButton,
                    loading &&
                      styles.disabledButton,
                  ]}
                  onPress={handleConnect}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="link-outline"
                        size={20}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.connectButtonText
                        }
                      >
                        Connect Elderly Member
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* HOW IT WORKS */}

              <Text style={styles.sectionTitle}>
                How It Works
              </Text>

              <View style={styles.stepsCard}>
                <StepItem
                  number="1"
                  title="Get the Link Code"
                  description="The elderly member shares the code from their profile."
                />

                <StepItem
                  number="2"
                  title="Enter the Code"
                  description="Enter the code here and select your relationship."
                />

                <StepItem
                  number="3"
                  title="Stay Connected"
                  description="View medicines, health updates, appointments and caregiver bookings."
                  isLast
                />
              </View>

              {/* PRIVACY */}

              <View style={styles.privacyCard}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={25}
                  color="#2E9D63"
                />

                <View style={styles.privacyTextArea}>
                  <Text style={styles.privacyTitle}>
                    Private Family Connection
                  </Text>

                  <Text style={styles.privacyText}>
                    Only share link codes with trusted
                    family members.
                  </Text>
                </View>
              </View>
            </>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --------------------------------------------------
// RELATIONSHIP BUTTON
// --------------------------------------------------

function RelationshipButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.relationshipButton,
        selected &&
          styles.selectedRelationshipButton,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.relationshipButtonText,
          selected &&
            styles.selectedRelationshipText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// --------------------------------------------------
// STEP ITEM
// --------------------------------------------------

function StepItem({
  number,
  title,
  description,
  isLast = false,
}: {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={[
        styles.stepItem,
        isLast && styles.lastStepItem,
      ]}
    >
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>
          {number}
        </Text>
      </View>

      <View style={styles.stepTextArea}>
        <Text style={styles.stepTitle}>
          {title}
        </Text>

        <Text style={styles.stepDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },

  flex: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 40,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingRight: 10,
    marginBottom: 18,
  },

  backText: {
    color: "#4A3FB5",
    fontSize: 16,
    fontWeight: "700",
  },

  heroIcon: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 31,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  subtitle: {
    fontSize: 15,
    color: "#666677",
    lineHeight: 23,
    marginTop: 9,
    marginBottom: 24,
  },

  infoCard: {
    backgroundColor: "#EEEAFE",
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  infoIcon: {
    marginRight: 10,
    marginTop: 1,
  },

  infoText: {
    flex: 1,
    color: "#514D72",
    fontSize: 13,
    lineHeight: 20,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 19,
    elevation: 3,
    marginBottom: 28,
  },

  formTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  formDescription: {
    color: "#77778A",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 20,
  },

  label: {
    color: "#303044",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  inputContainer: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: "#DDDCE8",
    borderRadius: 14,
    backgroundColor: "#FAFAFD",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 18,
  },

  codeInput: {
    flex: 1,
    minHeight: 54,
    color: "#1E1E2F",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 1,
    marginLeft: 10,
  },

  normalInput: {
    flex: 1,
    minHeight: 54,
    color: "#1E1E2F",
    fontSize: 15,
    marginLeft: 10,
  },

  quickLabel: {
    color: "#77778A",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },

  relationshipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  relationshipButton: {
    width: "48%",
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDDCE8",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  selectedRelationshipButton: {
    backgroundColor: "#EEEAFE",
    borderColor: "#4A3FB5",
  },

  relationshipButtonText: {
    color: "#666677",
    fontSize: 13,
    fontWeight: "700",
  },

  selectedRelationshipText: {
    color: "#4A3FB5",
  },

  connectButton: {
    height: 56,
    backgroundColor: "#4A3FB5",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E1E2F",
    marginBottom: 14,
  },

  stepsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 17,
    marginBottom: 20,
    elevation: 2,
  },

  stepItem: {
    flexDirection: "row",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFF5",
  },

  lastStepItem: {
    borderBottomWidth: 0,
  },

  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  stepNumberText: {
    color: "#4A3FB5",
    fontSize: 14,
    fontWeight: "900",
  },

  stepTextArea: {
    flex: 1,
  },

  stepTitle: {
    color: "#1E1E2F",
    fontSize: 14,
    fontWeight: "800",
  },

  stepDescription: {
    color: "#77778A",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  privacyCard: {
    backgroundColor: "#ECF8F1",
    borderRadius: 17,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  privacyTextArea: {
    flex: 1,
    marginLeft: 11,
  },

  privacyTitle: {
    color: "#247A4D",
    fontSize: 14,
    fontWeight: "800",
  },

  privacyText: {
    color: "#4C7660",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    elevation: 3,
  },

  successIcon: {
    marginBottom: 10,
  },

  successTitle: {
    color: "#1E1E2F",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  successText: {
    color: "#77778A",
    fontSize: 13,
    marginTop: 6,
  },

  elderlyPreview: {
    width: "100%",
    backgroundColor: "#F8F7FF",
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  avatarText: {
    color: "#4A3FB5",
    fontSize: 22,
    fontWeight: "900",
  },

  elderlyInfo: {
    flex: 1,
  },

  elderlyName: {
    color: "#1E1E2F",
    fontSize: 17,
    fontWeight: "800",
  },

  elderlyDetail: {
    color: "#77778A",
    fontSize: 12,
    marginTop: 3,
  },

  dashboardButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#4A3FB5",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  dashboardButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginRight: 8,
  },
});