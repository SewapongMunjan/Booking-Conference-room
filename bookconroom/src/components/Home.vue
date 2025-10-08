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
              <div v-if="notifs.length === 0" class="p-4 text-sm text-gray-500">
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
          <router-link to="/" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium">
            <span class="text-lg">🏠</span> หน้าแรก
          </router-link>
          <router-link to="/booking" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <span class="text-lg">📅</span> จองห้องประชุม
          </router-link>
          <router-link to="/booking-list" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
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
          <router-link to="/admin/approvals" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg font-medium">
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
        <!-- News Card Slider (full width, responsive) -->
        <div class="w-full flex flex-col gap-6">
          <section class="relative bg-white rounded-xl p-0 shadow-sm overflow-hidden w-full">
            <h2 class="text-xl font-semibold text-blue-600 mb-0 px-8 pt-8">ประชาสัมพันธ์</h2>
            <div class="relative w-full flex items-center justify-center">
              <button @click="prevNews" class="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-blue-700 rounded-full p-2 shadow hidden sm:block">
                <span class="sr-only">ก่อนหน้า</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <div class="w-full overflow-hidden">
                <div class="flex transition-transform duration-500" :style="{ transform: `translateX(-${currentNews * 100}%)` }">
                  <div v-for="(card, idx) in newsCards" :key="idx" class="min-w-full flex flex-col md:flex-row items-center justify-center">
                    <img :src="card.img" :alt="card.title" class="w-full md:w-1/2 h-64 md:h-96 object-cover rounded-lg md:rounded-none md:rounded-l-xl" />
                    <div class="flex-1 p-8 flex flex-col justify-center items-center md:items-start">
                      <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center md:text-left">{{ card.title }}</h3>
                      <p class="text-gray-600 leading-relaxed text-base mb-4 text-center md:text-left">{{ card.desc }}</p>
                      <div v-if="card.details" class="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div v-for="(detail, dIdx) in card.details" :key="dIdx" :class="detail.class">
                          <h4 class="font-semibold mb-1" :class="detail.titleClass">{{ detail.heading }}</h4>
                          <ul class="list-disc ml-5 text-gray-700 text-sm">
                            <li v-for="(item, i) in detail.items" :key="i">{{ item }}</li>
                          </ul>
                        </div>
                      </div>
                      <div v-if="card.buttons" class="flex gap-4 mt-6 justify-center md:justify-start">
                        <a v-for="(btn, bIdx) in card.buttons" :key="bIdx" :href="btn.href" class="px-6 py-2 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors text-base">{{ btn.text }}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button @click="nextNews" class="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-blue-700 rounded-full p-2 shadow hidden sm:block">
                <span class="sr-only">ถัดไป</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
              <!-- Pagination dots -->
              <div class="absolute bottom-4 left-0 right-0 flex gap-2 justify-center z-10">
                <span v-for="(card, i) in newsCards" :key="i" :class="['w-3 h-3 rounded-full border-2', i === currentNews ? 'bg-blue-600 border-blue-600' : 'bg-white border-blue-300']"></span>
              </div>
            </div>
          </section>
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
// News Card Slider State
import { ref as vueRef, onMounted as vueOnMounted, onUnmounted as vueOnUnmounted } from 'vue'
const newsCards = [
  {
    img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
    title: "ยินดีต้อนรับสู่การจัดการประชุมยุคใหม่",
    desc: "เพื่อส่งความสะดวกในการจัดการประชุม ระบบจองห้องประชุมอัจฉริยะ ถูกพัฒนาขึ้นเพื่อให้การจองห้องประชุมขององค์กรเป็นเรื่องง่ายและไม่ซับซ้อน!",
    details: [
      {
        heading: "📢 ประกาศใหม่",
        class: "bg-blue-50 rounded-lg p-4",
        titleClass: "text-blue-700",
        items: [
          "ระบบรองรับการจองห้องประชุมล่วงหน้าได้ถึง 6 เดือน",
          "เพิ่มฟีเจอร์แจ้งเตือนผ่านอีเมลสำหรับการจองและยกเลิก"
        ]
      },
      {
        heading: "🆕 อัปเดตล่าสุด",
        class: "bg-green-50 rounded-lg p-4",
        titleClass: "text-green-700",
        items: [
          "ปรับปรุง UI ให้ใช้งานง่ายขึ้นบนมือถือ",
          "เพิ่มระบบรายงานปัญหาและข้อเสนอแนะ"
        ]
      }
    ]
  },
  {
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=900&q=80',
    title: "ระบบแจ้งเตือนใหม่!",
    desc: "ไม่พลาดทุกการเปลี่ยนแปลง ระบบแจ้งเตือนผ่านอีเมลและแอป แจ้งเตือนทุกการจองและยกเลิกแบบเรียลไทม์",
    buttons: [
      { text: "ดูรายละเอียด", href: "#" },
      { text: "ตั้งค่าการแจ้งเตือน", href: "#" }
    ]
  },
  {
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    title: "จองห้องประชุมได้ทุกที่ ทุกเวลา",
    desc: "รองรับการจองผ่านมือถือและคอมพิวเตอร์ สะดวก รวดเร็ว ทุกเวลา พร้อมระบบค้นหาห้องว่างแบบเรียลไทม์",
    buttons: [
      { text: "จองห้องประชุม", href: "#" },
      { text: "ดูห้องว่าง", href: "#" }
    ]
  }
]
const currentNews = vueRef(0)
let newsInterval = null
function nextNews() {
  currentNews.value = (currentNews.value + 1) % newsCards.length
}
function prevNews() {
  currentNews.value = (currentNews.value - 1 + newsCards.length) % newsCards.length
}
vueOnMounted(() => {
  newsInterval = setInterval(nextNews, 7000)
})
vueOnUnmounted(() => {
  if (newsInterval) clearInterval(newsInterval)
})
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

// Search bar removed

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

