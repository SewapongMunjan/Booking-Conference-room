<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-6 md:px-10 py-4 shadow-sm border-b">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 m-0">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p class="text-sm text-gray-500 m-0">ภาพรวมคำขอ / การจอง / แจ้งปัญหา / ยืมคืน</p>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="isAdmin" class="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">Admin</span>
          <img :src="me?.avatarUrl || 'https://via.placeholder.com/40x40'"
               class="w-10 h-10 rounded-full border" alt="avatar"/>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-6 p-6">
      <!-- Sidebar -->
      <aside class="bg-[#0b5bd7] text-white rounded-xl shadow-sm">
        <div class="px-5 pt-5 pb-3">
          <div class="font-semibold">ระบบจองห้องประชุม</div>
          <div class="text-xs text-blue-100">Meeting Room Booking System</div>
        </div>
        <nav class="flex flex-col">
          <RouterLink to="/admin/dashboard" class="px-5 py-3 hover:bg-blue-700"
                      :class="{'bg-blue-800': $route.path.includes('/admin/dashboard')}">อนุมัติ</RouterLink>
          <RouterLink to="/booking-list" class="px-5 py-3 hover:bg-blue-700">รายการจอง</RouterLink>
          <RouterLink to="/report" class="px-5 py-3 hover:bg-blue-700">แจ้งปัญหา</RouterLink>
          <RouterLink to="/equip/loans" class="px-5 py-3 hover:bg-blue-700">ยืมคืนอุปกรณ์</RouterLink>
        </nav>
      </aside>

      <!-- Main -->
      <main class="bg-white rounded-xl shadow-sm p-5 md:p-7">
        <!-- Guard -->
        <div v-if="!isAdmin && loadedMe" class="p-6 border rounded-xl bg-amber-50 text-amber-900">
          บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ
        </div>

        <template v-else>
          <!-- Top KPI -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard title="รายการทั้งหมด" :value="kpi.totalRequests" color="blue" />
            <KpiCard title="อนุมัติแล้ว" :value="kpi.approved" color="green" />
            <KpiCard title="ยังไม่อนุมัติ" :value="kpi.pending" color="amber" />
          </div>

          <!-- Filters / Reload -->
          <div class="mt-6 flex flex-col md:flex-row md:items-center gap-3">
            <div class="text-gray-600 text-sm">
              อัปเดตล่าสุด: <span class="font-medium">{{ updatedAtText }}</span>
            </div>
            <div class="md:ml-auto flex gap-2">
              <button class="px-3 py-2 border rounded hover:bg-gray-50" @click="refreshAll" :disabled="loadingAll">
                🔄 โหลดใหม่
              </button>
              <select v-model="days" class="px-3 py-2 border rounded">
                <option :value="7">ช่วง 7 วัน</option>
                <option :value="30">ช่วง 30 วัน</option>
                <option :value="90">ช่วง 90 วัน</option>
              </select>
            </div>
          </div>

          <!-- Lists -->
          <div class="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
            <!-- Approvals -->
            <section class="border rounded-xl overflow-hidden">
              <header class="px-4 py-3 bg-gray-50 border-b">
                <h3 class="m-0 font-semibold">คำขอรออนุมัติ (ล่าสุด)</h3>
              </header>
              <div class="divide-y">
                <RowPlaceholder v-if="pendingListLoading" text="กำลังโหลด..." />
                <template v-else>
                  <AdminRow
                    v-for="b in pendingList"
                    :key="b.id"
                    :booking="b"
                    @approve="approve(b)"
                    @cancel="cancel(b)"
                  />
                  <RowPlaceholder v-if="!pendingList.length" text="ไม่มีรายการรออนุมัติ" />
                </template>
              </div>
            </section>

            <!-- Bookings -->
            <section class="border rounded-xl overflow-hidden">
              <header class="px-4 py-3 bg-gray-50 border-b">
                <h3 class="m-0 font-semibold">การจองล่าสุด</h3>
              </header>
              <div class="divide-y">
                <RowPlaceholder v-if="recentBookingsLoading" text="กำลังโหลด..." />
                <template v-else>
                  <SimpleRow v-for="b in recentBookings" :key="b.id"
                             :title="b.room?.roomName || '-'" :subtitle="dateRange(b.startTime,b.endTime)"
                             :meta="b.bookedBy?.fullName || '-'" />
                  <RowPlaceholder v-if="!recentBookings.length" text="ยังไม่มีการจอง" />
                </template>
              </div>
            </section>

            <!-- Issues -->
            <section class="border rounded-xl overflow-hidden">
              <header class="px-4 py-3 bg-gray-50 border-b">
                <h3 class="m-0 font-semibold">แจ้งปัญหาล่าสุด</h3>
              </header>
              <div class="divide-y">
                <RowPlaceholder v-if="issuesLoading" text="กำลังโหลด..." />
                <template v-else>
                  <SimpleRow v-for="r in recentIssues" :key="r.id"
                             :title="r.room?.roomName || '-'" :subtitle="r.title || '—'"
                             :meta="dateTH(r.createdAt)" />
                  <RowPlaceholder v-if="!recentIssues.length" text="ไม่มีการแจ้งปัญหา" />
                </template>
              </div>
            </section>

            <!-- Loans -->
            <section class="border rounded-xl overflow-hidden">
              <header class="px-4 py-3 bg-gray-50 border-b">
                <h3 class="m-0 font-semibold">ยืม-คืน ล่าสุด</h3>
              </header>
              <div class="divide-y">
                <RowPlaceholder v-if="loansLoading" text="กำลังโหลด..." />
                <template v-else>
                  <SimpleRow v-for="l in recentLoans" :key="l.id"
                             :title="l.room?.roomName || '-'" :subtitle="l.itemName || '—'"
                             :meta="loanStatusTH(l.status) + ' · ' + dateTH(l.updatedAt || l.createdAt)" />
                  <RowPlaceholder v-if="!recentLoans.length" text="ยังไม่มีรายการ" />
                </template>
              </div>
            </section>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'

/* --------------------- STATE --------------------- */
const router = useRouter()
const me = ref(null)
const loadedMe = ref(false)

const isAdmin = computed(() => {
  if (me.value && typeof me.value.isAdmin === 'boolean') return me.value.isAdmin
  // fallback จาก token (กรณี /auth/me ไม่มี isAdmin)
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return false
    const payload = JSON.parse(atob((token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/')))
    return !!(payload?.pos?.isAdmin || payload?.isAdmin)
  } catch { return false }
})

const days = ref(7) // ช่วงเวลาสำหรับ recent
const loadingAll = ref(false)

const kpi = ref({ totalRequests: 0, approved: 0, pending: 0 })
const updatedAt = ref(null)

/* lists */
const pendingList = ref([])
const recentBookings = ref([])
const recentIssues = ref([])
const recentLoans = ref([])

const pendingListLoading = ref(false)
const recentBookingsLoading = ref(false)
const issuesLoading = ref(false)
const loansLoading = ref(false)

/* --------------------- HELPERS --------------------- */
const updatedAtText = computed(() => {
  if (!updatedAt.value) return '—'
  return new Date(updatedAt.value).toLocaleString()
})
function dateTH(iso) {
  const d = new Date(iso)
  const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`
}
function dateRange(s, e) {
  const o = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(s).toLocaleTimeString([],o)} - ${new Date(e).toLocaleTimeString([],o)} · ${dateTH(s)}`
}
function loanStatusTH(s) {
  switch (s) {
    case 'REQUESTED': return 'ขอยืม'
    case 'APPROVED': return 'อนุมัติยืม'
    case 'RETURNED': return 'คืนแล้ว'
    default: return s || '—'
  }
}

/* --------------------- API ENDPOINTS ---------------------
   ปรับ path ให้ตรง backend ของคุณได้เลย
---------------------------------------------------------- */
async function fetchMe() {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = { ...data, isAdmin: !!(data?.position?.isAdmin ?? data?.isAdmin) }
  } catch { me.value = null }
  finally { loadedMe.value = true }
}

async function fetchKPI() {
  // รวม KPI เบื้องต้นจากการนับ bookings
  const paramsBase = { page: 1, pageSize: 1 } // แค่ดึงรวม total ก็พอ (ถ้าหลังบ้านส่ง)
  const [pending, approved] = await Promise.all([
    api.get('/api/bookings', { params: { ...paramsBase, status: 'AWAITING_ADMIN_APPROVAL' } }),
    api.get('/api/bookings', { params: { ...paramsBase, status: 'APPROVED' } })
  ]).catch(()=>[null,null])

  const getTotal = (resp) => typeof resp?.data?.total === 'number' ? resp.data.total : (Array.isArray(resp?.data?.items) ? resp.data.items.length : 0)
  const p = getTotal(pending)
  const a = getTotal(approved)

  kpi.value = {
    totalRequests: p + a,
    approved: a,
    pending: p
  }
}

async function fetchPendingList() {
  pendingListLoading.value = true
  try {
    // รวมหลายสถานะที่ยังรอแอดมิน (เผื่อหลังบ้านใช้สถานะก่อนหน้า)
    const paramsBase = { page: 1, pageSize: 50, sort: '-createdAt' }
    const [r1, r2] = await Promise.all([
      api.get('/api/bookings', { params: { ...paramsBase, status: 'AWAITING_ADMIN_APPROVAL' } }),
      api.get('/api/bookings', { params: { ...paramsBase, status: 'AWAITING_ATTENDEE_CONFIRM' } })
    ])
    const list = [...(r1?.data?.items||[]), ...(r2?.data?.items||[])]
    const map = new Map(list.map(x => [x.id, x]))
    pendingList.value = Array.from(map.values())
      .sort((a,b) => Date.parse(b.createdAt||b.startTime||0) - Date.parse(a.createdAt||a.startTime||0))
      .slice(0, 10)
  } finally {
    pendingListLoading.value = false
  }
}

async function fetchRecentBookings() {
  recentBookingsLoading.value = true
  try {
    const since = new Date()
    since.setDate(since.getDate() - days.value)
    const { data } = await api.get('/api/bookings', {
      params: { page: 1, pageSize: 20, sort: '-createdAt', start_gte: since.toISOString() }
    })
    recentBookings.value = Array.isArray(data?.items) ? data.items.slice(0, 10) : []
  } finally { recentBookingsLoading.value = false }
}

async function fetchRecentIssues() {
  issuesLoading.value = true
  try {
    const since = new Date(); since.setDate(since.getDate() - days.value)
    const { data } = await api.get('/api/issues', {
      params: { page: 1, pageSize: 20, sort: '-createdAt', created_gte: since.toISOString() }
    })
    recentIssues.value = Array.isArray(data?.items) ? data.items.slice(0, 8) : []
  } finally { issuesLoading.value = false }
}

async function fetchRecentLoans() {
  loansLoading.value = true
  try {
    const since = new Date(); since.setDate(since.getDate() - days.value)
    const { data } = await api.get('/api/equip/loans', {
      params: { page: 1, pageSize: 20, sort: '-updatedAt', updated_gte: since.toISOString() }
    })
    recentLoans.value = Array.isArray(data?.items) ? data.items.slice(0, 8) : []
  } finally { loansLoading.value = false }
}

async function refreshAll() {
  loadingAll.value = true
  try {
    await Promise.all([
      fetchKPI(),
      fetchPendingList(),
      fetchRecentBookings(),
      fetchRecentIssues(),
      fetchRecentLoans()
    ])
    updatedAt.value = new Date().toISOString()
  } finally {
    loadingAll.value = false
  }
}

/* actions (อนุมัติ/ยกเลิก) */
async function approve(b) {
  await api.post(`/api/bookings/${b.id}/approve`)
  await Promise.all([fetchKPI(), fetchPendingList()])
}
async function cancel(b) {
  await api.patch(`/api/bookings/${b.id}/cancel`)
  await Promise.all([fetchKPI(), fetchPendingList()])
}

/* --------------------- LIFECYCLE --------------------- */
onMounted(async () => {
  await fetchMe()
  if (!isAdmin.value) {
    // กันเข้าหน้าได้เฉพาะแอดมิน
    router.replace('/')
    return
  }
  await refreshAll()
})
</script>

<!-- ============ tiny components ============ -->
<script lang="ts">
export default {}
</script>

<script setup name="KpiCard">
const props = defineProps<{ title: string; value: number|string; color: 'blue'|'green'|'amber' }>()
const colorClass = {
  blue:  'bg-blue-600 text-white',
  green: 'bg-green-500 text-white',
  amber: 'bg-amber-400 text-white'
}[props.color]
</script>

<template #KpiCard>
  <div class="rounded-xl overflow-hidden border">
    <div :class="['px-5 py-3 text-sm font-medium', colorClass]">{{ props.title }}</div>
    <div class="px-5 py-6 text-3xl font-semibold">{{ props.value ?? 0 }}</div>
  </div>
</template>

<script setup name="RowPlaceholder">
const props = defineProps<{ text: string }>()
</script>
<template #RowPlaceholder>
  <div class="px-4 py-6 text-center text-gray-500">{{ props.text }}</div>
</template>

<script setup name="SimpleRow">
const props = defineProps<{ title: string; subtitle?: string; meta?: string }>()
</script>
<template #SimpleRow>
  <div class="px-4 py-3 flex items-center justify-between">
    <div>
      <div class="font-medium">{{ props.title }}</div>
      <div v-if="props.subtitle" class="text-sm text-gray-600">{{ props.subtitle }}</div>
    </div>
    <div class="text-sm text-gray-500">{{ props.meta }}</div>
  </div>
</template>

<script setup name="AdminRow">
const emit = defineEmits(['approve','cancel'])
const props = defineProps<{ booking: any }>()
function trange(s,e){
  const o = { hour:'2-digit', minute:'2-digit' }
  return `${new Date(s).toLocaleTimeString([],o)} - ${new Date(e).toLocaleTimeString([],o)}`
}
function dateTH(iso){
  const d = new Date(iso); const m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`
}
</script>


<template #AdminRow>
  <div class="px-4 py-3 flex items-center gap-3">
    <div class="w-12 text-center">
      <div class="text-2xl leading-none font-semibold">{{ new Date(props.booking.startTime).getDate() }}</div>
      <div class="text-xs text-gray-500">{{ ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][new Date(props.booking.startTime).getMonth()] }}</div>
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-medium">{{ props.booking.room?.roomName || '-' }}</div>
      <div class="text-sm text-gray-600">
        เวลา {{ trange(props.booking.startTime, props.booking.endTime) }} · {{ dateTH(props.booking.startTime) }}
      </div>
      <div class="text-xs text-gray-500">ผู้จอง: {{ props.booking.bookedBy?.fullName || '-' }}</div>
    </div>
    <div class="flex items-center gap-2">
      <button class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
              @click="emit('approve')">อนุมัติ</button>
      <button class="px-3 py-1 rounded border border-amber-300 text-amber-700 hover:bg-amber-50"
              @click="emit('cancel')">ยกเลิก</button>
    </div>
  </div>
</template>
