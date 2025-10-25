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
              <p class="text-[10px] text-gray-500">Meeting Room System</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link to="/" class="nav-link" :class="$route.path === '/' ? 'nav-active' : ''">
            <span class="text-lg">🏠</span>
            <span class="text-sm">หน้าแรก</span>
          </router-link>
          <router-link to="/booking" class="nav-link" :class="$route.path === '/booking' ? 'nav-active' : ''">
            <span class="text-lg">📅</span>
            <span class="text-sm">จองห้องประชุม</span>
          </router-link>
          <router-link to="/booking-list" class="nav-link" :class="$route.path === '/booking-list' ? 'nav-active' : ''">
            <span class="text-lg">📋</span>
            <span class="text-sm">รายการจองของฉัน</span>
          </router-link>
          <router-link to="/room-use" class="nav-link" :class="$route.path === '/room-use' ? 'nav-active' : ''">
            <span class="text-lg">🗂️</span>
            <span class="text-sm">ตารางการใช้ห้อง</span>
          </router-link>
          <router-link to="/room-status" class="nav-link nav-active">
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

        <!-- Footer -->
        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'ผู้ใช้' }}</div>
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
            <h2 class="text-lg font-semibold text-gray-900 m-0">ระบบจองห้องประชุม</h2>
            <p class="text-xs text-gray-500 m-0 hidden sm:block lg:hidden">Meeting Room Booking System</p>
          </div>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-3">
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

          <!-- Profile -->
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
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'ผู้ใช้' }}</div>
              <div class="text-[10px] text-gray-500">ดูโปรไฟล์</div>
            </div>
          </router-link>
        </div>
        <nav class="p-2 space-y-1">
          <router-link to="/" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🏠</span> <span class="text-sm">หน้าแรก</span>
          </router-link>
          <router-link to="/booking" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">📅</span> <span class="text-sm">จองห้องประชุม</span>
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
          <button @click="logout" class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full h-[calc(100vh-5rem)] px-8 py-6 overflow-y-auto">
        <div class="max-w-full space-y-6">
          <!-- Page Header -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg">
              ℹ️
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 m-0">สถานะห้องประชุม</h1>
              <p class="text-base text-gray-500 m-0 mt-1">ดูสถานะการใช้งานห้องประชุมในวันนี้</p>
            </div>
          </div>

          <!-- Current Time Info -->
          <div class="modern-card shadow-md">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-500">วันที่และเวลาปัจจุบัน</div>
                <div class="text-2xl font-bold text-gray-900 mt-1">{{ currentDateTime }}</div>
              </div>
              <button @click="fetchRoomStatus" class="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium">
                🔄 รีเฟรช
              </button>
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">✅</div>
                <div>
                  <div class="text-sm text-gray-500">ห้องว่าง</div>
                  <div class="text-2xl font-bold text-green-600">{{ availableCount }}</div>
                </div>
              </div>
            </div>

            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">🔴</div>
                <div>
                  <div class="text-sm text-gray-500">กำลังใช้งาน</div>
                  <div class="text-2xl font-bold text-red-600">{{ inUseCount }}</div>
                </div>
              </div>
            </div>

            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">⏰</div>
                <div>
                  <div class="text-sm text-gray-500">จองล่วงหน้า</div>
                  <div class="text-2xl font-bold text-amber-600">{{ reservedCount }}</div>
                </div>
              </div>
            </div>

            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">🔧</div>
                <div>
                  <div class="text-sm text-gray-500">ปิดบำรุงรักษา</div>
                  <div class="text-2xl font-bold text-gray-600">{{ maintenanceCount }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Room Status List -->
          <div class="modern-card shadow-md">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">รายการห้องทั้งหมด ({{ roomStatuses.length }})</h2>
              <div class="flex items-center gap-3">
                <label class="text-sm font-medium text-gray-700">กรอง:</label>
                <select v-model="filterStatus" class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white">
                  <option value="">ทั้งหมด</option>
                  <option value="AVAILABLE">ว่าง</option>
                  <option value="IN_USE">กำลังใช้งาน</option>
                  <option value="RESERVED">จองล่วงหน้า</option>
                  <option value="MAINTENANCE">บำรุงรักษา</option>
                </select>
              </div>
            </div>

            <div v-if="loading" class="text-center py-12">
              <div class="inline-block w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p class="text-gray-500 mt-4">กำลังโหลดข้อมูล...</p>
            </div>

            <div v-else-if="filteredRoomStatuses.length === 0" class="text-center py-12">
              <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <p class="text-gray-500 font-medium">ไม่พบห้องประชุม</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="status in filteredRoomStatuses"
                :key="status.room.id"
                class="border-2 rounded-xl p-4 hover:shadow-md transition-all"
                :class="borderClass(status.status)"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 mb-1">
                      {{ status.room.roomName }}
                    </h3>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <span v-if="status.room.capacity">👥 {{ status.room.capacity }} ที่นั่ง</span>
                      <span v-if="status.room.floor">📍 ชั้น {{ status.room.floor }}</span>
                    </div>
                  </div>
                  <span :class="['px-3 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap', statusBadge(status.status)]">
                    {{ statusText(status.status) }}
                  </span>
                </div>

                <!-- Current/Next Booking Info -->
                <div v-if="status.currentBooking" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div class="text-xs font-semibold text-red-800 mb-1">🔴 กำลังใช้งาน</div>
                  <div class="text-sm text-red-700">
                    {{ timeRange(status.currentBooking.startTime, status.currentBooking.endTime) }}
                  </div>
                  <div class="text-xs text-red-600 mt-1">
                    โดย {{ status.currentBooking.bookedBy?.fullName || '-' }}
                  </div>
                </div>

                <div v-else-if="status.nextBooking" class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div class="text-xs font-semibold text-amber-800 mb-1">⏰ จองถัดไป</div>
                  <div class="text-sm text-amber-700">
                    {{ timeRange(status.nextBooking.startTime, status.nextBooking.endTime) }}
                  </div>
                  <div class="text-xs text-amber-600 mt-1">
                    โดย {{ status.nextBooking.bookedBy?.fullName || '-' }}
                  </div>
                </div>

                <div v-else-if="status.status === 'AVAILABLE'" class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div class="text-sm text-green-700 font-medium">✅ ว่างตลอดวัน</div>
                </div>

                <div v-else-if="status.status === 'MAINTENANCE'" class="mt-3 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                  <div class="text-sm text-gray-700 font-medium">🔧 ปิดบำรุงรักษา</div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'

const router = useRouter()
const showMobileMenu = ref(false)
const me = ref(null)
const loading = ref(false)
const roomStatuses = ref([])
const filterStatus = ref('')
const currentDateTime = ref('')

/** Notifications */
const showNotif = ref(false)
const notifs = ref([])
const unreadCount = ref(0)
const loadingNoti = ref(false)

function logout () {
  localStorage.removeItem('access_token')
  localStorage.removeItem('me_cache')
  router.push('/login')
}

async function fetchMe () {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = data
  } catch { me.value = null }
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

function formatTime (iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

function toggleNotif () {
  showNotif.value = !showNotif.value
  if (showNotif.value) fetchNotifications()
}

function refreshNotif () { return fetchNotifications() }

async function markAllAsRead () {
  try {
    await api.post('/api/notifications/mark-all-read')
    notifs.value = notifs.value.map(n => ({ ...n, isRead: true }))
    unreadCount.value = 0
  } catch (e) { console.error(e) }
}

async function markAsRead (n) {
  try {
    await api.patch(`/api/notifications/${n.id}/read`)
    n.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch (e) { console.error(e) }
}

function resolveRouteByNotif (n) {
  const refType = n?.refType
  const refId = n?.refId
  switch (refType) {
    case 'BOOKING': return refId ? { path: `/booking/${refId}` } : { path: '/booking-list' }
    case 'ISSUE': return { path: '/report', query: refId ? { issueId: String(refId) } : {} }
    case 'INVITE': return { path: '/my-invites' }
    default: return { path: '/home' }
  }
}

async function goNotif (n) {
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

function handleClickOutside (e) {
  const dropdown = document.querySelector('[data-noti-dropdown]')
  const bellBtn = document.querySelector('[data-noti-bell]')
  if (!dropdown) { showNotif.value = false; return }
  if (!dropdown.contains(e.target) && !(bellBtn && bellBtn.contains(e.target))) {
    showNotif.value = false
  }
}

// Room status functions
let roomRefreshTimer = null

async function fetchRoomStatus() {
  loading.value = true
  try {
    const now = new Date()
    const fromDate = new Date(now); fromDate.setDate(now.getDate() - 1)
    const toDate = new Date(now); toDate.setDate(now.getDate() + 7)

    const [roomsRes, bookingsRes] = await Promise.all([
      api.get('/api/rooms', { params: { all: 1 } }),
      api.get('/api/bookings', { params: { from: fromDate.toISOString().slice(0,10), to: toDate.toISOString().slice(0,10), page: 1, pageSize: 1000 } })
    ])

    const roomsRaw = roomsRes?.data?.items ?? roomsRes?.data ?? []
    const bookingsRaw = bookingsRes?.data?.items ?? bookingsRes?.data ?? []

    // normalize bookings: unify start/end field names to ISO strings
    const bookings = (Array.isArray(bookingsRaw) ? bookingsRaw : []).map(b => {
      const s = b.startAt ?? b.startTime ?? b.start ?? b.from
      const e = b.endAt ?? b.endTime ?? b.end ?? b.to
      return { ...b, start: s ? new Date(s).toISOString() : null, end: e ? new Date(e).toISOString() : null }
    }).filter(b => b.start && b.end)

    roomStatuses.value = (Array.isArray(roomsRaw) ? roomsRaw : []).map(r => {
      const roomId = r.id
      // select bookings for this room (handle different backend shapes)
      const roomBookings = bookings.filter(b =>
        (b.roomId && String(b.roomId) === String(roomId)) ||
        (b.room && (String(b.room.id) === String(roomId) || String(b.room.roomName) === String(r.roomName))) ||
        (b.roomId === roomId)
      )

      const nowDate = new Date()
      const current = roomBookings.find(b => {
        const s = new Date(b.start); const e = new Date(b.end)
        return s <= nowDate && nowDate < e
      }) || null

      const next = roomBookings
        .filter(b => new Date(b.start) > nowDate)
        .sort((a,b) => new Date(a.start) - new Date(b.start))[0] || null

      // base on manual room.status unless maintenance/unavailable
      let status = (r.status || '').toString().toUpperCase()
      if (status === 'UNAVAILABLE' || status === 'MAINTENANCE') {
        status = 'MAINTENANCE'
      } else if (current) {
        status = 'IN_USE'
      } else if (next) {
        status = 'RESERVED'
      } else {
        status = 'AVAILABLE'
      }

      return {
        room: {
          id: roomId,
          roomName: r.roomName || r.name || `ห้อง ${roomId}`,
          capacity: r.capacity ?? null,
          floor: r.floor ?? null
        },
        status,
        statusLabel: r.statusLabel || status,
        currentBooking: current ? { startTime: current.start, endTime: current.end, bookedBy: current.requester || current.user || current.bookedBy } : null,
        nextBooking: next ? { startTime: next.start, endTime: next.end, bookedBy: next.requester || next.user || next.bookedBy } : null
      }
    })
  } catch (e) {
    console.error('fetchRoomStatus', e)
    roomStatuses.value = []
  } finally {
    loading.value = false
  }
}

function updateCurrentTime() {
  const now = new Date()
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  currentDateTime.value = now.toLocaleString('th-TH', options)
}

const filteredRoomStatuses = computed(() => {
  if (!filterStatus.value) return roomStatuses.value
  return roomStatuses.value.filter(s => s.status === filterStatus.value)
})

const availableCount = computed(() => roomStatuses.value.filter(s => s.status === 'AVAILABLE').length)
const inUseCount = computed(() => roomStatuses.value.filter(s => s.status === 'IN_USE').length)
const reservedCount = computed(() => roomStatuses.value.filter(s => s.status === 'RESERVED').length)
const maintenanceCount = computed(() => roomStatuses.value.filter(s => s.status === 'MAINTENANCE').length)

function statusText(status) {
  switch (status) {
    case 'AVAILABLE': return 'ว่าง'
    case 'IN_USE': return 'กำลังใช้งาน'
    case 'RESERVED': return 'จองล่วงหน้า'
    case 'MAINTENANCE': return 'บำรุงรักษา'
    default: return status
  }
}

function statusBadge(status) {
  switch (status) {
    case 'AVAILABLE': return 'bg-green-500 text-white'
    case 'IN_USE': return 'bg-red-500 text-white'
    case 'RESERVED': return 'bg-amber-500 text-white'
    case 'MAINTENANCE': return 'bg-gray-400 text-white'
    default: return 'bg-gray-200 text-gray-700'
  }
}

function borderClass(status) {
  switch (status) {
    case 'AVAILABLE': return 'border-green-300 bg-green-50'
    case 'IN_USE': return 'border-red-300 bg-red-50'
    case 'RESERVED': return 'border-amber-300 bg-amber-50'
    case 'MAINTENANCE': return 'border-gray-300 bg-gray-50'
    default: return 'border-gray-200'
  }
}

function timeRange(s, e) {
  const opt = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(s).toLocaleTimeString([], opt)} - ${new Date(e).toLocaleTimeString([], opt)}`
}

let notiTimer = null
let clockTimer = null

onMounted(async () => {
  await fetchMe()
  await fetchRoomStatus()
  await fetchNotifications()
  updateCurrentTime()

  // refresh room status every 60s
  roomRefreshTimer = setInterval(fetchRoomStatus, 60000)
  notiTimer = setInterval(() => fetchNotifications(), 30000)
  clockTimer = setInterval(updateCurrentTime, 1000)

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (roomRefreshTimer) clearInterval(roomRefreshTimer)
  if (notiTimer) clearInterval(notiTimer)
  if (clockTimer) clearInterval(clockTimer)
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