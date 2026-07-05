import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import { db } from "../../config/firebase";
import { getLinkedElderlyId } from "../services/linkedElderlyService";

type Medicine = {
  id: string;

  elderlyId: string;

  name: string;

  dosage: string;

  time: string;

  status: "taken" | "pending" | "missed";

  instructions?: string | null;

  createdAt?: Timestamp;
};

export default function MedicineScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  // --------------------------------------------------
  // LOAD LINKED ELDERLY PERSON'S MEDICINES
  // --------------------------------------------------

  useEffect(() => {
    let unsubscribeMedicines: (() => void) | undefined;

    let isMounted = true;

    async function loadMedicines() {
      try {
        setLoading(true);
        setErrorMessage("");

        // 1. Find which elderly person is linked
        //    to the currently signed-in family member
        const elderlyId = await getLinkedElderlyId();

        if (!isMounted) {
          return;
        }

        console.log("Linked elderly ID:", elderlyId);

        // 2. Read medicines belonging to that elderly user
        const medicinesQuery = query(
          collection(db, "medicines"),
          where("elderlyId", "==", elderlyId)
        );

        // 3. Listen in real time
        unsubscribeMedicines = onSnapshot(
          medicinesQuery,

          (snapshot) => {
            const loadedMedicines: Medicine[] =
              snapshot.docs.map((medicineDoc) => {
                const data = medicineDoc.data();

                return {
                  id: medicineDoc.id,

                  elderlyId: data.elderlyId || "",

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
                    data.status === "taken" ||
                    data.status === "missed"
                      ? data.status
                      : "pending",

                  instructions:
                    data.instructions || null,

                  createdAt:
                    data.createdAt,
                };
              });

            // Sort medicines by time text
            loadedMedicines.sort((a, b) =>
              a.time.localeCompare(b.time)
            );

            setMedicines(loadedMedicines);
            setLoading(false);
          },

          (error) => {
            console.log(
              "Family medicines listener error:",
              error
            );

            if (!isMounted) {
              return;
            }

            setErrorMessage(
              "Could not load the medicine schedule."
            );

            setLoading(false);
          }
        );
      } catch (error: any) {
        console.log(
          "Family medicines load error:",
          error
        );

        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error?.message ||
            "No elderly member is linked to this account."
        );

        setLoading(false);
      }
    }

    loadMedicines();

    return () => {
      isMounted = false;

      if (unsubscribeMedicines) {
        unsubscribeMedicines();
      }
    };
  }, []);

  // --------------------------------------------------
  // SUMMARY COUNTS
  // --------------------------------------------------

  const takenCount = medicines.filter(
    (medicine) => medicine.status === "taken"
  ).length;

  const pendingCount = medicines.filter(
    (medicine) => medicine.status === "pending"
  ).length;

  const missedCount = medicines.filter(
    (medicine) => medicine.status === "missed"
  ).length;

  // --------------------------------------------------
  // STATUS HELPERS
  // --------------------------------------------------

  function getStatusColor(status: Medicine["status"]) {
    if (status === "taken") {
      return "#2E9D63";
    }

    if (status === "missed") {
      return "#D9534F";
    }

    return "#E59A2F";
  }

  function getStatusBackground(status: Medicine["status"]) {
    if (status === "taken") {
      return "#EAF8F0";
    }

    if (status === "missed") {
      return "#FFF0F0";
    }

    return "#FFF7E8";
  }

  function getStatusIcon(
    status: Medicine["status"]
  ): keyof typeof Ionicons.glyphMap {
    if (status === "taken") {
      return "checkmark-circle";
    }

    if (status === "missed") {
      return "close-circle";
    }

    return "time";
  }

  function formatStatus(status: Medicine["status"]) {
    if (status === "taken") {
      return "Taken";
    }

    if (status === "missed") {
      return "Missed";
    }

    return "Pending";
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Medicines
        </Text>

        <Text style={styles.subtitle}>
          View today's medicine schedule and status.
        </Text>

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {takenCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Taken
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {pendingCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Pending
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {missedCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Missed
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Today's Medicines
        </Text>

        {/* LOADING */}

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator
              size="large"
              color="#4A3FB5"
            />

            <Text style={styles.loadingText}>
              Loading medicine schedule...
            </Text>
          </View>
        ) : errorMessage ? (
          /* ERROR / NOT LINKED */

          <View style={styles.emptyCard}>
            <Ionicons
              name="link-outline"
              size={60}
              color="#4A3FB5"
            />

            <Text style={styles.emptyTitle}>
              Unable to Load Medicines
            </Text>

            <Text style={styles.emptyText}>
              {errorMessage}
            </Text>
          </View>
        ) : medicines.length === 0 ? (
          /* EMPTY */

          <View style={styles.emptyCard}>
            <Ionicons
              name="medical"
              size={60}
              color="#4A3FB5"
            />

            <Text style={styles.emptyTitle}>
              No Medicine Schedule
            </Text>

            <Text style={styles.emptyText}>
              Medicines added for the linked elderly
              member will appear here automatically.
            </Text>
          </View>
        ) : (
          /* MEDICINES */

          medicines.map((medicine) => (
            <View
              key={medicine.id}
              style={styles.medicineCard}
            >
              <View style={styles.medicineIconBox}>
                <Ionicons
                  name="medical"
                  size={28}
                  color="#4A3FB5"
                />
              </View>

              <View style={styles.medicineContent}>
                <Text style={styles.medicineName}>
                  {medicine.name}
                </Text>

                <Text style={styles.medicineDosage}>
                  {medicine.dosage}
                </Text>

                <View style={styles.timeRow}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color="#666677"
                  />

                  <Text style={styles.medicineTime}>
                    {medicine.time}
                  </Text>
                </View>

                {medicine.instructions ? (
                  <Text style={styles.instructions}>
                    {medicine.instructions}
                  </Text>
                ) : null}
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      getStatusBackground(
                        medicine.status
                      ),
                  },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(
                    medicine.status
                  )}
                  size={15}
                  color={getStatusColor(
                    medicine.status
                  )}
                />

                <Text
                  style={[
                    styles.statusText,
                    {
                      color: getStatusColor(
                        medicine.status
                      ),
                    },
                  ]}
                >
                  {formatStatus(
                    medicine.status
                  )}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  back: {
    color: "#4A3FB5",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    marginBottom: 25,
    lineHeight: 22,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 3,
    marginBottom: 25,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#ECEBF3",
  },

  summaryNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4A3FB5",
  },

  summaryLabel: {
    marginTop: 6,
    color: "#777",
    fontSize: 15,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E1E2F",
    marginBottom: 18,
  },

  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    elevation: 3,
  },

  loadingText: {
    marginTop: 14,
    color: "#666677",
    fontSize: 15,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    elevation: 3,
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: "700",
    color: "#1E1E2F",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 10,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
    fontSize: 15,
  },

  medicineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  medicineIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  medicineContent: {
    flex: 1,
  },

  medicineName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E1E2F",
  },

  medicineDosage: {
    fontSize: 13,
    color: "#666677",
    marginTop: 4,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  medicineTime: {
    fontSize: 13,
    color: "#666677",
    marginLeft: 5,
    fontWeight: "600",
  },

  instructions: {
    fontSize: 12,
    color: "#888899",
    marginTop: 7,
    lineHeight: 17,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginLeft: 8,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
});