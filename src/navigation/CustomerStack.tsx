import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CustomersScreen from "../screens/CustomersScreen";
import CreateCustomerScreen from "../screens/customers/CreateCustomerScreen";
import CustomerDetailScreen from "../screens/customers/CustomerDetailScreen";
import { headerScreenOptions } from "../theme";

const Stack = createNativeStackNavigator();

export default function CustomerStack() {
  return (
    <Stack.Navigator screenOptions={headerScreenOptions}>
      <Stack.Screen
        name="CustomerList"
        component={CustomersScreen}
        options={{ title: "Customers" }}
      />
      <Stack.Screen
        name="CreateCustomer"
        component={CreateCustomerScreen}
        options={{ title: "Add customer" }}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{ title: "Customer" }}
      />
    </Stack.Navigator>
  );
}
