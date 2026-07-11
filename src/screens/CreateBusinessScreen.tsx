import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation, useRoute } from "@react-navigation/native";
import { createBusinessSchema, CreateBusinessForm } from "../validation/business";
import { createBusiness, updateBusiness, Business } from "../api/business";
import { useBusiness } from "../context/BusinessContext";
import AppButton from "../components/AppButton";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export default function CreateBusinessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { refresh } = useBusiness();
  const [submitting, setSubmitting] = useState(false);

  const editingBusiness = (route.params as { business?: Business } | undefined)?.business;
  const isEditing = !!editingBusiness;

  const existingHours = editingBusiness?.business_hours?.mon;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBusinessForm>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      name: editingBusiness?.name ?? "",
      industry: editingBusiness?.industry ?? "",
      phoneNumber: editingBusiness?.phone_number ?? "",
      address: "",
      openTime: existingHours?.[0] ?? "09:00",
      closeTime: existingHours?.[1] ?? "18:00",
    },
  });

  async function onSubmit(values: CreateBusinessForm) {
    setSubmitting(true);
    try {
      const businessHours: Record<string, [string, string]> = {};
      for (const day of DAYS) {
        if (day === "sun") continue;
        businessHours[day] = [values.openTime, values.closeTime];
      }

      const payload = {
        name: values.name,
        industry: values.industry || undefined,
        phoneNumber: values.phoneNumber || undefined,
        address: values.address || undefined,
        businessHours,
      };

      const result = isEditing
        ? await updateBusiness(editingBusiness!.id, payload)
        : await createBusiness(payload);

      await refresh();

      Alert.alert(
        "Success",
        isEditing ? `"${result.name}" was updated.` : `"${result.name}" was created.`,
        [
          {
            text: "OK",
            onPress: () => {
              if (navigation.canGoBack()) navigation.goBack();
            },
          },
        ]
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.formErrors?.join(", ") ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong. Check your connection and try again.";
      Alert.alert("Error", typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isEditing ? "Edit business" : "Create your business"}</Text>
      <Text style={styles.subtitle}>
        This powers your AI receptionist's greeting, booking hours, and dashboard.
      </Text>

      <Field label="Business name *" error={errors.name?.message}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextInput
              style={styles.input}
              placeholder="Bright Smile Dental"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
      </Field>

      <Field label="Industry" error={errors.industry?.message}>
        <Controller
          control={control}
          name="industry"
          render={({ field }) => (
            <TextInput
              style={styles.input}
              placeholder="dental, salon, barber, medical..."
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
      </Field>

      <Field label="Phone number" error={errors.phoneNumber?.message}>
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field }) => (
            <TextInput
              style={styles.input}
              placeholder="+49 123 456789"
              keyboardType="phone-pad"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
      </Field>

      <Field label="Address" error={errors.address?.message}>
        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <TextInput
              style={styles.input}
              placeholder="Street, city"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
      </Field>

      <View style={styles.row}>
        <Field label="Opens *" error={errors.openTime?.message} style={{ flex: 1, marginRight: 8 }}>
          <Controller
            control={control}
            name="openTime"
            render={({ field }) => (
              <TextInput
                style={styles.input}
                placeholder="09:00"
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
        </Field>

        <Field label="Closes *" error={errors.closeTime?.message} style={{ flex: 1, marginLeft: 8 }}>
          <Controller
            control={control}
            name="closeTime"
            render={({ field }) => (
              <TextInput
                style={styles.input}
                placeholder="18:00"
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
        </Field>
      </View>

      <View style={{ marginTop: 20 }}>
        <AppButton
          title={isEditing ? "Save changes" : "Create business"}
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
        />
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  error,
  children,
  style,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subtitle: { color: "#666", marginBottom: 20 },
  row: { flexDirection: "row" },
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
