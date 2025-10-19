<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold">การจองของฉัน (แอดมิน)</h1>
        <input v-model="q" placeholder="ค้นหาห้อง..." class="w-72 px-3 py-2 rounded-xl border text-sm" />
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
      <aside class="bg-white rounded-2xl border p-2">
        <RouterLink to="/admin/dashboard-modern" class="navitem">🏠 Dashboard</RouterLink>
        <RouterLink to="/admin/approvals" class="navitem">🛡️ Approvals</RouterLink>
        <RouterLink to="/admin/my-bookings" class="navitem-active">📋 My Bookings</RouterLink>
        <RouterLink to="/admin/issues" class="navitem">⚠️ Issues</RouterLink>
        <RouterLink to="/admin/loans" class="navitem">🔌 Loans</RouterLink>
        <RouterLink to="/admin/room-status" class="navitem">ℹ️ Room Status</RouterLink>
      </aside>

      <main class="bg-white rounded-2xl border p-4 overflow-auto">
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
.navitem { @apply block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100; }
.navitem-active { @apply block px-4 py-2.5 rounded-xl text-sm bg-gray-900 text-white; }
</style>