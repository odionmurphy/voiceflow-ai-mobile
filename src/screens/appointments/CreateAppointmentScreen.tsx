import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useQuery } from "@tanstack/react-query";

import { useBusiness } from "../../context/BusinessContext";
import { listCustomers, Customer } from "../../api/customers";
import { listMembers, getAISettings } from "../../api/business";
import { getAvailability, createAppointment } from "../../api/appointments";
import AppButton from "../../components/AppButton";
import { COLORS } from "../../theme";

const DEFAULT_DURATION = 60;

export default function CreateAppointmentScreen({ navigation }: any) {
  const { activeBusiness } = useBusiness();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedServiceName, setSelectedServiceName] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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

  const { data: aiSettings } = useQuery({
    queryKey: ["aiSettings", activeBusiness?.id],
    queryFn: () => getAISettings(activeBusiness!.id),
    enabled: !!activeBusiness,
  });

  const services = aiSettings?.services ?? [];
  const duration =
    services.find((s) => s.name === selectedServiceName)?.durationMinutes ?? DEFAULT_DURATION;

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

  const filteredCustomers = useMemo(() => {
    const list = customers || [];
    const q = customerSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) => c.full_name.toLowerCase().includes(q) || c.phone_number.includes(q)
    );
  }, [customers, customerSearch]);

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
        serviceName: selectedServiceName || undefined,
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>New Appointment</Text>
      <Text style={styles.subtitle}>Book a slot on behalf of a customer.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Customer</Text>
        <Pressable style={styles.selectField} onPress={() => setCustomerPickerOpen(true)}>
          <Text style={selectedCustomer ? styles.selectValue : styles.selectPlaceholder}>
            {selectedCustomer ? selectedCustomer.full_name : "Select a customer"}
          </Text>
          <Text style={styles.chevron}>▾</Text>
        </Pressable>
        {selectedCustomer ? (
          <Text style={styles.helperText}>{selectedCustomer.phone_number}</Text>
        ) : null}

        {services.length > 0 && (
          <>
            <Text style={[styles.label, styles.sectionSpacing]}>Service (optional)</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedServiceName(null);
                  setSelectedSlot(null);
                }}
              >
                <View style={[styles.chip, !selectedServiceName && styles.activeChip]}>
                  <Text style={[styles.chipText, !selectedServiceName && styles.activeChipText]}>
                    No specific service ({DEFAULT_DURATION} min)
                  </Text>
                </View>
              </TouchableOpacity>
              {services.map((s) => {
                const active = selectedServiceName === s.name;
                return (
                  <TouchableOpacity
                    key={s.name}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedServiceName(s.name);
                      setSelectedSlot(null);
                    }}
                  >
                    <View style={[styles.chip, active && styles.activeChip]}>
                      <Text
                        style={[styles.chipText, active && styles.activeChipText]}
                        numberOfLines={1}
                      >
                        {s.name} ({s.durationMinutes} min)
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {members && members.length > 0 && (
          <>
            <Text style={[styles.label, styles.sectionSpacing]}>Staff (optional)</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedStaffId(null);
                  setSelectedSlot(null);
                }}
              >
                <View style={[styles.chip, !selectedStaffId && styles.activeChip]}>
                  <Text style={[styles.chipText, !selectedStaffId && styles.activeChipText]}>
                    Any available
                  </Text>
                </View>
              </TouchableOpacity>
              {members.map((m) => {
                const active = selectedStaffId === m.user_id;
                return (
                  <TouchableOpacity
                    key={m.user_id}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedStaffId(m.user_id);
                      setSelectedSlot(null);
                    }}
                  >
                    <View style={[styles.chip, active && styles.activeChip]}>
                      <Text
                        style={[styles.chipText, active && styles.activeChipText]}
                        numberOfLines={1}
                      >
                        {m.full_name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Date</Text>
        <Calendar
          style={styles.calendar}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setSelectedSlot(null);
          }}
          markedDates={
            selectedDate ? { [selectedDate]: { selected: true, selectedColor: COLORS.navy } } : {}
          }
          theme={{
            todayTextColor: COLORS.amberDeep,
            arrowColor: COLORS.navy,
            monthTextColor: COLORS.ink,
            textMonthFontWeight: "700",
            selectedDayBackgroundColor: COLORS.navy,
          }}
        />

        <Text style={[styles.label, styles.sectionSpacing]}>Available Time Slots</Text>
        {!selectedDate && <Text style={styles.helperText}>Pick a date to see open times.</Text>}
        {selectedDate && (!slots || slots.length === 0) && (
          <Text style={styles.helperText}>No open slots this day.</Text>
        )}
        <View style={styles.slotGrid}>
          {(slots || []).map((item) => {
            const active = selectedSlot === item;
            return (
              <TouchableOpacity key={item} activeOpacity={0.7} onPress={() => setSelectedSlot(item)}>
                <View style={[styles.slot, active && styles.activeSlot]}>
                  <Text style={[styles.slotText, active && styles.activeSlotText]}>
                    {new Date(item).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <AppButton
        title="Book appointment"
        variant="amber"
        onPress={onCreate}
        loading={creating}
        style={styles.submitButton}
      />

      <Modal
        visible={customerPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setCustomerPickerOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setCustomerPickerOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select customer</Text>
              <Pressable onPress={() => setCustomerPickerOpen(false)} hitSlop={8}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or phone"
              placeholderTextColor="#9CA3AF"
              value={customerSearch}
              onChangeText={setCustomerSearch}
              autoFocus
            />

            <ScrollView style={styles.sheetList} keyboardShouldPersistTaps="handled">
              {filteredCustomers.length === 0 && (
                <Text style={styles.helperText}>
                  {customers && customers.length > 0 ? "No matches." : "No customers yet."}
                </Text>
              )}
              {filteredCustomers.map((c) => {
                const active = selectedCustomer?.id === c.id;
                return (
                  <Pressable
                    key={c.id}
                    style={styles.sheetRow}
                    onPress={() => {
                      setSelectedCustomer(c);
                      setCustomerPickerOpen(false);
                      setCustomerSearch("");
                    }}
                  >
                    <View>
                      <Text style={[styles.sheetRowText, active && styles.sheetRowTextActive]}>
                        {c.full_name}
                      </Text>
                      <Text style={styles.sheetRowSubtext}>{c.phone_number}</Text>
                    </View>
                    {active && <Text style={styles.check}>✓</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.paper },
  container: { padding: 16, paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.ink },
  subtitle: { fontSize: 14, color: COLORS.inkSoft, marginTop: 4, marginBottom: 20 },
  card: {
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECECE8",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  sectionSpacing: { marginTop: 20 },
  selectField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  selectValue: { fontSize: 15, color: COLORS.ink, fontWeight: "600" },
  selectPlaceholder: { fontSize: 15, color: "#9CA3AF" },
  chevron: { fontSize: 13, color: "#9CA3AF" },
  helperText: { fontSize: 13, color: COLORS.inkSoft, marginTop: 6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  activeChip: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  chipText: { fontSize: 13, color: COLORS.ink, fontWeight: "600" },
  activeChipText: { color: "#fff" },
  calendar: { borderRadius: 12, overflow: "hidden" },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  slot: {
    minWidth: 76,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  activeSlot: { backgroundColor: COLORS.amber, borderColor: COLORS.amberDeep },
  slotText: { fontSize: 14, color: COLORS.ink, fontWeight: "600" },
  activeSlotText: { color: "#fff" },
  submitButton: { marginTop: 4 },
  backdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    maxHeight: "75%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: COLORS.ink },
  closeText: { fontSize: 16, color: "#6B7280" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: 8,
  },
  sheetList: { marginTop: 4 },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  sheetRowText: { fontSize: 15, color: COLORS.ink, fontWeight: "600" },
  sheetRowTextActive: { color: COLORS.navy },
  sheetRowSubtext: { fontSize: 13, color: COLORS.inkSoft, marginTop: 2 },
  check: { fontSize: 15, fontWeight: "700", color: COLORS.navy },
});
