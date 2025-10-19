<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-8 py-4 shadow-sm border-b">
  <div class="w-full px-6 mx-auto flex justify-between items-center">
    <!-- Left -->
    <div>
      <h2 class="text-lg font-semibold text-blue-600 m-0">ระบบจองห้องประชุม</h2>
      <p class="text-sm text-gray-600 m-0">Meeting Room Booking System</p>
    </div>


    <!-- Right -->
    <div class="flex items-center gap-3 relative">
      <!-- Notifications -->
      <div class="relative">
        <button
  data-noti-bell
  class="w-10 h-10 rounded-full flex items-center justify-center border hover:bg-gray-50 relative"
  @click="toggleNotif"
  aria-label="เปิดการแจ้งเตือน"
>
  <img
    src="https://cdn-icons-png.flaticon.com/128/1827/1827370.png"
    alt="กระดิ่งแจ้งเตือน"
    class="w-5 h-5 object-contain"
    loading="lazy"
  />
  <span
    v-if="unreadCount > 0"
    class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-5 text-center"
  >
    {{ unreadCount > 9 ? '9+' : unreadCount }}
  </span>
</button>

        <!-- Dropdown -->
       <div
  v-if="showNotif"
  data-noti-dropdown                     
  class="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-50"
>
          <div class="p-3 border-b flex items-center gap-2">
            <span class="font-medium">การแจ้งเตือน</span>
            <span class="ml-auto text-xs text-gray-500">ยังไม่อ่าน: {{ unreadCount }}</span>
          </div>

          <div class="max-h-80 overflow-auto">
            <div v-if="loadingNoti" class="p-4 text-sm text-gray-500">กำลังโหลด...</div>
            <div v-else-if="errorNoti" class="p-4 text-sm text-red-600">{{ errorNoti }}</div>

            <template v-else>
              <div v-if="notifs.length === 0" class="p-4 text-sm text-gray-500">
                ยังไม่มีการแจ้งเตือน
              </div>
              <div v-else class="divide-y">
                <div
                  v-for="n in notifs"
                  :key="n.id"
                  class="p-3 hover:bg-gray-50 flex items-start gap-3"
                >
                  <div class="text-xl leading-none">📣</div>
                  <div class="flex-1">
                    <div class="text-sm" :class="n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'">
                      {{ n.message }}
                    </div>
                    <div class="text-[11px] text-gray-500 mt-1">
                      {{ formatTime(n.createdAt) }}
                    </div>
                  </div>
                  <button
                    v-if="!n.isRead"
                    class="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                    @click.stop="markAsRead(n)"
                    title="ทำเครื่องหมายว่าอ่านแล้ว"
                  >
                    อ่านแล้ว
                  </button>
                </div>
              </div>
            </template>
          </div>

          <div class="p-3 border-t flex items-center gap-2">
            <button
              class="text-sm px-3 py-2 border rounded hover:bg-gray-50"
              @click="refreshNotif"
            >
              รีเฟรช
            </button>
            <button
              class="text-sm px-3 py-2 border rounded hover:bg-gray-50"
              @click="markAllAsRead"
              :disabled="unreadCount===0"
            >
              ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
            </button>
            <button
              class="ml-auto text-sm px-3 py-2 border rounded hover:bg-gray-50"
              @click="showNotif=false"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>

      <!-- Avatar + Logout -->
      <!-- Avatar (click -> /profile) + Logout -->
       <router-link
          to="/profile"
          class="shrink-0 inline-block rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
          title="ดูโปรไฟล์"
        >
      <img
          :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'"
          alt="เปิดโปรไฟล์"
          class="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer hover:ring-2 hover:ring-blue-500"
      />
        </router-link>

        <button
          @click="logout"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
         ออกจากระบบ
        </button>
    </div>
  </div>
</header>

<div class="w-full px-6 ml-0 mr-auto flex gap-6 py-6">
  <!-- Sidebar -->
  <aside class="w-64 bg-white rounded-xl shadow-sm p-4">
    <nav class="flex flex-col gap-2">
      <router-link to="/" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">
        <span class="text-lg">🏠</span> หน้าแรก
      </router-link>
      <router-link to="/booking" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
        <span class="text-lg">📅</span> จองห้องประชุม
      </router-link>
      <router-link to="/booking-list" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
        <span class="text-lg">📋</span> รายการจองของฉัน
      </router-link>
      <router-link to="/room-use" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
        <span class="text-lg">🗂️</span> ตารางการใช้ห้องประชุม
      </router-link>
      <router-link to="/room-status" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
        <span class="text-lg">ℹ️</span> สถานะห้องประชุม
      </router-link>
      <router-link to="/report" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium">
        <span class="text-lg">⚠️</span> แจ้งปัญหา
      </router-link>
      <router-link to="/admin/approvals" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg font-medium">
        <span class="text-lg">🛡️</span> อนุมัติการจอง (Admin)
      </router-link>
      <router-link to="/my-invites" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">
        <span class="text-lg">📨</span> คำเชิญของฉัน
      </router-link>
    </nav>
  </aside>


      <!-- Main Content -->
      <main class="flex-1 space-y-6">
        <!-- Page Header -->
        <div class="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div class="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-blue-600 m-0">แจ้งปัญหา</h1>
            <p class="text-gray-600 text-sm m-0">ระบบจองห้องประชุม</p>
          </div>
        </div>

        <!-- Report Form -->
        <div class="bg-white rounded-xl shadow-sm p-8 max-w-2xl">
          <form class="flex flex-col gap-8">
            <!-- หัวข้อ -->
            <div>
              <h2 class="text-lg font-semibold text-blue-600 mb-4">หัวข้อ</h2>
              <div class="flex flex-col gap-3">
                <label class="flex items-center gap-3">
                  <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">ปัญหาการเลือกอุปกรณ์เสริมไม่ได้</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">ปัญหาการยืนยันการเข้าร่วมประชุม</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">ปัญหาการสร้างเอกสารยืนยันการจองประชุม</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">ปัญหาการอนุมัติการจองห้องประชุม</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">ปัญหาการขอใช้บริการฝ่ายสนับสนุน</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">อื่นๆ</span>
                </label>
              </div>
            </div>
            <!-- รายละเอียด -->
            <div>
              <h2 class="text-lg font-semibold text-blue-600 mb-4">รายละเอียด</h2>
              <textarea 
                rows="5"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                placeholder="เพิ่มรายละเอียด..."
              ></textarea>
            </div>
            <!-- Submit Button -->
            <div class="flex justify-end">
              <button 
                type="submit"
                class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>✔️</span>
                ส่ง
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';

interface Notif {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default defineComponent({
  name: 'Report',
  setup() {
    const showNotif = ref(false);
    const loadingNoti = ref(false);
    const errorNoti = ref('');
    const notifs = ref<Notif[]>([
      { id: 1, message: 'ระบบจะมีการปิดปรับปรุง', isRead: false, createdAt: new Date().toISOString() },
      { id: 2, message: 'การจองของคุณได้รับอนุมัติ', isRead: true, createdAt: new Date().toISOString() }
    ]);

    const me = ref<{ avatarUrl?: string } | null>({ avatarUrl: '' });

    const toggleNotif = () => {
      showNotif.value = !showNotif.value;
      if (showNotif.value) {
        fetchNotifs();
      }
    };

    const fetchNotifs = async () => {
      loadingNoti.value = true;
      errorNoti.value = '';
      try {
        // simulate fetch delay; replace with real API call
        await new Promise((r) => setTimeout(r, 300));
      } catch (e: any) {
        errorNoti.value = e?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
      } finally {
        loadingNoti.value = false;
      }
    };

    const refreshNotif = () => {
      fetchNotifs();
    };

    const markAsRead = (n: Notif) => {
      n.isRead = true;
    };

    const markAllAsRead = () => {
      notifs.value.forEach((n) => (n.isRead = true));
    };

    const formatTime = (s: string) => {
      try {
        return new Date(s).toLocaleString();
      } catch {
        return s;
      }
    };

    const unreadCount = computed(() => notifs.value.filter((n) => !n.isRead).length);

    const logout = () => {
      // implement real logout / navigation
      console.log('logout');
    };

    onMounted(() => {
      // initial load
      fetchNotifs();
    });

    return {
      showNotif,
      loadingNoti,
      errorNoti,
      notifs,
      me,
      toggleNotif,
      refreshNotif,
      markAsRead,
      markAllAsRead,
      formatTime,
      unreadCount,
      logout
    };
  }
});
</script>