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
          <router-link to="/report" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium">
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