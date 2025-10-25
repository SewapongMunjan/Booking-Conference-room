<template>
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link to="/note-taker/dashboard" class="nav-link">🏠 หน้าหลัก</router-link>
          <router-link to="/note-taker/my-queue" class="nav-link nav-active">📋 คิวของฉัน</router-link>
          <router-link to="/note-taker/leave-request" class="nav-link">🗓️ ลาล่วงหน้า</router-link>
          <router-link to="/note-taker/substitute" class="nav-link">🔁 จัดการแทนที่</router-link>
        </nav>

  <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
    <div class="h-full flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-xl shadow-md">📝</div>
          <div>
            <h3 class="font-semibold text-gray-900 text-sm">แดชบอร์ด NoteTaker</h3>
            <p class="text-[10px] text-gray-500">คอนโซลการจดบันทึก</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :class="['nav-link', isActive(item) ? 'nav-active' : '']"
        >
          <span class="text-lg" v-html="item.icon"></span>
          <span class="text-sm">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="p-3 border-t border-gray-200">
        <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
          <img :src="me?.avatarUrl || defaultAvatar" class="w-9 h-9 rounded-lg" />
          <div class="flex-1 min-w-0">
            <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'ผู้ใช้' }}</div>
            <div class="text-[10px] text-gray-500 truncate">{{ me?.email || '' }}</div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/lib/api.js'

const props = defineProps({ items: { type: Array, default: () => [] }, defaultAvatar: { type: String, default: 'https://cdn-icons-png.flaticon.com/128/456/456283.png' } })
const route = useRoute()
const me = ref(null)

function isActive(item){ return route.path === item.to || route.path.startsWith(item.to) }

async function loadMe(){
  try { const { data } = await api.get('/api/auth/me'); me.value = data } catch { const raw = localStorage.getItem('me'); if(raw) { try{ me.value = JSON.parse(raw) }catch{} }}
}
onMounted(loadMe)
</script>

<style scoped>
.nav-link { @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900; }
.nav-active { @apply bg-sky-50 text-sky-600; }
</style>