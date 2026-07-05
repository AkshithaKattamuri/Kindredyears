import { useEffect, useState } from "react";

import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../../config/firebase";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type BookingRequest = {
  id: string;
  elderlyName?: string;
  patientName?: string;
  serviceType?: string;
  date?: string;
  time?: string;
  address?: string;
  phone?: string;
  status?: string;
};

export default function CaregiverRequests() {
  const [requests, setRequests] = useState<
    BookingRequest[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] =
    useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "caregiverBookings"),
      where("caregiverId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as BookingRequest[];

        setRequests(data);
        setLoading(false);
      },
      (error) => {
        console.log("Request loading error:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  async function updateRequest(
    bookingId: string,
    newStatus: "accepted" | "rejected"
  ) {
    try {
      setProcessingId(bookingId);

      await updateDoc(
        doc(db, "caregiverBookings", bookingId),
        {
          status: newStatus,
          updatedAt: new Date(),
        }
      );

      Alert.alert(
        "Success",
        newStatus === "accepted"
          ? "Booking request accepted."
          : "Booking request rejected."
      );
    } catch (error: any) {
      Alert.alert(
        "Update Failed",
        error.message || "Please try again."
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#4A3FB5"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        📩 Booking Requests
      </Text>

      <Text style={styles.subtitle}>
        Review elderly care requests
      </Text>

      {requests.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            📭
          </Text>

          <Text style={styles.emptyTitle}>
            No New Requests
          </Text>

          <Text style={styles.emptyText}>
            New caregiver bookings will appear
            here.
          </Text>
        </View>
      ) : (
        requests.map((request) => (
          <View
            key={request.id}
            style={styles.card}
          >
            <Text style={styles.patientName}>
              👵{" "}
              {request.elderlyName ||
                request.patientName ||
                "Patient"}
            </Text>

            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>
                Pending
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.detail}>
              🩺 Service:{" "}
              {request.serviceType || "--"}
            </Text>

            <Text style={styles.detail}>
              📅 Date: {request.date || "--"}
            </Text>

            <Text style={styles.detail}>
              🕒 Time: {request.time || "--"}
            </Text>

            <Text style={styles.detail}>
              📍 Address:{" "}
              {request.address || "--"}
            </Text>

            <Text style={styles.detail}>
              📞 Phone: {request.phone || "--"}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.rejectButton}
                disabled={
                  processingId === request.id
                }
                onPress={() =>
                  updateRequest(
                    request.id,
                    "rejected"
                  )
                }
              >
                <Text style={styles.rejectText}>
                  Reject
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptButton}
                disabled={
                  processingId === request.id
                }
                onPress={() =>
                  updateRequest(
                    request.id,
                    "accepted"
                  )
                }
              >
                {processingId === request.id ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text style={styles.acceptText}>
                    Accept
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
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

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  subtitle: {
    fontSize: 15,
    color: "#77778A",
    marginTop: 7,
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    marginBottom: 18,
    elevation: 3,
  },

  patientName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  pendingBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },

  pendingText: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEF3",
    marginVertical: 15,
  },

  detail: {
    fontSize: 15,
    color: "#454557",
    marginBottom: 9,
  },

  actions: {
    flexDirection: "row",
    marginTop: 15,
    gap: 12,
  },

  rejectButton: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  rejectText: {
    color: "#DC2626",
    fontWeight: "800",
  },

  acceptButton: {
    flex: 1,
    backgroundColor: "#4A3FB5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  acceptText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 35,
    borderRadius: 18,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 45,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginTop: 12,
  },

  emptyText: {
    textAlign: "center",
    color: "#77778A",
    marginTop: 8,
  },
});