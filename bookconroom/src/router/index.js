import { createRouter, createWebHistory } from 'vue-router'
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
import MyInvites from '../components/MyInvites.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Loginpage },
  { path: '/home', component: Home },
  { path: '/booking', component: Booking },
  { path: '/booking-list', component: BookingList },
  { path: '/room-use', component: RoomUse },
  { path: '/room-status', component: RoomStatus },
  { path: '/report', component: Report },
  { path: '/booking-info', component: BookingInfo },
  { path: '/bookcompleteinfo', component: BookCompleteInfo },
  { path: '/admin/approvals', component: AdminApprovals, meta: { requiresAdmin: true } },
  { path: '/my-invites', component: MyInvites },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

async function getIsAdmin() {
  const token = localStorage.getItem('access_token')
  if (!token) return false
  try {
    // ดึงจาก backend ให้ชัวร์
    const res = await fetch(import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api/auth/me`
      : 'http://localhost:3001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
    if (!res.ok) return false
    const me = await res.json()
    return !!me?.position?.isAdmin // ปรับตาม shape ที่ backend คืนให้
  } catch {
    return false
  }
}

// ------- Helpers -------
function parseIsAdminFromToken() {
  try {
    const token = localStorage.getItem('access_token') // 
    if (!token) return false
    const payload = JSON.parse(atob((token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/')))
    return !!payload?.pos?.isAdmin
  } catch {
    return false
  }
}

// ------- Navigation guard -------
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  const isAuthed = !!token
  let isAdmin = false
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      isAdmin = !!payload?.pos?.isAdmin
    }
  } catch {}

  if (to.path !== '/login' && !isAuthed) return next('/login')
  if (to.path === '/login' && isAuthed) return next('/home')
  if (to.path.startsWith('/admin') && !isAdmin) return next('/home')
  next()
})

export default router
