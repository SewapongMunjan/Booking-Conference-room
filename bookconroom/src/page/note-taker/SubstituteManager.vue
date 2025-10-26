<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
      <div class="h-full flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl shadow-md">🔁</div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">ระบบจดประชุม</h3>
              <p class="text-[10px] text-gray-500">Substitute Manager</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link to="/note-taker/dashboard" class="nav-link">🏠 หน้าหลัก</router-link>
          <router-link to="/note-taker/my-queue" class="nav-link">📋 คิวของฉัน</router-link>
          <router-link to="/note-taker/leave-request" class="nav-link">🗓️ ลาล่วงหน้า</router-link>
          <router-link to="/note-taker/substitute" class="nav-link nav-active">🔁 จัดการแทนที่</router-link>
        </nav>

        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'NoteTaker' }}</div>
              <div class="text-[10px] text-gray-500 truncate">{{ me?.email || '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Header -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white border-b border-gray-200">
      <div class="w-full px-8 py-4 flex items-center max-w-7xl mx-auto">
        <h1 class="text-lg font-semibold m-0">จัดการแทนคนลา</h1>

        <div class="ml-auto flex items-center gap-3">
          <div class="hidden md:flex items-center gap-2">
            <label class="text-sm text-gray-600">เลือกวันที่</label>
            <input type="date" v-model="selectedDate" class="border rounded-lg px-2 py-1 text-sm" @change="loadCompat" />
          </div>

          <div class="relative hidden sm:block">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">⌕</span>
            <input v-model="q" placeholder="ค้นหา ห้อง / ผู้จด..." class="w-64 pl-10 pr-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <button class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700" @click="loadAll">รีเฟรช</button>
          <button @click="logout" class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">
            <svg class="w-5 h-5 text-red-600 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/></svg>
            <span class="hidden md:inline text-red-600">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full min-h-[calc(100vh-5rem)] px-8 py-6">
        <div class="max-w-7xl mx-auto space-y-6">
          <div v-if="fetchError" class="text-red-600 p-4 rounded-lg bg-red-50 border border-red-100">Error: {{ fetchError }}</div>

          <div class="modern-card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">รายการต้องหา “ผู้จดแทน” ({{ filtered.length }} รายการ)</h2>
            </div>

            <div v-if="loading" class="text-gray-500">กำลังโหลด...</div>
            <div v-else-if="filtered.length === 0" class="text-gray-500">
              ไม่มีรายการในช่วงนี้
              <div class="text-xs text-gray-400 mt-1">* ระบบจะแสดงงานที่ต้องหาแทนย้อนหลัง/ล่วงหน้า 30 วัน</div>
            </div>

            <ul class="space-y-3" v-else>
              <li v-for="s in filtered" :key="s.id" class="p-3 bg-white border rounded-lg flex flex-wrap justify-between gap-3 items-start">
                <div>
                  <div class="font-medium">
                    ห้อง: <span class="text-gray-700">{{ s.room?.roomName || '-' }}</span>
                  </div>
                  <div class="text-xs text-gray-500">เวลา: {{ timeRange(s.startTime, s.endTime) }}</div>
                  <div class="text-xs text-rose-600 mt-1" v-if="s.unavailableUsers?.length">
                    ผู้จดที่ลางาน: {{ s.unavailableUsers.map(u => u.fullName).join(', ') }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <button @click="openAssign(s)" class="px-3 py-1.5 bg-blue-600 text-white rounded">เลือกคนแทน</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>

    <!-- assign modal -->
    <div v-if="showAssign" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="closeAssign">
      <div class="bg-white w-full max-w-lg rounded-2xl p-6">
        <h3 class="text-lg font-semibold mb-4">เลือกคนจดประชุมแทน</h3>

        <div v-if="candidateError" class="mb-3 text-red-600 text-sm">{{ candidateError }}</div>

        <div class="mb-4">
          <select v-model="selectedTaker" class="w-full p-2 border rounded-md">
            <option value="">-- เลือก --</option>
            <option v-for="t in takers" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
          <div v-if="takers.length===0" class="text-sm text-gray-500 mt-2">ยังไม่พบผู้จดที่ว่างในช่วงเวลานี้</div>
        </div>

        <div class="flex justify-end gap-2">
          <button class="px-3 py-2 rounded-lg border" @click="closeAssign">ยกเลิก</button>
          <button class="px-4 py-2 rounded-lg bg-blue-600 text-white" @click="assign" :disabled="assigning || !selectedTaker">
            {{ assigning ? 'กำลังส่ง...' : 'ยืนยัน' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const router = useRouter()

// ===== state =====
const q = ref('')
const loading = ref(true)
const fetchError = ref('')

const requests = ref([])   // งานที่ต้องหา “ผู้จดแทน”
const me = ref({ name: '', email: '', avatarUrl: '' })

// แสดง date picker ไว้เฉย ๆ (ใช้ตอน fallback)
const selectedDate = ref(new Date().toISOString().slice(0,10))

// modal เลือกผู้แทน
const showAssign = ref(false)
const currentReq = ref(null)
const candidates = ref([])
const candidateError = ref('')
const selectedTaker = ref('')
const assigning = ref(false)

// ===== computed / helpers =====
const filtered = computed(() => {
  const kw = q.value.trim().toLowerCase()
  let arr = Array.isArray(requests.value) ? requests.value : []
  if (!kw) return arr
  return arr.filter(s =>
    (s.room?.roomName || '').toLowerCase().includes(kw) ||
    (s.unavailableUsers || []).some(u => (u.fullName || '').toLowerCase().includes(kw))
  )
})

const takers = computed(() => {
  // เรียงตามคิว orderNo ถ้ามี
  const arr = (candidates.value || []).slice().sort((a,b) => (a.orderNo||9999) - (b.orderNo||9999))
  return arr.map(c => ({
    id: c.userId,
    name: c.user?.fullName || `User #${c.userId}`,
  }))
})

function timeRange(s,e){
  if(!s||!e) return '-'
  const o={hour:'2-digit',minute:'2-digit'}
  const d1 = new Date(s); const d2 = new Date(e)
  const sameDay = d1.toDateString() === d2.toDateString()
  const dateStr = d1.toLocaleDateString()
  const rangeStr = `${d1.toLocaleTimeString([],o)} - ${d2.toLocaleTimeString([],o)}`
  return sameDay ? `${dateStr} ${rangeStr}` : `${d1.toLocaleString([],o)} ➜ ${d2.toLocaleString([],o)}`
}
function toISO(x){
  const d = new Date(x)
  return isNaN(d.getTime()) ? '' : d.toISOString()
}

/* ============ FIX: fetchMe() รองรับหลาย endpoint ============ */
async function fetchMe() {
  const tryPaths = ['/api/auth/me', '/api/users/me', '/api/me']
  for (const p of tryPaths) {
    try {
      const { data } = await api.get(p)
      if (data) { me.value = data; return }
    } catch (e) {
      // เงียบไว้ถ้า 404 / 401 แล้วลอง path ถัดไป
    }
  }
}
/* ============================================================= */

// ===== API =====
const WINDOW_DAYS = 30

function aroundTodayRangeISO(days = WINDOW_DAYS) {
  const now = new Date()
  const half = Math.floor(days/2)
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - half)
  const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + half + 1)
  return { start: start.toISOString(), end: end.toISOString() }
}
function dayRangeISO(dStr) {
  const d = new Date(dStr)
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1)
  return { start: start.toISOString(), end: end.toISOString() }
}
function synthesizePendingFromBookings(bookings) {
  const DECLINE = new Set(['REJECTED', 'DECLINED'])
  const LEAVE_LIKE = new Set(['EMERGENCY', 'URGENT', 'SICK'])
  const OK_SUB = new Set(['ACCEPTED', 'APPROVED'])
  const pendings = []
  for (const b of bookings || []) {
    const room = b.room || b.meetingRoom || {}
    const invites = Array.isArray(b.invites) ? b.invites : []
    const takers  = Array.isArray(b.noteTakers) ? b.noteTakers : []
    const unavailable = invites.filter(iv => {
      const status = String(iv.status || '').toUpperCase()
      const leaveType = String(iv.leaveType || '').toUpperCase()
      return DECLINE.has(status) || LEAVE_LIKE.has(leaveType)
    })
    if (unavailable.length === 0) continue
    const hasAcceptedSub = takers.some(t => OK_SUB.has(String(t.status || '').toUpperCase()))
    if (hasAcceptedSub) continue
    pendings.push({
      id: b.id,
      room: { roomName: room.roomName || room.name || '-' },
      startTime: b.startTime,
      endTime: b.endTime,
      unavailableUsers: unavailable.map(u => ({
        id: u.userId || u.id,
        fullName: u.fullName || u.name || `User#${u.userId || u.id}`,
      })),
    })
  }
  return pendings
}

async function loadAll() {
  loading.value = true
  fetchError.value = ''
  try {
    // ถ้ามี endpoint leaves/pending ใช้ก่อน
    const r = await api.get('/api/notetakers/leaves/pending', { params: { all: 1, days: WINDOW_DAYS } })
    let items = Array.isArray(r.data?.items) ? r.data.items : []
    if (items.length === 0) {
      // FIX: /api/bookings ให้ใช้ from/to แทน start/end
      const { start, end } = aroundTodayRangeISO(WINDOW_DAYS)
      const r2 = await api.get('/api/bookings', { params: { from: start, to: end, page: 1, pageSize: 500 } })
      const bookings = Array.isArray(r2.data?.items) ? r2.data.items : []
      items = synthesizePendingFromBookings(bookings)
    }
    requests.value = items
    await fetchMe()
  } catch (e) {
    await loadCompat()
  } finally {
    loading.value = false
  }
}

async function loadCompat() {
  loading.value = true
  fetchError.value = ''
  try {
    const params = { date: selectedDate.value }
    const r = await api.get('/api/notetakers/leaves/pending', { params })
    let items = Array.isArray(r.data?.items) ? r.data.items : []
    if (items.length === 0) {
      // FIX: /api/bookings ให้ใช้ from/to แทน start/end
      const { start, end } = dayRangeISO(selectedDate.value)
      const r2 = await api.get('/api/bookings', { params: { from: start, to: end, page: 1, pageSize: 500 } })
      const bookings = Array.isArray(r2.data?.items) ? r2.data.items : []
      items = synthesizePendingFromBookings(bookings)
    }
    requests.value = items
    await fetchMe()
  } catch (e) {
    fetchError.value = e?.response?.data?.error || e.message || 'load failed'
    requests.value = []
  } finally {
    loading.value = false
  }
}

async function loadCandidates(startIso, endIso, excludeIds = []) {
  candidateError.value = ''
  candidates.value = []
  try {
    // FIX: ส่ง mode='note' ชัดเจน + excludeIds
    const params = { start: startIso, end: endIso, mode: 'note' }
    if (excludeIds?.length) params.excludeIds = excludeIds.join(',')
    const res = await api.get('/api/notetakers/candidates', { params })
    // รองรับทั้ง {items:[]} และ [] ตรงๆ
    let items = res.data?.items ?? res.data ?? []
    if (!Array.isArray(items)) items = []
    // กันกรณีคืนว่างเพราะ BAD_TIME_RANGE
    if (items.length === 0 && (!startIso || !endIso)) {
      throw new Error('BAD_TIME_RANGE')
    }
    candidates.value = items
  } catch (e) {
    const err = e?.response?.data?.error || e?.message || 'โหลดผู้แทนไม่ได้'
    candidateError.value = err
  }
}

function openAssign(req) {
  currentReq.value = req
  selectedTaker.value = ''
  showAssign.value = true
  const startIso = toISO(req.startTime)
  const endIso   = toISO(req.endTime)
  const exclude  = (req.unavailableUsers || []).map(u => Number(u.id)).filter(Boolean)
  loadCandidates(startIso, endIso, exclude)
}

function closeAssign() {
  showAssign.value = false
  currentReq.value = null
  candidates.value = []
  selectedTaker.value = ''
}

async function assign() {
  if (!currentReq.value || !selectedTaker.value) return
  assigning.value = true
  try {
    const forUserId = Number(currentReq.value.unavailableUsers?.[0]?.id)
    await api.post('/api/notetakers/substitute', {
      bookingId: Number(currentReq.value.id),
      forUserId,
      substituteUserId: Number(selectedTaker.value),
    })
    Swal.fire({ icon: 'success', title: 'เปลี่ยนผู้จดแล้ว' })
    await loadAll()
    closeAssign()
  } catch (e) {
    fetchError.value = e?.response?.data?.error || e.message || 'assign failed'
    Swal.fire({ icon: 'error', title: 'ไม่สำเร็จ' })
  } finally {
    assigning.value = false
  }
}

async function logout() {
  try { await api.post('/api/logout') } catch (_) {}
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_role')
  router.push('/login')
}

onMounted(() => { loadAll() })
</script>

<style scoped>
.nav-link { @apply block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100; }
.nav-active { @apply bg-blue-50 text-blue-600; }
.modern-card { @apply bg-white rounded-2xl border border-gray-200 p-6; }
</style>
