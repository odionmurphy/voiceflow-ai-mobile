import { api } from "./axios";

export interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  notes: string | null;
  last_visit_at: string | null;
}

export async function listCustomers(businessId: string) {
  const res = await api.get<{ customers: Customer[] }>("/customers", {
    params: { businessId },
  });
  return res.data.customers;
}

export async function createCustomer(payload: {
  businessId: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  notes?: string;
}) {
  const res = await api.post<{ customer: Customer }>("/customers", payload);
  return res.data.customer;
}

export async function updateCustomer(
  id: string,
  payload: Partial<{ fullName: string; phoneNumber: string; email: string; notes: string }>
) {
  const res = await api.patch<{ customer: Customer }>(`/customers/${id}`, payload);
  return res.data.customer;
}

export async function deleteCustomer(id: string) {
  await api.delete(`/customers/${id}`);
}
