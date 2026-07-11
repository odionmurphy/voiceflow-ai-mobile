import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from "react-native";
import { COLORS } from "../theme";

type Variant = "primary" | "outline" | "danger" | "outline-danger";

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  const v = VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        v.base,
        pressed && !isDisabled && v.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text.color as string} />
      ) : (
        <Text style={[styles.text, v.text]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontWeight: "700", fontSize: 15 },
  disabled: { opacity: 0.6 },
});

const VARIANTS: Record<
  Variant,
  { base: ViewStyle; pressed: ViewStyle; text: { color: string } }
> = {
  primary: {
    base: { backgroundColor: COLORS.navy },
    pressed: { backgroundColor: COLORS.navyDeep },
    text: { color: "#fff" },
  },
  outline: {
    base: { borderWidth: 1, borderColor: COLORS.navy, backgroundColor: "transparent" },
    pressed: { backgroundColor: "#F3F4F6" },
    text: { color: COLORS.navy },
  },
  danger: {
    base: { backgroundColor: COLORS.red },
    pressed: { backgroundColor: "#A83D3D" },
    text: { color: "#fff" },
  },
  "outline-danger": {
    base: { borderWidth: 1, borderColor: "#FCA5A5", backgroundColor: "#FEF7F7" },
    pressed: { backgroundColor: "#FEE2E2" },
    text: { color: "#DC2626" },
  },
};
