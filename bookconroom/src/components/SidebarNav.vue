<template>
  <nav class="flex flex-col gap-2">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
      :class="isActive(item.to)
        ? 'bg-blue-600 text-white'
        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'"
    >
      <span class="text-lg">{{ item.icon }}</span>
      <span class="font-medium">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

const items = [
  { to: '/home',          label: 'หน้าแรก',              icon: '🏠' },
  { to: '/booking',       label: 'จองห้องประชุม',        icon: '📅' },
  { to: '/booking-list',  label: 'รายการจองของฉัน',      icon: '📋' },
  { to: '/room-use',      label: 'ตารางการใช้ห้องประชุม', icon: '🗂️' },
  { to: '/room-status',   label: 'สถานะห้องประชุม',       icon: 'ℹ️' },
  { to: '/report',        label: 'แจ้งปัญหา',             icon: '⚠️' },
  { to: '/admin/approvals',label:'อนุมัติการจอง (Admin)', icon: '🛡️' },
  { to: '/my-invites',    label: 'คำเชิญของฉัน',          icon: '📨' },
]

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>
