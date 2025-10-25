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
          <!-- optional user summary -->
        </div>
      </div>
    </aside>

    <!-- Header -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 bg-white border-b z-30">
      <div class="flex items-center justify-between px-6 py-3">
        <div class="text-lg font-semibold">งานทั้งหมด</div>
        <div class="flex items-center gap-2">
          <input v-model="q" placeholder="ค้นหางาน / ห้อง / ผู้รับผิดชอบ" class="px-3 py-2 border rounded-lg" />
          <button @click="load" class="px-3 py-2 bg-emerald-600 text-white rounded">รีเฟรช</button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="lg:ml-64 pt-20 px-6">
      <div class="max-w-5xl mx-auto py-6">
        <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700 rounded">{{ error }}</div>
        <div v-if="loading" class="text-gray-500 mb-4">กำลังโหลด...</div>

        <div v-if="notFound" class="p-4 mb-4 bg-yellow-50 text-yellow-700 rounded">Not Found (ไม่มี endpoint สำหรับงานใน backend)</div>

        <div v-if="tasks.length === 0 && !loading" class="text-gray-500">ไม่พบงาน</div>

        <div class="space-y-3">
          <div v-for="t in filteredTasks" :key="t.id" class="bg-white border rounded-lg p-4 flex justify-between">
            <div>
              <div class="font-medium">{{ t.title || 'งาน' }}</div>
              <div class="text-xs text-gray-500">ห้อง: {{ t.roomName || t.room?.name || '-' }}</div>
              <div class="text-xs text-gray-500">ผู้รับผิดชอบ: {{ t.assignedToName || 'ยังไม่กำหนด' }}</div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <div class="text-xs text-gray-400">{{ t.priority === 'high' ? 'ด่วน' : '' }}</div>
              <div class="flex gap-2">
                <button v-if="t.status !== 'done'" @click="markDone(t)" class="px-3 py-1 bg-green-600 text-white rounded">ทำเสร็จ</button>
                <button @click="toAssign(t)" class="px-3 py-1 border rounded">มอบหมาย</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css' // ADDED

const router = useRouter()
const tasks = ref([])
const loading = ref(false)
const error = ref('')
const q = ref('')
const notFound = ref(false)

const sidebarItems = [
  { to: '/housekeeping/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/housekeeping/tasks', label: 'งานทั้งหมด', icon: '🧾' },
  { to: '/housekeeping/assign', label: 'มอบหมาย', icon: '👥' },
]

function isActive(item) {
  try { return route.path === item.to || route.path.startsWith(item.to) } catch { return false }
}

const filteredTasks = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return tasks.value
  return tasks.value.filter(t =>
    String(t.title || '').toLowerCase().includes(term) ||
    String(t.roomName || t.room?.name || '').toLowerCase().includes(term) ||
    String(t.assignedToName || '').toLowerCase().includes(term)
  )
})

async function load() {
  loading.value = true
  error.value = ''
  notFound.value = false
  try {
    const candidates = [
      ['/api/housekeeping/tasks', {}],
      ['/api/housekeeping/manage', {}],
      ['/api/housekeeping', {}],
      ['/api/bookings', { params: { page: 1, pageSize: 500 } }]
    ]
    let res = null
    for (const [url, opt] of candidates) {
      try {
        res = await api.get(url, opt)
        if (res?.status === 200) break
      } catch (e) {
        res = null
      }
    }
    if (!res) {
      notFound.value = true
      tasks.value = []
      return
    }
    // normalize possible shapes
    const items = res.data?.items ?? res.data ?? []
    // if items are bookings -> transform to tasks-lite (no assigned)
    if (Array.isArray(items) && items.length && items[0].title && items[0].startAt) {
      tasks.value = items.map(b => ({
        id: b.id,
        title: b.title || b.agenda,
        roomName: b.room?.name || b.roomName,
        status: 'pending'
      }))
    } else {
      tasks.value = items
    }
  } catch (e) {
    console.error('load tasks', e)
    error.value = e?.response?.data?.error || e?.message || 'โหลดงานล้มเหลว'
    tasks.value = []
  } finally {
    loading.value = false
  }
}

async function markDone(task) {
  if (!task?.id) return
  const confirm = await Swal.fire({
    title: 'ยืนยัน',
    text: 'ทำงานนี้ให้เสร็จหรือไม่?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'ใช่'
  })
  if (!confirm.isConfirmed) return

  try {
    await api.post(`/api/housekeeping/update/${task.id}`, { status: 'done' })
    task.status = 'done'
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'ทำเสร็จแล้ว', timer: 1500, showConfirmButton: false })
  } catch (e) {
    console.error('markDone', e)
    Swal.fire({ icon: 'error', title: 'ข้อผิดพลาด', text: e?.response?.data?.error || e?.message || 'อัปเดตสถานะไม่สำเร็จ' })
  }
}

function toAssign(task) {
  // ถ้าอยากให้เป็น modal สามารถเปลี่ยนเป็น Swal.fire กับ html form ได้
  router.push({ path: '/housekeeping/assign', query: { taskId: task.id, roomId: task.roomId || task.room?.id } })
}

onMounted(() => load())
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900;
}
.nav-active {
  @apply bg-emerald-50 text-emerald-600;
}
</style>