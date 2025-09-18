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
            <span class="text-lg">🏠</span>
            หน้าแรก
          </router-link>
          <router-link to="/booking" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">📅</span>
            จองห้องประชุม
          </router-link>
          <router-link to="/booking-list" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium">
            <span class="text-lg">📋</span>
            รายการจองของฉัน
          </router-link>
          <router-link to="/room-use" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">🗂️</span>
            ตารางการใช้ห้องประชุม
          </router-link>
          <router-link to="/room-status" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">ℹ️</span>
            สถานะห้องประชุม
          </router-link>
          <router-link to="/report" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">⚠️</span>
            แจ้งปัญหา
          </router-link>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 max-w-4xl bg-white rounded-xl shadow-sm p-8">
        <!-- Page Header -->
        <div class="mb-8">
          <div class="flex items-center gap-4">
            <div class="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-blue-600 m-0">รายการจองของฉัน</h1>
              <p class="text-gray-600 text-sm m-0">ระบบจองห้องประชุม</p>
            </div>
          </div>
        </div>

        <!-- Booking List -->
        <div class="bg-gray-50 rounded-xl p-8">
          <h2 class="text-xl font-semibold text-blue-600 mb-6">การประชุมที่กำลังจะมาถึง</h2>
          <div class="space-y-6">
            <div v-for="(booking, idx) in bookings" :key="idx" class="flex items-center gap-8 py-4 border-b last:border-b-0">
              <div class="flex flex-col items-center w-24">
                <span class="text-4xl font-bold text-blue-600">{{ booking.day }}</span>
                <span class="text-base text-gray-700">{{ booking.month }}</span>
              </div>
              <div class="flex flex-col w-32">
                <span class="text-sm text-gray-500">เวลา</span>
                <span class="text-base font-medium text-gray-900">{{ booking.time }}</span>
              </div>
              <div class="flex flex-col w-32">
                <span class="text-sm text-gray-500">ห้องประชุม</span>
                <span class="text-base font-medium text-gray-900">{{ booking.room }}</span>
              </div>
              <div class="flex flex-col w-16">
                <span class="text-sm text-gray-500">ชั้น</span>
                <span class="text-base font-medium text-gray-900">{{ booking.floor }}</span>
              </div>
              <div class="flex flex-col w-32">
                <span class="text-sm text-gray-500">ประเภทห้องประชุม</span>
                <span class="text-base font-medium text-gray-900">{{ booking.type }}</span>
              </div>
              <div class="flex flex-col w-24">
                <span class="text-sm text-gray-500">จำนวนที่นั่ง</span>
                <span class="text-base font-medium text-gray-900">{{ booking.seats }}</span>
              </div>
              <div class="flex flex-col w-32">
                <span class="text-sm text-gray-500">รูปแบบการจอง</span>
                <span class="text-base font-medium text-gray-900">{{ booking.bookingType }}</span>
              </div>
              <div>
                <span
                  :class="[
                    'px-6 py-2 rounded-full font-semibold text-sm',
                    booking.status === 'อนุมัติแล้ว' ? 'bg-green-400 text-white' : 'bg-yellow-400 text-gray-900'
                  ]"
                >
                  {{ booking.status }}
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
const bookings = [
  {
    day: 20,
    month: 'กรกฎาคม',
    time: '13:30 - 16:00',
    room: 'A1016',
    floor: 1,
    type: 'ขนาดเล็ก',
    seats: 30,
    bookingType: 'จองครั้งเดียว',
    status: 'อนุมัติแล้ว'
  },
  {
    day: 20,
    month: 'กรกฎาคม',
    time: '13:30 - 16:00',
    room: 'A1017',
    floor: 1,
    type: 'ขนาดเล็ก',
    seats: 30,
    bookingType: 'จองครั้งเดียว',
    status: 'รออนุมัติ'
  },
  {
    day: 20,
    month: 'กรกฎาคม',
    time: '13:30 - 16:00',
    room: 'A1018',
    floor: 1,
    type: 'ขนาดเล็ก',
    seats: 30,
    bookingType: 'จองครั้งเดียว',
    status: 'อนุมัติแล้ว'
  },
  {
    day: 20,
    month: 'กรกฎาคม',
    time: '13:30 - 16:00',
    room: 'A1019',
    floor: 1,
    type: 'ขนาดเล็ก',
    seats: 30,
    bookingType: 'จองครั้งเดียว',
    status: 'รออนุมัติ'
  }
]
</script>