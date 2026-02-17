import axios from "axios";
import { getToken } from "./auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
});

api.interceptors.request.use((config) => {
  const url = config.url || "";
  const isAuthEndpoint = url.includes("/api/auth/");
  const token = getToken();
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 403) {
      error.message = "Session expired or unauthorized (403). Please login again.";
    }
    return Promise.reject(error);
  }
);
