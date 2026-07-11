import { api } from "./axios";

export interface CalendarConnection {
  provider: string;
  calendar_id: string | null;
  expires_at: string | null;
}

export async function getCalendarStatus(businessId: string) {
  const res = await api.get<{ connections: CalendarConnection[] }>(
    `/calendar/${businessId}/status`
  );
  return res.data.connections;
}

export async function getGoogleConnectUrl(businessId: string) {
  const res = await api.get<{ authUrl: string }>(`/calendar/${businessId}/google/connect`, {
    params: { client: "mobile" },
  });
  return res.data.authUrl;
}

export async function disconnectGoogleCalendar(businessId: string) {
  await api.delete(`/calendar/${businessId}/google`);
}
