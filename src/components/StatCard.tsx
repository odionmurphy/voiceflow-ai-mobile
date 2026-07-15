import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { COLORS } from "../theme";

interface Props {
  label: string;
  value: string;
  note?: string;
  icon?: string;
  tone?: "navy" | "teal" | "red" | "amber";
  onPress?: () => void;
  delay?: number;
}

const TONE_COLORS: Record<NonNullable<Props["tone"]>, string> = {
  navy: COLORS.navy,
  teal: COLORS.teal,
  red: COLORS.red,
  amber: COLORS.amberDeep,
};

export default function StatCard({
  label,
  value,
  note,
  icon,
  tone = "navy",
  onPress,
  delay = 0,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const accentColor = TONE_COLORS[tone];
  const highlighted = tone === "red";

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      delay,
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  const content = (
    <View style={[styles.card, highlighted && styles.cardHighlight]}>
      <View style={[styles.topBar, { backgroundColor: accentColor }]} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          {icon ? (
            <View style={[styles.iconBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.iconText}>{icon}</Text>
            </View>
          ) : (
            <View />
          )}
          {onPress && <Text style={styles.chevron}>›</Text>}
        </View>
        <Text style={[styles.value, highlighted && { color: COLORS.red }]}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
    </View>
  );

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
      }}
    >
      {onPress ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [{ flex: 1 }, pressed && styles.pressed]}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ECECE8",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHighlight: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF7F7",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  topBar: { height: 4, width: "100%" },
  body: { padding: 14 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 16 },
  chevron: { fontSize: 18, color: "#C1C6D0", fontWeight: "600" },
  value: { fontSize: 28, fontWeight: "800", color: COLORS.ink, letterSpacing: -0.5 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.inkSoft,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  note: { fontSize: 10, color: COLORS.inkSoft, marginTop: 4 },
});
