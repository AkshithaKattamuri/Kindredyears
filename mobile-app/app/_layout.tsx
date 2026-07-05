import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    async function setupNotifications() {
      try {
        // Android notification channel
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync(
            "medicine-reminders",
            {
              name: "Medicine Reminders",
              importance:
                Notifications.AndroidImportance.HIGH,
              sound: "default",
              vibrationPattern: [0, 250, 250, 250],
            }
          );
        }

        // Check current permission
        const currentPermissions =
          await Notifications.getPermissionsAsync();

        let finalStatus = currentPermissions.status;

        // Ask user if not already granted
        if (finalStatus !== "granted") {
          const requestedPermissions =
            await Notifications.requestPermissionsAsync();

          finalStatus = requestedPermissions.status;
        }

        if (finalStatus !== "granted") {
          console.log(
            "Notification permission not granted"
          );
          return;
        }

        console.log(
          "Notification permission granted"
        );
      } catch (error) {
        console.log(
          "Notification setup error:",
          error
        );
      }
    }

    setupNotifications();
  }, []);
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}