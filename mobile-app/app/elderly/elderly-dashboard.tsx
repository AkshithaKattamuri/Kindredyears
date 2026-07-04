import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../../config/firebase";

type UserProfile = {
  fullName?: string;
  role?: string;
};

type Medicine = {
  id: string;
  userId?: string;
  name?: string;
  dosage?: string;
  time?: string;
  status?: "pending" | "taken" | "skipped";
};

type AppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

type Appointment = {
  id: string;
  elderlyId?: string;
  doctorId?: string;
  doctorName?: string;
  specialization?: string | null;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentDateTime?: Timestamp;
  consultationMode?: "video" | "in-person";
  reason?: string;
  status?: AppointmentStatus;
};

type FeatureCardProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export default function ElderlyDashboard() {
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [medicines, setMedicines] =
    useState<Medicine[]>([]);

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [loadingMedicines, setLoadingMedicines] =
    useState(true);

  const [loadingAppointments, setLoadingAppointments] =
    useState(true);

  // --------------------------------------------------
  // LOAD ELDERLY PROFILE
  // --------------------------------------------------

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setProfile(null);
          setLoadingProfile(false);
          router.replace("/sign-in");
          return;
        }

        try {
          setLoadingProfile(true);

          const userSnapshot = await getDoc(
            doc(db, "users", user.uid)
          );

          if (!userSnapshot.exists()) {
            Alert.alert(
              "Profile Not Found",
              "Your Kindred Years profile was not found."
            );

            setLoadingProfile(false);
            return;
          }

          const userData =
            userSnapshot.data() as UserProfile;

          if (userData.role !== "elderly") {
            Alert.alert(
              "Access Denied",
              "This dashboard is only available for elderly users."
            );

            setLoadingProfile(false);
            return;
          }

          setProfile(userData);
        } catch (error) {
          console.log("Profile error:", error);

          Alert.alert(
            "Unable to Load Profile",
            "Please check your internet connection."
          );
        } finally {
          setLoadingProfile(false);
        }
      }
    );

    return unsubscribeAuth;
  }, []);

  // --------------------------------------------------
  // REAL-TIME MEDICINES
  // --------------------------------------------------

  useEffect(() => {
    let unsubscribeMedicines:
      | (() => void)
      | undefined;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        if (unsubscribeMedicines) {
          unsubscribeMedicines();
          unsubscribeMedicines = undefined;
        }

        if (!user) {
          setMedicines([]);
          setLoadingMedicines(false);
          return;
        }

        setLoadingMedicines(true);

        const medicinesQuery = query(
          collection(db, "medicines"),
          where("userId", "==", user.uid)
        );

        unsubscribeMedicines = onSnapshot(
          medicinesQuery,
          (snapshot) => {
            const medicineList: Medicine[] =
              snapshot.docs.map((medicineDoc) => {
                const data = medicineDoc.data();

                return {
                  id: medicineDoc.id,
                  userId: data.userId,
                  name: data.name,
                  dosage: data.dosage,
                  time: data.time,
                  status: data.status || "pending",
                };
              });

            setMedicines(medicineList);
            setLoadingMedicines(false);
          },
          (error) => {
            console.log(
              "Medicines listener error:",
              error
            );

            setLoadingMedicines(false);
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();

      if (unsubscribeMedicines) {
        unsubscribeMedicines();
      }
    };
  }, []);

  // --------------------------------------------------
  // REAL-TIME DOCTOR APPOINTMENTS
  // IMPORTANT:
  // Collection = doctorAppointments
  // Field = elderlyId
  // --------------------------------------------------

  useEffect(() => {
    let unsubscribeAppointments:
      | (() => void)
      | undefined;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        if (unsubscribeAppointments) {
          unsubscribeAppointments();
          unsubscribeAppointments = undefined;
        }

        if (!user) {
          setAppointments([]);
          setLoadingAppointments(false);
          return;
        }

        setLoadingAppointments(true);

        const appointmentsQuery = query(
          collection(db, "doctorAppointments"),
          where("elderlyId", "==", user.uid)
        );

        unsubscribeAppointments = onSnapshot(
          appointmentsQuery,
          (snapshot) => {
            const appointmentList: Appointment[] =
              snapshot.docs.map(
                (appointmentDoc) => {
                  const data =
                    appointmentDoc.data();

                  return {
                    id: appointmentDoc.id,

                    elderlyId:
                      data.elderlyId || "",

                    doctorId:
                      data.doctorId || "",

                    doctorName:
                      data.doctorName || "Doctor",

                    specialization:
                      data.specialization || null,

                    appointmentDate:
                      data.appointmentDate || "",

                    appointmentTime:
                      data.appointmentTime || "",

                    appointmentDateTime:
                      data.appointmentDateTime,

                    consultationMode:
                      data.consultationMode ||
                      "video",

                    reason:
                      data.reason || "",

                    status:
                      data.status || "pending",
                  };
                }
              );

            // Sort using real Firestore Timestamp
            appointmentList.sort((a, b) => {
              const aTime =
                a.appointmentDateTime?.toMillis?.() ??
                Number.MAX_SAFE_INTEGER;

              const bTime =
                b.appointmentDateTime?.toMillis?.() ??
                Number.MAX_SAFE_INTEGER;

              return aTime - bTime;
            });

            setAppointments(appointmentList);
            setLoadingAppointments(false);
          },
          (error) => {
            console.log(
              "Doctor appointments listener error:",
              error
            );

            setLoadingAppointments(false);

            Alert.alert(
              "Unable to Load Appointments",
              "Could not load your doctor appointments."
            );
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();

      if (unsubscribeAppointments) {
        unsubscribeAppointments();
      }
    };
  }, []);

  // --------------------------------------------------
  // MEDICINE CALCULATIONS
  // --------------------------------------------------

  const pendingMedicines = useMemo(() => {
    return medicines.filter(
      (medicine) =>
        medicine.status === "pending"
    );
  }, [medicines]);

  const takenMedicines = useMemo(() => {
    return medicines.filter(
      (medicine) =>
        medicine.status === "taken"
    );
  }, [medicines]);

  // --------------------------------------------------
  // APPOINTMENT CALCULATIONS
  // --------------------------------------------------

  const activeAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.status === "pending" ||
        appointment.status === "accepted"
    );
  }, [appointments]);

  const rejectedAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.status === "rejected"
    );
  }, [appointments]);

  const nextMedicine =
    pendingMedicines[0] ?? null;

  const nextAppointment =
    activeAppointments[0] ?? null;

  // Latest request includes rejected appointments too.
  // Useful so the elderly user can see doctor decision.
  const latestAppointmentRequest = useMemo(() => {
    if (appointments.length === 0) {
      return null;
    }

    return [...appointments].sort((a, b) => {
      const aTime =
        a.appointmentDateTime?.toMillis?.() ?? 0;

      const bTime =
        b.appointmentDateTime?.toMillis?.() ?? 0;

      return bTime - aTime;
    })[0];
  }, [appointments]);

  // --------------------------------------------------
  // MEDICINE ACTIONS
  // --------------------------------------------------

  async function handleMarkTaken(
    medicineId: string
  ) {
    try {
      await updateDoc(
        doc(db, "medicines", medicineId),
        {
          status: "taken",
          takenAt: serverTimestamp(),
        }
      );

      Alert.alert(
        "Medicine Updated",
        "Medicine marked as taken."
      );
    } catch (error) {
      console.log(
        "Update medicine error:",
        error
      );

      Alert.alert(
        "Update Failed",
        "Could not update medicine status."
      );
    }
  }

  async function handleMarkSkipped(
    medicineId: string
  ) {
    try {
      await updateDoc(
        doc(db, "medicines", medicineId),
        {
          status: "skipped",
          skippedAt: serverTimestamp(),
        }
      );

      Alert.alert(
        "Medicine Updated",
        "Medicine marked as skipped."
      );
    } catch (error) {
      console.log(
        "Skip medicine error:",
        error
      );

      Alert.alert(
        "Update Failed",
        "Could not update medicine status."
      );
    }
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  async function handleLogout() {
    try {
      await signOut(auth);

      router.replace("/sign-in");
    } catch (error) {
      console.log("Logout error:", error);

      Alert.alert(
        "Logout Failed",
        "Please try again."
      );
    }
  }

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loadingProfile) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#4A3FB5"
        />

        <Text style={styles.loadingText}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>
              Welcome back
            </Text>

            <Text style={styles.userName}>
              {profile?.fullName ||
                "Kindred Years Member"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() =>
              router.push("/elderly/profile")
            }
          >
            <Text style={styles.profileText}>
              {profile?.fullName
                ? profile.fullName
                    .charAt(0)
                    .toUpperCase()
                : "P"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TODAY CARE STATUS */}

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>
            Today's Care Status
          </Text>

          {loadingMedicines ||
          loadingAppointments ? (
            <ActivityIndicator
              color="#4A3FB5"
              style={styles.statusLoader}
            />
          ) : (
            <View style={styles.statusBottomRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>
                  {medicines.length}
                </Text>

                <Text
                  style={styles.statusItemText}
                >
                  Medicines
                </Text>
              </View>

              <View
                style={styles.verticalDivider}
              />

              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>
                  {takenMedicines.length}
                </Text>

                <Text
                  style={styles.statusItemText}
                >
                  Taken
                </Text>
              </View>

              <View
                style={styles.verticalDivider}
              />

              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>
                  {activeAppointments.length}
                </Text>

                <Text
                  style={styles.statusItemText}
                >
                  Appointments
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* SOS */}

        <TouchableOpacity
          style={styles.sosButton}
          onPress={() =>
            Alert.alert(
              "SOS Emergency",
              "Emergency contact and live location sharing will be connected in the SOS module."
            )
          }
          activeOpacity={0.85}
        >
          <View style={styles.sosIconCircle}>
            <Text style={styles.sosIcon}>
              !
            </Text>
          </View>

          <View style={styles.sosTextContainer}>
            <Text style={styles.sosTitle}>
              SOS Emergency
            </Text>

            <Text style={styles.sosSubtitle}>
              Tap for immediate emergency help
            </Text>
          </View>

          <Text style={styles.sosArrow}>
            {">"}
          </Text>
        </TouchableOpacity>

        {/* MY CARE */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            My Care
          </Text>

          <Text style={styles.sectionSubtitle}>
            Everything you need in one place
          </Text>
        </View>

        <View style={styles.grid}>
          <FeatureCard
            icon="M"
            title="Medicines"
            subtitle={`${pendingMedicines.length} pending`}
            onPress={() =>
              router.push(
                "/elderly/medicines"
              )
            }
          />

          <FeatureCard
            icon="C"
            title="Caregiver"
            subtitle="Find and book care"
            onPress={() =>
              router.push(
                "/elderly/caregiver-booking"
              )
            }
          />

          <FeatureCard
            icon="D"
            title="Doctor"
            subtitle={`${activeAppointments.length} active`}
            onPress={() =>
              router.push(
                "/elderly/doctor-appointments"
              )
            }
          />

          <FeatureCard
            icon="R"
            title="Reports"
            subtitle="Medical documents"
            onPress={() =>
              router.push(
                "/elderly/health-updates"
              )
            }
          />

          <FeatureCard
            icon="H"
            title="Health"
            subtitle="Daily updates"
            onPress={() =>
              router.push(
                "/elderly/health-updates"
              )
            }
          />
        </View>

        {/* NEXT MEDICINE */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Next Medicine
          </Text>
        </View>

        {loadingMedicines ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator
              color="#4A3FB5"
            />
          </View>
        ) : nextMedicine ? (
          <View style={styles.reminderCard}>
            <View
              style={styles.reminderTimeBox}
            >
              <Text
                style={styles.reminderTime}
              >
                {nextMedicine.time || "--:--"}
              </Text>
            </View>

            <View style={styles.reminderInfo}>
              <Text
                style={styles.reminderTitle}
              >
                {nextMedicine.name ||
                  "Medicine"}
              </Text>

              <Text
                style={styles.reminderSubtitle}
              >
                {nextMedicine.dosage ||
                  "No dosage information"}
              </Text>
            </View>

            <View style={styles.medicineActions}>
              <TouchableOpacity
                style={styles.takenButton}
                onPress={() =>
                  handleMarkTaken(
                    nextMedicine.id
                  )
                }
              >
                <Text
                  style={styles.takenButtonText}
                >
                  Taken
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={() =>
                  handleMarkSkipped(
                    nextMedicine.id
                  )
                }
              >
                <Text
                  style={styles.skipButtonText}
                >
                  Skip
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={() =>
              router.push(
                "/elderly/medicines"
              )
            }
          >
            <Text style={styles.emptyTitle}>
              No pending medicines
            </Text>

            <Text
              style={styles.emptySubtitle}
            >
              Tap here to add a medicine reminder.
            </Text>
          </TouchableOpacity>
        )}

        {/* UPCOMING APPOINTMENT */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Upcoming Appointment
          </Text>

          <Text style={styles.sectionSubtitle}>
            Your next active doctor request
          </Text>
        </View>

        {loadingAppointments ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator
              color="#4A3FB5"
            />
          </View>
        ) : nextAppointment ? (
          <View style={styles.appointmentCard}>
            <View style={styles.doctorAvatar}>
              <Text
                style={styles.doctorAvatarText}
              >
                DR
              </Text>
            </View>

            <View style={styles.appointmentInfo}>
              <Text style={styles.doctorName}>
                Dr.{" "}
                {nextAppointment.doctorName ||
                  "Doctor"}
              </Text>

              <Text
                style={styles.specialization}
              >
                {nextAppointment.specialization ||
                  "General Physician"}
              </Text>

              <Text
                style={styles.appointmentTime}
              >
                {nextAppointment.appointmentDate ||
                  "Date pending"}
                {" • "}
                {nextAppointment.appointmentTime ||
                  "Time pending"}
              </Text>

              <Text
                style={styles.appointmentMode}
              >
                {nextAppointment.consultationMode ===
                "video"
                  ? "Video Call"
                  : "In Person"}
              </Text>

              <AppointmentStatusBadge
                status={
                  nextAppointment.status ||
                  "pending"
                }
              />
            </View>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() =>
                router.push(
                  "/elderly/doctor-appointments"
                )
              }
            >
              <Text
                style={styles.viewButtonText}
              >
                View
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={() =>
              router.push(
                "/elderly/doctor-appointments"
              )
            }
          >
            <Text style={styles.emptyTitle}>
              No upcoming appointments
            </Text>

            <Text
              style={styles.emptySubtitle}
            >
              Tap here to book a doctor appointment.
            </Text>
          </TouchableOpacity>
        )}

        {/* LATEST APPOINTMENT STATUS */}

        {latestAppointmentRequest ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Latest Appointment Status
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Track doctor approval updates
              </Text>
            </View>

            <View
              style={styles.latestStatusCard}
            >
              <View
                style={styles.latestStatusTop}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={styles.latestDoctorName}
                  >
                    Dr.{" "}
                    {latestAppointmentRequest.doctorName ||
                      "Doctor"}
                  </Text>

                  <Text
                    style={
                      styles.latestAppointmentDate
                    }
                  >
                    {latestAppointmentRequest.appointmentDate ||
                      "Date pending"}
                    {" • "}
                    {latestAppointmentRequest.appointmentTime ||
                      "Time pending"}
                  </Text>
                </View>

                <AppointmentStatusBadge
                  status={
                    latestAppointmentRequest.status ||
                    "pending"
                  }
                />
              </View>

              {latestAppointmentRequest.reason ? (
                <Text
                  style={styles.latestReason}
                >
                  Reason:{" "}
                  {
                    latestAppointmentRequest.reason
                  }
                </Text>
              ) : null}

              {latestAppointmentRequest.status ===
              "pending" ? (
                <Text
                  style={styles.pendingMessage}
                >
                  Waiting for doctor approval.
                </Text>
              ) : null}

              {latestAppointmentRequest.status ===
              "accepted" ? (
                <Text
                  style={styles.acceptedMessage}
                >
                  Your doctor has accepted this
                  appointment.
                </Text>
              ) : null}

              {latestAppointmentRequest.status ===
              "rejected" ? (
                <Text
                  style={styles.rejectedMessage}
                >
                  Your doctor has rejected this
                  appointment request.
                </Text>
              ) : null}
            </View>
          </>
        ) : null}

        {/* APPOINTMENT SUMMARY */}

        {!loadingAppointments &&
        rejectedAppointments.length > 0 ? (
          <Text style={styles.summaryText}>
            Rejected requests:{" "}
            {rejectedAppointments.length}
          </Text>
        ) : null}

        {/* LOGOUT */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text
            style={styles.logoutButtonText}
          >
            Sign Out
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --------------------------------------------------
// APPOINTMENT STATUS BADGE
// --------------------------------------------------

function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  let label = "Pending";
  let badgeStyle = styles.pendingBadge;
  let textStyle = styles.pendingBadgeText;

  if (status === "accepted") {
    label = "Accepted";
    badgeStyle = styles.acceptedBadge;
    textStyle = styles.acceptedBadgeText;
  } else if (status === "rejected") {
    label = "Rejected";
    badgeStyle = styles.rejectedBadge;
    textStyle = styles.rejectedBadgeText;
  } else if (status === "completed") {
    label = "Completed";
    badgeStyle = styles.completedBadge;
    textStyle = styles.completedBadgeText;
  } else if (status === "cancelled") {
    label = "Cancelled";
    badgeStyle = styles.cancelledBadge;
    textStyle = styles.cancelledBadgeText;
  }

  return (
    <View
      style={[
        styles.appointmentStatusBadge,
        badgeStyle,
      ]}
    >
      <Text
        style={[
          styles.appointmentStatusText,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// --------------------------------------------------
// FEATURE CARD
// --------------------------------------------------

function FeatureCard({
  icon,
  title,
  subtitle,
  onPress,
}: FeatureCardProps) {
  return (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.featureIcon}>
        <Text
          style={styles.featureIconText}
        >
          {icon}
        </Text>
      </View>

      <Text style={styles.featureTitle}>
        {title}
      </Text>

      <Text style={styles.featureSubtitle}>
        {subtitle}
      </Text>
    </TouchableOpacity>
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

  loadingScreen: {
    flex: 1,
    backgroundColor: "#F7F7FC",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: "#666677",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  headerInfo: {
    flex: 1,
    marginRight: 12,
  },

  greeting: {
    fontSize: 14,
    color: "#77778A",
    marginBottom: 4,
  },

  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4A3FB5",
    alignItems: "center",
    justifyContent: "center",
  },

  profileText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
  },

  statusLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E1E2F",
    marginBottom: 18,
  },

  statusLoader: {
    marginVertical: 12,
  },

  statusBottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusItem: {
    flex: 1,
    alignItems: "center",
  },

  statusNumber: {
    fontSize: 21,
    fontWeight: "800",
    color: "#4A3FB5",
  },

  statusItemText: {
    fontSize: 12,
    color: "#77778A",
    marginTop: 4,
  },

  verticalDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#EEEEF4",
  },

  sosButton: {
    backgroundColor: "#D94343",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
  },

  sosIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  sosIcon: {
    color: "#D94343",
    fontSize: 26,
    fontWeight: "800",
  },

  sosTextContainer: {
    flex: 1,
    marginLeft: 14,
  },

  sosTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  sosSubtitle: {
    color: "#FFECEC",
    fontSize: 13,
    marginTop: 4,
  },

  sosArrow: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  sectionSubtitle: {
    fontSize: 13,
    color: "#77778A",
    marginTop: 4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  featureCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    minHeight: 145,
    elevation: 2,
  },

  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  featureIconText: {
    color: "#4A3FB5",
    fontSize: 17,
    fontWeight: "800",
  },

  featureTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E1E2F",
    marginBottom: 5,
  },

  featureSubtitle: {
    fontSize: 12,
    color: "#77778A",
    lineHeight: 17,
  },

  reminderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
  },

  reminderTimeBox: {
    width: 66,
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  reminderTime: {
    color: "#4A3FB5",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  reminderInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  reminderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  reminderSubtitle: {
    fontSize: 12,
    color: "#77778A",
    marginTop: 4,
  },

  medicineActions: {
    gap: 7,
  },

  takenButton: {
    backgroundColor: "#E8F7EE",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: "center",
  },

  takenButtonText: {
    color: "#278A50",
    fontSize: 11,
    fontWeight: "700",
  },

  skipButton: {
    backgroundColor: "#FDECEC",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: "center",
  },

  skipButtonText: {
    color: "#C84343",
    fontSize: 11,
    fontWeight: "700",
  },

  appointmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
  },

  doctorAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  doctorAvatarText: {
    color: "#4A3FB5",
    fontSize: 15,
    fontWeight: "800",
  },

  appointmentInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  doctorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  specialization: {
    fontSize: 12,
    color: "#77778A",
    marginTop: 3,
  },

  appointmentTime: {
    fontSize: 12,
    color: "#4A3FB5",
    fontWeight: "600",
    marginTop: 5,
  },

  appointmentMode: {
    fontSize: 12,
    color: "#666677",
    marginTop: 5,
    fontWeight: "600",
  },

  viewButton: {
    borderWidth: 1,
    borderColor: "#4A3FB5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  viewButtonText: {
    color: "#4A3FB5",
    fontSize: 12,
    fontWeight: "700",
  },

  appointmentStatusBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  appointmentStatusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  pendingBadge: {
    backgroundColor: "#FFF3D6",
  },

  pendingBadgeText: {
    color: "#B7791F",
  },

  acceptedBadge: {
    backgroundColor: "#E8F7EE",
  },

  acceptedBadgeText: {
    color: "#278A50",
  },

  rejectedBadge: {
    backgroundColor: "#FDECEC",
  },

  rejectedBadgeText: {
    color: "#C84343",
  },

  completedBadge: {
    backgroundColor: "#EEEAFE",
  },

  completedBadgeText: {
    color: "#4A3FB5",
  },

  cancelledBadge: {
    backgroundColor: "#EEEEF2",
  },

  cancelledBadgeText: {
    color: "#666677",
  },

  latestStatusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },

  latestStatusTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  latestDoctorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  latestAppointmentDate: {
    fontSize: 12,
    color: "#77778A",
    marginTop: 5,
  },

  latestReason: {
    fontSize: 13,
    color: "#55556A",
    lineHeight: 19,
    marginTop: 14,
  },

  pendingMessage: {
    fontSize: 12,
    color: "#B7791F",
    fontWeight: "700",
    marginTop: 12,
  },

  acceptedMessage: {
    fontSize: 12,
    color: "#278A50",
    fontWeight: "700",
    marginTop: 12,
  },

  rejectedMessage: {
    fontSize: 12,
    color: "#C84343",
    fontWeight: "700",
    marginTop: 12,
  },

  summaryText: {
    fontSize: 12,
    color: "#77778A",
    marginBottom: 18,
    textAlign: "center",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginBottom: 24,
    elevation: 2,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E1E2F",
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#77778A",
    textAlign: "center",
    marginTop: 6,
  },

  logoutButton: {
    height: 52,
    borderWidth: 1,
    borderColor: "#D94343",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  logoutButtonText: {
    color: "#D94343",
    fontSize: 15,
    fontWeight: "700",
  },

  bottomSpace: {
    height: 20,
  },
});