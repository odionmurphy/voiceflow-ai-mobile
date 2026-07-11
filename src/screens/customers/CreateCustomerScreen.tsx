import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { createCustomerSchema, CreateCustomerForm } from "../../validation/customer";
import { createCustomer } from "../../api/customers";
import { useBusiness } from "../../context/BusinessContext";
import AppButton from "../../components/AppButton";

export default function CreateCustomerScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { activeBusiness } = useBusiness();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCustomerForm>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: { fullName: "", phoneNumber: "", email: "" },
  });

  async function onSubmit(values: CreateCustomerForm) {
    if (!activeBusiness) return;
    setSubmitting(true);
    try {
      const customer = await createCustomer({
        businessId: activeBusiness.id,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        email: values.email || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["customers", activeBusiness.id] });

      Alert.alert("Success", `"${customer.full_name}" was added.`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.formErrors?.join(", ") ||
        err?.response?.data?.error ||
        "Could not add customer. Try again.";
      Alert.alert("Error", typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add customer</Text>

      <Field label="Full name *" error={errors.fullName?.message}>
        <Controller
          control={control}
          name="fullName"
          render={({ field }) => (
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
      </Field>

      <Field label="Phone number *" error={errors.phoneNumber?.message}>
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field }) => (
            <TextInput
              style={styles.input}
              placeholder="+49 170 1234567"
              keyboardType="phone-pad"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
      </Field>

      <Field label="Email" error={errors.email?.message}>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
      </Field>

      <View style={{ marginTop: 20 }}>
        <AppButton title="Add customer" onPress={handleSubmit(onSubmit)} loading={submitting} />
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 13, color: "#444", marginBottom: 4, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  error: { color: "#DC2626", fontSize: 12, marginTop: 4 },
});
