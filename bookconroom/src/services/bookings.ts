import client from "../lib/api";

export type Position = { id: number; name: string; isNoteTaker?: boolean };
export type Service = { id: number; name: string };

export async function getPositions(): Promise<Position[]> {
  // ถ้ามี endpoint แยกตำแหน่ง ให้แก้ path ตามจริง เช่น /api/positions
  return (await client.get("/api/positions")).data;
}

export async function getServices(): Promise<Service[]> {
  return (await client.get("/api/services")).data;
}

export type CreateBookingPayload = {
  roomId: number;
  startTime: string; // ISO 8601 UTC
  endTime: string;   // ISO 8601 UTC
  requiredPositionIds?: number[];
  serviceIds?: number[];
  inviteUserIds?: number[];   // ถ้ามี
  agendaUrl?: string;
};

export async function createBooking(payload: CreateBookingPayload) {
  return (await client.post("/api/bookings", payload)).data;
}

export async function getBooking(id: number | string) {
  return (await client.get(`/api/bookings/${id}`)).data;
}

// ดึง list ตามสถานะ เช่น ?status=AWAITING_ADMIN_APPROVAL หรือกรองห้อง+วัน
export async function listBookings(query?: Record<string, string | number | boolean>) {
  return (await client.get("/api/bookings", { params: query })).data;
}
