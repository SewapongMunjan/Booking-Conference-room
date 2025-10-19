<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center gap-3">
        <h1 class="text-xl font-semibold">หน้าหลัก</h1>
        <div class="ml-auto relative">
          <input v-model="q" placeholder="ค้นหาห้อง / ผู้จอง..." class="w-72 pl-3 pr-10 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <span class="absolute right-3 top-2.5 text-gray-400">⌕</span>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-6">
      <NoteTakerNav />

      <main>
        <div v-if="loading" class="flex justify-center py-12 text-gray-500">กำลังโหลดรายการ...</div>
        <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article v-for="m in filtered" :key="m.id" class="bg-white border rounded-2xl p-5 flex flex-col">
            <div class="flex items-start justify-between">
              <div class="font-semibold">{{ m.room?.roomName || m.title || 'ห้องประชุม' }}</div>
              <span class="px-2 py-0.5 text-xs rounded-full" :class="badge(m.status)">{{ statusTH(m.status) }}</span>
            </div>
            <div class="text-sm text-gray-600 mt-2">
              {{ dateTH(m.startTime) }} · {{ timeRange(m.startTime, m.endTime) }}
            </div>
            <div class="text-sm text-gray-600 mt-1">
              ผู้จอง: {{ m.requester?.name || '-' }} <span v-if="m.requester?.dept">· {{ m.requester.dept }}</span>
            </div>
            <div class="text-sm text-gray-600 mt-1">
              คนจดประชุม: <span v-if="(m.noteTakers||[]).length">{{ (m.noteTakers||[]).map(n=>n.name).join(', ') }}</span><span v-else>-</span>
            </div>

            <div class="mt-4 flex gap-2">
              <button class="flex-1 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50" @click="view(m)">ดูรายละเอียด</button>
              <button class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700" @click="start(m)" v-if="canStart(m)">เริ่มจดประชุม</button>
              <button class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700" @click="sendReport(m)" v-if="canReport(m)">ส่งรายงาน</button>
            </div>
          </article>

          <div v-if="!filtered.length" class="text-gray-500 sm:col-span-2 xl:col-span-3 text-sm">ไม่มีรายการ</div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'
import NoteTakerNav from './NoteTakerNav.vue'

const router = useRouter()
const loading = ref(true)
const q = ref('')
const items = ref([])

const filtered = computed(() => {
  if (!q.value) return items.value
  const kw = q.value.toLowerCase()
  return items.value.filter(m =>
    (m.room?.roomName||'').toLowerCase().includes(kw) ||
    (m.requester?.name||'').toLowerCase().includes(kw)
  )
})

function statusTH(s){ if(s==='IN_PROGRESS') return 'กำลังจด'; if(s==='DONE') return 'ส่งรายงานแล้ว'; return 'รอเริ่ม' }
function badge(s){ if(s==='IN_PROGRESS') return 'bg-green-100 text-green-700'; if(s==='DONE') return 'bg-gray-200 text-gray-700'; return 'bg-amber-100 text-amber-800' }
function dateTH(iso){ const d=new Date(iso); const m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}` }
function timeRange(s,e){ const o={hour:'2-digit',minute:'2-digit'}; return `${new Date(s).toLocaleTimeString([],o)} - ${new Date(e).toLocaleTimeString([],o)}` }
function canStart(m){ return m.status!=='DONE' }
function canReport(m){ return m.status==='IN_PROGRESS' }

function view(m){ router.push(`/booking-info/${m.id}`) }
function start(m){ router.push({ path: '/note-taker/my-queue', query: { focusId: m.id, openForm: 1 } }) }
function sendReport(m){ router.push({ path: '/note-taker/my-queue', query: { focusId: m.id, viewReport: 1 } }) }

onMounted(async () => {
  try{
    const { data } = await api.get('/api/bookings', { params: { sort:'nearest' } })
    items.value = Array.isArray(data?.items) ? data.items : []
  } finally { loading.value=false }
})
</script>