<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-8 py-4 shadow-sm border-b">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h2 class="text-lg font-semibold text-blue-600 m-0">แดชบอร์ดผู้ดูแลระบบ</h2>
          <p class="text-sm text-gray-600 m-0">อนุมัติการจองห้องประชุม</p>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-sm px-2 py-1 rounded bg-blue-50 text-blue-700" v-if="isAdmin">Admin</span>
          <img src="https://via.placeholder.com/40x40" alt="Profile" class="w-10 h-10 rounded-full border-2 border-gray-300" />
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto flex gap-6 p-6">
      <!-- Sidebar (ถ้ามีของเดิมอยู่แล้วก็ใช้ของเดิมได้) -->
      <aside class="w-64 bg-white rounded-xl shadow-sm p-4">
        <nav class="flex flex-col gap-2">
          <router-link to="/" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">🏠</span> หน้าแรก
          </router-link>
          <router-link to="/booking" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">📅</span> จองห้องประชุม
          </router-link>
          <router-link to="/booking-list" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg font-medium">
            <span class="text-lg">📋</span> รายการจองของฉัน
          </router-link>
          <router-link to="/room-use" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">🗂️</span> ตารางการใช้ห้องประชุม
          </router-link>
          <router-link to="/room-status" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">ℹ️</span> สถานะห้องประชุม
          </router-link>
          <router-link to="/report" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">⚠️</span> แจ้งปัญหา
          </router-link>
          <router-link to="/admin/approvals" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium">
            <span class="text-lg">🛡️</span> อนุมัติการจอง (Admin)
          </router-link>
        </nav>
      </aside>

      <!-- Main -->
      <main class="flex-1 bg-white rounded-xl shadow-sm p-8">
        <div class="mb-6 flex items-center gap-3">
          <h1 class="text-2xl font-semibold text-blue-600 m-0">คำขอรออนุมัติ</h1>
          <span class="text-sm text-gray-500">สถานะ: รอผู้ดูแลอนุมัติ</span>
          <span v-if="loading" class="text-sm text-gray-500">· กำลังโหลด…</span>
          <span v-if="errorMsg" class="text-sm text-red-600">· {{ errorMsg }}</span>
        </div>

        <!-- Guard: เฉพาะ Admin -->
        <div v-if="!isAdmin" class="p-6 border rounded-xl bg-amber-50 text-amber-800">
          บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ กรุณาเข้าสู่ระบบด้วยบัญชี Admin
        </div>

        <div v-else>
          <!-- ตาราง -->
          <div class="overflow-x-auto border rounded-xl">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-gray-700">
                <tr>
                  <th class="px-4 py-3 text-left">#</th>
                  <th class="px-4 py-3 text-left">ห้อง</th>
                  <th class="px-4 py-3 text-left">เวลา</th>
                  <th class="px-4 py-3 text-left">ผู้จอง</th>
                  <th class="px-4 py-3 text-left">สถานะ</th>
                  <th class="px-4 py-3 text-left">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(b, idx) in items" :key="b.id" class="border-t">
                  <td class="px-4 py-3">{{ (page - 1) * pageSize + (idx + 1) }}</td>
                  <td class="px-4 py-3">
                    <div class="font-medium">{{ b.room?.roomName || '-' }}</div>
                    <div class="text-gray-500 text-xs" v-if="b.room?.capacity">ความจุ {{ b.room.capacity }} ที่นั่ง</div>
                  </td>
                  <td class="px-4 py-3">
                    <div>{{ timeRange(b.startTime, b.endTime) }}</div>
                    <div class="text-gray-500 text-xs">{{ dateTH(b.startTime) }}</div>
                  </td>
                  <td class="px-4 py-3">
                    {{ b.bookedBy?.fullName || '-' }}
                  </td>
                  <td class="px-4 py-3">
                    <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800">รอผู้ดูแลอนุมัติ</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button
                        class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                        @click="approve(b)"
                        :disabled="actingId === b.id"
                        title="อนุมัติ"
                      >
                        ✔️ อนุมัติ
                      </button>
                      <button
                        class="px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                        @click="cancel(b)"
                        :disabled="actingId === b.id"
                        title="ยกเลิก"
                      >
                        ✖️ ยกเลิก
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!items.length && !loading">
                  <td colspan="6" class="px-4 py-6 text-center text-gray-500">ไม่มีคำขอรออนุมัติ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="mt-4 flex items-center gap-2">
            <button class="px-3 py-1 border rounded" :disabled="page===1" @click="page--; fetchList()">
              ← ก่อนหน้า
            </button>
            <span class="text-sm">หน้า {{ page }} / {{ totalPages }}</span>
            <button class="px-3 py-1 border rounded" :disabled="page===totalPages" @click="page++; fetchList()">
              ถัดไป →
            </button>

            <span class="ml-auto text-sm text-gray-500">ทั้งหมด {{ total }} รายการ</span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/lib/api.js'

const items = ref([])
const loading = ref(false)
const errorMsg = ref('')

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const actingId = ref(null)

// ---------- ดึงสิทธิ์ผู้ใช้จาก backend ----------
const me = ref(null)
const isAdmin = computed(() => !!me.value?.isAdmin)

async function fetchMe() {
  try {
    const { data } = await api.get('/api/auth/me') // ต้องแน่ใจว่า backend มีเส้นนี้
    me.value = data // { id, fullName, email, position:{...}, isAdmin: boolean }
  } catch (e) {
    me.value = null
    // ถ้า token หมดอายุ ให้พาไป login ก็ได้ (ขึ้นอยู่กับ flow ของคุณ)
    // location.href = '/login'
  }
}

// ---------- helpers ----------
function timeRange(s, e) {
  const opt = { hour:'2-digit', minute:'2-digit' }
  return `${new Date(s).toLocaleTimeString([], opt)} - ${new Date(e).toLocaleTimeString([], opt)}`
}
function dateTH(iso) {
  const d = new Date(iso)
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()+543}`
}

// ---------- โหลดรายการรออนุมัติ ----------
async function fetchList() {
  if (!isAdmin.value) return // กัน user ปกติ
  loading.value = true
  errorMsg.value = ''
  try {
    const params = {
      status: 'AWAITING_ADMIN_APPROVAL',
      page: page.value,
      pageSize: pageSize.value
    }
    const { data } = await api.get('/api/bookings', { params })
    const list = Array.isArray(data?.items) ? data.items : []
    items.value = list
    total.value = typeof data?.total === 'number' ? data.total : list.length

    // กัน page เกินขอบ เมื่อ total เปลี่ยน
    const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value))
    if (page.value > maxPage) page.value = maxPage
  } catch (e) {
    console.error(e)
    errorMsg.value = e?.response?.data?.error || 'โหลดรายการไม่สำเร็จ'
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// ---------- อนุมัติ / ยกเลิก ----------
async function approve(b) {
  if (!confirm(`อนุมัติการจองห้อง ${b.room?.roomName || b.id}?`)) return
  try {
    actingId.value = b.id
    await api.post(`/api/bookings/${b.id}/approve`)
    await fetchList()
  } catch (e) {
    console.error(e)
    alert(e?.response?.data?.error || 'อนุมัติไม่สำเร็จ')
  } finally {
    actingId.value = null
  }
}

async function cancel(b) {
  if (!confirm(`ยืนยันยกเลิกการจองห้อง ${b.room?.roomName || b.id}?`)) return
  try {
    actingId.value = b.id
    await api.patch(`/api/bookings/${b.id}/cancel`)
    await fetchList()
  } catch (e) {
    console.error(e)
    alert(e?.response?.data?.error || 'ยกเลิกไม่สำเร็จ')
  } finally {
    actingId.value = null
  }
}

// ---------- lifecycle & watchers ----------
onMounted(async () => {
  await fetchMe()      // รู้สิทธิ์ก่อน
  await fetchList()    // แล้วค่อยโหลดรายการ
})

// เปลี่ยนหน้า → โหลดใหม่
watch(page, () => fetchList())
</script>

