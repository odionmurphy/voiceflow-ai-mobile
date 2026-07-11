import { api } from "./axios";

export type BusinessMemberRole = "owner" | "staff";

export interface Business {
  id: string;
  name: string;
  industry: string | null;
  phone_number: string | null;
  timezone: string;
  business_hours: Record<string, [string, string]>;
  role: BusinessMemberRole;
}

export interface BusinessMember {
  user_id: string;
  email: string;
  full_name: string;
  role: BusinessMemberRole;
  working_hours: Record<string, [string, string]>;
  created_at: string;
}

export interface CreateBusinessPayload {
  name: string;
  industry?: string;
  phoneNumber?: string;
  timezone?: string;
  address?: string;
  businessHours?: Record<string, [string, string]>;
}

export interface AIService {
  name: string;
  durationMinutes: number;
  price: number;
}

export interface AIFaqItem {
  question: string;
  answer: string;
}

export interface AIBookingRules {
  minNoticeHours?: number;
  bufferMinutes?: number;
  maxPerDay?: number;
  assistantName?: string;
  forwardingNumber?: string;
  notifyEmail?: string;
  privacyPolicyUrl?: string;
  language?: string;
}

export interface AISettings {
  business_id: string;
  greeting: string;
  voice_id: string;
  services: AIService[];
  faq: AIFaqItem[];
  booking_rules: AIBookingRules;
}

export async function listBusinesses() {
  const res = await api.get<{ businesses: Business[] }>("/business");
  return res.data.businesses;
}

export async function createBusiness(payload: CreateBusinessPayload) {
  const res = await api.post<{ business: Business }>("/business", payload);
  return res.data.business;
}

export async function updateBusiness(id: string, payload: Partial<CreateBusinessPayload>) {
  const res = await api.patch<{ business: Business }>(`/business/${id}`, payload);
  return res.data.business;
}

export async function deleteBusiness(id: string) {
  await api.delete(`/business/${id}`);
}

export async function listMembers(businessId: string) {
  const res = await api.get<{ members: BusinessMember[] }>(`/business/${businessId}/members`);
  return res.data.members;
}

export async function addMember(businessId: string, email: string) {
  const res = await api.post<{ member: BusinessMember }>(`/business/${businessId}/members`, {
    email,
    role: "staff",
  });
  return res.data.member;
}

export async function removeMember(businessId: string, userId: string) {
  await api.delete(`/business/${businessId}/members/${userId}`);
}

export async function setStaffWorkingHours(
  businessId: string,
  userId: string,
  workingHours: Record<string, [string, string]>
) {
  const res = await api.patch<{ member: BusinessMember }>(
    `/business/${businessId}/members/${userId}/hours`,
    { workingHours }
  );
  return res.data.member;
}

export async function getAISettings(businessId: string) {
  const res = await api.get<{ aiSettings: AISettings }>(`/business/${businessId}/ai-settings`);
  return res.data.aiSettings;
}

export async function updateAISettings(
  businessId: string,
  payload: Partial<{
    greeting: string;
    voiceId: string;
    services: AIService[];
    faq: AIFaqItem[];
    bookingRules: AIBookingRules;
  }>
) {
  const res = await api.patch<{ aiSettings: AISettings }>(
    `/business/${businessId}/ai-settings`,
    payload
  );
  return res.data.aiSettings;
}
