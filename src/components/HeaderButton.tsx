import React from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { COLORS } from "../theme";

interface Props {
  title: string;
  onPress: () => void;
}

// Mirrors the navy pill buttons used for primary actions on the web dashboard
// (e.g. "Book appointment", "Add customer").
export default function HeaderButton({ title, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      hitSlop={8}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginRight: 4,
  },
  pressed: { backgroundColor: COLORS.navyDeep },
  text: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
