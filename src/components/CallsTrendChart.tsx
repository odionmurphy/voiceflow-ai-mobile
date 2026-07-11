import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { AnalyticsDay } from "../api/analytics";
import { COLORS } from "../theme";

const CHART_HEIGHT = 120;
const BAR_WIDTH = 8;
const BAR_GAP = 2;
const GROUP_WIDTH = 26;

function niceMax(value: number) {
  if (value <= 0) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const steps = [1, 2, 2.5, 5, 10];
  for (const s of steps) {
    if (value <= s * pow) return s * pow;
  }
  return 10 * pow;
}

function formatDayLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function CallsTrendChart({ daily }: { daily: AnalyticsDay[] }) {
  const [selected, setSelected] = useState<AnalyticsDay | null>(
    daily.length ? daily[daily.length - 1] : null
  );

  const maxVal = niceMax(
    Math.max(1, ...daily.map((d) => Math.max(d.calls_answered, d.calls_missed)))
  );
  const labelEvery = Math.max(1, Math.ceil(daily.length / 8));

  return (
    <View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.teal }]} />
          <Text style={styles.legendText}>Answered</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.red }]} />
          <Text style={styles.legendText}>Missed</Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>{maxVal}</Text>
          <Text style={styles.yAxisLabel}>0</Text>
        </View>

        <View style={styles.chartArea}>
          <View style={[styles.gridLine, { top: 0 }]} />
          <View style={[styles.gridLine, { bottom: 0 }]} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {daily.map((d, i) => {
              const answeredH = (d.calls_answered / maxVal) * CHART_HEIGHT;
              const missedH = (d.calls_missed / maxVal) * CHART_HEIGHT;
              const isSelected = selected?.day === d.day;
              return (
                <Pressable
                  key={d.day}
                  onPress={() => setSelected(d)}
                  style={[styles.group, isSelected && styles.groupSelected]}
                >
                  <View style={styles.bars}>
                    <View
                      style={[
                        styles.bar,
                        { height: Math.max(answeredH, 1), backgroundColor: COLORS.teal },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        { height: Math.max(missedH, 1), backgroundColor: COLORS.red },
                      ]}
                    />
                  </View>
                  {i % labelEvery === 0 && (
                    <Text style={styles.xAxisLabel} numberOfLines={1}>
                      {formatDayLabel(d.day)}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {selected && (
        <View style={styles.detailCard}>
          <Text style={styles.detailDate}>{formatDayLabel(selected.day)}</Text>
          <View style={styles.detailRow}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.teal }]} />
            <Text style={styles.detailText}>
              <Text style={styles.detailValue}>{selected.calls_answered}</Text> answered
            </Text>
          </View>
          <View style={styles.detailRow}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.red }]} />
            <Text style={styles.detailText}>
              <Text style={styles.detailValue}>{selected.calls_missed}</Text> missed
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  legendRow: { flexDirection: "row", gap: 16, marginBottom: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  chartRow: { flexDirection: "row" },
  yAxis: { width: 24, height: CHART_HEIGHT, justifyContent: "space-between", marginRight: 4 },
  yAxisLabel: { fontSize: 9, color: "#9CA3AF" },
  chartArea: { flex: 1, height: CHART_HEIGHT },
  gridLine: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "#EEEFF1" },
  group: {
    width: GROUP_WIDTH,
    height: CHART_HEIGHT + 18,
    alignItems: "center",
    justifyContent: "flex-end",
    borderRadius: 6,
  },
  groupSelected: { backgroundColor: "#F3F4F6" },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: BAR_GAP,
    height: CHART_HEIGHT,
  },
  bar: { width: BAR_WIDTH, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  xAxisLabel: { fontSize: 8, color: "#9CA3AF", marginTop: 4, width: GROUP_WIDTH + 20 },
  detailCard: {
    marginTop: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
  },
  detailDate: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 6 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  detailText: { fontSize: 13, color: "#6B7280" },
  detailValue: { fontWeight: "700", color: "#111827" },
});
