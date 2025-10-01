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
          <span v-if="isAdmin" class="text-sm px-2 py-1 rounded bg-blue-50 text-blue-700">Admin</span>
          <img src="https://via.placeholder.com/40x40" alt="Profile"
               class="w-10 h-10 rounded-full border-2 border-gray-300" />
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto flex gap-6 p-6">
      <!-- Sidebar -->
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
          <router-link v-if="isAdmin" to="/admin/approvals"
            class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium">
            <span class="text-lg">🛡️</span> อนุมัติการจอง (Admin)
          </router-link>
          <router-link to="/my-invites" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">
            <span class="text-lg">📨</span> คำเชิญของฉัน
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
                    <div v-if="b.room?.capacity" class="text-gray-500 text-xs">
                      ความจุ {{ b.room.capacity }} ที่นั่ง
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div>{{ timeRange(b.startTime, b.endTime) }}</div>
                    <div class="text-gray-500 text-xs">{{ dateTH(b.startTime) }}</div>
                  </td>
                  <td class="px-4 py-3">{{ b.bookedBy?.fullName || '-' }}</td>
                  <td class="px-4 py-3">
                    <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      รอผู้ดูแลอนุมัติ
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button
                        class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                        @click="openDetail(b)"
                        title="ดูรายละเอียด"
                      >
                        🔍 ดูรายละเอียด
                      </button>
                      <button
                        class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                        @click="approve(b)"
                        :disabled="actingId === b.id"
                        title="อนุมัติ"
                      >
                        ✔️ อนุมัติ
                      </button>
                      <button
                        class="px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60"
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
                  <td colspan="6" class="px-4 py-6 text-center text-gray-500">
                    ไม่มีคำขอรออนุมัติ
                  </td>
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

    <!-- ========= MODAL: รายละเอียดการจอง ========= -->
    <div
      v-if="showDetail"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @keydown.esc="closeDetail"
    >
      <div class="absolute inset-0 bg-black/50" @click="closeDetail"></div>

      <div class="relative bg-white rounded-xl shadow-xl w-[680px] max-h-[80vh] overflow-auto p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">รายละเอียดการจอง</h2>
          <button class="text-gray-500 hover:text-gray-700" @click="closeDetail">✕</button>
        </div>

        <div v-if="detailLoading" class="text-gray-500">กำลังโหลดรายละเอียด…</div>
        <div v-else-if="detailError" class="text-red-600">{{ detailError }}</div>

        <div v-else-if="detail">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-gray-500">ห้อง</div>
              <div class="font-medium">{{ detail.room?.roomName }} <span v-if="detail.room?.capacity" class="text-gray-500">· {{ detail.room.capacity }} ที่นั่ง</span></div>
            </div>
            <div>
              <div class="text-gray-500">ผู้จอง</div>
              <div class="font-medium">{{ detail.bookedBy?.fullName }}</div>
            </div>
            <div>
              <div class="text-gray-500">วันเวลา</div>
              <div class="font-medium">{{ timeRange(detail.startTime, detail.endTime) }} · {{ dateTH(detail.startTime) }}</div>
            </div>
            <div>
              <div class="text-gray-500">สถานะ</div>
              <div class="font-medium">{{ statusTH(detail.status) }}</div>
            </div>
          </div>

          <hr class="my-4">

          <div class="text-sm space-y-3">
            <div>
              <div class="font-medium mb-1">ตำแหน่งที่ต้องเข้าประชุม</div>
              <div v-if="detail.requiredPositions?.length" class="flex flex-wrap gap-2">
                <span v-for="rp in detail.requiredPositions" :key="rp.id" class="px-2 py-1 rounded bg-gray-100 text-gray-700">
                  {{ rp.position?.name }}
                </span>
              </div>
              <div v-else class="text-gray-500">—</div>
            </div>

            <div>
              <div class="font-medium mb-1">ผู้ถูกเชิญ</div>
              <div v-if="detail.invites?.length" class="space-y-1">
                <div v-for="iv in detail.invites" :key="iv.id" class="flex items-center justify-between">
                  <div>{{ iv.user?.fullName }}</div>
                  <div class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{{ inviteTH(iv.status) }}</div>
                </div>
              </div>
              <div v-else class="text-gray-500">—</div>
            </div>

            <div>
              <div class="font-medium mb-1">ผู้จดประชุม</div>
              <div v-if="detail.noteTakers?.length" class="flex flex-wrap gap-2">
                <span v-for="nt in detail.noteTakers" :key="nt.id" class="px-2 py-1 rounded bg-purple-50 text-purple-800">
                  {{ nt.user?.fullName }}
                </span>
              </div>
              <div v-else class="text-gray-500">—</div>
            </div>

            <div>
              <div class="font-medium mb-1">บริการ/อุปกรณ์</div>
              <div v-if="detail.services?.length" class="flex flex-wrap gap-2">
                <span v-for="bs in detail.services" :key="bs.id" class="px-2 py-1 rounded bg-blue-50 text-blue-800">
                  {{ bs.service?.name }}
                </span>
              </div>
              <div v-else class="text-gray-500">—</div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button class="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300" @click="closeDetail">ปิด</button>
        </div>
      </div>
    </div>
    <!-- ========= /MODAL ========= -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/lib/api.js'

/* ---------- state ---------- */
const items = ref([])
const loading = ref(false)
const errorMsg = ref('')

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const actingId = ref(null)

/* ---------- auth/me + isAdmin ---------- */
const me = ref(null)

function parseIsAdminFromToken () {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return false
    const payload = JSON.parse(atob((token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/')))
    return !!payload?.pos?.isAdmin
  } catch { return false }
}

const isAdmin = computed(() => {
  if (me.value && typeof me.value.isAdmin === 'boolean') return me.value.isAdmin
  return parseIsAdminFromToken()
})

async function fetchMe () {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = { ...data, isAdmin: !!(data?.position?.isAdmin ?? data?.isAdmin) }
  } catch { me.value = null }
}

/* ---------- helpers ---------- */
function timeRange (s, e) {
  const opt = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(s).toLocaleTimeString([], opt)} - ${new Date(e).toLocaleTimeString([], opt)}`
}
function dateTH (iso) {
  const d = new Date(iso)
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`
}
function statusTH(s){
  switch(s){
    case 'AWAITING_ATTENDEE_CONFIRM': return 'รอผู้เข้าร่วมยืนยัน'
    case 'AWAITING_ADMIN_APPROVAL':   return 'รอผู้ดูแลอนุมัติ'
    case 'APPROVED':                  return 'อนุมัติแล้ว'
    case 'CANCELLED':                 return 'ยกเลิกแล้ว'
    default: return s
  }
}
function inviteTH(s){
  switch(s){
    case 'INVITED': return 'เชิญแล้ว'
    case 'ACCEPTED': return 'ยืนยันแล้ว'
    case 'DECLINED': return 'ปฏิเสธ'
    default: return s
  }
}

/* ---------- list awaiting approvals ---------- */
async function fetchList () {
  if (!isAdmin.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    const params = { status: 'AWAITING_ADMIN_APPROVAL', page: page.value, pageSize: pageSize.value }
    const { data } = await api.get('/api/bookings', { params })
    const list = Array.isArray(data?.items) ? data.items : []
    items.value = list
    total.value = typeof data?.total === 'number' ? data.total : list.length
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

/* ---------- actions ---------- */
async function approve (b) {
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
async function cancel (b) {
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

/* ---------- detail modal ---------- */
const showDetail = ref(false)
const detailLoading = ref(false)
const detailError = ref('')
const detail = ref(null)

async function openDetail (row) {
  showDetail.value = true
  detailLoading.value = true
  detailError.value = ''
  detail.value = null
  try {
    const { data } = await api.get(`/api/bookings/${row.id}`)
    // คาดหวัง include: room, bookedBy, requiredPositions.position, invites.user, noteTakers.user, services.service
    detail.value = data?.booking || data
  } catch (e) {
    console.error(e)
    detailError.value = e?.response?.data?.error || 'โหลดรายละเอียดไม่สำเร็จ'
  } finally {
    detailLoading.value = false
  }
}
function closeDetail () {
  showDetail.value = false
}

/* ---------- lifecycle ---------- */
onMounted(async () => {
  await fetchMe()
  await fetchList()
})
watch(page, () => fetchList())
</script>
