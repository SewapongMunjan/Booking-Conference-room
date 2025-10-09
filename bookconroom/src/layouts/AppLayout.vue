<!-- src/layouts/AppLayout.vue -->
<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-6 md:px-10 py-4 shadow-sm border-b">
      <div class="max-w-[1400px] mx-auto flex justify-between items-center">
        <div>
          <h1 class="text-lg font-semibold text-blue-600 m-0">ระบบจองห้องประชุม</h1>
          <p class="text-xs text-gray-500 m-0">Meeting Room Booking System</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- ปุ่มแจ้งเตือน ใส่ของเดิมคุณมาได้ -->
          <router-link
            to="/profile"
            class="shrink-0 inline-block rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
            title="ดูโปรไฟล์"
          >
            <img
              :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'"
              alt="โปรไฟล์"
              class="w-10 h-10 rounded-full border"
            />
          </router-link>

          <button class="px-3 py-1.5 border rounded hover:bg-gray-50" @click="logout">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>

    <!-- Body: Sidebar + Main -->
    <div class="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 p-6">
      <!-- Sidebar -->
      <aside class="bg-white rounded-xl shadow-sm p-4">
        <nav class="flex flex-col gap-2">
          <RouterLink to="/home" class="px-4 py-3 rounded-lg"
            :class="active('/home')">🏠 หน้าแรก</RouterLink>

          <RouterLink to="/booking" class="px-4 py-3 rounded-lg"
            :class="active('/booking')">📅 จองห้องประชุม</RouterLink>

          <RouterLink to="/booking-list" class="px-4 py-3 rounded-lg"
            :class="active('/booking-list')">📋 รายการจองของฉัน</RouterLink>

          <RouterLink to="/room-use" class="px-4 py-3 rounded-lg"
            :class="active('/room-use')">🗂️ ตารางการใช้ห้อง</RouterLink>

          <RouterLink to="/room-status" class="px-4 py-3 rounded-lg"
            :class="active('/room-status')">ℹ️ สถานะห้องประชุม</RouterLink>

          <RouterLink to="/report" class="px-4 py-3 rounded-lg"
            :class="active('/report')">⚠️ แจ้งปัญหา</RouterLink>

          <RouterLink to="/admin/approvals" class="px-4 py-3 rounded-lg"
            :class="active('/admin/approvals')">🛡️ อนุมัติการจอง (Admin)</RouterLink>

          <RouterLink to="/my-invites" class="px-4 py-3 rounded-lg"
            :class="active('/my-invites')">📨 คำเชิญของฉัน</RouterLink>
        </nav>
      </aside>

      <!-- Main content ของแต่ละหน้า -->
      <main class="min-w-0">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/api'

const route = useRoute()
const router = useRouter()
const me = ref(null)

const active = (path) => computed(() =>
  route.path.startsWith(path) ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
).value

function logout () {
  localStorage.removeItem('access_token')
  localStorage.removeItem('me_cache')
  router.push('/login')
}

onMounted(async () => {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = data
  } catch { me.value = null }
})
</script>
