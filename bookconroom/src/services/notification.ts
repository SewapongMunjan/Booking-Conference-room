import axios from "axios";

export type NotificationItem = {
  id: number; userId: number;
  type: "INVITE" | "APPROVED" | "REJECTED" | "CANCELED" | "RESCHEDULED" | "ISSUE_CREATED";
  title: string; message: string;
  refType?: "BOOKING" | "INVITE" | "ISSUE" | null;
  refId?: number | null;
  isRead: boolean; createdAt: string; readAt?: string | null;
};

export async function fetchNotifications(params?: { unread?: boolean; limit?: number; cursor?: number }) {
  const q = new URLSearchParams();
  if (params?.unread) q.set("unread", "1");
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.cursor != null) q.set("cursor", String(params.cursor));
  const { data } = await axios.get(`/api/notifications?${q.toString()}`);
  return data as { items: NotificationItem[]; nextCursor: number | null };
}


export const markRead = (id: number) => axios.patch(`/api/notifications/${id}/read`);
export const markAllRead = () => axios.patch(`/api/notifications/read-all`);
