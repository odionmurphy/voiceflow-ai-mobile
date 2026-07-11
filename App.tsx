import React from "react";
import { LogBox } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";

// expo-notifications/expo-device log these directly (not as thrown exceptions, so
// usePushNotifications' try/catch can't stop the LogBox overlay) whenever their native
// modules aren't compiled into the current dev-client build yet. Expected and harmless
// until this app gets rebuilt with `eas build`/`expo run:android` - remove this once
// that's done, since a real recurrence of either error afterward would be worth seeing.
LogBox.ignoreLogs([
  "Cannot find native module 'ExpoPushTokenManager'",
  "Cannot find native module 'ExpoDevice'",
]);

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
