import axios from "axios";
import { getToken } from "../utils/storage";

export const api = axios.create({
  baseURL: "http://192.168.178.31:4000/api",
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
