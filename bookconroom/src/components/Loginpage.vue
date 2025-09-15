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
              placeholder="เช่น 123XXXXX"
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
            class="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 rounded-lg transition-colors"
          >
            เข้าสู่ระบบ
          </button>
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

const router = useRouter()
const username = ref('')
const password = ref('')

const onLogin = async () => {
  if (username.value && password.value) {
    localStorage.setItem('token', 'demo') // set token
    router.push('/home') // go to home page
  }
}
</script>

<style>
/* Add any additional styles here */
</style>