import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { COLORS } from "../theme";

const DAYS: { key: string; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

interface Props {
  value: Record<string, [string, string]>;
  onChange: (value: Record<string, [string, string]>) => void;
}

export default function StaffHoursEditor({ value, onChange }: Props) {
  function toggleDay(day: string, open: boolean) {
    const next = { ...value };
    if (open) next[day] = ["09:00", "18:00"];
    else delete next[day];
    onChange(next);
  }

  function setTime(day: string, index: 0 | 1, time: string) {
    const current = value[day] ?? ["09:00", "18:00"];
    const next = { ...value };
    next[day] = index === 0 ? [time, current[1]] : [current[0], time];
    onChange(next);
  }

  return (
    <View>
      {DAYS.map(({ key, label }) => {
        const hours = value[key];
        const open = !!hours;
        return (
          <View key={key} style={styles.row}>
            <Pressable style={styles.dayToggle} onPress={() => toggleDay(key, !open)}>
              <View style={[styles.checkbox, open && styles.checkboxChecked]}>
                {open && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.dayLabel}>{label}</Text>
            </Pressable>
            {open ? (
              <View style={styles.timeRow}>
                <TextInput
                  style={styles.timeInput}
                  value={hours[0]}
                  placeholder="09:00"
                  onChangeText={(v) => setTime(key, 0, v)}
                />
                <Text style={styles.toText}>to</Text>
                <TextInput
                  style={styles.timeInput}
                  value={hours[1]}
                  placeholder="18:00"
                  onChangeText={(v) => setTime(key, 1, v)}
                />
              </View>
            ) : (
              <Text style={styles.closedText}>Closed</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  dayToggle: { flexDirection: "row", alignItems: "center", width: 80 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxChecked: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  checkmark: { color: "#fff", fontSize: 11, fontWeight: "700" },
  dayLabel: { fontSize: 13, color: "#111827", fontWeight: "600" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  timeInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 12,
    width: 70,
    backgroundColor: "#fff",
  },
  toText: { fontSize: 12, color: "#6B7280" },
  closedText: { fontSize: 12, color: "#9CA3AF" },
});
