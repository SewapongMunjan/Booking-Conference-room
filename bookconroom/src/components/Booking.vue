<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-8 py-4 shadow-sm border-b">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="logo-section">
          <h2 class="text-lg font-semibold text-gray-900 m-0">ระบบจองห้องประชุม</h2>
          <p class="text-sm text-gray-600 m-0">Meeting Room Booking System</p>
        </div>
        <div class="flex flex-1 max-w-2xl mx-8">
          <input 
            type="text" 
            placeholder="ค้นหา..." 
            class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-l-full outline-none text-gray-900 focus:border-blue-500"
          >
          <button class="bg-blue-500 text-white border-none px-4 py-2 rounded-r-full cursor-pointer hover:bg-blue-600 transition-colors">
            🔍
          </button>
        </div>
        <div class="profile-section">
          <img 
            src="https://via.placeholder.com/40x40" 
            alt="Profile" 
            class="w-10 h-10 rounded-full border-2 border-gray-300"
          >
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto flex gap-6 p-6">
      <!-- Sidebar -->
      <aside class="w-64 bg-white rounded-xl shadow-sm p-4">
        <nav class="flex flex-col gap-2">
          <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">🏠</span>
            หน้าแรก
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium">
            <span class="text-lg">📅</span>
            จองห้องประชุม
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">📋</span>
            รายการจองของฉัน
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">🏢</span>
            การจองไฟล์ห้องประชุม
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">ℹ️</span>
            สถานะห้องประชุม
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">⚠️</span>
            แจ้งปัญหา
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 bg-white rounded-xl shadow-sm p-8">
        <!-- Page Header -->
        <div class="mb-8">
          <div class="flex items-center gap-4">
            <div class="bg-blue-500 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
              📅
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900 m-0">จองห้องประชุม</h1>
              <p class="text-gray-600 text-sm m-0">ระบบจองห้องประชุม</p>
            </div>
          </div>
        </div>

        <!-- Booking Form -->
        <div class="max-w-2xl">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">ข้อมูลจองห้อง</h2>
          
          <form @submit.prevent="submitBooking" class="space-y-6">
            <!-- รหัสผู้จองผู้ใช้ -->
            <div>
              <label for="userId" class="block text-sm font-medium text-gray-700 mb-2">
                รหัสผู้จองผู้ใช้ <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="userId"
                v-model="formData.userId"
                placeholder="เช่น 12345678"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              >
            </div>

            <!-- ชื่อผู้จอง -->
            <div>
              <label for="bookerName" class="block text-sm font-medium text-gray-700 mb-2">
                ชื่อผู้จอง <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="bookerName"
                v-model="formData.bookerName"
                placeholder="ชื่อจริง"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              >
            </div>

            <!-- นามสกุลผู้จอง -->
            <div>
              <label for="bookerSurname" class="block text-sm font-medium text-gray-700 mb-2">
                นามสกุลผู้จอง <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="bookerSurname"
                v-model="formData.bookerSurname"
                placeholder="นามสกุลจริง"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              >
            </div>

            <!-- เบอร์โทรศัพท์ -->
            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-2">
                เบอร์โทรศัพท์ <span class="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                v-model="formData.phoneNumber"
                placeholder="เช่น 0991112222"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              >
            </div>

            <!-- ตรวจอีเมล -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                ตรวจอีเมล <span class="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                placeholder="ตรวจอีเมล"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              >
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end pt-6">
              <button
                type="submit"
                class="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <span>✓</span>
                ลิสต์
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

const formData = ref({
  userId: '',
  bookerName: '',
  bookerSurname: '',
  phoneNumber: '',
  email: ''
})

const submitBooking = () => {
  // Handle form submission
  console.log('Booking submitted:', formData.value)
  // Add your booking logic here
}
</script>