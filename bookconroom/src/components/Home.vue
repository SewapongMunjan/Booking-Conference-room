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
      <main class="flex-1 min-w-0 lg:ml-0">
        <div class="max-w-7xl mx-auto p-4 lg:p-6">
          <div class="flex flex-col gap-4 lg:gap-6">
            <!-- Page Header -->
            <div class="bg-white rounded-xl shadow-sm p-4 lg:p-6 flex items-center gap-4">
              <div class="bg-blue-600 text-white w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center text-xl lg:text-2xl">
                🏠
              </div>
              <div>
                <h1 class="text-xl lg:text-2xl font-semibold text-blue-600 m-0">หน้าแรก</h1>
                <p class="text-gray-600 text-sm m-0">ระบบจองห้องประชุม</p>
              </div>
            </div>

            <!-- Content Area -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <!-- Left: News Card -->
              <div class="flex flex-col gap-4 lg:gap-6">
                <section class="bg-white rounded-xl p-6 lg:p-8 shadow-sm">
                  <h2 class="text-lg lg:text-xl font-semibold text-blue-600 mb-4 lg:mb-6">ประชาสัมพันธ์</h2>
                  <div class="flex flex-col items-center">
                    <img 
                      src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80" 
                      alt="Meeting room" 
                      class="w-full h-36 lg:h-44 object-cover rounded-lg mb-4"
                    >
                    <h3 class="text-base lg:text-lg font-semibold text-gray-900 mb-2 text-center">ยินดีต้อนรับสู่การจัดการประชุมยุคใหม่</h3>
                    <p class="text-gray-600 leading-relaxed text-sm mb-4 text-center">
                      เพื่อส่งความสะดวกในการจัดการประชุม ระบบจองห้องประชุมอัจฉริยะ ถูกพัฒนาขึ้นเพื่อให้การจองห้องประชุมขององค์กรเป็นเรื่องง่ายและไม่ซับซ้อน!
                    </p>
                    <!-- Pagination dots -->
                    <div class="flex gap-2 justify-center">
                      <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span class="w-2 h-2 rounded-full bg-gray-300"></span>
                      <span class="w-2 h-2 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                </section>
              </div>

              <!-- Right: Notification Card -->
              <div class="flex flex-col gap-4 lg:gap-6">
                <section class="bg-white rounded-xl p-6 lg:p-8 shadow-sm flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
                  <div class="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    1
                  </div>
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-blue-600 mb-2">การแจ้งเตือน</h3>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span class="text-gray-900 font-medium text-sm">คุณยังไม่ได้ยืนยันการเข้าร่วมประชุม</span>
                    </div>
                    <p class="text-gray-600 text-sm mb-2">
                      คุณได้รับเชิญเข้าร่วมประชุมที่จะจัดขึ้นในวันที่ 13/07/2568 ห้องประชุม A110 โปรดกดยืนยันการเข้าร่วมประชุมในระบบเพื่อไม่ให้พลาดกิจกรรมสำคัญ!
                    </p>
                  </div>
                </section>
              </div>
            </div>

            <!-- Bottom: Calendar and Today Info -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <!-- Calendar Card -->
              <div class="bg-white rounded-xl p-6 lg:p-8 shadow-sm flex flex-col items-center">
                <div class="flex items-end gap-4 mb-2">
                  <span class="text-blue-600 font-bold text-4xl lg:text-6xl leading-none">{{ currentDate }}</span>
                  <div class="flex flex-col">
                    <span class="text-blue-600 font-bold text-lg lg:text-xl">{{ currentMonth }}</span>
                    <span class="text-blue-600 font-bold text-lg lg:text-xl">{{ currentYear }}</span>
                  </div>
                </div>
                <div class="text-lg lg:text-xl text-gray-600 font-medium mb-4">{{ currentTime }}</div>
                <!-- Mini Calendar -->
                <div class="w-full">
                  <div class="grid grid-cols-7 bg-gray-100 rounded-t-lg">
                    <span class="py-2 text-center text-xs font-bold text-gray-600">Su</span>
                    <span class="py-2 text-center text-xs font-bold text-gray-600">Mo</span>
                    <span class="py-2 text-center text-xs font-bold text-gray-600">Tu</span>
                    <span class="py-2 text-center text-xs font-bold text-gray-600">We</span>
                    <span class="py-2 text-center text-xs font-bold text-gray-600">Th</span>
                    <span class="py-2 text-center text-xs font-bold text-gray-600">Fr</span>
                    <span class="py-2 text-center text-xs font-bold text-gray-600">Sa</span>
                  </div>
                  <div class="grid grid-cols-7 border border-gray-200 rounded-b-lg">
                    <span v-for="date in calendarDates" 
                          :key="date.key" 
                          :class="[
                            'py-2 text-center text-sm cursor-pointer transition-colors',
                            date.isToday ? 'bg-blue-600 text-white font-bold' : 'text-gray-900 hover:bg-blue-50',
                            date.isOtherMonth ? 'text-gray-400' : ''
                          ]">
                      {{ date.date }}
                    </span>
                  </div>
                </div>
              </div>
              <!-- Today Info Card -->
              <div class="bg-white rounded-xl p-6 lg:p-8 shadow-sm flex flex-col justify-center items-center">
                <span class="text-gray-400 text-base lg:text-lg">ไม่มีกิจกรรมในวันนี้</span>
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
import { useRouter } from 'vue-router'

const router = useRouter()

// Sidebar state
const sidebarOpen = ref(false)

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

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

<style>
/* Add any additional custom styles here */
</style>

