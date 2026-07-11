import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AppointmentStack from "./AppointmentStack";
import CustomerStack from "./CustomerStack";
import { COLORS, headerScreenOptions } from "../theme";

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: "🏠",
  Appointments: "📅",
  Customers: "👥",
  Settings: "⚙️",
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerScreenOptions,
        tabBarActiveTintColor: COLORS.amber,
        tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
        tabBarStyle: { backgroundColor: COLORS.navy, borderTopColor: COLORS.navySoft },
        tabBarLabelStyle: { fontWeight: "600", fontSize: 11 },
        tabBarIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>{TAB_ICONS[route.name] ?? "•"}</Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Appointments"
        component={AppointmentStack}
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          // Tapping the tab bar icon should always land on the list, even if a
          // previous navigation (e.g. from Home's "Today's schedule") pushed the
          // detail screen onto this tab's stack - otherwise the stack's last screen
          // (the detail view) keeps showing instead of resetting to the list.
          tabPress: () => {
            navigation.navigate("Appointments", { screen: "AppointmentList" });
          },
        })}
      />
      <Tab.Screen name="Customers" component={CustomerStack} options={{ headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
