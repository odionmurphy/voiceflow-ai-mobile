import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useBusiness } from "../../context/BusinessContext";
import { getAvailability, updateAppointment, Appointment } from "../../api/appointments";
import AppButton from "../../components/AppButton";

export default function EditAppointmentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const { activeBusiness } = useBusiness();

  const appointment = (route.params as { appointment: Appointment }).appointment;

  const durationMinutes = Math.round(
    (new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime()) /
      60000
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(
    appointment.start_time.slice(0, 10)
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: slots } = useQuery({
    queryKey: ["availability", selectedDate, durationMinutes],
    queryFn: () =>
      getAvailability({
        businessId: activeBusiness!.id,
        date: selectedDate!,
        durationMinutes,
      }),
    enabled: !!selectedDate && !!activeBusiness,
  });

  async function onSave() {
    if (!selectedDate || !selectedSlot) {
      Alert.alert("Pick a new date and time first");
      return;
    }

    const start = new Date(selectedSlot);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    setSaving(true);
    try {
      await updateAppointment(appointment.id, {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ["appointments", activeBusiness?.id] });
      Alert.alert("Success", "Appointment rescheduled", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Failed to reschedule appointment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reschedule</Text>
      <Text style={styles.subtitle}>
        {appointment.customer_name ?? "Unknown"} · {appointment.service_name ?? "Service TBD"}
      </Text>
      <Text style={styles.currentTime}>
        Currently: {new Date(appointment.start_time).toLocaleString()}
      </Text>

      <Text style={styles.section}>New date</Text>
      <Calendar
        current={selectedDate ?? undefined}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setSelectedSlot(null);
        }}
        markedDates={
          selectedDate ? { [selectedDate]: { selected: true, selectedColor: "#3b82f6" } } : {}
        }
      />

      <Text style={styles.section}>Available time slots</Text>
      <FlatList
        horizontal
        data={slots || []}
        keyExtractor={(i) => i}
        ListEmptyComponent={
          selectedDate ? <Text style={styles.emptyText}>No open slots this day.</Text> : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedSlot(item)}
            style={[styles.chip, selectedSlot === item && styles.activeChip]}
          >
            <Text style={styles.chipText}>
              {new Date(item).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </Text>
          </Pressable>
        )}
      />

      <View style={{ marginTop: 20 }}>
        <AppButton title="Save new time" onPress={onSave} loading={saving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4, color: "#111827" },
  subtitle: { color: "#444", marginBottom: 4 },
  currentTime: { color: "#666", marginBottom: 10 },
  section: { marginTop: 20, marginBottom: 10, fontWeight: "600", color: "#111827" },
  emptyText: { color: "#666", paddingVertical: 10 },
  chip: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  activeChip: {
    backgroundColor: "#dbeafe",
    borderColor: "#3b82f6",
  },
  chipText: {
    color: "#111827",
    fontSize: 14,
  },
});
