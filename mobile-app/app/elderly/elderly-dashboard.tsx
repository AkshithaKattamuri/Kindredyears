import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
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

type Appointment = {
  id: string;
  patientId?: string;
  doctorName?: string;
  specialization?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  status?: string;
};

type FeatureCardProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export default function ElderlyDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoadingProfile(false);
        router.replace("/sign-in");
        return;
      }

      try {
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

        const userData = userSnapshot.data() as UserProfile;

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
    });

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoadingMedicines(false);
      return;
    }

    const medicinesQuery = query(
      collection(db, "medicines"),
      where("userId", "==", user.uid)
    );

    const unsubscribeMedicines = onSnapshot(
      medicinesQuery,
      (snapshot) => {
        const medicineList: Medicine[] = snapshot.docs.map(
          (medicineDoc) => ({
            id: medicineDoc.id,
            ...(medicineDoc.data() as Omit<Medicine, "id">),
          })
        );

        setMedicines(medicineList);
        setLoadingMedicines(false);
      },
      (error) => {
        console.log("Medicines error:", error);
        setLoadingMedicines(false);
      }
    );

    return unsubscribeMedicines;
  }, []);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoadingAppointments(false);
      return;
    }

    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid)
    );

    const unsubscribeAppointments = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const appointmentList: Appointment[] = snapshot.docs.map(
          (appointmentDoc) => ({
            id: appointmentDoc.id,
            ...(appointmentDoc.data() as Omit<Appointment, "id">),
          })
        );

        setAppointments(appointmentList);
        setLoadingAppointments(false);
      },
      (error) => {
        console.log("Appointments error:", error);
        setLoadingAppointments(false);
      }
    );

    return unsubscribeAppointments;
  }, []);

  const pendingMedicines = useMemo(() => {
    return medicines.filter(
      (medicine) => medicine.status === "pending"
    );
  }, [medicines]);

  const takenMedicines = useMemo(() => {
    return medicines.filter(
      (medicine) => medicine.status === "taken"
    );
  }, [medicines]);

  const activeAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.status !== "cancelled" &&
        appointment.status !== "completed"
    );
  }, [appointments]);

  const nextMedicine = pendingMedicines[0] ?? null;
  const nextAppointment = activeAppointments[0] ?? null;

  async function handleMarkTaken(medicineId: string) {
    try {
      await updateDoc(doc(db, "medicines", medicineId), {
        status: "taken",
        takenAt: serverTimestamp(),
      });

      Alert.alert(
        "Medicine Updated",
        "Medicine marked as taken."
      );
    } catch (error) {
      console.log("Update medicine error:", error);

      Alert.alert(
        "Update Failed",
        "Could not update medicine status."
      );
    }
  }

  async function handleMarkSkipped(medicineId: string) {
    try {
      await updateDoc(doc(db, "medicines", medicineId), {
        status: "skipped",
        skippedAt: serverTimestamp(),
      });

      Alert.alert(
        "Medicine Updated",
        "Medicine marked as skipped."
      );
    } catch (error) {
      console.log("Skip medicine error:", error);

      Alert.alert(
        "Update Failed",
        "Could not update medicine status."
      );
    }
  }

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>
              Welcome back
            </Text>

            <Text style={styles.userName}>
              {profile?.fullName || "Kindred Years Member"}
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
                ? profile.fullName.charAt(0).toUpperCase()
                : "P"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>
            Today's Care Status
          </Text>

          {loadingMedicines || loadingAppointments ? (
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

                <Text style={styles.statusItemText}>
                  Medicines
                </Text>
              </View>

              <View style={styles.verticalDivider} />

              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>
                  {takenMedicines.length}
                </Text>

                <Text style={styles.statusItemText}>
                  Taken
                </Text>
              </View>

              <View style={styles.verticalDivider} />

              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>
                  {activeAppointments.length}
                </Text>

                <Text style={styles.statusItemText}>
                  Appointments
                </Text>
              </View>
            </View>
          )}
        </View>

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
            <Text style={styles.sosIcon}>!</Text>
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
              router.push("/elderly/medicines")
            }
          />

          <FeatureCard
            icon="C"
            title="Caregiver"
            subtitle="Find and book care"
            onPress={() =>
              router.push("/elderly/caregiver-booking")
            }
          />

          <FeatureCard
            icon="D"
            title="Doctor"
            subtitle={`${activeAppointments.length} appointments`}
            onPress={() =>
              router.push("/elderly/doctor-appointments")
            }
          />

          <FeatureCard
            icon="V"
            title="Video Call"
            subtitle="Talk to a doctor"
            onPress={() =>
              router.push("/elderly/video-call")
            }
          />

          <FeatureCard
            icon="R"
            title="Reports"
            subtitle="Medical documents"
            onPress={() =>
              router.push("/elderly/health-updates")
            }
          />

          <FeatureCard
            icon="H"
            title="Health"
            subtitle="Daily updates"
            onPress={() =>
              router.push("/elderly/health-updates")
            }
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Next Medicine
          </Text>
        </View>

        {loadingMedicines ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color="#4A3FB5" />
          </View>
        ) : nextMedicine ? (
          <View style={styles.reminderCard}>
            <View style={styles.reminderTimeBox}>
              <Text style={styles.reminderTime}>
                {nextMedicine.time || "--:--"}
              </Text>
            </View>

            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>
                {nextMedicine.name || "Medicine"}
              </Text>

              <Text style={styles.reminderSubtitle}>
                {nextMedicine.dosage ||
                  "No dosage information"}
              </Text>
            </View>

            <View style={styles.medicineActions}>
              <TouchableOpacity
                style={styles.takenButton}
                onPress={() =>
                  handleMarkTaken(nextMedicine.id)
                }
              >
                <Text style={styles.takenButtonText}>
                  Taken
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={() =>
                  handleMarkSkipped(nextMedicine.id)
                }
              >
                <Text style={styles.skipButtonText}>
                  Skip
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={() =>
              router.push("/elderly/medicines")
            }
          >
            <Text style={styles.emptyTitle}>
              No pending medicines
            </Text>

            <Text style={styles.emptySubtitle}>
              Tap here to add a medicine reminder.
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Next Appointment
          </Text>
        </View>

        {loadingAppointments ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color="#4A3FB5" />
          </View>
        ) : nextAppointment ? (
          <View style={styles.appointmentCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>
                DR
              </Text>
            </View>

            <View style={styles.appointmentInfo}>
              <Text style={styles.doctorName}>
                {nextAppointment.doctorName ||
                  "Doctor"}
              </Text>

              <Text style={styles.specialization}>
                {nextAppointment.specialization ||
                  "Specialization unavailable"}
              </Text>

              <Text style={styles.appointmentTime}>
                {nextAppointment.appointmentDate ||
                  "Date pending"}
                {"  "}
                {nextAppointment.appointmentTime || ""}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() =>
                router.push(
                  "/elderly/doctor-appointments"
                )
              }
            >
              <Text style={styles.viewButtonText}>
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

            <Text style={styles.emptySubtitle}>
              Tap here to book a doctor appointment.
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>
            Sign Out
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
        <Text style={styles.featureIconText}>
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