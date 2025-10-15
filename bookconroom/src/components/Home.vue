<template>
  
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-8 py-4 shadow-sm border-b">
  <div class="w-full px-6 mx-auto flex justify-between items-center">
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
  aria-label="เปิดการแจ้งเตือน"
>
  <img
    src="https://cdn-icons-png.flaticon.com/128/1827/1827370.png"
    alt="กระดิ่งแจ้งเตือน"
    class="w-5 h-5 object-contain"
    loading="lazy"
  />
  <span
    v-if="unreadCount > 0"
    class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-5 text-center"
  >
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
                  class="p-3 hover:bg-gray-50 flex items-start gap-3 cursor-pointer"
                  role="button"
                  tabindex="0"
                  @click="goNotif(n)"
                  @keydown.enter.space.prevent="goNotif(n)"
                >
                  <!-- ✅ ไอคอนตามชนิดแจ้งเตือน -->
                  <div class="text-xl leading-none">
                    <span v-if="n.type === 'APPROVED'">✅</span>
                    <span v-else-if="n.type === 'REJECTED'">❌</span>
                    <span v-else-if="n.type === 'CANCELED'">🚫</span>
                    <span v-else-if="n.type === 'RESCHEDULED'">🕒</span>
                    <span v-else-if="n.type === 'ISSUE_CREATED'">⚠️</span>
                    <span v-else>📣</span>
                  </div>

                  <div class="flex-1">
                    <!-- ✅ แสดงหัวข้อ + ข้อความ (fallback) -->
                    <div
                      class="text-sm"
                      :class="n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'"
                    >
                      {{ n.title || 'การแจ้งเตือน' }}
                    </div>
                    <div class="text-xs text-gray-600 whitespace-pre-line">
                      {{ n.message || '-' }}
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
      <!-- Avatar (click -> /profile) + Logout -->
       <router-link
          to="/profile"
          class="shrink-0 inline-block rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
          title="ดูโปรไฟล์"
        >
      <img
          :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'"
          alt="เปิดโปรไฟล์"
          class="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer hover:ring-2 hover:ring-blue-500"
      />
        </router-link>

        <button
          @click="logout"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
         ออกจากระบบ
        </button>
    </div>
  </div>
</header>

<div class="w-full px-6 ml-0 mr-auto flex gap-6 py-6">
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
      <router-link to="/report" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colcolors">
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

  <!-- Main: FULL-WIDTH CONTENT COLUMN -->
  <main class="flex-1 space-y-6">
    <!-- บล็อกหัวเรื่อง/ประกาศ: กินเต็มแถว -->
    <section class="w-full bg-white rounded-xl shadow-sm p-5">
      <div class="flex items-center gap-3">
        <div class="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl">🏠</div>
        <div>
          <h3 class="m-0 text-xl font-semibold text-blue-600">หน้าแรก</h3>
          <p class="m-0 text-sm text-gray-500">ระบบจองห้องประชุม</p>
        </div>
      </div>
    </section>

    <!-- Hero/ประชาสัมพันธ์: กริด 12 คอลัมน์ ยืดเต็ม -->
    <section class="w-full bg-white rounded-xl shadow-sm p-0">
      <div class="grid grid-cols-12 gap-0 md:gap-6">
        <!-- รูปภาพ -->
        <div class="col-span-12 md:col-span-6">
          <img
            src="https://t4.ftcdn.net/jpg/00/80/91/11/360_F_80911186_RoBCsyLrNTrG7Y1EOyCsaCJO5DyHgTox.jpg"
            alt="hero"
            class="w-full h-[260px] md:h-[360px] object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
          />
        </div>
        <!-- ข้อความ/ปุ่ม -->
        <div class="col-span-12 md:col-span-6 p-6 flex flex-col justify-center">
          <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug">
            จองห้องประชุมได้ทุกที่ ทุกเวลา
          </h2>
          <p class="mt-3 text-gray-600">
            รองรับการจองผ่านมือถือและคอมพิวเตอร์ สะดวก รวดเร็ว พร้อมระบบเตือนกำหนดการแบบเรียลไทม์
          </p>
          <div class="mt-5 flex flex-wrap gap-3">
            <router-link
              to="/booking"
              class="inline-flex items-center justify-center px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >จองห้องประชุม</router-link>
            <router-link
              to="/booking-list"
              class="inline-flex items-center justify-center px-5 py-2 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
            >ดูห้องว่าง</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ตัวอย่างการ์ดอื่น ๆ: วางคู่ (2 คอลัมน์) และเต็มแถว -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="w-full bg-white rounded-xl shadow-sm p-6">
        <h4 class="font-semibold text-gray-900">ปฏิทินวันนี้</h4>
        <p class="text-gray-600 text-sm mt-2">แสดงสรุปรายการประชุมของวันนี้</p>
        <!-- วาง widget ปฏิทิน/ตารางได้ที่นี่ -->
      </div>
      <div class="w-full bg-white rounded-xl shadow-sm p-6">
        <h4 class="font-semibold text-gray-900">สรุปสถานะห้อง</h4>
        <p class="text-gray-600 text-sm mt-2">สรุปห้องว่าง/ไม่ว่างตามช่วงเวลา</p>
        <!-- วาง widget สถานะห้องได้ที่นี่ -->
      </div>
    </section>

    <section class="w-full bg-white rounded-xl shadow-sm p-6">
      <h4 class="font-semibold text-gray-900">ข่าว/ประกาศล่าสุด</h4>
      <p class="text-gray-600 text-sm mt-2">พื้นที่ประกาศข่าวสารของระบบ</p>
      <!-- รายการประกาศ -->
    </section>
  </main>
</div>
  </div>
</template>

<script setup>
// News Card Slider State
import { ref as vueRef, onMounted as vueOnMounted, onUnmounted as vueOnUnmounted } from 'vue'
import axios from "axios";
import { createSocket } from "@/plugins/socket";
import useNotifications from "@/composables/useNotifications";

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

// ✅ ใช้ composable และ map ให้ตรงกับตัวแปรใน template
const {
  items: notifItems,
  unreadCount: storeUnread,
  loading: storeLoading,
  error: storeError,
  refresh, markAllRead, markRead,
} = useNotifications();

let socket = null;

const showNotif = ref(false);
const notifs = computed(() => notifItems.value);
const unreadCount = computed(() => storeUnread.value);
const loadingNoti = computed(() => storeLoading.value);
const errorNoti = computed(() => storeError.value || "");

// ฟอร์แมตเวลาแบบไทย
function formatTime (iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
}

// ✅ map เส้นทางจาก refType/refId -> route ปลายทาง
function resolveRouteByNotif(n) {
  const refType = n && n.refType;
  const refId = n && n.refId;

  switch (refType) {
    case 'BOOKING':
      // ไปหน้า booking-info/:id ถ้ามี id, ถ้าไม่มี fallback ไปหน้า booking-info
      if (refId) return { path: `/booking-info/${refId}` };
      return { path: '/booking-info' };

    case 'ISSUE':
      // ตอนนี้คุณยังไม่มีหน้า issue detail แยก -> ส่งไปหน้า /report
      // ถ้าอยากไฮไลต์ ticket ใด ticket หนึ่งแนบ query ไปด้วยได้
      return refId
        ? { path: '/report', query: { issueId: String(refId) } }
        : { path: '/report' };

    case 'INVITE':
      return { path: '/my-invites' };

    default:
      return { path: '/home' };
  }
}

// ฟังก์ชันสำหรับ template
function toggleNotif() {
  showNotif.value = !showNotif.value;
  if (showNotif.value) refresh(); // โหลดรายการเมื่อเปิด
}
function refreshNotif() { return refresh(); }
function markAllAsRead() { return markAllRead(); }
function markAsRead(n) { return markRead(n.id); }

// ✅ กดรายการ -> ทำอ่านแล้ว + ปิด dropdown + นำทาง
async function goNotif(n) {
  try {
    const wasRead = !!n.isRead;
    if (!wasRead) n.isRead = true; // optimistic UI

    await markRead(n.id);          // sync server + badge ใน store
    showNotif.value = false;       // ปิด dropdown

    const target = resolveRouteByNotif(n);
    // ถ้า booking แต่ไม่มี detail page อยากให้ไปไฮไลต์ในรายการ:
    // const target = n.refType==='BOOKING' && n.refId
    //   ? { path: '/booking-list', query: { focusId: String(n.refId) } }
    //   : resolveRouteByNotif(n);

    router.push(target);
  } catch (e) {
    // revert ถ้ามี error
    n.isRead = false;
    console.error(e);
  }
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
  await refresh() // โหลดชุดแรก + count

  const token = localStorage.getItem('access_token')
  if (token) {
    socket = createSocket(token);
    // มาใหม่ -> เติมหัวรายการ + เพิ่ม badge ถ้ายังไม่อ่าน
    socket.on("notif:new", ({ item }) => {
      notifItems.value = [item, ...notifItems.value].slice(0, 50);
      if (!item.isRead) storeUnread.value = (storeUnread.value || 0) + 1;
      playSound("/sounds/notif.mp3");
      toast(`🔔 ${item.title}`, { description: item.message });
    });
    // อัปเดตรายการเดียว (เช่น mark read จากแท็บอื่น)
    socket.on("notif:update", ({ id, patch }) => {
      const idx = notifItems.value.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifItems.value[idx] = Object.assign({}, notifItems.value[idx], patch || {});
      }
    });
    // ทำทั้งหมดเป็นอ่านแล้วจากที่อื่น
    socket.on("notif:update-all-read", () => {
      notifItems.value = notifItems.value.map(n => Object.assign({}, n, { isRead: true }));
    });
    // อัปเดต badge ให้ตรงกับ server
    socket.on("notif:badge", ({ count }) => {
      storeUnread.value = typeof count === 'number' ? count : storeUnread.value;
    });
  }

  // รีเฟรชทุก 30 วิ
  notiTimer = setInterval(() => refresh(), 30000)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (notiTimer)  clearInterval(notiTimer)
  document.removeEventListener('click', handleClickOutside)
  if (socket) { socket.disconnect(); socket = null; }
})
</script>

<style>
/* Add any additional custom styles here */
</style>
