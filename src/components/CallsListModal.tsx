import React from "react";
import { View, Text, Modal, FlatList, StyleSheet, Pressable } from "react-native";
import { CallRecord } from "../api/calls";

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  completed: { bg: "#D1FAE5", fg: "#047857" },
  missed: { bg: "#FEE2E2", fg: "#DC2626" },
  failed: { bg: "#FEF3C7", fg: "#92400E" },
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface Props {
  visible: boolean;
  title: string;
  calls: CallRecord[];
  onClose: () => void;
}

export default function CallsListModal({ visible, title, calls, onClose }: Props) {
  const sorted = [...calls].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {sorted.length === 0 ? (
            <Text style={styles.empty}>No calls yet today.</Text>
          ) : (
            <FlatList
              data={sorted}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const color = STATUS_COLORS[item.status] ?? { bg: "#F3F4F6", fg: "#374151" };
                return (
                  <View style={styles.row}>
                    <View style={styles.rowTop}>
                      <Text style={styles.caller} numberOfLines={1}>
                        {item.caller_number ?? "Unknown number"}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: color.bg }]}>
                        <Text style={[styles.badgeText, { color: color.fg }]}>{item.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.meta}>
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {"  ·  "}
                      {formatDuration(item.duration_seconds)}
                      {item.intent ? `  ·  ${item.intent}` : ""}
                    </Text>
                    {item.summary ? (
                      <Text style={styles.summary}>{item.summary}</Text>
                    ) : null}
                    {item.transcript ? (
                      <Text style={styles.transcript} numberOfLines={2}>
                        {item.transcript}
                      </Text>
                    ) : null}
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "75%",
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  closeBtn: { padding: 6 },
  closeText: { fontSize: 16, color: "#6B7280" },
  empty: { marginTop: 16, color: "#666" },
  row: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  caller: { fontSize: 15, fontWeight: "600", color: "#111827", flex: 1, marginRight: 8 },
  badge: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8 },
  badgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  meta: { fontSize: 12, color: "#666", marginTop: 6 },
  summary: { fontSize: 13, fontWeight: "600", color: "#111827", marginTop: 6 },
  transcript: { fontSize: 12, color: "#666", marginTop: 4 },
});
