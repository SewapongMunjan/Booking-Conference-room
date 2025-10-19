<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top bar -->
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center gap-3">
        <button class="lg:hidden p-2 rounded-md hover:bg-gray-100" @click="sidebarOpen = !sidebarOpen">
          <svg class="w-6 h-6" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h12M4 18h16"/></svg>
        </button>

        <h1 class="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard</h1>

        <div class="ml-auto flex items-center gap-3 w-full sm:w-auto">
          <div class="relative flex-1 sm:flex-none">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"/></svg>
            </span>
            <input v-model="q" placeholder="Search anything..."
                   class="w-full sm:w-72 pl-10 pr-3 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>

          <button class="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800" @click="goCreate">
            Create
          </button>

          <img :src="me?.avatarUrl || 'https://via.placeholder.com/40x40'"
               class="w-9 h-9 rounded-full border" alt="avatar">
          <button @click="logout" class="hidden sm:inline-block px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm">Logout</button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_320px] gap-6">
      <!-- Sidebar -->
      <aside
        :class="[
          'bg-white rounded-2xl border lg:static fixed inset-y-0 left-0 z-30 w-72 lg:w-auto transform lg:transform-none transition',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
      >
        <div class="p-4 border-b">
          <div class="font-semibold">ระบบจองห้องประชุม</div>
          <div class="text-xs text-gray-500">Admin Console</div>
        </div>
        <nav class="p-2">
          <RouterLink to="/admin/dashboard-modern" class="navitem-active">🏠 Dashboard</RouterLink>
          <RouterLink to="/admin/approvals" class="navitem">🛡️ Approvals</RouterLink>
          <RouterLink to="/admin/my-bookings" class="navitem">📋 My Bookings</RouterLink>
          <RouterLink to="/admin/issues" class="navitem">⚠️ Issues</RouterLink>
          <RouterLink to="/admin/loans" class="navitem">🔌 Loans</RouterLink>
          <RouterLink to="/admin/room-status" class="navitem">ℹ️ Room Status</RouterLink>
        </nav>
      </aside>

      <!-- Main -->
      <main class="space-y-6">
        <!-- Overview -->
        <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="card">
            <div class="text-sm text-gray-500">ทั้งหมด</div>
            <div class="mt-1 flex items-baseline gap-2">
              <div class="text-3xl font-semibold">{{ kpi.total }}</div>
              <span class="pill pill-gray">vs last period</span>
            </div>
          </div>
          <div class="card">
            <div class="text-sm text-gray-500">อนุมัติแล้ว</div>
            <div class="mt-1 flex items-baseline gap-2">
              <div class="text-3xl font-semibold text-green-600">{{ kpi.approved }}</div>
              <span class="pill pill-green">+{{ deltas.approved }}%</span>
            </div>
          </div>
          <div class="card">
            <div class="text-sm text-gray-500">รออนุมัติ</div>
            <div class="mt-1 flex items-baseline gap-2">
              <div class="text-3xl font-semibold text-amber-600">{{ kpi.pending }}</div>
              <span class="pill pill-amber">-{{ deltas.pending }}%</span>
            </div>
          </div>
        </section>

        <!-- Middle rows -->
        <section class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <!-- Product view -> Usage chart -->
          <div class="card p-0">
            <header class="px-5 py-4 border-b flex items-center justify-between">
              <div class="font-semibold">Usage (last 7 days)</div>
              <select v-model="days" class="text-sm border rounded px-2 py-1">
                <option :value="7">Last 7 days</option>
                <option :value="30">Last 30 days</option>
              </select>
            </header>
            <div class="p-5">
              <div class="h-40 flex items-end gap-2">
                <div
                  v-for="(v,i) in chartData"
                  :key="i"
                  class="flex-1 bg-blue-100 rounded-t-lg relative"
                  :style="{ height: Math.max(6, v.valuePct) + '%' }"
                  :title="`${v.label}: ${v.count}`"
                >
                  <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-600">{{ v.count }}</div>
                </div>
              </div>
              <div class="mt-2 grid grid-cols-7 text-[11px] text-gray-500">
                <div v-for="(v,i) in chartData" :key="'l'+i" class="text-center">{{ v.label }}</div>
              </div>
            </div>
          </div>

          <!-- Recent bookings list -->
          <div class="card p-0">
            <header class="px-5 py-4 border-b font-semibold">การจองล่าสุด</header>
            <ul class="divide-y">
              <li v-for="b in recentBookings" :key="b.id" class="px-5 py-3 flex items-center justify-between">
                <div>
                  <div class="font-medium">{{ b.room?.roomName || '-' }}</div>
                  <div class="text-xs text-gray-500">{{ timeRange(b.startTime,b.endTime) }} · {{ dateTH(b.startTime) }}</div>
                </div>
                <span class="text-xs px-2 py-1 rounded-full" :class="badge(b.status)">{{ statusTH(b.status) }}</span>
              </li>
              <li v-if="!recentBookings.length" class="px-5 py-6 text-sm text-gray-500">ไม่มีข้อมูล</li>
            </ul>
          </div>
        </section>
      </main>

      <!-- Right rail -->
      <aside class="space-y-6">
        <div class="card">
          <div class="font-semibold mb-3">ยอดนิยม (ห้อง)</div>
          <ul class="space-y-3">
            <li v-for="r in topRooms" :key="r.name" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-blue-50 border flex items-center justify-center">🏷️</div>
                <div>
                  <div class="font-medium">{{ r.name }}</div>
                  <div class="text-xs text-gray-500">{{ r.count }} ครั้ง</div>
                </div>
              </div>
              <span class="pill pill-green" v-if="r.active">Active</span>
              <span class="pill pill-gray" v-else>Offline</span>
            </li>
            <li v-if="!topRooms.length" class="text-sm text-gray-500">ไม่มีข้อมูล</li>
          </ul>
        </div>

        <RoomStatusSummary />
        <TodayCalendar />
        <div class="card">
          <div class="font-semibold mb-3">ประกาศ</div>
          <Announcements />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'
import TodayCalendar from '@/components/widgets/TodayCalendar.vue'
import RoomStatusSummary from '@/components/widgets/RoomStatusSummary.vue'
import Announcements from '@/components/widgets/Announcements.vue'

const router = useRouter()
const sidebarOpen = ref(false)
const q = ref('')
const days = ref(7)

const me = ref(null)
async function fetchMe() {
  try { me.value = (await api.get('/api/auth/me')).data } catch { me.value = null }
}
function logout(){ localStorage.removeItem('access_token'); localStorage.removeItem('user_role'); router.push('/login') }
function goCreate(){ router.push('/booking') }

/* KPIs */
const kpi = ref({ total: 0, approved: 0, pending: 0 })
const deltas = ref({ approved: 0, pending: 0 })

/* Lists/Chart */
const recentBookings = ref([])
const chartData = ref([])
const topRooms = ref([])

function statusTH(s){
  if (s==='APPROVED') return 'อนุมัติแล้ว'
  if (s==='AWAITING_ADMIN_APPROVAL') return 'รออนุมัติ'
  if (s==='AWAITING_ATTENDEE_CONFIRM') return 'รอยืนยัน'
  if (s==='CANCELLED') return 'ยกเลิกแล้ว'
  return s || '-'
}
function badge(s){
  if (s==='APPROVED') return 'bg-green-100 text-green-700'
  if (s==='AWAITING_ADMIN_APPROVAL') return 'bg-amber-100 text-amber-800'
  if (s==='AWAITING_ATTENDEE_CONFIRM') return 'bg-blue-100 text-blue-800'
  if (s==='CANCELLED') return 'bg-gray-200 text-gray-700'
  return 'bg-gray-100 text-gray-700'
}
function dateTH(iso){
  const d=new Date(iso); const m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`
}
function timeRange(s,e){
  const opt={hour:'2-digit',minute:'2-digit'}
  return `${new Date(s).toLocaleTimeString([],opt)} - ${new Date(e).toLocaleTimeString([],opt)}`
}

async function loadKPIs(){
  try{
    const params = { page:1, pageSize:1 }
    const [p, a] = await Promise.all([
      api.get('/api/bookings', { params: { ...params, status:'AWAITING_ADMIN_APPROVAL' } }),
      api.get('/api/bookings', { params: { ...params, status:'APPROVED' } })
    ])
    const getTotal = r => typeof r?.data?.total==='number' ? r.data.total : (Array.isArray(r?.data?.items)? r.data.items.length : 0)
    const pending = getTotal(p)
    const approved = getTotal(a)
    kpi.value = { total: pending + approved, approved, pending }
    deltas.value = { approved: 36, pending: 12 } // placeholder % trend
  }catch{ kpi.value={ total:0, approved:0, pending:0 } }
}

function groupByDate(items, daysBack){
  const map = new Map()
  for (let i=daysBack-1;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0)
    map.set(d.toISOString().slice(0,10), { date:d, count:0 })
  }
  items.forEach(b=>{
    const k=new Date(b.startTime); k.setHours(0,0,0,0)
    const key=k.toISOString().slice(0,10)
    if(map.has(key)) map.get(key).count++
  })
  const max = Math.max(1, ...Array.from(map.values()).map(v=>v.count))
  return Array.from(map.values()).map(v=>({
    label: v.date.toLocaleDateString('en-GB',{ weekday:'short' }),
    count: v.count,
    valuePct: Math.round((v.count/max)*100)
  }))
}

async function loadRecentAndChart(){
  const since = new Date(); since.setDate(since.getDate()-days.value)
  const { data } = await api.get('/api/bookings', {
    params: { page:1, pageSize:500, sort:'-createdAt', start_gte: since.toISOString() }
  })
  const list = Array.isArray(data?.items) ? data.items : []
  recentBookings.value = list.slice(0,8)
  chartData.value = groupByDate(list, Math.min(days.value, 7))

  // top rooms
  const roomMap = new Map()
  list.forEach(b=>{
    const name = b.room?.roomName || '-'
    roomMap.set(name, (roomMap.get(name)||0)+1)
  })
  topRooms.value = Array.from(roomMap.entries())
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5)
    .map(([name,count])=>({ name, count, active:true }))
}

onMounted(async ()=>{
  await fetchMe()
  await Promise.all([loadKPIs(), loadRecentAndChart()])
})
</script>

<style scoped>
.navitem {
  @apply block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100;
}
.navitem-active {
  @apply block px-4 py-2.5 rounded-xl text-sm bg-gray-900 text-white;
}
.card {
  @apply bg-white rounded-2xl border p-5;
}
.pill { @apply text-[11px] px-2 py-0.5 rounded-full border; }
.pill-green { @apply bg-green-50 text-green-700 border-green-200; }
.pill-amber { @apply bg-amber-50 text-amber-700 border-amber-200; }
.pill-gray { @apply bg-gray-50 text-gray-600 border-gray-200; }
</style>