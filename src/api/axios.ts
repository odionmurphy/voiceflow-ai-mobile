import axios from "axios";
import { getToken } from "../utils/storage";

export const api = axios.create({
  baseURL: "https://voiceflow-ai-backend-6drh.onrender.com/api",
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
