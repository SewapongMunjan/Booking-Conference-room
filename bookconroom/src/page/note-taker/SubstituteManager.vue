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
          <div class="relative hidden sm:block">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">⌕</span>
            <input v-model="q" placeholder="ค้นหา ห้อง / ผู้จอง / ผู้จด..." class="w-64 pl-10 pr-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <button class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700" @click="load">รีเฟรช</button>

          <button @click="logout" class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">
            <svg class="w-5 h-5 text-red-600 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/></svg>
            <span class="hidden md:inline text-red-600">ออกจากระบบ</span>
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3 ml-auto">
        </div>
    </header>

    <!-- Main content -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full min-h-[calc(100vh-5rem)] px-8 py-6">
        <div class="max-w-7xl mx-auto space-y-6">
          <div v-if="fetchError" class="text-red-600 p-4 rounded-lg bg-red-50 border border-red-100">Error: {{ fetchError }}</div>

          <div class="modern-card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">จัดการการลา/แทน</h2>
              <button @click="openNew" class="px-3 py-2 bg-sky-600 text-white rounded">ขอแทน</button>
            </div>

            <div v-if="items.length === 0" class="text-gray-500">ไม่มีรายการ</div>
            <ul class="space-y-3">
              <li v-for="s in items" :key="s.id" class="p-3 bg-white border rounded-lg flex justify-between">
                <div>
                  <div class="font-medium">{{ s.title }}</div>
                  <div class="text-xs text-gray-500">{{ s.period }}</div>
                </div>
                <div class="flex gap-2">
                  <button @click="approve(s)" class="px-3 py-1 bg-green-600 text-white rounded">อนุมัติ</button>
                  <button @click="deny(s)" class="px-3 py-1 border rounded">ปฏิเสธ</button>
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
        <div class="mb-4">
          <select v-model="selectedTaker" class="w-full p-2 border rounded-md">
            <option value="">-- เลือก --</option>
            <option v-for="t in takers" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
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
const q = ref('')                       // <-- template ใช้อยู่
const loading = ref(true)
const fetchError = ref('')

const requests = ref([])                // งานที่ต้องหาแทน (จาก /leaves/pending)
const items = computed(() => requests.value || [])   // <-- ให้ template ที่อ้าง items ใช้ได้

const me = ref({ name: '', email: '', avatarUrl: '' })

// modal เลือกผู้แทน
const showAssign = ref(false)
const currentReq = ref(null)
const candidates = ref([])              // ผู้แทนที่ว่างในช่วงเวลา
const candidateError = ref('')
const selectedTaker = ref('')
const assigning = ref(false)

// ===== helpers =====
function formatRange(f, t) {
  if (!f || !t) return '-'
  const a = new Date(f), b = new Date(t)
  return `${a.getDate()}/${a.getMonth()+1}/${a.getFullYear()+543} - ${b.getDate()}/${b.getMonth()+1}/${b.getFullYear()+543}`
}
function toISO(d) { return new Date(d).toISOString() }

// ===== API =====
async function load(dateStr = null) {
  loading.value = true
  fetchError.value = ''
  try {
    // backend: /api/notetakers/leaves/pending
    const params = dateStr ? { date: dateStr } : {}
    const { data } = await api.get('/api/notetakers/leaves/pending', { params })
    requests.value = Array.isArray(data?.items) ? data.items : []
    try { const u = await api.get('/api/me'); me.value = u.data || me.value } catch (_) {}
  } catch (e) {
    console.error('load pending', e)
    fetchError.value = e?.response?.data?.error || e.message || 'load failed'
  } finally {
    loading.value = false
  }
}

async function loadCandidates(startIso, endIso, excludeIds = []) {
  candidateError.value = ''
  candidates.value = []
  try {
    const params = { start: startIso, end: endIso }
    if (excludeIds?.length) params.excludeIds = excludeIds.join(',')
    const res = await api.get('/api/notetakers/candidates', { params })
    candidates.value = res.data?.items ?? res.data ?? []
  } catch (e) {
    console.error('loadCandidates', e)
    candidateError.value = e?.response?.data?.error || e?.message || 'โหลดผู้แทนไม่ได้'
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
    await load()
    closeAssign()
  } catch (e) {
    console.error('assign failed', e)
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

onMounted(() => {
  load() // วันนี้
})
</script>



<style scoped>
.nav-link { @apply block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100; }
.nav-active { @apply bg-blue-50 text-blue-600; }

.modern-card { @apply bg-white rounded-2xl border border-gray-200 p-6; }
</style>