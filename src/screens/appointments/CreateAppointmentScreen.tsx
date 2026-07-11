import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useQuery } from "@tanstack/react-query";

import { useBusiness } from "../../context/BusinessContext";
import { listCustomers } from "../../api/customers";
import { listMembers } from "../../api/business";
import { getAvailability, createAppointment } from "../../api/appointments";
import AppButton from "../../components/AppButton";

export default function CreateAppointmentScreen({ navigation }: any) {
  const { activeBusiness } = useBusiness();

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const duration = 60;

  const { data: customers } = useQuery({
    queryKey: ["customers", activeBusiness?.id],
    queryFn: () => listCustomers(activeBusiness!.id),
    enabled: !!activeBusiness,
  });

  const { data: members } = useQuery({
    queryKey: ["members", activeBusiness?.id],
    queryFn: () => listMembers(activeBusiness!.id),
    enabled: !!activeBusiness,
  });

  const { data: slots } = useQuery({
    queryKey: ["availability", selectedDate, duration, selectedStaffId],
    queryFn: () =>
      getAvailability({
        businessId: activeBusiness!.id,
        date: selectedDate!,
        durationMinutes: duration,
        staffId: selectedStaffId || undefined,
      }),
    enabled: !!selectedDate && !!activeBusiness,
  });

  async function onCreate() {
    if (!selectedCustomer || !selectedDate || !selectedSlot) {
      Alert.alert("Missing fields", "Pick a customer, date, and time slot first.");
      return;
    }

    const start = new Date(selectedSlot);
    const end = new Date(start.getTime() + duration * 60000);

    setCreating(true);
    try {
      await createAppointment({
        businessId: activeBusiness!.id,
        customerId: selectedCustomer.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        source: "manual",
        staffId: selectedStaffId || undefined,
      });

      Alert.alert("Success", "Appointment created");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Failed to create appointment");
    } finally {
      setCreating(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Appointment</Text>

      <Text style={styles.section}>Customer</Text>
      {(!customers || customers.length === 0) && (
        <Text style={styles.emptyText}>No customers yet.</Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 56 }}>
        {(customers || []).map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => setSelectedCustomer(item)}
          >
            <View style={[styles.chip, selectedCustomer?.id === item.id && styles.activeChip]}>
              <Text style={styles.chipText} numberOfLines={1}>
                {item.full_name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {members && members.length > 0 && (
        <>
          <Text style={styles.section}>Staff (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 56 }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setSelectedStaffId(null);
                setSelectedSlot(null);
              }}
            >
              <View style={[styles.chip, !selectedStaffId && styles.activeChip]}>
                <Text style={styles.chipText}>Any available</Text>
              </View>
            </TouchableOpacity>
            {members.map((m) => (
              <TouchableOpacity
                key={m.user_id}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedStaffId(m.user_id);
                  setSelectedSlot(null);
                }}
              >
                <View style={[styles.chip, selectedStaffId === m.user_id && styles.activeChip]}>
                  <Text style={styles.chipText} numberOfLines={1}>
                    {m.full_name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <Text style={styles.section}>Select Date</Text>
      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setSelectedSlot(null);
        }}
        markedDates={
          selectedDate ? { [selectedDate]: { selected: true, selectedColor: "#3b82f6" } } : {}
        }
      />

      <Text style={styles.section}>Available Time Slots</Text>
      {selectedDate && (!slots || slots.length === 0) && (
        <Text style={styles.emptyText}>No open slots this day.</Text>
      )}
      {!selectedDate && <Text style={styles.emptyText}>Pick a date first.</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 56 }}>
        {(slots || []).map((item) => (
          <TouchableOpacity key={item} activeOpacity={0.7} onPress={() => setSelectedSlot(item)}>
            <View style={[styles.chip, selectedSlot === item && styles.activeChip]}>
              <Text style={styles.chipText}>
                {new Date(item).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ marginTop: 20 }}>
        <AppButton title="Create Appointment" onPress={onCreate} loading={creating} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10, color: "#111827" },
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
