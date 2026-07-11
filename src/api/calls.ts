import { api } from "./axios";

export interface CallRecord {
  id: string;
  caller_number: string | null;
  status: "completed" | "missed" | "failed";
  duration_seconds: number;
  intent: string | null;
  transcript: string | null;
  summary: string | null;
  created_at: string;
}

export async function listCalls(businessId: string) {
  const res = await api.get<{ calls: CallRecord[] }>("/calls", {
    params: { businessId },
  });
  return res.data.calls;
}
