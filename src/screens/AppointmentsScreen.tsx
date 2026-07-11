import React, { useLayoutEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { useBusiness } from "../context/BusinessContext";
import { listAppointments, Appointment } from "../api/appointments";
import AppointmentCard from "../components/AppointmentCard";
import HeaderButton from "../components/HeaderButton";

export default function AppointmentsScreen() {
  const navigation = useNavigation();
  const { activeBusiness } = useBusiness();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          title="Book Appointment"
          onPress={() => navigation.navigate("CreateAppointment" as never)}
        />
      ),
    });
  }, [navigation]);

  const { data, isLoading } = useQuery({
    queryKey: ["appointments", activeBusiness?.id],
    queryFn: () => listAppointments(activeBusiness!.id),
    enabled: !!activeBusiness,
  });

  if (!activeBusiness) {
    return (
      <View style={styles.center}>
        <Text>No business selected yet.</Text>
      </View>
    );
  }

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <FlatList
      contentContainerStyle={{ padding: 20 }}
      data={data ?? []}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text>No appointments yet.</Text>}
      renderItem={({ item, index }: { item: Appointment; index: number }) => (
        <AppointmentCard
          appointment={item}
          delay={index * 30}
          onPress={() =>
            (navigation as any).navigate("AppointmentDetails", { appointment: item })
          }
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
});
