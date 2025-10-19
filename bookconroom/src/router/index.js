// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { isAdmin } from '@/lib/auth.js'

// User pages (already in your project)
import Loginpage from '@/components/Loginpage.vue'
import Home from '@/components/Home.vue'
import Booking from '@/components/Booking.vue'
import BookingInfo from '@/components/BookingInfo.vue'
import BookingList from '@/components/BookingList.vue'
import BookCompleteInfo from '@/components/BookCompleteInfo.vue'
import RoomUse from '@/components/RoomUse.vue'
import RoomStatus from '@/components/RoomStatus.vue'
import Report from '@/components/Report.vue'
import MyInvites from '@/components/MyInvites.vue'

// Admin pages
import AdminDashboardModern from '@/page/admin/AdminDashboardModern.vue'
import ApprovalsPage from '@/page/admin/ApprovalsPage.vue'
import MyBookingsPage from '@/page/admin/MyBookingsPage.vue'
import IssuesPage from '@/page/admin/IssuesPage.vue'
import LoansPage from '@/page/admin/LoansPage.vue'
import RoomStatusPage from '@/page/admin/RoomStatusPage.vue'

const routes = [
  { path: '/', redirect: '/home', meta: { requiresAuth: true } },
  { path: '/login', component: Loginpage },

  // user routes
  { path: '/home', component: Home, meta: { requiresAuth: true } },
  { path: '/booking', component: Booking, meta: { requiresAuth: true } },
  { path: '/booking-info/:id', component: BookingInfo, meta: { requiresAuth: true } },
  { path: '/booking-list', component: BookingList, meta: { requiresAuth: true } },
  { path: '/booking-complete', component: BookCompleteInfo, meta: { requiresAuth: true } },
  { path: '/room-use', component: RoomUse, meta: { requiresAuth: true } },
  { path: '/room-status', component: RoomStatus, meta: { requiresAuth: true } },
  { path: '/report', component: Report, meta: { requiresAuth: true } },
  { path: '/my-invites', component: MyInvites, meta: { requiresAuth: true } },

  // admin routes
  { path: '/admin', redirect: '/admin/dashboard-modern' },
  { path: '/admin/dashboard-modern', name: 'AdminDashboardModern', component: AdminDashboardModern, meta: { requiresAuth: true, role: 'ADMIN' } },
  { path: '/admin/approvals', name: 'AdminApprovals', component: ApprovalsPage, meta: { requiresAuth: true, role: 'ADMIN' } },
  { path: '/admin/my-bookings', name: 'AdminMyBookings', component: MyBookingsPage, meta: { requiresAuth: true, role: 'ADMIN' } },
  { path: '/admin/issues', name: 'AdminIssues', component: IssuesPage, meta: { requiresAuth: true, role: 'ADMIN' } },
  { path: '/admin/loans', name: 'AdminLoans', component: LoansPage, meta: { requiresAuth: true, role: 'ADMIN' } },
  { path: '/admin/room-status', name: 'AdminRoomStatus', component: RoomStatusPage, meta: { requiresAuth: true, role: 'ADMIN' } },

  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Single guard using isAdmin()
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  const admin = isAdmin()

  if (to.meta?.requiresAuth && !token) {
    sessionStorage.setItem('post_login_redirect', to.fullPath)
    return next('/login')
  }

  // gate admin-only routes
  if (to.meta?.role === 'ADMIN' && !admin) return next('/home')

  // already logged in -> skip login
  if (to.path === '/login' && token) {
    const back = sessionStorage.getItem('post_login_redirect') || (admin ? '/admin/dashboard-modern' : '/home')
    sessionStorage.removeItem('post_login_redirect')
    return next(back)
  }

  // send admins to dashboard from "/" or "/home"
  if ((to.path === '/' || to.path === '/home') && admin) return next('/admin/dashboard-modern')

  next()
})

export default router
