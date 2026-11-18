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
  sent: { bg: COLORS.tealSoft, fg: COLORS.teal },
  delivered: { bg: COLORS.tealSoft, fg: COLORS.teal },
  failed: { bg: COLORS.redSoft, fg: COLORS.red },
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
      style={styles.screen}
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
  screen: { backgroundColor: COLORS.paper },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: COLORS.paper },
  container: { padding: 20, paddingBottom: 32 },
  hint: { fontSize: 13, color: COLORS.inkSoft, marginBottom: 14, lineHeight: 18 },
  empty: { color: COLORS.inkSoft, fontSize: 14, marginTop: 8 },
  card: {
    backgroundColor: COLORS.panel,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  customer: { fontSize: 15, fontWeight: "600", color: COLORS.ink, flex: 1, marginRight: 8 },
  badge: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  meta: { fontSize: 13, color: COLORS.inkSoft, marginTop: 6 },
  time: { fontSize: 12, color: COLORS.inkSoft, marginTop: 4 },
});
