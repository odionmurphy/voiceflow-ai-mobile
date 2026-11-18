import React, { useState } from "react";
import { View, Text, Modal, Pressable, StyleSheet } from "react-native";
import { COLORS } from "../theme";

export const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "de-DE", label: "German" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "it-IT", label: "Italian" },
  { code: "pt-BR", label: "Portuguese" },
  { code: "nl-NL", label: "Dutch" },
];

interface Props {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export default function LanguagePicker({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const selected = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.field, disabled && styles.fieldDisabled]}
      >
        <Text style={styles.fieldText}>{selected.label}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Language</Text>
              <Pressable onPress={() => setOpen(false)} style={styles.closeBtn} hitSlop={8}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>
            {LANGUAGES.map((l) => {
              const active = l.code === value;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => {
                    onChange(l.code);
                    setOpen(false);
                  }}
                  style={styles.row}
                >
                  <Text style={[styles.rowText, active && styles.rowTextActive]}>{l.label}</Text>
                  {active && <Text style={styles.check}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.panel,
  },
  fieldDisabled: { backgroundColor: COLORS.cream },
  fieldText: { fontSize: 14, color: COLORS.ink },
  chevron: { fontSize: 12, color: COLORS.inkSoft },
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.ink },
  closeBtn: { padding: 6 },
  closeText: { fontSize: 16, color: COLORS.inkSoft },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rowText: { fontSize: 15, color: COLORS.ink },
  rowTextActive: { fontWeight: "700", color: COLORS.navy },
  check: { fontSize: 15, fontWeight: "700", color: COLORS.navy },
});
