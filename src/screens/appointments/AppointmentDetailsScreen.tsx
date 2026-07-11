import React from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { cancelAppointment, deleteAppointmentPermanently, Appointment } from "../../api/appointments";
import { useBusiness } from "../../context/BusinessContext";
import AppButton from "../../components/AppButton";

const SOURCE_STYLES: Record<string, { bg: string; fg: string; icon: string; label: string }> = {
  ai_call: { bg: "#EDE9FE", fg: "#6D28D9", icon: "🤖", label: "AI call" },
  manual: { bg: "#F1F5F9", fg: "#475569", icon: "✍️", label: "Manual" },
  web: { bg: "#DBEAFE", fg: "#1D4ED8", icon: "🌐", label: "Web" },
};

export default function AppointmentDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const { activeBusiness } = useBusiness();
  const isOwner = activeBusiness?.role === "owner";

  const appointment = (route.params as { appointment: Appointment }).appointment;

  function handleCancel() {
    Alert.alert(
      "Cancel appointment",
      `Cancel the appointment with ${appointment.customer_name ?? "this customer"}?`,
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel appointment",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelAppointment(appointment.id);
              queryClient.invalidateQueries({
                queryKey: ["appointments", activeBusiness?.id],
              });
              navigation.goBack();
            } catch {
              Alert.alert("Error", "Could not cancel the appointment. Try again.");
            }
          },
        },
      ]
    );
  }

  function handleDeletePermanently() {
    Alert.alert(
      "Delete permanently",
      `Permanently delete this appointment? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAppointmentPermanently(appointment.id);
              queryClient.invalidateQueries({
                queryKey: ["appointments", activeBusiness?.id],
              });
              navigation.goBack();
            } catch {
              Alert.alert("Error", "Could not delete the appointment. Try again.");
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Customer</Text>
      <Text style={styles.value}>{appointment.customer_name ?? "Unknown"}</Text>
      {appointment.customer_phone ? (
        <Text style={styles.subvalue}>{appointment.customer_phone}</Text>
      ) : null}

      <Text style={[styles.label, { marginTop: 20 }]}>Service</Text>
      <Text style={styles.value}>{appointment.service_name ?? "Service TBD"}</Text>

      <Text style={[styles.label, { marginTop: 20 }]}>When</Text>
      <Text style={styles.value}>{new Date(appointment.start_time).toLocaleString()}</Text>
      <Text style={styles.subvalue}>
        until {new Date(appointment.end_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>

      <View style={styles.badgeRow}>
        <View>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, styles.statusBadge]}>{appointment.status}</Text>
        </View>
        <View>
          <Text style={styles.label}>Source</Text>
          <View
            style={[
              styles.sourceBadge,
              { backgroundColor: SOURCE_STYLES[appointment.source].bg },
            ]}
          >
            <Text
              style={[styles.sourceBadgeText, { color: SOURCE_STYLES[appointment.source].fg }]}
            >
              {SOURCE_STYLES[appointment.source].icon} {SOURCE_STYLES[appointment.source].label}
            </Text>
          </View>
        </View>
      </View>

      {appointment.status !== "cancelled" && (
        <View style={{ marginTop: 30 }}>
          <AppButton
            title="Reschedule"
            onPress={() =>
              (navigation as any).navigate("EditAppointment", { appointment })
            }
          />
        </View>
      )}

      {appointment.status !== "cancelled" && (
        <View style={{ marginTop: 12 }}>
          <AppButton title="Cancel appointment" variant="outline-danger" onPress={handleCancel} />
        </View>
      )}

      {isOwner && (
        <View style={{ marginTop: 12 }}>
          <AppButton
            title="Delete permanently"
            variant="danger"
            onPress={handleDeletePermanently}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { color: "#666", fontSize: 13, textTransform: "uppercase" },
  value: { fontSize: 18, fontWeight: "600", marginTop: 4 },
  subvalue: { fontSize: 14, color: "#666", marginTop: 2 },
  statusBadge: { textTransform: "capitalize" },
  badgeRow: { flexDirection: "row", marginTop: 20, gap: 32 },
  sourceBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  sourceBadgeText: { fontSize: 13, fontWeight: "600" },
});
