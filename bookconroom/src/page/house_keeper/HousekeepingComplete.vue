<template>
  <div class="min-h-screen bg-gray-50">
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
        <router-link to="/housekeeping/complete" class="nav-link nav-active">✅ ทำความสะอาดเสร็จ</router-link>
      </nav>
    </aside>

    <header class="fixed top-0 right-0 left-0 lg:left-64 bg-white border-b z-30">
      <div class="flex items-center justify-between px-6 py-3">
        <div>
          <h2 class="text-lg font-semibold">งานแม่บ้าน — ทำความสะอาด</h2>
          <p class="text-xs text-gray-500">กดปุ่มเมื่อทำความสะอาดห้องเสร็จ ระบบจะเปลี่ยนสถานะห้องเป็น "ห้องว่าง"</p>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="q" placeholder="ค้นหาห้อง/หมายเหตุ" class="px-3 py-2 border rounded-lg text-sm w-64" />
          <button @click="load" class="px-3 py-2 bg-emerald-600 text-white rounded">รีเฟรช</button>
        </div>
      </div>
    </header>

    <main class="lg:ml-64 pt-28 px-6">
      <div class="max-w-4xl mx-auto py-6">
        <div v-if="loading" class="text-gray-500 mb-4">กำลังโหลด...</div>
        <div v-if="items.length===0 && !loading" class="text-gray-500">ไม่มีงานสำหรับทำความสะอาด</div>

        <ul class="space-y-3">
          <li v-for="it in filtered" :key="it.id" class="bg-white border rounded-lg p-4 flex items-center justify-between">
            <div class="min-w-0">
              <div class="font-medium truncate">{{ it.room?.roomName || it.room?.name || 'ไม่ระบุห้อง' }}</div>
              <div class="text-xs text-gray-500 mt-1">Booking: {{ it.bookingId || '-' }} • สร้าง: {{ fmt(it.createdAt) }}</div>
              <div class="text-xs text-gray-500 mt-1">หมายเหตุ: {{ it.note || '-' }}</div>
            </div>

            <div class="flex items-center gap-3">
              <div v-if="it.status === 'PENDING'" class="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700">รอดำเนินการ</div>
              <div v-else class="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">เสร็จแล้ว</div>

              <button v-if="it.status === 'PENDING'" @click="complete(it)" class="px-3 py-2 bg-emerald-600 text-white rounded">ทำความสะอาดเสร็จ</button>
              <span v-else class="text-xs text-gray-500">เสร็จ: {{ fmt(it.completedAt) || '-' }}</span>
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

const items = ref([])
const loading = ref(false)
const q = ref('')

function fmt(iso) {
  if (!iso) return '-'
  try { return new Date(iso).toLocaleString('th-TH') } catch { return iso }
}

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return items.value
  return items.value.filter(it =>
    String(it.room?.roomName || it.room?.name || '').toLowerCase().includes(term) ||
    String(it.note || '').toLowerCase().includes(term) ||
    String(it.bookingId || '').includes(term)
  )
})

async function load() {
  loading.value = true
  try {
    const res = await api.get('/api/housekeeping/tasks')
    const data = res?.data ?? {}
    items.value = Array.isArray(data.items) ? data.items : []
  } catch (err) {
    console.error('load housekeeping tasks', err)
    items.value = []
    Swal.fire('เกิดข้อผิดพลาด', err?.response?.data?.error || 'ไม่สามารถโหลดงานได้', 'error')
  } finally {
    loading.value = false
  }
}

async function complete(it) {
  if (!it?.id) return
  const ok = await Swal.fire({
    title: 'ยืนยัน',
    text: `ทำความสะอาดห้อง "${it.room?.roomName || it.room?.name || it.roomId}" เสร็จแล้วหรือไม่?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'ใช่, เสร็จแล้ว'
  })
  if (!ok.isConfirmed) return

  try {
    await api.patch(`/api/housekeeping/tasks/${it.id}/complete`)
    Swal.fire({ icon: 'success', title: 'อัปเดตเรียบร้อย', timer: 1200, showConfirmButton: false })
    await load()
  } catch (err) {
    console.error('complete task', err)
    Swal.fire('ไม่สำเร็จ', err?.response?.data?.error || 'ไม่สามารถอัปเดตงานได้', 'error')
  }
}

onMounted(load)
</script>

<style scoped>
.nav-link { @apply block px-3 py-2 rounded hover:bg-gray-100 text-sm; }
.nav-active { @apply bg-emerald-50 text-emerald-600; }
</style>