<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Fixed Left Sidebar - Hidden on mobile -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
      <div class="h-full flex flex-col">
        <!-- Logo Section -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl shadow-md">
              🏢
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">ระบบจองห้องประชุม</h3>
              <p class="text-[10px] text-gray-500">Admin Console</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link to="/admin/dashboard-modern" class="nav-link">
            <span class="text-lg">🏠</span>
            <span class="text-sm">Dashboard</span>
          </router-link>
          <router-link to="/admin/approvals" class="nav-link">
            <span class="text-lg">🛡️</span>
            <span class="text-sm">Approvals</span>
          </router-link>
          <router-link to="/admin/my-bookings" class="nav-link">
            <span class="text-lg">📋</span>
            <span class="text-sm">My Bookings</span>
          </router-link>
          <router-link to="/admin/issues" class="nav-link">
            <span class="text-lg">⚠️</span>
            <span class="text-sm">Issues</span>
          </router-link>
          <router-link to="/admin/loans" class="nav-link nav-active">
            <span class="text-lg">🔌</span>
            <span class="text-sm">Loans</span>
          </router-link>
          <router-link to="/admin/room-status" class="nav-link">
            <span class="text-lg">ℹ️</span>
            <span class="text-sm">Room Status</span>
          </router-link>
        </nav>

        <!-- Footer -->
        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'Admin' }}</div>
              <div class="text-[10px] text-gray-500 truncate">{{ me?.email || '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full min-h-[calc(100vh-5rem)] px-8 py-6 bg-white shadow-md rounded-lg">
        <div class="max-w-7xl mx-auto space-y-6">
          <!-- Page Header -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg">
              🏢
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 m-0">Loans</h1>
              <p class="text-base text-gray-500 m-0 mt-1">จัดการข้อมูลการยืม</p>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">📋</div>
                <div>
                  <div class="text-sm text-gray-500">ทั้งหมด</div>
                  <div class="text-2xl font-bold text-gray-900">{{ items.length }}</div>
                </div>
              </div>
            </div>

            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">⏳</div>
                <div>
                  <div class="text-sm text-gray-500">รออนุมัติ</div>
                  <div class="text-2xl font-bold text-amber-600">{{ items.filter(l => l.status === 'PENDING').length }}</div>
                </div>
              </div>
            </div>

            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">✅</div>
                <div>
                  <div class="text-sm text-gray-500">อนุมัติแล้ว</div>
                  <div class="text-2xl font-bold text-green-600">{{ items.filter(l => l.status === 'APPROVED').length }}</div>
                </div>
              </div>
            </div>

            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">🔄</div>
                <div>
                  <div class="text-sm text-gray-500">คืนแล้ว</div>
                  <div class="text-2xl font-bold text-purple-600">{{ items.filter(l => l.status === 'RETURNED').length }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="bg-white rounded-2xl border p-4 overflow-auto">
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
          </div>
        </div>
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
.nav-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900;
}
.nav-active {
  @apply bg-blue-50 text-blue-600;
}
</style>