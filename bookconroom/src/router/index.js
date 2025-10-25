// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { isAdmin, isNoteTaker, isNoteManager, isHousekeepingLead } from '@/lib/auth.js'

// User pages
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
const NoteTakerMyQueue = () => import('@/page/note-taker/MyQueue.vue')
const LeaveRequest = () => import('@/page/note-taker/LeaveRequest.vue')
const SubstituteManager = () => import('@/page/note-taker/SubstituteManager.vue')

// Housekeeping pages
import HousekeepingDashboard from '@/page/house_keeper/HousekeepingDashboard.vue'
import HousekeepingTasks from '@/page/house_keeper/HousekeepingTasks.vue'
import HousekeepingAssign from '@/page/house_keeper/HousekeepingAssign.vue'

/* =========================
 * Routes
 * =======================*/
const routes = [
  // base + auth
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

  // admin
  { path: '/admin', redirect: '/admin/dashboard-modern' },
  { path: '/admin/dashboard-modern', name: 'AdminDashboardModern', component: AdminDashboardModern, meta: { requiresAuth: true, roleReq: 'ADMIN' } },
  { path: '/admin/approvals', name: 'AdminApprovals', component: ApprovalsPage, meta: { requiresAuth: true, roleReq: 'ADMIN' } },
  { path: '/admin/my-bookings', name: 'AdminMyBookings', component: MyBookingsPage, meta: { requiresAuth: true, roleReq: 'ADMIN' } },
  { path: '/admin/issues', name: 'AdminIssues', component: IssuesPage, meta: { requiresAuth: true, roleReq: 'ADMIN' } },
  { path: '/admin/loans', name: 'AdminLoans', component: LoansPage, meta: { requiresAuth: true, roleReq: 'ADMIN' } },
  { path: '/admin/room-status', name: 'AdminRoomStatus', component: RoomStatusPage, meta: { requiresAuth: true, roleReq: 'ADMIN' } },

  // ===== Note-taker (ชุดเดียวพอ) =====
  {
    // เข้าทางหลักแล้วส่งไปหน้าที่ตรงบทบาท
    path: '/note-taker',
  beforeEnter: (to, from, next) => {
    // ✅ ใช้ helper จาก '@/lib/auth.js' แทน Pinia store
    const admin = isAdmin()
    const manager = isNoteManager()
    const taker = isNoteTaker()
    const housekeeper = isHousekeepingLead()

    if (admin) {
      // แอดมิน → แดชบอร์ดแอดมิน
      return next('/admin/dashboard-modern')
    } else if (manager) {
      // ผู้จัดการทีมจดบันทึก → หน้าแดชบอร์ดของโน้ตแมนเนเจอร์
      return next('/note-taker/dashboard')
    } else if (taker) {
      // ผู้จดบันทึกทั่วไป → คิวของตัวเอง
      return next('/note-taker/my-queue')
    } else if (housekeeper) {
      // แม่บ้าน → หน้าแดชบอร์ดแม่บ้าน
      return next('/housekeeping/dashboard')
    } else {
      // คนอื่นๆ → กลับหน้าโฮม
      return next('/home')
    }
  }
},
  // Manager/Admin เท่านั้น
  { path: '/note-taker/dashboard', name: 'NoteTakerDashboard', component: NoteTakerDashboard, meta: { requiresAuth: true, roleReq: 'NOTE_MANAGER' } },
  { path: '/note-taker/substitute', name: 'NoteTakerSubstitute', component: SubstituteManager, meta: { requiresAuth: true, roleReq: 'NOTE_MANAGER' } },
  // สมาชิกทีมจด (Admin/Manager/NoteTaker)
  { path: '/note-taker/my-queue', name: 'NoteTakerMyQueue', component: NoteTakerMyQueue, meta: { requiresAuth: true, roleReq: 'NOTE_ROLE' } },
  { path: '/note-taker/leave-request', name: 'NoteTakerLeaveRequest', component: LeaveRequest, meta: { requiresAuth: true, roleReq: 'NOTE_ROLE' } },

  // housekeeping
  { path: '/housekeeping', redirect: '/housekeeping/dashboard' },
  { path: '/housekeeping/dashboard', name: 'HousekeepingDashboard', component: HousekeepingDashboard, meta: { requiresAuth: true, roleReq: 'HOUSEKEEPER' } },
  { path: '/housekeeping/tasks', name: 'HousekeepingTasks', component: HousekeepingTasks, meta: { requiresAuth: true, roleReq: 'HOUSEKEEPER' } },
  { path: '/housekeeping/assign', name: 'HousekeepingAssign', component: HousekeepingAssign, meta: { requiresAuth: true, roleReq: 'HOUSEKEEPER' } },

  // fallback
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/* =========================
 * Global Guard
 * =======================*/
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  const admin = isAdmin()
  const noteTaker = isNoteTaker()
  const noteManager = isNoteManager()
  const housekeeper = isHousekeepingLead()

  // ต้องมี token
  if (to.meta?.requiresAuth && !token) {
    sessionStorage.setItem('post_login_redirect', to.fullPath)
    return next('/login')
  }

  // สิทธิ์รวม
  const canNoteRole = admin || noteManager || noteTaker
  const canNoteManager = admin || noteManager

  // ตรวจ roleReq เดียวทั้งระบบ
  switch (to.meta?.roleReq) {
    case 'ADMIN':
      if (!admin) return next('/home')
      break
    case 'NOTE_MANAGER':
      if (!canNoteManager) return next('/home')
      break
    case 'NOTE_ROLE':
      if (!canNoteRole) return next('/home')
      break
    case 'HOUSEKEEPER':
      if (!housekeeper) return next('/home')
      break
  }

  // ถ้ามี token แล้วห้ามกลับหน้า login
  if (to.path === '/login' && token) {
  const stored = sessionStorage.getItem('post_login_redirect')
  sessionStorage.removeItem('post_login_redirect')
  if (stored) return next(stored)

  if (admin)       return next('/admin/dashboard-modern')
  if (noteManager) return next('/note-taker/dashboard')
  if (notetaker)   return next('/note-taker/my-queue')
  if (housekeeper) return next('/housekeeping/dashboard')
  return next('/home')
}

  // จาก / หรือ /home ส่งตามบทบาท (แยก notetaker กับ manager)
  if (to.path === '/' || to.path === '/home') {
  if (admin)       return next('/admin/dashboard-modern')
  if (noteManager) return next('/note-taker/dashboard')   // ผู้จัดการ
  if (noteTaker) return next('/note-taker/my-queue')    // ผู้จดธรรมดา
  if (housekeeper) return next('/housekeeping/dashboard')
}

  next()
})

export default router
