<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-6 md:px-10 py-4 shadow-sm border-b">
      <div class="max-w-5xl mx-auto flex items-center gap-4">
        <button
          class="text-blue-600 hover:text-blue-800 text-2xl"
          @click="$router.back()"
          aria-label="back"
        >←</button>
        <h1 class="text-xl font-semibold text-gray-900 m-0">โปรไฟล์ผู้ใช้</h1>
      </div>
    </header>

    <!-- Body -->
    <main class="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <!-- โหลดข้อมูล -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-pulse text-gray-500">กำลังโหลดข้อมูล...</div>
      </div>

      <!-- ข้อผิดพลาด -->
      <div v-else-if="errorMsg" class="max-w-2xl mx-auto p-4 border rounded-xl bg-red-50 text-red-700">
        {{ errorMsg }}
      </div>

      <!-- โปรไฟล์ -->
      <div v-else class="max-w-3xl mx-auto">
        <!-- Avatar + Name -->
        <div class="flex flex-col items-center gap-4 mb-6">
          <img
            :src="me?.avatarUrl || defaultAvatar"
            class="w-24 h-24 rounded-full object-cover ring-2 ring-white shadow"
            alt="avatar"
          />
          <h2 class="text-2xl font-semibold text-gray-800 text-center">
            สวัสดี {{ me?.fullName || '-' }}
          </h2>
        </div>

        <!-- Card -->
        <div class="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b">
            <div class="text-blue-600 font-semibold">ข้อมูลส่วนตัว</div>
          </div>

          <div class="px-6 py-6">
            <dl class="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-5">
              <div class="sm:col-span-1">
                <dt class="text-xs text-blue-600">ชื่อ-นามสกุล</dt>
                <dd class="text-sm text-gray-800">{{ me?.fullName || '-' }}</dd>
              </div>

              <div class="sm:col-span-1">
                <dt class="text-xs text-blue-600">รหัสผู้ใช้</dt>
                <dd class="text-sm text-gray-800">{{ me?.username || me?.id || '-' }}</dd>
              </div>

              <div class="sm:col-span-1">
                <dt class="text-xs text-blue-600">อีเมล์</dt>
                <dd class="text-sm text-gray-800 break-all">{{ me?.email || '-' }}</dd>
              </div>

              <div class="sm:col-span-1">
                <dt class="text-xs text-blue-600">เบอร์โทรศัพท์</dt>
                <dd class="text-sm text-gray-800">{{ me?.phone || '-' }}</dd>
              </div>

              <div class="sm:col-span-1">
                <dt class="text-xs text-blue-600">แผนก</dt>
                <dd class="text-sm text-gray-800">
                  {{ me?.department?.name || me?.position?.department?.name || '-' }}
                </dd>
              </div>

              <div class="sm:col-span-1">
                <dt class="text-xs text-blue-600">ตำแหน่ง</dt>
                <dd class="text-sm text-gray-800">
                  {{ me?.position?.name || '-' }}
                  <span
                    v-if="me?.position?.isAdmin || me?.isAdmin"
                    class="ml-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
                  >Admin</span>
                </dd>
              </div>
            </dl>

            <!-- ปุ่ม -->
            <div class="mt-8">
              <button
                class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow"
                @click="logout"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import api from '@/lib/api.js'

const me = ref(null)
const loading = ref(true)
const errorMsg = ref('')
const defaultAvatar =
  'https://cdn-icons-png.flaticon.com/128/456/456283.png' // ไอคอน default เล็ก ๆ

async function fetchMe() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await api.get('/api/auth/me')
    // รองรับรูปแบบจาก backend ที่ให้ isAdmin ทั้งใน root และใน position
    me.value = {
      ...data,
      isAdmin: !!(data?.position?.isAdmin ?? data?.isAdmin),
    }
  } catch (e) {
    console.error(e)
    errorMsg.value = e?.response?.data?.error || 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ'
    // แจ้งเตือนสวย ๆ
    Swal.fire({
      icon: 'error',
      title: 'ผิดพลาด',
      text: errorMsg.value,
      confirmButtonText: 'ตกลง',
    })
  } finally {
    loading.value = false
  }
}

function logout() {
  Swal.fire({
    title: 'ออกจากระบบ?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'ออกจากระบบ',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#2563eb',
  }).then((r) => {
    if (!r.isConfirmed) return
    localStorage.removeItem('access_token')
    // เผื่อคุณใช้ state อื่น ๆ เช่น pinia/vuex ก็เคลียร์ตรงนี้ได้
    window.location.href = '/login'
  })
}

onMounted(fetchMe)
</script>
