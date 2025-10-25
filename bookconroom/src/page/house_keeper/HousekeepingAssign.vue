<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="fixed top-0 right-0 left-0 bg-white border-b z-30">
      <div class="flex items-center justify-between px-6 py-3">
        <div class="text-lg font-semibold">มอบหมายงาน</div>
        <button @click="back" class="px-3 py-2 border rounded">กลับ</button>
      </div>
    </header>

    <main class="pt-20 px-6">
      <div class="max-w-3xl mx-auto py-6">
        <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700 rounded">{{ error }}</div>

        <!-- งาน -->
        <div class="mb-5 p-4 bg-white border rounded-lg">
          <div class="text-sm text-gray-600">งาน</div>
          <div class="font-semibold text-gray-900">{{ displayTask.title || '-' }}</div>
          <div class="text-xs text-gray-600 mt-1">
            ห้อง: <span class="font-medium">{{ displayTask.roomName || '-' }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-1" v-if="displayTask.timeRange">
            เวลา: {{ displayTask.timeRange }}
          </div>
        </div>

        <!-- เลือกคนมอบหมาย (แม่บ้านเท่านั้น) -->
        <div class="mb-4">
          <label class="block text-sm text-gray-700 mb-1">เลือกผู้รับงาน (เฉพาะตำแหน่ง “แม่บ้าน”)</label>
          <select
            v-model="selectedUserId"
            class="w-full px-3 py-2 border rounded"
            :disabled="loadingHK || housekeepers.length===0"
          >
            <option value="">-- เลือกผู้รับงาน --</option>
            <option v-for="u in housekeepers" :key="u.id" :value="u.id">
              {{ optionLabel(u) }}
            </option>
          </select>
          <div class="text-xs text-gray-500 mt-2" v-if="loadingHK">กำลังโหลดรายชื่อแม่บ้าน...</div>
          <div class="text-xs text-gray-500 mt-2" v-else-if="housekeepers.length===0">ไม่พบผู้ที่มีตำแหน่ง “แม่บ้าน”</div>
          <div class="text-xs text-red-600 mt-2" v-if="hkError">{{ hkError }}</div>
        </div>

        <div class="flex gap-2">
          <button
            class="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
            :disabled="!selectedUserId || assigning"
            @click="assignSelected"
          >
            {{ assigning ? 'กำลังมอบหมาย...' : 'มอบหมาย' }}
          </button>
          <button class="px-4 py-2 border rounded" @click="back">ยกเลิก</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const route = useRoute()
const router = useRouter()

/** Params */
const taskId = String(route.query.taskId || '')
const roomIdFromQuery = route.query.roomId ? Number(route.query.roomId) : undefined

/** State */
const task = ref(null)
const error = ref('')

/** Housekeepers (dropdown) */
const housekeepers = ref([])
const loadingHK = ref(false)
const hkError = ref('')
const selectedUserId = ref('')
const assigning = ref(false)

/** Helpers */
function fmtTimeRange(s, e) {
  if (!s || !e) return ''
  const o = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(s).toLocaleTimeString([], o)} - ${new Date(e).toLocaleTimeString([], o)}`
}

const displayTask = computed(() => {
  const t = task.value || {}
  const title =
    t.title ||
    t.taskTitle ||
    t.name ||
    t.room?.roomName ||
    t.booking?.title ||
    `งาน #${t.id || taskId}`

  const roomName =
    t.roomName ||
    t.room?.roomName ||
    t.booking?.room?.roomName ||
    t.location ||
    ''

  const start = t.startTime || t.start || t.booking?.startTime
  const end   = t.endTime   || t.end   || t.booking?.endTime
  return {
    title,
    roomName,
    startTime: start,
    endTime: end,
    timeRange: (start && end) ? fmtTimeRange(start, end) : ''
  }
})

/** Load task (รองรับหลาย endpoint) */
async function fetchTaskInfo() {
  // สมมุติว่า query ใช้ ?bookingId=xxx (ถ้าใช้ชื่ออื่นปรับตามจริง)
  const bookingId = route.query.bookingId || route.query.taskId
  if (!bookingId) { task.value = null; return }
  const { data } = await api.get(`/api/bookings/${bookingId}`)
  // รองรับทั้ง data.booking และ data โดยให้ได้ object เดียวชื่อ booking
  const booking = data?.booking ?? data
  task.value = {
    id: booking?.id,
    roomName: booking?.room?.roomName,
    startTime: booking?.startTime,
    endTime: booking?.endTime,
  }
}

/** สร้าง label ใน dropdown */
function optionLabel(u) {
  const name = u.fullName || u.name || u.username || `User #${u.id}`
  const extra = u.position?.name || u.email || ''
  return extra ? `${name} • ${extra}` : name
}

/** กรองเฉพาะ “แม่บ้าน” — รองรับหลายสคีมา */
function isHousekeeper(u) {
  // มีการ include position มาจาก API
  if (u.position?.isHousekeeper === true) return true
  // fallback: กรณี backend ไม่ส่ง flag มา
  if (/แม่บ้าน/i.test(u.position?.name || '')) return true
  if (u.role?.toUpperCase?.() === 'HOUSEKEEPER') return true
  return false
}

/** โหลดรายชื่อแม่บ้าน (มี fallback) */
async function loadHousekeepers() {
  housekeepers.value = []
  loadingHK.value = true
  hkError.value = ''
  try {
    if (!task.value?.startTime || !task.value?.endTime) {
      // ถ้าไม่มีช่วงเวลา ให้ดึงแบบไม่กรองช่วงเวลาก็ได้ (แล้วแต่ต้องการ)
      housekeepers.value = []
      return
    }
    const start = new Date(task.value.startTime).toISOString()
    const end   = new Date(task.value.endTime).toISOString()

    // ถ้ามีคนถูก exclude (เช่น คนที่ลา/ว่างานนี้อยู่แล้ว) รวมเป็น id[]
    const excludeIds = []

    const { data } = await api.get('/api/notetakers/candidates', {
      params: {
        mode: 'housekeeper',
        start,
        end,
        excludeIds: excludeIds.length ? excludeIds.join(',') : undefined,
      }
    })

    // map ให้ dropdown ใช้
    housekeepers.value = (data?.items ?? []).map((it) => ({
      id: it.userId ?? it.user?.id ?? it.id,
      fullName: it.user?.fullName ?? it.user?.name ?? it.fullName ?? `User #${it.userId ?? it.user?.id ?? it.id}`,
      position: it.user?.position ?? it.position,
      username: it.user?.username ?? it.username
    }))
  } catch (e) {
    console.error('loadHousekeepers', e)
    hkError.value = e?.response?.data?.error || e?.message || 'Not Found'
  } finally {
    loadingHK.value = false
  }
}

/** มอบหมายให้ user ที่เลือก */
async function assignSelected() {
  if (!taskId || !selectedUserId.value) return
  const u = housekeepers.value.find(x => String(x.id) === String(selectedUserId.value))
  const name = u ? (u.fullName || u.name || u.username) : `User #${selectedUserId.value}`

  const confirm = await Swal.fire({
    title: 'ยืนยันการมอบหมาย',
    text: `มอบหมายงานให้ ${name}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'มอบหมาย',
    cancelButtonText: 'ยกเลิก'
  })
  if (!confirm.isConfirmed) return

  try {
    assigning.value = true
    await api.post('/api/housekeeping/assign', {
      taskId,
      userId: Number(selectedUserId.value),
    })
    await Swal.fire({ icon: 'success', title: 'มอบหมายเรียบร้อย', timer: 1200, showConfirmButton: false })
    router.back()
  } catch (e) {
    console.error('assign', e)
    Swal.fire({ icon: 'error', title: 'มอบหมายไม่สำเร็จ', text: e?.response?.data?.error || e?.message || 'เกิดข้อผิดพลาด' })
  } finally {
    assigning.value = false
  }
}

function back(){ router.back() }

onMounted(async () => {
  await fetchTaskInfo()
  await loadHousekeepers()
})
</script>
