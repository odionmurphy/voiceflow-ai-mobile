import React, { useRef, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useBusiness } from "../context/BusinessContext";
import { listAppointments, Appointment } from "../api/appointments";
import { listCalls, CallRecord } from "../api/calls";
import StatCard from "../components/StatCard";
import AppointmentCard from "../components/AppointmentCard";
import CallsListModal from "../components/CallsListModal";
import RevenueListModal from "../components/RevenueListModal";
import TrendsSection from "../components/TrendsSection";
import { COLORS } from "../theme";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const scrollRef = useRef<ScrollView>(null);
  const scheduleY = useRef(0);
  const [callsModal, setCallsModal] = useState<{ title: string; calls: CallRecord[] } | null>(
    null
  );
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);

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
    return (
      <View style={styles.screen}>
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.navy} />
      </View>
    );
  }

  if (!activeBusiness) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.emptyBusinessTitle}>No business yet</Text>
        <Text style={styles.emptyBusinessSubtitle}>
          Create one via Settings first, then pull to refresh here.
        </Text>
      </View>
    );
  }

  const now = new Date();
  const today = now.toDateString();

  const todaysAppointments = (appointments ?? []).filter(
    (a) => new Date(a.start_time).toDateString() === today
  );

  const todaysCalls = (calls ?? []).filter(
    (c) => new Date(c.created_at).toDateString() === today
  );
  const answeredCalls = todaysCalls.filter((c) => c.status === "completed");
  const missedCalls = todaysCalls.filter((c) => c.status === "missed");
  const revenueAppointments = todaysAppointments.filter(
    (a) => (a.status === "confirmed" || a.status === "completed") && a.price != null
  );
  const revenueToday = revenueAppointments.reduce((sum, a) => sum + (a.price ?? 0), 0);

  const isLoading = apptsLoading || callsLoading;

  function openAppointment(appointment: Appointment) {
    (navigation as any).navigate("Appointments", {
      screen: "AppointmentDetails",
      params: { appointment },
    });
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.greeting}>
        {greetingForHour(now.getHours())} · {now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
      </Text>
      <Text style={styles.title}>{activeBusiness.name}</Text>

      {isLoading && (
        <ActivityIndicator style={{ marginTop: 10, marginBottom: 10 }} color={COLORS.navy} />
      )}

      <Text style={styles.sectionLabel}>Today</Text>
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
          value={`$${revenueToday.toFixed(2)}`}
          note="Confirmed + completed"
          icon="💰"
          tone="amber"
          delay={120}
          onPress={() => setRevenueModalOpen(true)}
        />
      </View>

      <Text
        style={[styles.sectionLabel, styles.sectionSpacing]}
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
        <View style={styles.emptyCard}>
          <Text style={styles.emptyCardIcon}>🗓️</Text>
          <Text style={styles.emptyCardText}>No appointments today.</Text>
        </View>
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

      <RevenueListModal
        visible={revenueModalOpen}
        title="Revenue today"
        appointments={revenueAppointments}
        onClose={() => setRevenueModalOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.paper },
  container: { padding: 20, paddingBottom: 60 },
  center: { justifyContent: "center", alignItems: "center" },
  greeting: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.inkSoft,
    marginBottom: 4,
  },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 20, color: COLORS.ink, letterSpacing: -0.5 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  sectionSpacing: { marginTop: 24 },
  emptyBusinessTitle: { fontSize: 18, fontWeight: "700", color: COLORS.ink, marginBottom: 8 },
  emptyBusinessSubtitle: { color: COLORS.inkSoft, textAlign: "center" },
  statsRow: { flexDirection: "row", marginBottom: 12 },
  emptyCard: {
    marginTop: 4,
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECE8",
    borderStyle: "dashed",
    paddingVertical: 28,
    alignItems: "center",
  },
  emptyCardIcon: { fontSize: 26, marginBottom: 8 },
  emptyCardText: { color: COLORS.inkSoft, fontSize: 14, fontWeight: "600" },
});
