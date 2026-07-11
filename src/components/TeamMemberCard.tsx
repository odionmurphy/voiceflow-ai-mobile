import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { BusinessMember } from "../api/business";
import { COLORS } from "../theme";

interface Props {
  member: BusinessMember;
  canRemove: boolean;
  onRemove: () => void;
  onSetHours?: () => void;
  delay?: number;
}

export default function TeamMemberCard({
  member,
  canRemove,
  onRemove,
  onSetHours,
  delay = 0,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      delay,
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  const isOwner = member.role === "owner";

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
        ],
      }}
    >
      <View style={styles.card}>
        <View style={styles.textBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {member.full_name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {member.email}
          </Text>
        </View>

        <View style={styles.right}>
          <View style={[styles.badge, isOwner ? styles.badgeOwner : styles.badgeStaff]}>
            <Text style={[styles.badgeText, isOwner ? styles.badgeTextOwner : styles.badgeTextStaff]}>
              {member.role}
            </Text>
          </View>
          {onSetHours && (
            <Pressable onPress={onSetHours} hitSlop={8}>
              <Text style={styles.hoursText}>
                {member.working_hours && Object.keys(member.working_hours).length > 0
                  ? "Edit hours"
                  : "Set hours"}
              </Text>
            </Pressable>
          )}
          {canRemove && !isOwner && (
            <Pressable onPress={onRemove} hitSlop={8}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          )}
        </View>
      </View>
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
  textBlock: { flex: 1, marginRight: 8 },
  name: { fontSize: 15, fontWeight: "600", color: "#111827" },
  email: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  right: { flexDirection: "row", alignItems: "center", gap: 10 },
  badge: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  badgeOwner: { backgroundColor: COLORS.navySoft },
  badgeStaff: { backgroundColor: "#F3F4F6" },
  badgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  badgeTextOwner: { color: "#fff" },
  badgeTextStaff: { color: "#6B7280" },
  removeText: { fontSize: 12, fontWeight: "600", color: "#DC2626" },
  hoursText: { fontSize: 12, fontWeight: "600", color: COLORS.navy },
});
