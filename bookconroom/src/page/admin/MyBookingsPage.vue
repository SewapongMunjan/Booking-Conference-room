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
          <router-link to="/admin/my-bookings" class="nav-link nav-active">
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
          <router-link to="/admin/room-status" class="nav-link">
            <span class="text-lg">ℹ️</span>
            <span class="text-sm">Room Status</span>
          </router-link>
          <router-link to="/admin/new-link" class="nav-link">
            <span class="text-lg">🔗</span>
            <span class="text-sm">New Link</span>
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
            <h2 class="text-lg font-semibold text-gray-900 m-0">My Bookings</h2>
            <p class="text-xs text-gray-500 m-0 hidden sm:block lg:hidden">การจองของฉัน</p>
          </div>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-3">
          <!-- Search -->
          <div class="hidden md:block relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </span>
            <input 
              v-model="q" 
              placeholder="ค้นหา..." 
              class="w-64 pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full min-h-[calc(100vh-5rem)] px-8 py-6 bg-white shadow-md rounded-lg">
        <div class="max-w-7xl mx-auto space-y-6">
          <!-- Page Header -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
              📋
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 m-0">My Bookings</h1>
              <p class="text-base text-gray-500 m-0 mt-1">จัดการการจองของคุณ</p>
            </div>
          </div>

          <!-- Bookings Table -->
          <div class="modern-card shadow-md">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-gray-600">
                <tr>
                  <th class="px-4 py-3 text-left">ห้อง</th>
                  <th class="px-4 py-3 text-left">วันที่</th>
                  <th class="px-4 py-3 text-left">เวลา</th>
                  <th class="px-4 py-3 text-left">สถานะ</th>
                  <th class="px-4 py-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="b in filtered" :key="b.id">
                  <td class="px-4 py-3">{{ b.room?.roomName || '-' }}</td>
                  <td class="px-4 py-3">{{ dateTH(b.startTime) }}</td>
                  <td class="px-4 py-3">{{ timeRange(b.startTime,b.endTime) }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs" :class="badge(b.status)">{{ statusTH(b.status) }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-2">
                      <button class="px-3 py-1.5 rounded-lg border" @click="view(b)">รายละเอียด</button>
                      <button class="px-3 py-1.5 rounded-lg bg-rose-600 text-white" v-if="canCancel(b)" @click="cancel(b)">ยกเลิก</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!loading && !filtered.length">
                  <td colspan="5" class="px-4 py-6 text-center text-gray-500">ไม่มีข้อมูล</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'

const router = useRouter()
const items = ref([])
const loading = ref(true)
const q = ref('')

function statusTH(s){ if(s==='APPROVED') return 'อนุมัติแล้ว'; if(s==='AWAITING_ADMIN_APPROVAL') return 'รออนุมัติ'; if(s==='CANCELLED') return 'ยกเลิกแล้ว'; return s||'-' }
function badge(s){ if(s==='APPROVED') return 'bg-green-100 text-green-700'; if(s==='AWAITING_ADMIN_APPROVAL') return 'bg-amber-100 text-amber-800'; if(s==='CANCELLED') return 'bg-gray-200 text-gray-700'; return 'bg-gray-100 text-gray-700' }
function dateTH(iso){ const d=new Date(iso); const m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}` }
function timeRange(s,e){ const o={hour:'2-digit',minute:'2-digit'}; return `${new Date(s).toLocaleTimeString([],o)} - ${new Date(e).toLocaleTimeString([],o)}` }
function canCancel(b){ return b.status!=='CANCELLED' }
function view(b){ router.push(`/booking-info/${b.id}`) }

const filtered = computed(()=>{
  const kw = q.value.toLowerCase()
  return items.value.filter(b => (b.room?.roomName||'').toLowerCase().includes(kw))
})

async function load(){
  loading.value = true
  try{
    const { data } = await api.get('/api/bookings', { params: { createdBy:'me', sort:'-startTime', page:1, pageSize:200 } })
    items.value = Array.isArray(data?.items) ? data.items : []
  } finally { loading.value = false }
}
async function cancel(b){
  await api.post(`/api/bookings/${b.id}/cancel`)
  await load()
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