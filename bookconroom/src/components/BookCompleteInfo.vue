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
          <router-link to="/booking" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium">
            <span class="text-lg">🔒</span>
            จองห้องประชุม
          </router-link>
          <router-link to="/booking-list" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">🅱️</span>
            รายการจองของฉัน
          </router-link>
          <router-link to="/room-use" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">🗂️</span>
            ตารางการใช้ห้องประชุม
          </router-link>
          <router-link to="/room-status" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">❗</span>
            สถานะห้องประชุม
          </router-link>
          <router-link to="/report" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">⚠️</span>
            แจ้งปัญหา
          </router-link>
        </nav>
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