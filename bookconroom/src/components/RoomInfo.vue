<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Fixed Left Sidebar - Hidden on mobile (same as Home) -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
      <div class="h-full flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl shadow-md">🏢</div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">ระบบจองห้องประชุม</h3>
              <p class="text-[10px] text-gray-500">Meeting Room System</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link to="/" class="nav-link" :class="$route.path === '/' ? 'nav-active' : ''">
            <span class="text-lg">🏠</span>
            <span class="text-sm">หน้าแรก</span>
          </router-link>
          <router-link to="/booking" class="nav-link" :class="$route.path.startsWith('/booking') ? 'nav-active' : ''">
            <span class="text-lg">📅</span>
            <span class="text-sm">จองห้องประชุม</span>
          </router-link>
          <router-link  to="/room-info/:id" class="nav-link" :class="$route.path === '/room-info/:id' ? 'nav-active' : ''">
            <span class="text-lg">🛋️</span>
            <span class="text-sm">ข้อมูลห้องประชุม</span>
          </router-link>
          <router-link to="/booking-list" class="nav-link" :class="$route.path === '/booking-list' ? 'nav-active' : ''">
            <span class="text-lg">📋</span>
            <span class="text-sm">รายการจองของฉัน</span>
          </router-link>
          <router-link to="/room-use" class="nav-link" :class="$route.path === '/room-use' ? 'nav-active' : ''">
            <span class="text-lg">🗂️</span>
            <span class="text-sm">ตารางการใช้ห้อง</span>
          </router-link>
          <router-link to="/room-status" class="nav-link" :class="$route.path === '/room-status' ? 'nav-active' : ''">
            <span class="text-lg">ℹ️</span>
            <span class="text-sm">สถานะห้องประชุม</span>
          </router-link>
          <router-link to="/report" class="nav-link" :class="$route.path === '/report' ? 'nav-active' : ''">
            <span class="text-lg">⚠️</span>
            <span class="text-sm">แจ้งปัญหา</span>
          </router-link>
          <router-link to="/my-invites" class="nav-link" :class="$route.path === '/my-invites' ? 'nav-active' : ''">
            <span class="text-lg">📨</span>
            <span class="text-sm">คำเชิญของฉัน</span>
          </router-link>
        </nav>

        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <img :src="me.avatarUrl" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me.name }}</div>
              <div class="text-[10px] text-gray-500 truncate">{{ me.email }}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Header (same as Home) -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white border-b border-gray-200">
      <div class="w-full px-8 py-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-lg lg:hidden">🏢</div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900 m-0">ระบบจองห้องประชุม</h2>
            <p class="text-xs text-gray-500 m-0 hidden sm:block lg:hidden">Meeting Room Booking System</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Search (desktop only) -->
          <div class="hidden lg:block relative">
            <input type="search" placeholder="ค้นหา..." class="w-64 pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>

          <!-- Mobile menu toggle -->
          <button @click="showMobileMenu = !showMobileMenu" class="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button data-noti-bell class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 relative" @click="toggleNotif">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <!-- notif dropdown -->
            <div v-if="showNotif" data-noti-dropdown class="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
              <div class="p-3 border-b border-gray-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-gray-900">การแจ้งเตือน</span>
                  <span class="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-medium">{{ unreadCount }}</span>
                </div>
                <button @click="showNotif = false" class="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                  ✕
                </button>
              </div>

              <div class="max-h-[48vh] overflow-y-auto">
                <div v-if="notifs.length === 0" class="p-8 text-center text-xs text-gray-500">ไม่มีการแจ้งเตือน</div>
                <div v-else class="divide-y divide-gray-100">
                  <div v-for="n in notifs" :key="n.id" class="p-3 hover:bg-gray-50 flex items-start gap-3 cursor-pointer" @click="goNotif(n)">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" :class="n.isRead ? 'bg-gray-100' : 'bg-blue-50'">
                      <span v-if="n.type==='APPROVED'">✅</span>
                      <span v-else>📣</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-xs font-medium" :class="n.isRead ? 'text-gray-600' : 'text-gray-900'">{{ n.title }}</div>
                      <div class="text-[11px] text-gray-500 mt-0.5">{{ n.message }}</div>
                      <div class="text-[9px] text-gray-400 mt-1">{{ formatTime(n.createdAt) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-2 border-t border-gray-100 flex gap-2">
                <button class="flex-1 text-[10px] px-2 py-1.5 hover:bg-gray-50 border border-gray-200 rounded-lg font-medium" @click="refreshNotif">🔄 รีเฟรช</button>
                <button class="flex-1 text-[10px] px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium" @click="markAllAsRead">✓ อ่านทั้งหมด</button>
              </div>
            </div>
          </div>

          <!-- Profile + logout -->
          <router-link to="/profile" class="hidden sm:block">
            <div class="w-10 h-10 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500">
              <img :src="me.avatarUrl" class="w-full h-full object-cover"/>
            </div>
          </router-link>
          <button @click="logout" class="hidden sm:block px-4 py-2.5 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700">ออกจากระบบ</button>
        </div>
      </div>
    </header>

    <!-- Mobile menu (same as Home) -->
    <div v-if="showMobileMenu" class="lg:hidden fixed inset-0 z-50 bg-black/20" @click="showMobileMenu = false">
      <div class="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl" @click.stop>
        <div class="p-4 border-b flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 text-sm">เมนู</h3>
          <button @click="showMobileMenu = false" class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center">✕</button>
        </div>
        <router-link to="/profile" class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg m-3">
          <img :src="me.avatarUrl" class="w-9 h-9 rounded-lg" />
          <div class="flex-1 min-w-0">
            <div class="font-medium text-xs text-gray-900 truncate">{{ me.name }}</div>
            <div class="text-[10px] text-gray-500">ดูโปรไฟล์</div>
          </div>
        </router-link>
         <nav class="p-2 space-y-1">
          <router-link to="/" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🏠</span> <span class="text-sm">หน้าแรก</span>
          </router-link>
          <router-link to="/booking" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">📅</span> <span class="text-sm">จองห้องประชุม</span>
          </router-link>
          <router-link to="/room-info/:id" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🛋️</span> <span class="text-sm">ข้อมูลห้องประชุม</span>
          </router-link>
          <router-link to="/booking-list" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">📋</span> <span class="text-sm">รายการจองของฉัน</span>
          </router-link>
          <router-link to="/room-use" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🗂️</span> <span class="text-sm">ตารางการใช้ห้อง</span>
          </router-link>
          <router-link to="/room-status" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">ℹ️</span> <span class="text-sm">สถานะห้องประชุม</span>
          </router-link>
          <router-link to="/report" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">⚠️</span> <span class="text-sm">แจ้งปัญหา</span>
          </router-link>
          <router-link to="/my-invites" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">📨</span> <span class="text-sm">คำเชิญของฉัน</span>
          </router-link>
        </nav>
        <div class="p-3 border-t absolute bottom-0 left-0 right-0 bg-white">
          <button @click="logout" class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">ออกจากระบบ</button>
        </div>
      </div>
    </div>

    <!-- Page main (content area) -->
    <main class="lg:ml-64 pt-28 px-4 sm:px-6 lg:px-8 pb-12">
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- 3-card selector (keeps previous UI) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="r in rooms" :key="r.id" @click="selectCard(r.id)" class="relative rounded-2xl overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-all duration-200" :class="selectedId===r.id ? 'ring-4 ring-emerald-200' : ''">
            <img :src="r.images[0]" class="w-full h-44 sm:h-56 lg:h-52 object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
              <div class="text-white text-lg font-semibold">{{ r.roomName }}</div>
              <div class="text-sm text-gray-200 mt-1">{{ r.shortDescription }}</div>
              <div class="mt-3 flex flex-wrap gap-2">
                <button @click.stop="goToBooking(r.id)" class="px-3 py-1 bg-emerald-500 text-white rounded text-xs">จอง</button>
                <button @click.stop="openModal(r.images[0])" class="px-3 py-1 border rounded bg-white/10 text-white text-xs">Details</button>
              </div>
            </div>
          </div>
        </div>

        <!-- details (kept) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-4">
            <div class="relative rounded-2xl overflow-hidden shadow-md">
              <div class="w-full h-56 sm:h-72 lg:h-80 bg-gray-100">
                <img v-if="mainImage" :src="mainImage" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              </div>
              <div class="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 bg-black/60 text-white rounded-md px-4 py-3 max-w-[86%]">
                <div class="text-lg font-semibold">{{ selected.roomName }}</div>
                <div class="text-xs text-gray-200 mt-1">{{ selected.shortDescription }}</div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button @click="goToBooking(selected.id)" class="px-3 py-1 bg-emerald-500 rounded text-xs">จองห้องนี้</button>
                  <button @click="openModal(mainImage)" class="px-3 py-1 border rounded text-xs">ดูรูปใหญ่</button>
                </div>
              </div>
            </div>

            <div class="flex gap-3 mt-2 overflow-x-auto pb-1">
              <button v-for="(img, idx) in selected.images" :key="idx" @click="setPreview(idx)" class="flex-shrink-0 w-24 sm:w-28 h-16 sm:h-20 rounded-lg overflow-hidden border hover:shadow-sm" :class="previewIndex===idx ? 'ring-2 ring-emerald-300' : ''" style="min-width:6rem">
                <img :src="img" class="w-full h-full object-cover" />
              </button>
            </div>

            <div class="modern-card">
              <h3 class="text-lg font-semibold">{{ selected.roomName }}</h3>
              <p class="text-sm text-gray-600 mt-2">{{ selected.description }}</p>

              <div class="mt-4">
                <div class="text-xs text-gray-500 mb-2">สิ่งอำนวยความสะดวก</div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(a,i) in selected.amenities" :key="i" class="px-3 py-1 rounded-full bg-gray-50 text-xs border text-gray-700">{{ a }}</span>
                </div>
              </div>
            </div>

            <div class="modern-card">
              <h4 class="font-semibold">อุปกรณ์ (แตะเพื่อดูรูป)</h4>
              <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                <button v-for="(eq,i) in selected.equipment" :key="i" @click="openModal(equipmentSrc(eq))" class="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm text-sm">
                  <img :src="equipmentSrc(eq)" class="w-14 h-10 object-cover rounded" />
                  <div class="text-left">
                    <div class="font-medium">{{ equipmentName(eq) }}</div>
                    <div class="text-xs text-gray-500">อุปกรณ์</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <aside class="space-y-4">
            <div class="modern-card p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-xs text-gray-500">ห้อง</div>
                  <div class="font-semibold text-gray-900">{{ selected.roomName }}</div>
                  <div class="text-xs text-gray-400 mt-1">{{ selected.shortDescription }}</div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-gray-900">{{ selected.capacity }} คน</div>
                  <div class="text-xs text-gray-400">ความจุ</div>
                </div>
              </div>

              <div class="mt-4">
                <div class="text-xs text-gray-500">สถานะ</div>
                <div class="mt-2">
                  <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">ว่าง</span>
                </div>
              </div>

              <div class="mt-4 space-y-2">
                <button @click="goToBooking(selected.id)" class="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg">จองห้องนี้</button>
                <button @click="copyInfo" class="w-full px-3 py-2 border rounded-lg text-sm">คัดลอกข้อมูลห้อง</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>

    <!-- Image modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeModal">
      <div class="bg-white rounded-lg overflow-hidden w-full max-w-4xl h-[80vh] sm:h-[70vh]">
        <div class="flex justify-end p-2">
          <button @click="closeModal" class="px-3 py-1 text-sm border rounded">ปิด</button>
        </div>
        <div class="p-4 h-full">
          <img :src="modalImage" class="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()

/* header/mobile state */
const showMobileMenu = ref(false)
const showNotif = ref(false)
const me = ref({ name: 'ผู้ใช้ตัวอย่าง', email: 'user@example.com', avatarUrl: 'https://cdn-icons-png.flaticon.com/128/456/456283.png' })
const notifs = ref([
  { id: 'n1', title: 'การจองได้รับการอนุมัติ', message: 'การจองห้อง A ถูกอนุมัติ', isRead: false, createdAt: new Date().toISOString(), type: 'APPROVED' },
  { id: 'n2', title: 'เตือนการประชุม', message: 'การประชุม Room-50B ใน 1 ชั่วโมง', isRead: false, createdAt: new Date().toISOString(), type: 'REMINDER' }
])
const unreadCount = computed(() => notifs.value.filter(n => !n.isRead).length)

function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('me_cache')
  router.push('/login')
}
function toggleNotif() {
  showNotif.value = !showNotif.value
}
function refreshNotif() { /* mock no-op */ }
function markAllAsRead() { notifs.value = notifs.value.map(n => ({ ...n, isRead: true })) }
function goNotif(n) { if (!n.isRead) n.isRead = true; showNotif.value = false; router.push('/booking-list') }
function formatTime(iso) { const d = new Date(iso); return isNaN(d.getTime()) ? '' : d.toLocaleString('th-TH', { dateStyle:'short', timeStyle:'short' }) }
function handleClickOutside(e) {
  const dropdown = document.querySelector('[data-noti-dropdown]')
  const bellBtn = document.querySelector('[data-noti-bell]')
  if (!dropdown) { showNotif.value = false; return }
  if (!dropdown.contains(e.target) && !(bellBtn && bellBtn.contains(e.target))) showNotif.value = false
}

/* page content (rooms) */
const rooms = ref([
  {
    id: '30-A',
    roomName: 'Room-30A',
    capacity: 30,
    shortDescription: 'ห้องขนาดเล็ก เหมาะสำหรับ 20-30 คน',
    description: 'ห้องขนาด 30 ที่นั่ง เหมาะสำหรับการประชุมกลุ่มเล็ก มีโปรเจคเตอร์และไวไฟความเร็วสูง',
    images: ['https://i.ibb.co/fYZY2Lvw/30-new.jpg','https://i.ibb.co/bR2Gdhnn/30-2.png','https://i.ibb.co/jP9yCDXc/30-3.jpg'],
    amenities: ['โปรเจคเตอร์','ไวไฟ','ไวท์บอร์ด'],
    equipment: [{ name:'Projector', img:'https://i.ibb.co/jPQL9h5J/projec.jpg' }, { name:'Microphone', img:'https://i.ibb.co/C3ZGp0Qz/Mic.jpg' }]
  },
  {
    id: '50-B',
    roomName: 'Room-50B',
    capacity: 50,
    shortDescription: 'ห้องขนาดกลาง เหมาะสำหรับ 40-60 คน',
    description: 'ห้องขนาด 50 ที่นั่ง พร้อมระบบเสียง และกล้องประชุมทางไกล',
    images: ['https://i.ibb.co/LXsn50Zg/50-new.jpg','https://i.ibb.co/N6ctPt9Q/50-2-new.jpg','https://i.ibb.co/RpKRg2j1/50-3.png'],
    amenities: ['ระบบเสียง','กล้อง VC','ไวไฟ'],
    equipment: [{ name:'Video Conference', img:'https://i.ibb.co/2yQbF0D/vc.jpg' }, { name:'Speaker', img:'https://i.ibb.co/C3ZGp0Qz/Mic.jpg' }]
  },
  {
    id: '100-F',
    roomName: 'Room-100F',
    capacity: 100,
    shortDescription: 'ห้องขนาดใหญ่ เหมาะสำหรับ 80-120 คน',
    description: 'ห้องขนาด 100 ที่นั่ง เหมาะสำหรับสัมมนาหรือการประชุมใหญ่ มีเวทีและระบบฉายภาพคุณภาพสูง',
    images: ['https://i.ibb.co/ynYrXvs4/100-new.jpg','https://i.ibb.co/LXMmPRw3/100-2-new.jpg','https://i.ibb.co/HLcMsGcB/100-3-new.jpg'],
    amenities: ['เวที','ฉายภาพ','ระบบเสียงครบ'],
    equipment: [{ name:'Large Projector', img:'https://i.ibb.co/jPQL9h5J/projec.jpg' }, { name:'PA System', img:'https://i.ibb.co/C3ZGp0Qz/Mic.jpg' }]
  }
])

const selectedId = ref(route.query.id || rooms.value[0].id)
const previewIndex = ref(0)
const modalOpen = ref(false)
const modalImage = ref('')

const selected = computed(() => rooms.value.find(r => r.id === selectedId.value) || rooms.value[0])
const mainImage = computed(() => selected.value?.images?.[0] || '')

function selectCard(id) { selectedId.value = id }
function setPreview(i) {
  previewIndex.value = i
  const imgs = selected.value.images
  if (!imgs || !imgs[i]) return
  imgs.splice(0,0, imgs.splice(i,1)[0])
}
function openModal(src) { if(!src) return; modalImage.value = src; modalOpen.value = true }
function closeModal() { modalOpen.value = false; modalImage.value = '' }
function equipmentSrc(eq) { return typeof eq === 'string' ? eq : (eq.img || '') }
function equipmentName(eq) { return typeof eq === 'string' ? eq : (eq.name || '') }
function goToBooking(id) { router.push({ path: '/booking', query: { roomId: id || selected.value.id } }) }
// ใช้ SweetAlert แจ้งเตือนเมื่อคัดลอกข้อมูล
async function copyInfo() {
  const txt = `${selected.value.roomName} — ความจุ ${selected.value.capacity}\n${selected.value.description}`
  try {
    await navigator.clipboard.writeText(txt)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'คัดลอกข้อมูลแล้ว',
      showConfirmButton: false,
      timer: 1400
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'คัดลอกไม่สำเร็จ',
      text: err?.message || 'ไม่สามารถคัดลอกได้'
    })
  }
}

onMounted(() => {
  if (!rooms.value.find(r => r.id === selectedId.value)) selectedId.value = rooms.value[0].id
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.nav-link { @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900; }
.nav-active { @apply bg-blue-50 text-blue-600; }

.mobile-nav-link { @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900; }

.modern-card { @apply bg-white rounded-2xl border border-gray-200 p-6; }

.rounded-2xl { border-radius: 14px; }

/* simple fade */
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>