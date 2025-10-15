// src/composables/useNotifications.js
import { ref } from "vue";
import api from "@/lib/api.js";

const items = ref([]);
const unreadCount = ref(0);
const loading = ref(false);
const nextCursor = ref(null);
const error = ref("");

function normalizeItems(data) {
  // รองรับทั้ง array ตรง ๆ และรูปแบบ { items, nextCursor }
  return Array.isArray(data) ? data : (data && data.items ? data.items : []);
}

export default function useNotifications() {
  /** โหลดรายการใหม่ตั้งแต่ต้น */
  async function refresh(options) {
    options = options || {};
    var unreadOnly = options.unreadOnly === true;
    var limit = options.limit || 20;

    loading.value = true;
    error.value = "";
    try {
      const listRes = await api.get("/api/notifications", {
        params: unreadOnly ? { unread: 1, limit: limit } : { limit: limit },
      });
      const countRes = await api.get("/api/notifications/count");

      const list = normalizeItems(listRes.data);
      items.value = list;
      nextCursor.value =
        listRes.data && typeof listRes.data.nextCursor !== "undefined"
          ? listRes.data.nextCursor
          : null;

      unreadCount.value =
        countRes.data && typeof countRes.data.count !== "undefined"
          ? countRes.data.count
          : list.filter(function (n) {
              return !n.isRead;
            }).length;
    } catch (e) {
      console.error(e);
      error.value = "โหลดข้อมูลการแจ้งเตือนไม่สำเร็จ";
    } finally {
      loading.value = false;
    }
  }

  /** โหลดเพิ่ม (cursor pagination) */
  async function loadMore(options) {
    if (!nextCursor.value) return;
    options = options || {};
    var unreadOnly = options.unreadOnly === true;
    var limit = options.limit || 20;

    loading.value = true;
    error.value = "";
    try {
      var params = { limit: limit, cursor: nextCursor.value };
      if (unreadOnly) params.unread = 1;

      const resp = await api.get("/api/notifications", { params: params });
      const data = resp.data;
      const list = normalizeItems(data);

      nextCursor.value =
        data && typeof data.nextCursor !== "undefined" ? data.nextCursor : null;

      // กันซ้ำด้วย id
      var seen = {};
      items.value.forEach(function (n) {
        seen[n.id] = true;
      });
      var toAppend = list.filter(function (n) {
        return !seen[n.id];
      });
      items.value = items.value.concat(toAppend);
    } catch (e) {
      console.error(e);
      error.value = "โหลดข้อมูลเพิ่มเติมไม่สำเร็จ";
    } finally {
      loading.value = false;
    }
  }

  /** ทำทั้งหมดเป็นอ่านแล้ว (optimistic) */
  async function markAllRead() {
    var prev = items.value.map(function (n) {
      return Object.assign({}, n);
    });
    var hadUnread = unreadCount.value;

    // optimistic
    items.value = items.value.map(function (n) {
      return Object.assign({}, n, { isRead: true });
    });
    unreadCount.value = 0;

    try {
      await api.patch("/api/notifications/read-all");
    } catch (e) {
      console.error(e);
      // revert
      items.value = prev;
      unreadCount.value = hadUnread;
    }
  }

  /** ทำรายการเดียวเป็นอ่านแล้ว (optimistic) */
  async function markRead(id) {
    var idx = items.value.findIndex(function (n) {
      return n.id === id;
    });
    if (idx === -1) {
      try {
        await api.patch("/api/notifications/" + id + "/read");
        const resp = await api.get("/api/notifications/count");
        unreadCount.value =
          resp.data && typeof resp.data.count !== "undefined"
            ? resp.data.count
            : unreadCount.value;
      } catch (e) {
        console.error(e);
      }
      return;
    }

    var wasRead = !!items.value[idx].isRead;
    if (!wasRead) {
      items.value[idx] = Object.assign({}, items.value[idx], { isRead: true });
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }

    try {
      await api.patch("/api/notifications/" + id + "/read");
    } catch (e) {
      console.error(e);
      if (!wasRead) {
        items.value[idx] = Object.assign({}, items.value[idx], { isRead: false });
        unreadCount.value = unreadCount.value + 1;
      }
    }
  }

  return {
    // state
    items,
    unreadCount,
    loading,
    nextCursor,
    error,
    // actions
    refresh,
    loadMore,
    markAllRead,
    markRead,
  };
}
