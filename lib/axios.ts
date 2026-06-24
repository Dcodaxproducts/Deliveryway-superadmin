import axios from "axios";
import { baseURL } from "@/config/constants";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window === "undefined") {
        return Promise.reject(error);
      }

      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      const requestUrl = String(error.config?.url || "");
      const isLoginRequest = requestUrl.includes("/auth/login");
      const isLoginPage = window.location.pathname.startsWith("/auth/login");

      if (!isLoginRequest && !isLoginPage) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
