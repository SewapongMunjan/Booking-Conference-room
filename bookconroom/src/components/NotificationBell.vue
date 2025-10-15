<template>
  <div class="relative">
    <button class="relative" @click="open = !open" aria-label="Notifications">
      <i class="i-lucide-bell text-xl"></i>
      <span v-if="store.unreadCount" class="absolute -top-1 -right-1 text-xs bg-red-600 text-white rounded-full px-1">
        {{ store.unreadCount }}
      </span>
    </button>

    <div v-if="open" class="absolute right-0 mt-2 w-96 max-h-96 overflow-auto bg-white shadow-xl rounded-xl p-2 z-50">
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold m-0">แจ้งเตือน</h4>
        <button class="text-sm underline" @click="store.markAll">อ่านทั้งหมด</button>
      </div>

      <div v-if="!store.items.length" class="text-sm text-gray-500 p-3">ยังไม่มีการแจ้งเตือน</div>

      <ul>
        <li v-for="n in store.items" :key="n.id" class="p-2 rounded-lg hover:bg-gray-50 cursor-pointer flex gap-2"
            @click="openRef(n)">
          <span class="mt-1"><i :class="iconByType(n.type)"></i></span>
          <div class="flex-1">
            <div class="text-sm font-medium" :class="!n.isRead ? 'text-blue-600' : 'text-gray-800'">{{ n.title }}</div>
            <div class="text-xs text-gray-600">{{ n.message }}</div>
            <div class="text-[11px] text-gray-400">{{ new Date(n.createdAt).toLocaleString() }}</div>
          </div>
          <button v-if="!n.isRead" class="text-xs text-blue-600" @click.stop="store.markOneRead(n.id)">อ่าน</button>
        </li>
      </ul>

      <div v-if="store.nextCursor" class="text-center mt-2">
        <button class="text-sm underline" @click="store.loadMore">โหลดเพิ่ม</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useNotificationStore } from "../stores/notification";
const store = useNotificationStore();
const open = ref(false);
const router = useRouter();

onMounted(() => store.loadInitial());

function iconByType(t: string) {
  switch (t) {
    case "INVITE": return "i-lucide-user-plus";
    case "APPROVED": return "i-lucide-badge-check";
    case "REJECTED": return "i-lucide-x-circle";
    case "CANCELED": return "i-lucide-ban";
    case "RESCHEDULED": return "i-lucide-calendar-clock";
    case "ISSUE_CREATED": return "i-lucide-alert-triangle";
    default: return "i-lucide-bell";
  }
}

function openRef(n: any) {
  if (n.refType === "BOOKING" && n.refId) router.push(`/bookings/${n.refId}`);
  // เพิ่มเคสอื่น ๆ ได้ตามต้องการ
}
</script>
