<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header สั้น ๆ พอให้สอดคล้องระบบ -->
    <header class="bg-white px-6 py-4 shadow-sm border-b">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-lg font-semibold text-blue-600 m-0">รายละเอียดการจอง</h1>
          <p class="text-sm text-gray-600 m-0">Booking Information</p>
        </div>
        <div class="flex items-center gap-2">
          <router-link
            to="/booking-list"
            class="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
          >
            ← กลับรายการจองของฉัน
          </router-link>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-6 space-y-6">
      <!-- loading / error -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm p-6 text-gray-600">
        กำลังโหลดรายละเอียด...
      </div>
      <div v-else-if="error" class="bg-white rounded-xl shadow-sm p-6 text-red-600">
        {{ error }}
      </div>

      <template v-else>
        <section class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">
                📅
              </div>
              <div>
                <div class="flex items-center gap-3">
                  <h2 class="text-xl font-semibold text-gray-900 m-0">
                    ห้อง {{ booking.room?.roomName || '-' }}
                  </h2>
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    :class="statusBadgeClass(booking.status)"
                  >
                    {{ booking.status }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 m-0 mt-1">
                  {{ formatRange(booking.startTime, booking.endTime) }}
                  <span class="ml-2 text-gray-400">•</span>
                  <span class="ml-2">ผู้จอง: {{ booking.bookedBy?.fullName || '-' }}</span>
                </p>
              </div>
            </div>

            <!-- ปุ่มกระทำตามสิทธิ์/สถานะ -->
            <div class="flex flex-wrap gap-2">
              <!-- ผู้ถูกเชิญ: confirm/decline -->
              <template v-if="inviteForMe && !inviteLocked">
                <button
                  class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  @click="confirmInvite"
                  :disabled="actionBusy"
                >
                  ✅ ยืนยันเข้าร่วม
                </button>
                <button
                  class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  @click="declineInvite"
                  :disabled="actionBusy"
                >
                  ❌ ปฏิเสธ
                </button>
              </template>

              <!-- แอดมิน: approve -->
              <button
                v-if="isAdmin && booking.status === 'AWAITING_ADMIN_APPROVAL'"
                class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                @click="approveBooking"
                :disabled="actionBusy"
              >
                🛡️ อนุมัติการจอง
              </button>

              <!-- ผู้จองหรือแอดมิน: cancel -->
              <button
                v-if="canCancel"
                class="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                @click="cancelBooking"
                :disabled="actionBusy || booking.status === 'CANCELLED'"
              >
                🚫 ยกเลิกการประชุม
              </button>
            </div>
          </div>

          <!-- วัตถุประสงค์ -->
          <div v-if="booking.purpose" class="mt-4 p-3 rounded-lg bg-gray-50 text-sm text-gray-700">
            <span class="font-medium text-gray-900">วัตถุประสงค์:</span>
            <span class="ml-2">{{ booking.purpose }}</span>
          </div>
        </section>

        <!-- ผู้เข้าร่วมตามตำแหน่ง + คำเชิญรายบุคคล -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 m-0">ตำแหน่งที่ต้องเข้าร่วม</h3>
            <p class="text-sm text-gray-500 mt-1">ที่ผู้จองเลือกไว้ (ระดับตำแหน่ง)</p>
            <div class="mt-3">
              <div
                v-if="!booking.requiredPositions?.length"
                class="text-sm text-gray-500"
              >
                - ไม่มี -
              </div>
              <ul v-else class="list-disc pl-6 space-y-1 text-sm text-gray-700">
                <li v-for="rp in booking.requiredPositions" :key="rp.id">
                  {{ rp.position?.name || '-' }}
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 m-0">คำเชิญรายบุคคล</h3>
            <p class="text-sm text-gray-500 mt-1">สถานะการตอบรับ</p>
            <div class="mt-3 divide-y">
              <div
                v-for="inv in booking.invites"
                :key="inv.id"
                class="py-2 flex items-center justify-between text-sm"
              >
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">👤</div>
                  <div>
                    <div class="text-gray-900">{{ inv.user?.fullName || '-' }}</div>
                    <div class="text-[12px] text-gray-500">{{ inv.user?.positionId ? 'ตำแหน่ง #' + inv.user.positionId : '' }}</div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[12px]" :class="inviteBadge(inv.status)">
                  {{ inv.status }}
                </span>
              </div>
              <div v-if="!booking.invites?.length" class="py-2 text-sm text-gray-500">- ไม่มี -</div>
            </div>
          </div>
        </section>

        <!-- ผู้จดประชุม + บริการเสริม -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 m-0">ผู้จดประชุม</h3>
            <p class="text-sm text-gray-500 mt-1">ระบบเลือกจากคิวอัตโนมัติ</p>
            <div class="mt-3 space-y-2">
              <div
                v-for="nt in booking.noteTakers"
                :key="nt.id"
                class="p-3 rounded-lg bg-gray-50 flex items-center justify-between"
              >
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">📝</div>
                  <div class="text-sm text-gray-900">
                    {{ nt.user?.fullName || '-' }}
                    <span class="text-gray-500">•</span>
                    <span class="text-gray-600">ลำดับ {{ nt.roleIndex + 1 }}</span>
                  </div>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {{ nt.status }}
                </span>
              </div>
              <div v-if="!booking.noteTakers?.length" class="text-sm text-gray-500">- ไม่มี -</div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 m-0">บริการ/ออปชั่น</h3>
            <p class="text-sm text-gray-500 mt-1">ที่ร้องขอสำหรับการประชุมนี้</p>
            <div class="mt-3 space-y-2">
              <div
                v-for="bs in booking.services"
                :key="bs.id"
                class="p-3 rounded-lg bg-gray-50 flex items-center justify-between text-sm"
              >
                <div class="text-gray-900">
                  {{ bs.service?.name || '-' }}
                  <span v-if="bs.quantity" class="text-gray-500 ml-1">× {{ bs.quantity }}</span>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[12px]" :class="serviceBadge(bs.status)">
                  {{ bs.status }}
                </span>
              </div>
              <div v-if="!booking.services?.length" class="text-sm text-gray-500">- ไม่มี -</div>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/api.js'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { isAdmin } = useAuth()

const loading = ref(true)
const error   = ref('')
const booking = ref(null)
const me      = ref(null)
const actionBusy = ref(false)

/** ===== helpers ===== */
function formatRange (sIso, eIso) {
  const s = new Date(sIso); const e = new Date(eIso)
  const sameDay = s.toDateString() === e.toDateString()
  const dOpts = { dateStyle: 'medium' }
  const tOpts = { hour: '2-digit', minute: '2-digit' }
  if (sameDay) {
    return `${s.toLocaleDateString('th-TH', dOpts)} ${s.toLocaleTimeString('th-TH', tOpts)} - ${e.toLocaleTimeString('th-TH', tOpts)}`
  }
  return `${s.toLocaleString('th-TH', { ...dOpts, ...tOpts })} - ${e.toLocaleString('th-TH', { ...dOpts, ...tOpts })}`
}
function statusBadgeClass (status) {
  switch (status) {
    case 'APPROVED': return 'bg-emerald-50 text-emerald-700'
    case 'REJECTED': return 'bg-rose-50 text-rose-700'
    case 'CANCELLED': return 'bg-gray-100 text-gray-700'
    case 'AWAITING_ADMIN_APPROVAL': return 'bg-amber-50 text-amber-700'
    case 'AWAITING_ATTENDEE_CONFIRM': return 'bg-sky-50 text-sky-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
function inviteBadge (status) {
  switch (status) {
    case 'ACCEPTED': return 'bg-emerald-50 text-emerald-700'
    case 'DECLINED': return 'bg-rose-50 text-rose-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
function serviceBadge (status) {
  switch (status) {
    case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700'
    case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700'
    case 'PENDING': return 'bg-gray-100 text-gray-700'
    case 'REJECTED': return 'bg-rose-50 text-rose-700'
    case 'COMPLETED': return 'bg-blue-50 text-blue-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

/** ===== data drive ===== */
const bookingId = computed(() => {
  // รองรับทั้ง /booking-info/:id และ ?focusId=
  return route.params.id || route.query.focusId || null
})

const isBooker = computed(() => {
  if (!booking.value || !me.value) return false
  return booking.value.bookedBy?.id === me.value.id
})
const canCancel = computed(() => {
  if (!booking.value) return false
  if (booking.value.status === 'CANCELLED') return false
  return isBooker.value || isAdmin.value
})
const inviteForMe = computed(() => {
  if (!booking.value || !me.value) return null
  return booking.value.invites?.find(i => i.userId === me.value.id) || null
})
const inviteLocked = computed(() => {
  if (!inviteForMe.value) return true
  const st = inviteForMe.value.status
  return st === 'ACCEPTED' || st === 'DECLINED'
})

/** ===== actions ===== */
async function fetchMe () {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = data
  } catch (e) {
    me.value = null
  }
}
async function fetchBooking () {
  loading.value = true
  error.value   = ''
  try {
    if (!bookingId.value) {
      error.value = 'ไม่พบรหัสการจอง โปรดกลับไปเลือกรายการ'
      return
    }
    const { data } = await api.get(`/api/bookings/${bookingId.value}`)
    booking.value = data?.booking
    if (!booking.value) error.value = 'ไม่พบข้อมูลการจอง'
  } catch (e) {
    error.value = 'โหลดรายละเอียดไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

async function confirmInvite () {
  if (!bookingId.value) return
  actionBusy.value = true
  try {
    await api.post(`/api/bookings/${bookingId.value}/confirm`)
    await fetchBooking()
  } finally {
    actionBusy.value = false
  }
}
async function declineInvite () {
  if (!bookingId.value) return
  actionBusy.value = true
  try {
    await api.post(`/api/bookings/${bookingId.value}/decline`)
    await fetchBooking()
  } finally {
    actionBusy.value = false
  }
}
async function approveBooking () {
  if (!bookingId.value) return
  actionBusy.value = true
  try {
    await api.post(`/api/bookings/${bookingId.value}/approve`)
    await fetchBooking()
  } finally {
    actionBusy.value = false
  }
}
async function cancelBooking () {
  if (!bookingId.value) return
  if (!confirm('ยืนยันการยกเลิกการประชุมนี้ใช่หรือไม่?')) return
  actionBusy.value = true
  try {
    await api.patch(`/api/bookings/${bookingId.value}/cancel`)
    await fetchBooking()
  } finally {
    actionBusy.value = false
  }
}

/** ===== lifecycle ===== */
onMounted(async () => {
  await fetchMe()
  await fetchBooking()
})
</script>
