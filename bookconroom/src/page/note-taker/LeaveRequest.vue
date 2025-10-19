<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b">
      <div class="max-w-5xl mx-auto px-4 lg:px-8 py-4">
        <h1 class="text-xl font-semibold">ลาล่วงหน้า (เฉพาะคนจดประชุม)</h1>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-4 lg:px-8 py-6 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
      <NoteTakerNav />

      <main class="space-y-6">
        <div class="bg-white border rounded-2xl p-5">
          <h3 class="font-semibold mb-4">แจ้งลา</h3>
          <div class="grid sm:grid-cols-3 gap-4">
            <input type="date" v-model="form.startDate" class="border rounded-lg px-3 py-2" />
            <input type="date" v-model="form.endDate" class="border rounded-lg px-3 py-2" />
            <input type="text" v-model="form.reason" placeholder="เหตุผลการลา" class="border rounded-lg px-3 py-2" />
          </div>
          <div class="mt-4 flex justify-end">
            <button @click="submit" class="px-4 py-2 rounded-lg text-white" style="background:#16a34a">บันทึกการลา</button>
          </div>
          <p v-if="warning" class="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
            ⚠ {{ warning }}
          </p>
        </div>

        <div class="bg-white border rounded-2xl p-5">
          <h3 class="font-semibold mb-4">ประวัติการลา</h3>
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-gray-600">
              <tr>
                <th class="px-4 py-3 text-left">ช่วงวันที่</th>
                <th class="px-4 py-3 text-left">เหตุผล</th>
                <th class="px-4 py-3 text-left">สถานะ</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="l in leaves" :key="l.id">
                <td class="px-4 py-3">{{ dateTH(l.startDate) }} - {{ dateTH(l.endDate) }}</td>
                <td class="px-4 py-3">{{ l.reason }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 text-xs rounded-full" :class="l.status==='APPROVED'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-800'">
                    {{ l.status==='APPROVED'?'อนุมัติแล้ว':'รออนุมัติ' }}
                  </span>
                </td>
              </tr>
              <tr v-if="!leaves.length">
                <td colspan="3" class="px-4 py-6 text-center text-gray-500">ไม่มีข้อมูล</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/lib/api.js'
import NoteTakerNav from './NoteTakerNav.vue'

const form = ref({ startDate:'', endDate:'', reason:'' })
const leaves = ref([])
const myQueue = ref([])
const warning = ref('')

function dateTH(iso){ const d=new Date(iso); const m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}` }

async function submit(){
  await api.post('/api/leaves', form.value)
  form.value={ startDate:'', endDate:'', reason:'' }
  await Promise.all([loadLeaves(), loadQueue()])
  warning.value=''
}
async function loadLeaves(){ const { data } = await api.get('/api/leaves', { params:{ mine:1, sort:'-startDate' } }); leaves.value = data?.items||[] }
async function loadQueue(){ const { data } = await api.get('/api/bookings', { params:{ noteTaker:'me' } }); myQueue.value = data?.items||[] }

function checkOverlap(){
  warning.value = ''
  if(!form.value.startDate || !form.value.endDate) return
  const s = new Date(form.value.startDate), e = new Date(form.value.endDate)
  const conflict = myQueue.value.find(m => {
    const ms = new Date(m.startTime), me = new Date(m.endTime)
    return ms <= e && me >= s
  })
  if(conflict){
    warning.value = `ห้องประชุม ${conflict.room?.roomName||'-'} วันที่ ${dateTH(conflict.startTime)} ต้องมีคนแทน`
  }
}
watch(form, checkOverlap, { deep:true })

onMounted(async ()=>{ await Promise.all([loadLeaves(), loadQueue()]) })
</script>