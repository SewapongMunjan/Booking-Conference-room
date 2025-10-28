<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r z-50">
      <div class="p-4 border-b">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl">🧹</div>
          <div>
            <h3 class="font-semibold text-sm">Housekeeping</h3>
            <p class="text-xs text-gray-500">งานแม่บ้าน</p>
          </div>
        </div>
      </div>

      <nav class="p-3 space-y-1">
        <router-link to="/housekeeping/dashboard" class="nav-link">🏠 Dashboard</router-link>
        <router-link to="/housekeeping/tasks" class="nav-link">🧾 งานทั้งหมด</router-link>
        <router-link to="/housekeeping/complete" class="nav-link nav-active">🧹 ทุกห้องที่ถูกจอง</router-link>
      </nav>
    </aside>

    <!-- Header -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 bg-white border-b z-30">
      <div class="flex items-center justify-between px-6 py-3">
        <div>
          <h2 class="text-lg font-semibold">ทุกห้องที่ถูกจอง (เฉพาะห้องประชุม)</h2>
          <p class="text-xs text-gray-500">แสดงเฉพาะงานทำความสะอาดห้องประชุม ไม่รวมบริการเสริม เช่น Coffee / Lunch</p>
        </div>

        <div class="flex items-center gap-2">
          <select v-model="status" class="px-2.5 py-2 border rounded-lg text-sm">
            <option value="all">ทั้งหมด</option>
            <option value="pending">รอเริ่มทำความสะอาด</option>
            <option value="running">กำลังทำความสะอาด</option>
            <option value="done">ทำความสะอาดเสร็จ</option>
          </select>
          <input v-model="q" class="px-3 py-2 border rounded-lg text-sm w-64" placeholder="ค้นหาห้อง/ผู้จอง/เลขจอง">
          <button @click="load" class="px-3 py-2 bg-emerald-600 text-white rounded">รีเฟรช</button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="lg:ml-64 pt-24 px-6">
      <div class="max-w-5xl mx-auto py-6">
        <div class="text-xs text-gray-500 mb-3">
          รวม {{ filtered.length }} รายการ
          <span v-if="loading" class="ml-2">• กำลังโหลด…</span>
        </div>

        <div v-if="!loading && filtered.length === 0" class="text-gray-500">ไม่พบข้อมูล</div>

        <ul class="space-y-3">
          <li v-for="b in filtered" :key="b.bookingId" class="bg-white border rounded-lg p-4 flex items-center justify-between">
            <div class="min-w-0">
              <div class="font-semibold truncate">
                {{ b.room?.roomName || b.room?.name || 'ไม่ระบุห้อง' }}
                <span class="text-xs text-gray-500"> • Booking #{{ b.bookingId }}</span>
              </div>
              <div class="text-xs text-gray-500 mt-1">
                ผู้จอง: {{ b.bookedBy?.fullName || '-' }} • เวลา:
                {{ fmt(b.startTime) }} - {{ fmt(b.endTime) }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                งานทำความสะอาด: <strong class="text-gray-700">{{ humanCleanStatus(b.cleaningStatus) }}</strong>
                <span v-if="b.cleaningStartedAt" class="ml-2">เริ่ม: {{ fmt(b.cleaningStartedAt) }}</span>
                <span v-if="b.cleaningCompletedAt" class="ml-2">เสร็จ: {{ fmt(b.cleaningCompletedAt) }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- สถานะ -->
              <span
                v-if="b.cleaningStatus === 'RUNNING'"
                class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700"
              >กำลังทำความสะอาด</span>
              <span
                v-else-if="b.cleaningStatus === 'COMPLETED'"
                class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700"
              >เสร็จแล้ว</span>
              <span
                v-else
                class="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700"
              >รอเริ่ม</span>

              <!-- ปุ่มการทำงาน -->
              <button
                v-if="showStart(b)"
                @click="startCleaning(b)"
                class="px-3 py-2 text-xs rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                :disabled="savingId === b.bookingId"
              >
                เริ่มทำความสะอาด
              </button>

              <button
                v-if="showFinish(b)"
                @click="finishCleaning(b)"
                class="px-3 py-2 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                :disabled="savingId === b.bookingId"
              >
                ✓ เสร็จสิ้น
              </button>
            </div>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'

const loading = ref(false)
const savingId = ref(null)
const rows = ref([])

/**
 * ฟิลเตอร์/ค้นหา
 */
const status = ref('all') // all | pending | running | done
const q = ref('')

const filtered = computed(() => {
  const t = q.value.trim().toLowerCase()
  return rows.value
    .filter(b => {
      if (status.value === 'pending' && b.cleaningStatus !== 'PENDING') return false
      if (status.value === 'running' && b.cleaningStatus !== 'RUNNING') return false
      if (status.value === 'done' && b.cleaningStatus !== 'COMPLETED') return false
      if (!t) return true
      return (
        String(b.room?.roomName || b.room?.name || '').toLowerCase().includes(t) ||
        String(b.bookedBy?.fullName || '').toLowerCase().includes(t) ||
        String(b.bookingId || '').includes(t)
      )
    })
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
})

/**
 * ดึงเฉพาะ “งานทำความสะอาดห้องประชุม”
 * backend ควรส่งรูปแบบ:
 * [
 *  {
 *    bookingId, startTime, endTime,
 *    room: { id, roomName? name? },
 *    bookedBy: { fullName? },
 *    cleaningStatus: 'PENDING'|'RUNNING'|'COMPLETED',
 *    cleaningStartedAt?, cleaningCompletedAt?
 *  }
 * ]
 */
async function load () {
  loading.value = true
  try {
    const { data } = await api.get('/api/housekeeping/cleaning/bookings')
    rows.value = Array.isArray(data?.items) ? data.items : []
  } catch (e) {
    console.error('load cleaning bookings', e)
    rows.value = []
    Swal.fire('เกิดข้อผิดพลาด', e?.response?.data?.error || 'ไม่สามารถโหลดรายการได้', 'error')
  } finally {
    loading.value = false
  }
}

function fmt (iso) {
  if (!iso) return '-'
  try { return new Date(iso).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) } catch { return iso }
}
function humanCleanStatus (s) {
  if (s === 'RUNNING') return 'กำลังทำความสะอาด'
  if (s === 'COMPLETED') return 'ทำความสะอาดเสร็จ'
  return 'รอเริ่มทำความสะอาด'
}

/**
 * เงื่อนไขการแสดงปุ่ม
 * - เริ่มทำความสะอาด: ยังไม่เริ่ม (PENDING) และเวลาประชุมสิ้นสุดแล้ว
 * - เสร็จสิ้น: อยู่สถานะ RUNNING
 */
function showStart (b) {
  const ended = new Date(b.endTime).getTime() <= Date.now()
  return b.cleaningStatus === 'PENDING' && ended
}
function showFinish (b) {
  return b.cleaningStatus === 'RUNNING'
}

async function startCleaning (b) {
  const ok = await Swal.fire({
    icon: 'question',
    title: 'เริ่มทำความสะอาด?',
    text: `เริ่มทำความสะอาดห้อง ${b.room?.roomName || b.room?.name || ''} เลยหรือไม่`,
    showCancelButton: true,
    confirmButtonText: 'เริ่ม',
  })
  if (!ok.isConfirmed) return
  savingId.value = b.bookingId
  try {
    await api.post(`/api/housekeeping/cleaning/bookings/${b.bookingId}/start-cleaning`)
    await load()
    Swal.fire({ icon: 'success', title: 'เริ่มงานแล้ว', timer: 1000, showConfirmButton: false })
  } catch (e) {
    console.error('start cleaning', e)
    Swal.fire('เริ่มไม่สำเร็จ', e?.response?.data?.error || 'โปรดลองอีกครั้ง', 'error')
  } finally {
    savingId.value = null
  }
}

async function finishCleaning (b) {
  const ok = await Swal.fire({
    icon: 'question',
    title: 'ยืนยันเสร็จสิ้น?',
    text: `ยืนยันว่าทำความสะอาดห้อง ${b.room?.roomName || b.room?.name || ''} เสร็จแล้ว`,
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
  })
  if (!ok.isConfirmed) return
  savingId.value = b.bookingId
  try {
    await api.post(`/api/housekeeping/cleaning/bookings/${b.bookingId}/finish-cleaning`)
    await load()
    Swal.fire({ icon: 'success', title: 'อัปเดตเรียบร้อย', timer: 1000, showConfirmButton: false })
  } catch (e) {
    console.error('finish cleaning', e)
    Swal.fire('อัปเดตไม่สำเร็จ', e?.response?.data?.error || 'โปรดลองอีกครั้ง', 'error')
  } finally {
    savingId.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.nav-link { @apply block px-3 py-2 rounded hover:bg-gray-100 text-sm; }
.nav-active { @apply bg-emerald-50 text-emerald-600; }
</style>
