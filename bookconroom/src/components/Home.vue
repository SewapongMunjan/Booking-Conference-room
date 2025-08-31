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
          <a href="#" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium">
            <span class="text-lg">🏠</span>
            หน้าแรก
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
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

      <!-- Main Dashboard -->
      <main class="flex-1 bg-white rounded-xl shadow-sm p-8">
        <!-- Page Header -->
        <div class="mb-8">
          <div class="flex items-center gap-4">
            <div class="bg-blue-500 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
              🏠
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900 m-0">หน้าแรก</h1>
              <p class="text-gray-600 text-sm m-0">ระบบจองห้องประชุม</p>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Content -->
          <div class="lg:col-span-2">
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-6">ประชาสัมพันธ์</h2>
              <div class="bg-gray-50 rounded-xl p-6 mb-6">
                <img 
                  src="https://via.placeholder.com/300x180" 
                  alt="Meeting room" 
                  class="w-full h-44 object-cover rounded-lg mb-4"
                >
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">อินดี้ต้องมีการจัดการประชุมอุดม์ใหม่</h3>
                  <p class="text-gray-600 leading-relaxed text-sm">
                    เพื่อส่งความสะดวกในการจัดการประชุม ระบบจองห้องประชุมดังกล่าว ยกเลิกจะเป็นพื้นฐานจะต้อง มีจองเพื่อให้ห้องสำคัญก็เป็นช่วงทำการทำงานก์ ให้มากไร่
                  </p>
                </div>
              </div>
              <!-- Pagination dots -->
              <div class="flex gap-3 justify-center">
                <span class="w-3 h-3 rounded-full bg-blue-500 cursor-pointer"></span>
                <span class="w-3 h-3 rounded-full bg-gray-300 cursor-pointer hover:bg-gray-400"></span>
                <span class="w-3 h-3 rounded-full bg-gray-300 cursor-pointer hover:bg-gray-400"></span>
              </div>
            </section>
          </div>

          <!-- Right Content -->
          <div class="lg:col-span-1">
            <!-- Quick Info -->
            <div class="flex gap-4 bg-blue-50 p-6 rounded-xl mb-8 border border-blue-100">
              <div class="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                1
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">การแจ้งเตือน</h3>
                <p class="text-gray-700 font-medium mb-2 text-sm">คุณยังไม่ได้ยืนยันการเข้าร่วมประชุม</p>
                <small class="text-gray-500 leading-relaxed text-xs">
                  คุณได้ลงเก็บข้อมูลประชุม ที่จะต้องในวันที่ 13/07/2568 ห้องประชุม A110โปรดตอบยืนยัน การเข้าร่วมประชุมให้ครบถ้วนให้แล้วเสร็จภายในเวลาที่กำหนด
                </small>
              </div>
            </div>

            <!-- Date and Time -->
            <div class="text-center">
              <div class="mb-6 p-6 bg-gray-50 rounded-xl">
                <div class="text-6xl font-bold text-blue-500 leading-none mb-2">{{ currentDate }}</div>
                <div class="text-xl text-gray-600 font-medium">{{ currentTime }}</div>
              </div>
              
              <div class="flex justify-between items-center mb-4 px-2">
                <span class="text-blue-500 font-bold text-lg">{{ currentMonth }}</span>
                <span class="text-blue-500 font-bold text-lg">{{ currentYear }}</span>
                <span class="text-xs text-gray-500">ไม่มีการจองในวันนี้</span>
              </div>

              <!-- Mini Calendar -->
              <div class="border border-gray-200 rounded-lg overflow-hidden">
                <div class="grid grid-cols-7 bg-gray-100">
                  <span class="py-3 px-2 text-center text-xs font-bold text-gray-600">Su</span>
                  <span class="py-3 px-2 text-center text-xs font-bold text-gray-600">Mo</span>
                  <span class="py-3 px-2 text-center text-xs font-bold text-gray-600">Tu</span>
                  <span class="py-3 px-2 text-center text-xs font-bold text-gray-600">We</span>
                  <span class="py-3 px-2 text-center text-xs font-bold text-gray-600">Th</span>
                  <span class="py-3 px-2 text-center text-xs font-bold text-gray-600">Fr</span>
                  <span class="py-3 px-2 text-center text-xs font-bold text-gray-600">Sa</span>
                </div>
                <div class="grid grid-cols-7">
                  <span v-for="date in calendarDates" 
                        :key="date.key" 
                        :class="[
                          'py-3 px-2 text-center text-sm cursor-pointer transition-colors',
                          date.isToday ? 'bg-blue-500 text-white font-bold' : 'text-gray-900 hover:bg-blue-50',
                          date.isOtherMonth ? 'text-gray-400' : ''
                        ]">
                    {{ date.date }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const currentTime = ref('')
const currentDate = ref('')
const currentMonth = ref('')
const currentYear = ref('')

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

const updateDateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('th-TH', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
  currentDate.value = now.getDate()
  currentMonth.value = thaiMonths[now.getMonth()]
  currentYear.value = now.getFullYear() + 543 // Buddhist Era
}

const calendarDates = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  
  // First day of current month
  const firstDay = new Date(year, month, 1)
  const startDate = firstDay.getDay() // 0 = Sunday
  
  // Last day of current month
  const lastDay = new Date(year, month + 1, 0).getDate()
  
  // Previous month's last days
  const prevMonth = new Date(year, month, 0).getDate()
  
  const dates = []
  let key = 0
  
  // Previous month dates
  for (let i = startDate - 1; i >= 0; i--) {
    dates.push({
      date: prevMonth - i,
      isToday: false,
      isOtherMonth: true,
      key: key++
    })
  }
  
  // Current month dates
  for (let date = 1; date <= lastDay; date++) {
    dates.push({
      date: date,
      isToday: date === today,
      isOtherMonth: false,
      key: key++
    })
  }
  
  // Next month dates to fill the grid
  const remainingCells = 42 - dates.length // 6 rows × 7 days
  for (let date = 1; date <= remainingCells; date++) {
    dates.push({
      date: date,
      isToday: false,
      isOtherMonth: true,
      key: key++
    })
  }
  
  return dates.slice(0, 42)
})

onMounted(() => {
  updateDateTime()
  setInterval(updateDateTime, 1000)
})
</script>

