import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import AppButton from "../components/AppButton";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { deleteBusiness, Business } from "../api/business";
import {
  getCalendarStatus,
  getGoogleConnectUrl,
  disconnectGoogleCalendar,
  CalendarConnection,
} from "../api/calendar";
import { COLORS } from "../theme";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const { businesses, activeBusiness, setActiveBusinessId, refresh } = useBusiness();
  const isOwner = activeBusiness?.role === "owner";

  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const googleConnection = connections.find((c) => c.provider === "google");

  // Re-checks status whenever this screen regains focus, so returning from the system
  // browser after completing the Google consent flow updates the status automatically.
  useFocusEffect(
    useCallback(() => {
      if (!activeBusiness) return;
      setCalendarLoading(true);
      getCalendarStatus(activeBusiness.id)
        .then(setConnections)
        .finally(() => setCalendarLoading(false));
    }, [activeBusiness])
  );

  async function handleConnectCalendar() {
    if (!activeBusiness) return;
    setConnecting(true);
    try {
      const authUrl = await getGoogleConnectUrl(activeBusiness.id);
      await Linking.openURL(authUrl);
    } catch (err: any) {
      const message = err?.response?.data?.error || "Could not start the connection.";
      Alert.alert("Error", typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnectCalendar() {
    if (!activeBusiness) return;
    Alert.alert(
      "Disconnect Google Calendar",
      "Future bookings will no longer sync.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            setDisconnecting(true);
            try {
              await disconnectGoogleCalendar(activeBusiness.id);
              setConnections((prev) => prev.filter((c) => c.provider !== "google"));
            } catch {
              Alert.alert("Error", "Could not disconnect. Try again.");
            } finally {
              setDisconnecting(false);
            }
          },
        },
      ]
    );
  }

  function handleDelete(business: Business) {
    Alert.alert(
      "Delete business",
      `Delete "${business.name}"? This also removes its customers, appointments, and call history. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBusiness(business.id);
              await refresh();
            } catch (err: any) {
              Alert.alert("Error", "Could not delete business. Try again.");
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.label}>Active business</Text>
      <Text style={styles.value}>{activeBusiness?.name ?? "None yet"}</Text>

      <Text style={[styles.label, { marginTop: 20 }]}>Account</Text>
      <Text style={styles.value}>{user?.email ?? "—"}</Text>

      <Text style={[styles.label, { marginTop: 24 }]}>
        All businesses ({businesses.length})
      </Text>
      <View style={{ marginTop: 8 }}>
        {businesses.map((item) => (
          <View
            key={item.id}
            style={[
              styles.businessRow,
              item.id === activeBusiness?.id && styles.businessRowActive,
            ]}
          >
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setActiveBusinessId(item.id)}>
              <Text style={styles.businessName}>{item.name}</Text>
              {item.id === activeBusiness?.id && <Text style={styles.activeTag}>ACTIVE</Text>}
            </TouchableOpacity>
            {item.role === "owner" && (
              <>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => (navigation as any).navigate("AddBusiness", { business: item })}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
                  <Text style={[styles.actionText, { color: "#DC2626" }]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <AppButton
          title="Add another business"
          onPress={() => navigation.navigate("AddBusiness" as never)}
        />
      </View>

      <View style={{ marginTop: 14 }}>
        <AppButton
          title="AI Settings"
          variant="outline"
          onPress={() => navigation.navigate("AISettings" as never)}
        />
      </View>

      {activeBusiness && (
        <View style={styles.calendarSection}>
          <Text style={styles.label}>Calendar</Text>
          <Text style={styles.calendarHint}>
            Sync bookings to a Google Calendar so appointments show up alongside your other
            events.
          </Text>

          <View style={styles.calendarCard}>
            <View style={styles.calendarCardTop}>
              <View style={styles.googleBadge}>
                <Text style={styles.googleBadgeText}>G</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.calendarTitle}>Google Calendar</Text>
                <Text style={styles.calendarStatus}>
                  {calendarLoading
                    ? "Checking status..."
                    : googleConnection
                    ? `Connected${
                        googleConnection.calendar_id ? ` · ${googleConnection.calendar_id}` : ""
                      }`
                    : "Not connected"}
                </Text>
              </View>
              {!calendarLoading && googleConnection && (
                <View style={styles.connectedPill}>
                  <View style={styles.connectedDot} />
                  <Text style={styles.connectedPillText}>Connected</Text>
                </View>
              )}
            </View>

            {calendarLoading ? (
              <ActivityIndicator style={{ marginTop: 14 }} />
            ) : (
              isOwner &&
              (googleConnection ? (
                <Pressable
                  onPress={handleDisconnectCalendar}
                  disabled={disconnecting}
                  style={({ pressed }) => [
                    styles.calendarButton,
                    styles.disconnectButton,
                    pressed && styles.disconnectButtonPressed,
                    disconnecting && { opacity: 0.6 },
                  ]}
                >
                  <Text style={styles.disconnectButtonText}>
                    {disconnecting ? "Disconnecting..." : "Disconnect"}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={handleConnectCalendar}
                  disabled={connecting}
                  style={({ pressed }) => [
                    styles.calendarButton,
                    styles.connectButton,
                    pressed && styles.connectButtonPressed,
                    connecting && { opacity: 0.6 },
                  ]}
                >
                  <Text style={styles.connectButtonText}>
                    {connecting ? "Redirecting..." : "Connect Google Calendar"}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      )}

      <View style={{ marginTop: 14 }}>
        <AppButton
          title="Team"
          variant="outline"
          onPress={() => navigation.navigate("Team" as never)}
        />
      </View>

      <View style={{ marginTop: 14 }}>
        <AppButton
          title="Messages"
          variant="outline"
          onPress={() => navigation.navigate("Messages" as never)}
        />
      </View>

      {isOwner && (
        <View style={{ marginTop: 14 }}>
          <AppButton
            title="Billing"
            variant="outline"
            onPress={() => navigation.navigate("Billing" as never)}
          />
        </View>
      )}

      <View style={{ marginTop: 14 }}>
        <AppButton title="Log out" variant="danger" onPress={signOut} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  label: { color: "#666", fontSize: 13, textTransform: "uppercase" },
  value: { fontSize: 18, fontWeight: "600", marginTop: 4 },
  businessRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  businessRowActive: {
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  businessName: { fontSize: 15, fontWeight: "500" },
  activeTag: { fontSize: 11, color: "#3B82F6", fontWeight: "700" },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  actionText: { fontSize: 13, fontWeight: "600", color: "#3B82F6" },
  calendarSection: { marginTop: 24 },
  calendarHint: { fontSize: 13, color: "#666", marginTop: 4, lineHeight: 18 },
  calendarCard: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  calendarCardTop: { flexDirection: "row", alignItems: "center" },
  googleBadge: {
    width: 40,
    height: 40,
    borderRadius: 11,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF3FE",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  googleBadgeText: { fontSize: 18, fontWeight: "800", color: "#4285F4" },
  calendarTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  calendarStatus: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  connectedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#E4F4F1",
  },
  connectedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.teal },
  connectedPillText: { fontSize: 11, fontWeight: "700", color: COLORS.teal },
  calendarButton: {
    marginTop: 14,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: "center",
  },
  connectButton: { backgroundColor: COLORS.navy },
  connectButtonPressed: { backgroundColor: COLORS.navyDeep },
  connectButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  disconnectButton: { borderWidth: 1, borderColor: "#FCA5A5", backgroundColor: "#FEF7F7" },
  disconnectButtonPressed: { backgroundColor: "#FEE2E2" },
  disconnectButtonText: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
});
