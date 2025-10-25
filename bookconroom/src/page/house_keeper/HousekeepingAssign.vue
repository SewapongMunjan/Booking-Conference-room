<template>
  <div class="min-h-screen bg-gray-50">
    <!-- REPLACE or add this aside block so nav style matches Dashboard -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
      <div class="h-full flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl shadow-md">🧹</div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">Housekeeping</h3>
              <p class="text-[10px] text-gray-500">มอบหมายงาน</p>
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
          <!-- optional user summary -->
        </div>
      </div>
    </aside>

    <!-- Header -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 bg-white border-b z-30">
      <div class="flex items-center justify-between px-6 py-3">
        <div class="text-lg font-semibold">มอบหมายงาน</div>
        <div>
          <button @click="back" class="px-3 py-2 border rounded">กลับ</button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="lg:ml-64 pt-20 px-6">
      <div class="max-w-3xl mx-auto py-6">
        <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700 rounded">{{ error }}</div>
        <div class="mb-4">
          <div class="text-sm text-gray-600">งาน</div>
          <div class="font-medium">{{ task?.title || '-' }}</div>
          <div class="text-xs text-gray-500">ห้อง: {{ task?.roomName || '-' }}</div>
        </div>

        <div class="mb-4">
          <input v-model="candidateQuery" @input="loadCandidates" placeholder="ค้นหาชื่อผู้รับ" class="px-3 py-2 border rounded w-full" />
        </div>

        <div v-if="loading" class="text-gray-500 mb-4">กำลังโหลด...</div>
        <div v-if="candidates.length === 0 && !loading" class="text-gray-500">ไม่พบผู้สมัคร</div>

        <ul class="space-y-2">
          <li v-for="c in candidates" :key="c.id" class="flex items-center justify-between p-3 bg-white border rounded">
            <div>
              <div class="font-medium">{{ c.fullName || c.name || c.username }}</div>
              <div class="text-xs text-gray-500">{{ c.email || c.phone || '' }}</div>
            </div>
            <div>
              <button @click="assign(c)" class="px-3 py-1 bg-emerald-600 text-white rounded">มอบหมาย</button>
            </div>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css' // ADDED

const route = useRoute()

const sidebarItems = [
  { to: '/housekeeping/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/housekeeping/tasks', label: 'งานทั้งหมด', icon: '🧾' },
  { to: '/housekeeping/assign', label: 'มอบหมาย', icon: '👥' },
]

function isActive(item) {
  try { return route.path === item.to || route.path.startsWith(item.to) } catch { return false }
}

const router = useRouter()
const taskId = route.query.taskId
const roomId = route.query.roomId

const task = ref(null)
const candidates = ref([])
const candidateQuery = ref('')
const loading = ref(false)
const error = ref('')

async function fetchTaskInfo() {
  try {
    if (!taskId) return
    const candidates = [
      [`/api/housekeeping/tasks/${taskId}`, {}],
      [`/api/housekeeping/${taskId}`, {}],
      [`/api/bookings/${taskId}`, {}]
    ]
    let res = null
    for (const [url,opt] of candidates) {
      try { res = await api.get(url, opt); if (res?.status === 200) break } catch(e){ res = null }
    }
    task.value = res?.data ?? null
  } catch {
    task.value = null
  }
}

async function loadCandidates() {
  loading.value = true
  error.value = ''
  try {
    const candidatesEndpoints = [
      ['/api/housekeeping/candidates', { params: { q: candidateQuery.value || undefined, roomId: roomId || undefined } }],
      ['/api/users', { params: { q: candidateQuery.value || undefined, role: 'HOUSEKEEPER' } }]
    ]
    let res = null
    for (const [url, opt] of candidatesEndpoints) {
      try {
        res = await api.get(url, opt)
        if (res?.status === 200) break
      } catch (e) { res = null }
    }
    candidates.value = res?.data?.items ?? res?.data ?? []
  } catch (e) {
    console.error('loadCandidates', e)
    error.value = e?.response?.data?.error || e?.message || 'โหลดผู้สมัครล้มเหลว'
    candidates.value = []
  } finally {
    loading.value = false
  }
}

async function assign(user) {
  if (!taskId || !user?.id) return
  const confirm = await Swal.fire({
    title: 'ยืนยันการมอบหมาย',
    text: `มอบหมายงานให้ ${user.fullName || user.name || user.username}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'มอบหมาย',
    cancelButtonText: 'ยกเลิก'
  })
  if (!confirm.isConfirmed) return

  try {
    await api.post('/api/housekeeping/assign', { taskId, userId: user.id })
    Swal.fire({ icon: 'success', title: 'มอบหมายเรียบร้อย', timer: 1400, showConfirmButton: false })
    router.back()
  } catch (e) {
    console.error('assign', e)
    Swal.fire({ icon: 'error', title: 'มอบหมายไม่สำเร็จ', text: e?.response?.data?.error || e?.message || 'เกิดข้อผิดพลาด' })
  }
}

function back(){ router.back() }

onMounted(async () => {
  await fetchTaskInfo()
  loadCandidates()
})
</script>

<style scoped>
/* reuse same nav classes if needed */
.nav-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900;
}
.nav-active {
  @apply bg-emerald-50 text-emerald-600;
}
</style>