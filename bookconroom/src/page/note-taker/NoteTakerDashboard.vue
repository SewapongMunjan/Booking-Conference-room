<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Left sidebar -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
      <div class="h-full flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl shadow-md">📝</div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">ระบบจดประชุม</h3>
              <p class="text-[10px] text-gray-500">NoteTaker Console</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link to="/note-taker/dashboard" class="nav-link nav-active">🏠 หน้าหลัก</router-link>
          <router-link to="/note-taker/my-queue" class="nav-link">📋 คิวของฉัน</router-link>
          <router-link to="/note-taker/leave-request" class="nav-link">🗓️ ลาล่วงหน้า</router-link>
          <router-link to="/note-taker/substitute" class="nav-link">🔁 จัดการแทนที่</router-link>
        </nav>

        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <img :src="me?.avatarUrl || defaultAvatar" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'ผู้ใช้' }}</div>
              <div class="text-[10px] text-gray-500 truncate">{{ me?.email || '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Header -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white border-b border-gray-200">
      <div class="w-full px-8 py-4 flex items-center max-w-7xl mx-auto gap-4">
        <h1 class="text-lg font-semibold m-0">แดชบอร์ด NoteTaker</h1>

        <div class="ml-auto flex items-center gap-3">
          <label class="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" v-model="todayOnly" />
            แสดงเฉพาะวันนี้
          </label>

          <div class="relative hidden sm:block">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">⌕</span>
            <input
              v-model="q"
              placeholder="ค้นหา ห้อง / ผู้จอง / ผู้จด..."
              class="w-64 pl-10 pr-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700" @click="load">รีเฟรช</button>

          <button @click="logout" class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">
            <svg class="w-5 h-5 text-red-600 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/></svg>
            <span class="hidden md:inline text-red-600">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full min-h-[calc(100vh-5rem)] px-8 py-6">
        <div class="max-w-7xl mx-auto space-y-6">
          <div class="flex items-center gap-4 mb-2">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg">📝</div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900 m-0">แดชบอร์ด NoteTaker</h2>
              <p class="text-base text-gray-500 m-0 mt-1">ภาพรวมคิวงานและคำขอ <span v-if="todayOnly">— วันนี้ {{ todayTH }}</span></p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="modern-card">
              <div class="text-xs text-gray-500">คำขอวันนี้</div>
              <div class="text-2xl font-bold mt-2">{{ requestsCount }}</div>
            </div>
            <div class="modern-card">
              <div class="text-xs text-gray-500">งานค้าง</div>
              <div class="text-2xl font-bold mt-2 text-amber-600">{{ pendingCount }}</div>
            </div>
            <div class="modern-card">
              <div class="text-xs text-gray-500">งานเสร็จ</div>
              <div class="text-2xl font-bold mt-2 text-green-600">{{ doneCount }}</div>
            </div>
          </div>

          <div v-if="fetchError" class="text-red-600 p-4 rounded-lg bg-red-50 border border-red-100">Error: {{ fetchError }}</div>

          <div v-if="loading" class="flex justify-center py-12 text-gray-500">กำลังโหลดรายการ...</div>

          <section v-else>
            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="m in filtered"
                :key="m.id"
                class="bg-white border rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition"
              >
                <div class="flex items-start justify-between">
                  <div class="font-semibold text-lg">{{ m.room?.roomName || m.title || 'ห้องประชุม' }}</div>
                  <span class="px-2 py-0.5 text-xs rounded-full" :class="badge(m.status)">
                    {{ statusTH(m.status) }}
                  </span>
                </div>

                <div class="text-sm text-gray-600 mt-2">
                  {{ dateTH(m.start) }} · {{ timeRange(m.start, m.end) }}
                </div>

                <div class="text-sm text-gray-600 mt-1">
                  ผู้จอง: {{ m.requester?.name || '-' }} <span v-if="m.requester?.dept">· {{ m.requester.dept }}</span>
                </div>

                <div class="text-sm text-gray-600 mt-1">
                  คนจดประชุม:
                  <span v-if="m.noteTakers?.length">{{ m.noteTakers.map(n => n.name).join(', ') }}</span><span v-else>-</span>
                </div>

                <div class="mt-4 flex gap-2">
                  <button class="flex-1 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50" @click="view(m)">ดูรายละเอียด</button>

                  <!-- เริ่มจด → IN_PROGRESS -->
                  <button
                    v-if="canStart(m.status)"
                    class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    @click="markInProgress(m)"
                  >เริ่มจดประชุม</button>

                  <!-- จบงาน → DONE -->
                  <button
                    v-if="canFinish(m.status)"
                    class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                    @click="markDone(m)"
                  >จบงาน</button>
                </div>
              </article>

              <div v-if="!filtered.length" class="text-gray-500 sm:col-span-2 xl:col-span-3 text-sm">ไม่มีรายการ</div>
            </div>
          </section>
        </div>
      </main>
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

/* ===== เวลาไทย (UTC+7) ===== */
function startOfDayTH(d = new Date()) { const x = new Date(d); x.setHours(0,0,0,0); return x }
function endOfDayTH(d = new Date())   { const x = new Date(d); x.setHours(23,59,59,999); return x }
const todayTH = computed(() => {
  const d = new Date()
  const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`
})

/* ===== logout ===== */
async function logout() {
  try { await api.post('/api/logout') } catch {}
  localStorage.removeItem('access_token')
  localStorage.removeItem('me')
  router.push('/login')
}

/* ===== state ===== */
const q = ref('')
const todayOnly = ref(true)

const requestsCount = ref(0)
const pendingCount  = ref(0)
const doneCount     = ref(0)

const loading = ref(true)
const items = ref([])
const fetchError = ref('')

const me = ref({ name: '', email: '', avatarUrl: '' })
const defaultAvatar = 'https://cdn-icons-png.flaticon.com/128/456/456283.png'

/* ===== mapping & formatting ===== */
function mapItem(it) {
  const start = it.startAt ?? it.startTime ?? it.start ?? it.from
  const end   = it.endAt   ?? it.endTime   ?? it.end   ?? it.to
  const roomName  = it.room?.roomName || it.room?.name || it.roomName || it.title
  const requester = it.requester || it.user || it.owner || it.requestBy || {}
  const noteTakers = Array.isArray(it.noteTakers || it.notetakers || it.assignees) ? (it.noteTakers || it.notetakers || it.assignees) : []
  const needNoteTaker = (it.needNoteTaker ?? it.requireNoteTaker ?? it.requiresNoteTaker)
  return {
    id: it.id,
    title: it.title || roomName,
    start, end,
    status: String(it.status || '').toUpperCase() || 'PENDING',
    room: it.room || { roomName },
    requester,
    noteTakers,
    needNoteTaker: needNoteTaker !== false,
    reportSent: !!it.reportSent
  }
}

function statusTH(s){
  const x = String(s||'').toUpperCase()
  if (x==='IN_PROGRESS') return 'กำลังจด'
  if (x==='DONE')        return 'เสร็จงาน'
  return 'รอเริ่ม'
}
function badge(s){
  const x = String(s||'').toUpperCase()
  if (x==='IN_PROGRESS') return 'bg-green-100 text-green-700'
  if (x==='DONE')        return 'bg-blue-100 text-blue-700'
  return 'bg-amber-100 text-amber-800'
}
function dateTH(iso){ if(!iso) return '-'; const d=new Date(iso); const m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}` }
function timeRange(s,e){ if(!s||!e) return '-'; const o={hour:'2-digit',minute:'2-digit'}; return `${new Date(s).toLocaleTimeString('th-TH',o)} - ${new Date(e).toLocaleTimeString('th-TH',o)}` }

function canStart(status){ const x=String(status||'').toUpperCase(); return x!=='IN_PROGRESS' && x!=='DONE' }
function canFinish(status){ return String(status||'').toUpperCase()==='IN_PROGRESS' }

function view(m){ router.push(`/booking-info/${m.id}`) }

/* ===== computed: filters ===== */
const filtered = computed(() => {
  const kw = q.value.trim().toLowerCase()
  const todayStart = startOfDayTH()
  const todayEnd   = endOfDayTH()
  let list = items.value

  if (todayOnly.value) {
    list = list.filter(m => {
      const s = new Date(m.start)
      return s >= todayStart && s <= todayEnd
    })
  }

  if (!kw) return list
  return list.filter(m =>
    (m.room?.roomName||'').toLowerCase().includes(kw) ||
    (m.requester?.name||'').toLowerCase().includes(kw) ||
    (m.noteTakers||[]).some(n => (n.name||'').toLowerCase().includes(kw))
  )
})

/* ===== summary counters ===== */
function recount() {
  const todayStart = startOfDayTH()
  const todayEnd   = endOfDayTH()
  const todayList  = items.value.filter(m => {
    const s = new Date(m.start)
    return s >= todayStart && s <= todayEnd
  })

  // คำขอ: ต้องการคนจด และยังไม่มีผู้จด
  requestsCount.value = todayList.filter(i =>
    i.needNoteTaker !== false && (i.noteTakers?.length ?? 0) === 0
  ).length

  const isDone = (m) => String(m.status).toUpperCase()==='DONE'
  const isInProgress = (m) => String(m.status).toUpperCase()==='IN_PROGRESS'
  const isPending = (m) => !isDone(m) && !isInProgress(m)

  pendingCount.value = todayList.filter(isPending).length
  doneCount.value    = todayList.filter(isDone).length
}

/* ===== API helpers: change status with fallbacks ===== */
async function callWithFallback(fns) {
  for (const fn of fns) {
    try { const r = await fn(); if (r?.status>=200 && r?.status<300) return true } catch {}
  }
  return false
}

async function markInProgress(m) {
  const id = m.id
  const ok = await Swal.fire({
    title: 'เริ่มจดประชุม?',
    icon: 'question',
    confirmButtonText: 'เริ่ม',
    cancelButtonText: 'ยกเลิก',
    showCancelButton: true,
    confirmButtonColor: '#2563eb'
  })
  if (!ok.isConfirmed) return

  const success = await callWithFallback([
    () => api.patch(`/api/bookings/${id}/status`, { status: 'IN_PROGRESS' }),
    () => api.post(`/api/bookings/${id}/start`),
    () => api.post('/api/notetakers/start', { bookingId: id }),
    () => api.post('/api/bookings/update-status', { id, status: 'IN_PROGRESS' }),
  ])
  if (!success) {
    return Swal.fire({ icon:'error', title:'เริ่มไม่สำเร็จ', text:'ไม่พบ endpoint ที่ใช้งานได้' })
  }

  // update local
  const idx = items.value.findIndex(x => x.id === id)
  if (idx >= 0) items.value[idx] = { ...items.value[idx], status: 'IN_PROGRESS' }
  recount()
  Swal.fire({ icon:'success', title:'เริ่มจดแล้ว', timer:1200, showConfirmButton:false })
}

async function markDone(m) {
  const id = m.id
  const ok = await Swal.fire({
    title: 'จบงาน?',
    icon: 'question',
    confirmButtonText: 'จบงาน',
    cancelButtonText: 'ยกเลิก',
    showCancelButton: true,
    confirmButtonColor: '#059669'
  })
  if (!ok.isConfirmed) return

  const success = await callWithFallback([
    () => api.patch(`/api/bookings/${id}/status`, { status: 'DONE' }),
    () => api.post(`/api/bookings/${id}/done`),
    () => api.post('/api/notetakers/complete', { bookingId: id }),
    () => api.post('/api/bookings/update-status', { id, status: 'DONE' }),
  ])
  if (!success) {
    return Swal.fire({ icon:'error', title:'บันทึกไม่สำเร็จ', text:'ไม่พบ endpoint ที่ใช้งานได้' })
  }

  const idx = items.value.findIndex(x => x.id === id)
  if (idx >= 0) items.value[idx] = { ...items.value[idx], status: 'DONE', reportSent: true }
  recount()
  Swal.fire({ icon:'success', title:'จบงานแล้ว', timer:1200, showConfirmButton:false })
}

/* ===== loader ===== */
async function load() {
  loading.value = true
  fetchError.value = ''
  try {
    const from = startOfDayTH().toISOString().slice(0,10)
    const toD  = new Date(); toD.setDate(toD.getDate()+14)
    const to   = endOfDayTH(toD).toISOString().slice(0,10)

    const trials = [
      ['/api/bookings',              { params: { from, to, page:1, pageSize:400 } }],
      ['/api/bookings',              { params: { dateFrom: from, dateTo: to, page:1, pageSize:400 } }],
      ['/api/bookings/upcoming',     { params: { days: 14 } }],
      ['/api/notetakers/assignments',{ params: { days: 14 } }],
    ]

    let res = null
    for (const [url, opt] of trials) {
      try { const r = await api.get(url, opt); if (r?.status === 200) { res = r; break } } catch {}
    }
    const raw  = res?.data?.items ?? res?.data ?? []
    const list = (Array.isArray(raw) ? raw : []).map(mapItem).sort((a,b)=> new Date(a.start)-new Date(b.start))
    items.value = list

    recount()

    try {
      const u = await api.get('/api/me')
      me.value = u.data || me.value
    } catch (e) {
      console.error('load dashboard failed', e)
      fetchError.value = e?.response?.data?.error || e.message || 'fetch failed'
      items.value = []
      requestsCount.value = pendingCount.value = doneCount.value = 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.modern-card { @apply bg-white rounded-2xl border border-gray-200 p-6; }
.nav-link    { @apply block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100; }
.nav-active  { @apply bg-blue-50 text-blue-600; }
</style>
