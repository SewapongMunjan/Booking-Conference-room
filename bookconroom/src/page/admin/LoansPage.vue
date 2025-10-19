<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold">ยืมอุปกรณ์</h1>
        <input v-model="q" placeholder="ค้นหาอุปกรณ์/ผู้ยืม..." class="w-72 px-3 py-2 rounded-xl border text-sm" />
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
      <aside class="bg-white rounded-2xl border p-2">
        <RouterLink to="/admin/dashboard-modern" class="navitem">🏠 Dashboard</RouterLink>
        <RouterLink to="/admin/approvals" class="navitem">🛡️ Approvals</RouterLink>
        <RouterLink to="/admin/my-bookings" class="navitem">📋 My Bookings</RouterLink>
        <RouterLink to="/admin/issues" class="navitem">⚠️ Issues</RouterLink>
        <RouterLink to="/admin/loans" class="navitem-active">🔌 Loans</RouterLink>
        <RouterLink to="/admin/room-status" class="navitem">ℹ️ Room Status</RouterLink>
      </aside>

      <main class="bg-white rounded-2xl border p-4 overflow-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="px-4 py-3 text-left">อุปกรณ์</th>
              <th class="px-4 py-3 text-left">ผู้ยืม</th>
              <th class="px-4 py-3 text-left">วันที่ยืม</th>
              <th class="px-4 py-3 text-left">สถานะ</th>
              <th class="px-4 py-3 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="l in filtered" :key="l.id">
              <td class="px-4 py-3">{{ l.item?.name || '-' }}</td>
              <td class="px-4 py-3">{{ l.borrower?.name || '-' }}</td>
              <td class="px-4 py-3">{{ dateTH(l.borrowedAt) }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs" :class="l.status==='APPROVED'?'bg-green-100 text-green-700':(l.status==='PENDING'?'bg-amber-100 text-amber-800':'bg-blue-100 text-blue-700')">
                  {{ l.status==='RETURNED'?'คืนแล้ว':(l.status==='APPROVED'?'อนุมัติแล้ว':'รออนุมัติ') }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button v-if="l.status==='PENDING'" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white" @click="approve(l)">อนุมัติ</button>
                  <button v-if="l.status!=='RETURNED'" class="px-3 py-1.5 rounded-lg bg-gray-900 text-white" @click="markReturn(l)">รับคืน</button>
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
import api from '@/lib/api.js'

const items = ref([])
const q = ref('')
const loading = ref(true)

function dateTH(iso){ if(!iso) return '-'; const d=new Date(iso); const m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}` }

const filtered = computed(()=>{
  const kw = q.value.toLowerCase()
  return items.value.filter(l => (l.item?.name||'').toLowerCase().includes(kw) || (l.borrower?.name||'').toLowerCase().includes(kw))
})

async function load(){
  loading.value=true
  try{
    const { data } = await api.get('/api/loans', { params: { sort:'-borrowedAt', page:1, pageSize:200 } })
    items.value = Array.isArray(data?.items) ? data.items : []
  } finally { loading.value=false }
}

async function approve(l){ await api.post(`/api/loans/${l.id}/approve`); await load() }
async function markReturn(l){ await api.post(`/api/loans/${l.id}/return`); await load() }

onMounted(load)
</script>

<style scoped>
.navitem { @apply block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100; }
.navitem-active { @apply block px-4 py-2.5 rounded-xl text-sm bg-gray-900 text-white; }
</style>