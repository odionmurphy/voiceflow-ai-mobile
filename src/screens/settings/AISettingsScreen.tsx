import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBusiness } from "../../context/BusinessContext";
import { getAISettings, updateAISettings, AIService, AIFaqItem } from "../../api/business";
import AppButton from "../../components/AppButton";
import LanguagePicker from "../../components/LanguagePicker";
import { COLORS } from "../../theme";

type ServiceRow = { name: string; durationMinutes: string; price: string };
type FaqRow = { question: string; answer: string };

function SectionCard({
  icon,
  title,
  description,
  headerRight,
  children,
}: {
  icon: string;
  title: string;
  description?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconBadgeText}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{title}</Text>
            {description ? <Text style={styles.cardDescription}>{description}</Text> : null}
          </View>
        </View>
        {headerRight}
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

export default function AISettingsScreen() {
  const { activeBusiness } = useBusiness();
  const isOwner = activeBusiness?.role === "owner";
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [greeting, setGreeting] = useState("");
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [faq, setFaq] = useState<FaqRow[]>([]);
  const [minNoticeHours, setMinNoticeHours] = useState("");
  const [bufferMinutes, setBufferMinutes] = useState("");
  const [maxPerDay, setMaxPerDay] = useState("");
  const [assistantName, setAssistantName] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [forwardingNumber, setForwardingNumber] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState("");
  const [loaded, setLoaded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["aiSettings", activeBusiness?.id],
    queryFn: () => getAISettings(activeBusiness!.id),
    enabled: !!activeBusiness,
  });

  useEffect(() => {
    if (data && !loaded) {
      setGreeting(data.greeting ?? "");
      setServices(
        (data.services ?? []).map((s: AIService) => ({
          name: s.name,
          durationMinutes: String(s.durationMinutes),
          price: String(s.price),
        }))
      );
      setFaq(
        (data.faq ?? []).map((f: AIFaqItem) => ({ question: f.question, answer: f.answer }))
      );
      setMinNoticeHours(
        data.booking_rules?.minNoticeHours != null ? String(data.booking_rules.minNoticeHours) : ""
      );
      setBufferMinutes(
        data.booking_rules?.bufferMinutes != null ? String(data.booking_rules.bufferMinutes) : ""
      );
      setMaxPerDay(
        data.booking_rules?.maxPerDay != null ? String(data.booking_rules.maxPerDay) : ""
      );
      setAssistantName(data.booking_rules?.assistantName ?? "");
      setLanguage(data.booking_rules?.language ?? "en-US");
      setForwardingNumber(data.booking_rules?.forwardingNumber ?? "");
      setNotifyEmail(data.booking_rules?.notifyEmail ?? "");
      setPrivacyPolicyUrl(data.booking_rules?.privacyPolicyUrl ?? "");
      setLoaded(true);
    }
  }, [data, loaded]);

  function addService() {
    setServices((prev) => [...prev, { name: "", durationMinutes: "30", price: "0" }]);
  }
  function removeService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }
  function updateService(index: number, field: keyof ServiceRow, value: string) {
    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function addFaq() {
    setFaq((prev) => [...prev, { question: "", answer: "" }]);
  }
  function removeFaq(index: number) {
    setFaq((prev) => prev.filter((_, i) => i !== index));
  }
  function updateFaq(index: number, field: keyof FaqRow, value: string) {
    setFaq((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  }

  async function handleSave() {
    if (!activeBusiness) return;

    const invalidService = services.find(
      (s) => !s.name.trim() || isNaN(Number(s.durationMinutes)) || isNaN(Number(s.price))
    );
    if (invalidService) {
      Alert.alert("Check services", "Each service needs a name, a numeric duration, and a numeric price.");
      return;
    }
    const invalidFaq = faq.find((f) => !f.question.trim() || !f.answer.trim());
    if (invalidFaq) {
      Alert.alert("Check FAQ", "Each FAQ entry needs both a question and an answer.");
      return;
    }
    if (notifyEmail && !/^\S+@\S+\.\S+$/.test(notifyEmail)) {
      Alert.alert("Check notification email", "That doesn't look like a valid email address.");
      return;
    }

    setSaving(true);
    setSaved(false);
    try {
      await updateAISettings(activeBusiness.id, {
        greeting,
        services: services.map((s) => ({
          name: s.name,
          durationMinutes: Number(s.durationMinutes),
          price: Number(s.price),
        })),
        faq,
        bookingRules: {
          minNoticeHours: minNoticeHours ? Number(minNoticeHours) : undefined,
          bufferMinutes: bufferMinutes ? Number(bufferMinutes) : undefined,
          maxPerDay: maxPerDay ? Number(maxPerDay) : undefined,
          assistantName: assistantName || undefined,
          forwardingNumber: forwardingNumber || undefined,
          notifyEmail: notifyEmail || undefined,
          privacyPolicyUrl: privacyPolicyUrl || undefined,
          language,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["aiSettings", activeBusiness.id] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || "Could not save AI settings.");
    } finally {
      setSaving(false);
    }
  }

  if (!activeBusiness) {
    return (
      <View style={styles.center}>
        <Text>No business selected yet.</Text>
      </View>
    );
  }

  if (isLoading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const inputStyle = (extra?: object) => [styles.input, !isOwner && styles.inputDisabled, extra];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!isOwner && (
        <Text style={styles.notice}>
          Only the business owner can edit AI settings. You&apos;re viewing this as staff.
        </Text>
      )}

      <SectionCard icon="🤖" title="Assistant" description="Name and greeting callers hear first">
        <Text style={styles.label}>Assistant name</Text>
        <TextInput
          style={inputStyle()}
          placeholder="e.g. Klara"
          editable={isOwner}
          value={assistantName}
          onChangeText={setAssistantName}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Language</Text>
        <Text style={styles.hint}>What your AI receptionist speaks and understands on calls.</Text>
        <LanguagePicker value={language} onChange={setLanguage} disabled={!isOwner} />

        <Text style={[styles.label, { marginTop: 12 }]}>Greeting</Text>
        <TextInput
          style={inputStyle({ height: 80 })}
          multiline
          editable={isOwner}
          value={greeting}
          onChangeText={setGreeting}
          placeholder="Hello! Thank you for calling..."
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Preview</Text>
        <View style={styles.previewBubble}>
          <View style={styles.previewHeaderRow}>
            <View style={styles.previewDot} />
            <Text style={styles.previewHeaderText}>INCOMING CALL</Text>
          </View>
          <Text style={styles.previewGreeting}>
            {greeting || "Hello! Thank you for calling..."}
          </Text>
          <Text style={styles.previewSignature}>
            — {assistantName || "Your AI receptionist"}
          </Text>
        </View>
      </SectionCard>

      <SectionCard
        icon="💼"
        title="Services"
        description="What callers can book"
        headerRight={
          isOwner && (
            <Pressable onPress={addService}>
              <Text style={styles.addLink}>+ Add</Text>
            </Pressable>
          )
        }
      >
        {services.length === 0 && <Text style={styles.hint}>No services yet.</Text>}
        {services.map((s, i) => (
          <View key={i} style={styles.rowCard}>
            <TextInput
              style={inputStyle(styles.rowInputName)}
              placeholder="Service name"
              editable={isOwner}
              value={s.name}
              onChangeText={(v) => updateService(i, "name", v)}
            />
            <TextInput
              style={inputStyle(styles.rowInputSmall)}
              placeholder="Min"
              keyboardType="numeric"
              editable={isOwner}
              value={s.durationMinutes}
              onChangeText={(v) => updateService(i, "durationMinutes", v)}
            />
            <TextInput
              style={inputStyle(styles.rowInputSmall)}
              placeholder="€"
              keyboardType="numeric"
              editable={isOwner}
              value={s.price}
              onChangeText={(v) => updateService(i, "price", v)}
            />
            {isOwner && (
              <Pressable onPress={() => removeService(i)} style={styles.removeBtn}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            )}
          </View>
        ))}
      </SectionCard>

      <SectionCard
        icon="❓"
        title="FAQ"
        description="Answers your AI can give directly"
        headerRight={
          isOwner && (
            <Pressable onPress={addFaq}>
              <Text style={styles.addLink}>+ Add</Text>
            </Pressable>
          )
        }
      >
        {faq.length === 0 && <Text style={styles.hint}>No FAQ entries yet.</Text>}
        {faq.map((f, i) => (
          <View key={i} style={styles.faqBlock}>
            <View style={styles.faqRow}>
              <View style={[styles.qaBadge, styles.qaBadgeQ]}>
                <Text style={styles.qaBadgeTextQ}>Q</Text>
              </View>
              <TextInput
                style={[inputStyle(), { flex: 1 }]}
                placeholder="Question"
                editable={isOwner}
                value={f.question}
                onChangeText={(v) => updateFaq(i, "question", v)}
              />
            </View>
            <View style={[styles.faqRow, { marginTop: 8 }]}>
              <View style={[styles.qaBadge, styles.qaBadgeA]}>
                <Text style={styles.qaBadgeTextA}>A</Text>
              </View>
              <TextInput
                style={[inputStyle(), { flex: 1 }]}
                placeholder="Answer"
                editable={isOwner}
                value={f.answer}
                onChangeText={(v) => updateFaq(i, "answer", v)}
              />
            </View>
            {isOwner && (
              <Pressable onPress={() => removeFaq(i)} style={{ marginTop: 8, marginLeft: 28 }}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            )}
          </View>
        ))}
      </SectionCard>

      <SectionCard icon="📋" title="Booking rules" description="Guardrails your AI follows">
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={styles.label}>Min notice (hrs)</Text>
            <TextInput
              style={inputStyle()}
              keyboardType="numeric"
              editable={isOwner}
              value={minNoticeHours}
              onChangeText={setMinNoticeHours}
            />
          </View>
          <View style={{ flex: 1, marginHorizontal: 6 }}>
            <Text style={styles.label}>Buffer (min)</Text>
            <TextInput
              style={inputStyle()}
              keyboardType="numeric"
              editable={isOwner}
              value={bufferMinutes}
              onChangeText={setBufferMinutes}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Text style={styles.label}>Max/day</Text>
            <TextInput
              style={inputStyle()}
              keyboardType="numeric"
              editable={isOwner}
              value={maxPerDay}
              onChangeText={setMaxPerDay}
            />
          </View>
        </View>
      </SectionCard>

      <SectionCard
        icon="🚨"
        title="Escalation & notifications"
        description="Where things go when your AI can't handle it alone"
      >
        <Text style={styles.label}>Forwarding number (emergencies / explicit request)</Text>
        <TextInput
          style={inputStyle()}
          placeholder="+49 170 1234567"
          keyboardType="phone-pad"
          editable={isOwner}
          value={forwardingNumber}
          onChangeText={setForwardingNumber}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Notify email (call summaries)</Text>
        <TextInput
          style={inputStyle()}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          editable={isOwner}
          value={notifyEmail}
          onChangeText={setNotifyEmail}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Privacy policy URL</Text>
        <Text style={styles.hint}>
          Required if your AI needs to point callers to your Datenschutzerklärung.
        </Text>
        <TextInput
          style={inputStyle()}
          placeholder="https://yourbusiness.de/datenschutz"
          autoCapitalize="none"
          editable={isOwner}
          value={privacyPolicyUrl}
          onChangeText={setPrivacyPolicyUrl}
        />
      </SectionCard>

      {isOwner && (
        <View style={styles.saveRow}>
          <View style={{ flex: 1 }}>
            <AppButton title="Save AI settings" onPress={handleSave} loading={saving} />
          </View>
          {saved && <Text style={styles.savedText}>Saved</Text>}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { padding: 20, paddingBottom: 40 },
  notice: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    fontSize: 12,
    fontWeight: "600",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 0,
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "flex-start", flex: 1, marginRight: 8 },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.navySoft,
  },
  iconBadgeText: { fontSize: 16 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  cardDescription: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  cardBody: { padding: 16, paddingTop: 12 },
  addLink: { color: COLORS.navy, fontWeight: "700", fontSize: 13, marginTop: 6 },
  hint: { color: "#666", fontSize: 13, marginTop: 4, marginBottom: 4 },
  label: { fontSize: 12, color: "#444", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
  },
  inputDisabled: { backgroundColor: "#F3F4F6", color: "#888" },
  row: { flexDirection: "row", alignItems: "center" },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F0F1F3",
    padding: 8,
    marginBottom: 8,
  },
  rowInputName: { flex: 2, marginRight: 6, backgroundColor: "#fff" },
  rowInputSmall: { flex: 1, marginRight: 6, backgroundColor: "#fff" },
  removeBtn: { padding: 8 },
  removeText: { color: "#DC2626", fontWeight: "600" },
  faqBlock: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F0F1F3",
    padding: 10,
    marginBottom: 10,
  },
  faqRow: { flexDirection: "row", alignItems: "center" },
  qaBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qaBadgeQ: { backgroundColor: "#D6EFEB" },
  qaBadgeA: { backgroundColor: "#F2DDB3" },
  qaBadgeTextQ: { fontSize: 10, fontWeight: "800", color: COLORS.teal },
  qaBadgeTextA: { fontSize: 10, fontWeight: "800", color: COLORS.amberDeep },
  previewBubble: {
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    padding: 14,
    minHeight: 110,
    justifyContent: "space-between",
  },
  previewHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  previewDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.signal },
  previewHeaderText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.4,
  },
  previewGreeting: { fontSize: 14, color: "#fff", marginTop: 10, lineHeight: 20, flex: 1 },
  previewSignature: { fontSize: 12, fontWeight: "700", color: COLORS.amber, marginTop: 10 },
  saveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 20,
    gap: 12,
  },
  savedText: { color: COLORS.teal, fontWeight: "700" },
});
