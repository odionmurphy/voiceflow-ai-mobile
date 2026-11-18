import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { BusinessProvider } from "../context/BusinessContext";
import LoginScreen from "../screens/auth/LoginScreen";
import AppGate from "./AppGate";
import { COLORS } from "../theme";

export default function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaProvider>
        <StatusBar backgroundColor={COLORS.paper} barStyle="dark-content" />
        <SafeAreaView
          style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.paper }}
          edges={["bottom"]}
        >
          <ActivityIndicator size="large" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={token ? COLORS.navyDeep : COLORS.paper}
        barStyle={token ? "light-content" : "dark-content"}
      />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: token ? COLORS.navyDeep : COLORS.paper }}
        edges={["bottom"]}
      >
        <NavigationContainer>
          {token ? (
            <BusinessProvider>
              <AppGate />
            </BusinessProvider>
          ) : (
            <LoginScreen />
          )}
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
