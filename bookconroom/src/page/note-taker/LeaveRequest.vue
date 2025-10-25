<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
      <div class="h-full flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl shadow-md">📝</div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">ระบบจดประชุม</h3>
              <p class="text-[10px] text-gray-500">NoteTaker Console</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link to="/note-taker/dashboard" class="nav-link">🏠 หน้าหลัก</router-link>
          <router-link to="/note-taker/my-queue" class="nav-link">📋 คิวของฉัน</router-link>
          <router-link to="/note-taker/leave-request" class="nav-link nav-active">🗓️ ลาล่วงหน้า</router-link>
          <router-link to="/note-taker/substitute" class="nav-link">🔁 จัดการแทนที่</router-link>
        </nav>

        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'NoteTaker' }}</div>
              <div class="text-[10px] text-gray-500 truncate">{{ me?.email || '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Header -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white border-b border-gray-200">
      <div class="w-full px-8 py-4 flex items-center max-w-7xl mx-auto">
        <h1 class="text-lg font-semibold m-0">ลาล่วงหน้า</h1>
        <div class="ml-auto flex items-center gap-3"></div>
        <div class="ml-auto flex items-center gap-3">
          <div class="relative hidden sm:block">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">⌕</span>
            <input v-model="q" placeholder="ค้นหาเหตุผล/ช่วงวัน..." class="w-64 pl-10 pr-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700" @click="load">รีเฟรช</button>
          <button @click="logout" class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">
            <svg class="w-5 h-5 text-red-600 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/></svg>
            <span class="hidden md:inline text-red-600">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full min-h-[calc(100vh-5rem)] px-8 py-6">
        <div class="max-w-7xl mx-auto space-y-6">
          <div v-if="fetchError" class="text-red-600 p-4 rounded-lg bg-red-50 border border-red-100">Error: {{ fetchError }}</div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section class="lg:col-span-1 modern-card">
              <h3 class="font-medium mb-4">ขออนุญาตลา</h3>

              <label class="block text-sm text-gray-600">ลากระทันหัน / ฉุกเฉิน</label>
              <div class="mb-3">
                <label class="inline-flex items-center gap-2">
                  <input type="checkbox" v-model="isEmergency" class="form-checkbox h-4 w-4" />
                  <span class="text-sm text-gray-700">ลากระทันหัน (ส่งคำขอได้ทันที ไม่ต้องรอล่วงหน้า 2 วัน)</span>
                </label>
              </div>

              <!-- show today's tasks when emergency checked -->
              <div v-if="isEmergency" class="mb-4 p-3 border rounded-lg bg-gray-50">
                <div class="flex items-center justify-between mb-2">
                  <div class="text-sm font-medium">งาน / ภารกิจวันนี้ ({{ todayISO }})</div>
                  <button v-if="!tasksLoading" @click="fetchTodayTasks" class="text-xs px-2 py-1 rounded bg-white border">รีเฟรช</button>
                </div>

                <div v-if="tasksLoading" class="text-xs text-gray-500">กำลังโหลดงานวันนี้...</div>
                <div v-else>
                  <div v-if="!tasksToday.length" class="text-xs text-gray-500">ไม่พบงานในวันนี้</div>
                  <ul class="space-y-2">
                    <li v-for="t in tasksToday" :key="t.id" class="flex items-start gap-3">
                      <label class="inline-flex items-center gap-2">
                        <input type="checkbox" v-model="selectedTasks" :value="t.id" class="form-checkbox h-4 w-4" />
                      </label>
                      <div class="flex-1 text-sm">
                        <div class="font-medium">{{ t.title || t.summary || t.name }}</div>
                        <div class="text-xs text-gray-500">{{ t.timeRange || t.start }}</div>
                        <div class="text-xs text-gray-400">{{ t.location || t.roomName || '' }}</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <label class="block text-sm text-gray-600">วันที่เริ่ม</label>
              <input
                type="date"
                v-model="from"
                :min="minStartForForm"
                class="w-full mt-1 mb-3 p-2 border rounded-md"
              />

              <label class="block text-sm text-gray-600">วันที่สิ้นสุด</label>
              <input
                type="date"
                v-model="to"
                :min="from || minStartForForm"
                class="w-full mt-1 mb-3 p-2 border rounded-md"
              />

              <div class="text-xs text-gray-500 mb-3" v-if="!isEmergency">
                คำขอปกติต้องส่งล่วงหน้าอย่างน้อย 2 วัน (วันเริ่มขั้นต่ำ: {{ minStartForForm }})
              </div>
              <div class="text-xs text-gray-500 mb-3" v-else>
                ลากระทันหัน: สามารถเริ่มได้ตั้งแต่วันนี้ ({{ minStartForForm }})
              </div>

              <label class="block text-sm text-gray-600">เหตุผล</label>
              <textarea v-model="reason" rows="4" class="w-full mt-1 p-2 border rounded-md"></textarea>

              <div class="mt-4 flex justify-end">
                <button
                  class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  @click="submitLeave"
                  :disabled="submitting || !canSubmit"
                >
                  {{ submitting ? 'กำลังส่ง...' : 'ส่งคำขอลา' }}
                </button>
              </div>
            </section>

            <section class="lg:col-span-2 modern-card">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium">ประวัติการลา</h3>
                <div class="text-sm text-gray-500">{{ filteredLeaves.length }} รายการ</div>
              </div>

              <div v-if="loading" class="text-gray-500 py-8">กำลังโหลด...</div>

              <div v-else class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50 text-gray-600">
                    <tr>
                      <th class="px-4 py-3 text-left">วันที่</th>
                      <th class="px-4 py-3 text-left">เหตุผล</th>
                      <th class="px-4 py-3 text-left">สถานะ</th>
                      <th class="px-4 py-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    <tr v-for="l in filteredLeaves" :key="l.id">
                      <td class="px-4 py-3">
                        <template v-if="l.date">
                          {{ dateTH(l.date) }}
                        </template>
                        <template v-else>
                          {{ formatRange(l.from, l.to) }}
                        </template>
                      </td>
                      <td class="px-4 py-3">{{ l.reason || '-' }}</td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs" :class="leaveBadge(l.status)">{{ leaveStatusTH(l.status) }}</span>
                        <div v-if="l.conflicts?.length" class="text-sm text-rose-600 mt-1">⚠︎ มีคิวต้องแทน: {{ l.conflicts.map(c=>c.roomName).join(', ') }}</div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex justify-end">
                          <button v-if="l.date" @click="cancelLeave(l.date)" class="px-3 py-1.5 rounded border text-sm">ยกเลิก</button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="!filteredLeaves.length">
                      <td colspan="4" class="px-4 py-6 text-center text-gray-500">ไม่มีประวัติ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <!-- New Request Section -->
          <div class="modern-card p-6">
            <h3 class="font-medium mb-4">คำขอลาใหม่</h3>
            <div class="mb-4">
              <button @click="newRequest" class="px-3 py-2 bg-sky-600 text-white rounded">สร้างคำขอใหม่</button>
            </div>
            <div v-if="requests.length === 0" class="text-gray-500">ยังไม่มีคำขอ</div>
            <ul class="space-y-3">
              <li v-for="r in requests" :key="r.id" class="p-3 bg-white border rounded-lg">
                <div class="font-medium">{{ r.type || 'ขอช่วยแทน' }} - {{ r.status || 'ส่งแล้ว' }}</div>
                <div class="text-xs text-gray-500">{{ r.period || '-' }}</div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const q = ref('')
const router = useRouter()

const from = ref('')
const to = ref('')
const reason = ref('')
const isEmergency = ref(false)
const submitting = ref(false)
const loading = ref(true)
const leaves = ref([])
const requests = ref([])
const fetchError = ref('')
const me = ref({ name: '', email: '', avatarUrl: '' })

// NEW: tasks today for emergency mode
const tasksToday = ref([])
const tasksLoading = ref(false)
const selectedTasks = ref([])

const todayISO = computed(() => {
  const d = new Date(); d.setHours(0,0,0,0)
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${dd}`
})

// helper date formatting
function pad(n){ return String(n).padStart(2, '0') }
function yyyy_mm_dd(d){
  const y = d.getFullYear(), m = pad(d.getMonth()+1), dd = pad(d.getDate())
  return `${y}-${m}-${dd}`
}
function* eachDate(aStr, bStr){
  const a = new Date(aStr), b = new Date(bStr || aStr)
  for (let d = new Date(a); d <= b; d.setDate(d.getDate()+1)) {
    yield yyyy_mm_dd(d)
  }
}

// MIN dates for form
const minStartForForm = computed(() => {
  const today = new Date()
  const base = new Date(today); base.setHours(0,0,0,0)
  if (isEmergency.value) {
    return yyyy_mm_dd(base) // today
  }
  // normal request: today + 2 days
  const early = new Date(base); early.setDate(early.getDate() + 2)
  return yyyy_mm_dd(early)
})

// form validation guard
const canSubmit = computed(() => {
  if (!from.value || !reason.value) return false
  const start = new Date(from.value); start.setHours(0,0,0,0)
  const minAllowed = new Date(minStartForForm.value); minAllowed.setHours(0,0,0,0)
  if (start < minAllowed) return false
  if (to.value) {
    const end = new Date(to.value); end.setHours(0,0,0,0)
    if (end < start) return false
  }
  return true
})

// ========== helpers ==========
function leaveStatusTH(s){
  if (s === 'PENDING') return 'รออนุมัติ'
  if (s === 'APPROVED') return 'อนุมัติแล้ว'
  if (s === 'REJECTED') return 'ไม่อนุมัติ'
  return 'อนุมัติแล้ว' // ค่าเริ่มต้นของ leave รายวัน
}
function leaveBadge(s){
  if (s === 'PENDING') return 'bg-amber-100 text-amber-800'
  if (s === 'APPROVED' || !s) return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-700'
}
function dateTH(iso){
  if(!iso) return '-'
  const d=new Date(iso)
  const m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`
}
function formatRange(f, t){
  if (!f || !t) return '-'
  const a = new Date(f), b = new Date(t)
  return `${a.getDate()}/${a.getMonth()+1}/${a.getFullYear()+543} - ${b.getDate()}/${b.getMonth()+1}/${b.getFullYear()+543}`
}

// filter ประวัติ
const filteredLeaves = computed(() => {
  const kw = q.value.trim().toLowerCase()
  const arr = Array.isArray(leaves.value) ? leaves.value : []
  if (!kw) return arr
  return arr.filter(l =>
    (l.reason || '').toLowerCase().includes(kw) ||
    (l.date ? dateTH(l.date) : formatRange(l.from, l.to)).toLowerCase().includes(kw)
  )
})

// ========== API calls ==========
async function load(){
  loading.value = true
  fetchError.value = ''
  try{
    // default: ย้อนหลัง 60 วัน ถึง อีก 60 วัน
    const today = new Date()
    const start = new Date(today); start.setDate(start.getDate() - 60)
    const end   = new Date(today); end.setDate(end.getDate() + 60)

    const [leRes, reqRes] = await Promise.all([
      api.get('/api/notetakers/leaves', { params: { start: yyyy_mm_dd(start), end: yyyy_mm_dd(end) } }),
      api.get('/api/notetakers/requests')
    ])

    leaves.value   = Array.isArray(leRes.data?.items) ? leRes.data.items : []
    requests.value = Array.isArray(reqRes.data?.items) ? reqRes.data.items : []

    // โปรไฟล์ (optional)
    try { const u = await api.get('/api/me'); me.value = u.data?.me || u.data || me.value } catch(_) {}
  } catch(e){
    console.error('load leaves', e)
    fetchError.value = e?.response?.data?.error || e.message || 'load failed'
  } finally { loading.value = false }
}

async function newRequest(){
  const today = new Date(); today.setHours(0,0,0,0)
  const minDate = yyyy_mm_dd(today)
  const { value: formValues, isConfirmed } = await Swal.fire({
    title: 'ขอความช่วยเหลือ/แทนที่',
    html: `
      <input id="swal-start" type="date" class="swal2-input" min="${minDate}" placeholder="จากวันที่ (YYYY-MM-DD)">
      <input id="swal-end" type="date" class="swal2-input" min="${minDate}" placeholder="ถึงวันที่ (YYYY-MM-DD)">
    `,
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => {
      const s = (document.getElementById('swal-start') || {}).value || ''
      const e = (document.getElementById('swal-end')   || {}).value || ''
      if (!s) {
        Swal.showValidationMessage('กรุณาระบุวันที่เริ่ม')
        return false
      }
      if (e && new Date(e) < new Date(s)) {
        Swal.showValidationMessage('วันที่สิ้นสุดต้องไม่อยู่ก่อนวันที่เริ่ม')
        return false
      }
      return { start: s, end: e }
    }
  })
  if (!isConfirmed || !formValues) return
  try{
    await api.post('/api/notetakers/requests', { start: formValues.start, end: formValues.end })
    Swal.fire({ icon: 'success', title: 'ส่งคำขอแล้ว' })
    // refresh local requests list
    const res = await api.get('/api/notetakers/requests')
    requests.value = res.data?.items || []
    // notify other parts of the app (SubstituteManager) to reload
    window.dispatchEvent(new Event('notetakers:requests:changed'))
  }catch(e){
    console.error('newRequest', e)
    Swal.fire({ icon: 'error', title: 'ไม่สำเร็จ', text: e?.response?.data?.error || e?.message })
  }
}

/** ส่งลาแบบช่วงวัน → แปลงเป็น daily leave: POST /api/notetakers/leave ทีละวัน */
async function submitLeave(){
  if (!canSubmit.value) {
    await Swal.fire({ icon:'warning', title:'ข้อมูลไม่ครบหรือวันที่ไม่ถูกต้อง', text: 'กรุณากรอกวันที่และเหตุผลให้ถูกต้องตามเงื่อนไข' })
    return
  }

  submitting.value = true
  try{
    const toVal = to.value || from.value
    for (const d of eachDate(from.value, toVal)) {
      await api.post('/api/notetakers/leave', {
        date: d,
        reason: reason.value,
        emergency: !!isEmergency.value,
        affectedTasks: isEmergency.value ? selectedTasks.value : undefined
      })
    }
    from.value = ''; to.value = ''; reason.value = ''; isEmergency.value = false
    tasksToday.value = []; selectedTasks.value = []
    await load()
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'ส่งคำลาแล้ว', timer:1400, showConfirmButton:false })
  } catch(e){
    console.error('submit leave', e)
    fetchError.value = e?.response?.data?.error || e.message || 'submit failed'
    await Swal.fire({ icon:'error', title:'ส่งไม่สำเร็จ', text: fetchError.value })
  } finally {
    submitting.value = false
  }
}

async function fetchTodayTasks(){
  tasksLoading.value = true
  tasksToday.value = []
  selectedTasks.value = []
  try {
    // placeholder endpoint - adjust if backend differs
    const res = await api.get('/api/notetakers/tasks', { params: { date: todayISO.value } })
    const items = res?.data?.items ?? res?.data ?? []
    tasksToday.value = Array.isArray(items) ? items : []
  } catch (e) {
    console.warn('fetchTodayTasks', e)
    tasksToday.value = []
  } finally {
    tasksLoading.value = false
  }
}

// when emergency toggled on, load today's tasks automatically
watch(isEmergency, (v) => {
  if (v) fetchTodayTasks()
  else {
    tasksToday.value = []
    selectedTasks.value = []
  }
})

async function cancelLeave(dateIso){
  const ok = await Swal.fire({
    title: 'ยกเลิกการลาวันนี้?',
    text: dateIso,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน'
  })
  if (!ok.isConfirmed) return

  try {
    // normalize to YYYY-MM-DD because backend expects date only (no time)
    let dateParam = dateIso
    const dt = new Date(dateIso)
    if (!Number.isNaN(dt.getTime())) {
      dateParam = yyyy_mm_dd(dt)
    }

    await api.delete('/api/notetakers/leave', { params: { date: dateParam } })
    await load()
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'ยกเลิกแล้ว', timer: 1200, showConfirmButton: false })
  } catch (e) {
    console.error('cancelLeave', e)
    const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'ไม่สำเร็จ'
    Swal.fire({ icon: 'error', title: 'ไม่สำเร็จ', text: msg })
  }
}

async function logout(){
  try { await api.post('/api/logout') } catch(_) {}
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_role')
  router.push('/login')
}

onMounted(load)
</script>

<style scoped>
.nav-link { @apply block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100; }
.nav-active { @apply bg-blue-50 text-blue-600; }
.modern-card { @apply bg-white rounded-2xl border border-gray-200 p-6; }
</style>
