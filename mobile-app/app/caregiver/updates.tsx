import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../../config/firebase";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type BookingHistory = {
  id: string;
  elderlyName?: string;
  patientName?: string;
  serviceType?: string;
  date?: string;
  time?: string;
  status?: string;
  totalPrice?: number;
};

export default function BookingUpdates() {
  const [bookings, setBookings] = useState<
    BookingHistory[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "caregiverBookings"),
      where("caregiverId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as BookingHistory[];

        setBookings(data);
        setLoading(false);
      },
      (error) => {
        console.log(
          "Booking history error:",
          error
        );

        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  function getStatusStyle(status?: string) {
    switch (status) {
      case "accepted":
        return styles.acceptedBadge;

      case "rejected":
        return styles.rejectedBadge;

      case "completed":
        return styles.completedBadge;

      default:
        return styles.pendingBadge;
    }
  }

  function getStatusTextStyle(status?: string) {
    switch (status) {
      case "accepted":
        return styles.acceptedText;

      case "rejected":
        return styles.rejectedText;

      case "completed":
        return styles.completedText;

      default:
        return styles.pendingText;
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
        📋 Booking History
      </Text>

      <Text style={styles.subtitle}>
        Track all your care bookings
      </Text>

      {bookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            📋
          </Text>

          <Text style={styles.emptyTitle}>
            No Booking History
          </Text>
        </View>
      ) : (
        bookings.map((booking) => (
          <View
            key={booking.id}
            style={styles.card}
          >
            <View style={styles.row}>
              <Text style={styles.name}>
                👵{" "}
                {booking.elderlyName ||
                  booking.patientName ||
                  "Patient"}
              </Text>

              <View
                style={[
                  styles.badge,
                  getStatusStyle(booking.status),
                ]}
              >
                <Text
                  style={getStatusTextStyle(
                    booking.status
                  )}
                >
                  {booking.status || "pending"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.detail}>
              🩺 {booking.serviceType || "--"}
            </Text>

            <Text style={styles.detail}>
              📅 {booking.date || "--"}
            </Text>

            <Text style={styles.detail}>
              🕒 {booking.time || "--"}
            </Text>

            {booking.totalPrice !== undefined && (
              <Text style={styles.price}>
                💰 ₹{booking.totalPrice}
              </Text>
            )}
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
    padding: 19,
    borderRadius: 18,
    marginBottom: 16,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: "#1E1E2F",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },

  acceptedBadge: {
    backgroundColor: "#DCFCE7",
  },

  rejectedBadge: {
    backgroundColor: "#FEE2E2",
  },

  completedBadge: {
    backgroundColor: "#DBEAFE",
  },

  pendingText: {
    color: "#B45309",
    fontWeight: "700",
    fontSize: 12,
  },

  acceptedText: {
    color: "#15803D",
    fontWeight: "700",
    fontSize: 12,
  },

  rejectedText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 12,
  },

  completedText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEF3",
    marginVertical: 15,
  },

  detail: {
    fontSize: 15,
    color: "#555566",
    marginBottom: 9,
  },

  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#15803D",
    marginTop: 5,
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
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
  },
});