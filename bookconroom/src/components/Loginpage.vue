<template>
  <div class="min-h-screen flex">
    <!-- Left: Form -->
    <div class="w-full md:w-1/2 flex items-center justify-center px-8 md:px-16">
      <div class="w-full max-w-md">
        <h1 class="text-3xl font-semibold text-gray-900 mb-10">เข้าใช้งานระบบจองห้องประชุม</h1>

        <!-- prevent native submit + stop propagation; handle Enter at form level -->
        <form class="space-y-6" @submit.prevent.stop="onLogin" @keydown.enter.prevent>
           <div>
             <label for="username" class="block text-sm font-medium text-gray-700 mb-2">บัญชีผู้ใช้</label>
             <input
               v-model="username"
               type="text"
               id="username"
               name="username"
               aria-label="username"
               placeholder="เช่น admin หรือ it_support1"
               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               required
             />
           </div>

           <div>
             <label for="password" class="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน</label>
             <input
               v-model="password"
               type="password"
               id="password"
               name="password"
               aria-label="password"
               placeholder="รหัสผ่าน"
               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               required
             />
           </div>

           <!-- make this a plain button (no native submit) -->
           <button
             type="button"
             id="login-button"
             aria-label="login-button"
             :disabled="loading"
             @click="onLogin"
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
import Swal from 'sweetalert2'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const onLogin = async (e) => {
  if (e && e.preventDefault) e.preventDefault()
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await api.post('/api/auth/login', {
      username: username.value,
      password: password.value,
    })
    localStorage.setItem('access_token', data.token)
    if (data.user) localStorage.setItem('me', JSON.stringify(data.user))

    await Swal.fire({
      icon: 'success',
      title: 'เข้าสู่ระบบสำเร็จ',
      showConfirmButton: false,
      timer: 1500
    })
    router.push('/home')
  } catch (err) {
    // ensure only SPA error handling (no native navigation)
    errorMsg.value = err?.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ'
    await Swal.fire({
      icon: 'error',
      title: 'เข้าสู่ระบบไม่สำเร็จ',
      text: errorMsg.value,
      confirmButtonText: 'ตกลง'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style>
/* Add any additional styles here */
</style>