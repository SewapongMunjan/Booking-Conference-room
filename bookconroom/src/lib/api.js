// src/lib/api.js
import axios from "axios";

const api = axios.create({
  // แนวทาง A: baseURL ต้องรวม /api (เช่น http://localhost:3001/api)
  baseURL: import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3001",
  withCredentials: false,
});

// attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// global error handling
let isRedirecting = false;
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const req = err?.config || {};
    const url = (req.url || "").toLowerCase();

    // ถ้าเป็น 401/403 ที่มาจาก login ให้ reject เพื่อให้ component แสดงข้อความ (ไม่ redirect)
    if ((status === 401 || status === 403) && (url.includes("/auth/login") || url.endsWith("/login"))) {
      return Promise.reject(err);
    }

    if ((status === 401 || status === 403) && !isRedirecting) {
      isRedirecting = true;
      // ล้าง token แล้วพาไปล็อกอิน
      localStorage.removeItem("access_token");
      // เก็บ path เดิมไว้ ถ้าต้องการเด้งกลับหลังล็อกอิน
      const current = window.location.pathname + window.location.search;
      sessionStorage.setItem("post_login_redirect", current);
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
