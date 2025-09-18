import api from "@/lib/api";

export async function listPositions() {
  // ถ้ายังไม่มี endpoint จริง ให้ mock ชั่วคราว หรือดึงจาก schema ที่ seed ไว้
  const res = await api.get("/api/meta/positions"); // ถ้ายังไม่มี ให้คอมเมนต์ไว้ก่อน
  return res.data;
}

export async function listServices() {
  const res = await api.get("/api/services"); // ถ้ายังไม่มี ให้คอมเมนต์ไว้ก่อน
  return res.data;
}
