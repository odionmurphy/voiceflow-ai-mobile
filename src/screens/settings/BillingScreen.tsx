import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert, Linking } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useBusiness } from "../../context/BusinessContext";
import {
  getSubscription,
  getCheckoutUrl,
  changePlan,
  getBillingPortalUrl,
  hasLiveSubscription,
  Subscription,
} from "../../api/billing";
import { COLORS } from "../../theme";

const PLANS: { id: "starter" | "professional" | "business"; label: string; blurb: string }[] = [
  { id: "starter", label: "Starter", blurb: "Up to 100 calls / month" },
  { id: "professional", label: "Professional", blurb: "Up to 500 calls / month" },
  { id: "business", label: "Business", blurb: "Unlimited calls" },
];

const STATUS_LABEL: Record<string, string> = {
  trialing: "Trial (no card on file)",
  active: "Active",
  past_due: "Payment failed",
  cancelled: "Cancelled",
};

export default function BillingScreen() {
  const { activeBusiness } = useBusiness();
  const isOwner = activeBusiness?.role === "owner";

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPlan, setActionPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Re-checks status whenever this screen regains focus, so returning from the system
  // browser after finishing Stripe Checkout / the Billing Portal updates it automatically.
  useFocusEffect(
    useCallback(() => {
      if (!activeBusiness || !isOwner) {
        setLoading(false);
        return;
      }
      setLoading(true);
      getSubscription(activeBusiness.id)
        .then(setSubscription)
        .catch(() => Alert.alert("Error", "Could not load billing details."))
        .finally(() => setLoading(false));
    }, [activeBusiness, isOwner])
  );

  async function handleChoosePlan(plan: string) {
    if (!activeBusiness) return;
    setActionPlan(plan);
    try {
      if (hasLiveSubscription(subscription)) {
        const updated = await changePlan(activeBusiness.id, plan);
        setSubscription(updated);
      } else {
        const url = await getCheckoutUrl(activeBusiness.id, plan);
        await Linking.openURL(url);
      }
    } catch (err: any) {
      const message = err?.response?.data?.error || "Could not change plan.";
      Alert.alert("Error", typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setActionPlan(null);
    }
  }

  async function handleManageBilling() {
    if (!activeBusiness) return;
    setPortalLoading(true);
    try {
      const url = await getBillingPortalUrl(activeBusiness.id);
      await Linking.openURL(url);
    } catch (err: any) {
      const message = err?.response?.data?.error || "Could not open billing portal.";
      Alert.alert("Error", typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setPortalLoading(false);
    }
  }

  if (!activeBusiness) {
    return (
      <View style={styles.center}>
        <Text>No business selected yet.</Text>
      </View>
    );
  }

  if (!isOwner) {
    return (
      <View style={styles.center}>
        <Text style={styles.notice}>Only the business owner can view billing details.</Text>
      </View>
    );
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      {subscription && (
        <View style={styles.statusCard}>
          <Text style={styles.statusPlan}>
            {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
          </Text>
          <Text style={styles.statusLine}>
            {STATUS_LABEL[subscription.status] ?? subscription.status}
          </Text>
          <Text style={styles.statusLine}>
            {subscription.calls_used_this_period} /{" "}
            {subscription.calls_included >= 1_000_000 ? "∞" : subscription.calls_included} calls
            used this period
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Plans</Text>
      {PLANS.map((p) => {
        const isCurrent = subscription?.plan === p.id && subscription.status !== "cancelled";
        return (
          <View key={p.id} style={styles.planCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planLabel}>{p.label}</Text>
              <Text style={styles.planBlurb}>{p.blurb}</Text>
            </View>
            <Pressable
              onPress={() => handleChoosePlan(p.id)}
              disabled={isCurrent || actionPlan !== null}
              style={({ pressed }) => [
                styles.planButton,
                isCurrent && styles.planButtonCurrent,
                pressed && !isCurrent && styles.planButtonPressed,
                actionPlan !== null && !isCurrent && { opacity: 0.6 },
              ]}
            >
              <Text style={[styles.planButtonText, isCurrent && styles.planButtonTextCurrent]}>
                {isCurrent ? "Current plan" : actionPlan === p.id ? "..." : "Choose plan"}
              </Text>
            </Pressable>
          </View>
        );
      })}

      {subscription?.stripe_customer_id && (
        <Pressable
          onPress={handleManageBilling}
          disabled={portalLoading}
          style={({ pressed }) => [
            styles.manageButton,
            pressed && styles.manageButtonPressed,
            portalLoading && { opacity: 0.6 },
          ]}
        >
          {portalLoading ? (
            <ActivityIndicator color={COLORS.navy} />
          ) : (
            <Text style={styles.manageButtonText}>Manage billing</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  notice: { color: "#92400E", fontSize: 14, textAlign: "center" },
  container: { padding: 20 },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 20,
  },
  statusPlan: { fontSize: 18, fontWeight: "700", color: COLORS.ink, textTransform: "capitalize" },
  statusLine: { fontSize: 13, color: COLORS.inkSoft, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 10 },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 10,
  },
  planLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  planBlurb: { fontSize: 12, color: "#666", marginTop: 2 },
  planButton: {
    backgroundColor: COLORS.amber,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  planButtonPressed: { backgroundColor: COLORS.amberDeep },
  planButtonCurrent: { backgroundColor: "#F3F4F6" },
  planButtonText: { color: COLORS.navyDeep, fontWeight: "700", fontSize: 13 },
  planButtonTextCurrent: { color: "#888" },
  manageButton: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.navy,
    paddingVertical: 12,
    alignItems: "center",
  },
  manageButtonPressed: { backgroundColor: "#F3F4F6" },
  manageButtonText: { color: COLORS.navy, fontWeight: "700", fontSize: 15 },
});
