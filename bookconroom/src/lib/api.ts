import axios, { AxiosHeaders } from "axios";

const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || "http://localhost:3001",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // ให้แน่ใจว่า headers เป็น AxiosHeaders เสมอ
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    // ใช้เมธอด set ของ AxiosHeaders (v1)
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  return config;
});

export default api;