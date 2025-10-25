<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Left Sidebar (reuse admin style) -->
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
          <button @click="load" class="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">รีเฟรช</button>
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
            <div class="modern-card">
              <h2 class="text-lg font-semibold mb-4">รายการห้อง</h2>
              <div v-if="loading" class="text-sm text-gray-500">กำลังโหลด...</div>
              <div v-else class="space-y-3">
                <div v-for="room in filteredRooms" :key="room.id" class="p-3 border border-gray-100 rounded-lg">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="font-semibold">{{ room.name }}</div>
                      <div class="text-xs text-gray-500">การประชุม: {{ room.meetings?.length ?? 0 }}</div>
                      <div v-if="room.tasks?.length" class="mt-2 text-xs text-gray-600">
                        งาน: <span class="font-medium">{{ room.tasks.length }}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-xs text-gray-400">{{ room.location || '' }}</div>
                      <button @click="openAssign(room)" class="mt-2 px-3 py-1 bg-emerald-600 text-white rounded text-sm">มอบหมาย</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

            <div class="modern-card">
              <h2 class="text-lg font-semibold mb-4">อุปกรณ์ที่ต้องเตรียม</h2>
              <div v-if="equipSummary.length === 0" class="text-sm text-gray-500">ไม่มีข้อมูล</div>
              <div v-else class="flex flex-wrap gap-2">
                <span v-for="e in equipSummary" :key="e" class="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs">{{ e }}</span>
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
import 'sweetalert2/dist/sweetalert2.min.css' // ADDED

const router = useRouter()
const route = useRoute()
const me = ref(null)
const loading = ref(false)
const error = ref('')
const q = ref('')
const rooms = ref([])
const timer = ref(null)

const roomsCount = computed(() => rooms.value.length)
const pendingJobs = computed(() => rooms.value.reduce((s, r) => s + (r.tasks?.filter(t => t.status !== 'done').length || 0), 0))
const doneJobs = computed(() => rooms.value.reduce((s, r) => s + (r.tasks?.filter(t => t.status === 'done').length || 0), 0))

const filteredRooms = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return rooms.value
  return rooms.value.filter(r =>
    String(r.name || '').toLowerCase().includes(term) ||
    (r.tasks || []).some(t => String(t.title || '').toLowerCase().includes(term))
  )
})

const urgentTasks = computed(() => {
  const list = []
  rooms.value.forEach(r => {
    (r.tasks || []).forEach(t => {
      if (t.priority === 'high' || t.isUrgent) list.push({...t, roomName: r.name})
    })
  })
  return list
})

const equipSummary = computed(() => {
  const set = new Set()
  rooms.value.forEach(r => {
    (r.equipments || []).forEach(e => set.add(e))
  })
  return Array.from(set)
})

async function fetchMe() {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = data
  } catch {
    me.value = null
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const date = new Date().toISOString().slice(0,10)
    const candidates = [
      ['/api/housekeeping/manage', {}],
      ['/api/housekeeping/dashboard', {}],
      ['/api/bookings', { params: { date, page:1, pageSize:500 } }]
    ]

    let res = null
    for (const [url, opt] of candidates) {
      try {
        res = await api.get(url, opt)
        if (res?.status === 200) break
      } catch (e) {
        // continue trying other endpoints
        console.warn('[HousekeepingDashboard] try', url, 'failed', e?.response?.status || e?.message)
        res = null
      }
    }

    if (!res) {
      error.value = 'ไม่สามารถโหลดข้อมูลได้จาก backend'
      rooms.value = []
      return
    }

    // normalize data
    if ((res.config?.url || '').includes('/housekeeping')) {
      const items = res.data?.items ?? res.data ?? []
      const map = new Map()
      for (const it of items) {
        const roomId = it.roomId ?? it.room?.id ?? ('room-' + (it.id || Math.random()))
        const roomName = it.roomName ?? it.room?.name ?? 'ไม่ระบุ'
        const r = map.get(roomId) || { id: roomId, name: roomName, meetings: [], tasks: [], equipments: [], location: it.room?.location }
        r.tasks.push({
          id: it.id,
          title: it.title ?? it.task ?? 'งาน',
          status: it.status ?? 'pending',
          priority: it.priority ?? it.isUrgent ? 'high' : 'normal',
          assignedToName: it.assignedTo?.fullName ?? it.assignedToName
        })
        map.set(roomId, r)
      }
      rooms.value = Array.from(map.values())
    } else {
      const items = res.data?.items ?? res.data ?? []
      const map = new Map()
      for (const b of items) {
        const roomId = b.roomId ?? b.room?.id ?? `room-${b.id}`
        const r = map.get(roomId) || { id: roomId, name: b.room?.name ?? 'ไม่ระบุ', meetings: [], tasks: [], equipments: [], location: b.room?.location }
        r.meetings.push({
          id: b.id,
          title: b.title ?? b.agenda,
          startAt: b.startAt ?? b.dateStart,
          endAt: b.endAt ?? b.dateEnd,
          organizerName: b.organizer?.fullName ?? b.organizer?.username
        })
        if (Array.isArray(b.equipments) && b.equipments.length) {
          r.equipments = Array.from(new Set([...(r.equipments || []), ...b.equipments.map(e => e.name ?? e)]))
        }
        map.set(roomId, r)
      }
      rooms.value = Array.from(map.values())
    }
    console.log('[HousekeepingDashboard] load OK', rooms.value.length)
  } catch (e) {
    console.error('[HousekeepingDashboard] load error', e)
    error.value = e?.response?.data?.error || e?.message || 'โหลดข้อมูลล้มเหลว'
    rooms.value = []
  } finally {
    loading.value = false
  }
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
    await api.post(`/api/housekeeping/update/${task.id}`, { status: 'done' })
    task.status = 'done'
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'อัปเดตเรียบร้อย', timer: 1500, showConfirmButton: false })
  } catch (e) {
    console.error('markDone', e)
    Swal.fire({ icon: 'error', title: 'ข้อผิดพลาด', text: e?.response?.data?.error || e?.message || 'อัปเดตสถานะไม่สำเร็จ' })
  }
}

function openAssign(room){
  // ใช้ modal แจ้งหรือไปหน้า assign
  router.push({ path: '/housekeeping/assign', query: { roomId: room.id } })
}

function logout(){
  localStorage.removeItem('access_token')
  localStorage.removeItem('me')
  router.push('/login')
}

const sidebarItems = [
  { to: '/housekeeping/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/housekeeping/tasks', label: 'งานทั้งหมด', icon: '🧾' },
  { to: '/housekeeping/assign', label: 'มอบหมาย', icon: '👥' },
]

function isActive(item) {
  try {
    return route.path === item.to || route.path.startsWith(item.to)
  } catch {
    return false
  }
}

onMounted(async () => {
  await fetchMe()
  await load()
  timer.value = setInterval(load, 60_000)
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
/* ensure nav styles match admin */
.nav-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900;
}
.nav-active {
  @apply bg-emerald-50 text-emerald-600;
}
.modern-card {
  @apply bg-white rounded-2xl border border-gray-200 p-6;
}
</style>