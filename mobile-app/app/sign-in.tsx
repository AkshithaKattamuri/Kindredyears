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

import { useTranslation } from "react-i18next";

import { auth, db } from "../config/firebase";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type LanguageCode = "en" | "te" | "ta" | "hi" | "fr";

type Language = {
  code: LanguageCode;
  name: string;
  nativeName: string;
  shortName: string;
};

const languages: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    shortName: "EN",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    shortName: "తె",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    shortName: "த",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    shortName: "हि",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    shortName: "FR",
  },
];

export default function SignInScreen() {
  const { t, i18n } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const [languageModalVisible, setLanguageModalVisible] =
    useState(false);

  const currentLanguageCode =
    (i18n.resolvedLanguage ||
      i18n.language ||
      "en") as LanguageCode;

  const selectedLanguage =
    languages.find(
      (language) =>
        language.code === currentLanguageCode
    ) || languages[0];

  async function handleLanguageChange(
    languageCode: LanguageCode
  ) {
    try {
      await i18n.changeLanguage(languageCode);

      setLanguageModalVisible(false);
    } catch (error) {
      console.log(
        "LANGUAGE CHANGE ERROR:",
        error
      );

      Alert.alert(
        "Language Error",
        "Unable to change language. Please try again."
      );
    }
  }

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        t("auth.missingDetails", {
          defaultValue: "Missing Details",
        }),
        t("auth.enterEmailPassword", {
          defaultValue:
            "Please enter your email and password.",
        })
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
          t("auth.profileNotFound", {
            defaultValue: "Profile Not Found",
          }),
          t("auth.profileNotFoundMessage", {
            defaultValue:
              "Your Kindred Years profile was not found.",
          })
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
            t("auth.verificationPending", {
              defaultValue:
                "Verification Pending",
            }),
            t(
              "auth.caregiverVerificationPending",
              {
                defaultValue:
                  "Your caregiver account is waiting for admin approval.",
              }
            )
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
            t("auth.verificationPending", {
              defaultValue:
                "Verification Pending",
            }),
            t(
              "auth.doctorVerificationPending",
              {
                defaultValue:
                  "Your doctor account is waiting for admin approval.",
              }
            )
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
        t("auth.invalidRole", {
          defaultValue: "Invalid Role",
        }),
        t("auth.invalidRoleMessage", {
          defaultValue:
            "Your account role could not be recognized.",
        })
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
          t("auth.signInFailed", {
            defaultValue: "Sign In Failed",
          }),
          t("auth.invalidEmailPassword", {
            defaultValue:
              "Invalid email or password.",
          })
        );
      } else if (
        errorCode === "auth/network-request-failed"
      ) {
        Alert.alert(
          t("auth.networkError", {
            defaultValue: "Network Error",
          }),
          t("auth.checkInternet", {
            defaultValue:
              "Please check your internet connection.",
          })
        );
      } else if (
        errorCode === "auth/too-many-requests"
      ) {
        Alert.alert(
          t("auth.tooManyAttempts", {
            defaultValue: "Too Many Attempts",
          }),
          t("auth.tryAgainLater", {
            defaultValue:
              "Please wait a while and try again.",
          })
        );
      } else {
        Alert.alert(
          t("auth.signInFailed", {
            defaultValue: "Sign In Failed",
          }),
          error?.message ||
            t("auth.somethingWentWrong", {
              defaultValue:
                "Something went wrong. Please try again.",
            })
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
          {/* Top navigation */}
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={signingIn}
            >
              <Text style={styles.backText}>
                {`< ${t("common.back", {
                  defaultValue: "Back",
                })}`}
              </Text>
            </TouchableOpacity>

            {/* Language selector */}
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() =>
                setLanguageModalVisible(true)
              }
              disabled={signingIn}
              activeOpacity={0.8}
            >
              <Text style={styles.globeText}>
                🌐
              </Text>

              <Text
                style={styles.languageButtonText}
                numberOfLines={1}
              >
                {selectedLanguage.nativeName}
              </Text>

              <Text style={styles.chevronText}>
                ▼
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>
              {t("auth.welcomeBack", {
                defaultValue: "Welcome Back",
              })}
            </Text>

            <Text style={styles.subtitle}>
              {t("auth.signInSubtitle", {
                defaultValue:
                  "Sign in to continue to Kindred Years",
              })}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>
              {t("auth.email", {
                defaultValue: "Email Address",
              })}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={t(
                "auth.enterEmail",
                {
                  defaultValue:
                    "Enter your email",
                }
              )}
              placeholderTextColor="#9999A8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!signingIn}
            />

            <Text style={styles.label}>
              {t("auth.password", {
                defaultValue: "Password",
              })}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={t(
                "auth.enterPassword",
                {
                  defaultValue:
                    "Enter your password",
                }
              )}
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
                {t("auth.forgotPassword", {
                  defaultValue:
                    "Forgot Password?",
                })}
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
                  style={
                    styles.signInButtonText
                  }
                >
                  {t("auth.signIn", {
                    defaultValue: "Sign In",
                  })}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t("auth.noAccount", {
                defaultValue:
                  "Don't have an account?",
              })}{" "}
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push("/sign-up" as any)
              }
              disabled={signingIn}
            >
              <Text style={styles.createText}>
                {t("auth.createAccount", {
                  defaultValue:
                    "Create Account",
                })}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Language selection modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setLanguageModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() =>
              setLanguageModalVisible(false)
            }
          />

          <View style={styles.languageModal}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Choose Language
                </Text>

                <Text style={styles.modalSubtitle}>
                  Select your preferred language
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setLanguageModalVisible(false)
                }
              >
                <Text style={styles.closeText}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {languages.map((language) => {
                const isSelected =
                  selectedLanguage.code ===
                  language.code;

                return (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageOption,
                      isSelected &&
                        styles.selectedLanguageOption,
                    ]}
                    onPress={() =>
                      handleLanguageChange(
                        language.code
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.languageIcon,
                        isSelected &&
                          styles.selectedLanguageIcon,
                      ]}
                    >
                      <Text
                        style={[
                          styles.languageIconText,
                          isSelected &&
                            styles.selectedLanguageIconText,
                        ]}
                      >
                        {language.shortName}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.languageTextContainer
                      }
                    >
                      <Text
                        style={[
                          styles.languageNativeName,
                          isSelected &&
                            styles.selectedLanguageText,
                        ]}
                      >
                        {language.nativeName}
                      </Text>

                      {language.nativeName !==
                        language.name && (
                        <Text
                          style={
                            styles.languageEnglishName
                          }
                        >
                          {language.name}
                        </Text>
                      )}
                    </View>

                    {isSelected && (
                      <View
                        style={styles.checkCircle}
                      >
                        <Text
                          style={styles.checkText}
                        >
                          ✓
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
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

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  languageButton: {
    maxWidth: 155,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E4E1F2",
  },

  globeText: {
    fontSize: 16,
    marginRight: 6,
  },

  languageButtonText: {
    flexShrink: 1,
    fontSize: 13,
    color: "#1E1E2F",
    fontWeight: "700",
  },

  chevronText: {
    marginLeft: 6,
    fontSize: 9,
    color: "#6B6B7A",
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
    flexWrap: "wrap",
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

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 18, 40, 0.48)",
  },

  languageModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom:
      Platform.OS === "ios" ? 34 : 24,
  },

  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DDD9EA",
    alignSelf: "center",
    marginBottom: 20,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  modalSubtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#777586",
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F1FA",
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    fontSize: 16,
    color: "#514F60",
    fontWeight: "700",
  },

  languageList: {
    gap: 10,
  },

  languageOption: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8E5F0",
    backgroundColor: "#FFFFFF",
  },

  selectedLanguageOption: {
    borderColor: "#4A3FB5",
    backgroundColor: "#F4F2FF",
  },

  languageIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#F1EFF8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  selectedLanguageIcon: {
    backgroundColor: "#4A3FB5",
  },

  languageIconText: {
    fontSize: 14,
    color: "#4A3FB5",
    fontWeight: "800",
  },

  selectedLanguageIconText: {
    color: "#FFFFFF",
  },

  languageTextContainer: {
    flex: 1,
  },

  languageNativeName: {
    fontSize: 16,
    color: "#1E1E2F",
    fontWeight: "700",
  },

  selectedLanguageText: {
    color: "#4A3FB5",
  },

  languageEnglishName: {
    marginTop: 3,
    fontSize: 12,
    color: "#858292",
  },

  checkCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#4A3FB5",
    alignItems: "center",
    justifyContent: "center",
  },

  checkText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});