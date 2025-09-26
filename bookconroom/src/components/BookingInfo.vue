<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Mobile Menu Button -->
    <div class="lg:hidden bg-white px-4 py-3 shadow-sm border-b">
      <button 
        @click="sidebarOpen = !sidebarOpen"
        class="p-2 rounded-md text-gray-600 hover:bg-gray-100"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
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
        <div class="hidden lg:flex flex-1 max-w-2xl mx-8">
          <input 
            type="text" 
            placeholder="ค้นหา..." 
            class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-l-full outline-none text-gray-900 focus:border-blue-500"
          >
          <button class="bg-blue-600 text-white border-none px-4 py-2 rounded-r-full cursor-pointer hover:bg-blue-700 transition-colors">
            🔍
          </button>
        </div>
        <div class="flex items-center gap-3">
          <img src="https://via.placeholder.com/40x40" alt="Profile" class="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-gray-300">
          <button
            @click="logout"
            class="hidden lg:block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar Overlay for Mobile -->
      <div 
        v-if="sidebarOpen" 
        @click="sidebarOpen = false"
        class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
      ></div>

      <!-- Sidebar -->
      <aside 
        :class="[
          'fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg lg:shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <div class="h-full flex flex-col">
          <!-- Mobile Close Button -->
          <div class="lg:hidden p-4 border-b">
            <button 
              @click="sidebarOpen = false"
              class="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
            <router-link 
              to="/" 
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium"
            >
              <span class="text-lg">🏠</span>
              <span class="truncate">หน้าแรก</span>
            </router-link>
            <router-link 
              to="/booking" 
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span class="text-lg">📅</span>
              <span class="truncate">จองห้องประชุม</span>
            </router-link>
            <router-link 
              to="/booking-list" 
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span class="text-lg">📋</span>
              <span class="truncate">รายการจองของฉัน</span>
            </router-link>
            <router-link 
              to="/room-use" 
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span class="text-lg">🗂️</span>
              <span class="truncate">ตารางการใช้ห้องประชุม</span>
            </router-link>
            <router-link 
              to="/room-status" 
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span class="text-lg">ℹ️</span>
              <span class="truncate">สถานะห้องประชุม</span>
            </router-link>
            <router-link 
              to="/report" 
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span class="text-lg">⚠️</span>
              <span class="truncate">แจ้งปัญหา</span>
            </router-link>
          </nav>

          <!-- Mobile Logout Button -->
          <div class="lg:hidden p-4 border-t">
            <button
              @click="logout"
              class="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col gap-6">
        <!-- Page Header -->
        <div class="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div class="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
            🔒
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-blue-600 m-0">จองห้องประชุม</h1>
            <p class="text-gray-600 text-sm m-0">ระบบจองห้องประชุม</p>
          </div>
        </div>

        <!-- Booking Form ONLY -->
        <div class="bg-white rounded-xl shadow-sm p-8">
          <h2 class="text-xl font-semibold text-blue-600 mb-6">แบบฟอร์มจองห้องประชุม</h2>
          <form class="grid grid-cols-1 gap-6">
            <div>
              <label class="block text-gray-700 font-medium mb-2">ชื่อผู้จอง</label>
              <input type="text" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">เบอร์โทรศัพท์</label>
              <input type="tel" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">Email</label>
              <input type="email" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">วันที่ประชุม</label>
              <input type="date" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">เวลาเริ่มประชุม</label>
              <input type="time" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">เวลาสิ้นสุดประชุม</label>
              <input type="time" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">ห้องประชุม</label>
              <select class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
                <option value="">เลือกห้องประชุม</option>
                <option value="A1016">A1016</option>
                <option value="A1017">A1017</option>
                <option value="A1018">A1018</option>
                <option value="A1019">A1019</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">จำนวนที่นั่ง</label>
              <input type="number" min="1" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">ประเภทห้องประชุม</label>
              <select class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
                <option value="">เลือกประเภทห้องประชุม</option>
                <option value="ขนาดเล็ก">ขนาดเล็ก</option>
                <option value="ขนาดกลาง">ขนาดกลาง</option>
                <option value="ขนาดใหญ่">ขนาดใหญ่</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">รูปแบบการจอง</label>
              <select class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
                <option value="">เลือกประเภทการจอง</option>
                <option value="จองครั้งเดียว">จองครั้งเดียว</option>
                <option value="จองประจำ">จองประจำ</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">อุปกรณ์ที่ต้องการใช้</label>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center">
                  <input type="checkbox" id="projector" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="โปรเจคเตอร์">
                  <label for="projector" class="ml-2 text-gray-700">โปรเจคเตอร์</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="sound-system" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="เครื่องเสียง">
                  <label for="sound-system" class="ml-2 text-gray-700">เครื่องเสียง</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="whiteboard" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="กระดานไวท์บอร์ด">
                  <label for="whiteboard" class="ml-2 text-gray-700">กระดานไวท์บอร์ด</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="air-conditioner" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="เครื่องปรับอากาศ">
                  <label for="air-conditioner" class="ml-2 text-gray-700">เครื่องปรับอากาศ</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="wifi" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="Wi-Fi">
                  <label for="wifi" class="ml-2 text-gray-700">Wi-Fi</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="drinking-water" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="น้ำดื่ม">
                  <label for="drinking-water" class="ml-2 text-gray-700">น้ำดื่ม</label>
                </div>
              </div>
            </div>
            <div>
              <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors">
                จองห้องประชุม
              </button>
            </div>
          </form>
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-4 mt-8">
          <button 
            type="button" 
            class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            @click="router.push('/booking')"
          >
            <span>⬅️</span>
            ย้อนกลับ
          </button>
          <button 
            type="button"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            @click="router.push('/bookcompleteinfo')"
          >
            <span>✔️</span>
            ถัดไป
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>