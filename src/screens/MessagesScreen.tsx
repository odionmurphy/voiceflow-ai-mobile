import React, { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useBusiness } from "../context/BusinessContext";
import { listMessages, Message } from "../api/messages";
import { COLORS } from "../theme";

const CHANNEL_ICON: Record<Message["channel"], string> = {
  sms: "💬",
  email: "✉️",
  push: "🔔",
};

const STATUS_STYLE: Record<Message["status"], { bg: string; fg: string }> = {
  sent: { bg: "#E4F4F1", fg: COLORS.teal },
  delivered: { bg: "#E4F4F1", fg: COLORS.teal },
  failed: { bg: "#FEE2E2", fg: "#DC2626" },
};

const TEMPLATE_LABEL: Record<string, string> = {
  confirmation: "Booking confirmation",
  cancellation: "Cancellation",
  reminder: "Reminder",
};

export default function MessagesScreen() {
  const { activeBusiness } = useBusiness();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!activeBusiness) {
        setLoading(false);
        return;
      }
      setLoading(true);
      listMessages(activeBusiness.id)
        .then(setMessages)
        .finally(() => setLoading(false));
    }, [activeBusiness])
  );

  if (!activeBusiness) {
    return (
      <View style={styles.center}>
        <Text>No business selected yet.</Text>
      </View>
    );
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={messages}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <Text style={styles.hint}>SMS and email confirmations sent to your customers.</Text>
      }
      ListEmptyComponent={<Text style={styles.empty}>No messages sent yet.</Text>}
      renderItem={({ item }) => {
        const status = STATUS_STYLE[item.status];
        return (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.customer} numberOfLines={1}>
                {item.customer_name ?? "Unknown customer"}
              </Text>
              <View style={[styles.badge, { backgroundColor: status.bg }]}>
                <Text style={[styles.badgeText, { color: status.fg }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {CHANNEL_ICON[item.channel]} {item.channel.toUpperCase()}
              {"  ·  "}
              {TEMPLATE_LABEL[item.template ?? ""] ?? item.template ?? "—"}
            </Text>
            <Text style={styles.time}>
              {new Date(item.created_at).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { padding: 20 },
  hint: { fontSize: 13, color: "#666", marginBottom: 14, lineHeight: 18 },
  empty: { color: "#666", fontSize: 14, marginTop: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  customer: { fontSize: 15, fontWeight: "600", color: "#111827", flex: 1, marginRight: 8 },
  badge: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  meta: { fontSize: 13, color: "#6B7280", marginTop: 6 },
  time: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
});
