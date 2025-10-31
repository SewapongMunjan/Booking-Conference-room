<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar (same as dashboard) -->
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

        <div class="p-3 border-t border-gray-200"></div>
      </div>
    </aside>

    <!-- Header -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 bg-white border-b z-30">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 py-3">
        <div class="text-lg font-semibold">งานทั้งหมด</div>
        <div class="flex items-center gap-2">
          <input v-model="q" placeholder="ค้นหางาน / ห้อง / ผู้รับผิดชอบ" class="px-3 py-2 border rounded-lg text-sm w-64" />
          <button @click="load" class="px-3 py-2 bg-emerald-600 text-white rounded">รีเฟรช</button>
        </div>
      </div>

      <!-- Tabs / ฟิลเตอร์สถานะ -->
      <div class="lg:ml-64"></div>
      <div class="px-6 pb-3">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="s in statusTabs"
            :key="s.value"
            @click="activeStatus = s.value"
            :class="['px-3 py-1.5 rounded-lg text-sm border', activeStatus === s.value ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50']"
          >
            {{ s.label }}
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="lg:ml-64 pt-28 px-6">
      <div class="max-w-6xl mx-auto py-6">
        <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700 rounded">{{ error }}</div>
        <div v-if="loading" class="text-gray-500 mb-4">กำลังโหลด...</div>
        <div v-if="notFound" class="p-4 mb-4 bg-yellow-50 text-yellow-700 rounded">ไม่พบ endpoint งานแม่บ้านใน backend</div>

        <div v-if="filteredTasks.length === 0 && !loading" class="text-gray-500">ไม่พบงาน</div>

        <div class="space-y-3">
          <div
            v-for="t in filteredTasks"
            :key="t.id"
            class="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {{ t.serviceName || 'งาน' }}
                </span>
                <span v-if="t.priority === 'high' || t.isUrgent" class="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                  ด่วน
                </span>
                <span
                  class="inline-flex items-center px-2 py-0.5 text-xs rounded-full border"
                  :class="statusPillClass(t.status)"
                >
                  {{ statusText(t.status) }}
                </span>
              </div>

              <div class="mt-1 font-medium truncate">
                {{ t.title || t.task || 'งานบริการ' }} — ห้อง {{ t.roomName || t.room?.roomName || t.room?.name || '-' }}
              </div>

              <div class="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                <span v-if="t.startTime || t.endTime">
                  เวลา: {{ fmtRange(t.startTime, t.endTime) }}
                </span>
                <span>ผู้ยืนยันแล้ว: {{ t.confirmed ?? 0 }} / เชิญทั้งหมด: {{ t.invitedTotal ?? 0 }}</span>
                <span>ผู้รับผิดชอบ: {{ t.assignedToName || 'ยังไม่กำหนด' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button v-if="t.status !== 'COMPLETED' && t.status !== 'done'" @click="markDone(t)" class="px-3 py-1.5 bg-green-600 text-white rounded text-sm">
                ทำเสร็จ
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const router = useRouter()
const route = useRoute()

const tasks = ref([])
const loading = ref(false)
const error = ref('')
const q = ref('')
const notFound = ref(false)

const activeStatus = ref('ALL')
const statusTabs = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'PENDING', label: 'รอดำเนินการ' },
  { value: 'IN_PROGRESS', label: 'กำลังทำ' },
  { value: 'CONFIRMED', label: 'ยืนยันแล้ว' },
  { value: 'COMPLETED', label: 'เสร็จสิ้น' },
  { value: 'REJECTED', label: 'ถูกยกเลิก' },
]

const sidebarItems = [
  { to: '/housekeeping/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/housekeeping/tasks',     label: 'งานบริการเสริม', icon: '🧾' },
  { to: '/housekeeping/complete',  label: 'งานทำความสะอาด', icon: '🧹' },
]

function isActive(item) {
  try { return route.path === item.to || route.path.startsWith(item.to) } catch { return false }
}

const filteredTasks = computed(() => {
  let list = tasks.value
  if (activeStatus.value !== 'ALL') {
    list = list.filter(t => (t.status || '').toUpperCase() === activeStatus.value)
  }
  const term = q.value.trim().toLowerCase()
  if (!term) return list
  return list.filter(t =>
    String(t.title || t.task || '').toLowerCase().includes(term) ||
    String(t.roomName || t.room?.roomName || t.room?.name || '').toLowerCase().includes(term) ||
    String(t.assignedToName || '').toLowerCase().includes(term) ||
    String(t.serviceName || '').toLowerCase().includes(term)
  )
})

function statusText(s) {
  const m = {
    PENDING: 'รอดำเนินการ',
    IN_PROGRESS: 'กำลังทำ',
    CONFIRMED: 'ยืนยันแล้ว',
    COMPLETED: 'เสร็จสิ้น',
    REJECTED: 'ถูกยกเลิก',
    done: 'เสร็จสิ้น',
  }
  return m[s] || s || 'รอดดำเนินการ'
}
function statusPillClass(s) {
  switch (s) {
    case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-100'
    case 'CONFIRMED':   return 'bg-sky-50 text-sky-700 border-sky-100'
    case 'COMPLETED':
    case 'done':        return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    case 'REJECTED':    return 'bg-rose-50 text-rose-700 border-rose-100'
    default:            return 'bg-gray-50 text-gray-700 border-gray-100'
  }
}
function fmtRange(a, b) {
  if (!a || !b) return ''
  const s = new Date(a), e = new Date(b)
  return `${s.toLocaleString()} - ${e.toLocaleString()}`
}

async function enrichFromBookingDetail(list) {
  const ids = Array.from(new Set(list.map(x => x.bookingId).filter(Boolean)))
  const chunks = []
  const tmp = ids.slice()
  while (tmp.length) chunks.push(tmp.splice(0, 8))

  const detailMap = new Map()
  for (const ch of chunks) {
    await Promise.all(ch.map(async (id) => {
      try {
        const { data } = await api.get(`/api/bookings/${id}`)
        const bk = data?.booking
        if (!bk) return detailMap.set(id, null)

        const acceptedInvites = (bk.invites || []).filter(v => v.status === 'ACCEPTED').length
        const acceptedNoteTakers = (bk.noteTakers || []).filter(v => v.status === 'ACCEPTED').length
        const organizer = bk.bookedBy ? 1 : 0

        detailMap.set(id, {
          startTime: bk.startTime,
          endTime: bk.endTime,
          roomName: bk.room?.roomName || bk.room?.name,
          confirmed: acceptedInvites + acceptedNoteTakers + organizer,
          invitedTotal: (bk.invites || []).length + acceptedNoteTakers + organizer,
          services: (bk.services || []).map(x => x.service?.name).filter(Boolean),
        })
      } catch {
        detailMap.set(id, null)
      }
    }))
  }

  list.forEach(t => {
    const d = detailMap.get(t.bookingId)
    if (!d) return
    t.startTime = t.startTime || d.startTime
    t.endTime = t.endTime || d.endTime
    t.roomName = t.roomName || d.roomName
    t.confirmed = d.confirmed
    t.invitedTotal = d.invitedTotal
    if (!t.serviceName && d.services?.length) t.serviceName = d.services.join(', ')
  })
}

async function load() {
  loading.value = true
  error.value = ''
  notFound.value = false
  try {
    const candidates = [
      ['/api/housekeeping/manage', {}],
      ['/api/housekeeping/dashboard', {}],
      ['/api/bookings', { params: { page: 1, pageSize: 200, start_gte: new Date().toISOString() } } ],
    ]

    let res = null
    for (const [url, opt] of candidates) {
      try {
        res = await api.get(url, opt)
        if (res?.status === 200) break
      } catch { res = null }
    }
    if (!res) {
      notFound.value = true
      tasks.value = []
      return
    }

    const raw = res.data?.items ?? res.data ?? []

    if (Array.isArray(raw) && (raw[0]?.service || raw[0]?.serviceName || raw[0]?.bookingId)) {
      tasks.value = raw.map(x => ({
        id: x.id,
        bookingId: x.bookingId ?? x.booking?.id,
        title: x.title ?? x.task ?? x.service?.name ?? 'งานบริการ',
        roomName: x.roomName ?? x.room?.roomName ?? x.room?.name,
        serviceName: x.serviceName ?? x.service?.name,
        status: (x.status || 'PENDING').toUpperCase(),
        assignedToName: x.assignedTo?.fullName ?? x.assignedToName,
        startTime: x.startTime ?? x.booking?.startTime,
        endTime: x.endTime ?? x.booking?.endTime,
        priority: x.priority ?? x.isUrgent ? 'high' : 'normal',
      }))
      await enrichFromBookingDetail(tasks.value)
    } else {
      tasks.value = raw.map(b => ({
        id: b.id,
        bookingId: b.id,
        title: b.title || b.agenda || 'งานบริการ',
        roomName: b.room?.roomName || b.room?.name,
        status: 'PENDING',
        startTime: b.startTime || b.dateStart,
        endTime: b.endTime || b.dateEnd,
      }))
      await enrichFromBookingDetail(tasks.value)
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
    await api.post(`/api/housekeeping/update/${task.id}`, { status: 'COMPLETED' })
    task.status = 'COMPLETED'
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'ทำเสร็จแล้ว', timer: 1500, showConfirmButton: false })
    localStorage.setItem('hk:task-updated', String(Date.now()));
  } catch (e) {
    console.error('markDone', e)
    Swal.fire({ icon: 'error', title: 'ข้อผิดพลาด', text: e?.response?.data?.error || e?.message || 'อัปเดตสถานะไม่สำเร็จ' })
  }
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
