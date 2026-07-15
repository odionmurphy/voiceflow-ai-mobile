import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { getAnalytics, Analytics } from "../api/analytics";
import StatCard from "./StatCard";
import CallsTrendChart from "./CallsTrendChart";
import { COLORS } from "../theme";

const RANGE_OPTIONS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

function formatPercent(rate: number | null) {
  if (rate === null) return "—";
  return `${Math.round(rate * 100)}%`;
}

export default function TrendsSection({ businessId }: { businessId: string }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAnalytics(businessId, days)
      .then(setData)
      .finally(() => setLoading(false));
  }, [businessId, days]);

  return (
    <View style={{ marginTop: 24 }}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>Trends</Text>
        <View style={styles.rangeSwitcher}>
          {RANGE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.days}
              onPress={() => setDays(opt.days)}
              style={[styles.rangeBtn, days === opt.days && styles.rangeBtnActive]}
            >
              <Text
                style={[styles.rangeBtnText, days === opt.days && styles.rangeBtnTextActive]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {!data ? (
        <ActivityIndicator style={{ marginTop: 16 }} />
      ) : (
        <View style={{ opacity: loading ? 0.6 : 1 }}>
          <View style={styles.statsRow}>
            <StatCard
              label="Calls answered"
              value={String(data.totals.calls_answered)}
              note={`of ${data.totals.calls_total} total`}
              icon="📞"
              tone="teal"
            />
            <StatCard
              label="Answer rate"
              value={formatPercent(data.totals.answerRate)}
              icon="🎯"
              tone="navy"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Appointments booked"
              value={String(data.totals.appointments_total)}
              icon="📅"
              tone="navy"
            />
            <StatCard
              label="No-show rate"
              value={formatPercent(data.totals.noShowRate)}
              icon="⚠️"
              tone={data.totals.noShowRate && data.totals.noShowRate > 0.1 ? "red" : "navy"}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Revenue"
              value={`$${Number(data.totals.revenue ?? 0).toFixed(2)}`}
              note="Confirmed + completed"
              icon="💰"
              tone="amber"
            />
          </View>

          <View style={styles.chartCard}>
            <CallsTrendChart daily={data.daily} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  rangeSwitcher: {
    flexDirection: "row",
    backgroundColor: COLORS.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ECECE8",
    padding: 2,
  },
  rangeBtn: { paddingVertical: 5, paddingHorizontal: 9, borderRadius: 6 },
  rangeBtnActive: { backgroundColor: COLORS.navy },
  rangeBtnText: { fontSize: 11, fontWeight: "600", color: COLORS.inkSoft },
  rangeBtnTextActive: { color: "#fff" },
  statsRow: { flexDirection: "row", marginTop: 12 },
  chartCard: {
    marginTop: 4,
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECE8",
    padding: 14,
  },
});
