import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBusiness } from "../context/BusinessContext";
import { listMembers, addMember, removeMember, setStaffWorkingHours, BusinessMember } from "../api/business";
import TeamMemberCard from "../components/TeamMemberCard";
import StaffHoursEditor from "../components/StaffHoursEditor";
import AppButton from "../components/AppButton";
import { COLORS } from "../theme";

export default function TeamScreen() {
  const { activeBusiness } = useBusiness();
  const queryClient = useQueryClient();
  const isOwner = activeBusiness?.role === "owner";
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [draftHours, setDraftHours] = useState<Record<string, [string, string]>>({});
  const [savingHours, setSavingHours] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["members", activeBusiness?.id],
    queryFn: () => listMembers(activeBusiness!.id),
    enabled: !!activeBusiness,
  });

  async function handleAdd() {
    if (!activeBusiness || !email) return;
    setError(null);
    setSubmitting(true);
    try {
      await addMember(activeBusiness.id, email);
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["members", activeBusiness.id] });
    } catch (err: any) {
      const message = err?.response?.data?.error || "Could not add team member.";
      setError(typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setSubmitting(false);
    }
  }

  function handleRemove(member: BusinessMember) {
    Alert.alert("Remove team member", `Remove ${member.full_name} from this business?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await removeMember(activeBusiness!.id, member.user_id);
            queryClient.invalidateQueries({ queryKey: ["members", activeBusiness!.id] });
          } catch {
            Alert.alert("Error", "Could not remove team member. Try again.");
          }
        },
      },
    ]);
  }

  function toggleHours(member: BusinessMember) {
    if (expandedUserId === member.user_id) {
      setExpandedUserId(null);
      return;
    }
    setDraftHours(member.working_hours ?? {});
    setExpandedUserId(member.user_id);
  }

  async function handleSaveHours(userId: string) {
    if (!activeBusiness) return;
    setSavingHours(true);
    try {
      await setStaffWorkingHours(activeBusiness.id, userId, draftHours);
      setExpandedUserId(null);
      queryClient.invalidateQueries({ queryKey: ["members", activeBusiness.id] });
    } catch {
      Alert.alert("Error", "Could not save working hours. Try again.");
    } finally {
      setSavingHours(false);
    }
  }

  if (!activeBusiness) {
    return (
      <View style={styles.center}>
        <Text>No business selected yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={data ?? []}
      keyExtractor={(item) => item.user_id}
      ListHeaderComponent={
        <>
          <Text style={styles.note}>
            Owners have full control. Staff can manage day-to-day work — customers,
            appointments, calls — but can&apos;t delete the business, touch billing, or
            permanently delete records.
          </Text>

          {isOwner && (
            <View style={styles.card}>
              <Text style={styles.label}>Add team member by email</Text>
              <TextInput
                style={styles.input}
                placeholder="teammate@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.hint}>
                They must already have a VoiceFlow AI account — ask them to sign up first.
              </Text>
              <Pressable
                onPress={handleAdd}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                  submitting && { opacity: 0.6 },
                ]}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.addButtonText}>Add as staff</Text>
                )}
              </Pressable>
              {error && <Text style={styles.error}>{error}</Text>}
            </View>
          )}

          {isLoading && <ActivityIndicator style={{ marginTop: 20, marginBottom: 10 }} />}
        </>
      }
      renderItem={({ item, index }) => (
        <View>
          <TeamMemberCard
            member={item}
            canRemove={isOwner}
            delay={index * 30}
            onRemove={() => handleRemove(item)}
            onSetHours={isOwner ? () => toggleHours(item) : undefined}
          />
          {expandedUserId === item.user_id && (
            <View style={styles.hoursCard}>
              <Text style={styles.hoursHint}>
                Custom working hours for {item.full_name}. Leave every day off to fall back
                to the business&apos;s own hours.
              </Text>
              <StaffHoursEditor value={draftHours} onChange={setDraftHours} />
              <View style={styles.hoursActions}>
                <View style={{ flex: 1 }}>
                  <AppButton
                    title="Save hours"
                    onPress={() => handleSaveHours(item.user_id)}
                    loading={savingHours}
                  />
                </View>
                <Pressable onPress={() => setExpandedUserId(null)} style={{ marginLeft: 12 }}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  note: { color: "#666", fontSize: 13, marginBottom: 16, lineHeight: 18 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 20,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  hint: { fontSize: 12, color: "#666", marginTop: 6 },
  addButton: {
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  addButtonPressed: { backgroundColor: COLORS.navyDeep },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  error: { color: "#DC2626", fontSize: 13, marginTop: 10 },
  hoursCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F1F3",
    padding: 14,
    marginTop: -4,
    marginBottom: 10,
  },
  hoursHint: { fontSize: 12, color: "#666", marginBottom: 10, lineHeight: 16 },
  hoursActions: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  cancelText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
});
