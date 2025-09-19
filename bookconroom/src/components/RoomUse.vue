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
          <router-link to="/room-use" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">🗂️</span> ตารางการใช้ห้องประชุม
          </router-link>
          <router-link to="/room-status" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
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
              🗂️
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-blue-600 m-0">ตารางการใช้ห้องประชุม</h1>
              <p class="text-gray-600 text-sm m-0">ระบบจองห้องประชุม</p>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-gray-50 rounded-xl p-8">
          <table class="w-full text-left rounded-xl overflow-hidden">
            <thead>
              <tr class="bg-blue-600 text-white">
                <th class="py-3 px-4 font-semibold">ห้องประชุม</th>
                <th class="py-3 px-4 font-semibold">ประเภทห้องประชุม</th>
                <th class="py-3 px-4 font-semibold">วันที่ประชุม</th>
                <th class="py-3 px-4 font-semibold">เวลาเริ่มประชุม</th>
                <th class="py-3 px-4 font-semibold">เวลาเลิกประชุม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rows" :key="idx" :class="idx % 2 === 1 ? 'bg-blue-50' : ''">
                <td class="py-3 px-4 font-medium">{{ row.room }}</td>
                <td class="py-3 px-4">{{ row.type }}</td>
                <td class="py-3 px-4">{{ row.date }}</td>
                <td class="py-3 px-4">{{ row.start }}</td>
                <td class="py-3 px-4">{{ row.end }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
const rows = [
  { room: 'A1010', type: 'ขนาดเล็ก', date: '18/07/25', start: '13.00', end: '16.00' },
  { room: 'A1010', type: 'ขนาดเล็ก', date: '18/07/25', start: '13.00', end: '16.00' },
  { room: 'A1010', type: 'ขนาดเล็ก', date: '18/07/25', start: '13.00', end: '16.00' },
  { room: 'A1010', type: 'ขนาดเล็ก', date: '18/07/25', start: '13.00', end: '16.00' },
  { room: 'A1010', type: 'ขนาดเล็ก', date: '18/07/25', start: '13.00', end: '16.00' },
  { room: 'A1010', type: 'ขนาดเล็ก', date: '18/07/25', start: '13.00', end: '16.00' },
  { room: 'A1010', type: 'ขนาดเล็ก', date: '18/07/25', start: '13.00', end: '16.00' },
  { room: 'A1010', type: 'ขนาดเล็ก', date: '18/07/25', start: '13.00', end: '16.00' },
  { room: 'A1010', type: 'ขนาดเล็ก', date: '18/07/25', start: '13.00', end: '16.00' },
  { room: 'A1010', type: 'ขนาดเล็ก', date: '18/07/25', start: '13.00', end: '16.00' }
]
</script>