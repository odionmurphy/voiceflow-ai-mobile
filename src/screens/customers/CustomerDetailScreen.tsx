import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { updateCustomer, deleteCustomer, Customer } from "../../api/customers";
import { useBusiness } from "../../context/BusinessContext";
import AppButton from "../../components/AppButton";

export default function CustomerDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const { activeBusiness } = useBusiness();
  const isOwner = activeBusiness?.role === "owner";

  const customer = (route.params as { customer: Customer }).customer;

  const [fullName, setFullName] = useState(customer.full_name);
  const [phoneNumber, setPhoneNumber] = useState(customer.phone_number);
  const [email, setEmail] = useState(customer.email ?? "");
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateCustomer(customer.id, {
        fullName,
        phoneNumber,
        email: email || undefined,
        notes: notes || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["customers", activeBusiness?.id] });
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Could not save changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert("Delete customer", `Delete ${customer.full_name}? This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteCustomer(customer.id);
            queryClient.invalidateQueries({ queryKey: ["customers", activeBusiness?.id] });
            navigation.goBack();
          } catch {
            Alert.alert("Error", "Could not delete customer. Try again.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

      <Text style={styles.label}>Phone number</Text>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={notes} onChangeText={setNotes} multiline />

      <Text style={styles.label}>Last visit</Text>
      <Text style={styles.value}>
        {customer.last_visit_at ? new Date(customer.last_visit_at).toLocaleDateString() : "—"}
      </Text>

      <View style={{ marginTop: 20 }}>
        <AppButton title="Save changes" onPress={handleSave} loading={saving} />
      </View>

      {isOwner && (
        <View style={{ marginTop: 12 }}>
          <AppButton
            title="Delete customer"
            variant="danger"
            onPress={handleDelete}
            loading={deleting}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  label: { fontSize: 13, color: "#444", marginBottom: 4, marginTop: 14, fontWeight: "600" },
  value: { fontSize: 15, color: "#111" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
});
