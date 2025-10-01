// src/lib/api.js
import axios from "axios";

const api = axios.create({
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
    if ((status === 401 || status === 403) && !isRedirecting) {
      isRedirecting = true;
      // ล้าง token แล้วพาไปล็อกอิน
      localStorage.removeItem("access_token");
      // เก็บ path เดิมไว้ ถ้าอยากเด้งกลับหลังล็อกอินเสร็จ
      const current = window.location.pathname + window.location.search;
      sessionStorage.setItem("post_login_redirect", current);
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
