import React, { useLayoutEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useBusiness } from "../context/BusinessContext";
import { listCustomers } from "../api/customers";
import HeaderButton from "../components/HeaderButton";
import CustomerCard from "../components/CustomerCard";

export default function CustomersScreen() {
  const navigation = useNavigation();
  const { activeBusiness } = useBusiness();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          title="Add customer"
          onPress={() => navigation.navigate("CreateCustomer" as never)}
        />
      ),
    });
  }, [navigation]);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", activeBusiness?.id],
    queryFn: () => listCustomers(activeBusiness!.id),
    enabled: !!activeBusiness,
  });

  if (!activeBusiness) {
    return (
      <View style={styles.center}>
        <Text>No business selected yet.</Text>
      </View>
    );
  }

  if (isLoading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <FlatList
      contentContainerStyle={{ padding: 20 }}
      data={data ?? []}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text>No customers yet. Tap "Add customer" to create one.</Text>}
      renderItem={({ item, index }) => (
        <CustomerCard
          customer={item}
          delay={index * 30}
          onPress={() => (navigation as any).navigate("CustomerDetail", { customer: item })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
});
