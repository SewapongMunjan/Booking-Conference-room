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

        <!-- Summary Card -->
        <div class="bg-white rounded-xl shadow-sm p-8 border-2">
          <h2 class="text-xl font-semibold text-blue-600 mb-6">สรุป</h2>
          <div class="mb-6">
            <span class="text-gray-700 font-medium">การประชุม</span>
            <div class="text-blue-600 text-lg font-bold">20 กรกฎาคม 2568</div>
          </div>
          <div class="mb-6">
            <div class="border-b border-blue-200 pb-2 mb-2 text-blue-600 font-semibold">ผู้จองห้องประชุม</div>
            <div class="grid grid-cols-3 gap-6 mb-2">
              <div>
                <span class="text-gray-700">ชื่อผู้จอง</span>
                <div class="text-gray-900 font-medium">เสวพงศ์ มันจันทร์</div>
              </div>
              <div>
                <span class="text-gray-700">เบอร์โทรศัพท์</span>
                <div class="text-gray-900 font-medium">0987654321</div>
              </div>
              <div>
                <span class="text-gray-700">Email</span>
                <div class="text-gray-900 font-medium">Sewapong.m@ku.th</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div>
                <span class="text-gray-700">วันที่สร้างข้อมูล</span>
                <div class="text-gray-900 font-medium">17/07/2568</div>
              </div>
              <div>
                <span class="text-gray-700">เวลา</span>
                <div class="text-gray-900 font-medium">10:45</div>
              </div>
            </div>
          </div>
          <div class="mb-6">
            <div class="border-b border-blue-200 pb-2 mb-2 text-blue-600 font-semibold">รายละเอียดการจอง</div>
            <div class="grid grid-cols-6 gap-6">
              <div>
                <span class="text-gray-700">วันที่ประชุม</span>
                <div class="text-gray-900 font-medium">20/07/2586 - 20/07/2586</div>
              </div>
              <div>
                <span class="text-gray-700">เวลา</span>
                <div class="text-gray-900 font-medium">13:30 - 16:00</div>
              </div>
              <div>
                <span class="text-gray-700">ห้องประชุม</span>
                <div class="text-gray-900 font-medium">A1016</div>
              </div>
              <div>
                <span class="text-gray-700">ชั้น</span>
                <div class="text-gray-900 font-medium">1</div>
              </div>
              <div>
                <span class="text-gray-700">จำนวนที่นั่ง</span>
                <div class="text-gray-900 font-medium">50</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-6 mt-4">
              <div>
                <span class="text-gray-700">ประเภทห้องประชุม</span>
                <div class="text-gray-900 font-medium">ขนาดเล็ก</div>
              </div>
              <div>
                <span class="text-gray-700">รูปแบบการจอง</span>
                <div class="text-gray-900 font-medium">จองครั้งเดียว</div>
              </div>
            </div>
          </div>
          <div>
            <div class="border-b border-blue-200 pb-2 mb-2 text-blue-600 font-semibold">การให้บริการ</div>
            <div>
              <span class="text-gray-700">อุปกรณ์</span>
              <div class="grid grid-cols-2 gap-2 mt-2">
                <div class="text-gray-900 font-medium">โปรเจคเตอร์</div>
                <div class="text-gray-900 font-medium">เครื่องเสียง</div>
                <div class="text-gray-900 font-medium">ขาเอก</div>
                <div class="text-gray-900 font-medium">เครื่องปรับอากาศ</div>
                <div class="text-gray-900 font-medium">Wi-Fi</div>
                <div class="text-gray-900 font-medium">น้ำดื่ม</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: "BookingRoom",
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>