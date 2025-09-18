// src/lib/api.js
import axios from "axios";

const api = axios.create({
  // ใน Vite ต้องใช้ import.meta.env (ไม่ใช่ process.env)
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
});

// แนบ Bearer token อัตโนมัติทุกรอบ
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    // ใน JS ไม่ติด type error ของ Axios v1 เหมือน TS
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
