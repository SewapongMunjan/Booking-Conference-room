<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-8 py-4 shadow-sm border-b">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h2 class="text-lg font-semibold text-blue-600 m-0">ระบบจองห้องประชุม</h2>
          <p class="text-sm text-gray-600 m-0">Meeting Room Booking System</p>
        </div>

        <!-- Search -->
        <div class="flex flex-1 max-w-2xl mx-8">
          <input
            v-model.trim="keyword"
            type="text"
            placeholder="ค้นหา (เช่น ชื่อห้อง)..."
            class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-l-full outline-none text-gray-900 focus:border-blue-500"
          />
          <button
            class="bg-blue-600 text-white border-none px-4 py-2 rounded-r-full cursor-pointer hover:bg-blue-700 transition-colors"
            @click="() => { page = 1; fetchMine() }"
          >
            🔍
          </button>
        </div>

        <div>
          <img
            src="https://via.placeholder.com/40x40"
            alt="Profile"
            class="w-10 h-10 rounded-full border-2 border-gray-300"
          />
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto flex gap-6 p-6">
      <!-- Sidebar -->
      <aside class="w-64 bg-white rounded-xl shadow-sm p-4">
        <nav class="flex flex-col gap-2">
          <router-link to="/" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">🏠</span> หน้าแรก
          </router-link>
          <router-link to="/booking" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">📅</span> จองห้องประชุม
          </router-link>
          <router-link to="/booking-list" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium">
            <span class="text-lg">📋</span> รายการจองของฉัน
          </router-link>
          <router-link to="/room-use" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">🗂️</span> ตารางการใช้ห้องประชุม
          </router-link>
          <router-link to="/room-status" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">ℹ️</span> สถานะห้องประชุม
          </router-link>
          <router-link to="/report" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
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
      <main class="flex-1 max-w-4xl bg-white rounded-xl shadow-sm p-8">
        <!-- Page Header -->
        <div class="mb-6">
          <div class="flex items-center gap-4">
            <div class="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-blue-600 m-0">รายการจองของฉัน</h1>
              <p class="text-gray-600 text-sm m-0">ระบบจองห้องประชุม</p>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white border rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
          <label class="text-sm">
            สถานะ:
            <select v-model="status" class="border rounded px-2 py-1 ml-2">
              <option v-for="opt in statusOptions" :key="opt.value || 'ALL'" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </label>

          <div class="flex items-center gap-2 text-sm">
            จาก:
            <input type="datetime-local" v-model="startLocal" class="border rounded px-2 py-1" />
            ถึง:
            <input type="datetime-local" v-model="endLocal" class="border rounded px-2 py-1" />
            <button class="px-3 py-2 border rounded hover:bg-gray-50 text-sm" @click="applyDateFilter">กรองวันที่</button>
            <button class="px-3 py-2 border rounded hover:bg-gray-50 text-sm" @click="clearDateFilter">ล้างช่วง</button>
          </div>

          <span v-if="loading" class="text-sm text-gray-500">กำลังโหลด...</span>
          <span v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</span>

          <button class="ml-auto px-3 py-2 border rounded hover:bg-gray-50 text-sm" @click="resetFilters">ล้างตัวกรองทั้งหมด</button>
        </div>

        <!-- Booking List -->
        <div class="bg-gray-50 rounded-xl p-8">
          <h2 class="text-xl font-semibold text-blue-600 mb-6">การประชุมที่กำลังจะมาถึง</h2>

          <div v-if="items.length === 0 && !loading" class="text-gray-500">ไม่มีรายการจอง</div>

          <div class="space-y-6" v-else>
            <div
              v-for="b in items"
              :key="b.id"
              class="flex items-center gap-6 py-4 border-b last:border-b-0"
            >
              <!-- วันที่ -->
              <div class="flex flex-col items-center w-24">
                <span class="text-4xl font-bold text-blue-600">{{ toDay(b.startTime) }}</span>
                <span class="text-base text-gray-700">{{ toMonthTH(b.startTime) }}</span>
              </div>

              <!-- เวลา -->
              <div class="flex flex-col w-40">
                <span class="text-sm text-gray-500">เวลา</span>
                <span class="text-base font-medium text-gray-900">{{ timeRange(b.startTime, b.endTime) }}</span>
              </div>

              <!-- ห้อง -->
              <div class="flex flex-col w-48">
                <span class="text-sm text-gray-500">ห้องประชุม</span>
                <span class="text-base font-medium text-gray-900">
                  {{ b.room?.roomName || '-' }}
                </span>
                <span class="text-xs text-gray-500" v-if="b.room?.capacity">ความจุ {{ b.room.capacity }} ที่นั่ง</span>
              </div>

              <!-- สรุปคำเชิญ (ถ้ามี) -->
              <div v-if="b.inviteStats" class="text-xs text-gray-600">
                <span v-if="b.inviteStats.invited > 0" class="px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                  รอเชิญตอบ {{ b.inviteStats.invited }}
                </span>
              </div>

              <!-- สถานะ + ปุ่ม -->
              <div class="flex items-center gap-3 ml-auto">
                <span :class="['px-4 py-2 rounded-full font-semibold text-sm', badgeClass(b.status)]">
                  {{ statusTH(b.status) }}
                </span>

                <button
                  v-if="b.status !== 'CANCELLED'"
                  class="px-3 py-2 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50"
                  @click="cancelBooking(b)"
                >
                  ยกเลิกการจอง
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="mt-6 flex items-center gap-2">
            <button class="px-3 py-1 border rounded" :disabled="page===1" @click="() => { page--; fetchMine() }">
              ← ก่อนหน้า
            </button>
            <span class="text-sm">หน้า {{ page }} / {{ totalPages }}</span>
            <button class="px-3 py-1 border rounded" :disabled="page===totalPages" @click="() => { page++; fetchMine() }">
              ถัดไป →
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/lib/api.js'

/** ตัวเลือกสถานะ */
const statusOptions = [
  { label: 'ทั้งหมด', value: '' },
  { label: 'รอผู้เข้าร่วมยืนยัน', value: 'AWAITING_ATTENDEE_CONFIRM' },
  { label: 'รอผู้ดูแลอนุมัติ',   value: 'AWAITING_ADMIN_APPROVAL' },
  { label: 'อนุมัติแล้ว',        value: 'APPROVED' },
  { label: 'ยกเลิกแล้ว',         value: 'CANCELLED' },
]

/** STATE */
const status   = ref('')
const keyword  = ref('')

const items    = ref([])
const loading  = ref(false)
const errorMsg = ref('')

let page     = ref(1)
const pageSize = ref(10)
const total    = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

/** ฟิลเตอร์ช่วงวันเวลา */
const startLocal = ref('')
const endLocal   = ref('')
const startISO = computed(() => startLocal.value ? new Date(startLocal.value).toISOString() : '')
const endISO   = computed(() => endLocal.value   ? new Date(endLocal.value).toISOString()   : '')

/** Helpers แสดงผล */
function toDay(iso){ const d = new Date(iso); return String(d.getDate()) }
function toMonthTH(iso){
  const d = new Date(iso)
  const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return m[d.getMonth()]
}
function timeRange(s,e){
  const opt = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(s).toLocaleTimeString([],opt)} - ${new Date(e).toLocaleTimeString([],opt)}`
}
function statusTH(s){
  switch (s) {
    case 'AWAITING_ATTENDEE_CONFIRM': return 'รอผู้เข้าร่วมยืนยัน'
    case 'AWAITING_ADMIN_APPROVAL':   return 'รอผู้ดูแลอนุมัติ'
    case 'APPROVED':                  return 'อนุมัติแล้ว'
    case 'CANCELLED':                 return 'ยกเลิกแล้ว'
    default: return s
  }
}
function badgeClass(s){
  switch (s) {
    case 'AWAITING_ATTENDEE_CONFIRM': return 'bg-amber-200 text-amber-900'
    case 'AWAITING_ADMIN_APPROVAL':   return 'bg-blue-200 text-blue-900'
    case 'APPROVED':                  return 'bg-green-500 text-white'
    case 'CANCELLED':                 return 'bg-gray-300 text-gray-800'
    default: return 'bg-gray-200 text-gray-800'
  }
}

/** ปุ่มฟิลเตอร์วันที่ */
function applyDateFilter(){
  page.value = 1
  fetchMine()
}
function clearDateFilter(){
  startLocal.value = ''
  endLocal.value   = ''
  page.value = 1
  fetchMine()
}

/** รีเซ็ตทุกตัวกรอง */
function resetFilters(){
  status.value  = ''
  keyword.value = ''
  startLocal.value = ''
  endLocal.value   = ''
  page.value = 1
  fetchMine()
}

/** โหลดรายการของฉัน */
async function fetchMine(){
  loading.value = true
  errorMsg.value = ''
  try{
    const params = {
      mine: 1,
      page: page.value,
      pageSize: pageSize.value,
      withInviteStats: 1, // ถ้า backend รองรับ จะได้ b.inviteStats กลับมาด้วย
    }
    if (status.value && String(status.value).trim() !== '') {
      params.status = status.value
    }
    if (startISO.value && endISO.value) {
      params.start = startISO.value
      params.end   = endISO.value
    }

    const { data } = await api.get('/api/bookings', { params })
    let serverList = Array.isArray(data?.items) ? data.items : []

    // keyword filter ฝั่ง client
    if (keyword.value?.trim()) {
      const k = keyword.value.trim().toLowerCase()
      serverList = serverList.filter(b =>
        (b.room?.roomName || '').toLowerCase().includes(k)
      )
      total.value = serverList.length
      // slice ตามหน้า
      const start = (page.value - 1) * pageSize.value
      const end   = start + pageSize.value
      items.value = serverList.slice(start, end)
    } else {
      items.value = serverList
      total.value = typeof data?.total === 'number' ? data.total : serverList.length
    }
  } catch (e) {
    console.error(e)
    errorMsg.value = e?.response?.data?.error || 'โหลดรายการไม่สำเร็จ'
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

/** ยกเลิกการจอง */
async function cancelBooking(b){
  if (!confirm(`ยืนยันยกเลิกการจองห้อง ${b.room?.roomName || b.id}?`)) return
  try {
    await api.patch(`/api/bookings/${b.id}/cancel`)
    await fetchMine()
  } catch (e) {
    console.error(e)
    alert(e?.response?.data?.error || 'ยกเลิกไม่สำเร็จ')
  }
}

/** Lifecycle + Watchers */
onMounted(fetchMine)
watch(status, () => { page.value = 1; fetchMine() })
// ถ้าอยากกรองทันทีเมื่อเปลี่ยนวันเวลา ให้เปิดอันนี้ได้ (ตอนนี้กดปุ่ม “กรองวันที่” แทน)
// watch([startLocal, endLocal], () => { page.value = 1; fetchMine() })
</script>
