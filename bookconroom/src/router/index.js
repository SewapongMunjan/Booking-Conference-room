import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Booking from '../components/Booking.vue'
import BookingList from '../components/BookingList.vue'
import RoomStatus from '../components/RoomStatus.vue'
import Report from '../components/Report.vue'
import RoomUse from '../components/RoomUse.vue'
import BookingInfo from '../components/BookingInfo.vue'
import BookCompleteInfo from '../components/BookCompleteInfo.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/booking', component: Booking },
  { path: '/booking-list', component: BookingList },
  { path: '/room-use', component: RoomUse },
  { path: '/room-status', component: RoomStatus },
  { path: '/report', component: Report },
  { path: '/booking-info', component: BookingInfo },
  { path: '/bookcompleteinfo', component: BookCompleteInfo }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router