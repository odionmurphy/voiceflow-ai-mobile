import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AppointmentsScreen from "../screens/AppointmentsScreen";
import CreateAppointmentScreen from "../screens/appointments/CreateAppointmentScreen";
import EditAppointmentScreen from "../screens/appointments/EditAppointmentScreen";
import AppointmentDetailsScreen from "../screens/appointments/AppointmentDetailsScreen";
import { headerScreenOptions } from "../theme";

const Stack = createNativeStackNavigator();

export default function AppointmentStack() {
  return (
    <Stack.Navigator screenOptions={headerScreenOptions}>
      <Stack.Screen
        name="AppointmentList"
        component={AppointmentsScreen}
        options={{ title: "Appointments" }}
      />

      <Stack.Screen
        name="CreateAppointment"
        component={CreateAppointmentScreen}
        options={{ title: "New Appointment" }}
      />

      <Stack.Screen
        name="EditAppointment"
        component={EditAppointmentScreen}
      />

      <Stack.Screen
        name="AppointmentDetails"
        component={AppointmentDetailsScreen}
      />
    </Stack.Navigator>
  );
}