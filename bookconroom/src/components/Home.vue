<template>
  
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-8 py-4 shadow-sm border-b">
  <div class="max-w-7xl mx-auto flex justify-between items-center">
    <!-- Left -->
    <div>
      <h2 class="text-lg font-semibold text-blue-600 m-0">ระบบจองห้องประชุม</h2>
      <p class="text-sm text-gray-600 m-0">Meeting Room Booking System</p>
    </div>

    <!-- Search -->
    <div class="flex flex-1 max-w-2xl mx-8">
      <input
        v-model.trim="keyword"
        type="text"
        placeholder="ค้นหา..."
        class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-l-full outline-none text-gray-900 focus:border-blue-500"
      >
      <button
        class="bg-blue-600 text-white border-none px-4 py-2 rounded-r-full cursor-pointer hover:bg-blue-700 transition-colors"
        @click="onSearch"
      >
        🔍
      </button>
    </div>

    <!-- Right -->
    <div class="flex items-center gap-3 relative">
      <!-- Notifications -->
      <div class="relative">
        <button
          data-noti-bell
  class="w-10 h-10 rounded-full flex items-center justify-center border hover:bg-gray-50 relative"
  @click="toggleNotif"
> 🔔
  <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 ...">
    {{ unreadCount > 9 ? '9+' : unreadCount }}
  </span>
</button>

        <!-- Dropdown -->
       <div
  v-if="showNotif"
  data-noti-dropdown                     
  class="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-50"
>
          <div class="p-3 border-b flex items-center gap-2">
            <span class="font-medium">การแจ้งเตือน</span>
            <span class="ml-auto text-xs text-gray-500">ยังไม่อ่าน: {{ unreadCount }}</span>
          </div>

          <div class="max-h-80 overflow-auto">
            <div v-if="loadingNoti" class="p-4 text-sm text-gray-500">กำลังโหลด...</div>
            <div v-else-if="errorNoti" class="p-4 text-sm text-red-600">{{ errorNoti }}</div>

            <template v-else>
              <div
                v-if="notifs.length === 0"
                class="p-4 text-sm text-gray-500"
              >
                ยังไม่มีการแจ้งเตือน
              </div>

              <div v-else class="divide-y">
                <div
                  v-for="n in notifs"
                  :key="n.id"
                  class="p-3 hover:bg-gray-50 flex items-start gap-3"
                >
                  <div class="text-xl leading-none">📣</div>
                  <div class="flex-1">
                    <div class="text-sm" :class="n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'">
                      {{ n.message }}
                    </div>
                    <div class="text-[11px] text-gray-500 mt-1">
                      {{ formatTime(n.createdAt) }}
                    </div>
                  </div>
                  <button
                    v-if="!n.isRead"
                    class="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                    @click.stop="markAsRead(n)"
                    title="ทำเครื่องหมายว่าอ่านแล้ว"
                  >
                    อ่านแล้ว
                  </button>
                </div>
              </div>
            </template>
          </div>

          <div class="p-3 border-t flex items-center gap-2">
            <button
              class="text-sm px-3 py-2 border rounded hover:bg-gray-50"
              @click="refreshNotif"
            >
              รีเฟรช
            </button>
            <button
              class="text-sm px-3 py-2 border rounded hover:bg-gray-50"
              @click="markAllAsRead"
              :disabled="unreadCount===0"
            >
              ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
            </button>
            <button
              class="ml-auto text-sm px-3 py-2 border rounded hover:bg-gray-50"
              @click="showNotif=false"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>

      <!-- Avatar + Logout -->
      <img :src="me?.avatarUrl || 'https://via.placeholder.com/40x40'" alt="Profile" class="w-10 h-10 rounded-full border-2 border-gray-300">
      <button
        @click="logout"
        class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
      >
        ออกจากระบบ
      </button>
    </div>
  </div>
</header>

    <div class="max-w-7xl mx-auto flex gap-6 p-6">
      <!-- Sidebar -->
      <aside class="w-64 bg-white rounded-xl shadow-sm p-4">
        <nav class="flex flex-col gap-2">
          <router-link to="/" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
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
          <router-link to="/room-status" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">ℹ️</span> สถานะห้องประชุม
          </router-link>
          <router-link to="/report" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">⚠️</span> แจ้งปัญหา
          </router-link>
          <router-link v-if="isAdmin" to="/admin/approvals" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg font-medium">
            <span class="text-lg">🛡️</span> อนุมัติการจอง (Admin)
          </router-link>
          <router-link to="/my-invites" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">
  <span class="text-lg">📨</span> คำเชิญของฉัน
</router-link>
        </nav>
      </aside>

      <!-- Main Dashboard -->
      <main class="flex-1 flex flex-col gap-6">
        <!-- Page Header -->
        <div class="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div class="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
            🏠
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-blue-600 m-0">หน้าแรก</h1>
            <p class="text-gray-600 text-sm m-0">ระบบจองห้องประชุม</p>
          </div>
        </div>

        <!-- Content Area -->
        <div class="grid grid-cols-2 gap-6">
          <!-- Left: News Card -->
          <div class="flex flex-col gap-6">
            <section class="bg-white rounded-xl p-8 shadow-sm">
              <h2 class="text-xl font-semibold text-blue-600 mb-6">ประชาสัมพันธ์</h2>
              <div class="flex flex-col items-center">
                <img 
                  src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80" 
                  alt="Meeting room" 
                  class="w-full h-44 object-cover rounded-lg mb-4"
                >
                <h3 class="text-lg font-semibold text-gray-900 mb-2">ยินดีต้อนรับสู่การจัดการประชุมยุคใหม่</h3>
                <p class="text-gray-600 leading-relaxed text-sm mb-4">
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
          <div class="flex flex-col gap-6">
            <section class="bg-white rounded-xl p-8 shadow-sm flex gap-6 items-center">
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
        <div class="grid grid-cols-2 gap-6">
          <!-- Calendar Card -->
          <div class="bg-white rounded-xl p-8 shadow-sm flex flex-col items-center">
            <div class="flex items-end gap-4 mb-2">
              <span class="text-blue-600 font-bold text-6xl leading-none">{{ currentDate }}</span>
              <div class="flex flex-col">
                <span class="text-blue-600 font-bold text-xl">{{ currentMonth }}</span>
                <span class="text-blue-600 font-bold text-xl">{{ currentYear }}</span>
              </div>
            </div>
            <div class="text-xl text-gray-600 font-medium mb-4">{{ currentTime }}</div>
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
          <div class="bg-white rounded-xl p-8 shadow-sm flex flex-col justify-center items-center">
            <span class="text-gray-400 text-lg">ไม่มีกิจกรรมในวันนี้</span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import api from '@/lib/api.js'

/* ===== auth / logout ===== */
const { isAdmin } = useAuth()
const router = useRouter()

function logout () {
  localStorage.removeItem('access_token')
  localStorage.removeItem('me_cache')
  router.push('/login')
}

/* ===== ค้นหา ===== */
const keyword = ref('')
function onSearch () {
  const q = keyword.value.trim()
  if (!q) return
  router.push({ path: '/search', query: { q } })
  keyword.value = ''
}

/* ===== เวลา + ปฏิทิน ===== */
const currentTime  = ref('')
const currentDate  = ref('')
const currentMonth = ref('')
const currentYear  = ref('')

const thaiMonths = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
]

const updateDateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('th-TH', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
  currentDate.value = now.getDate()
  currentMonth.value = thaiMonths[now.getMonth()]
  currentYear.value = now.getFullYear() + 543 // พ.ศ.
}

const calendarDates = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()

  const firstDay = new Date(year, month, 1)
  const startDate = firstDay.getDay() // 0=Sun
  const lastDay = new Date(year, month + 1, 0).getDate()
  const prevMonth = new Date(year, month, 0).getDate()

  const dates = []
  let key = 0
  for (let i = startDate - 1; i >= 0; i--) {
    dates.push({ date: prevMonth - i, isToday: false, isOtherMonth: true, key: key++ })
  }
  for (let d = 1; d <= lastDay; d++) {
    dates.push({ date: d, isToday: d === today, isOtherMonth: false, key: key++ })
  }
  const remain = 42 - dates.length
  for (let d = 1; d <= remain; d++) {
    dates.push({ date: d, isToday: false, isOtherMonth: true, key: key++ })
  }
  return dates.slice(0, 42)
})

/* ===== แจ้งเตือน (กระดิ่ง) ===== */
const me = ref(null)
async function fetchMe () {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = data
  } catch { me.value = null }
}

// ชื่อ state ให้ตรงกับ template
const showNotif   = ref(false)
const notifs      = ref([])      // [{id,message,isRead,createdAt}]
const loadingNoti = ref(false)
const errorNoti   = ref('')

const unreadCount = computed(() => notifs.value.filter(n => !n.isRead).length)

function formatTime (iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return `${diff}s ที่แล้ว`
  const m = Math.floor(diff / 60)
  if (m < 60) return `${m}m ที่แล้ว`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ที่แล้ว`
  const days = Math.floor(h / 24)
  return `${days}d ที่แล้ว`
}

async function fetchNotifications () {
  loadingNoti.value = true
  errorNoti.value = ''
  try {
    const { data } = await api.get('/api/notifications')
    const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : [])
    notifs.value = list.map(n => ({
      id: n.id,
      message: n.message,
      isRead: !!n.isRead,
      createdAt: n.createdAt
    }))
  } catch (e) {
    errorNoti.value = e?.response?.data?.error || 'โหลดการแจ้งเตือนไม่สำเร็จ'
    notifs.value = []
  } finally {
    loadingNoti.value = false
  }
}

async function markAsRead (n) {
  if (n.isRead) return
  try {
    await api.patch(`/api/notifications/${n.id}/read`)
    n.isRead = true
  } catch {}
}

async function markAllAsRead () {
  if (!unreadCount.value) return
  try {
    await api.patch('/api/notifications/read-all')
    notifs.value = notifs.value.map(n => ({ ...n, isRead: true }))
  } catch {}
}

async function refreshNotif () {
  await fetchNotifications()
}

function toggleNotif () {
  showNotif.value = !showNotif.value
}

// ปิด dropdown เมื่อคลิกนอก
function handleClickOutside (e) {
  const dropdown = document.querySelector('[data-noti-dropdown]')
  const bellBtn  = document.querySelector('[data-noti-bell]')
  if (!dropdown) { showNotif.value = false; return }
  if (!dropdown.contains(e.target) && !(bellBtn && bellBtn.contains(e.target))) {
    showNotif.value = false
  }
}

/* ===== lifecycle ===== */
let clockTimer = null
let notiTimer  = null

onMounted(async () => {
  updateDateTime()
  clockTimer = setInterval(updateDateTime, 1000)

  await fetchMe()
  await fetchNotifications()
  notiTimer = setInterval(fetchNotifications, 30000) // รีเฟรชทุก 30 วิ

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (notiTimer)  clearInterval(notiTimer)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style>
/* Add any additional custom styles here */
</style>

