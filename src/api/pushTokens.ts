import { api } from "./axios";

export async function registerPushToken(token: string, platform: "ios" | "android") {
  await api.post("/auth/push-token", { token, platform });
}
