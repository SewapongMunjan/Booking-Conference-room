import client from "../lib/api";
export type MeetingRoom = { id: number; roomName: string; capacity?: number; status?: string };

export async function getRooms(): Promise<MeetingRoom[]> {
  return (await client.get("/api/rooms")).data;
}
