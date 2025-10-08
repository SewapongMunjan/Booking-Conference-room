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

// ถ้าใช้แดชบอร์ดแอดมินตัวใหม่ ให้ uncomment บรรทัดนี้ แล้วใช้ route ด้านล่าง
// import AdminDashboard from '../pages/AdminDashboard.vue'

// --- Routes + meta ---
const routes = [
  { path: '/', redirect: '/home', meta: { requiresAuth: true } },
  { path: '/login', component: Loginpage },

  { path: '/home', component: Home, meta: { requiresAuth: true } },
  { path: '/booking', component: Booking, meta: { requiresAuth: true } },
  { path: '/booking-list', component: BookingList, meta: { requiresAuth: true } },
  { path: '/room-use', component: RoomUse, meta: { requiresAuth: true } },
  { path: '/room-status', component: RoomStatus, meta: { requiresAuth: true } },
  { path: '/report', component: Report, meta: { requiresAuth: true } },
  { path: '/booking-info', component: BookingInfo, meta: { requiresAuth: true } },
  { path: '/bookcompleteinfo', component: BookCompleteInfo, meta: { requiresAuth: true } },

  // --- เฉพาะแอดมิน ---
  // 1) หน้าอนุมัติเดิม
  { path: '/admin/approvals', component: AdminApprovals, meta: { requiresAuth: true, requiresAdmin: true } },

  // 2) แดชบอร์ดแอดมินใหม่ (ถ้าใช้ ให้ uncomment)
  // { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },

  { path: '/my-invites', component: MyInvites, meta: { requiresAuth: true } },

  // ให้ /booking-info/:id ก็เช็คล็อกอินด้วย
  { path: '/booking-info/:id', component: BookingInfo, meta: { requiresAuth: true } },

  // fallback
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

// --- Router ---
const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * ปลอดภัยกับ base64url (JWT) + padding
 * คืน payload object หรือ null
 */
function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1] || ''
    // base64url -> base64
    let b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    // เติม padding ให้ครบหาร 4 ลงตัว
    while (b64.length % 4 !== 0) b64 += '='
    const json = atob(b64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isLoggedIn() {
  return !!localStorage.getItem('access_token')
}

function isAdminFromToken() {
  const token = localStorage.getItem('access_token')
  if (!token) return false
  const payload = decodeJwtPayload(token)
  // รองรับหลายรูปแบบจาก backend
  return !!(
    payload?.pos?.isAdmin ||
    payload?.isAdmin ||
    (typeof payload?.role === 'string' && payload.role.toUpperCase() === 'ADMIN')
  )
}

// --- Global guard ---
router.beforeEach((to, from, next) => {
  const authed = isLoggedIn()

  // ต้องล็อกอิน
  if (to.meta?.requiresAuth && !authed) {
    // จำปลายทางไว้ แล้วไป login
    sessionStorage.setItem('post_login_redirect', to.fullPath)
    return next('/login')
  }

  // ไปหน้า login ทั้งที่ล็อกอินแล้ว → ส่งกลับปลายทางเดิมหรือ /home
  if (to.path === '/login' && authed) {
    const back = sessionStorage.getItem('post_login_redirect') || '/home'
    sessionStorage.removeItem('post_login_redirect')
    return next(back)
  }

  // ต้องเป็นแอดมิน
  if (to.meta?.requiresAdmin && !isAdminFromToken()) {
    return next('/home')
  }

  next()
})

export default router
