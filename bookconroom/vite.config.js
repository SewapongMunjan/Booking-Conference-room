import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// ✅ Config สำหรับ frontend (Vite)
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // ✅ proxy ให้ /api ทั้งหมดชี้ไปที่ backend Express (พอร์ต 3001)
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        // ถ้า backend ไม่ได้ใช้ https ให้ปิด secure
        secure: false,
      },
    },
  },
});
