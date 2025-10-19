<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold">คิวจดประชุมของฉัน</h1>
        <input v-model="q" placeholder="ค้นหา..." class="w-64 px-3 py-2 rounded-xl border text-sm" />
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-6">
      <NoteTakerNav />
      <main class="bg-white border rounded-2xl p-4 overflow-auto">
        <table class="min-w-full text-sm">
          <thead class="text-gray-600 bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left">ห้อง</th>
              <th class="px-4 py-3 text-left">วันที่</th>
              <th class="px-4 py-3 text-left">เวลา</th>
              <th class="px-4 py-3 text-left">สถานะ</th>
              <th class="px-4 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="m in filtered" :key="m.id">
              <td class="px-4 py-3">{{ m.room?.roomName || '-' }}</td>
              <td class="px-4 py-3">{{ dateTH(m.startTime) }}</td>
              <td class="px-4 py-3">{{ timeRange(m.startTime,m.endTime) }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs" :class="badge(m.status)">{{ statusTH(m.status) }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button class="px-3 py-1.5 rounded-lg border hover:bg-gray-50" @click="openFormFor(m)">เปิดแบบฟอร์ม</button>
                  <button class="px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800" @click="viewReport(m)">ดูรายงาน</button>
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

    <!-- Drawer -->
    <div v-if="showForm" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="showForm=false"></div>
      <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l p-6">
        <h3 class="font-semibold mb-4">แบบฟอร์มจดประชุม</h3>
        <div class="space-y-3">
          <input v-model="form.topic" class="w-full border rounded-lg px-3 py-2" placeholder="หัวข้อสำคัญ" />
          <textarea v-model="form.summary" rows="6" class="w-full border rounded-lg px-3 py-2" placeholder="สรุปการประชุม"></textarea>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button class="px-3 py-1.5 rounded-lg border" @click="showForm=false">ปิด</button>
          <button class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white" @click="saveReport">บันทึก</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/lib/api.js'
import NoteTakerNav from './NoteTakerNav.vue'

const route = useRoute()
const q = ref('')
const loading = ref(true)
const items = ref([])

const showForm = ref(false)
const current = ref(null)
const form = ref({ topic:'', summary:'' })

const filtered = computed(()=>{
  const kw = q.value.toLowerCase()
  return items.value.filter(m => (m.room?.roomName||'').toLowerCase().includes(kw))
})

function statusTH(s){ if(s==='IN_PROGRESS') return 'กำลังจด'; if(s==='DONE') return 'เสร็จสิ้น'; return 'รอเริ่ม' }
function badge(s){ if(s==='IN_PROGRESS') return 'bg-green-100 text-green-700'; if(s==='DONE') return 'bg-blue-100 text-blue-700'; return 'bg-amber-100 text-amber-800' }
function dateTH(iso){ const d=new Date(iso); const m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}` }
function timeRange(s,e){ const o={hour:'2-digit',minute:'2-digit'}; return `${new Date(s).toLocaleTimeString([],o)} - ${new Date(e).toLocaleTimeString([],o)}` }

function openFormFor(m){ current.value=m; showForm.value=true }
function viewReport(m){ openFormFor(m) }

async function saveReport(){
  if(!current.value) return
  await api.post(`/api/bookings/${current.value.id}/notes`, form.value)
  showForm.value=false
  await load()
}

async function load(){
  loading.value=true
  try{
    const { data } = await api.get('/api/bookings', { params: { noteTaker: 'me' } })
    items.value = Array.isArray(data?.items) ? data.items : []
    if(route.query.focusId){
      const m = items.value.find(x => String(x.id)===String(route.query.focusId))
      if(m && (route.query.openForm || route.query.viewReport)) openFormFor(m)
    }
  } finally { loading.value=false }
}
onMounted(load)
</script>