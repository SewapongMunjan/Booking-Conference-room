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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const onLogin = async () => {
  errorMsg.value = ''
  if (!username.value || !password.value) return

  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || 'เข้าสู่ระบบไม่สำเร็จ')
    }

    const data = await res.json()
    // เก็บ token + user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // ไปหน้า home/rooms ตามที่มี
    router.push('/home') // หรือ '/rooms'
  } catch (e) {
    errorMsg.value = e.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
  } finally {
    loading.value = false
  }
}
</script>

<style>
/* Add any additional styles here */
</style>