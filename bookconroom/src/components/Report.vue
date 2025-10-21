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
          <router-link to="/room-status" class="nav-link" :class="$route.path === '/room-status' ? 'nav-active' : ''">
            <span class="text-lg">ℹ️</span>
            <span class="text-sm">สถานะห้องประชุม</span>
          </router-link>
          <router-link to="/report" class="nav-link nav-active">
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
        <div class="max-w-3xl mx-auto space-y-6">
          <!-- Page Header -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-3xl shadow-lg">
              ⚠️
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 m-0">แจ้งปัญหา</h1>
              <p class="text-base text-gray-500 m-0 mt-1">แจ้งปัญหาการใช้งานระบบจองห้องประชุม</p>
            </div>
          </div>

          <!-- Report Form -->
          <div class="modern-card shadow-md">
            <form @submit.prevent="submitReport" class="space-y-6">
              <!-- Issue Type -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-3">
                  ประเภทปัญหา <span class="text-red-500">*</span>
                </label>
                <select 
                  v-model="form.issueType" 
                  required
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">-- เลือกประเภทปัญหา --</option>
                  <option value="BOOKING_EQUIPMENT">ปัญหาการเลือกอุปกรณ์เสริม</option>
                  <option value="BOOKING_CONFIRMATION">ปัญหาการยืนยันการเข้าร่วมประชุม</option>
                  <option value="BOOKING_DOCUMENT">ปัญหาการสร้างเอกสารยืนยันการจอง</option>
                  <option value="BOOKING_APPROVAL">ปัญหาการอนุมัติการจองห้อง</option>
                  <option value="BOOKING_SUPPORT">ปัญหาการขอใช้บริการฝ่ายสนับสนุน</option>
                  <option value="SYSTEM_ERROR">ข้อผิดพลาดของระบบ</option>
                  <option value="OTHER">อื่นๆ</option>
                </select>
              </div>

              <!-- Subject -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-3">
                  หัวข้อ <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.subject"
                  type="text" 
                  required
                  placeholder="กรุณาระบุหัวข้อปัญหา"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-3">
                  รายละเอียดปัญหา <span class="text-red-500">*</span>
                </label>
                <textarea 
                  v-model="form.description"
                  rows="6"
                  required
                  placeholder="กรุณาอธิบายปัญหาที่พบโดยละเอียด..."
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
              </div>

              <!-- Priority -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-3">
                  ระดับความสำคัญ
                </label>
                <div class="flex flex-wrap gap-3">
                  <label class="flex items-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all" :class="form.priority === 'LOW' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'">
                    <input type="radio" v-model="form.priority" value="LOW" class="form-radio text-blue-600">
                    <span class="text-sm font-medium">🟢 ต่ำ</span>
                  </label>
                  <label class="flex items-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all" :class="form.priority === 'MEDIUM' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'">
                    <input type="radio" v-model="form.priority" value="MEDIUM" class="form-radio text-amber-600">
                    <span class="text-sm font-medium">🟡 ปานกลาง</span>
                  </label>
                  <label class="flex items-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all" :class="form.priority === 'HIGH' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'">
                    <input type="radio" v-model="form.priority" value="HIGH" class="form-radio text-red-600">
                    <span class="text-sm font-medium">🔴 สูง</span>
                  </label>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t">
                <button 
                  type="button"
                  @click="resetForm"
                  class="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium"
                >
                  ล้างข้อมูล
                </button>
                <button 
                  type="submit"
                  :disabled="submitting"
                  class="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span v-if="submitting">⏳</span>
                  <span v-else>✓</span>
                  {{ submitting ? 'กำลังส่ง...' : 'ส่งรายงาน' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Recent Issues (Optional) -->
          <div class="modern-card shadow-md">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">รายการแจ้งปัญหาล่าสุด</h2>
            
            <div v-if="loadingIssues" class="text-center py-8">
              <div class="inline-block w-8 h-8 border-3 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
            </div>

            <div v-else-if="recentIssues.length === 0" class="text-center py-8">
              <p class="text-gray-500">ยังไม่มีรายการแจ้งปัญหา</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="issue in recentIssues"
                :key="issue.id"
                class="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 mb-1">{{ issue.subject }}</h3>
                    <p class="text-sm text-gray-600 mb-2">{{ issue.description }}</p>
                    <div class="flex items-center gap-3 text-xs text-gray-500">
                      <span>📅 {{ formatDate(issue.createdAt) }}</span>
                      <span :class="priorityColor(issue.priority)">{{ priorityText(issue.priority) }}</span>
                    </div>
                  </div>
                  <span :class="['px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap', statusColor(issue.status)]">
                    {{ statusText(issue.status) }}
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
import Swal from 'sweetalert2'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'

const router = useRouter()
const showMobileMenu = ref(false)
const me = ref(null)

/** Form State */
const form = ref({
  issueType: '',
  subject: '',
  description: '',
  priority: 'MEDIUM'
})
const submitting = ref(false)

/** Issues List */
const recentIssues = ref([])
const loadingIssues = ref(false)

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

function formatDate (iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
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

/** Report Functions */
async function submitReport () {
  if (submitting.value) return
  
  submitting.value = true
  try {
    await api.post('/api/issues', {
      issueType: form.value.issueType,
      subject: form.value.subject,
      description: form.value.description,
      priority: form.value.priority
    })

    await Swal.fire({
      icon: 'success',
      title: 'ส่งรายงานสำเร็จ',
      text: 'ทีมงานจะดำเนินการตรวจสอบและแก้ไขโดยเร็วที่สุด',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#dc2626'
    })

    resetForm()
    await fetchRecentIssues()
  } catch (e) {
    console.error(e)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: e?.response?.data?.error || 'ไม่สามารถส่งรายงานได้',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    submitting.value = false
  }
}

function resetForm () {
  form.value = {
    issueType: '',
    subject: '',
    description: '',
    priority: 'MEDIUM'
  }
}

async function fetchRecentIssues () {
  loadingIssues.value = true
  try {
    const { data } = await api.get('/api/issues/my', {
      params: { page: 1, pageSize: 5 }
    })
    recentIssues.value = Array.isArray(data?.items) ? data.items : []
  } catch (e) {
    console.error(e)
  } finally {
    loadingIssues.value = false
  }
}

function priorityText (p) {
  switch (p) {
    case 'LOW': return '🟢 ต่ำ'
    case 'MEDIUM': return '🟡 ปานกลาง'
    case 'HIGH': return '🔴 สูง'
    default: return p
  }
}

function priorityColor (p) {
  switch (p) {
    case 'LOW': return 'text-green-600'
    case 'MEDIUM': return 'text-amber-600'
    case 'HIGH': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

function statusText (s) {
  switch (s) {
    case 'PENDING': return 'รอดำเนินการ'
    case 'IN_PROGRESS': return 'กำลังดำเนินการ'
    case 'RESOLVED': return 'แก้ไขแล้ว'
    case 'CLOSED': return 'ปิดงาน'
    default: return s
  }
}

function statusColor (s) {
  switch (s) {
    case 'PENDING': return 'bg-amber-100 text-amber-800'
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
    case 'RESOLVED': return 'bg-green-500 text-white'
    case 'CLOSED': return 'bg-gray-200 text-gray-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

let notiTimer = null

onMounted(async () => {
  await fetchMe()
  await fetchNotifications()
  await fetchRecentIssues()
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