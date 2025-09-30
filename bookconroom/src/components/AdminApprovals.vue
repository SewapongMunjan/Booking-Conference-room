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
          <h2 class="text-lg font-semibold text-blue-600 m-0">แดชบอร์ดผู้ดูแลระบบ</h2>
          <p class="text-sm text-gray-600 m-0">อนุมัติการจองห้องประชุม</p>
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
      <main class="flex-1 bg-white rounded-xl shadow-sm p-8">
        <div class="mb-6 flex items-center gap-3">
          <h1 class="text-2xl font-semibold text-blue-600 m-0">คำขอรออนุมัติ</h1>
          <span class="text-sm text-gray-500">สถานะ: รอผู้ดูแลอนุมัติ</span>
          <span v-if="loading" class="text-sm text-gray-500">· กำลังโหลด…</span>
          <span v-if="errorMsg" class="text-sm text-red-600">· {{ errorMsg }}</span>
        </div>

        <!-- Guard: เฉพาะ Admin -->
        <div v-if="!isAdmin" class="p-6 border rounded-xl bg-amber-50 text-amber-800">
          บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ กรุณาเข้าสู่ระบบด้วยบัญชี Admin
        </div>

        <div v-else>
          <!-- ตาราง -->
          <div class="overflow-x-auto border rounded-xl">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-gray-700">
                <tr>
                  <th class="px-4 py-3 text-left">#</th>
                  <th class="px-4 py-3 text-left">ห้อง</th>
                  <th class="px-4 py-3 text-left">เวลา</th>
                  <th class="px-4 py-3 text-left">ผู้จอง</th>
                  <th class="px-4 py-3 text-left">สถานะ</th>
                  <th class="px-4 py-3 text-left">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(b, idx) in items" :key="b.id" class="border-t">
                  <td class="px-4 py-3">{{ (page - 1) * pageSize + (idx + 1) }}</td>
                  <td class="px-4 py-3">
                    <div class="font-medium">{{ b.room?.roomName || '-' }}</div>
                    <div class="text-gray-500 text-xs" v-if="b.room?.capacity">ความจุ {{ b.room.capacity }} ที่นั่ง</div>
                  </td>
                  <td class="px-4 py-3">
                    <div>{{ timeRange(b.startTime, b.endTime) }}</div>
                    <div class="text-gray-500 text-xs">{{ dateTH(b.startTime) }}</div>
                  </td>
                  <td class="px-4 py-3">
                    {{ b.bookedBy?.fullName || '-' }}
                  </td>
                  <td class="px-4 py-3">
                    <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800">รอผู้ดูแลอนุมัติ</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button
                        class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                        @click="approve(b)"
                        :disabled="actingId === b.id"
                        title="อนุมัติ"
                      >
                        ✔️ อนุมัติ
                      </button>
                      <button
                        class="px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                        @click="cancel(b)"
                        :disabled="actingId === b.id"
                        title="ยกเลิก"
                      >
                        ✖️ ยกเลิก
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!items.length && !loading">
                  <td colspan="6" class="px-4 py-6 text-center text-gray-500">ไม่มีคำขอรออนุมัติ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="mt-4 flex items-center gap-2">
            <button class="px-3 py-1 border rounded" :disabled="page===1" @click="page--; fetchList()">
              ← ก่อนหน้า
            </button>
            <span class="text-sm">หน้า {{ page }} / {{ totalPages }}</span>
            <button class="px-3 py-1 border rounded" :disabled="page===totalPages" @click="page++; fetchList()">
              ถัดไป →
            </button>

            <span class="ml-auto text-sm text-gray-500">ทั้งหมด {{ total }} รายการ</span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/lib/api.js'

const items = ref([])
const loading = ref(false)
const errorMsg = ref('')

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const actingId = ref(null)

// ---------- ดึงสิทธิ์ผู้ใช้จาก backend ----------
const me = ref(null)
const isAdmin = computed(() => !!me.value?.isAdmin)

async function fetchMe() {
  try {
    const { data } = await api.get('/api/auth/me') // ต้องแน่ใจว่า backend มีเส้นนี้
    me.value = data // { id, fullName, email, position:{...}, isAdmin: boolean }
  } catch (e) {
    me.value = null
    // ถ้า token หมดอายุ ให้พาไป login ก็ได้ (ขึ้นอยู่กับ flow ของคุณ)
    // location.href = '/login'
  }
}

// ---------- helpers ----------
function timeRange(s, e) {
  const opt = { hour:'2-digit', minute:'2-digit' }
  return `${new Date(s).toLocaleTimeString([], opt)} - ${new Date(e).toLocaleTimeString([], opt)}`
}
function dateTH(iso) {
  const d = new Date(iso)
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()+543}`
}

// ---------- โหลดรายการรออนุมัติ ----------
async function fetchList() {
  if (!isAdmin.value) return // กัน user ปกติ
  loading.value = true
  errorMsg.value = ''
  try {
    const params = {
      status: 'AWAITING_ADMIN_APPROVAL',
      page: page.value,
      pageSize: pageSize.value
    }
    const { data } = await api.get('/api/bookings', { params })
    const list = Array.isArray(data?.items) ? data.items : []
    items.value = list
    total.value = typeof data?.total === 'number' ? data.total : list.length

    // กัน page เกินขอบ เมื่อ total เปลี่ยน
    const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value))
    if (page.value > maxPage) page.value = maxPage
  } catch (e) {
    console.error(e)
    errorMsg.value = e?.response?.data?.error || 'โหลดรายการไม่สำเร็จ'
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// ---------- อนุมัติ / ยกเลิก ----------
async function approve(b) {
  if (!confirm(`อนุมัติการจองห้อง ${b.room?.roomName || b.id}?`)) return
  try {
    actingId.value = b.id
    await api.post(`/api/bookings/${b.id}/approve`)
    await fetchList()
  } catch (e) {
    console.error(e)
    alert(e?.response?.data?.error || 'อนุมัติไม่สำเร็จ')
  } finally {
    actingId.value = null
  }
}

async function cancel(b) {
  if (!confirm(`ยืนยันยกเลิกการจองห้อง ${b.room?.roomName || b.id}?`)) return
  try {
    actingId.value = b.id
    await api.patch(`/api/bookings/${b.id}/cancel`)
    await fetchList()
  } catch (e) {
    console.error(e)
    alert(e?.response?.data?.error || 'ยกเลิกไม่สำเร็จ')
  } finally {
    actingId.value = null
  }
}

// ---------- lifecycle & watchers ----------
onMounted(async () => {
  await fetchMe()      // รู้สิทธิ์ก่อน
  await fetchList()    // แล้วค่อยโหลดรายการ
})

// เปลี่ยนหน้า → โหลดใหม่
watch(page, () => fetchList())
</script>

