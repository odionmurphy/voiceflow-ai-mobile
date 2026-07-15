import { api } from "./axios";

export interface AnalyticsDay {
  day: string; // YYYY-MM-DD
  calls_answered: number;
  calls_missed: number;
  appointments_booked: number;
}

export interface Analytics {
  range: { from: string; to: string; days: number };
  totals: {
    calls_total: number;
    calls_answered: number;
    calls_missed: number;
    appointments_total: number;
    appointments_completed: number;
    appointments_cancelled: number;
    appointments_no_show: number;
    revenue: number;
    answerRate: number | null;
    noShowRate: number | null;
  };
  daily: AnalyticsDay[];
}

export async function getAnalytics(businessId: string, days: number) {
  const res = await api.get<Analytics>(`/analytics/${businessId}`, {
    params: { days },
  });
  return res.data;
}
