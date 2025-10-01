<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-6 py-4 border-b shadow-sm">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-lg font-semibold text-blue-600 m-0">ระบบจองห้องประชุม</h1>
          <p class="text-sm text-gray-600 m-0">ปฏิทินการใช้ห้องประชุม</p>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto p-6 flex gap-6">
      <!-- Sidebar -->
      <aside class="w-64 bg-white rounded-xl shadow-sm p-4">
        <nav class="flex flex-col gap-2">
          <RouterLink to="/home" class="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200">
            <span class="text-lg">🏠</span> หน้าแรก
          </RouterLink>
          <RouterLink to="/booking" class="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200">
            <span class="text-lg">📅</span> จองห้องประชุม
          </RouterLink>
          <RouterLink to="/booking-list" class="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200">
            <span class="text-lg">📋</span> รายการจองของฉัน
          </RouterLink>
          <RouterLink to="/room-use" class="flex items-center gap-3 px-4 py-3 rounded-lg text-white bg-blue-600">
            <span class="text-lg">🗓️</span> ปฏิทินการใช้ห้อง
          </RouterLink>
          <RouterLink to="/room-status" class="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200">
            <span class="text-lg">ℹ️</span> สถานะห้องประชุม
          </RouterLink>
          <RouterLink to="/report" class="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200">
            <span class="text-lg">⚠️</span> แจ้งปัญหา
          </RouterLink>
          <RouterLink to="/my-invites" class="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200">
            <span class="text-lg">📨</span> คำเชิญของฉัน
          </RouterLink>
        </nav>
      </aside>

      <!-- Main -->
      <main class="flex-1">
        <!-- Toolbar -->
        <div class="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div class="flex items-center gap-2">
            <button class="px-3 py-2 border rounded hover:bg-gray-50" @click="gotoPrevMonth" type="button">← เดือนก่อน</button>
            <button class="px-3 py-2 border rounded hover:bg-gray-50" @click="gotoToday" type="button">วันนี้</button>
            <button class="px-3 py-2 border rounded hover:bg-gray-50" @click="gotoNextMonth" type="button">เดือนถัดไป →</button>
          </div>

          <div class="text-lg font-semibold text-blue-600 ml-2">
            {{ monthTitleTH }}
          </div>

          <div class="ml-auto flex items-center gap-2">
            <label class="text-sm text-gray-600" for="roomcal-room">ห้อง:</label>
            <select
              id="roomcal-room"
              name="roomcal-room"
              v-model.number="roomId"
              class="px-3 py-2 border rounded-lg"
            >
              <option :value="0">ทุกห้อง</option>
              <option v-for="r in rooms" :key="r.id" :value="r.id">
                {{ r.roomName }}<span v-if="r.capacity"> ({{ r.capacity }} ที่นั่ง)</span>
              </option>
            </select>
          </div>
        </div>

        <!-- Calendar -->
        <div class="bg-white rounded-xl shadow-sm p-2">
          <!-- Week header -->
          <div class="grid grid-cols-7 border-b text-xs font-semibold text-gray-600 sticky top-0 bg-white rounded-t-xl">
            <div class="px-2 py-2 text-center">อา</div>
            <div class="px-2 py-2 text-center">จ</div>
            <div class="px-2 py-2 text-center">อ</div>
            <div class="px-2 py-2 text-center">พ</div>
            <div class="px-2 py-2 text-center">พฤ</div>
            <div class="px-2 py-2 text-center">ศ</div>
            <div class="px-2 py-2 text-center">ส</div>
          </div>

          <!-- Cells -->
          <div class="grid grid-cols-7 gap-px bg-gray-200 rounded-b-xl">
            <div
              v-for="cell in calendarCells"
              :key="cell.key"
              class="bg-white min-h-[140px] p-2 flex flex-col"
              :class="{
                'opacity-60': cell.isOtherMonth,
                'ring-2 ring-blue-500': cell.isToday
              }"
            >
              <!-- date -->
              <div class="flex items-center justify-between">
                <div class="text-xs font-medium text-gray-500">{{ weekdayShort(cell.date) }}</div>
                <div class="text-right text-xs text-gray-500">{{ cell.date.getDate() }}</div>
              </div>

              <!-- events -->
              <div class="mt-2 space-y-1 overflow-y-auto custom-scroll">
                <template v-if="cell.events.length">
                  <div
                    v-for="ev in cell.events.slice(0, MAX_PER_CELL)"
                    :key="ev.id"
                    class="text-[11px] px-2 py-1 rounded border shadow-sm leading-snug truncate"
                    :class="badgeClass(ev.status)"
                    :title="eventTitle(ev)"
                    @click="openDayModal(cell)"
                  >
                    {{ timeRange(ev.startTime, ev.endTime) }}
                    <span v-if="!roomId" class="ml-1">· {{ ev.room?.roomName }}</span>
                  </div>

                  <!-- + more -->
                  <button
                    v-if="cell.events.length > MAX_PER_CELL"
                    class="text-[11px] px-2 py-1 rounded bg-gray-50 border hover:bg-gray-100"
                    @click="openDayModal(cell)"
                    type="button"
                  >
                    +{{ cell.events.length - MAX_PER_CELL }} เพิ่มเติม
                  </button>
                </template>

                <div v-else class="text-[11px] text-gray-400">— ไม่มีรายการ —</div>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="p-3 text-xs text-gray-600 flex gap-3">
            <span class="px-2 py-1 rounded bg-amber-100 text-amber-800">รอผู้เข้าร่วม</span>
            <span class="px-2 py-1 rounded bg-blue-100 text-blue-800">รอผู้ดูแล</span>
            <span class="px-2 py-1 rounded bg-green-100 text-green-800">อนุมัติแล้ว</span>
            <span class="px-2 py-1 rounded bg-gray-100 text-gray-700">ยกเลิก</span>
          </div>
        </div>
      </main>
    </div>

    <!-- Day Modal -->
    <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="closeModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-[520px] max-w-[90vw] p-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-blue-600">
            รายการวันที่ {{ formatDateTH(modal.date) }}
          </h3>
          <button class="px-3 py-1 border rounded hover:bg-gray-50" @click="closeModal" type="button">ปิด</button>
        </div>

        <div v-if="modal.events.length" class="space-y-2 max-h-[60vh] overflow-y-auto custom-scroll">
          <div
            v-for="ev in modal.events"
            :key="ev.id"
            class="flex items-start gap-3 p-3 rounded-lg border"
            :class="badgeClass(ev.status)"
            :title="eventTitle(ev)"
          >
            <div class="text-xs font-semibold shrink-0 w-28">
              {{ timeRange(ev.startTime, ev.endTime) }}
            </div>
            <div class="text-sm leading-snug">
              <div class="font-medium">
                {{ ev.room?.roomName || '—' }}
              </div>
              <div class="text-gray-600 text-xs">
                ผู้จอง: {{ ev.bookedBy?.fullName || '—' }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-gray-500">ไม่มีรายการ</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/lib/api.js'

/* ===== constants ===== */
const MAX_PER_CELL = 3

/* ===== state ===== */
const viewDate = ref(new Date())
const rooms = ref([])
const roomId = ref(0)           // 0 = ทุกห้อง
const bookings = ref([])

/* ===== modal state ===== */
const modal = ref({
  open: false,
  date: null,
  events: []
})

/* ===== helpers: วัน/เดือน ===== */
const TH_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const TH_WEEKDAY_SHORT = ['อา','จ','อ','พ','พฤ','ศ','ส']

const monthTitleTH = computed(() => {
  const d = viewDate.value
  return `${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
})
function weekdayShort(d){ return TH_WEEKDAY_SHORT[d.getDay()] }
function formatDateTH(d){
  const dd = d.getDate()
  const mm = TH_MONTHS[d.getMonth()]
  const yy = d.getFullYear() + 543
  return `${dd} ${mm} ${yy}`
}

function startOfMonth(d){ const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x }
function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0, 23,59,59,999) }
function startOfCalendarGrid(d){
  const first = startOfMonth(d)
  const offset = first.getDay() // 0=Sun
  const x = new Date(first)
  x.setDate(first.getDate() - offset)
  return x
}
function endOfCalendarGrid(d){
  const s = startOfCalendarGrid(d)
  const x = new Date(s)
  x.setDate(s.getDate() + 41)
  x.setHours(23,59,59,999)
  return x
}

/* ===== fetch ===== */
async function fetchRooms(){
  const { data } = await api.get('/api/rooms')
  rooms.value = Array.isArray(data) ? data : []
}
async function fetchMonth(){
  const start = startOfMonth(viewDate.value).toISOString()
  const end = endOfMonth(viewDate.value).toISOString()
  const params = { start, end, page: 1, pageSize: 1000 }
  if (roomId.value) params.roomId = roomId.value
  const { data } = await api.get('/api/bookings', { params })
  bookings.value = Array.isArray(data?.items) ? data.items : []
}

/* ===== calendar cells with events ===== */
const calendarCells = computed(() => {
  const start = startOfCalendarGrid(viewDate.value)
  const cells = []
  for (let i = 0; i < 42; i++){
    const d = new Date(start); d.setDate(start.getDate() + i)
    const sameMonth = d.getMonth() === viewDate.value.getMonth()
    const today = isSameDate(d, new Date())

    const dayStart = new Date(d); dayStart.setHours(0,0,0,0)
    const dayEnd = new Date(d); dayEnd.setHours(23,59,59,999)

    const events = bookings.value
      .filter(b => new Date(b.startTime).getTime() < dayEnd.getTime() &&
                   new Date(b.endTime).getTime() > dayStart.getTime())
      .sort((a,b)=> new Date(a.startTime) - new Date(b.startTime))

    cells.push({ key: i, date: d, isOtherMonth: !sameMonth, isToday: today, events })
  }
  return cells
})

function isSameDate(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate() }

/* ===== formatters ===== */
function timeRange(s,e){
  const opt = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(s).toLocaleTimeString([],opt)} - ${new Date(e).toLocaleTimeString([],opt)}`
}
function eventTitle(ev){
  const room = ev.room?.roomName ? ` · ${ev.room.roomName}` : ''
  const by = ev.bookedBy?.fullName ? ` · โดย ${ev.bookedBy.fullName}` : ''
  return `${timeRange(ev.startTime, ev.endTime)}${room}${by}`
}
function badgeClass(status){
  switch(status){
    case 'AWAITING_ATTENDEE_CONFIRM': return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'AWAITING_ADMIN_APPROVAL':   return 'bg-blue-50 text-blue-800 border-blue-200'
    case 'APPROVED':                  return 'bg-green-50 text-green-800 border-green-200'
    case 'CANCELLED':                 return 'bg-gray-50 text-gray-700 border-gray-200'
    default:                          return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

/* ===== navigation ===== */
function gotoToday(){ viewDate.value = new Date() }
function gotoPrevMonth(){ const d=new Date(viewDate.value); d.setMonth(d.getMonth()-1); viewDate.value=d }
function gotoNextMonth(){ const d=new Date(viewDate.value); d.setMonth(d.getMonth()+1); viewDate.value=d }

/* ===== modal helpers ===== */
function openDayModal(cell){
  modal.value.open = true
  modal.value.date = cell.date
  modal.value.events = cell.events.slice()
}
function closeModal(){
  modal.value.open = false
  modal.value.date = null
  modal.value.events = []
}

/* ===== lifecycle ===== */
watch([viewDate, roomId], fetchMonth)
onMounted(async () => {
  await fetchRooms()
  await fetchMonth()
})
</script>

<style scoped>
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 transparent;
}
.custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 9999px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
</style>
