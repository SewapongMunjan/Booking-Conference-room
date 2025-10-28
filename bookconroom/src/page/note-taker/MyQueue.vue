<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Left sidebar -->
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
          <router-link to="/note-taker/my-queue" class="nav-link nav-active">📋 คิวของฉัน</router-link>
          <router-link to="/note-taker/leave-request" class="nav-link">🗓️ ลาล่วงหน้า</router-link>
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
      <div class="w-full px-8 py-4 flex items-center max-w-7xl mx-auto gap-4">
        <h1 class="text-lg font-semibold m-0">คิวจดประชุมของฉัน</h1>

        <div class="ml-auto flex items-center gap-3">
          <div class="relative hidden sm:block">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">⌕</span>
            <input v-model="q" placeholder="ค้นหา ห้อง / ผู้จอง / ผู้จด..." class="w-64 pl-10 pr-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <button class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700" @click="load">รีเฟรช</button>

          <button @click="logout" class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">
            <svg class="w-5 h-5 text-red-600 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/></svg>
            <span class="hidden md:inline text-red-600">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full min-h-[calc(100vh-5rem)] px-8 py-6">
        <div class="max-w-7xl mx-auto space-y-6">
          <div v-if="fetchError" class="text-red-600 p-4 rounded-lg bg-red-50 border border-red-100">Error: {{ fetchError }}</div>

          <!-- ตารางงานทั้งหมดที่มอบหมายให้ฉัน -->
          <div class="modern-card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">รายการ</h2>
              <div class="text-sm text-gray-500">{{ filtered.length }} รายการ</div>
            </div>

            <div v-if="loading" class="flex justify-center py-12 text-gray-500">กำลังโหลด...</div>

            <div v-else>
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50 text-gray-600">
                    <tr>
                      <th class="px-4 py-3 text-left">ห้อง</th>
                      <th class="px-4 py-3 text-left">วันที่</th>
                      <th class="px-4 py-3 text-left">เวลา</th>
                      <th class="px-4 py-3 text-left">สถานะ</th>
                      <th class="px-4 py-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    <tr v-for="m in filtered" :key="m.id">
                      <td class="px-4 py-3">{{ m.room?.roomName || '-' }}</td>
                      <td class="px-4 py-3">{{ dateTH(m.startTime) }}</td>
                      <td class="px-4 py-3">{{ timeRange(m.startTime, m.endTime) }}</td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-0.5 rounded-full text-xs" :class="badge(m.status)">{{ statusTH(m.status) }}</span>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex justify-end gap-2">
                          <button class="px-3 py-1.5 rounded-lg border" @click="view(m)">รายละเอียด</button>
                          <!-- <button v-if="m.status!=='DONE'" class="px-3 py-1.5 rounded-lg bg-blue-600 text-white" @click="openForm(m)">เปิดแบบฟอร์ม</button> -->
                          <!-- <button v-if="m.status==='IN_PROGRESS'" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white" @click="viewReport(m)">ดูรายงาน</button> -->
                        </div>
                      </td>
                    </tr>

                    <tr v-if="!filtered.length">
                      <td colspan="5" class="px-4 py-6 text-center text-gray-500">ไม่มีรายการ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- การ์ดด้านล่าง: ongoing / upcoming / invitations -->
          <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- กำลังประชุม -->
            <div class="modern-card">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold">กำลังประชุม</h3>
                <span class="text-xs text-gray-500">{{ myView.ongoing.length }} รายการ</span>
              </div>
              <ul class="space-y-3">
                <li v-for="i in myView.ongoing" :key="`og-${i.id}`" class="p-3 bg-gray-50 rounded-xl border flex justify-between items-start">
                  <div>
                    <div class="font-medium">ห้อง: {{ i.roomName }}</div>
                    <div class="text-xs text-gray-500">เวลา: {{ timeRange(i.startTime, i.endTime) }}</div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <button @click="instantLeave(i.id)" class="px-3 py-1 bg-red-600 text-white rounded text-sm">ลากะทันหัน</button>
                    <!-- <button @click="openFormById(i.id)" class="px-3 py-1 border rounded text-sm">บันทึก</button> -->
                  </div>
                </li>
                <li v-if="!myView.ongoing.length" class="text-sm text-gray-500">ไม่มีรายการ</li>
              </ul>
            </div>

            <!-- รอเริ่ม (ฉันรับแล้ว) -->
            <div class="modern-card">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold">รอเริ่ม</h3>
                <span class="text-xs text-gray-500">{{ myView.upcoming.length }} รายการ</span>
              </div>
              <ul class="space-y-3">
                <li v-for="i in myView.upcoming" :key="`up-${i.id}`" class="p-3 bg-gray-50 rounded-xl border flex justify-between items-start">
                  <div>
                    <div class="font-medium">ห้อง: {{ i.roomName }}</div>
                    <div class="text-xs text-gray-500">เวลา: {{ timeRange(i.startTime, i.endTime) }}</div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <button @click="instantLeave(i.id)" class="px-3 py-1 bg-orange-600 text-white rounded text-sm">ลากะทันหัน</button>
                    <button @click="viewById(i.id)" class="px-3 py-1 border rounded text-sm">รายละเอียด</button>
                  </div>
                </li>
                <li v-if="!myView.upcoming.length" class="text-sm text-gray-500">ไม่มีรายการ</li>
              </ul>
            </div>

            <!-- ถูกเชิญ -->
            <div class="modern-card">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold">คำเชิญ</h3>
                <span class="text-xs text-gray-500">{{ myView.invitations.length }} รายการ</span>
              </div>
              <ul class="space-y-3">
                <li v-for="i in myView.invitations" :key="`inv-${i.id}`" class="p-3 bg-gray-50 rounded-xl border flex justify-between items-start">
                  <div>
                    <div class="font-medium">ห้อง: {{ i.roomName }}</div>
                    <div class="text-xs text-gray-500">เวลา: {{ timeRange(i.startTime, i.endTime) }}</div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <button @click="acceptInvitation(i.id)" class="px-3 py-1 bg-sky-600 text-white rounded text-sm">รับ</button>
                    <button @click="declineInvitation(i.id)" class="px-3 py-1 border rounded text-sm">ปฏิเสธ</button>
                  </div>
                </li>
                <li v-if="!myView.invitations.length" class="text-sm text-gray-500">ไม่มีรายการ</li>
              </ul>
            </div>
          </section>

          <!-- Modal -->
          <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="closeForm">
            <div class="bg-white w-full max-w-2xl rounded-2xl p-6">
              <h3 class="text-lg font-semibold mb-4">{{ formMeeting ? 'บันทึกการประชุม' : 'สร้างรายการใหม่' }}</h3>
              <textarea v-model="reportText" rows="8" class="w-full border rounded-md p-2" placeholder="พิมพ์บันทึก / รายงาน"></textarea>
              <div class="mt-4 flex justify-end gap-2">
                <button class="px-3 py-2 rounded-lg border" @click="closeForm">ยกเลิก</button>
                <button class="px-3 py-2 rounded-lg bg-emerald-600 text-white" @click="submitReport" :disabled="submitting">
                  {{ submitting ? 'กำลังส่ง...' : 'บันทึก / ส่งรายงาน' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const q = ref('')
const items = ref([])          // สำหรับตารางบนจาก /api/meetings
const myView = ref({           // สำหรับการ์ดล่างจาก /api/notetakers/my-view
  ongoing: [],
  upcoming: [],
  invitations: [],
})
const fetchError = ref('')

const showForm = ref(false)
const formMeeting = ref(null)
const reportText = ref('')
const submitting = ref(false)

const me = ref({ name: '', email: '', avatarUrl: '' })

const filtered = computed(() => {
  const kw = q.value.trim().toLowerCase()
  if (!kw) return items.value
  return items.value.filter(m =>
    (m.room?.roomName || '').toLowerCase().includes(kw) ||
    (m.requester?.name || '').toLowerCase().includes(kw)
  )
})

function statusTH(s){ if(s==='IN_PROGRESS') return 'กำลังจด'; if(s==='DONE') return 'เสร็จสิ้น'; return 'รอเริ่ม' }
function badge(s){ if(s==='IN_PROGRESS') return 'bg-green-100 text-green-700'; if(s==='DONE') return 'bg-blue-100 text-blue-700'; return 'bg-amber-100 text-amber-800' }
function dateTH(iso){ if(!iso) return '-' ; const d=new Date(iso); const m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}` }
function timeRange(s,e){ if(!s||!e) return '-'; const o={hour:'2-digit',minute:'2-digit'}; return `${new Date(s).toLocaleTimeString([],o)} - ${new Date(e).toLocaleTimeString([],o)}` }

function view(m){ router.push(`/booking-info/${m.id}`) }
function viewById(id){ router.push(`/booking-info/${id}`) }

// function openForm(m=null){
//   formMeeting.value = m
//   reportText.value = m?.report || ''
//   showForm.value = true
// }
// function openFormById(id){
//   const target = items.value.find(x => x.id === id)
//   if (target) openForm(target)
// }
function closeForm(){ showForm.value = false; formMeeting.value = null; reportText.value = '' }
function viewReport(m){ router.push({ path: '/note-taker/my-queue', query: { focusId: m.id, viewReport: 1 } }) }

async function submitReport(){
  if(!formMeeting.value) return
  submitting.value = true
  try{
    await api.post(`/api/meetings/${formMeeting.value.id}/report`, { report: reportText.value })
    await load()
    closeForm()
  } catch(e){
    console.error('submit report failed', e)
    fetchError.value = e?.response?.data?.error || e.message || 'submit failed'
  } finally { submitting.value = false }
}

async function load(){
  loading.value = true
  fetchError.value = ''
  try{
    // ตารางบน
    const [meetRes, myViewRes] = await Promise.all([
      api.get('/api/meetings', { params: { assignedTo: 'me', sort:'nearest', page:1, pageSize:200 } }),
      api.get('/api/notetakers/my-view', { params: { limit: 5 } }),
    ])

    const data = meetRes.data
    items.value = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : [])

    // การ์ดล่าง
    myView.value = {
      ongoing: myViewRes.data?.ongoing || [],
      upcoming: myViewRes.data?.upcoming || [],
      invitations: myViewRes.data?.invitations || [],
    }

    // โปรไฟล์ (optional)
    try { const u = await api.get('/api/me'); me.value = u.data?.me || u.data || me.value } catch(_) {}

    // โฟกัสรายการ
    const fid = route.query.focusId
    if (fid) {
      const target = items.value.find(x => String(x.id) === String(fid))
      if (target && route.query.openForm) openForm(target)
    }
  } catch(e){
    console.error('load my queue', e)
    fetchError.value = e?.response?.data?.error || e.message || 'load failed'
  } finally { loading.value=false }
}

/* ---------------------------------------
   เพิ่มฟังก์ชัน ensureSubstituteRequest:
   - ใช้ตอนลากะทันหันสำเร็จ → สร้างคำขอหา “คนแทน”
   - ดึง start/end จากรายการในตาราง (fallback: เรียก /api/meetings/:id)
---------------------------------------- */
async function ensureSubstituteRequest(bookingId){
  // หา booking จาก state ปัจจุบันก่อน
  let b = items.value.find(x => Number(x.id) === Number(bookingId))
  if (!b) {
    try {
      const r = await api.get(`/api/meetings/${bookingId}`)
      b = r.data?.item || r.data
    } catch (_) { /* เงียบไว้ */ }
  }
  if (!b || !b.startTime || !b.endTime) return

  try {
    await api.post('/api/notetakers/requests', {
      bookingId: b.id,
      start: b.startTime,
      end: b.endTime
    })
    // บอกหน้า Substitute ให้รีโหลด
    window.dispatchEvent(new Event('notetakers:requests:changed'))
  } catch (e) {
    // ไม่ให้ fail หลักล้ม ถ้าสร้าง request ไม่ผ่าน แค่แจ้งเตือนเงียบๆ ใน console
    console.warn('create substitute request failed', e?.response?.data || e?.message)
  }
}

/** ลากะทันหัน (ประกาศไม่ว่างสำหรับ booking นั้นทันที + สร้างคำขอแทนที่) */
async function instantLeave(bookingId){
  const c = await Swal.fire({ title:'ยืนยัน', text:'ประกาศไม่ว่างและขอคนแทนทันที?', icon:'warning', showCancelButton:true, confirmButtonText:'ยืนยัน' })
  if (!c.isConfirmed) return
  try{
    // ใช้ endpoint เดิมของคุณ
    await api.patch('/api/notetakers/availability/unavailable', { bookingId })

    // เพิ่ม: สร้างคำขอแทนที่ เพื่อให้หน้า Substitute เห็นทันที
    await ensureSubstituteRequest(bookingId)

    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'ประกาศไม่ว่างแล้ว', timer:1400, showConfirmButton:false })
    await load()
  }catch(e){
    Swal.fire({ icon:'error', title:'ไม่สำเร็จ', text: e?.response?.data?.error || e.message })
  }
}

/** กลับมาว่างสำหรับ booking นั้น (ตั้งเป็น ACCEPTED) */
async function backAvailable(bookingId){
  try{
    await api.patch('/api/notetakers/availability/available', { bookingId })
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'กลับมาว่างแล้ว', timer:1400, showConfirmButton:false })
    await load()
  }catch(e){
    Swal.fire({ icon:'error', title:'ไม่สำเร็จ', text: e?.response?.data?.error || e.message })
  }
}

/** รับคำเชิญ: ใช้ available() เพื่อ set ACCEPTED + invite ACCEPTED */
async function acceptInvitation(bookingId){
  const ok = await Swal.fire({ title:'ยืนยัน', text:'รับงานนี้หรือไม่?', icon:'question', showCancelButton:true, confirmButtonText:'รับ' })
  if (!ok.isConfirmed) return
  await backAvailable(bookingId)
}

/** ปฏิเสธคำเชิญ: ใช้ unavailable() เพื่อ set REPLACED + สร้างคำขอแทนที่ */
async function declineInvitation(bookingId){
  const ok = await Swal.fire({ title:'ยืนยัน', text:'ปฏิเสธงานนี้หรือไม่?', icon:'warning', showCancelButton:true, confirmButtonText:'ปฏิเสธ' })
  if (!ok.isConfirmed) return
  // เรียกฟังก์ชันเดียวกับลากะทันหัน เพื่อสร้างคำขอแทนที่ให้ด้วย
  await instantLeave(bookingId)
}

onMounted(load)

async function logout(){
  try { await api.post('/api/logout') } catch(_) {}
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_role')
  router.push('/login')
}
</script>

<style scoped>
.nav-link { @apply block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100; }
.nav-active { @apply bg-blue-50 text-blue-600; }
.modern-card { @apply bg-white rounded-2xl border border-gray-200 p-6; }
</style>
