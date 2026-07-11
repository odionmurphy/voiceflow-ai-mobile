import React, { useRef, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useBusiness } from "../context/BusinessContext";
import { listAppointments, Appointment } from "../api/appointments";
import { listCalls, CallRecord } from "../api/calls";
import StatCard from "../components/StatCard";
import AppointmentCard from "../components/AppointmentCard";
import CallsListModal from "../components/CallsListModal";
import TrendsSection from "../components/TrendsSection";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const scrollRef = useRef<ScrollView>(null);
  const scheduleY = useRef(0);
  const [callsModal, setCallsModal] = useState<{ title: string; calls: CallRecord[] } | null>(
    null
  );

  const { data: appointments, isLoading: apptsLoading } = useQuery({
    queryKey: ["appointments", activeBusiness?.id],
    queryFn: () => listAppointments(activeBusiness!.id),
    enabled: !!activeBusiness,
  });

  const { data: calls, isLoading: callsLoading } = useQuery({
    queryKey: ["calls", activeBusiness?.id],
    queryFn: () => listCalls(activeBusiness!.id),
    enabled: !!activeBusiness,
  });

  if (businessLoading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (!activeBusiness) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>No business yet</Text>
        <Text style={styles.subtitle}>
          Create one via Settings first, then pull to refresh here.
        </Text>
      </View>
    );
  }

  const today = new Date().toDateString();

  const todaysAppointments = (appointments ?? []).filter(
    (a) => new Date(a.start_time).toDateString() === today
  );

  const todaysCalls = (calls ?? []).filter(
    (c) => new Date(c.created_at).toDateString() === today
  );
  const answeredCalls = todaysCalls.filter((c) => c.status === "completed");
  const missedCalls = todaysCalls.filter((c) => c.status === "missed");

  const isLoading = apptsLoading || callsLoading;

  function openAppointment(appointment: Appointment) {
    (navigation as any).navigate("Appointments", {
      screen: "AppointmentDetails",
      params: { appointment },
    });
  }

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>{activeBusiness.name}</Text>

      {isLoading && <ActivityIndicator style={{ marginTop: 10, marginBottom: 10 }} />}

      <View style={styles.statsRow}>
        <StatCard
          label="Appointments today"
          value={String(todaysAppointments.length)}
          icon="📅"
          tone="navy"
          delay={0}
          onPress={() => scrollRef.current?.scrollTo({ y: scheduleY.current - 12, animated: true })}
        />
        <StatCard
          label="Calls answered"
          value={String(answeredCalls.length)}
          icon="📞"
          tone="teal"
          delay={40}
          onPress={() => setCallsModal({ title: "Calls answered today", calls: answeredCalls })}
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          label="Missed calls"
          value={String(missedCalls.length)}
          icon="⚠️"
          tone={missedCalls.length > 0 ? "red" : "navy"}
          delay={80}
          onPress={() => setCallsModal({ title: "Missed calls today", calls: missedCalls })}
        />
        <StatCard
          label="Revenue"
          value="—"
          note="Coming in Phase 4 (billing)"
          icon="💰"
          tone="amber"
          delay={120}
          onPress={() =>
            Alert.alert(
              "Revenue",
              "Revenue tracking is coming in Phase 4 (billing) — it'll be wired up to Stripe subscriptions and per-appointment revenue."
            )
          }
        />
      </View>

      <Text
        style={styles.sectionTitle}
        onLayout={(e) => {
          scheduleY.current = e.nativeEvent.layout.y;
        }}
      >
        Today&apos;s schedule
      </Text>
      {todaysAppointments.map((a, i) => (
        <AppointmentCard
          key={a.id}
          appointment={a}
          compact
          delay={i * 40}
          onPress={() => openAppointment(a)}
        />
      ))}

      {!isLoading && todaysAppointments.length === 0 && (
        <Text style={{ marginTop: 8, color: "#666" }}>No appointments today.</Text>
      )}

      <TrendsSection businessId={activeBusiness.id} />

      {callsModal && (
        <CallsListModal
          visible
          title={callsModal.title}
          calls={callsModal.calls}
          onClose={() => setCallsModal(null)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#111827" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 20, marginBottom: 10, color: "#111827" },
  subtitle: { color: "#666", marginBottom: 16, textAlign: "center" },
  statsRow: { flexDirection: "row", marginBottom: 12 },
});
