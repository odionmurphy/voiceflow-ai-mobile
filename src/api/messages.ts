import { api } from "./axios";

export interface Message {
  id: string;
  business_id: string;
  customer_id: string | null;
  customer_name: string | null;
  appointment_id: string | null;
  channel: "sms" | "email" | "push";
  template: "confirmation" | "cancellation" | "reminder" | null;
  body: string | null;
  status: "sent" | "failed" | "delivered";
  created_at: string;
}

export async function listMessages(businessId: string) {
  const res = await api.get<{ messages: Message[] }>("/messages", {
    params: { businessId },
  });
  return res.data.messages;
}
