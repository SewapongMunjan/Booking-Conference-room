<!-- src/layouts/AppLayout.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b sticky top-0 z-50">
      <div class="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-3">
        <!-- Brand -->
        <div class="min-w-0">
          <h1 class="text-lg font-semibold text-gray-900 m-0 truncate">ระบบจองห้องประชุม</h1>
          <p class="text-xs text-gray-500 m-0">Meeting Room Booking System</p>
        </div>

        <!-- Search -->
        <div class="ml-auto relative hidden md:block">
          <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"/>
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search anything..."
            class="w-72 pl-10 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <!-- Actions -->
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
               
              :src="me?.avatarUrl || defaultAvatar"
              alt="โปรไฟล์"
              class="w-10 h-10 rounded-full border"
            />
          </router-link>

          <button class="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50" @click="logout">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>

    <!-- Body: Sidebar + Main -->
    <div class="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 p-6">
      <!-- Sidebar -->
      <aside class="bg-white rounded-2xl border overflow-hidden">
        <div class="px-4 pt-4 pb-2">
          <div class="text-sm font-semibold text-gray-900">ระบบจองห้องประชุม</div>
          <div class="text-xs text-gray-500">User Console</div>
        </div>
        <nav class="p-2 space-y-1">
          <RouterLink to="/home" class="navitem" :class="navActive('/home')">
            <span class="text-lg">🏠</span>
            <span>หน้าแรก</span>
          </RouterLink>

          <RouterLink to="/booking" class="navitem" :class="navActive('/booking')">
            <span class="text-lg">📅</span>
            <span>จองห้องประชุม</span>
          </RouterLink>

          <RouterLink to="/booking-list" class="navitem" :class="navActive('/booking-list')">
            <span class="text-lg">📋</span>
            <span>รายการจองของฉัน</span>
          </RouterLink>

          <RouterLink to="/room-use" class="navitem" :class="navActive('/room-use')">
            <span class="text-lg">🗂️</span>
            <span>ตารางการใช้ห้อง</span>
          </RouterLink>

          <RouterLink to="/room-status" class="navitem" :class="navActive('/room-status')">
            <span class="text-lg">ℹ️</span>
            <span>สถานะห้องประชุม</span>
          </RouterLink>

          <RouterLink to="/report" class="navitem" :class="navActive('/report')">
            <span class="text-lg">⚠️</span>
            <span>แจ้งปัญหา</span>
          </RouterLink>

          <RouterLink v-if="isAdminFlag" to="/admin/approvals" class="navitem" :class="navActive('/admin/approvals')">
            <span class="text-lg">🛡️</span>
            <span>อนุมัติการจอง (Admin)</span>
          </RouterLink>

          <RouterLink to="/my-invites" class="navitem" :class="navActive('/my-invites')">
            <span class="text-lg">📨</span>
            <span>คำเชิญของฉัน</span>
          </RouterLink>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="min-w-0 space-y-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/api'
import { isAdmin as checkAdmin } from '@/lib/auth.js'

const route = useRoute()
const router = useRouter()

const me = ref(null)
const defaultAvatar = 'https://cdn-icons-png.flaticon.com/128/456/456283.png'

// Active class helper
const navActive = (path) => computed(() =>
  route.path === path || route.path.startsWith(path + '/') ? 'navitem-active' : 'navitem-inactive'
).value

const isAdminFlag = ref(checkAdmin())

function logout () {
  localStorage.removeItem('access_token')
  localStorage.removeItem('me_cache')
  router.push('/login')
}

onMounted(async () => {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = data
  } catch {
    me.value = null
  }
})
</script>

<style scoped>
.navitem { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition; }
.navitem-inactive { @apply text-gray-700 hover:bg-gray-50; }
.navitem-active { @apply bg-gray-900 text-white; }
</style>
