import api from "@/lib/api";

export async function listRooms() {
  const res = await api.get("/api/rooms");
  return res.data as Array<{ id:number; roomName:string; capacity:number; status:string }>;
}

export async function checkAvailability(startISO: string, endISO: string) {
  const res = await api.get("/api/rooms/availability", {
    params: { start: startISO, end: endISO },
  });
  // คำตอบเป็น list ของ roomIds ที่ไม่ว่าง/หรือรายละเอียดตามที่ backend ให้มา
  return res.data;
}
