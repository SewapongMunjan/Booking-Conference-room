<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Left: Form -->
    <div class="w-full md:w-1/2 flex items-center justify-center px-8 md:px-16 py-12">
      <div class="w-full max-w-sm">
        <h1 class="text-2xl font-semibold text-center text-blue-700 mb-8">
          เข้าใช้งานระบบจองห้องประชุม
        </h1>

        <form @submit.prevent="onLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">บัญชีผู้ใช้</label>
            <input
              v-model="username"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="username"
              autocomplete="username"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">รหัสผ่าน</label>
            <input
              v-model="password"
              type="password"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
          </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-2.5 rounded-lg bg-blue-900 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <span v-if="!loading">เข้าสู่ระบบ</span>
              <span v-else>กำลังเข้าสู่ระบบ...</span>
            </button>

          <p v-if="formError" class="text-xs text-red-600 text-center">{{ formError }}</p>
        </form>
      </div>
    </div>

    <!-- Right: Image -->
    <div class="hidden md:block md:w-1/2 relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1598300053654-0b1393a9austin?auto=format&fit=crop&w=1400&q=60"
        class="w-full h-full object-cover"
        alt="Meeting Room"
      />
      <div class="absolute inset-0 bg-blue-900/20 backdrop-blur-[1px]"></div>
    </div>

    <!-- Popup Overlay -->
    <transition name="fade">
      <div v-if="notice.show" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-black/40"></div>

        <!-- Card -->
        <div
          :class="[
            'relative w-full max-w-xs rounded-2xl shadow-lg px-6 pt-8 pb-6 bg-white text-center z-10',
            notice.type==='success' ? 'border border-emerald-300' : 'border border-rose-300'
          ]"
        >
          <!-- Confetti (success) -->
          <div
            v-if="notice.type==='success'"
            class="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          >
            <div
              v-for="n in 14"
              :key="n"
              class="absolute w-1.5 h-1.5 bg-emerald-400/70 rounded-sm animate-confetti"
              :style="{
                top: Math.random()*100 + '%',
                left: Math.random()*100 + '%',
                animationDelay: (Math.random()*1.2)+'s'
              }"
            ></div>
          </div>

          <!-- Icon -->
          <div class="mb-4 flex justify-center">
            <div
              :class="[
                'w-16 h-16 rounded-full flex items-center justify-center',
                notice.type==='success'
                  ? 'bg-emerald-50 text-emerald-500 border border-emerald-200'
                  : 'bg-rose-50 text-rose-500 border border-rose-200'
              ]"
            >
              <svg v-if="notice.type==='success'" class="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <svg v-else class="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
          </div>

          <h3
            :class="[
              'text-lg font-semibold tracking-wide',
              notice.type==='success' ? 'text-emerald-600' : 'text-rose-600'
            ]"
          >{{ notice.title }}</h3>
          <p class="text-xs text-gray-600 mt-2 leading-relaxed">
            {{ notice.message }}
          </p>

          <div class="mt-6">
            <button
              v-if="notice.type==='success'"
              @click="closeNoticeAndContinue"
              class="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-sm transition"
            >
              DONE
            </button>
            <button
              v-else
              @click="notice.show=false"
              class="w-full py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium shadow-sm transition"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'

const router   = useRouter()
const username = ref('')
const password = ref('')
const loading  = ref(false)
const formError = ref('')

const notice = ref({
  show: false,
  type: 'success', // success | error
  title: '',
  message: ''
})

function showNotice (type, title, message) {
  notice.value = { show: true, type, title, message }
}

function closeNoticeAndContinue () {
  notice.value.show = false
  if (notice.value.type === 'success') {
    router.push('/home')
  }
}

const onLogin = async () => {
  formError.value = ''
  if (!username.value || !password.value) {
    formError.value = 'กรุณากรอกข้อมูลให้ครบ'
    showNotice('error','OH NO...','กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
    return
  }
  loading.value = true
  try {
    const { data } = await api.post('/api/auth/login', {
      username: username.value,
      password: password.value
    })

    // token key (ensure consistent with api.js)
    localStorage.setItem('access_token', data.token)

    showNotice('success','SUCCESS!','เข้าสู่ระบบสำเร็จ กำลังพาไปยังหน้าแรก')
    // Auto redirect after short delay (optional)
    setTimeout(()=>{
      if (notice.value.show && notice.value.type==='success') closeNoticeAndContinue()
    }, 1200)
  } catch (e) {
    showNotice('error','OH NO...','ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้ง')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity .25s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

@keyframes confetti-fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: translateY(140px) rotate(360deg); opacity: 0; }
}
.animate-confetti {
  animation: confetti-fall 2.8s linear infinite;
}
</style>