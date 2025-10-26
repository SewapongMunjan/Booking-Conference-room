<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Left Sidebar -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
      <div class="h-full flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl shadow-md">
              🧹
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">แดชบอร์ดแม่บ้าน</h3>
              <p class="text-[10px] text-gray-500">Housekeeping Console</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link
            v-for="item in sidebarItems"
            :key="item.to"
            :to="item.to"
            :class="['nav-link', isActive(item) ? 'nav-active' : '']"
            exact
          >
            <span class="text-lg" v-html="item.icon"></span>
            <span class="text-sm">{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'Housekeeper' }}</div>
              <div class="text-[10px] text-gray-500 truncate">{{ me?.email || '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Header -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white border-b border-gray-200">
      <div class="w-full px-8 py-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-lg lg:hidden">
            🧹
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900 m-0">แดชบอร์ดหัวหน้าแม่บ้าน</h2>
            <p class="text-xs text-gray-500 m-0 hidden sm:block lg:hidden">สรุปงานและการประชุมวันนี้</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden md:block relative">
            <input v-model="q" placeholder="ค้นหาห้อง / งาน" class="w-64 pl-3 pr-3 py-2 rounded-xl border border-gray-200 text-sm" />
          </div>
          <button @click="loadAll" class="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">รีเฟรช</button>
          <button @click="logout" class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">ออกจากระบบ</button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full min-h-[calc(100vh-5rem)] px-8 py-6">
        <div class="max-w-7xl mx-auto space-y-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-3xl shadow-lg">🧹</div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 m-0">แดชบอร์ดหัวหน้าแม่บ้าน</h1>
              <p class="text-base text-gray-500 m-0 mt-1">ภาพรวมงานและห้องประชุมที่ต้องดูแล</p>
            </div>
          </div>

          <div v-if="error" class="p-3 rounded bg-red-50 text-red-600 border border-red-100">{{ error }}</div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="modern-card">
              <div class="text-xs text-gray-500">ห้องวันนี้</div>
              <div class="text-2xl font-bold mt-2">{{ roomsCount }}</div>
            </div>
            <div class="modern-card">
              <div class="text-xs text-gray-500">งานค้าง</div>
              <div class="text-2xl font-bold mt-2 text-amber-600">{{ pendingJobs }}</div>
            </div>
            <div class="modern-card">
              <div class="text-xs text-gray-500">งานเสร็จ</div>
              <div class="text-2xl font-bold mt-2 text-green-600">{{ doneJobs }}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- รายการห้อง -->
            <section class="modern-card">
  <div class="flex items-center justify-between mb-3">
    <h3 class="font-semibold">แผงลัด & โน้ตเวร</h3>
    <span v-if="quickSavedAt" class="text-xs text-gray-500">
      บันทึกล่าสุด: {{ timeTH(quickSavedAt) }}
    </span>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- ทางลัด -->
    <div class="space-y-2">
      <button class="w-full px-3 py-2 rounded-lg border hover:bg-gray-50"
              @click="goAllTasks">ดูงานทั้งหมด</button>
      <button class="w-full px-3 py-2 rounded-lg border hover:bg-gray-50"
              @click="triggerRefresh">รีโหลดข้อมูล</button>
      <button class="w-full px-3 py-2 rounded-lg border hover:bg-gray-50"
              @click="printChecklist">พิมพ์เช็กลิสต์</button>
    </div>

    <!-- โน้ตเวรวันนี้ -->
    <div>
      <label class="block text-sm text-gray-600 mb-1">โน้ตเวรวันนี้</label>
      <textarea rows="6" v-model="quickNote" @input="saveQuickNote"
        class="w-full p-2 border rounded-md"
        placeholder="จดสิ่งที่ต้องระวัง อุปกรณ์ขาด ของเสีย ฯลฯ"></textarea>
      <div class="text-xs text-gray-500 mt-1">เก็บไว้ในเครื่อง (local)</div>
    </div>
  </div>
</section>

            <!-- งานด่วน -->
            <div class="modern-card">
              <h2 class="text-lg font-semibold mb-4">งานด่วน</h2>
              <div v-if="urgentTasks.length === 0" class="text-sm text-gray-500">ไม่มีงานด่วน</div>
              <ul v-else class="space-y-2">
                <li v-for="t in urgentTasks" :key="t.id" class="p-2 border rounded flex items-center justify-between">
                  <div class="text-sm">
                    <div class="font-medium">{{ t.title }}</div>
                    <div class="text-xs text-gray-500">ห้อง: {{ t.roomName || '-' }}</div>
                  </div>
                  <div>
                    <button @click="markDone(t)" class="px-2 py-1 bg-green-600 text-white rounded text-xs">ทำเสร็จ</button>
                  </div>
                </li>
              </ul>
            </div>

            <!-- อุปกรณ์ที่ต้องเตรียม -->
            <div class="modern-card">
              <h2 class="text-lg font-semibold mb-4">อุปกรณ์ที่ต้องเตรียม</h2>
              <div v-if="equipSummary.length === 0" class="text-sm text-gray-500">ไม่มีข้อมูล</div>
              <div v-else class="flex flex-wrap gap-2">
                <span
                  v-for="e in equipSummary"
                  :key="e.label"
                  class="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs"
                >
                  {{ e.label }}: {{ e.qty }}
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const quickNote = ref(localStorage.getItem('hk:quick-note') || '')
const quickSavedAt = ref(Number(localStorage.getItem('hk:quick-note:ts') || 0))
const router = useRouter()
const route = useRoute()
const me = ref(null)
const loading = ref(false)
const error = ref('')
const q = ref('')

/** โครงข้อมูลหน้า */
const rooms = ref([]) // [{ id, name, location, timeRange, confirmed, invitedTotal, services:[], tasks:[] }]
const timer = ref(null)

/* ===== Summary Cards ===== */
const roomsCount  = computed(() => rooms.value.length)
const pendingJobs = computed(() =>
  rooms.value.reduce((s, r) => s + (r.tasks?.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length || 0), 0)
)
const doneJobs    = computed(() =>
  rooms.value.reduce((s, r) => s + (r.tasks?.filter(t => t.status === 'COMPLETED' || t.status === 'done').length || 0), 0)
)

/* ===== Views ===== */
const filteredRooms = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return rooms.value
  return rooms.value.filter(r =>
    String(r.name || '').toLowerCase().includes(term) ||
    (r.services || []).some(s => s.toLowerCase().includes(term)) ||
    (r.tasks || []).some(t => String(t.title || '').toLowerCase().includes(term))
  )
})

const urgentTasks = computed(() => {
  const list = []
  const now = Date.now()
  const within = 60 * 60 * 1000
  rooms.value.forEach(r => {
    if (!r._start) return
    const diff = r._start - now
    if (diff > 0 && diff <= within) {
      (r.tasks || []).forEach(t => list.push({ ...t, roomName: r.name }))
    }
  })
  return list
})

// รวมบริการทั้งหมด พร้อมจำนวนแนะนำ = จำนวนผู้ยืนยัน
const equipSummary = computed(() => {
  const agg = new Map()
  for (const r of rooms.value) {
    for (const s of r.services || []) {
      agg.set(s, (agg.get(s) || 0) + (r.confirmed || 0))
    }
  }
  return Array.from(agg.entries()).map(([label, qty]) => ({ label, qty }))
})

/* ===== API ===== */
async function fetchMe() {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = data
  } catch {
    me.value = null
  }
}

// แปลงช่วงเวลาให้อ่านง่าย (พ.ศ.)
function fmtRange(startISO, endISO){
  const a = new Date(startISO), b = new Date(endISO)
  const pad = n => String(n).padStart(2,'0')
  const th = (d)=> `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()+543} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  return `${th(a)} - ${th(b)}`
}

function saveQuickNote() {
  quickSavedAt.value = Date.now()
  localStorage.setItem('hk:quick-note', quickNote.value)
  localStorage.setItem('hk:quick-note:ts', String(quickSavedAt.value))
}
function timeTH(ts) {
  if (!ts) return '-'
  const d = new Date(ts); if (Number.isNaN(d.getTime())) return '-'
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function goAllTasks() {
  // ไปหน้ารวมงานแม่บ้าน (ปรับ path ตาม route จริง ถ้าใช้ชื่ออื่น)
  router.push('/housekeeping/tasks')
}

function triggerRefresh() {
  // แจ้งทุกแท็บให้รีโหลด (แดชบอร์ดคุณฟัง hk:task-updated อยู่แล้ว)
  localStorage.setItem('hk:task-updated', String(Date.now()))
  // กระตุ้นให้หน้าปัจจุบันรีเฟรชข้อมูล (ถ้ามี onfocus handler)
  window.dispatchEvent(new Event('focus'))
}

function printChecklist() {
  // ใช้พิมพ์หน้าปัจจุบัน (หรือจะเปิดหน้ารายการงานก่อนก็ได้)
  window.print()
}

// เติมจำนวนผู้ยืนยัน/เชิญทั้งหมด จาก /api/bookings/:id
async function hydrateAttendeeCounts(list){
  const unique = Array.from(new Set(list.map(x => x.bookingId).filter(Boolean)))
  const batches = []
  const copy = unique.slice()
  while (copy.length) batches.push(copy.splice(0, 8))
  const map = new Map()
  for (const batch of batches){
    await Promise.all(batch.map(async id => {
      try{
        const { data } = await api.get(`/api/bookings/${id}`)
        const bk = data?.booking
        if (!bk) { map.set(id, { confirmed: 0, invitedTotal: 0, services: [] }); return }
        const acceptedInvites = (bk.invites || []).filter(v=>v.status==='ACCEPTED').length
        const acceptedNoteTakers = (bk.noteTakers || []).filter(v=>v.status==='ACCEPTED').length
        const organizer = bk.bookedBy ? 1 : 0
        const serviceNames = (bk.services || []).map(bs => bs.service?.name).filter(Boolean)
        map.set(id, {
          confirmed: acceptedInvites + acceptedNoteTakers + organizer,
          invitedTotal: (bk.invites || []).length + acceptedNoteTakers + organizer,
          services: Array.from(new Set(serviceNames)),
        })
      }catch{
        map.set(id, { confirmed: 0, invitedTotal: 0, services: [] })
      }
    }))
  }
  list.forEach(r => {
    const v = map.get(r.bookingId) || { confirmed: 0, invitedTotal: 0, services: [] }
    r.confirmed = v.confirmed
    r.invitedTotal = v.invitedTotal
    const existing = Array.isArray(r.services) ? r.services : []
    r.services = Array.from(new Set([ ...existing, ...v.services ]))
  })
}

async function loadFromHousekeeping(){
  const { data } = await api.get('/api/housekeeping/tasks')
  const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : [])
  const result = items.map(it => ({
    id: it.room?.id ?? it.roomId ?? `room-${it.bookingId ?? it.id}`,
    bookingId: it.bookingId,
    name: it.room?.roomName ?? it.room?.name ?? it.roomName ?? 'ไม่ระบุ',
    location: it.room?.location,
    services: (it.services || []).map(s => s.name || s),
    timeRange: fmtRange(it.startTime, it.endTime),
    _start: new Date(it.startTime).getTime(),
    tasks: it.tasks || [],
  }))
  await hydrateAttendeeCounts(result)
  rooms.value = result

  // ⚠️ เคลียร์ธง "เสร็จแล้ว" ถ้ายังพบว่ายังมีงานค้างจริงจาก API
  rooms.value.forEach(r => {
    const list = Array.isArray(r.tasks) ? r.tasks : []
    const stillOpen = list.some(t => !['COMPLETED','DONE'].includes(String(t.status).toUpperCase()))
    if (stillOpen) localStorage.removeItem(`hk:room-done:${r.bookingId}`)
  })
}

async function loadAll(){
  loading.value = true
  error.value = ''
  try{
    await loadFromHousekeeping()
  }catch(e){
    console.warn('fallback bookings list', e?.response?.status || e?.message)
    try{
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const end   = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1).toISOString()
      const { data } = await api.get('/api/bookings', { params: { start, end, page:1, pageSize:200 } })
      const items = data?.items || []
      const mapped = items.map(b => ({
        id: b.room?.id ?? b.roomId ?? `room-${b.id}`,
        bookingId: b.id,
        name: b.room?.roomName ?? b.room?.name ?? 'ไม่ระบุ',
        location: b.room?.location,
        services: (b.services || []).map(s => s.service?.name || s.name).filter(Boolean),
        timeRange: fmtRange(b.startTime, b.endTime),
        _start: new Date(b.startTime).getTime(),
        tasks: [],
      }))
      await hydrateAttendeeCounts(mapped)
      rooms.value = mapped
      // fallback ไม่มี tasks -> ไม่แตะธง ให้ใช้ค่าที่เคยตั้งไว้
    }catch(err){
      console.error('[HousekeepingDashboard] load error', err)
      error.value = err?.response?.data?.error || err?.message || 'โหลดข้อมูลล้มเหลว'
      rooms.value = []
    }
  }finally{
    loading.value = false
  }
}

/* ===== Actions ===== */
function isRoomDone(room) {
  const list = Array.isArray(room.tasks) ? room.tasks : []
  if (list.length > 0) {
    return list.every(t => ['COMPLETED','DONE'].includes(String(t.status).toUpperCase()))
  }
  // กรณีไม่มี tasks ให้ดูจากธงที่ตั้งไว้ตอนกด "ทำเสร็จ"
  return localStorage.getItem(`hk:room-done:${room.bookingId}`) === '1'
}

async function markDone(task){
  if (!task?.id) return
  const confirm = await Swal.fire({
    title: 'ยืนยัน',
    text: 'ต้องการทำงานนี้ให้เสร็จหรือไม่?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'ใช่, เสร็จแล้ว',
    cancelButtonText: 'ยกเลิก'
  })
  if (!confirm.isConfirmed) return

  try {
    await api.post(`/api/housekeeping/update/${task.id}`, { status: 'COMPLETED' })
    task.status = 'COMPLETED'
    localStorage.setItem('hk:task-updated', String(Date.now()))
    await loadAll()
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'อัปเดตเรียบร้อย', timer: 1500, showConfirmButton: false })
  } catch (e) {
    console.error('markDone', e)
    Swal.fire({ icon: 'error', title: 'ข้อผิดพลาด', text: e?.response?.data?.error || e?.message || 'อัปเดตสถานะไม่สำเร็จ' })
  }
}

async function markRoomDone(room){
  const list = Array.isArray(room?.tasks) ? room.tasks : []
  if (list.length === 0) {
    await Swal.fire({ icon: 'info', title: 'ไม่มีงานในห้องนี้', text: 'ยังไม่มีรายการงานให้ทำเสร็จ' })
    return
  }

  const confirm = await Swal.fire({
    title: 'ยืนยัน',
    html: `ต้องการทำงานทั้งหมดของ <b>${room.name || 'ห้องนี้'}</b> ให้เสร็จหรือไม่?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'ใช่, ทำเสร็จทั้งหมด',
    cancelButtonText: 'ยกเลิก'
  })
  if (!confirm.isConfirmed) return

  try {
    await Promise.all(
      list
        .filter(t => t?.id && !['COMPLETED','DONE'].includes(String(t.status).toUpperCase()))
        .map(t => api.post(`/api/housekeeping/update/${t.id}`, { status: 'COMPLETED' }))
    )

    // ตั้งธงให้ห้องนี้เป็น "เสร็จแล้ว" (ใช้ในกรณีหน้าอื่นไม่ส่ง tasks กลับมา)
    localStorage.setItem(`hk:room-done:${room.bookingId}`, '1')

    // แจ้งแท็บอื่นและรีโหลด
    localStorage.setItem('hk:task-updated', String(Date.now()))
    await loadAll()

    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'อัปเดตเรียบร้อย', timer: 1500, showConfirmButton: false })
  } catch (e) {
    console.error('markRoomDone', e)
    Swal.fire({ icon: 'error', title: 'อัปเดตไม่สำเร็จ', text: e?.response?.data?.error || e?.message || 'เกิดข้อผิดพลาด' })
  }
}

function logout(){
  localStorage.removeItem('access_token')
  localStorage.removeItem('me')
  router.push('/login')
}

/* ===== Nav ===== */
const sidebarItems = [
  { to: '/housekeeping/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/housekeeping/tasks',     label: 'งานทั้งหมด', icon: '🧾' },
]
function isActive(item) {
  try { return route.path === item.to || route.path.startsWith(item.to) } catch { return false }
}

/* === Live refresh hooks (จากแท็บอื่น/เปลี่ยนโฟกัส) === */
function onStorage(e) {
  if (e.key === 'hk:task-updated') loadAll()
}
function onVisibility() {
  if (!document.hidden) loadAll()
}

/* ===== Mount ===== */
onMounted(async () => {
  await fetchMe()
  await loadAll()
  // tick ทุก 1 นาที
  timer.value = setInterval(loadAll, 60_000)
  // ฟังสัญญาณจากแท็บอื่น + โฟกัสกลับมา
  window.addEventListener('storage', onStorage)
  document.addEventListener('visibilitychange', onVisibility)
})
onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
  window.removeEventListener('storage', onStorage)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
.nav-link { @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900; }
.nav-active { @apply bg-emerald-50 text-emerald-600; }
.modern-card { @apply bg-white rounded-2xl border border-gray-200 p-6; }
</style>