// src/plugins/socket.ts
import { io as ioc, Socket } from "socket.io-client";

export function createSocket(token) {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
  const socket = ioc(API_BASE, {
    transports: ["websocket"],
    withCredentials: true,
    auth: { token },
  });

  socket.on("connect_error", (err) => {
    console.error("socket connect_error:", err?.message || err);
  });

  return socket;
}
