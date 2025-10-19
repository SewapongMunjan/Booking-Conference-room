<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold">ปัญหาและแจ้งซ่อม</h1>
        <input v-model="q" placeholder="ค้นหาห้อง/หัวข้อ..." class="w-72 px-3 py-2 rounded-xl border text-sm" />
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
      <aside class="bg-white rounded-2xl border p-2">
        <RouterLink to="/admin/dashboard-modern" class="navitem">🏠 Dashboard</RouterLink>
        <RouterLink to="/admin/approvals" class="navitem">🛡️ Approvals</RouterLink>
        <RouterLink to="/admin/my-bookings" class="navitem">📋 My Bookings</RouterLink>
        <RouterLink to="/admin/issues" class="navitem-active">⚠️ Issues</RouterLink>
        <RouterLink to="/admin/loans" class="navitem">🔌 Loans</RouterLink>
        <RouterLink to="/admin/room-status" class="navitem">ℹ️ Room Status</RouterLink>
      </aside>

      <main class="bg-white rounded-2xl border p-4 overflow-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="px-4 py-3 text-left">ห้อง</th>
              <th class="px-4 py-3 text-left">หัวข้อ</th>
              <th class="px-4 py-3 text-left">สถานะ</th>
              <th class="px-4 py-3 text-left">วันที่</th>
              <th class="px-4 py-3 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="i in filtered" :key="i.id">
              <td class="px-4 py-3">{{ i.room?.roomName || '-' }}</td>
              <td class="px-4 py-3">{{ i.title || '-' }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs" :class="i.status==='RESOLVED'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-800'">
                  {{ i.status==='RESOLVED'?'แก้ไขแล้ว':'รอดำเนินการ' }}
                </span>
              </td>
              <td class="px-4 py-3">{{ dateTH(i.createdAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button class="px-3 py-1.5 rounded-lg border" @click="view(i)">รายละเอียด</button>
                  <button v-if="i.status!=='RESOLVED'" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white" @click="resolve(i)">ปิดงาน</button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !filtered.length">
              <td colspan="5" class="px-4 py-6 text-center text-gray-500">ไม่มีรายการ</td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/lib/api.js'

const items = ref([])
const q = ref('')
const loading = ref(true)

const filtered = computed(()=>{
  const kw = q.value.toLowerCase()
  return items.value.filter(i => (i.room?.roomName||'').toLowerCase().includes(kw) || (i.title||'').toLowerCase().includes(kw))
})
function dateTH(iso){ if(!iso) return '-'; const d=new Date(iso); const m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}` }
function view(i){ /* future: drawer/modal */ }

async function load(){
  loading.value=true
  try{
    const { data } = await api.get('/api/issues', { params: { sort:'-createdAt', page:1, pageSize:200 } })
    items.value = Array.isArray(data?.items) ? data.items : []
  } finally { loading.value=false }
}
async function resolve(i){
  await api.post(`/api/issues/${i.id}/resolve`)
  await load()
}
onMounted(load)
</script>

<style scoped>
.navitem { @apply block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100; }
.navitem-active { @apply block px-4 py-2.5 rounded-xl text-sm bg-gray-900 text-white; }
</style>