<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar (same as tasks) -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
      <div class="h-full flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl shadow-md">🧹</div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">Housekeeping</h3>
              <p class="text-[10px] text-gray-500">งานทั้งหมด</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link
            v-for="item in sidebarItems"
            :key="item.to"
            :to="item.to"
            :class="['nav-link', isActive(item) ? 'nav-active' : '']"
          >
            <span class="text-lg" v-html="item.icon"></span>
            <span class="text-sm">{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-2">
            <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-9 h-9 rounded-lg" />
            <div>
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
             <p class="text-xs text-gray-500 m-0 hidden sm:block lg:hidden">สรุปงานและห้องประชุมที่ต้องดูแล</p>
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

          <div v-if="error" class="modern-card p-3 bg-red-50 text-red-600 border-red-100">{{ error }}</div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="modern-card p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs text-gray-500">ห้องวันนี้</div>
                  <div class="text-2xl font-bold mt-2">{{ roomsCount }}</div>
                </div>
                <div class="text-3xl opacity-80">🏛️</div>
              </div>
              <div class="mt-3 text-xs text-gray-400">จำนวนห้องที่ต้องดูแลวันนี้</div>
            </div>
            <div class="modern-card p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs text-gray-500">งานค้าง</div>
                  <div class="text-2xl font-bold mt-2 text-amber-600">{{ pendingJobs }}</div>
                </div>
                <div class="text-3xl opacity-80">⏳</div>
              </div>
              <div class="mt-3 text-xs text-gray-400">งานที่ยังไม่เสร็จ</div>
            </div>
            <div class="modern-card p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs text-gray-500">งานเสร็จ</div>
                  <div class="text-2xl font-bold mt-2 text-green-600">{{ doneJobs }}</div>
                </div>
                <div class="text-3xl opacity-80">✅</div>
              </div>
              <div class="mt-3 text-xs text-gray-400">งานที่ทำเสร็จแล้ววันนี้</div>
            </div>
          </div>

          <!-- Recent bookings (แทนการใช้งาน 7 วัน) -->
          <section class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div class="lg:col-span-2 modern-card p-5 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-semibold text-gray-900">การจองล่าสุด</h3>
                  <div class="text-xs text-gray-500 mt-1">รายการการจองล่าสุดที่ระบบดึงมา</div>
                </div>
                <div class="flex items-center gap-3">
                  <button @click="loadRecentAndChart" class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">อัปเดต</button>
                </div>
              </div>

              <div v-if="((recentBookings || []).length) === 0" class="py-10 text-center text-gray-500">ยังไม่มีการจองล่าสุด</div>

              <div v-else class="space-y-3">
                <div
                  v-for="b in (recentBookings || [])"
                  :key="b.id"
                  class="p-3 border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-start justify-between gap-3"
                >
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 mb-1 truncate">{{ b.room?.roomName || b.roomName || '-' }}</h4>
                    <div class="text-sm text-gray-600 mb-1">{{ timeRange(b.startTime, b.endTime) }}</div>
                    <div class="text-xs text-gray-500">📅 {{ dateTH(b.startTime) }}</div>
                  </div>

                  <div class="flex flex-col items-end gap-2">
                    <span :class="['px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap', b.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-sky-100 text-sky-700']">
                      {{ statusTH(b.status) }}
                    </span>
                    <button @click="router.push(`/bookings/${b.id}`)" class="text-xs text-gray-500 hover:underline">ดูรายละเอียด</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Popular rooms (แทน chart + recent) -->
            <div class="modern-card p-5 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900">ห้องยอดนิยม</h3>
                <div class="flex items-center gap-2">
                  <button @click="loadRecentAndChart" class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">อัปเดต</button>
                </div>
              </div>

              <div v-if="((topRooms || []).length) === 0" class="text-center py-6 text-gray-500">ยังไม่มีข้อมูล</div>

              <div v-else class="space-y-3">
                <div v-for="room in (topRooms || [])" :key="room.name" class="p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:shadow-sm transition">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-2xl text-emerald-700 font-semibold">
                      {{ (room.name || '').slice(0,2) }}
                    </div>
                    <div class="min-w-0">
                      <div class="font-medium text-sm text-gray-800 truncate">{{ room.name }}</div>
                      <div class="text-xs text-gray-400 mt-0.5">{{ room.count }} ครั้ง</div>
                    </div>
                  </div>
                  <div>
                    <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- shortcuts & notes -->
            <section class="modern-card p-5">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold">แผงลัด & โน้ตเวร</h3>
                <span v-if="quickSavedAt" class="text-xs text-gray-500">บันทึกล่าสุด: {{ timeTH(quickSavedAt) }}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <button class="w-full px-3 py-2 rounded-lg border hover:bg-gray-50" @click="goAllTasks">ดูงานทั้งหมด</button>
                  <button class="w-full px-3 py-2 rounded-lg border hover:bg-gray-50" @click="triggerRefresh">รีโหลดข้อมูล</button>
                  <button class="w-full px-3 py-2 rounded-lg border hover:bg-gray-50" @click="printChecklist">พิมพ์เช็กลิสต์</button>
                </div>

                <div>
                  <label class="block text-sm text-gray-600 mb-1">โน้ตเวรวันนี้</label>
                  <textarea rows="6" v-model="quickNote" @input="saveQuickNote" class="w-full p-2 border rounded-md" placeholder="จดสิ่งที่ต้องระวัง อุปกรณ์ขาด ของเสีย ฯลฯ"></textarea>
                  <div class="text-xs text-gray-500 mt-1">เก็บไว้ในเครื่อง (local)</div>
                </div>
              </div>
            </section>

            <!-- urgent tasks -->
            <div class="modern-card p-5">
              <h2 class="text-lg font-semibold mb-4">งานด่วน</h2>
              <div v-if="((urgentTasks || []).length) === 0" class="text-sm text-gray-500">ไม่มีงานด่วน</div>
              <ul v-else class="space-y-2">
                <li v-for="t in (urgentTasks || [])" :key="t.id" class="p-2 border rounded flex items-center justify-between">
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

            <!-- equipment -->
            <div class="modern-card p-5">
              <h2 class="text-lg font-semibold mb-4">อุปกรณ์ที่ต้องเตรียม</h2>
              <div v-if="((equipSummary || []).length) === 0" class="text-sm text-gray-500">ไม่มีข้อมูล</div>
              <div v-else class="flex flex-wrap gap-2">
                <span v-for="e in (equipSummary || [])" :key="e.label" class="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
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

// state and helpers (same logic as before)
const quickNote = ref(localStorage.getItem('hk:quick-note') || '')
const quickSavedAt = ref(Number(localStorage.getItem('hk:quick-note:ts') || 0))
const router = useRouter()
const route = useRoute()
const me = ref(null)
const loading = ref(false)
const error = ref('')
const q = ref('')

const rooms = ref([])
const timer = ref(null)

const roomsCount = computed(() => (rooms.value?.length ?? 0))

const pendingJobs = computed(() =>
  (rooms.value || []).reduce((s, r) => {
    const cnt = r?.tasks?.filter(t => {
      const st = String(t?.status || '').toUpperCase()
      return st === 'PENDING' || st === 'IN_PROGRESS'
    })?.length ?? 0
    return s + cnt
  }, 0)
)

const doneJobs = computed(() =>
  (rooms.value || []).reduce((s, r) => {
    const cnt = r?.tasks?.filter(t => {
      const st = String(t?.status || '').toUpperCase()
      return st === 'COMPLETED' || st === 'DONE'
    })?.length ?? 0
    return s + cnt
  }, 0)
)

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

const equipSummary = computed(() => {
  const agg = new Map()
  for (const r of rooms.value) {
    for (const s of r.services || []) {
      agg.set(s, (agg.get(s) || 0) + (r.confirmed || 0))
    }
  }
  return Array.from(agg.entries()).map(([label, qty]) => ({ label, qty }))
})

async function fetchMe() {
  try { const { data } = await api.get('/api/auth/me'); me.value = data } catch { me.value = null }
}
function fmtRange(startISO, endISO){
  const a = new Date(startISO || 0), b = new Date(endISO || 0)
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
function goAllTasks() { router.push('/housekeeping/tasks') }
function triggerRefresh() { localStorage.setItem('hk:task-updated', String(Date.now())); window.dispatchEvent(new Event('focus')) }
function printChecklist() { window.print() }

async function hydrateAttendeeCounts(list){
  const unique = Array.from(new Set(list.map(x => x.bookingId).filter(Boolean)))
  const batches = []; const copy = unique.slice()
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
  rooms.value.forEach(r => {
    const list = Array.isArray(r.tasks) ? r.tasks : []
    const stillOpen = list.some(t => !['COMPLETED','DONE'].includes(String(t.status).toUpperCase()))
    if (stillOpen) localStorage.removeItem(`hk:room-done:${r.bookingId}`)
  })
}

async function loadAll(){
  loading.value = true; error.value = ''
  try { await loadFromHousekeeping() }
  catch(e){
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
    }catch(err){
      console.error('[HousekeepingDashboard] load error', err)
      error.value = err?.response?.data?.error || err?.message || 'โหลดข้อมูลล้มเหลว'
      rooms.value = []
    }
  }finally{ loading.value = false }
}

function isRoomDone(room) {
  const list = Array.isArray(room.tasks) ? room.tasks : []
  if (list.length > 0) return list.every(t => ['COMPLETED','DONE'].includes(String(t.status).toUpperCase()))
  return localStorage.getItem(`hk:room-done:${room.bookingId}`) === '1'
}

async function markDone(task){
  if (!task?.id) return
  const confirm = await Swal.fire({ title: 'ยืนยัน', text: 'ต้องการทำงานนี้ให้เสร็จหรือไม่?', icon: 'question', showCancelButton: true, confirmButtonText: 'ใช่, เสร็จแล้ว' })
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
  if (list.length === 0) { await Swal.fire({ icon: 'info', title: 'ไม่มีงานในห้องนี้', text: 'ยังไม่มีรายการงานให้ทำเสร็จ' }); return }
  const confirm = await Swal.fire({ title: 'ยืนยัน', html: `ต้องการทำงานทั้งหมดของ <b>${room.name || 'ห้องนี้'}</b> ให้เสร็จหรือไม่?`, icon: 'question', showCancelButton: true, confirmButtonText: 'ใช่, ทำเสร็จทั้งหมด' })
  if (!confirm.isConfirmed) return
  try {
    await Promise.all(list.filter(t => t?.id && !['COMPLETED','DONE'].includes(String(t.status).toUpperCase())).map(t => api.post(`/api/housekeeping/update/${t.id}`, { status: 'COMPLETED' })))
    localStorage.setItem(`hk:room-done:${room.bookingId}`, '1')
    localStorage.setItem('hk:task-updated', String(Date.now()))
    await loadAll()
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'อัปเดตเรียบร้อย', timer: 1500, showConfirmButton: false })
  } catch (e) {
    console.error('markRoomDone', e)
    Swal.fire({ icon: 'error', title: 'อัปเดตไม่สำเร็จ', text: e?.response?.data?.error || e?.message || 'เกิดข้อผิดพลาด' })
  }
}

function logout(){ localStorage.removeItem('access_token'); localStorage.removeItem('me'); router.push('/login') }

/* Nav */
const sidebarItems = [
  { to: '/housekeeping/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/housekeeping/tasks',     label: 'งานทั้งหมด', icon: '🧾' },
  { to: '/housekeeping/complete',  label: 'งานที่เสร็จสมบูรณ์', icon: '✅' },
]
function isActive(item) { try { return route.path === item.to || route.path.startsWith(item.to) } catch { return false } }

/* Live hooks */
function onStorage(e) { if (e.key === 'hk:task-updated') loadAll() }
function onVisibility() { if (!document.hidden) loadAll() }

// merged lifecycle: load user/data + recent/chart
onMounted(async () => {
  await fetchMe()
  await loadAll()
  await loadRecentAndChart()
  timer.value = setInterval(loadAll, 60_000)
  window.addEventListener('storage', onStorage)
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('bookings:changed', loadRecentAndChart)
})
onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
  window.removeEventListener('storage', onStorage)
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('bookings:changed', loadRecentAndChart)
})

// Admin-style recent bookings + chart (7-day)
const days = ref(7)
const chartData = ref([])
const recentBookings = ref([])
const topRooms = ref([])

function groupByDate(items, daysBack) {
  const map = new Map()
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0,0,0,0)
    map.set(d.toISOString().slice(0,10), { date: d, count: 0 })
  }
  items.forEach(b => {
    const t = b.startTime || b.createdAt || b.dateStart || b.start
    if (!t) return
    const k = new Date(t); k.setHours(0,0,0,0)
    const key = k.toISOString().slice(0,10)
    if (map.has(key)) map.get(key).count++
  })
  const max = Math.max(1, ...Array.from(map.values()).map(v => v.count))
  return Array.from(map.values()).map(v => ({
    label: v.date.toLocaleDateString('th-TH', { weekday: 'short' }),
    count: v.count,
    valuePct: Math.round((v.count / max) * 100)
  }))
}

async function loadRecentAndChart() {
  const since = new Date()
  since.setDate(since.getDate() - days.value)
  try {
    const { data } = await api.get('/api/bookings', {
      params: { page: 1, pageSize: 500, sort: '-createdAt', start_gte: since.toISOString() }
    })
    const list = Array.isArray(data?.items) ? data.items : []

    // chart (unchanged)
    chartData.value = groupByDate(list, Math.min(days.value, 7))

    // prepare start timestamps safely
    const now = Date.now()
    const withStart = list.map(b => {
      const t = b.startTime || b.start || b.createdAt || null
      const ts = t ? new Date(t).getTime() : NaN
      return { ...b, _start: Number.isNaN(ts) ? null : ts }
    })

    // upcoming (future) sorted ascending by start time
    const upcoming = withStart.filter(b => b._start && b._start >= now).sort((a, b) => a._start - b._start)

    if (upcoming.length > 0) {
      recentBookings.value = upcoming.slice(0, 8)
    } else {
      // fallback: show bookings nearest to now (past or future) by absolute distance to now
      const nearest = withStart.filter(b => b._start).sort((a, b) => Math.abs(a._start - now) - Math.abs(b._start - now))
      recentBookings.value = nearest.slice(0, 8)
    }

    // top rooms (unchanged)
    const roomMap = new Map()
    list.forEach(b => {
      const name = b.room?.roomName || '-'
      roomMap.set(name, (roomMap.get(name) || 0) + 1)
    })
    topRooms.value = Array.from(roomMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, active: true }))
  } catch (e) {
    console.error('loadRecentAndChart', e)
    recentBookings.value = []
    chartData.value = []
    topRooms.value = []
  }
}

// เพิ่ม helper ที่ใช้ใน widget (วางไว้ใน <script setup> ใกล้กับฟังก์ชันอื่นๆ)
function dateTH(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const m = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`
}
function timeRange(s, e) {
  if (!s || !e) return ''
  const opt = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(s).toLocaleTimeString([], opt)} - ${new Date(e).toLocaleTimeString([], opt)}`
}
function statusTH(s) {
  if (!s) return '-'
  const m = {
    APPROVED: 'อนุมัติแล้ว',
    AWAITING_ADMIN_APPROVAL: 'รออนุมัติ',
    AWAITING_ATTENDEE_CONFIRM: 'รอยืนยัน',
    CANCELLED: 'ยกเลิกแล้ว'
  }
  return m[s] || s
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900;
}
.nav-active {
  @apply bg-emerald-50 text-emerald-600;
}
.modern-card {
  @apply bg-white rounded-2xl border border-gray-100;
  padding: 1.25rem;
  box-shadow: 0 8px 28px rgba(15,23,42,0.06);
}
.modern-card.p-4, .modern-card.p-5 { padding: 1.25rem; }
@media (min-width:1024px) { main .max-w-7xl { max-width: 1200px; } }
table th, table td { vertical-align: middle; padding: 0.85rem 0.6rem; font-size: 0.94rem; }
tbody tr:hover { background: rgba(15,23,42,0.02); }
.kpi-icon { @apply w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white; background: linear-gradient(135deg,#10b981,#059669); box-shadow:0 10px 20px rgba(5,150,105,0.12); }
@media (min-width:1280px) { aside { width: 18rem; } }
</style>