import { useEffect } from "react";
import { Platform } from "react-native";
import { registerPushToken } from "../api/pushTokens";

// Registers this device for push notifications and sends the Expo push token to the
// backend, so alerts (e.g. "New appointment booked") can reach whoever's logged in here.
// Call once, after the user is authenticated.
//
// Everything here is deliberately loaded via require() *inside* the effect, not static
// imports at the top of the file - until this dev-client build is rebuilt with the
// expo-notifications native module actually compiled in, even importing these packages
// can throw synchronously, and a static `import` is resolved eagerly when the JS bundle
// loads (before any try/catch in a function body would run), which would crash the whole
// app on startup. require() inside a try/catch defers that to here, where it's safe to
// swallow - push just silently stays unavailable instead.
export function usePushNotifications() {
  useEffect(() => {
    let Notifications: typeof import("expo-notifications");
    let Device: typeof import("expo-device");
    let Constants: typeof import("expo-constants").default;
    try {
      Notifications = require("expo-notifications");
      Device = require("expo-device");
      Constants = require("expo-constants").default;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch (err: any) {
      console.log("[push] native module unavailable (needs a dev-client rebuild):", err?.message);
      return;
    }

    register(Notifications, Device, Constants).catch((err) =>
      console.log("[push] registration failed:", err?.message)
    );
  }, []);
}

async function register(
  Notifications: typeof import("expo-notifications"),
  Device: typeof import("expo-device"),
  Constants: typeof import("expo-constants").default
) {
  if (!Device.isDevice) {
    console.log("[push] skipping - push tokens require a physical device");
    return;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.log(
      "[push] skipping - no EAS projectId configured. Run `eas init` in mobile_old to set one up."
    );
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") {
    console.log("[push] skipping - permission not granted");
    return;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await registerPushToken(token, Platform.OS === "ios" ? "ios" : "android");
}
