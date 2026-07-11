import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { login } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import AppButton from "../../components/AppButton";
import { COLORS } from "../../theme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("murphy@example.com");
  const [password, setPassword] = useState("supersecret1");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const data = await login({ email, password });
      await signIn(data.token, data.user);
    } catch {
      Alert.alert("Error", "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.brand}>
          <Text style={styles.brandName}>VoiceFlow AI</Text>
          <View style={styles.brandAccent} />
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to manage your business.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
          <TextInput
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <View style={{ marginTop: 22 }}>
            <AppButton title="Log in" onPress={handleLogin} loading={loading} />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  brand: { alignItems: "center", marginBottom: 32 },
  brandName: { fontSize: 22, fontWeight: "800", color: COLORS.navy, letterSpacing: -0.3 },
  brandAccent: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.amber, marginTop: 8 },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.ink, textAlign: "center" },
  subtitle: { fontSize: 14, color: COLORS.inkSoft, textAlign: "center", marginTop: 6 },
  card: {
    marginTop: 28,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  label: { fontSize: 12, fontWeight: "600", color: "#444" },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fff",
    color: COLORS.ink,
  },
});
