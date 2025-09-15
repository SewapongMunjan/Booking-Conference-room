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

const routes = [
  { path: '/', redirect: '/login' },        // open website -> Login first
  { path: '/login', component: Loginpage },
  { path: '/home', component: Home },
  { path: '/booking', component: () => import('../components/Booking.vue') },
  { path: '/booking-list', component: BookingList },
  { path: '/room-use', component: RoomUse },
  { path: '/room-status', component: RoomStatus },
  { path: '/report', component: Report },
  { path: '/booking-info', component: BookingInfo },
  { path: '/bookcompleteinfo', component: BookCompleteInfo },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthed = !!localStorage.getItem('token')
  if (to.path !== '/login' && !isAuthed) return next('/login')
  if (to.path === '/login' && isAuthed) return next('/home')
  next()
})

export default router