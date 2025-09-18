import axios from "axios";

// ใช้ Vite env หรือ fallback localhost:3001
const baseURL = import.meta.env?.VITE_API_URL || "http://localhost:3001";

const api = axios.create({ baseURL });

// แนบ Bearer token ทุกคำขอ
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  if (token) {
    // อย่าเขียนทับ headers เดิม
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
