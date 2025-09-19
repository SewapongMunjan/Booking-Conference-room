<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-8 py-4 shadow-sm border-b">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h2 class="text-lg font-semibold text-blue-600 m-0">ระบบจองห้องประชุม</h2>
          <p class="text-sm text-gray-600 m-0">Meeting Room Booking System</p>
        </div>
        <div class="flex flex-1 max-w-2xl mx-8">
          <input 
            type="text" 
            placeholder="ค้นหา..." 
            class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-l-full outline-none text-gray-900 focus:border-blue-500"
          >
          <button class="bg-blue-600 text-white border-none px-4 py-2 rounded-r-full cursor-pointer hover:bg-blue-700 transition-colors">
            🔍
          </button>
        </div>
        <div>
          <img src="https://via.placeholder.com/40x40" alt="Profile" class="w-10 h-10 rounded-full border-2 border-gray-300">
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto flex gap-6 p-6">
      <!-- Sidebar -->
      <aside class="w-64 bg-white rounded-xl shadow-sm p-4">
        <nav class="flex flex-col gap-2">
          <router-link to="/" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">🏠</span> หน้าแรก
          </router-link>
          <router-link to="/booking" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">📅</span> จองห้องประชุม
          </router-link>
          <router-link to="/booking-list" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 font-medium">
            <span class="text-lg">📋</span> รายการจองของฉัน
          </router-link>
          <router-link to="/room-use" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">🗂️</span> ตารางการใช้ห้องประชุม
          </router-link>
          <router-link to="/room-status" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">ℹ️</span> สถานะห้องประชุม
          </router-link>
          <router-link to="/report" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">⚠️</span> แจ้งปัญหา
          </router-link>
          <router-link to="/admin/approvals" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 font-medium">
            <span class="text-lg">🛡️</span> อนุมัติการจอง (Admin)
          </router-link>
          <router-link to="/my-invites" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">
          <span class="text-lg">📨</span> คำเชิญของฉัน
          </router-link>
        </nav>
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