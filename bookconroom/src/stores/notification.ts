import { defineStore } from "pinia";
import { fetchNotifications, markAllRead, markRead, type NotificationItem } from "@/services/notification";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    items: [] as NotificationItem[],
    unreadCount: 0,
    nextCursor: null as number | null,
    loading: false
  }),
  actions: {
    async loadInitial() {
      this.loading = true;
      const res = await fetchNotifications({ limit: 20 });
      this.items = res.items;
      this.nextCursor = res.nextCursor;
      this.unreadCount = this.items.filter(n => !n.isRead).length;
      this.loading = false;
    },
    async loadMore() {
      if (!this.nextCursor) return;
      const res = await fetchNotifications({ limit: 20, cursor: this.nextCursor });
      this.items.push(...res.items);
      this.nextCursor = res.nextCursor;
      this.unreadCount = this.items.filter(n => !n.isRead).length;
    },
    async markOneRead(id: number) {
      await markRead(id);
      const x = this.items.find(i => i.id === id);
      if (x && !x.isRead) { x.isRead = true; this.unreadCount = Math.max(0, this.unreadCount - 1); }
    },
    async markAll() {
      await markAllRead();
      this.items.forEach(i => (i.isRead = true));
      this.unreadCount = 0;
    }
  }
});
