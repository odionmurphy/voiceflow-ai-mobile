import { api } from "./axios";

export interface Appointment {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  service_name: string | null;
  price: number | null;
  start_time: string;
  end_time: string;
  status: string;
  source: "ai_call" | "manual" | "web";
}

export async function listAppointments(businessId: string) {
  const res = await api.get<{ appointments: Appointment[] }>("/appointments", {
    params: { businessId },
  });
  return res.data.appointments;
}

export async function createAppointment(payload: {
  businessId: string;
  customerId: string;
  serviceName?: string;
  startTime: string;
  endTime: string;
  source?: "manual" | "ai_call" | "web";
  staffId?: string;
}) {
  const res = await api.post("/appointments", payload);
  return res.data.appointment;
}

export async function updateAppointment(
  id: string,
  payload: Partial<{
    startTime: string;
    endTime: string;
    status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
    serviceName: string;
  }>
) {
  const res = await api.patch(`/appointments/${id}`, payload);
  return res.data.appointment;
}

export async function cancelAppointment(id: string) {
  await api.delete(`/appointments/${id}`);
}

export async function deleteAppointmentPermanently(id: string) {
  await api.delete(`/appointments/${id}/permanent`);
}

export async function getAvailability(params: {
  businessId: string;
  date: string;
  durationMinutes: number;
  staffId?: string;
}) {
  const res = await api.get("/appointments/availability", {
    params,
  });

  return res.data.slots as string[];
}
