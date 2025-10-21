<template>
  <nav class="bg-white border rounded-2xl p-2">
    <RouterLink to="/note-taker" class="navitem" :class="isActive('/note-taker')">🏠 หน้าหลัก</RouterLink>
    <RouterLink to="/note-taker/my-queue" class="navitem" :class="isActive('/note-taker/my-queue')">🗒 คิวของฉัน</RouterLink>
    <RouterLink to="/note-taker/leave" class="navitem" :class="isActive('/note-taker/leave')">📅 ลาล่วงหน้า</RouterLink>
    <RouterLink to="/note-taker/substitute" class="navitem" :class="isActive('/note-taker/substitute')">🔁 จัดการแทนที่</RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const isActive = (p) => route.path === p ? 'bg-gray-900 text-white' : ''
</script>

<style scoped>
.navitem { @apply block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 mb-1; }
</style>