<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Mobile Menu Button -->
    <div class="lg:hidden bg-white px-4 py-3 shadow-sm border-b">
      <button 
        @click="sidebarOpen = !sidebarOpen"
        class="p-2 rounded-md text-gray-600 hover:bg-gray-100"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>

    <!-- Header -->
    <header class="bg-white px-4 lg:px-8 py-4 shadow-sm border-b">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h2 class="text-lg font-semibold text-blue-600 m-0">ระบบจองห้องประชุม</h2>
          <p class="text-sm text-gray-600 m-0">Meeting Room Booking System</p>
        </div>
        <div class="hidden lg:flex flex-1 max-w-2xl mx-8">
          <input 
            type="text" 
            placeholder="ค้นหา..." 
            class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-l-full outline-none text-gray-900 focus:border-blue-500"
          >
          <button class="bg-blue-600 text-white border-none px-4 py-2 rounded-r-full cursor-pointer hover:bg-blue-700 transition-colors">
            🔍
          </button>
        </div>
        <div class="flex items-center gap-3">
          <img src="https://via.placeholder.com/40x40" alt="Profile" class="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-gray-300">
          <button
            @click="logout"
            class="hidden lg:block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar Overlay for Mobile -->
      <div 
        v-if="sidebarOpen" 
        @click="sidebarOpen = false"
        class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
      ></div>

      <!-- Sidebar -->
      <aside 
        :class="[
          'fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg lg:shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <div class="h-full flex flex-col">
          <!-- Mobile Close Button -->
          <div class="lg:hidden p-4 border-b">
            <button 
              @click="sidebarOpen = false"
              class="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
            <router-link 
              to="/" 
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium"
            >
              <span class="text-lg">🏠</span>
              <span class="truncate">หน้าแรก</span>
            </router-link>
            <router-link 
              to="/booking" 
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span class="text-lg">📅</span>
              <span class="truncate">จองห้องประชุม</span>
            </router-link>
            <router-link 
              to="/booking-list" 
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span class="text-lg">📋</span>
              <span class="truncate">รายการจองของฉัน</span>
            </router-link>
            <router-link 
              to="/room-use" 
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span class="text-lg">🗂️</span>
              <span class="truncate">ตารางการใช้ห้องประชุม</span>
            </router-link>
            <router-link 
              to="/room-status" 
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span class="text-lg">ℹ️</span>
              <span class="truncate">สถานะห้องประชุม</span>
            </router-link>
            <router-link 
              to="/report" 
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span class="text-lg">⚠️</span>
              <span class="truncate">แจ้งปัญหา</span>
            </router-link>
            <router-link 
              to="/admin/approvals"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span class="text-lg">📅</span>
              <span class="truncate">อนุมัติการจองห้อง</span>
            </router-link>
            <router-link 
              to="/my-invites"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span class="text-lg">📅</span>
              <span class="truncate">คำเชิญเข้าประชุมของฉัน</span>
            </router-link>
          </nav>

          <!-- Mobile Logout Button -->
          <div class="lg:hidden p-4 border-t">
            <button
              @click="logout"
              class="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </aside>

      <!-- Main -->
      <main class="flex-1">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-xl font-semibold text-blue-600">คำเชิญเข้าประชุมของฉัน</h1>

            <div class="flex items-center gap-3">
              <label class="text-sm">
                สถานะ:
                <select v-model="status" class="border rounded px-2 py-1 ml-2">
                  <option value="">ทั้งหมด</option>
                  <option value="INVITED">รอยืนยัน</option>
                  <option value="ACCEPTED">ยืนยันแล้ว</option>
                  <option value="DECLINED">ปฏิเสธ</option>
                </select>
              </label>
              <button class="px-3 py-2 border rounded hover:bg-gray-50 text-sm" @click="fetchInvites">
                รีเฟรช
              </button>
            </div>
          </div>

          <div v-if="loading" class="text-gray-500">กำลังโหลด...</div>
          <div v-else-if="items.length === 0" class="text-gray-500">ไม่มีคำเชิญ</div>

          <div v-else class="divide-y rounded-lg border">
            <div v-for="inv in items" :key="inv.id" class="p-5 flex items-center gap-6">
              <!-- date -->
              <div class="w-16 text-center">
                <div class="text-3xl font-bold text-blue-600 leading-none">{{ day(inv.booking.startTime) }}</div>
                <div class="text-xs text-gray-500">{{ monthTH(inv.booking.startTime) }}</div>
              </div>

              <!-- info -->
              <div class="flex-1">
                <div class="text-sm text-gray-500 mb-1">เวลา</div>
                <div class="font-medium">{{ timeRange(inv.booking.startTime, inv.booking.endTime) }}</div>
                <div class="text-sm text-gray-500 mt-1">
                  ห้อง: <span class="font-medium">{{ inv.booking.room?.roomName }}</span>
                  <span v-if="inv.booking.room?.capacity" class="text-xs text-gray-400">· ความจุ {{ inv.booking.room.capacity }} ที่นั่ง</span>
                </div>
              </div>

              <!-- status + actions -->
              <div class="flex items-center gap-3">
                <span :class="['px-3 py-1 rounded-full text-xs', badge(inv.status)]">{{ statusTH(inv.status) }}</span>

                <template v-if="inv.status === 'INVITED'">
                  <button class="px-3 py-1.5 rounded bg-green-600 text-white text-sm"
                          :disabled="actingId === inv.id" @click="accept(inv)">
                    ยืนยัน
                  </button>
                  <button class="px-3 py-1.5 rounded border border-red-300 text-red-600 text-sm"
                          :disabled="actingId === inv.id" @click="decline(inv)">
                    ปฏิเสธ
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- pagination -->
          <div class="mt-4 flex items-center gap-2">
            <button class="px-3 py-1 border rounded" :disabled="page===1" @click="page--; fetchInvites()">← ก่อนหน้า</button>
            <span class="text-sm">หน้า {{ page }} / {{ totalPages }}</span>
            <button class="px-3 py-1 border rounded" :disabled="page===totalPages" @click="page++; fetchInvites()">ถัดไป →</button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/lib/api.js'

const route = useRoute()

// sidebar active
const linkClass = (path) =>
  route.path === path ? 'text-white bg-blue-600' : 'text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors'

// auth mini
const me = ref(null)
async function loadMe () {
  try { me.value = (await api.get('/api/auth/me')).data } catch { me.value = null }
}
function logout () {
  localStorage.removeItem('access_token')
  location.href = '/login'
}

// list state
const items = ref([])
const loading = ref(false)
const status = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const actingId = ref(null)

// helpers
function day (iso) { return new Date(iso).getDate() }
function monthTH (iso) {
  const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return m[new Date(iso).getMonth()]
}
function timeRange (s, e) {
  const opt = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(s).toLocaleTimeString([], opt)} - ${new Date(e).toLocaleTimeString([], opt)}`
}
function statusTH (s) {
  if (s === 'INVITED') return 'รอยืนยัน'
  if (s === 'ACCEPTED') return 'ยืนยันแล้ว'
  if (s === 'DECLINED') return 'ปฏิเสธ'
  return s
}
function badge (s) {
  if (s === 'INVITED') return 'bg-amber-200 text-amber-900'
  if (s === 'ACCEPTED') return 'bg-green-500 text-white'
  if (s === 'DECLINED') return 'bg-red-200 text-red-800'
  return 'bg-gray-200 text-gray-800'
}

// api
async function fetchInvites () {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (status.value) params.status = status.value
    const { data } = await api.get('/api/invites/my', { params })
    items.value = Array.isArray(data?.items) ? data.items : []
    total.value = typeof data?.total === 'number' ? data.total : items.value.length
  } finally {
    loading.value = false
  }
}
async function accept (inv) {
  if (!confirm('ยืนยันการเข้าประชุม?')) return
  actingId.value = inv.id
  try { await api.post(`/api/bookings/${inv.bookingId}/confirm`); await fetchInvites() }
  finally { actingId.value = null }
}
async function decline (inv) {
  if (!confirm('ต้องการปฏิเสธคำเชิญนี้?')) return
  actingId.value = inv.id
  try { await api.post(`/api/bookings/${inv.bookingId}/decline`); await fetchInvites() }
  finally { actingId.value = null }
}

onMounted(async () => {
  await loadMe()
  await fetchInvites()
})
</script>
