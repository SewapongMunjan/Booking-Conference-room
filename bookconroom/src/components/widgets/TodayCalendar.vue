<!-- components/widgets/TodayCalendar.vue -->
<template>
  <div class="p-4">
    <div class="flex items-baseline gap-3 mb-3">
      <div class="text-5xl font-semibold text-blue-600">{{ day }}</div>
      <div>
        <div class="text-lg font-medium">{{ monthYearTH }}</div>
        <div class="text-xs text-gray-500">{{ weekdayTH }}</div>
      </div>
    </div>

    <div class="text-sm text-gray-600 mb-2">รายการประชุมวันนี้</div>
    <div v-if="loading" class="text-sm text-gray-500">กำลังโหลด…</div>
    <div v-else-if="items.length===0" class="text-sm text-gray-500">ไม่มีประชุมวันนี้</div>
    <ul v-else class="space-y-2">
      <li v-for="b in items" :key="b.id" class="flex items-center gap-3">
        <span class="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
          {{ timeRange(b.startTime,b.endTime) }}
        </span>
        <span class="font-medium">{{ b.room?.roomName || '-' }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/lib/api'

const items = ref([])
const loading = ref(true)

const now = new Date()
const start = new Date(now); start.setHours(0,0,0,0)
const end   = new Date(now); end.setHours(23,59,59,999)

const day = now.getDate()
const monthNames = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const weekdayNames = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.']
const monthYearTH = `${monthNames[now.getMonth()]} ${now.getFullYear()+543}`
const weekdayTH = `วัน${['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][now.getDay()]}`

function timeRange(s,e){
  const opt={hour:'2-digit',minute:'2-digit'}
  return `${new Date(s).toLocaleTimeString([],opt)}-${new Date(e).toLocaleTimeString([],opt)}`
}

onMounted(async ()=>{
  try {
    const { data } = await api.get('/api/bookings', {
      params: {
        start: start.toISOString(),
        end: end.toISOString(),
        page: 1, pageSize: 100, withInviteStats: 0
      }
    })
    items.value = Array.isArray(data?.items) ? data.items : []
  } finally { loading.value=false }
})
</script>
