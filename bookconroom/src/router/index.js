// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { isAdmin, isNoteTaker, isNoteManager, isHousekeepingLead } from '@/lib/auth.js'
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

// Note taker pages
import NoteTakerDashboard from '@/page/note-taker/NoteTakerDashboard.vue'
import NoteTakerNav from '@/page/note-taker/NoteTakerNav.vue' // optional if used globally

// lazy-load secondary note-taker pages
const NoteTakerMyQueue = () => import('@/page/note-taker/MyQueue.vue')
const LeaveRequest = () => import('@/page/note-taker/LeaveRequest.vue')
const SubstituteManager = () => import('@/page/note-taker/SubstituteManager.vue')

// Housekeeping (added)
import HousekeepingDashboard from '@/page/house_keeper/HousekeepingDashboard.vue'
import HousekeepingTasks from '@/page/house_keeper/HousekeepingTasks.vue'
import HousekeepingAssign from '@/page/house_keeper/HousekeepingAssign.vue'

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

  // note-taker routes
  { path: '/note-taker', redirect: '/note-taker/dashboard' },
  { path: '/note-taker/dashboard', name: 'NoteTakerDashboard', component: NoteTakerDashboard, meta: { requiresAuth: true, role: 'NOTETAKER' } },
  { path: '/note-taker/my-queue', name: 'NoteTakerMyQueue', component: NoteTakerMyQueue, meta: { requiresAuth: true, role: 'NOTETAKER' } },
  { path: '/note-taker/leave-request', name: 'NoteTakerLeaveRequest', component: LeaveRequest, meta: { requiresAuth: true, role: 'NOTETAKER' } },
  { path: '/note-taker/substitute', name: 'NoteTakerSubstitute', component: SubstituteManager, meta: { requiresAuth: true, role: 'NOTETAKER' } },


  { path: '/note-taker', redirect: '/note-taker/dashboard' },
  { path: '/note-taker/dashboard', name: 'NoteTakerDashboard', component: NoteTakerDashboard, meta: { requiresAuth: true, role: 'NOTE_MANAGER' } },
  { path: '/note-taker/my-queue', name: 'NoteTakerMyQueue', component: NoteTakerMyQueue, meta: { requiresAuth: true, role: 'NOTE_MANAGER' } },
  { path: '/note-taker/leave-request', name: 'NoteTakerLeaveRequest', component: LeaveRequest, meta: { requiresAuth: true, role: 'NOTE_MANAGER' } },
  { path: '/note-taker/substitute', name: 'NoteTakerSubstitute', component: SubstituteManager, meta: { requiresAuth: true, role: 'NOTE_MANAGER' } },

  // housekeeping routes (ADDED)
  { path: '/housekeeping', redirect: '/housekeeping/dashboard' },
  { path: '/housekeeping/dashboard', name: 'HousekeepingDashboard', component: HousekeepingDashboard, meta: { requiresAuth: true, role: 'HOUSEKEEPER' } },
  { path: '/housekeeping/tasks', name: 'HousekeepingTasks', component: HousekeepingTasks, meta: { requiresAuth: true, role: 'HOUSEKEEPER' } },
  { path: '/housekeeping/assign', name: 'HousekeepingAssign', component: HousekeepingAssign, meta: { requiresAuth: true, role: 'HOUSEKEEPER' } },

  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Single guard using isAdmin(), isNoteTaker(), isNoteManager(), isHousekeepingLead()
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  const admin = isAdmin()
  const notetaker = isNoteTaker()
  const noteManager = isNoteManager()
  const housekeeper = isHousekeepingLead()

  console.log('[router] beforeEach:', { to: to.fullPath, token: !!token, admin, notetaker, noteManager, housekeeper, roleReq: to.meta?.role })

  if (to.meta?.requiresAuth && !token) {
    sessionStorage.setItem('post_login_redirect', to.fullPath)
    console.log('[router] redirect -> /login (no token)')
    return next('/login')
  }

  // role checks: allow NOTE_MANAGER to act like NOTETAKER where appropriate
  if (to.meta?.role === 'ADMIN' && !admin) {
    console.log('[router] blocked ADMIN route, redirect /home')
    return next('/home')
  }

  if (to.meta?.role === 'NOTETAKER' && !(notetaker || noteManager)) {
    console.log('[router] blocked NOTETAKER route, redirect /home')
    return next('/home')
  }

  // keep explicit NOTE_MANAGER check (optional)
  if (to.meta?.role === 'NOTE_MANAGER' && !noteManager) {
    console.log('[router] blocked NOTE_MANAGER route, redirect /home')
    return next('/home')
  }

  if (to.meta?.role === 'HOUSEKEEPER' && !housekeeper) {
    console.log('[router] blocked HOUSEKEEPING LEAD route, redirect /home')
    return next('/home')
  }

  // already logged in -> skip login
  if (to.path === '/login' && token) {
    // prefer any stored post-login redirect, otherwise send to the appropriate dashboard
    const stored = sessionStorage.getItem('post_login_redirect')
    sessionStorage.removeItem('post_login_redirect')
    const back = stored || (admin ? '/admin/dashboard-modern' : (notetaker || noteManager ? '/note-taker/dashboard' : (housekeeper ? '/housekeeping/dashboard' : '/home')))
    return next(back)
  }

  // send admins / note-takers (or note managers) / housekeepers to their dashboards from "/" or "/home"
  if (to.path === '/' || to.path === '/home') {
    if (admin) return next('/admin/dashboard-modern')
    if (notetaker || noteManager) return next('/note-taker/dashboard')
    if (housekeeper) return next('/housekeeping/dashboard')
    return next()
  }

  next()
})

export default router
