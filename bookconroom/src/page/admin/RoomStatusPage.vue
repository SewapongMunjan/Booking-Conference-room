<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold">สถานะห้อง</h1>
        <button @click="load" class="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">รีเฟรช</button>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
      <aside class="bg-white rounded-2xl border p-2">
        <RouterLink to="/admin/dashboard-modern" class="navitem">🏠 แดชบอร์ด</RouterLink>
        <RouterLink to="/admin/approvals" class="navitem">🛡️ อนุมัติ</RouterLink>
        <RouterLink to="/admin/my-bookings" class="navitem">📋 การจองของฉัน</RouterLink>
        <RouterLink to="/admin/issues" class="navitem">⚠️ แจ้งปัญหา</RouterLink>
        <RouterLink to="/admin/loans" class="navitem">🔌 ยืมอุปกรณ์</RouterLink>
        <RouterLink to="/admin/room-status" class="navitem-active">ℹ️ สถานะห้อง</RouterLink>
      </aside>

      <main class="space-y-6">
        <div class="card">
          <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="r in rooms" :key="r.id" class="p-4 rounded-xl border"
                 :class="r.status==='FREE'?'bg-green-50 border-green-200':'bg-rose-50 border-rose-200'">
              <div class="font-semibold">{{ r.name }}</div>
              <div class="text-xs text-gray-600">ชั้น {{ r.floor }} · {{ r.type }}</div>
              <div class="mt-2 text-sm" :class="r.status==='FREE'?'text-green-700':'text-rose-700'">
                {{ r.status==='FREE'?'ว่าง':'ไม่ว่าง' }}
              </div>
            </div>
            <div v-if="!rooms.length" class="text-gray-500 text-sm">ไม่มีข้อมูล</div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/lib/api.js'

const rooms = ref([])
async function load(){
  const { data } = await api.get('/api/rooms',{ params:{ page:1, pageSize:100 } })
  rooms.value = Array.isArray(data?.items)? data.items : []
}
onMounted(load)
</script>

<style scoped>
.navitem { @apply block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100; }
.navitem-active { @apply block px-4 py-2.5 rounded-xl text-sm bg-gray-900 text-white; }
.card { @apply bg-white rounded-2xl border; }
</style>