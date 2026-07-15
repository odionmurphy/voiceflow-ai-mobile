import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { Appointment } from "../api/appointments";
import { COLORS } from "../theme";

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  confirmed: { bg: "#D1FAE5", fg: "#047857" },
  completed: { bg: "#D1FAE5", fg: "#047857" },
  cancelled: { bg: "#FEE2E2", fg: "#DC2626" },
  no_show: { bg: "#FEE2E2", fg: "#DC2626" },
  pending: { bg: "#FEF3C7", fg: "#92400E" },
};

const SOURCE_STYLES: Record<string, { bg: string; fg: string; icon: string; label: string }> = {
  ai_call: { bg: "#EDE9FE", fg: "#6D28D9", icon: "🤖", label: "AI call" },
  manual: { bg: "#F1F5F9", fg: "#475569", icon: "✍️", label: "Manual" },
  web: { bg: "#DBEAFE", fg: "#1D4ED8", icon: "🌐", label: "Web" },
};

interface Props {
  appointment: Appointment;
  onPress: () => void;
  compact?: boolean;
  delay?: number;
}

export default function AppointmentCard({ appointment, onPress, compact, delay = 0 }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      delay,
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  const start = new Date(appointment.start_time);
  const statusColor = STATUS_COLORS[appointment.status] ?? { bg: "#F3F4F6", fg: "#374151" };
  const sourceStyle = SOURCE_STYLES[appointment.source];

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
          },
        ],
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          compact && styles.cardCompact,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.left}>
          <View style={styles.timeChip}>
            <Text style={styles.timeText}>
              {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
            {!compact && (
              <Text style={styles.dateText}>
                {start.toLocaleDateString([], { month: "short", day: "numeric" })}
              </Text>
            )}
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.name} numberOfLines={1}>
              {appointment.customer_name ?? "Unknown"}
            </Text>
            <Text style={styles.service} numberOfLines={1}>
              {appointment.service_name ?? "Service TBD"}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          {!compact && sourceStyle && (
            <View style={[styles.badge, { backgroundColor: sourceStyle.bg }]}>
              <Text style={[styles.badgeText, { color: sourceStyle.fg }]}>
                {sourceStyle.icon} {sourceStyle.label}
              </Text>
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.badgeText, { color: statusColor.fg }]}>
              {appointment.status}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.panel,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ECECE8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardCompact: { padding: 10 },
  cardPressed: {
    backgroundColor: "#F9FAFB",
    transform: [{ scale: 0.98 }],
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
  timeChip: {
    backgroundColor: COLORS.paper,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
    marginRight: 12,
    minWidth: 56,
  },
  timeText: { fontSize: 13, fontWeight: "700", color: COLORS.ink },
  dateText: { fontSize: 10, color: COLORS.inkSoft, marginTop: 2, textTransform: "uppercase" },
  textBlock: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: COLORS.ink },
  service: { fontSize: 13, color: COLORS.inkSoft, marginTop: 2 },
  right: { flexDirection: "row", alignItems: "center" },
  badge: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8, marginRight: 6 },
  badgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  chevron: { fontSize: 18, color: COLORS.inkSoft },
});
