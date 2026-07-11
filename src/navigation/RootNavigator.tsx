import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { BusinessProvider } from "../context/BusinessContext";
import LoginScreen from "../screens/auth/LoginScreen";
import AppGate from "./AppGate";

export default function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {token ? (
          <BusinessProvider>
            <AppGate />
          </BusinessProvider>
        ) : (
          <LoginScreen />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
