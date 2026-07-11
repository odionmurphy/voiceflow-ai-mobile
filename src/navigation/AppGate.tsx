import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useBusiness } from "../context/BusinessContext";
import MainTabs from "./MainTabs";
import CreateBusinessScreen from "../screens/CreateBusinessScreen";
import AISettingsScreen from "../screens/settings/AISettingsScreen";
import BillingScreen from "../screens/settings/BillingScreen";
import MessagesScreen from "../screens/MessagesScreen";
import TeamScreen from "../screens/TeamScreen";
import { headerScreenOptions } from "../theme";
import { usePushNotifications } from "../hooks/usePushNotifications";

const Stack = createNativeStackNavigator();

export default function AppGate() {
  const { loading, businesses } = useBusiness();
  usePushNotifications();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const hasBusiness = businesses.length > 0;

  return (
    <Stack.Navigator screenOptions={headerScreenOptions}>
      {hasBusiness ? (
        <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen
          name="CreateBusiness"
          component={CreateBusinessScreen}
          options={{ title: "Welcome" }}
        />
      )}
      {/* Always registered so Settings can push here even after onboarding */}
      <Stack.Screen
        name="AddBusiness"
        component={CreateBusinessScreen}
        options={{ title: "Add business" }}
      />
      <Stack.Screen
        name="AISettings"
        component={AISettingsScreen}
        options={{ title: "AI Settings" }}
      />
      <Stack.Screen name="Team" component={TeamScreen} options={{ title: "Team" }} />
      <Stack.Screen name="Billing" component={BillingScreen} options={{ title: "Billing" }} />
      <Stack.Screen name="Messages" component={MessagesScreen} options={{ title: "Messages" }} />
    </Stack.Navigator>
  );
}
