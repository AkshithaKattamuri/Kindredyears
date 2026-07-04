import { router } from "expo-router";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../../config/firebase";

type ElderlyProfile = {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  linkCode: string;

  age?: string;
  gender?: string;
  bloodGroup?: string;

  address?: string;
  city?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelationship?: string;

  medicalConditions?: string;
  allergies?: string;

  verificationStatus?: string;
};

export default function ElderlyProfileScreen() {
  const [profile, setProfile] =
    useState<ElderlyProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  // --------------------------------------------------
  // EDIT FORM STATES
  // --------------------------------------------------

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [age, setAge] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [bloodGroup, setBloodGroup] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [
    emergencyContactName,
    setEmergencyContactName,
  ] = useState("");

  const [
    emergencyContactPhone,
    setEmergencyContactPhone,
  ] = useState("");

  const [
    emergencyRelationship,
    setEmergencyRelationship,
  ] = useState("");

  const [
    medicalConditions,
    setMedicalConditions,
  ] = useState("");

  const [allergies, setAllergies] =
    useState("");

  // --------------------------------------------------
  // LOAD PROFILE IN REAL TIME
  // --------------------------------------------------

  useEffect(() => {
    let unsubscribeProfile:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {
          if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = undefined;
          }

          if (!user) {
            setProfile(null);
            setLoading(false);

            router.replace("/sign-in");
            return;
          }

          setLoading(true);

          const userRef = doc(
            db,
            "users",
            user.uid
          );

          unsubscribeProfile =
            onSnapshot(
              userRef,
              (snapshot) => {
                if (!snapshot.exists()) {
                  setProfile(null);
                  setLoading(false);

                  Alert.alert(
                    "Profile Not Found",
                    "Your profile document was not found."
                  );

                  return;
                }

                const data = snapshot.data();

                const loadedProfile: ElderlyProfile = {
                  uid:
                    data.uid ||
                    snapshot.id,

                  fullName:
                    data.fullName || "",

                  email:
                    data.email ||
                    user.email ||
                    "",

                  phone:
                    data.phone || "",

                  role:
                    data.role || "",

                  linkCode:
                    data.linkCode || "",

                  age:
                    data.age?.toString() || "",

                  gender:
                    data.gender || "",

                  bloodGroup:
                    data.bloodGroup || "",

                  address:
                    data.address || "",

                  city:
                    data.city || "",

                  emergencyContactName:
                    data.emergencyContactName || "",

                  emergencyContactPhone:
                    data.emergencyContactPhone || "",

                  emergencyRelationship:
                    data.emergencyRelationship || "",

                  medicalConditions:
                    data.medicalConditions || "",

                  allergies:
                    data.allergies || "",

                  verificationStatus:
                    data.verificationStatus || "",
                };

                setProfile(loadedProfile);
                setLoading(false);
              },
              (error) => {
                console.log(
                  "Profile listener error:",
                  error
                );

                setLoading(false);

                Alert.alert(
                  "Unable to Load Profile",
                  "Could not load your profile."
                );
              }
            );
        }
      );

    return () => {
      unsubscribeAuth();

      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  // --------------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------------

  function openEditProfile() {
    if (!profile) {
      return;
    }

    setFullName(
      profile.fullName || ""
    );

    setPhone(
      profile.phone || ""
    );

    setAge(
      profile.age || ""
    );

    setGender(
      profile.gender || ""
    );

    setBloodGroup(
      profile.bloodGroup || ""
    );

    setAddress(
      profile.address || ""
    );

    setCity(
      profile.city || ""
    );

    setEmergencyContactName(
      profile.emergencyContactName || ""
    );

    setEmergencyContactPhone(
      profile.emergencyContactPhone || ""
    );

    setEmergencyRelationship(
      profile.emergencyRelationship || ""
    );

    setMedicalConditions(
      profile.medicalConditions || ""
    );

    setAllergies(
      profile.allergies || ""
    );

    setShowEditModal(true);
  }

  // --------------------------------------------------
  // SAVE PROFILE
  // --------------------------------------------------

  async function handleSaveProfile() {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Not Signed In",
        "Please sign in again."
      );
      return;
    }

    if (!fullName.trim()) {
      Alert.alert(
        "Name Required",
        "Please enter your full name."
      );
      return;
    }

    if (!phone.trim()) {
      Alert.alert(
        "Phone Required",
        "Please enter your phone number."
      );
      return;
    }

    if (
      age.trim() &&
      (
        Number.isNaN(Number(age)) ||
        Number(age) <= 0 ||
        Number(age) > 120
      )
    ) {
      Alert.alert(
        "Invalid Age",
        "Please enter a valid age."
      );
      return;
    }

    try {
      setSaving(true);

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      await updateDoc(
        userRef,
        {
          fullName:
            fullName.trim(),

          phone:
            phone.trim(),

          age:
            age.trim()
              ? Number(age)
              : null,

          gender:
            gender.trim() || null,

          bloodGroup:
            bloodGroup.trim() || null,

          address:
            address.trim() || null,

          city:
            city.trim() || null,

          emergencyContactName:
            emergencyContactName.trim() ||
            null,

          emergencyContactPhone:
            emergencyContactPhone.trim() ||
            null,

          emergencyRelationship:
            emergencyRelationship.trim() ||
            null,

          medicalConditions:
            medicalConditions.trim() ||
            null,

          allergies:
            allergies.trim() ||
            null,

          updatedAt:
            serverTimestamp(),
        }
      );

      setShowEditModal(false);

      Alert.alert(
        "Profile Updated",
        "Your profile was updated successfully."
      );
    } catch (error: any) {
      console.log(
        "Update profile error:",
        error
      );

      Alert.alert(
        "Update Failed",
        error?.message ||
          "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // SHARE LINK CODE
  // --------------------------------------------------

  async function handleShareLinkCode() {
    if (!profile?.linkCode) {
      Alert.alert(
        "Link Code Missing",
        "No family link code is available."
      );
      return;
    }

    try {
      await Share.share({
        message:
          `Connect with me on Kindred Years.\n\n` +
          `My family link code is: ${profile.linkCode}\n\n` +
          `Enter this code after signing in as a family member.`,
      });
    } catch (error) {
      console.log(
        "Share link code error:",
        error
      );
    }
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  function handleLogout() {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: performLogout,
        },
      ]
    );
  }

  async function performLogout() {
    try {
      setLoggingOut(true);

      await signOut(auth);

      router.replace("/sign-in");
    } catch (error: any) {
      console.log(
        "Logout error:",
        error
      );

      Alert.alert(
        "Sign Out Failed",
        error?.message ||
          "Could not sign out."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  // --------------------------------------------------
  // LOADING UI
  // --------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color="#4A3FB5"
          />

          <Text style={styles.loadingText}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------
  // PROFILE NOT FOUND UI
  // --------------------------------------------------

  if (!profile) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.loadingContainer}
        >
          <Text style={styles.emptyTitle}>
            Profile not found
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.replace("/sign-in")
            }
          >
            <Text
              style={styles.primaryButtonText}
            >
              Return to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              {"< Back"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={false}
        >
          {/* PROFILE HERO */}

          <View style={styles.profileHero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.fullName
                  .charAt(0)
                  .toUpperCase() || "E"}
              </Text>
            </View>

            <Text style={styles.profileName}>
              {profile.fullName}
            </Text>

            <Text style={styles.profileEmail}>
              {profile.email}
            </Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                Elderly Member
              </Text>
            </View>
          </View>

          {/* EDIT PROFILE */}

          <TouchableOpacity
            style={styles.editButton}
            onPress={openEditProfile}
          >
            <Text style={styles.editButtonText}>
              Edit Profile
            </Text>
          </TouchableOpacity>

          {/* FAMILY LINK CODE */}

          <Text style={styles.sectionTitle}>
            Family Connection
          </Text>

          <View style={styles.linkCodeCard}>
            <Text style={styles.linkCodeLabel}>
              Your Family Link Code
            </Text>

            {profile.linkCode ? (
              <>
                <Text style={styles.linkCode}>
                  {profile.linkCode}
                </Text>

                <Text
                  style={styles.linkCodeHelp}
                >
                  Share this code only with trusted
                  family members.
                </Text>

                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShareLinkCode}
                >
                  <Text
                    style={
                      styles.shareButtonText
                    }
                  >
                    Share Link Code
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text
                style={styles.noLinkCodeText}
              >
                No link code is available for
                this account.
              </Text>
            )}
          </View>

          {/* PERSONAL DETAILS */}

          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <View style={styles.infoCard}>
            <ProfileRow
              label="Full Name"
              value={profile.fullName}
            />

            <ProfileRow
              label="Email"
              value={profile.email}
            />

            <ProfileRow
              label="Phone"
              value={
                profile.phone ||
                "Not added"
              }
            />

            <ProfileRow
              label="Age"
              value={
                profile.age
                  ? `${profile.age} years`
                  : "Not added"
              }
            />

            <ProfileRow
              label="Gender"
              value={
                profile.gender ||
                "Not added"
              }
            />

            <ProfileRow
              label="Blood Group"
              value={
                profile.bloodGroup ||
                "Not added"
              }
              isLast
            />
          </View>

          {/* ADDRESS */}

          <Text style={styles.sectionTitle}>
            Address
          </Text>

          <View style={styles.infoCard}>
            <ProfileRow
              label="Address"
              value={
                profile.address ||
                "Not added"
              }
            />

            <ProfileRow
              label="City"
              value={
                profile.city ||
                "Not added"
              }
              isLast
            />
          </View>

          {/* EMERGENCY CONTACT */}

          <Text style={styles.sectionTitle}>
            Emergency Contact
          </Text>

          <View style={styles.infoCard}>
            <ProfileRow
              label="Contact Name"
              value={
                profile.emergencyContactName ||
                "Not added"
              }
            />

            <ProfileRow
              label="Phone Number"
              value={
                profile.emergencyContactPhone ||
                "Not added"
              }
            />

            <ProfileRow
              label="Relationship"
              value={
                profile.emergencyRelationship ||
                "Not added"
              }
              isLast
            />
          </View>

          {/* MEDICAL INFORMATION */}

          <Text style={styles.sectionTitle}>
            Medical Information
          </Text>

          <View style={styles.infoCard}>
            <ProfileRow
              label="Medical Conditions"
              value={
                profile.medicalConditions ||
                "None added"
              }
            />

            <ProfileRow
              label="Allergies"
              value={
                profile.allergies ||
                "None added"
              }
              isLast
            />
          </View>

          {/* ACCOUNT */}

          <Text style={styles.sectionTitle}>
            Account
          </Text>

          <View style={styles.infoCard}>
            <ProfileRow
              label="Role"
              value="Elderly"
            />

            <ProfileRow
              label="Verification"
              value={
                profile.verificationStatus ||
                "approved"
              }
              isLast
            />
          </View>

          {/* LOGOUT */}

          <TouchableOpacity
            style={[
              styles.logoutButton,
              loggingOut &&
                styles.disabledButton,
            ]}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator
                color="#D9534F"
              />
            ) : (
              <Text
                style={styles.logoutButtonText}
              >
                Sign Out
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* EDIT PROFILE MODAL */}

        <Modal
          visible={showEditModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            if (!saving) {
              setShowEditModal(false);
            }
          }}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : undefined
            }
          >
            <View style={styles.modalCard}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={styles.modalTitle}
                    >
                      Edit Profile
                    </Text>

                    <Text
                      style={
                        styles.modalSubtitle
                      }
                    >
                      Update your personal and
                      medical information
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      if (!saving) {
                        setShowEditModal(false);
                      }
                    }}
                    disabled={saving}
                  >
                    <Text
                      style={
                        styles.closeButtonText
                      }
                    >
                      X
                    </Text>
                  </TouchableOpacity>
                </View>

                <FormLabel text="Full Name" />

                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  placeholderTextColor="#9999A8"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <FormLabel text="Phone Number" />

                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  placeholderTextColor="#9999A8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />

                <FormLabel text="Age" />

                <TextInput
                  style={styles.input}
                  placeholder="Enter age"
                  placeholderTextColor="#9999A8"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />

                <FormLabel text="Gender" />

                <TextInput
                  style={styles.input}
                  placeholder="Example: Female"
                  placeholderTextColor="#9999A8"
                  value={gender}
                  onChangeText={setGender}
                />

                <FormLabel text="Blood Group" />

                <TextInput
                  style={styles.input}
                  placeholder="Example: O+"
                  placeholderTextColor="#9999A8"
                  autoCapitalize="characters"
                  value={bloodGroup}
                  onChangeText={setBloodGroup}
                />

                <FormLabel text="Address" />

                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                  placeholder="Enter address"
                  placeholderTextColor="#9999A8"
                  multiline
                  textAlignVertical="top"
                  value={address}
                  onChangeText={setAddress}
                />

                <FormLabel text="City" />

                <TextInput
                  style={styles.input}
                  placeholder="Enter city"
                  placeholderTextColor="#9999A8"
                  value={city}
                  onChangeText={setCity}
                />

                <Text
                  style={styles.formSectionTitle}
                >
                  Emergency Contact
                </Text>

                <FormLabel text="Contact Name" />

                <TextInput
                  style={styles.input}
                  placeholder="Emergency contact name"
                  placeholderTextColor="#9999A8"
                  value={emergencyContactName}
                  onChangeText={
                    setEmergencyContactName
                  }
                />

                <FormLabel text="Contact Phone" />

                <TextInput
                  style={styles.input}
                  placeholder="Emergency phone number"
                  placeholderTextColor="#9999A8"
                  keyboardType="phone-pad"
                  value={emergencyContactPhone}
                  onChangeText={
                    setEmergencyContactPhone
                  }
                />

                <FormLabel text="Relationship" />

                <TextInput
                  style={styles.input}
                  placeholder="Example: Daughter"
                  placeholderTextColor="#9999A8"
                  value={emergencyRelationship}
                  onChangeText={
                    setEmergencyRelationship
                  }
                />

                <Text
                  style={styles.formSectionTitle}
                >
                  Medical Information
                </Text>

                <FormLabel text="Medical Conditions" />

                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                  placeholder="Example: Diabetes, Hypertension"
                  placeholderTextColor="#9999A8"
                  multiline
                  textAlignVertical="top"
                  value={medicalConditions}
                  onChangeText={
                    setMedicalConditions
                  }
                />

                <FormLabel text="Allergies" />

                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                  placeholder="Enter known allergies"
                  placeholderTextColor="#9999A8"
                  multiline
                  textAlignVertical="top"
                  value={allergies}
                  onChangeText={setAllergies}
                />

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    saving &&
                      styles.disabledButton,
                  ]}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.saveButtonText
                      }
                    >
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() =>
                    !saving &&
                    setShowEditModal(false)
                  }
                  disabled={saving}
                >
                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// --------------------------------------------------
// PROFILE ROW
// --------------------------------------------------

function ProfileRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={[
        styles.profileRow,
        isLast && styles.lastProfileRow,
      ]}
    >
      <Text style={styles.profileRowLabel}>
        {label}
      </Text>

      <Text style={styles.profileRowValue}>
        {value}
      </Text>
    </View>
  );
}

// --------------------------------------------------
// FORM LABEL
// --------------------------------------------------

function FormLabel({
  text,
}: {
  text: string;
}) {
  return (
    <Text style={styles.label}>
      {text}
    </Text>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FC",
  },

  screen: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingRight: 10,
  },

  backText: {
    color: "#4A3FB5",
    fontSize: 16,
    fontWeight: "700",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  loadingText: {
    color: "#77778A",
    fontSize: 14,
    marginTop: 12,
  },

  emptyTitle: {
    fontSize: 20,
    color: "#1E1E2F",
    fontWeight: "800",
    marginBottom: 20,
  },

  profileHero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 2,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  avatarText: {
    color: "#4A3FB5",
    fontSize: 34,
    fontWeight: "900",
  },

  profileName: {
    fontSize: 24,
    color: "#1E1E2F",
    fontWeight: "900",
    textAlign: "center",
  },

  profileEmail: {
    fontSize: 13,
    color: "#77778A",
    marginTop: 5,
    textAlign: "center",
  },

  roleBadge: {
    backgroundColor: "#EEEAFE",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginTop: 12,
  },

  roleBadgeText: {
    color: "#4A3FB5",
    fontSize: 11,
    fontWeight: "800",
  },

  editButton: {
    height: 54,
    backgroundColor: "#4A3FB5",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 28,
  },

  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  sectionTitle: {
    fontSize: 19,
    color: "#1E1E2F",
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 4,
  },

  linkCodeCard: {
    backgroundColor: "#EEEAFE",
    borderRadius: 20,
    padding: 20,
    marginBottom: 26,
  },

  linkCodeLabel: {
    color: "#666677",
    fontSize: 12,
    fontWeight: "700",
  },

  linkCode: {
    color: "#4A3FB5",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 8,
  },

  linkCodeHelp: {
    color: "#666677",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  noLinkCodeText: {
    color: "#77778A",
    fontSize: 13,
    marginTop: 8,
  },

  shareButton: {
    height: 48,
    backgroundColor: "#4A3FB5",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },

  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 25,
    elevation: 2,
  },

  profileRow: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFF5",
  },

  lastProfileRow: {
    borderBottomWidth: 0,
  },

  profileRowLabel: {
    color: "#888899",
    fontSize: 11,
    fontWeight: "700",
  },

  profileRowValue: {
    color: "#303044",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 5,
    lineHeight: 20,
  },

  primaryButton: {
    height: 54,
    minWidth: 200,
    backgroundColor: "#4A3FB5",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  logoutButton: {
    height: 56,
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#F2CACA",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  logoutButtonText: {
    color: "#D9534F",
    fontSize: 16,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(20,20,35,0.45)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "92%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  modalTitle: {
    fontSize: 24,
    color: "#1E1E2F",
    fontWeight: "900",
  },

  modalSubtitle: {
    fontSize: 12,
    color: "#77778A",
    marginTop: 4,
    lineHeight: 18,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F1F8",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  closeButtonText: {
    color: "#55556A",
    fontSize: 14,
    fontWeight: "800",
  },

  formSectionTitle: {
    fontSize: 18,
    color: "#1E1E2F",
    fontWeight: "900",
    marginTop: 8,
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    color: "#303044",
    fontWeight: "700",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    minHeight: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDCE8",
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#1E1E2F",
    marginBottom: 18,
  },

  textArea: {
    minHeight: 95,
    paddingTop: 14,
    paddingBottom: 14,
  },

  saveButton: {
    height: 56,
    backgroundColor: "#4A3FB5",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  cancelButton: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  cancelButtonText: {
    color: "#77778A",
    fontSize: 14,
    fontWeight: "700",
  },
});