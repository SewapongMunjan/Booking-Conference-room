<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-4">
        <h1 class="text-xl font-semibold">จัดการแทนคนลา</h1>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-6">
      <NoteTakerNav />
      <main class="bg-white border rounded-2xl p-4 overflow-auto">
        <table class="min-w-full text-sm">
          <thead class="text-gray-600 bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left">ผู้ลา</th>
              <th class="px-4 py-3 text-left">ห้องประชุม</th>
              <th class="px-4 py-3 text-left">วันที่/เวลา</th>
              <th class="px-4 py-3 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="r in rows" :key="r.id">
              <td class="px-4 py-3">{{ r.user?.name || '-' }}</td>
              <td class="px-4 py-3">{{ r.meeting?.room?.roomName || '-' }}</td>
              <td class="px-4 py-3">{{ dateTH(r.meeting?.startTime) }} · {{ timeRange(r.meeting?.startTime, r.meeting?.endTime) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end">
                  <button class="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700" @click="openAssign(r)">แทนที่คนลา</button>
                </div>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="4" class="px-4 py-6 text-center text-gray-500">ไม่มีคำขอรอดำเนินการ</td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>

    <div v-if="modal.open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="modal.open=false"></div>
      <div class="absolute inset-x-0 top-16 mx-auto w-full max-w-lg bg-white border rounded-2xl p-5">
        <h3 class="font-semibold">เลือกคนแทน</h3>
        <input v-model="modal.q" class="mt-3 w-full border rounded-lg px-3 py-2 text-sm" placeholder="ค้นหารายชื่อ..." />
        <div class="mt-3 max-h-72 overflow-auto space-y-2">
          <label v-for="u in filteredUsers" :key="u.id" class="flex items-center gap-3 p-2 rounded-lg border hover:bg-gray-50">
            <input type="radio" name="taker" :value="u.id" v-model="modal.selected" />
            <span>{{ u.name }}</span>
          </label>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button class="px-3 py-1.5 rounded-lg border" @click="modal.open=false">ยกเลิก</button>
          <button class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white" @click="assign">บันทึก</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/lib/api.js'
import NoteTakerNav from './NoteTakerNav.vue'

const rows = ref([])
const users = ref([])
const modal = ref({ open:false, q:'', selected:null, record:null })

function dateTH(iso){ const d=new Date(iso); const m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}` }
function timeRange(s,e){ const o={hour:'2-digit',minute:'2-digit'}; return `${new Date(s).toLocaleTimeString([],o)} - ${new Date(e).toLocaleTimeString([],o)}` }

const filteredUsers = computed(()=>{
  const kw = modal.value.q.toLowerCase()
  return users.value.filter(u => (u.name||'').toLowerCase().includes(kw))
})
function openAssign(r){ modal.value={ open:true, q:'', selected:null, record:r } }

async function assign(){
  const r = modal.value.record
  if(!r || !modal.value.selected) return
  await api.post('/api/substitute', {
    meetingId: r.meeting?.id,
    oldTakerId: r.user?.id,
    newTakerId: modal.value.selected
  })
  modal.value.open=false
  await load()
}

async function load(){
  const [lp, up] = await Promise.all([
    api.get('/api/leaves/pending'),
    api.get('/api/note-takers', { params:{ active:1 } })
  ])
  rows.value = lp?.data?.items || []
  users.value = up?.data?.items || []
}
onMounted(load)
</script>