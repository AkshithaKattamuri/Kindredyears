import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
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

import { auth, db } from "../../config/firebase";

type HealthUpdate = {
  id: string;
  elderlyId: string;
  systolicBP: number;
  diastolicBP: number;
  bloodSugar: number;
  sugarType: "fasting" | "post-meal" | "random";
  weight: number;
  height: number;
  bmi: number;
  notes?: string | null;
  checkedByName?: string | null;
  checkedByRole?: string | null;
  recordedAt?: Timestamp;
};

type MedicalReport = {
  id: string;
  elderlyId: string;
  reportName: string;
  reportType: string;
  hospitalName?: string | null;
  doctorName?: string | null;
  reportDate: string;
  findings?: string | null;
  notes?: string | null;
  createdAt?: Timestamp;
};

type SugarType =
  | "fasting"
  | "post-meal"
  | "random";

export default function HealthUpdatesScreen() {
  const [healthUpdates, setHealthUpdates] =
    useState<HealthUpdate[]>([]);

  const [medicalReports, setMedicalReports] =
    useState<MedicalReport[]>([]);

  const [loading, setLoading] = useState(true);

  const [showHealthModal, setShowHealthModal] =
    useState(false);

  const [showReportModal, setShowReportModal] =
    useState(false);

  const [savingHealth, setSavingHealth] =
    useState(false);

  const [savingReport, setSavingReport] =
    useState(false);

  // HEALTH FORM
  const [systolicBP, setSystolicBP] =
    useState("");

  const [diastolicBP, setDiastolicBP] =
    useState("");

  const [bloodSugar, setBloodSugar] =
    useState("");

  const [sugarType, setSugarType] =
    useState<SugarType>("random");

  const [weight, setWeight] =
    useState("");

  const [height, setHeight] =
    useState("");

  const [healthNotes, setHealthNotes] =
    useState("");

  const [checkedByName, setCheckedByName] =
    useState("");

  // REPORT FORM
  const [reportName, setReportName] =
    useState("");

  const [reportType, setReportType] =
    useState("");

  const [hospitalName, setHospitalName] =
    useState("");

  const [doctorName, setDoctorName] =
    useState("");

  const [reportDate, setReportDate] =
    useState("");

  const [findings, setFindings] =
    useState("");

  const [reportNotes, setReportNotes] =
    useState("");

  // --------------------------------------------------
  // BMI CALCULATION
  // --------------------------------------------------

  const calculatedBMI = useMemo(() => {
    const weightNumber =
      Number(weight);

    const heightNumber =
      Number(height);

    if (
      !weightNumber ||
      !heightNumber ||
      weightNumber <= 0 ||
      heightNumber <= 0
    ) {
      return null;
    }

    const heightInMeters =
      heightNumber / 100;

    const bmi =
      weightNumber /
      (heightInMeters * heightInMeters);

    return Number(bmi.toFixed(1));
  }, [weight, height]);

  // --------------------------------------------------
  // LOAD HEALTH UPDATES + REPORTS
  // --------------------------------------------------

  useEffect(() => {
    let unsubscribeHealth:
      | (() => void)
      | undefined;

    let unsubscribeReports:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {
          if (unsubscribeHealth) {
            unsubscribeHealth();
          }

          if (unsubscribeReports) {
            unsubscribeReports();
          }

          if (!user) {
            setHealthUpdates([]);
            setMedicalReports([]);
            setLoading(false);

            router.replace("/sign-in");
            return;
          }

          setLoading(true);

          const healthQuery = query(
            collection(db, "healthUpdates"),
            where(
              "elderlyId",
              "==",
              user.uid
            )
          );

          unsubscribeHealth =
            onSnapshot(
              healthQuery,
              (snapshot) => {
                const updates =
                  snapshot.docs.map(
                    (healthDoc) => {
                      const data =
                        healthDoc.data();

                      return {
                        id: healthDoc.id,
                        elderlyId:
                          data.elderlyId || "",
                        systolicBP:
                          data.systolicBP || 0,
                        diastolicBP:
                          data.diastolicBP || 0,
                        bloodSugar:
                          data.bloodSugar || 0,
                        sugarType:
                          data.sugarType ||
                          "random",
                        weight:
                          data.weight || 0,
                        height:
                          data.height || 0,
                        bmi:
                          data.bmi || 0,
                        notes:
                          data.notes || null,
                        checkedByName:
                          data.checkedByName ||
                          null,
                        checkedByRole:
                          data.checkedByRole ||
                          null,
                        recordedAt:
                          data.recordedAt,
                      } as HealthUpdate;
                    }
                  );

                updates.sort((a, b) => {
                  const aTime =
                    a.recordedAt
                      ?.toMillis?.() ?? 0;

                  const bTime =
                    b.recordedAt
                      ?.toMillis?.() ?? 0;

                  return bTime - aTime;
                });

                setHealthUpdates(updates);
                setLoading(false);
              },
              (error) => {
                console.log(
                  "Health listener error:",
                  error
                );

                setLoading(false);
              }
            );

          const reportsQuery = query(
            collection(
              db,
              "medicalReports"
            ),
            where(
              "elderlyId",
              "==",
              user.uid
            )
          );

          unsubscribeReports =
            onSnapshot(
              reportsQuery,
              (snapshot) => {
                const reports =
                  snapshot.docs.map(
                    (reportDoc) => {
                      const data =
                        reportDoc.data();

                      return {
                        id: reportDoc.id,
                        elderlyId:
                          data.elderlyId || "",
                        reportName:
                          data.reportName ||
                          "Medical Report",
                        reportType:
                          data.reportType ||
                          "General",
                        hospitalName:
                          data.hospitalName ||
                          null,
                        doctorName:
                          data.doctorName ||
                          null,
                        reportDate:
                          data.reportDate ||
                          "",
                        findings:
                          data.findings ||
                          null,
                        notes:
                          data.notes ||
                          null,
                        createdAt:
                          data.createdAt,
                      } as MedicalReport;
                    }
                  );

                reports.sort((a, b) => {
                  const aTime =
                    a.createdAt
                      ?.toMillis?.() ?? 0;

                  const bTime =
                    b.createdAt
                      ?.toMillis?.() ?? 0;

                  return bTime - aTime;
                });

                setMedicalReports(reports);
              },
              (error) => {
                console.log(
                  "Reports listener error:",
                  error
                );
              }
            );
        }
      );

    return () => {
      unsubscribeAuth();

      if (unsubscribeHealth) {
        unsubscribeHealth();
      }

      if (unsubscribeReports) {
        unsubscribeReports();
      }
    };
  }, []);

  // --------------------------------------------------
  // SAVE HEALTH UPDATE
  // --------------------------------------------------

  async function handleSaveHealthUpdate() {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Not Signed In",
        "Please sign in again."
      );
      return;
    }

    const systolic =
      Number(systolicBP);

    const diastolic =
      Number(diastolicBP);

    const sugar =
      Number(bloodSugar);

    const weightNumber =
      Number(weight);

    const heightNumber =
      Number(height);

    if (
      !systolic ||
      !diastolic ||
      !sugar ||
      !weightNumber ||
      !heightNumber
    ) {
      Alert.alert(
        "Missing Details",
        "Please enter BP, sugar, weight and height."
      );
      return;
    }

    if (!calculatedBMI) {
      Alert.alert(
        "Invalid BMI",
        "Please enter valid weight and height."
      );
      return;
    }

    try {
      setSavingHealth(true);

      await addDoc(
        collection(
          db,
          "healthUpdates"
        ),
        {
          elderlyId: user.uid,

          systolicBP: systolic,

          diastolicBP: diastolic,

          bloodSugar: sugar,

          sugarType,

          weight: weightNumber,

          height: heightNumber,

          bmi: calculatedBMI,

          notes:
            healthNotes.trim() ||
            null,

          checkedByName:
            checkedByName.trim() ||
            null,

          // For now this is manually entered
          // from the elderly-side page.
          checkedByRole:
            checkedByName.trim()
              ? "caregiver"
              : null,

          recordedAt:
            serverTimestamp(),

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      resetHealthForm();

      setShowHealthModal(false);

      Alert.alert(
        "Health Update Saved",
        "The health readings were saved successfully."
      );
    } catch (error: any) {
      console.log(
        "Save health update error:",
        error
      );

      Alert.alert(
        "Save Failed",
        error?.message ||
          "Could not save health update."
      );
    } finally {
      setSavingHealth(false);
    }
  }

  // --------------------------------------------------
  // SAVE MEDICAL REPORT
  // --------------------------------------------------

  async function handleSaveMedicalReport() {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Not Signed In",
        "Please sign in again."
      );
      return;
    }

    if (
      !reportName.trim() ||
      !reportType.trim() ||
      !reportDate.trim()
    ) {
      Alert.alert(
        "Missing Details",
        "Please enter report name, type and report date."
      );
      return;
    }

    try {
      setSavingReport(true);

      await addDoc(
        collection(
          db,
          "medicalReports"
        ),
        {
          elderlyId: user.uid,

          reportName:
            reportName.trim(),

          reportType:
            reportType.trim(),

          hospitalName:
            hospitalName.trim() ||
            null,

          doctorName:
            doctorName.trim() ||
            null,

          reportDate:
            reportDate.trim(),

          findings:
            findings.trim() ||
            null,

          notes:
            reportNotes.trim() ||
            null,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      resetReportForm();

      setShowReportModal(false);

      Alert.alert(
        "Report Added",
        "The medical report was saved successfully."
      );
    } catch (error: any) {
      console.log(
        "Save report error:",
        error
      );

      Alert.alert(
        "Save Failed",
        error?.message ||
          "Could not save the medical report."
      );
    } finally {
      setSavingReport(false);
    }
  }

  // --------------------------------------------------
  // RESET FORMS
  // --------------------------------------------------

  function resetHealthForm() {
    setSystolicBP("");
    setDiastolicBP("");
    setBloodSugar("");
    setSugarType("random");
    setWeight("");
    setHeight("");
    setHealthNotes("");
    setCheckedByName("");
  }

  function resetReportForm() {
    setReportName("");
    setReportType("");
    setHospitalName("");
    setDoctorName("");
    setReportDate("");
    setFindings("");
    setReportNotes("");
  }

  // --------------------------------------------------
  // DATE DISPLAY
  // --------------------------------------------------

  function formatTimestamp(
    timestamp?: Timestamp
  ) {
    if (!timestamp?.toDate) {
      return "Just now";
    }

    return timestamp
      .toDate()
      .toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
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
          <Text style={styles.title}>
            Health Updates
          </Text>

          <Text style={styles.subtitle}>
            Record health readings after a
            caregiver visit and maintain medical
            reports.
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() =>
                setShowHealthModal(true)
              }
            >
              <Text
                style={
                  styles.primaryActionText
                }
              >
                + Add Health Update
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() =>
                setShowReportModal(true)
              }
            >
              <Text
                style={
                  styles.secondaryActionText
                }
              >
                + Add Report
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator
                size="large"
                color="#4A3FB5"
              />

              <Text style={styles.loadingText}>
                Loading health records...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.sectionRow}>
                <Text
                  style={styles.sectionTitle}
                >
                  Recent Health Readings
                </Text>

                <View style={styles.countBadge}>
                  <Text
                    style={styles.countText}
                  >
                    {healthUpdates.length}
                  </Text>
                </View>
              </View>

              {healthUpdates.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text
                    style={styles.emptyTitle}
                  >
                    No health readings yet
                  </Text>

                  <Text
                    style={styles.emptyText}
                  >
                    Add readings after BP, sugar,
                    weight and height are checked.
                  </Text>
                </View>
              ) : (
                healthUpdates.map(
                  (update) => (
                    <View
                      key={update.id}
                      style={
                        styles.healthCard
                      }
                    >
                      <View
                        style={
                          styles.cardHeader
                        }
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={
                              styles.cardTitle
                            }
                          >
                            Health Check
                          </Text>

                          <Text
                            style={
                              styles.cardDate
                            }
                          >
                            {formatTimestamp(
                              update.recordedAt
                            )}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.bmiBadge
                          }
                        >
                          <Text
                            style={
                              styles.bmiBadgeLabel
                            }
                          >
                            BMI
                          </Text>

                          <Text
                            style={
                              styles.bmiBadgeValue
                            }
                          >
                            {update.bmi}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.metricsGrid
                        }
                      >
                        <MetricBox
                          label="Blood Pressure"
                          value={`${update.systolicBP}/${update.diastolicBP}`}
                          unit="mmHg"
                        />

                        <MetricBox
                          label="Blood Sugar"
                          value={`${update.bloodSugar}`}
                          unit="mg/dL"
                        />

                        <MetricBox
                          label="Weight"
                          value={`${update.weight}`}
                          unit="kg"
                        />

                        <MetricBox
                          label="Height"
                          value={`${update.height}`}
                          unit="cm"
                        />
                      </View>

                      <Text
                        style={
                          styles.sugarTypeText
                        }
                      >
                        Sugar reading:{" "}
                        {update.sugarType ===
                        "post-meal"
                          ? "Post Meal"
                          : update.sugarType ===
                            "fasting"
                          ? "Fasting"
                          : "Random"}
                      </Text>

                      {update.checkedByName ? (
                        <View
                          style={
                            styles.checkedByBox
                          }
                        >
                          <Text
                            style={
                              styles.checkedByLabel
                            }
                          >
                            Checked by
                          </Text>

                          <Text
                            style={
                              styles.checkedByValue
                            }
                          >
                            {
                              update.checkedByName
                            }
                          </Text>
                        </View>
                      ) : null}

                      {update.notes ? (
                        <Text
                          style={
                            styles.notesText
                          }
                        >
                          Notes: {update.notes}
                        </Text>
                      ) : null}
                    </View>
                  )
                )
              )}

              <View style={styles.sectionRow}>
                <Text
                  style={styles.sectionTitle}
                >
                  Medical Reports
                </Text>

                <View style={styles.countBadge}>
                  <Text
                    style={styles.countText}
                  >
                    {medicalReports.length}
                  </Text>
                </View>
              </View>

              {medicalReports.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text
                    style={styles.emptyTitle}
                  >
                    No medical reports
                  </Text>

                  <Text
                    style={styles.emptyText}
                  >
                    Add report details and findings
                    manually.
                  </Text>
                </View>
              ) : (
                medicalReports.map(
                  (report) => (
                    <View
                      key={report.id}
                      style={
                        styles.reportCard
                      }
                    >
                      <View
                        style={
                          styles.reportIcon
                        }
                      >
                        <Text
                          style={
                            styles.reportIconText
                          }
                        >
                          R
                        </Text>
                      </View>

                      <View
                        style={
                          styles.reportContent
                        }
                      >
                        <Text
                          style={
                            styles.reportName
                          }
                        >
                          {report.reportName}
                        </Text>

                        <Text
                          style={
                            styles.reportType
                          }
                        >
                          {report.reportType}
                        </Text>

                        <Text
                          style={
                            styles.reportMeta
                          }
                        >
                          Report Date:{" "}
                          {report.reportDate}
                        </Text>

                        {report.hospitalName ? (
                          <Text
                            style={
                              styles.reportMeta
                            }
                          >
                            Hospital:{" "}
                            {
                              report.hospitalName
                            }
                          </Text>
                        ) : null}

                        {report.doctorName ? (
                          <Text
                            style={
                              styles.reportMeta
                            }
                          >
                            Doctor:{" "}
                            {report.doctorName}
                          </Text>
                        ) : null}

                        {report.findings ? (
                          <View
                            style={
                              styles.findingsBox
                            }
                          >
                            <Text
                              style={
                                styles.findingsLabel
                              }
                            >
                              Findings
                            </Text>

                            <Text
                              style={
                                styles.findingsText
                              }
                            >
                              {report.findings}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  )
                )
              )}
            </>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* HEALTH UPDATE MODAL */}

        <Modal
          visible={showHealthModal}
          transparent
          animationType="slide"
          onRequestClose={() =>
            !savingHealth &&
            setShowHealthModal(false)
          }
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
                <ModalHeader
                  title="Add Health Update"
                  subtitle="Enter readings after the health check"
                  onClose={() =>
                    !savingHealth &&
                    setShowHealthModal(false)
                  }
                />

                <Text style={styles.label}>
                  Blood Pressure
                </Text>

                <View style={styles.twoColumnRow}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.halfInput,
                    ]}
                    placeholder="Systolic"
                    placeholderTextColor="#9999A8"
                    keyboardType="numeric"
                    value={systolicBP}
                    onChangeText={setSystolicBP}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      styles.halfInput,
                    ]}
                    placeholder="Diastolic"
                    placeholderTextColor="#9999A8"
                    keyboardType="numeric"
                    value={diastolicBP}
                    onChangeText={setDiastolicBP}
                  />
                </View>

                <Text style={styles.label}>
                  Blood Sugar (mg/dL)
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Example: 110"
                  placeholderTextColor="#9999A8"
                  keyboardType="numeric"
                  value={bloodSugar}
                  onChangeText={setBloodSugar}
                />

                <Text style={styles.label}>
                  Sugar Reading Type
                </Text>

                <View style={styles.optionRow}>
                  <OptionButton
                    label="Fasting"
                    selected={
                      sugarType === "fasting"
                    }
                    onPress={() =>
                      setSugarType("fasting")
                    }
                  />

                  <OptionButton
                    label="Post Meal"
                    selected={
                      sugarType ===
                      "post-meal"
                    }
                    onPress={() =>
                      setSugarType(
                        "post-meal"
                      )
                    }
                  />

                  <OptionButton
                    label="Random"
                    selected={
                      sugarType === "random"
                    }
                    onPress={() =>
                      setSugarType("random")
                    }
                  />
                </View>

                <Text style={styles.label}>
                  Weight (kg)
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Example: 68"
                  placeholderTextColor="#9999A8"
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={setWeight}
                />

                <Text style={styles.label}>
                  Height (cm)
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Example: 165"
                  placeholderTextColor="#9999A8"
                  keyboardType="decimal-pad"
                  value={height}
                  onChangeText={setHeight}
                />

                <View style={styles.bmiCard}>
                  <Text style={styles.bmiLabel}>
                    Calculated BMI
                  </Text>

                  <Text style={styles.bmiValue}>
                    {calculatedBMI ?? "--"}
                  </Text>
                </View>

                <Text style={styles.label}>
                  Caregiver Name
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Who checked these readings?"
                  placeholderTextColor="#9999A8"
                  value={checkedByName}
                  onChangeText={setCheckedByName}
                />

                <Text style={styles.label}>
                  Notes
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                  placeholder="Add observations or notes"
                  placeholderTextColor="#9999A8"
                  multiline
                  textAlignVertical="top"
                  value={healthNotes}
                  onChangeText={setHealthNotes}
                />

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    savingHealth &&
                      styles.disabledButton,
                  ]}
                  onPress={
                    handleSaveHealthUpdate
                  }
                  disabled={savingHealth}
                >
                  {savingHealth ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.saveButtonText
                      }
                    >
                      Save Health Update
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* MEDICAL REPORT MODAL */}

        <Modal
          visible={showReportModal}
          transparent
          animationType="slide"
          onRequestClose={() =>
            !savingReport &&
            setShowReportModal(false)
          }
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
                <ModalHeader
                  title="Add Medical Report"
                  subtitle="Enter report information manually"
                  onClose={() =>
                    !savingReport &&
                    setShowReportModal(false)
                  }
                />

                <Text style={styles.label}>
                  Report Name
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Example: Complete Blood Test"
                  placeholderTextColor="#9999A8"
                  value={reportName}
                  onChangeText={setReportName}
                />

                <Text style={styles.label}>
                  Report Type
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Example: Blood Test"
                  placeholderTextColor="#9999A8"
                  value={reportType}
                  onChangeText={setReportType}
                />

                <Text style={styles.label}>
                  Report Date
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Example: 05-07-2026"
                  placeholderTextColor="#9999A8"
                  value={reportDate}
                  onChangeText={setReportDate}
                />

                <Text style={styles.label}>
                  Hospital / Lab
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Optional"
                  placeholderTextColor="#9999A8"
                  value={hospitalName}
                  onChangeText={setHospitalName}
                />

                <Text style={styles.label}>
                  Doctor Name
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Optional"
                  placeholderTextColor="#9999A8"
                  value={doctorName}
                  onChangeText={setDoctorName}
                />

                <Text style={styles.label}>
                  Findings
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                  placeholder="Enter important findings"
                  placeholderTextColor="#9999A8"
                  multiline
                  textAlignVertical="top"
                  value={findings}
                  onChangeText={setFindings}
                />

                <Text style={styles.label}>
                  Additional Notes
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                  placeholder="Optional notes"
                  placeholderTextColor="#9999A8"
                  multiline
                  textAlignVertical="top"
                  value={reportNotes}
                  onChangeText={setReportNotes}
                />

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    savingReport &&
                      styles.disabledButton,
                  ]}
                  onPress={
                    handleSaveMedicalReport
                  }
                  disabled={savingReport}
                >
                  {savingReport ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.saveButtonText
                      }
                    >
                      Save Medical Report
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function MetricBox({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>
        {label}
      </Text>

      <Text style={styles.metricValue}>
        {value}
      </Text>

      <Text style={styles.metricUnit}>
        {unit}
      </Text>
    </View>
  );
}

function OptionButton({
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
        styles.optionButton,
        selected &&
          styles.selectedOptionButton,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionButtonText,
          selected &&
            styles.selectedOptionText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.modalHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.modalTitle}>
          {title}
        </Text>

        <Text style={styles.modalSubtitle}>
          {subtitle}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeButtonText}>
          X
        </Text>
      </TouchableOpacity>
    </View>
  );
}

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

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  subtitle: {
    fontSize: 14,
    color: "#77778A",
    lineHeight: 21,
    marginTop: 7,
    marginBottom: 20,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },

  primaryAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#4A3FB5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },

  secondaryAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  secondaryActionText: {
    color: "#4A3FB5",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },

  loadingBox: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#77778A",
    marginTop: 12,
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  countBadge: {
    minWidth: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 7,
  },

  countText: {
    color: "#4A3FB5",
    fontSize: 12,
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,
    elevation: 2,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  emptyText: {
    fontSize: 13,
    color: "#77778A",
    lineHeight: 19,
    marginTop: 6,
  },

  healthCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    marginBottom: 16,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  cardDate: {
    fontSize: 12,
    color: "#888899",
    marginTop: 4,
  },

  bmiBadge: {
    backgroundColor: "#EEEAFE",
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 8,
    alignItems: "center",
  },

  bmiBadgeLabel: {
    fontSize: 9,
    color: "#77778A",
    fontWeight: "700",
  },

  bmiBadgeValue: {
    fontSize: 17,
    color: "#4A3FB5",
    fontWeight: "900",
    marginTop: 2,
  },

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },

  metricBox: {
    width: "48%",
    backgroundColor: "#F8F7FF",
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },

  metricLabel: {
    fontSize: 10,
    color: "#888899",
    fontWeight: "700",
  },

  metricValue: {
    fontSize: 19,
    color: "#303044",
    fontWeight: "900",
    marginTop: 5,
  },

  metricUnit: {
    fontSize: 10,
    color: "#888899",
    marginTop: 2,
  },

  sugarTypeText: {
    fontSize: 12,
    color: "#666677",
    fontWeight: "600",
    marginTop: 3,
  },

  checkedByBox: {
    backgroundColor: "#EEF8F2",
    borderRadius: 13,
    padding: 12,
    marginTop: 12,
  },

  checkedByLabel: {
    fontSize: 10,
    color: "#77778A",
    fontWeight: "700",
  },

  checkedByValue: {
    fontSize: 13,
    color: "#2D9D5C",
    fontWeight: "800",
    marginTop: 3,
  },

  notesText: {
    fontSize: 12,
    color: "#666677",
    lineHeight: 18,
    marginTop: 12,
  },

  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    elevation: 2,
  },

  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  reportIconText: {
    color: "#4A3FB5",
    fontSize: 18,
    fontWeight: "900",
  },

  reportContent: {
    flex: 1,
  },

  reportName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  reportType: {
    fontSize: 12,
    color: "#4A3FB5",
    fontWeight: "700",
    marginTop: 4,
  },

  reportMeta: {
    fontSize: 12,
    color: "#77778A",
    marginTop: 5,
  },

  findingsBox: {
    backgroundColor: "#F8F7FF",
    borderRadius: 12,
    padding: 11,
    marginTop: 10,
  },

  findingsLabel: {
    fontSize: 10,
    color: "#888899",
    fontWeight: "700",
  },

  findingsText: {
    fontSize: 12,
    color: "#55556A",
    lineHeight: 18,
    marginTop: 4,
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
    marginBottom: 22,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  modalSubtitle: {
    fontSize: 12,
    color: "#77778A",
    marginTop: 4,
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
    fontWeight: "800",
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#303044",
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

  twoColumnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  halfInput: {
    width: "48%",
  },

  optionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },

  optionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDDCE8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  selectedOptionButton: {
    backgroundColor: "#4A3FB5",
    borderColor: "#4A3FB5",
  },

  optionButtonText: {
    color: "#4A3FB5",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  selectedOptionText: {
    color: "#FFFFFF",
  },

  bmiCard: {
    backgroundColor: "#EEEAFE",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  bmiLabel: {
    fontSize: 12,
    color: "#666677",
    fontWeight: "700",
  },

  bmiValue: {
    fontSize: 27,
    color: "#4A3FB5",
    fontWeight: "900",
    marginTop: 4,
  },

  textArea: {
    minHeight: 100,
    paddingTop: 14,
    paddingBottom: 14,
  },

  saveButton: {
    height: 56,
    backgroundColor: "#4A3FB5",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },
});