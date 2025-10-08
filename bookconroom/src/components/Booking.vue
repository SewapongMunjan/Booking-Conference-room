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
          <img :src="me?.avatarUrl || 'https://via.placeholder.com/40x40'" class="w-10 h-10 rounded-full border-2" />
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto flex gap-6 p-6">
      <!-- Sidebar -->
      <aside class="hidden md:block w-64 bg-white rounded-xl shadow-sm p-4">
        <nav class="flex flex-col gap-2">
          <router-link to="/" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">🏠 หน้าแรก</router-link>
          <router-link to="/booking" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg">📅 จองห้องประชุม</router-link>
          <router-link to="/booking-list" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">📋 รายการจองของฉัน</router-link>
          <router-link to="/room-use" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">🗂️ ตารางการใช้ห้องประชุม</router-link>
          <router-link to="/room-status" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">ℹ️ สถานะห้องประชุม</router-link>
          <router-link to="/report" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">⚠️ แจ้งปัญหา</router-link>
          <router-link to="/admin/approvals" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">🛡️ อนุมัติการจอง (Admin)</router-link>
          <router-link to="/my-invites" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">📨 คำเชิญของฉัน</router-link>
        </nav>
      </aside>

      <!-- Main -->
      <main class="flex-1">
        <div class="mb-6 flex items-center gap-4">
          <div class="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl">🔒</div>
          <div>
            <h1 class="text-2xl font-semibold text-blue-600 m-0">จองห้องประชุม</h1>
            <p class="text-gray-600 text-sm m-0">กรอกข้อมูลให้ครบ แล้วกดยืนยัน</p>
          </div>
        </div>

        <!-- Alerts -->
        <div v-if="errorMsg" class="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border">{{ errorMsg }}</div>
        <div v-if="successMsg" class="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border">{{ successMsg }}</div>

        <!-- Card: Form + Preview -->
        <!-- NOTE: overflow-visible เพื่อไม่ตัด modal/ป๊อปอัป -->
        <div class="bg-white rounded-2xl border shadow-sm overflow-visible max-w-5xl mx-auto">
          <!-- ซ้ายยืดได้ + ขวาคงที่ 320px -->
          <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px]">
            <!-- LEFT: FORM -->
            <div class="p-4 sm:p-6 md:p-8 order-2 md:order-1 min-w-0">
              <h2 class="text-2xl font-semibold text-gray-900 mb-6">Booking</h2>

              <form @submit.prevent="submitBooking" class="space-y-6" novalidate>
                <!-- Room -->
                <div>
                  <label class="block text-sm font-medium mb-2">Meeting room <span class="text-red-500">*</span></label>
                  <select v-model.number="form.roomId" class="w-full px-4 py-3 border rounded-lg pr-10">
                    <option :value="null" disabled>-- เลือกห้อง --</option>
                    <option v-for="r in rooms" :key="r.id" :value="r.id">
                      {{ r.roomName }}<span v-if="r.capacity"> ({{ r.capacity }} ที่นั่ง)</span> - {{ r.status }}
                    </option>
                  </select>
                </div>

                <!-- Date & Time (native) -->
                <div class="space-y-3">
                  <div class="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
                    <!-- Date -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Date <span class="text-red-500">*</span></label>
                      <input type="date" v-model="dateOnly" class="w-full px-4 py-3 border rounded-lg" />
                    </div>

                    <!-- spacer -->
                    <div class="hidden md:flex justify-center text-xs text-gray-500 mb-2"></div>

                    <!-- Time from / to -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Time from</label>
                      <div class="flex items-center gap-2">
                        <input
                          type="time"
                          v-model="startTimeOnly"
                          :disabled="!dateOnly || wholeDay"
                          step="60"
                          class="flex-1 px-4 py-3 border rounded-lg"
                        />
                        <span class="text-gray-500">to</span>
                        <input
                          type="time"
                          v-model="endTimeOnly"
                          :min="startTimeOnly || undefined"
                          :disabled="!dateOnly || wholeDay"
                          step="60"
                          class="flex-1 px-4 py-3 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Whole day -->
                  <label class="inline-flex items-center gap-2 text-gray-700 select-none">
                    <input type="checkbox" v-model="wholeDay" :disabled="!dateOnly" />
                    <span>Whole day</span>
                  </label>

                  <!-- แจ้งเตือนช่วงเวลาผิด -->
                  <p v-if="form.startLocal && form.endLocal && !durationOk" class="text-sm text-red-600">
                    เวลาสิ้นสุดต้องช้ากว่าเวลาเริ่ม
                  </p>
                </div>

                <!-- Positions -->
                <div>
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium mb-2">ตำแหน่งที่ต้องเข้าประชุม</label>
                    <div class="flex gap-2 text-sm">
                      <button type="button" class="underline text-blue-600" @click="selectAllPositions">เลือกทั้งหมด</button>
                      <button type="button" class="underline text-gray-600" @click="clearPositions">ล้างทั้งหมด</button>
                    </div>
                  </div>
                  <div v-if="positions.length" class="flex flex-wrap gap-2">
                    <label v-for="p in positions" :key="p.id" class="inline-flex items-center gap-2 border rounded-full px-3 py-1.5 bg-white hover:bg-gray-50">
                      <input type="checkbox" :value="p.id" v-model="form.requiredPositionIds" />
                      <span class="text-sm">{{ p.name }}</span>
                      <span v-if="p.department" class="text-xs text-gray-500">· {{ p.department.name }}</span>
                      <span v-if="p.isNoteTaker" class="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Note</span>
                    </label>
                  </div>
                  <p v-else class="text-sm text-gray-500">ไม่มีข้อมูลตำแหน่ง</p>
                </div>

                <!-- Services -->
                <div>
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium mb-2">อุปกรณ์/บริการที่ต้องการ</label>
                    <div class="flex gap-2 text-sm">
                      <button type="button" class="underline text-blue-600" @click="selectAllServices">เลือกทั้งหมด</button>
                      <button type="button" class="underline text-gray-600" @click="clearServices">ล้างทั้งหมด</button>
                    </div>
                  </div>
                  <div v-if="services.length" class="flex flex-wrap gap-2">
                    <label v-for="s in services" :key="s.id" class="inline-flex items-center gap-2 border rounded-full px-3 py-1.5 bg-white hover:bg-gray-50">
                      <input type="checkbox" :value="s.id" v-model="form.serviceIds" />
                      <span class="text-sm">{{ s.name }}</span>
                      <span class="text-xs text-gray-500">· {{ s.category }}</span>
                      <span v-if="s.requiresApproval" class="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">ต้องยืนยัน</span>
                    </label>
                  </div>
                  <p v-else class="text-sm text-gray-500">ไม่มีข้อมูลบริการ</p>
                </div>

                <!-- Agenda -->
                <div>
                  <label class="block text-sm font-medium mb-2">ลิงก์วาระ (ไม่บังคับ)</label>
                  <input v-model.trim="form.agendaUrl" type="url" placeholder="https://..." class="w-full px-4 py-3 border rounded-lg" />
                </div>

                <!-- Submit -->
                <div class="pt-2">
                  <button
                    type="submit"
                    :disabled="submitting || !canSubmit"
                    class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
                    {{ submitting ? "กำลังจอง..." : "ยืนยันการจอง" }}
                  </button>
                </div>
              </form>
            </div>

            <!-- RIGHT: PREVIEW -->
            <aside class="bg-gray-50 p-4 sm:p-6 md:p-8 border-t md:border-t-0 md:border-l order-1 md:order-2 min-w-0">
              <div class="space-y-4">
                <!-- รูป: ความสูงคงที่ + overflow ที่กล่องรูปเท่านั้น -->
                <div class="w-full bg-white border rounded-lg overflow-hidden">
                  <img
                    :src="(rooms.find(r => r.id === form.roomId)?.photoUrl) || 'https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1200&auto=format&fit=crop'"
                    alt="room preview"
                    class="w-full h-40 md:h-48 object-cover"
                  />
                </div>

                <div>
                  <h3 class="font-semibold text-gray-900 m-0">{{ currentRoomName || 'เลือกห้อง' }}</h3>
                  <ul class="mt-3 space-y-1 text-sm text-gray-700">
                    <li v-if="rooms.find(r => r.id === form.roomId)?.capacity">👥 {{ rooms.find(r => r.id === form.roomId)?.capacity }} people</li>
                    <li v-if="rooms.find(r => r.id === form.roomId)?.status">ℹ️ สถานะ: {{ rooms.find(r => r.id === form.roomId)?.status }}</li>
                    <li v-if="form.startLocal">🗓️ {{ selectedDayLabel }}</li>
                    <li v-if="form.startLocal && form.endLocal">⏰ {{ fmtTime(startISO) }} - {{ fmtTime(endISO) }}</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <!-- Room schedule of selected day -->
        <div v-if="roomSchedule.length" class="bg-white rounded-xl p-6 mt-8 border max-w-5xl mx-auto">
          <h3 class="font-semibold mb-3">
            ตารางการใช้ห้อง {{ currentRoomName }} ({{ selectedDayLabel }})
          </h3>
          <ul class="list-disc pl-6">
            <li v-for="b in roomSchedule" :key="b.id">
              {{ fmtTime(b.startTime) }} - {{ fmtTime(b.endTime) }}
              <span class="text-xs text-gray-500">· {{ b.status }}</span>
            </li>
          </ul>
        </div>

        <!-- Debug -->
        <pre class="mt-6 text-xs text-gray-500 bg-gray-50 p-4 rounded max-w-5xl mx-auto overflow-auto">{{ debugPayload }}</pre>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/lib/api.js'

/* ---------- state ---------- */
const me        = ref(null)
const rooms     = ref([])
const positions = ref([])
const services  = ref([])

const errorMsg   = ref('')
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

/* ---------- helpers: datetime ---------- */
function toISOFromLocal (dtLocal) {
  if (!dtLocal || typeof dtLocal !== 'string' || !dtLocal.includes('T')) return ''
  const [datePart, timePart] = dtLocal.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm]  = timePart.split(':').map(Number)
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

/* ---------- Date/Time split models (ใช้กับ input native) ---------- */
const wholeDay = ref(false)

const dateOnly = computed({
  get() { return (form.value.startLocal && form.value.startLocal.split('T')[0]) || '' },
  set(v) {
    if (!v) { form.value.startLocal = ''; form.value.endLocal = ''; return }
    const st = startTimeOnly.value || '09:00'
    const et = endTimeOnly.value   || '18:00'
    form.value.startLocal = `${v}T${st}`
    form.value.endLocal   = `${v}T${et}`
  }
})
const startTimeOnly = computed({
  get() { return (form.value.startLocal && form.value.startLocal.split('T')[1]?.slice(0,5)) || '' },
  set(v) { if (!dateOnly.value || !v) return; form.value.startLocal = `${dateOnly.value}T${v}` }
})
const endTimeOnly = computed({
  get() { return (form.value.endLocal && form.value.endLocal.split('T')[1]?.slice(0,5)) || '' },
  set(v) { if (!dateOnly.value || !v) return; form.value.endLocal = `${dateOnly.value}T${v}` }
})
watch(wholeDay, (on) => {
  if (on && dateOnly.value) { startTimeOnly.value = '09:00'; endTimeOnly.value = '18:00' }
})

/* ---------- schedule (room bookings of the day) ---------- */
const roomSchedule = ref([])

function fmtTime (iso) {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  catch { return '-' }
}
const currentRoomName = computed(() => rooms.value.find(r => r.id === form.value.roomId)?.roomName || '')
const selectedDayLabel = computed(() => {
  if (!form.value.startLocal) return ''
  const d = new Date(form.value.startLocal)
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()+543}`
})
function dayStartISO (localStr) { const d = new Date(localStr); if (isNaN(d.getTime())) return ''; d.setHours(0,0,0,0); return d.toISOString() }
function dayEndISO   (localStr) { const d = new Date(localStr); if (isNaN(d.getTime())) return ''; d.setHours(23,59,59,999); return d.toISOString() }

async function fetchRoomSchedule () {
  roomSchedule.value = []
  if (!form.value.roomId || !form.value.startLocal) return
  try {
    const params = { roomId: form.value.roomId, start: dayStartISO(form.value.startLocal), end: dayEndISO(form.value.startLocal), page: 1, pageSize: 200 }
    const { data } = await api.get('/api/bookings', { params })
    roomSchedule.value = Array.isArray(data?.items) ? data.items : []
  } catch { roomSchedule.value = [] }
}

function overlaps (aStart, aEnd, bStart, bEnd) { return aStart < bEnd && bStart < aEnd }

/* ---------- API ---------- */
async function fetchMe () { try { const { data } = await api.get('/api/auth/me'); me.value = data } catch { me.value = null } }
async function fetchRooms () { const { data } = await api.get('/api/rooms'); rooms.value = Array.isArray(data) ? data : [] }
async function fetchPositions () { try { const { data } = await api.get('/api/positions', { params: { excludeAdmin: 1, sort: 'asc' } }); positions.value = Array.isArray(data) ? data : [] } catch { positions.value = [] } }
async function fetchServices () { try { const { data } = await api.get('/api/services'); services.value = Array.isArray(data) ? data : [] } catch { services.value = [] } }

/* ---------- submit booking ---------- */
async function submitBooking () {
  errorMsg.value = ''; successMsg.value = ''
  if (!canSubmit.value) { errorMsg.value = 'กรุณาเลือกห้องและเวลาให้ถูกต้อง'; return }

  // client-side overlap check
  const s = new Date(startISO.value), e = new Date(endISO.value)
  const hasConflict = roomSchedule.value.some(b => overlaps(s, e, new Date(b.startTime), new Date(b.endTime)))
  if (hasConflict) { errorMsg.value = 'ช่วงเวลาที่เลือกชนกับการจองอื่นในห้องนี้'; return }

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
    await fetchRoomSchedule() // refresh
    // ถ้า “หน้ายืนยัน” ของคุณเป็น modal ให้แน่ใจว่า modal ถูกวางนอกการ์ดหรือใช้ <teleport to="body">
    // ถ้าเป็น route ใหม่ ให้ทำ router.push ที่นี่ได้ตามต้องการ
  } catch (e) {
    console.error(e)
    errorMsg.value = e?.response?.data?.error || 'จองห้องไม่สำเร็จ'
  } finally {
    submitting.value = false
  }
}

/* ---------- debug ---------- */
const debugPayload = computed(() =>
  JSON.stringify({
    roomId: Number(form.value.roomId || 0),
    startTime: startISO.value,
    endTime: endISO.value,
    requiredPositionIds: form.value.requiredPositionIds,
    serviceIds: form.value.serviceIds,
    agendaUrl: form.value.agendaUrl || undefined
  }, null, 2)
)

/* ---------- effects ---------- */
onMounted(async () => { await Promise.all([fetchMe(), fetchRooms(), fetchPositions(), fetchServices()]) })
watch(() => [form.value.roomId, form.value.startLocal], () => { fetchRoomSchedule() })
</script>

<style>
@media (max-width: 640px) {
  h1, h2, h3 { font-size: 1.1rem; }
  button, input, select { font-size: 0.95rem; }
}
</style>
