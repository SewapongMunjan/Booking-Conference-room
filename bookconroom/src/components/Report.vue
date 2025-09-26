<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Mobile Menu Button -->
    <div class="lg:hidden bg-white px-4 py-3 shadow-sm border-b">
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="p-2 rounded-md text-gray-600 hover:bg-gray-100"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>

    <!-- Header -->
    <header class="bg-white px-4 lg:px-8 py-4 shadow-sm border-b">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h2 class="text-lg font-semibold text-blue-600 m-0">ระบบจองห้องประชุม</h2>
          <p class="text-sm text-gray-600 m-0">Meeting Room Booking System</p>
        </div>
        <div class="hidden lg:flex flex-1 max-w-2xl mx-8"></div>
        <div class="flex items-center gap-3">
          <button
            @click="logout"
            class="hidden lg:inline-block px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 text-sm"
          >ออกจากระบบ</button>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar Overlay for Mobile -->
      <div
        v-if="sidebarOpen"
        @click="sidebarOpen = false"
        class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      ></div>

      <!-- Sidebar -->
      <aside
        :class="[
          'fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg lg:shadow-sm transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <div class="h-full flex flex-col">
          <!-- Mobile close -->
          <div class="lg:hidden p-4 border-b flex justify-between items-center">
            <span class="font-semibold text-blue-600">เมนู</span>
            <button @click="sidebarOpen = false" class="p-2 rounded-md hover:bg-gray-100 text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <!-- Nav -->
            <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
              <router-link to="/" class="nav-link">🏠 <span>หน้าแรก</span></router-link>
              <router-link to="/booking" class="nav-link">📅 <span>จองห้องประชุม</span></router-link>
              <router-link to="/booking-list" class="nav-link">📋 <span>รายการจองของฉัน</span></router-link>
              <router-link to="/room-use" class="nav-link">🗂️ <span>ตารางการใช้ห้อง</span></router-link>
              <router-link to="/room-status" class="nav-link">ℹ️ <span>สถานะห้องประชุม</span></router-link>
              <router-link to="/report" class="nav-link-active">⚠️ <span>แจ้งปัญหา</span></router-link>
              <router-link to="/admin-approvals" class="nav-link">✅ <span>อนุมัติ</span></router-link>
              <router-link to="/my-invites" class="nav-link">✉️ <span>คำเชิญ</span></router-link>
            </nav>
          <!-- Mobile logout -->
          <div class="lg:hidden p-4 border-t">
            <button
              @click="logout"
              class="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
            >ออกจากระบบ</button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col gap-6">
        <!-- Page Header -->
        <div class="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div class="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-blue-600 m-0">แจ้งปัญหา</h1>
            <p class="text-gray-600 text-sm m-0">ระบบจองห้องประชุม</p>
          </div>
        </div>

        <!-- Report Form -->
        <div class="bg-white rounded-xl shadow-sm p-8 max-w-2xl">
          <form class="flex flex-col gap-8">
            <!-- หัวข้อ -->
            <div>
              <h2 class="text-lg font-semibold text-blue-600 mb-4">หัวข้อ</h2>
              <div class="flex flex-col gap-3">
                <label class="flex items-center gap-3">
                  <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">ปัญหาการเลือกอุปกรณ์เสริมไม่ได้</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">ปัญหาการยืนยันการเข้าร่วมประชุม</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">ปัญหาการสร้างเอกสารยืนยันการจองประชุม</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">ปัญหาการอนุมัติการจองห้องประชุม</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">ปัญหาการขอใช้บริการฝ่ายสนับสนุน</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">อื่นๆ</span>
                </label>
              </div>
            </div>
            <!-- รายละเอียด -->
            <div>
              <h2 class="text-lg font-semibold text-blue-600 mb-4">รายละเอียด</h2>
              <textarea 
                rows="5"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                placeholder="เพิ่มรายละเอียด..."
              ></textarea>
            </div>
            <!-- Submit Button -->
            <div class="flex justify-end">
              <button 
                type="submit"
                class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>✔️</span>
                ส่ง
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const sidebarOpen = ref(false)
const router = useRouter()

function logout() {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200 transition;
}
.nav-link-active {
  @apply flex items-center gap-3 px-4 py-3 rounded-lg text-white bg-blue-600 font-medium;
}
</style>