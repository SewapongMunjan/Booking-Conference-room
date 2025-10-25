<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Fixed Left Sidebar - Hidden on mobile -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
      <div class="h-full flex flex-col">
        <!-- Logo Section -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl shadow-md">
              🏢
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">ระบบจองห้องประชุม</h3>
              <p class="text-[10px] text-gray-500">Admin Console</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link to="/admin/dashboard-modern" class="nav-link">
            <span class="text-lg">🏠</span>
            <span class="text-sm">Dashboard</span>
          </router-link>
          <router-link to="/admin/approvals" class="nav-link">
            <span class="text-lg">🛡️</span>
            <span class="text-sm">Approvals</span>
          </router-link>
          <router-link to="/admin/my-bookings" class="nav-link">
            <span class="text-lg">📋</span>
            <span class="text-sm">My Bookings</span>
          </router-link>
          <router-link to="/admin/issues" class="nav-link">
            <span class="text-lg">⚠️</span>
            <span class="text-sm">Issues</span>
          </router-link>
          <router-link to="/admin/loans" class="nav-link">
            <span class="text-lg">🔌</span>
            <span class="text-sm">Loans</span>
          </router-link>
          <router-link to="/admin/room-status" class="nav-link nav-active">
            <span class="text-lg">ℹ️</span>
            <span class="text-sm">Room Status</span>
          </router-link>
        </nav>

        <!-- Footer -->
        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'Admin' }}</div>
              <div class="text-[10px] text-gray-500 truncate">{{ me?.email || '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Header -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white border-b border-gray-200">
      <div class="w-full px-8 py-4 flex justify-between items-center">
        <!-- Left -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-lg lg:hidden">
            🏢
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900 m-0">Room Status</h2>
            <p class="text-xs text-gray-500 m-0 hidden sm:block lg:hidden">สถานะห้อง</p>
          </div>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-3">
          <button @click="load" class="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">รีเฟรช</button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full min-h-[calc(100vh-5rem)] px-8 py-6 bg-white shadow-md rounded-lg">
        <div class="max-w-7xl mx-auto space-y-6">
          <!-- Page Header -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg">
              ℹ️
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 m-0">Room Status</h1>
              <p class="text-base text-gray-500 m-0 mt-1">ตรวจสอบและอัพเดตสถานะห้องประชุม</p>
            </div>
          </div>

          <!-- Room Status Cards -->
          <div class="modern-card shadow-md">
            <div v-if="loading" class="text-gray-500 py-8 text-center">กำลังโหลดข้อมูล...</div>

            <div v-else class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div v-for="r in rooms" :key="r.id" class="p-4 rounded-xl border"
                   :class="r.status==='AVAILABLE' ? 'bg-green-50 border-green-200' : 'bg-rose-50 border-rose-200'">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="font-semibold">{{ r.roomName || r.name }}</div>
                    <div class="text-xs text-gray-600">ชั้น {{ r.floor ?? '-' }} · ความจุ {{ r.capacity ?? '-' }}</div>
                    <div class="mt-2 text-sm" :class="r.status==='AVAILABLE' ? 'text-green-700' : 'text-rose-700'">
                      {{ r.statusLabel || (r.status==='AVAILABLE' ? 'ว่าง' : 'ไม่ว่าง') }}
                    </div>
                  </div>

                  <div class="w-36">
                    <label class="text-xs text-gray-500">เปลี่ยนสถานะ</label>
                    <select :disabled="updating[r.id]" class="mt-2 w-full rounded-lg border px-2 py-1 text-sm"
                            :value="r.status" @change="onChangeStatus(r, $event.target.value)">
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="UNAVAILABLE">UNAVAILABLE</option>
                    </select>

                    <button v-if="r.status !== originalStatus[r.id]" @click="saveStatus(r)" :disabled="updating[r.id]"
                            class="mt-3 w-full px-3 py-2 rounded-lg text-sm border bg-white hover:bg-gray-50">
                      บันทึก
                    </button>

                    <div v-if="updating[r.id]" class="text-xs text-gray-500 mt-2">กำลังอัพเดต...</div>
                  </div>
                </div>
              </div>

              <div v-if="!rooms.length" class="text-gray-500 text-sm">ไม่มีข้อมูล</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'

const rooms = ref([])
const loading = ref(false)
const updating = reactive({})
const originalStatus = reactive({})
const me = ref(null)

// load all rooms with status
async function load(){
  loading.value = true
  try {
    const res = await api.get('/api/rooms', { params: { all: 1 } })
    const items = res?.data?.items ?? []
    rooms.value = Array.isArray(items) ? items : []
    // keep original status snapshot
    rooms.value.forEach(r => {
      originalStatus[r.id] = r.status
      updating[r.id] = false
    })
  } catch (e) {
    console.error('load rooms', e)
    rooms.value = []
  } finally {
    loading.value = false
  }
}

function onChangeStatus(room, newStatus){
  // update UI immediately but keep originalStatus for save button logic
  const idx = rooms.value.findIndex(x => x.id === room.id)
  if (idx !== -1) rooms.value[idx].status = newStatus
}

async function saveStatus(room){
  const id = room.id
  const newStatus = room.status
  const prev = originalStatus[id]
  if (newStatus === prev) return

  const confirm = await Swal.fire({
    title: 'ยืนยันการเปลี่ยนสถานะ',
    text: `เปลี่ยนสถานะห้อง "${room.roomName || room.name}" เป็น ${newStatus}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ใช่, เปลี่ยนสถานะ',
    cancelButtonText: 'ยกเลิก'
  })
  if (!confirm.isConfirmed) {
    // revert change in UI
    const idx = rooms.value.findIndex(x => x.id === id)
    if (idx !== -1) rooms.value[idx].status = prev
    return
  }

  try {
    updating[id] = true
    // call backend to update status - backend route PUT /api/rooms/:id
    const res = await api.put(`/api/rooms/${id}`, { status: newStatus })
    const updated = res?.data?.item ?? res?.data ?? {}
    // update local item and snapshot
    const idx = rooms.value.findIndex(x => x.id === id)
    if (idx !== -1) rooms.value[idx] = { ...rooms.value[idx], ...updated }
    originalStatus[id] = newStatus
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'อัพเดตสถานะเรียบร้อย', timer: 1400, showConfirmButton: false })
  } catch (e) {
    console.error('saveStatus', e)
    Swal.fire({ icon: 'error', title: 'อัพเดตสถานะล้มเหลว', text: e?.response?.data?.error || e?.message || '' })
    // revert UI
    const idx = rooms.value.findIndex(x => x.id === id)
    if (idx !== -1) rooms.value[idx].status = prev
  } finally {
    updating[id] = false
  }
}

onMounted(load)
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900;
}
.nav-active {
  @apply bg-blue-50 text-blue-600;
}

.modern-card {
  @apply bg-white rounded-2xl border border-gray-200 p-6;
}
</style>