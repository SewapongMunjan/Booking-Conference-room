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
      <main class="flex-1 bg-white rounded-xl shadow-sm p-8">
        <!-- Page Header -->
        <div class="mb-8">
          <div class="flex items-center gap-4">
            <div class="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
              ❗
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-blue-600 m-0">สถานะการใช้ห้องประชุม</h1>
              <p class="text-gray-600 text-sm m-0">ระบบจองห้องประชุม</p>
            </div>
          </div>
        </div>

        <!-- Room Type Filter -->
        <div class="mb-6">
          <label class="text-lg font-semibold text-blue-600 mr-4">ประเภทห้องประชุม</label>
          <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
            <option>options</option>
            <option>ขนาดเล็ก</option>
            <option>ขนาดกลาง</option>
            <option>ขนาดใหญ่</option>
          </select>
        </div>

        <!-- Room Status List -->
        <div class="bg-gray-50 rounded-xl p-8">
          <div class="grid grid-cols-2 gap-8">
            <div v-for="room in rooms" :key="room.id" class="flex items-center gap-8 py-8">
              <div>
                <div class="text-sm text-blue-600 font-semibold mb-1">ห้องประชุม</div>
                <div class="text-3xl font-bold text-gray-900 mb-1">{{ room.name }}</div>
                <div class="text-sm text-blue-600 font-semibold mb-1">ประเภทห้องประชุม</div>
                <div class="text-base text-gray-900 mb-1">{{ room.type }}</div>
                <div class="text-sm text-blue-600 font-semibold mb-1">ชั้น</div>
                <div class="text-base text-gray-900">{{ room.floor }}</div>
              </div>
              <div>
                <span
                  :class="[
                    'px-8 py-2 rounded-full font-semibold text-base',
                    room.status === 'ว่าง' ? 'bg-green-400 text-white' :
                    room.status === 'รออนุมัติ' ? 'bg-yellow-400 text-gray-900' :
                    room.status === 'จองแล้ว' ? 'bg-red-500 text-white' :
                    room.status === 'ปิดบำรุงรักษา' ? 'bg-gray-400 text-white' : ''
                  ]"
                >
                  {{ room.status === 'จองแล้ว' ? 'จองแล้ว' : room.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
const rooms = [
  { id: 1, name: 'A1010', type: 'ขนาดเล็ก', floor: 1, status: 'ว่าง' },
  { id: 2, name: 'A1011', type: 'ขนาดเล็ก', floor: 1, status: 'ว่าง' },
  { id: 3, name: 'A1012', type: 'ขนาดเล็ก', floor: 1, status: 'รออนุมัติ' },
  { id: 4, name: 'A1012', type: 'ขนาดเล็ก', floor: 1, status: 'รออนุมัติ' },
  { id: 5, name: 'A1013', type: 'ขนาดเล็ก', floor: 1, status: 'จองแล้ว' },
  { id: 6, name: 'A1014', type: 'ขนาดเล็ก', floor: 1, status: 'จองแล้ว' },
  { id: 7, name: 'A1015', type: 'ขนาดเล็ก', floor: 1, status: 'ปิดบำรุงรักษา' },
  { id: 8, name: 'A1016', type: 'ขนาดเล็ก', floor: 1, status: 'ปิดบำรุงรักษา' }
]
</script>