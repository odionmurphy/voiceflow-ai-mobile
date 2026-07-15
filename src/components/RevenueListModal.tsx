import React from "react";
import { View, Text, Modal, FlatList, StyleSheet, Pressable } from "react-native";
import { Appointment } from "../api/appointments";
import { COLORS } from "../theme";

interface Props {
  visible: boolean;
  title: string;
  appointments: Appointment[];
  onClose: () => void;
}

export default function RevenueListModal({ visible, title, appointments, onClose }: Props) {
  const sorted = [...appointments].sort((a, b) => a.start_time.localeCompare(b.start_time));
  const total = sorted.reduce((sum, a) => sum + (a.price ?? 0), 0);

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
            <Text style={styles.empty}>No priced appointments yet.</Text>
          ) : (
            <>
              <FlatList
                data={sorted}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.row}>
                    <View style={styles.rowTop}>
                      <Text style={styles.customer} numberOfLines={1}>
                        {item.customer_name ?? "Unknown customer"}
                      </Text>
                      <Text style={styles.price}>${(item.price ?? 0).toFixed(2)}</Text>
                    </View>
                    <Text style={styles.meta}>
                      {new Date(item.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {item.service_name ? `  ·  ${item.service_name}` : ""}
                    </Text>
                  </View>
                )}
              />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </>
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
    backgroundColor: COLORS.panel,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "75%",
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.ink },
  closeBtn: { padding: 6 },
  closeText: { fontSize: 16, color: COLORS.inkSoft },
  empty: { marginTop: 16, color: COLORS.inkSoft },
  row: {
    backgroundColor: COLORS.paper,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  customer: { fontSize: 15, fontWeight: "600", color: COLORS.ink, flex: 1, marginRight: 8 },
  price: { fontSize: 15, fontWeight: "700", color: COLORS.amberDeep },
  meta: { fontSize: 12, color: COLORS.inkSoft, marginTop: 6 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#ECECE8",
  },
  totalLabel: { fontSize: 14, fontWeight: "600", color: COLORS.inkSoft },
  totalValue: { fontSize: 20, fontWeight: "800", color: COLORS.ink },
});
