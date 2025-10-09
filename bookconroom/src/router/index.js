// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// --- Pages ---
import Loginpage from '../components/Loginpage.vue'
import Home from '../components/Home.vue'
import Booking from '../components/Booking.vue'
import BookingList from '../components/BookingList.vue'
import RoomStatus from '../components/RoomStatus.vue'
import Report from '../components/Report.vue'
import RoomUse from '../components/RoomUse.vue'
import BookingInfo from '../components/BookingInfo.vue'
import BookCompleteInfo from '../components/BookCompleteInfo.vue'
import AdminApprovals from '../components/AdminApprovals.vue'
import MyInvites from '../components/MyInvites.vue'
import UserProfile from '../components/UserProfile.vue'
// ถ้าใช้แดชบอร์ดแอดมินตัวใหม่ ให้ uncomment 2 บรรทัดนี้
// import AdminDashboard from '../pages/AdminDashboard.vue'
// const AdminDashboardRoute = { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } }

const routes = [
  { path: '/', redirect: '/home', meta: { requiresAuth: true } },
  { path: '/login', component: Loginpage },
  { path: '/profile', component: UserProfile, meta: { requiresAuth: true } },

  { path: '/home', component: Home, meta: { requiresAuth: true } },
  { path: '/booking', component: Booking, meta: { requiresAuth: true } },
  { path: '/booking-list', component: BookingList, meta: { requiresAuth: true } },
  { path: '/room-use', component: RoomUse, meta: { requiresAuth: true } },
  { path: '/room-status', component: RoomStatus, meta: { requiresAuth: true } },
  { path: '/report', component: Report, meta: { requiresAuth: true } },
  { path: '/booking-info', component: BookingInfo, meta: { requiresAuth: true } },
  { path: '/bookcompleteinfo', component: BookCompleteInfo, meta: { requiresAuth: true } },

  // --- เฉพาะแอดมิน ---
  { path: '/admin/approvals', component: AdminApprovals, meta: { requiresAuth: true, requiresAdmin: true } },
  // ถ้าใช้แดชบอร์ดใหม่ ให้ uncomment AdminDashboardRoute ด้านบน แล้วเติมบรรทัดนี้:
  // AdminDashboardRoute,

  { path: '/my-invites', component: MyInvites, meta: { requiresAuth: true } },
  { path: '/booking-info/:id', component: BookingInfo, meta: { requiresAuth: true } },

  // fallback
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/** ปลอดภัยกับ base64url (JWT) + padding */
function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1] || ''
    let b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4 !== 0) b64 += '='
    return JSON.parse(atob(b64))
  } catch { return null }
}
function isLoggedIn() {
  return !!localStorage.getItem('access_token')
}
function guessIsAdminFromToken() {
  const token = localStorage.getItem('access_token')
  if (!token) return false
  const p = decodeJwtPayload(token)
  // backend ของคุณฝัง pos.isAdmin ใน token ตอน login
  return p?.pos?.isAdmin === true
}

// ---- Async admin check: เรียก backend ก่อน แล้วค่อย fallback JWT ----
let meCache = null
async function ensureMe() {
  if (meCache !== null) return meCache
  try {
    const { default: api } = await import('@/lib/api.js')
    // baseURL จาก api.js รวม /api แล้ว => ใช้ '/auth/me' ได้ตรงกับ /api/auth/me
    const { data } = await api.get('/auth/me')
    meCache = data || null
  } catch {
    meCache = null
  }
  return meCache
}

router.beforeEach(async (to, from, next) => {
  const authed = isLoggedIn()

  // ต้องล็อกอิน
  if (to.meta?.requiresAuth && !authed) {
    sessionStorage.setItem('post_login_redirect', to.fullPath)
    return next('/login')
  }

  // ไปหน้า login ทั้งที่ล็อกอินแล้ว → ส่งกลับปลายทางเดิมหรือ /home
  if (to.path === '/login' && authed) {
    const back = sessionStorage.getItem('post_login_redirect') || '/home'
    sessionStorage.removeItem('post_login_redirect')
    return next(back)
  }

  // ต้องเป็นแอดมิน → เช็คกับ backend ก่อน
  if (to.meta?.requiresAdmin) {
    const me = await ensureMe()
    const isAdmin =
      !!(me?.isAdmin || me?.position?.isAdmin) || // /auth/me ของคุณส่ง isAdmin มาอยู่แล้ว
      guessIsAdminFromToken()                      // fallback จาก JWT (pos.isAdmin)
    if (!isAdmin) return next('/home')
  }

  next()
})

export default router
