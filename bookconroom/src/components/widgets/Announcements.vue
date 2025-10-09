<!-- components/widgets/Announcements.vue -->
<template>
  <div class="p-4">
    <div v-if="loading" class="text-sm text-gray-500">กำลังโหลด…</div>
    <div v-else-if="items.length===0" class="text-sm text-gray-500">ยังไม่มีประกาศ</div>
    <ul v-else class="space-y-3">
      <li v-for="a in items" :key="a.id" class="rounded-lg border p-3 hover:bg-gray-50">
        <div class="font-medium">{{ a.title }}</div>
        <div class="text-sm text-gray-600 line-clamp-2">{{ a.summary || a.content }}</div>
        <div class="text-xs text-gray-400 mt-1">
          {{ new Date(a.createdAt).toLocaleDateString() }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/lib/api'

const items = ref([])
const loading = ref(true)

onMounted(async ()=>{
  try {
    const { data } = await api.get('/api/announcements', { params: { page:1, pageSize:5, sort:'-createdAt' } })
    items.value = Array.isArray(data?.items) ? data.items : []
  } catch {
    // ถ้ายังไม่มี API ใช้ mock ไปก่อน
    items.value = [
      { id:1, title:'ปิดระบบเสาร์นี้ 20:00-22:00', content:'ปรับปรุงฐานข้อมูล', createdAt: new Date() },
      { id:2, title:'เพิ่มฟีเจอร์แจ้งเตือน', content:'กดกระดิ่งมุมขวาบน', createdAt: new Date() },
    ]
  } finally { loading.value=false }
})
</script>
