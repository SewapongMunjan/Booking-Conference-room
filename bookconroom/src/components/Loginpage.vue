<template>
  <div class="min-h-screen flex">
    <!-- Left: Form -->
    <div class="w-full md:w-1/2 flex items-center justify-center px-8 md:px-16">
      <div class="w-full max-w-md">
        <h1 class="text-3xl font-semibold text-gray-900 mb-10">เข้าใช้งานระบบจองห้องประชุม</h1>

        <form class="space-y-6" @submit.prevent="onLogin">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">บัญชีผู้ใช้</label>
            <input
              v-model="username"
              type="text"
              placeholder="เช่น admin หรือ it_support1"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน</label>
            <input
              v-model="password"
              type="password"
              placeholder="รหัสผ่าน"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors"
          >
            <span v-if="!loading">เข้าสู่ระบบ</span>
            <span v-else>กำลังเข้าสู่ระบบ...</span>
          </button>

          <p v-if="errorMsg" class="text-red-600 text-sm">{{ errorMsg }}</p>
        </form>
      </div>
    </div>

    <!-- Right: Image -->
    <div class="hidden md:block md:w-1/2 relative">
      <img
        class="absolute inset-0 w-full h-full object-cover"
        src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1920&auto=format&fit=crop"
        alt="meeting room"
      />
      <div class="absolute inset-0 bg-blue-600/20"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'

const router = useRouter()
const username = ref('')
const password = ref('')

const onLogin = async () => {
  try {
    const { data } = await api.post('/api/auth/login', {
      username: username.value,
      password: password.value,
    })
    // ✅ ต้องเป็น key เดียวกับที่ api.js ใช้
    localStorage.setItem('access_token', data.token)

    // (ถ้ามีข้อมูล user) เก็บไว้ใช้ต่อ
    if (data.user) localStorage.setItem('me', JSON.stringify(data.user))

    router.push('/home')
  } catch (e) {
    alert(e?.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ')
  }
}
</script>

<style>
/* Add any additional styles here */
</style>