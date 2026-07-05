import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "../../config/firebase";
import { getLinkedElderlyId } from "../services/linkedElderlyService";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type ElderlyProfile = {
  uid: string;
  fullName: string;
  email?: string;
  phone?: string;
  age?: number | string;
  bloodGroup?: string;
  city?: string;
};

type Medicine = {
  id: string;
  elderlyId: string;
  name: string;
  dosage: string;
  time: string;
  status: string;
};

type Appointment = {
  id: string;
  elderlyId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  consultationMode?: string;
};

type CaregiverBooking = {
  id: string;
  elderlyId: string;
  caregiverName: string;
  bookingDate?: string;
  bookingTime?: string;
  status: string;
};

type HealthUpdate = {
  id: string;
  elderlyId: string;

  systolic?: number | string;
  diastolic?: number | string;

  bloodPressure?: string;

  sugar?: number | string;
  bloodSugar?: number | string;

  weight?: number | string;
  bmi?: number | string;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

// --------------------------------------------------
// MAIN SCREEN
// --------------------------------------------------

export default function FamilyDashboardScreen() {
  const [elderlyId, setElderlyId] = useState("");

  const [elderlyProfile, setElderlyProfile] =
    useState<ElderlyProfile | null>(null);

  const [medicines, setMedicines] =
    useState<Medicine[]>([]);

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [caregiverBookings, setCaregiverBookings] =
    useState<CaregiverBooking[]>([]);

  const [healthUpdates, setHealthUpdates] =
    useState<HealthUpdate[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [reloadKey, setReloadKey] = useState(0);

  // --------------------------------------------------
  // FIND LINKED ELDERLY USER
  // --------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    async function initializeDashboard() {
      try {
        setLoading(true);
        setErrorMessage("");

        const currentUser = auth.currentUser;

        if (!currentUser) {
          throw new Error(
            "Family member is not signed in."
          );
        }

        const linkedId =
          await getLinkedElderlyId();

        if (!isMounted) {
          return;
        }

        setElderlyId(linkedId);
      } catch (error: any) {
        console.log(
          "Family dashboard initialization error:",
          error
        );

        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error?.message ||
            "Could not load the linked elderly member."
        );

        setLoading(false);
        setRefreshing(false);
      }
    }

    initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  // --------------------------------------------------
  // REAL-TIME LISTENERS
  // --------------------------------------------------

  useEffect(() => {
    if (!elderlyId) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    // -----------------------------------------
    // ELDERLY PROFILE
    // -----------------------------------------

    const unsubscribeProfile = onSnapshot(
      doc(db, "users", elderlyId),

      (snapshot) => {
        if (!snapshot.exists()) {
          setElderlyProfile(null);

          setErrorMessage(
            "The linked elderly profile was not found."
          );

          setLoading(false);
          setRefreshing(false);

          return;
        }

        const data = snapshot.data();

        setElderlyProfile({
          uid: snapshot.id,

          fullName:
            data.fullName ||
            "Elderly Member",

          email:
            data.email || "",

          phone:
            data.phone || "",

          age:
            data.age || "",

          bloodGroup:
            data.bloodGroup || "",

          city:
            data.city || "",
        });

        setLoading(false);
        setRefreshing(false);
      },

      (error) => {
        console.log(
          "Elderly profile listener error:",
          error
        );

        setErrorMessage(
          "Could not load the elderly profile."
        );

        setLoading(false);
        setRefreshing(false);
      }
    );

    // -----------------------------------------
    // MEDICINES
    // -----------------------------------------

    const medicinesQuery = query(
      collection(db, "medicines"),
      where(
        "elderlyId",
        "==",
        elderlyId
      )
    );

    const unsubscribeMedicines = onSnapshot(
      medicinesQuery,

      (snapshot) => {
        const loadedMedicines: Medicine[] =
          snapshot.docs.map((medicineDoc) => {
            const data = medicineDoc.data();

            return {
              id: medicineDoc.id,

              elderlyId:
                data.elderlyId || "",

              name:
                data.name ||
                data.medicineName ||
                "Medicine",

              dosage:
                data.dosage ||
                "Not specified",

              time:
                data.time ||
                data.medicineTime ||
                "Not specified",

              status:
                data.status ||
                "pending",
            };
          });

        loadedMedicines.sort((a, b) =>
          a.time.localeCompare(b.time)
        );

        setMedicines(loadedMedicines);
      },

      (error) => {
        console.log(
          "Medicines listener error:",
          error
        );
      }
    );

    // -----------------------------------------
    // DOCTOR APPOINTMENTS
    // -----------------------------------------

    const appointmentsQuery = query(
      collection(
        db,
        "doctorAppointments"
      ),
      where(
        "elderlyId",
        "==",
        elderlyId
      )
    );

    const unsubscribeAppointments =
      onSnapshot(
        appointmentsQuery,

        (snapshot) => {
          const loadedAppointments: Appointment[] =
            snapshot.docs.map(
              (appointmentDoc) => {
                const data =
                  appointmentDoc.data();

                return {
                  id: appointmentDoc.id,

                  elderlyId:
                    data.elderlyId || "",

                  doctorName:
                    data.doctorName ||
                    "Doctor",

                  appointmentDate:
                    data.appointmentDate ||
                    data.date ||
                    "Date not available",

                  appointmentTime:
                    data.appointmentTime ||
                    data.time ||
                    "Time not available",

                  status:
                    data.status ||
                    "pending",

                  consultationMode:
                    data.consultationMode ||
                    "",
                };
              }
            );

          setAppointments(
            loadedAppointments
          );
        },

        (error) => {
          console.log(
            "Appointments listener error:",
            error
          );
        }
      );

    // -----------------------------------------
    // CAREGIVER BOOKINGS
    // -----------------------------------------

    const caregiverQuery = query(
      collection(
        db,
        "caregiverBookings"
      ),
      where(
        "elderlyId",
        "==",
        elderlyId
      )
    );

    const unsubscribeCaregivers =
      onSnapshot(
        caregiverQuery,

        (snapshot) => {
          const loadedBookings: CaregiverBooking[] =
            snapshot.docs.map(
              (bookingDoc) => {
                const data =
                  bookingDoc.data();

                return {
                  id: bookingDoc.id,

                  elderlyId:
                    data.elderlyId || "",

                  caregiverName:
                    data.caregiverName ||
                    "Caregiver",

                  bookingDate:
                    data.bookingDate ||
                    data.date ||
                    "",

                  bookingTime:
                    data.bookingTime ||
                    data.time ||
                    "",

                  status:
                    data.status ||
                    "pending",
                };
              }
            );

          setCaregiverBookings(
            loadedBookings
          );
        },

        (error) => {
          console.log(
            "Caregiver listener error:",
            error
          );
        }
      );

    // -----------------------------------------
    // HEALTH UPDATES
    // -----------------------------------------

    const healthQuery = query(
      collection(
        db,
        "healthUpdates"
      ),
      where(
        "elderlyId",
        "==",
        elderlyId
      )
    );

    const unsubscribeHealth =
      onSnapshot(
        healthQuery,

        (snapshot) => {
          const loadedHealth: HealthUpdate[] =
            snapshot.docs.map(
              (healthDoc) => {
                const data =
                  healthDoc.data();

                return {
                  id: healthDoc.id,

                  elderlyId:
                    data.elderlyId || "",

                  systolic:
                    data.systolic,

                  diastolic:
                    data.diastolic,

                  bloodPressure:
                    data.bloodPressure,

                  sugar:
                    data.sugar,

                  bloodSugar:
                    data.bloodSugar,

                  weight:
                    data.weight,

                  bmi:
                    data.bmi,

                  createdAt:
                    data.createdAt,

                  updatedAt:
                    data.updatedAt,
                };
              }
            );

          loadedHealth.sort((a, b) => {
            const aTime =
              a.updatedAt?.toMillis?.() ||
              a.createdAt?.toMillis?.() ||
              0;

            const bTime =
              b.updatedAt?.toMillis?.() ||
              b.createdAt?.toMillis?.() ||
              0;

            return bTime - aTime;
          });

          setHealthUpdates(
            loadedHealth
          );
        },

        (error) => {
          console.log(
            "Health listener error:",
            error
          );
        }
      );

    // -----------------------------------------
    // CLEANUP
    // -----------------------------------------

    return () => {
      unsubscribeProfile();
      unsubscribeMedicines();
      unsubscribeAppointments();
      unsubscribeCaregivers();
      unsubscribeHealth();
    };
  }, [elderlyId]);

  // --------------------------------------------------
  // COMPUTED DATA
  // --------------------------------------------------

  const latestHealth =
    healthUpdates.length > 0
      ? healthUpdates[0]
      : null;

  const pendingMedicines = useMemo(
    () =>
      medicines.filter(
        (medicine) =>
          medicine.status === "pending"
      ).length,
    [medicines]
  );

  const takenMedicines = useMemo(
    () =>
      medicines.filter(
        (medicine) =>
          medicine.status === "taken"
      ).length,
    [medicines]
  );

  const missedMedicines = useMemo(
    () =>
      medicines.filter(
        (medicine) =>
          medicine.status === "missed" ||
          medicine.status === "skipped"
      ).length,
    [medicines]
  );

  const pendingAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status === "pending"
      ).length,
    [appointments]
  );

  const activeCaregiverBookings = useMemo(
    () =>
      caregiverBookings.filter(
        (booking) =>
          booking.status === "pending" ||
          booking.status === "accepted" ||
          booking.status === "approved"
      ).length,
    [caregiverBookings]
  );

  // --------------------------------------------------
  // HEALTH HELPERS
  // --------------------------------------------------

  function getBloodPressure() {
    if (!latestHealth) {
      return "--";
    }

    if (
      latestHealth.systolic &&
      latestHealth.diastolic
    ) {
      return `${latestHealth.systolic}/${latestHealth.diastolic}`;
    }

    return (
      latestHealth.bloodPressure ||
      "--"
    );
  }

  function getSugar() {
    if (!latestHealth) {
      return "--";
    }

    return String(
      latestHealth.sugar ??
        latestHealth.bloodSugar ??
        "--"
    );
  }

  function getWeight() {
    if (
      !latestHealth ||
      latestHealth.weight === undefined ||
      latestHealth.weight === null ||
      latestHealth.weight === ""
    ) {
      return "--";
    }

    return `${latestHealth.weight} kg`;
  }

  function getBMI() {
    if (
      !latestHealth ||
      latestHealth.bmi === undefined ||
      latestHealth.bmi === null ||
      latestHealth.bmi === ""
    ) {
      return "--";
    }

    return String(latestHealth.bmi);
  }

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------

  function handleRefresh() {
    setRefreshing(true);
    setElderlyId("");
    setReloadKey((previous) => previous + 1);
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading && !elderlyProfile) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.centerContainer}
        >
          <ActivityIndicator
            size="large"
            color="#4A3FB5"
          />

          <Text style={styles.loadingText}>
            Loading family dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------
  // ERROR / NO LINK
  // --------------------------------------------------

  if (errorMessage && !elderlyProfile) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.centerContainer}
        >
          <View style={styles.errorIcon}>
            <Ionicons
              name="link-outline"
              size={42}
              color="#4A3FB5"
            />
          </View>

          <Text style={styles.errorTitle}>
            Elderly Member Not Connected
          </Text>

          <Text style={styles.errorText}>
            {errorMessage}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.replace(
                "/family/link-elderly" as any
              )
            }
          >
            <Text
              style={styles.primaryButtonText}
            >
              Connect Elderly Member
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------
  // MAIN DASHBOARD
  // --------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4A3FB5"
          />
        }
      >
        {/* HEADER */}

        <View style={styles.headerRow}>
          <View style={styles.headerTextArea}>
            <Text style={styles.smallHeading}>
              FAMILY DASHBOARD
            </Text>

            <Text style={styles.title}>
              Connected Care
            </Text>

            <Text style={styles.subtitle}>
              Stay updated with your loved
              one's care, health and schedule.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() =>
              router.push(
                "/family/profile" as any
              )
            }
          >
            <Ionicons
              name="person-outline"
              size={24}
              color="#4A3FB5"
            />
          </TouchableOpacity>
        </View>

        {/* LINKED ELDERLY CARD */}

        <View style={styles.elderlyCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {elderlyProfile?.fullName
                ?.charAt(0)
                .toUpperCase() || "E"}
            </Text>
          </View>

          <View style={styles.elderlyInfo}>
            <Text style={styles.connectedLabel}>
              CONNECTED ELDERLY MEMBER
            </Text>

            <Text style={styles.elderlyName}>
              {elderlyProfile?.fullName ||
                "Elderly Member"}
            </Text>

            <View style={styles.profileMetaRow}>
              {elderlyProfile?.age ? (
                <Text style={styles.profileMeta}>
                  {elderlyProfile.age} years
                </Text>
              ) : null}

              {elderlyProfile?.bloodGroup ? (
                <Text style={styles.profileMeta}>
                  {elderlyProfile.bloodGroup}
                </Text>
              ) : null}

              {elderlyProfile?.city ? (
                <Text style={styles.profileMeta}>
                  {elderlyProfile.city}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              Live
            </Text>
          </View>
        </View>

        {/* QUICK SUMMARY */}

        <Text style={styles.sectionTitle}>
          Today's Overview
        </Text>

        <View style={styles.overviewGrid}>
          <OverviewCard
            icon="medical-outline"
            value={String(
              medicines.length
            )}
            label="Medicines"
            detail={`${pendingMedicines} pending`}
            onPress={() =>
              router.push(
                "/family/medicine" as any
              )
            }
          />

          <OverviewCard
            icon="calendar-outline"
            value={String(
              appointments.length
            )}
            label="Appointments"
            detail={`${pendingAppointments} pending`}
            onPress={() =>
              router.push(
                "/family/appointments" as any
              )
            }
          />

          <OverviewCard
            icon="people-outline"
            value={String(
              caregiverBookings.length
            )}
            label="Caregiver"
            detail={`${activeCaregiverBookings} active`}
            onPress={() =>
              router.push(
                "/family/caregiver" as any
              )
            }
          />

          <OverviewCard
            icon="heart-outline"
            value={String(
              healthUpdates.length
            )}
            label="Health Logs"
            detail={
              latestHealth
                ? "Latest available"
                : "No updates"
            }
            onPress={() =>
              router.push(
                "/family/health" as any
              )
            }
          />
        </View>

        {/* MEDICINE STATUS */}

        <Text style={styles.sectionTitle}>
          Medicine Status
        </Text>

        <TouchableOpacity
          style={styles.statusCard}
          activeOpacity={0.8}
          onPress={() =>
            router.push(
              "/family/medicine" as any
            )
          }
        >
          <StatusItem
            number={takenMedicines}
            label="Taken"
            icon="checkmark-circle"
            iconColor="#2E9D63"
          />

          <View style={styles.statusDivider} />

          <StatusItem
            number={pendingMedicines}
            label="Pending"
            icon="time"
            iconColor="#E59A2F"
          />

          <View style={styles.statusDivider} />

          <StatusItem
            number={missedMedicines}
            label="Missed"
            icon="close-circle"
            iconColor="#D9534F"
          />
        </TouchableOpacity>

        {/* LATEST HEALTH */}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Latest Health Update
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                "/family/health" as any
              )
            }
          >
            <Text style={styles.viewAllText}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.healthCard}>
          <HealthMetric
            icon="heart-outline"
            label="Blood Pressure"
            value={getBloodPressure()}
            unit={
              getBloodPressure() !== "--"
                ? "mmHg"
                : ""
            }
          />

          <HealthMetric
            icon="water-outline"
            label="Blood Sugar"
            value={getSugar()}
            unit={
              getSugar() !== "--"
                ? "mg/dL"
                : ""
            }
          />

          <HealthMetric
            icon="scale-outline"
            label="Weight"
            value={getWeight()}
            unit=""
          />

          <HealthMetric
            icon="analytics-outline"
            label="BMI"
            value={getBMI()}
            unit=""
            isLast
          />
        </View>

        {/* QUICK ACTIONS */}

        <Text style={styles.sectionTitle}>
          Quick Access
        </Text>

        <View style={styles.actionList}>
          <ActionCard
            icon="medical-outline"
            title="Medicine Schedule"
            subtitle="View medicines and status"
            onPress={() =>
              router.push(
                "/family/medicine" as any
              )
            }
          />

          <ActionCard
            icon="calendar-outline"
            title="Doctor Appointments"
            subtitle="Track appointment status"
            onPress={() =>
              router.push(
                "/family/appointments" as any
              )
            }
          />

          <ActionCard
            icon="people-outline"
            title="Caregiver Bookings"
            subtitle="View caregiver visits"
            onPress={() =>
              router.push(
                "/family/caregiver" as any
              )
            }
          />

          <ActionCard
            icon="heart-outline"
            title="Health Updates"
            subtitle="BP, sugar, weight and BMI"
            onPress={() =>
              router.push(
                "/family/health" as any
              )
            }
          />

          <ActionCard
            icon="document-text-outline"
            title="Medical Reports"
            subtitle="View uploaded medical reports"
            onPress={() =>
              router.push(
                "/family/reports" as any
              )
            }
          />
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --------------------------------------------------
// OVERVIEW CARD
// --------------------------------------------------

function OverviewCard({
  icon,
  value,
  label,
  detail,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.overviewCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.overviewIcon}>
        <Ionicons
          name={icon}
          size={23}
          color="#4A3FB5"
        />
      </View>

      <Text style={styles.overviewValue}>
        {value}
      </Text>

      <Text style={styles.overviewLabel}>
        {label}
      </Text>

      <Text style={styles.overviewDetail}>
        {detail}
      </Text>
    </TouchableOpacity>
  );
}

// --------------------------------------------------
// STATUS ITEM
// --------------------------------------------------

function StatusItem({
  number,
  label,
  icon,
  iconColor,
}: {
  number: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}) {
  return (
    <View style={styles.statusItem}>
      <Ionicons
        name={icon}
        size={22}
        color={iconColor}
      />

      <Text style={styles.statusNumber}>
        {number}
      </Text>

      <Text style={styles.statusLabel}>
        {label}
      </Text>
    </View>
  );
}

// --------------------------------------------------
// HEALTH METRIC
// --------------------------------------------------

function HealthMetric({
  icon,
  label,
  value,
  unit,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={[
        styles.healthMetric,
        isLast && styles.lastHealthMetric,
      ]}
    >
      <View style={styles.healthIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#4A3FB5"
        />
      </View>

      <View style={styles.healthTextArea}>
        <Text style={styles.healthLabel}>
          {label}
        </Text>

        <View style={styles.healthValueRow}>
          <Text style={styles.healthValue}>
            {value}
          </Text>

          {unit ? (
            <Text style={styles.healthUnit}>
              {unit}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// --------------------------------------------------
// ACTION CARD
// --------------------------------------------------

function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        <Ionicons
          name={icon}
          size={24}
          color="#4A3FB5"
        />
      </View>

      <View style={styles.actionTextArea}>
        <Text style={styles.actionTitle}>
          {title}
        </Text>

        <Text style={styles.actionSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={21}
        color="#9999A8"
      />
    </TouchableOpacity>
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

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  loadingText: {
    marginTop: 14,
    color: "#666677",
    fontSize: 15,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  headerTextArea: {
    flex: 1,
    paddingRight: 12,
  },

  smallHeading: {
    color: "#4A3FB5",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  title: {
    fontSize: 31,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  subtitle: {
    fontSize: 14,
    color: "#666677",
    lineHeight: 21,
    marginTop: 7,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  elderlyCard: {
    backgroundColor: "#4A3FB5",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    elevation: 3,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  avatarText: {
    color: "#4A3FB5",
    fontSize: 23,
    fontWeight: "900",
  },

  elderlyInfo: {
    flex: 1,
  },

  connectedLabel: {
    color: "#DCD8FF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  elderlyName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },

  profileMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },

  profileMeta: {
    color: "#E6E3FF",
    fontSize: 11,
    marginRight: 10,
    marginTop: 2,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#8EF0B5",
    marginRight: 5,
  },

  liveText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E1E2F",
    marginBottom: 14,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },

  viewAllText: {
    color: "#4A3FB5",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 14,
  },

  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  overviewCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    elevation: 2,
  },

  overviewIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  overviewValue: {
    color: "#1E1E2F",
    fontSize: 25,
    fontWeight: "900",
  },

  overviewLabel: {
    color: "#303044",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },

  overviewDetail: {
    color: "#888899",
    fontSize: 11,
    marginTop: 5,
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    elevation: 2,
  },

  statusItem: {
    flex: 1,
    alignItems: "center",
  },

  statusDivider: {
    width: 1,
    height: 52,
    backgroundColor: "#ECEBF3",
  },

  statusNumber: {
    color: "#1E1E2F",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 5,
  },

  statusLabel: {
    color: "#77778A",
    fontSize: 11,
    marginTop: 2,
  },

  healthCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 28,
    elevation: 2,
  },

  healthMetric: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFF5",
  },

  lastHealthMetric: {
    borderBottomWidth: 0,
  },

  healthIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  healthTextArea: {
    flex: 1,
  },

  healthLabel: {
    color: "#77778A",
    fontSize: 12,
    fontWeight: "600",
  },

  healthValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 3,
  },

  healthValue: {
    color: "#1E1E2F",
    fontSize: 18,
    fontWeight: "800",
  },

  healthUnit: {
    color: "#888899",
    fontSize: 11,
    marginLeft: 5,
  },

  actionList: {
    marginBottom: 10,
  },

  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  actionTextArea: {
    flex: 1,
  },

  actionTitle: {
    color: "#1E1E2F",
    fontSize: 15,
    fontWeight: "800",
  },

  actionSubtitle: {
    color: "#888899",
    fontSize: 11,
    marginTop: 4,
  },

  errorIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  errorTitle: {
    color: "#1E1E2F",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  errorText: {
    color: "#666677",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },

  primaryButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#4A3FB5",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  retryButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 6,
  },

  retryText: {
    color: "#4A3FB5",
    fontSize: 14,
    fontWeight: "700",
  },
});