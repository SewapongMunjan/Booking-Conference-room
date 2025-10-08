<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-8 py-4 shadow-sm border-b">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h2 class="text-lg font-semibold text-blue-600 m-0">ระบบจองห้องประชุม</h2>
          <p class="text-sm text-gray-600 m-0">Meeting Room Booking System</p>
        </div>

        <div class="flex items-center gap-3">
          <img :src="me?.avatarUrl || 'https://via.placeholder.com/40x40'"
               class="w-10 h-10 rounded-full border-2 border-gray-300" alt="profile" />
          <div class="text-sm">
            <div class="font-medium">{{ me?.fullName || '-' }}</div>
            <div class="text-gray-500">{{ me?.position?.name || '' }}</div>
          </div>
          <button @click="logout"
                  class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto flex gap-6 p-6">
      <!-- Sidebar -->
      <aside class="w-64 bg-white rounded-xl shadow-sm p-4">
        <nav class="flex flex-col gap-2">
          <router-link to="/home"        class="flex items-center gap-3 px-4 py-3 rounded-lg" :class="linkClass('/home')">
            <span class="text-lg">🏠</span> หน้าแรก
          </router-link>
          <router-link to="/booking"     class="flex items-center gap-3 px-4 py-3 rounded-lg" :class="linkClass('/booking')">
            <span class="text-lg">📅</span> จองห้องประชุม
          </router-link>
          <router-link to="/booking-list" class="flex items-center gap-3 px-4 py-3 rounded-lg" :class="linkClass('/booking-list')">
            <span class="text-lg">📋</span> รายการจองของฉัน
          </router-link>
          <router-link to="/room-use"    class="flex items-center gap-3 px-4 py-3 rounded-lg" :class="linkClass('/room-use')">
            <span class="text-lg">🗂️</span> ตารางการใช้ห้องประชุม
          </router-link>
          <router-link to="/room-status" class="flex items-center gap-3 px-4 py-3 rounded-lg" :class="linkClass('/room-status')">
            <span class="text-lg">ℹ️</span> สถานะห้องประชุม
          </router-link>
          <router-link to="/report"      class="flex items-center gap-3 px-4 py-3 rounded-lg" :class="linkClass('/report')">
            <span class="text-lg">⚠️</span> แจ้งปัญหา
          </router-link>
          <router-link v-if="me?.isAdmin" to="/admin/approvals"
                       class="flex items-center gap-3 px-4 py-3 rounded-lg font-medium"
                       :class="linkClass('/admin/approvals')">
            <span class="text-lg">🛡️</span> อนุมัติการจอง (Admin)
          </router-link>
          <router-link to="/my-invites"
                       class="flex items-center gap-3 px-4 py-3 rounded-lg"
                       :class="linkClass('/my-invites')">
            <span class="text-lg">📨</span> คำเชิญของฉัน
          </router-link>
        </nav>
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
import Swal from 'sweetalert2'
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
  const result = await Swal.fire({
    title: 'ยืนยันการเข้าประชุม?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก'
  })
  if (!result.isConfirmed) return
  actingId.value = inv.id
  try {
    await api.post(`/api/bookings/${inv.bookingId}/confirm`)
    await fetchInvites()
    await Swal.fire({
      icon: 'success',
      title: 'ยืนยันเข้าประชุมสำเร็จ',
      timer: 1500,
      showConfirmButton: false
    })
  } finally {
    actingId.value = null
  }
}
async function decline (inv) {
  const result = await Swal.fire({
    title: 'ต้องการปฏิเสธคำเชิญนี้?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ปฏิเสธ',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#d33'
  })
  if (!result.isConfirmed) return
  actingId.value = inv.id
  try {
    await api.post(`/api/bookings/${inv.bookingId}/decline`)
    await fetchInvites()
    await Swal.fire({
      icon: 'success',
      title: 'ปฏิเสธคำเชิญสำเร็จ',
      timer: 1500,
      showConfirmButton: false
    })
  } finally {
    actingId.value = null
  }
}

onMounted(async () => {
  await loadMe()
  await fetchInvites()
})
</script>
