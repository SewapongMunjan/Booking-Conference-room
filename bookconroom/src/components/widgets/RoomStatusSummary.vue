<!-- components/widgets/RoomStatusSummary.vue -->
<template>
  <div class="p-4">
    <div class="text-sm text-gray-600 mb-3">สรุปสถานะภายใน 2 ชั่วโมงถัดไป</div>

    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-lg border p-4">
        <div class="text-xs text-gray-500">ห้องว่าง</div>
        <div class="text-3xl font-semibold text-green-600">{{ free }}</div>
      </div>
      <div class="rounded-lg border p-4">
        <div class="text-xs text-gray-500">ห้องไม่ว่าง</div>
        <div class="text-3xl font-semibold text-red-600">{{ busy }}</div>
      </div>
    </div>

    <div class="mt-4 text-xs text-gray-500">
      อัปเดต: {{ updatedAt ? new Date(updatedAt).toLocaleTimeString() : '—' }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/lib/api'

const free = ref(0)
const busy = ref(0)
const updatedAt = ref(null)

onMounted(async ()=>{
  const now=new Date()
  const end=new Date(now); end.setHours(now.getHours()+2, now.getMinutes(),0,0)

  // ดึงห้องทั้งหมด + บุ๊กกิ้งช่วงตอนนี้→2ชม.
  const [roomsRes, bookingsRes] = await Promise.all([
    api.get('/api/rooms', { params: { page:1, pageSize: 500 }}),
    api.get('/api/bookings', { params: { start: now.toISOString(), end: end.toISOString(), page:1, pageSize:1000 }})
  ])

  const rooms = roomsRes?.data?.items ?? []
  const bookings = bookingsRes?.data?.items ?? []

  const busySet = new Set(bookings.map(b => b.room?.id).filter(Boolean))
  busy.value = busySet.size
  free.value = Math.max(rooms.length - busy.value, 0)
  updatedAt.value = new Date().toISOString()
})
</script>
