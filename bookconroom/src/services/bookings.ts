import api from "../lib/api";

export type CreateBookingPayload = {
  roomId: number;
  startTime: string;     // ISO string
  endTime: string;       // ISO string
  requiredPositionIds: number[];
  serviceIds: number[];
};

export async function createBooking(payload: CreateBookingPayload) {
  const res = await api.post("/api/bookings", payload);
  return res.data.booking; // backend ส่ง { booking: {...} }
}

export async function myBookings() {
  const res = await api.get("/api/bookings/my");
  return res.data.items;   // backend ส่ง { items: [...] }
}
