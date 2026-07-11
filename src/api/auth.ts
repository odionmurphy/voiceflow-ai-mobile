import { api } from "./axios";
import { LoginRequest, RegisterRequest, AuthResponse, AuthUser } from "../types/auth";

export async function login(data: LoginRequest) {
  const response = await api.post<AuthResponse>("/auth/login", data);
  return response.data;
}

export async function register(data: RegisterRequest) {
  const response = await api.post<AuthResponse>("/auth/register", data);
  return response.data;
}

export async function fetchMe() {
  const response = await api.get<{ user: AuthUser }>("/auth/me");
  return response.data.user;
}
