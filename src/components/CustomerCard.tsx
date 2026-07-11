import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { Customer } from "../api/customers";
import { COLORS } from "../theme";

interface Props {
  customer: Customer;
  onPress: () => void;
  delay?: number;
}

export default function CustomerCard({ customer, onPress, delay = 0 }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      delay,
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  const initial = customer.full_name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
        ],
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.left}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.name} numberOfLines={1}>
              {customer.full_name}
            </Text>
            <Text style={styles.phone} numberOfLines={1}>
              {customer.phone_number}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.visit} numberOfLines={1}>
            {customer.last_visit_at
              ? `Last visit ${new Date(customer.last_visit_at).toLocaleDateString()}`
              : "No visits yet"}
          </Text>
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardPressed: {
    backgroundColor: "#F9FAFB",
    transform: [{ scale: 0.98 }],
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.navySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  textBlock: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: "#111827" },
  phone: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  right: { alignItems: "flex-end", flexDirection: "row" },
  visit: { fontSize: 11, color: "#9CA3AF", maxWidth: 110, textAlign: "right", marginRight: 4 },
  chevron: { fontSize: 18, color: "#9CA3AF" },
});
