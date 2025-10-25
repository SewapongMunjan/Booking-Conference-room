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

    <!-- Content -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full min-h-[calc(100vh-5rem)] px-8 py-6">
        <div class="max-w-7xl mx-auto space-y-6">
          <div v-if="fetchError" class="text-red-600 p-4 rounded-lg bg-red-50 border border-red-100">Error: {{ fetchError }}</div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section class="lg:col-span-1 modern-card">
              <h3 class="font-medium mb-4">ขออนุญาตลา</h3>

              <label class="block text-sm text-gray-600">วันที่เริ่ม</label>
              <input type="date" v-model="from" class="w-full mt-1 mb-3 p-2 border rounded-md" />

              <label class="block text-sm text-gray-600">วันที่สิ้นสุด</label>
              <input type="date" v-model="to" class="w-full mt-1 mb-3 p-2 border rounded-md" />

              <label class="block text-sm text-gray-600">เหตุผล</label>
              <textarea v-model="reason" rows="4" class="w-full mt-1 p-2 border rounded-md"></textarea>

              <div class="mt-4 flex justify-end">
                <button class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700" @click="submitLeave" :disabled="submitting">
                  {{ submitting ? 'กำลังส่ง...' : 'ส่งคำขอลา' }}
                </button>
              </div>
            </section>

            <section class="lg:col-span-2 modern-card">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium">ประวัติการลา</h3>
                <div class="text-sm text-gray-500">{{ leaves.length }} รายการ</div>
              </div>

              <div v-if="loading" class="text-gray-500 py-8">กำลังโหลด...</div>

              <div v-else class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50 text-gray-600">
                    <tr>
                      <th class="px-4 py-3 text-left">วันที่</th>
                      <th class="px-4 py-3 text-left">เหตุผล</th>
                      <th class="px-4 py-3 text-left">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    <tr v-for="l in leaves" :key="l.id">
                      <td class="px-4 py-3">{{ formatRange(l.from, l.to) }}</td>
                      <td class="px-4 py-3">{{ l.reason }}</td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs" :class="leaveBadge(l.status)">{{ leaveStatusTH(l.status) }}</span>
                        <div v-if="l.conflicts?.length" class="text-sm text-rose-600 mt-1">⚠︎ มีคิวต้องแทน: {{ l.conflicts.map(c=>c.roomName).join(', ') }}</div>
                      </td>
                    </tr>
                    <tr v-if="!leaves.length">
                      <td colspan="3" class="px-4 py-6 text-center text-gray-500">ไม่มีประวัติ</td>
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
                <div class="font-medium">{{ r.type }} - {{ r.status }}</div>
                <div class="text-xs text-gray-500">{{ r.period }}</div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const router = useRouter()

const from = ref('')
const to = ref('')
const reason = ref('')
const submitting = ref(false)
const loading = ref(true)
const leaves = ref([])
const requests = ref([])
const fetchError = ref('')

const me = ref({ name: '', email: '', avatarUrl: '' })

function leaveStatusTH(s){ if(s==='PENDING') return 'รออนุมัติ'; if(s==='APPROVED') return 'อนุมัติแล้ว'; if(s==='REJECTED') return 'ไม่อนุมัติ'; return s||'-' }
function leaveBadge(s){ if(s==='PENDING') return 'bg-amber-100 text-amber-800'; if(s==='APPROVED') return 'bg-green-100 text-green-700'; return 'bg-gray-100 text-gray-700' }
function formatRange(f,t){ if(!f||!t) return '-'; const a=new Date(f), b=new Date(t); return `${a.getDate()}/${a.getMonth()+1}/${a.getFullYear()+543} - ${b.getDate()}/${b.getMonth()+1}/${b.getFullYear()+543}` }

async function load(){
  loading.value = true
  fetchError.value = ''
  try{
    const res = await api.get('/api/leaves', { params: { createdBy: 'me', page:1, pageSize:200 } })
    const data = res.data
    leaves.value = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : [])
    // try user profile
    try { const u = await api.get('/api/me'); me.value = u.data || me.value } catch(_) {}
  } catch(e){
    console.error('load leaves', e)
    fetchError.value = e?.response?.data?.error || e.message || 'load failed'
  } finally { loading.value = false }
}

async function loadRequests(){
  try { const res = await api.get('/api/note-taker/requests').catch(()=>null); requests.value = res?.data?.items ?? res?.data ?? [] } catch(e){ requests.value = [] }
}

function newRequest(){
  Swal.fire({ title:'คำขอลา', html:`<input id="start" class="swal2-input" placeholder="จากวันที่"> <input id="end" class="swal2-input" placeholder="ถึงวันที่">`, preConfirm: () => { const s = document.getElementById('start').value; const e = document.getElementById('end').value; return { start: s, end: e } } }).then(async (r)=>{ if(!r.isConfirmed) return; try{ await api.post('/api/note-taker/requests', r.value); Swal.fire({icon:'success', title:'ส่งคำขอแล้ว'}); loadRequests() }catch(e){ Swal.fire({icon:'error', title:'ไม่สำเร็จ'}) } })
}

async function submitLeave(){
  if(!from.value || !to.value || !reason.value) return alert('กรุณากรอกข้อมูลให้ครบ')
  submitting.value = true
  try{
    await api.post('/api/leaves', { from: from.value, to: to.value, reason: reason.value })
    from.value = to.value = reason.value = ''
    await load()
  } catch(e){
    console.error('submit leave', e)
    fetchError.value = e?.response?.data?.error || e.message || 'submit failed'
    alert('ส่งไม่สำเร็จ')
  } finally { submitting.value = false }
}

async function logout(){
  try { await api.post('/api/logout') } catch(_) {}
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_role')
  router.push('/login')
}

onMounted(() => {
  load()
  loadRequests()
})
</script>

<style scoped>
.nav-link { @apply block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100; }
.nav-active { @apply bg-blue-50 text-blue-600; }

.modern-card { @apply bg-white rounded-2xl border border-gray-200 p-6; }
</style>