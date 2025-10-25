<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Fixed Left Sidebar - Hidden on mobile -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
      <div class="h-full flex flex-col">
        <!-- Logo Section -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl shadow-md">
              🏢
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">ระบบจองห้องประชุม</h3>
              <p class="text-[10px] text-gray-500">Admin Console</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link to="/admin/dashboard-modern" class="nav-link nav-active">
            <span class="text-lg">🏠</span>
            <span class="text-sm">Dashboard</span>
          </router-link>
          <router-link to="/admin/approvals" class="nav-link">
            <span class="text-lg">🛡️</span>
            <span class="text-sm">Approvals</span>
          </router-link>
          <router-link to="/admin/my-bookings" class="nav-link">
            <span class="text-lg">📋</span>
            <span class="text-sm">My Bookings</span>
          </router-link>
          <router-link to="/admin/issues" class="nav-link">
            <span class="text-lg">⚠️</span>
            <span class="text-sm">Issues</span>
          </router-link>
          <router-link to="/admin/loans" class="nav-link">
            <span class="text-lg">🔌</span>
            <span class="text-sm">Loans</span>
          </router-link>
          <router-link to="/admin/room-status" class="nav-link">
            <span class="text-lg">ℹ️</span>
            <span class="text-sm">Room Status</span>
          </router-link>
        </nav>

        <!-- Footer -->
        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'Admin' }}</div>
              <div class="text-[10px] text-gray-500 truncate">{{ me?.email || '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Header -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white border-b border-gray-200">
      <div class="w-full px-8 py-4 flex justify-between items-center">
        <!-- Left -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-lg lg:hidden">
            🏢
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900 m-0">Admin Dashboard</h2>
            <p class="text-xs text-gray-500 m-0 hidden sm:block lg:hidden">จัดการระบบจองห้องประชุม</p>
          </div>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-3">
          <!-- Search (Desktop only) -->
          <div class="hidden md:block relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </span>
            <input 
              v-model="q" 
              placeholder="Search..." 
              class="w-64 pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          <!-- Mobile Menu Toggle -->
          <button @click="showMobileMenu = !showMobileMenu" class="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button
              data-noti-bell
              class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 relative"
              @click="toggleNotif"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <!-- Dropdown -->
            <div
              v-if="showNotif"
              data-noti-dropdown
              class="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50"
            >
              <div class="p-3 border-b border-gray-100">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-900">การแจ้งเตือน</span>
                    <span class="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-medium">{{ unreadCount }}</span>
                  </div>
                  <button @click="showNotif=false" class="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>

              <div class="max-h-[60vh] sm:max-h-80 overflow-y-auto">
                <div v-if="loadingNoti" class="p-6 text-center">
                  <div class="inline-block w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <p class="text-xs text-gray-500 mt-2">กำลังโหลด...</p>
                </div>

                <template v-else>
                  <div v-if="notifs.length === 0" class="p-8 text-center">
                    <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                    </div>
                    <p class="text-xs text-gray-500 font-medium">ไม่มีการแจ้งเตือน</p>
                  </div>
                  <div v-else class="divide-y divide-gray-100">
                    <div
                      v-for="n in notifs"
                      :key="n.id"
                      class="p-3 hover:bg-gray-50 flex items-start gap-3 cursor-pointer"
                      @click="goNotif(n)"
                    >
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" :class="n.isRead ? 'bg-gray-100' : 'bg-blue-50'">
                        <span v-if="n.type === 'APPROVED'">✅</span>
                        <span v-else-if="n.type === 'REJECTED'">❌</span>
                        <span v-else>📣</span>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-medium" :class="n.isRead ? 'text-gray-600' : 'text-gray-900'">
                          {{ n.title || 'การแจ้งเตือน' }}
                        </div>
                        <div class="text-[11px] text-gray-500 mt-0.5">
                          {{ n.message || '-' }}
                        </div>
                        <div class="text-[9px] text-gray-400 mt-1">
                          {{ formatTime(n.createdAt) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <div class="p-2 border-t border-gray-100 flex gap-2">
                <button class="flex-1 text-[10px] px-2 py-1.5 hover:bg-gray-50 border border-gray-200 rounded-lg font-medium" @click="refreshNotif">
                  🔄 รีเฟรช
                </button>
                <button class="flex-1 text-[10px] px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50" @click="markAllAsRead" :disabled="unreadCount===0">
                  ✓ อ่านทั้งหมด
                </button>
              </div>
            </div>
          </div>

          <!-- Create Button -->
          <button @click="goCreate" class="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            สร้างการจอง
          </button>

          <!-- Profile (Desktop) -->
          <router-link to="/profile" class="hidden sm:block">
            <div class="w-10 h-10 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500">
              <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-full h-full object-cover" />
            </div>
          </router-link>

          <!-- Logout -->
          <button @click="logout" class="hidden sm:block px-4 py-2.5 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Menu -->
    <div v-if="showMobileMenu" class="lg:hidden fixed inset-0 z-50 bg-black/20" @click="showMobileMenu = false">
      <div class="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl" @click.stop>
        <div class="p-4 border-b">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-900 text-sm">เมนู</h3>
            <button @click="showMobileMenu = false" class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <router-link to="/profile" class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'Admin' }}</div>
              <div class="text-[10px] text-gray-500">ดูโปรไฟล์</div>
            </div>
          </router-link>
        </div>
        <nav class="p-2 space-y-1">
          <router-link to="/admin/dashboard-modern" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🏠</span> <span class="text-sm">Dashboard</span>
          </router-link>
          <router-link to="/admin/approvals" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🛡️</span> <span class="text-sm">Approvals</span>
          </router-link>
          <router-link to="/admin/my-bookings" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">📋</span> <span class="text-sm">My Bookings</span>
          </router-link>
          <router-link to="/admin/issues" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">⚠️</span> <span class="text-sm">Issues</span>
          </router-link>
          <router-link to="/admin/loans" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🔌</span> <span class="text-sm">Loans</span>
          </router-link>
          <router-link to="/admin/room-status" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">ℹ️</span> <span class="text-sm">Room Status</span>
          </router-link>
        </nav>
        <div class="p-3 border-t absolute bottom-0 left-0 right-0 bg-white">
          <button @click="logout" class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full min-h-[calc(100vh-5rem)] px-8 py-6">
        <div class="max-w-7xl mx-auto space-y-6">
          <!-- Page Header -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg">
              📊
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 m-0">Dashboard</h1>
              <p class="text-base text-gray-500 m-0 mt-1">ภาพรวมระบบจองห้องประชุม</p>
            </div>
          </div>

          <!-- KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">📋</div>
                <div>
                  <div class="text-sm text-gray-500">ทั้งหมด</div>
                  <div class="text-2xl font-bold text-gray-900">{{ kpi.total }}</div>
                </div>
              </div>
            </div>

            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">✅</div>
                <div>
                  <div class="text-sm text-gray-500">อนุมัติแล้ว</div>
                  <div class="text-2xl font-bold text-green-600">{{ kpi.approved }}</div>
                </div>
              </div>
            </div>

            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">⏳</div>
                <div>
                  <div class="text-sm text-gray-500">รออนุมัติ</div>
                  <div class="text-2xl font-bold text-amber-600">{{ kpi.pending }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts & Lists -->
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <!-- Usage Chart -->
            <div class="modern-card shadow-md">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">การใช้งาน (7 วันที่ผ่านมา)</h2>
                <select v-model="days" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option :value="7">7 วันล่าสุด</option>
                  <option :value="30">30 วันล่าสุด</option>
                </select>
              </div>

              <div class="h-64 flex items-end gap-2">
                <div
                  v-for="(v, i) in chartData"
                  :key="i"
                  class="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer"
                  :style="{ height: Math.max(10, v.valuePct) + '%' }"
                  :title="`${v.label}: ${v.count} การจอง`"
                >
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-700">{{ v.count }}</div>
                </div>
              </div>
              <div class="mt-4 grid" :style="{ gridTemplateColumns: `repeat(${chartData.length}, 1fr)` }">
                <div v-for="(v, i) in chartData" :key="'l' + i" class="text-center text-xs text-gray-500">{{ v.label }}</div>
              </div>
            </div>

            <!-- Recent Bookings -->
            <div class="modern-card shadow-md">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">การจองล่าสุด</h2>
              
              <div v-if="recentBookings.length === 0" class="text-center py-8">
                <p class="text-gray-500">ไม่มีข้อมูล</p>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="b in recentBookings"
                  :key="b.id"
                  class="p-3 border border-gray-200 rounded-xl hover:shadow-md transition-all"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900 mb-1">{{ b.room?.roomName || '-' }}</h3>
                      <div class="text-sm text-gray-600 mb-1">
                        {{ timeRange(b.startTime, b.endTime) }}
                      </div>
                      <div class="text-xs text-gray-500">
                        📅 {{ dateTH(b.startTime) }}
                      </div>
                    </div>
                    <span :class="['px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap', badge(b.status)]">
                      {{ statusTH(b.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Section -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Top Rooms -->
            <div class="modern-card shadow-md">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">ห้องยอดนิยม</h2>
              
              <div v-if="topRooms.length === 0" class="text-center py-8">
                <p class="text-gray-500">ไม่มีข้อมูล</p>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="(r, idx) in topRooms"
                  :key="idx"
                  class="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:shadow-md transition-all"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-lg">
                      🏷️
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">{{ r.name }}</div>
                      <div class="text-xs text-gray-500">{{ r.count }} ครั้ง</div>
                    </div>
                  </div>
                  <span v-if="r.active" class="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                  <span v-else class="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">Offline</span>
                </div>
              </div>
            </div>

            <!-- Room Status Summary Widget -->
            <div class="modern-card shadow-md">
              <RoomStatusSummary />
            </div>

            <!-- Today Calendar Widget -->
            <div class="modern-card shadow-md">
              <TodayCalendar />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'
import TodayCalendar from '@/components/widgets/TodayCalendar.vue'
import RoomStatusSummary from '@/components/widgets/RoomStatusSummary.vue'
import Announcements from '@/components/widgets/Announcements.vue'

const router = useRouter()
const showMobileMenu = ref(false)
const q = ref('')
const days = ref(7)

const me = ref(null)

/** Notifications */
const showNotif = ref(false)
const notifs = ref([])
const unreadCount = ref(0)
const loadingNoti = ref(false)

/** KPIs */
const kpi = ref({ total: 0, approved: 0, pending: 0 })
const deltas = ref({ approved: 0, pending: 0 })

/** Lists/Chart */
const recentBookings = ref([])
const chartData = ref([])
const topRooms = ref([])

async function fetchMe() {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = data
  } catch {
    me.value = null
  }
}

function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_role')
  localStorage.removeItem('me_cache')
  router.push('/login')
}

function goCreate() {
  router.push('/booking')
}

async function fetchNotifications() {
  loadingNoti.value = true
  try {
    const { data } = await api.get('/api/notifications')
    notifs.value = data.items || []
    unreadCount.value = notifs.value.filter(n => !n.isRead).length
  } catch (e) {
    console.error(e)
  } finally {
    loadingNoti.value = false
  }
}

function formatTime(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

function toggleNotif() {
  showNotif.value = !showNotif.value
  if (showNotif.value) fetchNotifications()
}

function refreshNotif() {
  return fetchNotifications()
}

async function markAllAsRead() {
  try {
    await api.post('/api/notifications/mark-all-read')
    notifs.value = notifs.value.map(n => ({ ...n, isRead: true }))
    unreadCount.value = 0
  } catch (e) {
    console.error(e)
  }
}

async function markAsRead(n) {
  try {
    await api.patch(`/api/notifications/${n.id}/read`)
    n.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch (e) {
    console.error(e)
  }
}

function resolveRouteByNotif(n) {
  const refType = n?.refType
  const refId = n?.refId
  switch (refType) {
    case 'BOOKING':
      return refId ? { path: `/booking/${refId}` } : { path: '/booking-list' }
    case 'ISSUE':
      return { path: '/report', query: refId ? { issueId: String(refId) } : {} }
    case 'INVITE':
      return { path: '/my-invites' }
    default:
      return { path: '/admin/dashboard-modern' }
  }
}

async function goNotif(n) {
  try {
    if (!n.isRead) {
      n.isRead = true
      await markAsRead(n)
    }
    showNotif.value = false
    router.push(resolveRouteByNotif(n))
  } catch (e) {
    n.isRead = false
    console.error(e)
  }
}

function handleClickOutside(e) {
  const dropdown = document.querySelector('[data-noti-dropdown]')
  const bellBtn = document.querySelector('[data-noti-bell]')
  if (!dropdown) {
    showNotif.value = false
    return
  }
  if (!dropdown.contains(e.target) && !(bellBtn && bellBtn.contains(e.target))) {
    showNotif.value = false
  }
}

function statusTH(s) {
  if (s === 'APPROVED') return 'อนุมัติแล้ว'
  if (s === 'AWAITING_ADMIN_APPROVAL') return 'รออนุมัติ'
  if (s === 'AWAITING_ATTENDEE_CONFIRM') return 'รอยืนยัน'
  if (s === 'CANCELLED') return 'ยกเลิกแล้ว'
  return s || '-'
}

function badge(s) {
  if (s === 'APPROVED') return 'bg-green-500 text-white'
  if (s === 'AWAITING_ADMIN_APPROVAL') return 'bg-amber-100 text-amber-800'
  if (s === 'AWAITING_ATTENDEE_CONFIRM') return 'bg-blue-100 text-blue-800'
  if (s === 'CANCELLED') return 'bg-gray-200 text-gray-700'
  return 'bg-gray-100 text-gray-700'
}

function dateTH(iso) {
  const d = new Date(iso)
  const m = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`
}

function timeRange(s, e) {
  const opt = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(s).toLocaleTimeString([], opt)} - ${new Date(e).toLocaleTimeString([], opt)}`
}

async function loadKPIs() {
  try {
    const params = { page: 1, pageSize: 1 }
    const [p, a] = await Promise.all([
      api.get('/api/bookings', { params: { ...params, status: 'AWAITING_ADMIN_APPROVAL' } }),
      api.get('/api/bookings', { params: { ...params, status: 'APPROVED' } })
    ])
    const getTotal = r => typeof r?.data?.total === 'number' ? r.data.total : (Array.isArray(r?.data?.items) ? r.data.items.length : 0)
    const pending = getTotal(p)
    const approved = getTotal(a)
    kpi.value = { total: pending + approved, approved, pending }
    deltas.value = { approved: 36, pending: 12 }
  } catch {
    kpi.value = { total: 0, approved: 0, pending: 0 }
  }
}

function groupByDate(items, daysBack) {
  const map = new Map()
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    map.set(d.toISOString().slice(0, 10), { date: d, count: 0 })
  }
  items.forEach(b => {
    const k = new Date(b.startTime)
    k.setHours(0, 0, 0, 0)
    const key = k.toISOString().slice(0, 10)
    if (map.has(key)) map.get(key).count++
  })
  const max = Math.max(1, ...Array.from(map.values()).map(v => v.count))
  return Array.from(map.values()).map(v => ({
    label: v.date.toLocaleDateString('th-TH', { weekday: 'short' }),
    count: v.count,
    valuePct: Math.round((v.count / max) * 100)
  }))
}

async function loadRecentAndChart() {
  const since = new Date()
  since.setDate(since.getDate() - days.value)
  const { data } = await api.get('/api/bookings', {
    params: { page: 1, pageSize: 500, sort: '-createdAt', start_gte: since.toISOString() }
  })
  const list = Array.isArray(data?.items) ? data.items : []
  recentBookings.value = list.slice(0, 8)
  chartData.value = groupByDate(list, Math.min(days.value, 7))

  // top rooms
  const roomMap = new Map()
  list.forEach(b => {
    const name = b.room?.roomName || '-'
    roomMap.set(name, (roomMap.get(name) || 0) + 1)
  })
  topRooms.value = Array.from(roomMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count, active: true }))
}

let notiTimer = null

onMounted(async () => {
  await fetchMe()
  await Promise.all([loadKPIs(), loadRecentAndChart(), fetchNotifications()])
  notiTimer = setInterval(() => fetchNotifications(), 30000)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (notiTimer) clearInterval(notiTimer)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900;
}
.nav-active {
  @apply bg-blue-50 text-blue-600;
}

.mobile-nav-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900;
}

.modern-card {
  @apply bg-white rounded-2xl border border-gray-200 p-6;
}
</style>