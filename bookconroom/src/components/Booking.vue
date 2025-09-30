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

      <main class="flex-1 bg-white rounded-xl shadow-sm p-8">
        <div class="mb-8">
          <div class="flex items-center gap-4">
            <div class="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl">🔒</div>
            <div>
              <h1 class="text-2xl font-semibold text-blue-600 m-0">จองห้องประชุม</h1>
              <p class="text-gray-600 text-sm m-0">กรอกข้อมูลให้ครบ แล้วกดยืนยัน</p>
            </div>
          </div>
        </div>

        <!-- Alerts -->
        <div v-if="errorMsg" class="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border">{{ errorMsg }}</div>
        <div v-if="successMsg" class="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border">{{ successMsg }}</div>

        <div class="bg-gray-50 rounded-xl p-8 max-w-3xl">
          <form @submit.prevent="submitBooking" class="space-y-6" novalidate>
            <!-- Room -->
            <div>
              <label class="block text-sm font-medium mb-2">เลือกห้อง <span class="text-red-500">*</span></label>
              <select v-model.number="form.roomId" class="w-full px-4 py-3 border rounded-lg">
                <option :value="null" disabled>-- เลือกห้อง --</option>
                <option v-for="r in rooms" :key="r.id" :value="r.id">
                  {{ r.roomName }} ({{ r.capacity }} ที่นั่ง) - {{ r.status }}
                </option>
              </select>
            </div>

            <!-- Time -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">เริ่ม <span class="text-red-500">*</span></label>
                <input type="datetime-local" v-model="form.startLocal" @blur="onStartBlur" step="60" class="w-full px-4 py-3 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">สิ้นสุด <span class="text-red-500">*</span></label>
                <input type="datetime-local" v-model="form.endLocal" :min="endMinLocal" step="60" class="w-full px-4 py-3 border rounded-lg" />
                <p v-if="form.startLocal && form.endLocal && !durationOk" class="mt-1 text-sm text-red-600">
                  เวลาสิ้นสุดต้องช้ากว่าเวลาเริ่ม
                </p>
              </div>
            </div>

            <!-- Required Positions (checkbox) -->
            <div>
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium mb-2">ตำแหน่งที่ต้องเข้าประชุม</label>
                <div class="flex gap-2 text-sm">
                  <button type="button" class="underline text-blue-600" @click="selectAllPositions">เลือกทั้งหมด</button>
                  <button type="button" class="underline text-gray-600" @click="clearPositions">ล้างทั้งหมด</button>
                </div>
              </div>
              <div v-if="positions.length" class="flex flex-wrap gap-3">
                <label v-for="p in positions" :key="p.id" class="inline-flex items-center gap-2 bg-white border rounded px-3 py-2">
                  <input type="checkbox" :value="p.id" v-model="form.requiredPositionIds" />
                  <span>{{ p.name }}</span>
                  <span v-if="p.department" class="text-xs text-gray-500">· {{ p.department.name }}</span>
                  <span v-if="p.isNoteTaker" class="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Note</span>
                  <span v-if="p.isAdmin" class="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">Admin</span>
                </label>
              </div>
              <p v-else class="text-sm text-gray-500">ไม่มีข้อมูลตำแหน่ง</p>
            </div>

            <!-- Services (checkbox) -->
            <div>
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium mb-2">อุปกรณ์/บริการที่ต้องการ</label>
                <div class="flex gap-2 text-sm">
                  <button type="button" class="underline text-blue-600" @click="selectAllServices">เลือกทั้งหมด</button>
                  <button type="button" class="underline text-gray-600" @click="clearServices">ล้างทั้งหมด</button>
                </div>
              </div>
              <div v-if="services.length" class="flex flex-wrap gap-3">
                <label v-for="s in services" :key="s.id" class="inline-flex items-center gap-2 bg-white border rounded px-3 py-2">
                  <input type="checkbox" :value="s.id" v-model="form.serviceIds" />
                  <span>{{ s.name }}</span>
                  <span class="text-xs text-gray-500">· {{ s.category }}</span>
                  <span v-if="s.requiresApproval" class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">ต้องยืนยัน</span>
                </label>
              </div>
              <p v-else class="text-sm text-gray-500">ไม่มีข้อมูลบริการ</p>
            </div>

            <!-- Agenda URL -->
            <div>
              <label class="block text-sm font-medium mb-2">ลิงก์วาระ (ไม่บังคับ)</label>
              <input v-model.trim="form.agendaUrl" type="url" placeholder="https://..." class="w-full px-4 py-3 border rounded-lg" />
            </div>

            <div class="flex justify-end pt-2">
              <button type="submit" :disabled="submitting || !canSubmit"
                      class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
                {{ submitting ? "กำลังจอง..." : "ยืนยันการจอง" }}
              </button>
            </div>
          </form>
        </div>

        <pre class="mt-6 text-xs text-gray-500 bg-gray-50 p-4 rounded">{{ debugPayload }}</pre>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/lib/api.js'

const me = ref(null)
const rooms = ref([])
const positions = ref([])
const services = ref([])
const errorMsg = ref('')
const successMsg = ref('')
const submitting = ref(false)

const form = ref({
  roomId: null,
  startLocal: '',
  endLocal: '',
  requiredPositionIds: [],
  serviceIds: [],
  agendaUrl: ''
})

function toISOFromLocal(dtLocal) {
  if (!dtLocal || typeof dtLocal !== 'string' || !dtLocal.includes('T')) return ''
  const [datePart, timePart] = dtLocal.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  const local = new Date(y, (m||1)-1, d||1, hh||0, mm||0, 0, 0)
  if (isNaN(local.getTime())) return ''
  return local.toISOString()
}
const startISO = computed(() => toISOFromLocal(form.value.startLocal))
const endISO   = computed(() => toISOFromLocal(form.value.endLocal))
const startTs  = computed(() => Date.parse(startISO.value || ''))
const endTs    = computed(() => Date.parse(endISO.value || ''))

const durationOk = computed(() => !!form.value.startLocal && !!form.value.endLocal && endTs.value > startTs.value)
const canSubmit  = computed(() => !!form.value.roomId && durationOk.value)

const debugPayload = computed(() => JSON.stringify({
  roomId: Number(form.value.roomId || 0),
  startTime: startISO.value,
  endTime: endISO.value,
  requiredPositionIds: form.value.requiredPositionIds,
  serviceIds: form.value.serviceIds,
  agendaUrl: form.value.agendaUrl || undefined
}, null, 2))

const endMinLocal = ref('')
watch(() => form.value.startLocal, val => {
  if (!val) { endMinLocal.value = ''; return }
  const [datePart, timePart] = val.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  const dt = new Date(y, (m||1)-1, d||1, hh||0, (mm||0)+1, 0, 0)
  const pad = n => String(n).padStart(2,'0')
  endMinLocal.value = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
})

function onStartBlur() {
  if (form.value.startLocal && !form.value.endLocal) {
    const [datePart, timePart] = form.value.startLocal.split('T')
    const [y, m, d] = datePart.split('-').map(Number)
    const [hh, mm] = timePart.split(':').map(Number)
    const dt = new Date(y, (m||1)-1, d||1, hh||0, mm||0, 0, 0)
    dt.setHours(dt.getHours() + 1)
    const pad = n => String(n).padStart(2,'0')
    form.value.endLocal = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
  }
}

// Select/Clear helpers
function selectAllPositions() { form.value.requiredPositionIds = positions.value.map(p => p.id) }
function clearPositions() { form.value.requiredPositionIds = [] }
function selectAllServices() { form.value.serviceIds = services.value.map(s => s.id) }
function clearServices() { form.value.serviceIds = [] }

// API
async function fetchRooms() {
  const { data } = await api.get('/api/rooms')
  rooms.value = data
}
async function fetchPositions() {
  const { data } = await api.get('/api/positions') // new endpoint
  positions.value = data
}
async function fetchServices() {
  const { data } = await api.get('/api/services') // new endpoint
  services.value = data
}

async function submitBooking() {
  errorMsg.value = ''; successMsg.value = ''
  if (!canSubmit.value) { errorMsg.value = 'กรุณาเลือกห้องและเวลาให้ถูกต้อง'; return }

  const payload = {
    roomId: Number(form.value.roomId),
    startTime: startISO.value,
    endTime: endISO.value,
    requiredPositionIds: form.value.requiredPositionIds,
    serviceIds: form.value.serviceIds,
    agendaUrl: form.value.agendaUrl || undefined
  }
  try {
    submitting.value = true
    await api.post('/api/bookings', payload)
    successMsg.value = 'จองห้องสำเร็จ!'
  } catch (e) {
    console.error(e)
    errorMsg.value = e?.response?.data?.error || 'จองห้องไม่สำเร็จ'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  // ถ้าต้องการบังคับมี token ก่อนใช้งาน ให้เช็คและ redirect ที่นี่
  await Promise.all([fetchRooms(), fetchPositions(), fetchServices()])
})
</script>
