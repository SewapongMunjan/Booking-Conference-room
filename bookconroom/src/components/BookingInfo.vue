<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-8 py-4 shadow-sm border-b">
  <div class="w-full px-6 mx-auto flex justify-between items-center">
    <!-- Left -->
    <div>
      <h2 class="text-lg font-semibold text-blue-600 m-0">ระบบจองห้องประชุม</h2>
      <p class="text-sm text-gray-600 m-0">Meeting Room Booking System</p>
    </div>


    <!-- Right -->
    <div class="flex items-center gap-3 relative">
      <!-- Notifications -->
      <div class="relative">
        <button
  data-noti-bell
  class="w-10 h-10 rounded-full flex items-center justify-center border hover:bg-gray-50 relative"
  @click="toggleNotif"
  aria-label="เปิดการแจ้งเตือน"
>
  <img
    src="https://cdn-icons-png.flaticon.com/128/1827/1827370.png"
    alt="กระดิ่งแจ้งเตือน"
    class="w-5 h-5 object-contain"
    loading="lazy"
  />
  <span
    v-if="unreadCount > 0"
    class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-5 text-center"
  >
    {{ unreadCount > 9 ? '9+' : unreadCount }}
  </span>
</button>

        <!-- Dropdown -->
       <div
  v-if="showNotif"
  data-noti-dropdown                     
  class="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-50"
>
          <div class="p-3 border-b flex items-center gap-2">
            <span class="font-medium">การแจ้งเตือน</span>
            <span class="ml-auto text-xs text-gray-500">ยังไม่อ่าน: {{ unreadCount }}</span>
          </div>

          <div class="max-h-80 overflow-auto">
            <div v-if="loadingNoti" class="p-4 text-sm text-gray-500">กำลังโหลด...</div>
            <div v-else-if="errorNoti" class="p-4 text-sm text-red-600">{{ errorNoti }}</div>

            <template v-else>
              <div v-if="notifs.length === 0" class="p-4 text-sm text-gray-500">
                ยังไม่มีการแจ้งเตือน
              </div>
              <div v-else class="divide-y">
                <div
                  v-for="n in notifs"
                  :key="n.id"
                  class="p-3 hover:bg-gray-50 flex items-start gap-3"
                >
                  <div class="text-xl leading-none">📣</div>
                  <div class="flex-1">
                    <div class="text-sm" :class="n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'">
                      {{ n.message }}
                    </div>
                    <div class="text-[11px] text-gray-500 mt-1">
                      {{ formatTime(n.createdAt) }}
                    </div>
                  </div>
                  <button
                    v-if="!n.isRead"
                    class="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                    @click.stop="markAsRead(n)"
                    title="ทำเครื่องหมายว่าอ่านแล้ว"
                  >
                    อ่านแล้ว
                  </button>
                </div>
              </div>
            </template>
          </div>

          <div class="p-3 border-t flex items-center gap-2">
            <button
              class="text-sm px-3 py-2 border rounded hover:bg-gray-50"
              @click="refreshNotif"
            >
              รีเฟรช
            </button>
            <button
              class="text-sm px-3 py-2 border rounded hover:bg-gray-50"
              @click="markAllAsRead"
              :disabled="unreadCount===0"
            >
              ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
            </button>
            <button
              class="ml-auto text-sm px-3 py-2 border rounded hover:bg-gray-50"
              @click="showNotif=false"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>

      <!-- Avatar + Logout -->
      <!-- Avatar (click -> /profile) + Logout -->
       <router-link
          to="/profile"
          class="shrink-0 inline-block rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
          title="ดูโปรไฟล์"
        >
      <img
          :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'"
          alt="เปิดโปรไฟล์"
          class="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer hover:ring-2 hover:ring-blue-500"
      />
        </router-link>

        <button
          @click="logout"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
         ออกจากระบบ
        </button>
    </div>
  </div>
</header>

<div class="w-full px-6 ml-0 mr-auto flex gap-6 py-6">
  <!-- Sidebar -->
  <aside class="w-64 bg-white rounded-xl shadow-sm p-4">
    <nav class="flex flex-col gap-2">
      <router-link to="/" class="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium">
        <span class="text-lg">🏠</span> หน้าแรก
      </router-link>
      <router-link to="/booking" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
        <span class="text-lg">📅</span> จองห้องประชุม
      </router-link>
      <router-link to="/booking-list" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
        <span class="text-lg">📋</span> รายการจองของฉัน
      </router-link>
      <router-link to="/room-use" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
        <span class="text-lg">🗂️</span> ตารางการใช้ห้องประชุม
      </router-link>
      <router-link to="/room-status" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
        <span class="text-lg">ℹ️</span> สถานะห้องประชุม
      </router-link>
      <router-link to="/report" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
        <span class="text-lg">⚠️</span> แจ้งปัญหา
      </router-link>
      <router-link to="/admin/approvals" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg font-medium">
        <span class="text-lg">🛡️</span> อนุมัติการจอง (Admin)
      </router-link>
      <router-link to="/my-invites" class="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">
        <span class="text-lg">📨</span> คำเชิญของฉัน
      </router-link>
    </nav>
  </aside>


      <!-- Main Content -->
      <main class="flex-1 flex flex-col gap-6">
        <!-- Page Header -->
        <div class="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div class="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
            🔒
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-blue-600 m-0">จองห้องประชุม</h1>
            <p class="text-gray-600 text-sm m-0">ระบบจองห้องประชุม</p>
          </div>
        </div>

        <!-- Booking Form ONLY -->
        <div class="bg-white rounded-xl shadow-sm p-8">
          <h2 class="text-xl font-semibold text-blue-600 mb-6">แบบฟอร์มจองห้องประชุม</h2>
          <form class="grid grid-cols-1 gap-6">
            <div>
              <label class="block text-gray-700 font-medium mb-2">ชื่อผู้จอง</label>
              <input type="text" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">เบอร์โทรศัพท์</label>
              <input type="tel" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">Email</label>
              <input type="email" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">วันที่ประชุม</label>
              <input type="date" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">เวลาเริ่มประชุม</label>
              <input type="time" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">เวลาสิ้นสุดประชุม</label>
              <input type="time" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">ห้องประชุม</label>
              <select class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
                <option value="">เลือกห้องประชุม</option>
                <option value="A1016">A1016</option>
                <option value="A1017">A1017</option>
                <option value="A1018">A1018</option>
                <option value="A1019">A1019</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">จำนวนที่นั่ง</label>
              <input type="number" min="1" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">ประเภทห้องประชุม</label>
              <select class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
                <option value="">เลือกประเภทห้องประชุม</option>
                <option value="ขนาดเล็ก">ขนาดเล็ก</option>
                <option value="ขนาดกลาง">ขนาดกลาง</option>
                <option value="ขนาดใหญ่">ขนาดใหญ่</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">รูปแบบการจอง</label>
              <select class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none text-gray-900 focus:border-blue-500" required>
                <option value="">เลือกประเภทการจอง</option>
                <option value="จองครั้งเดียว">จองครั้งเดียว</option>
                <option value="จองประจำ">จองประจำ</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-2">อุปกรณ์ที่ต้องการใช้</label>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center">
                  <input type="checkbox" id="projector" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="โปรเจคเตอร์">
                  <label for="projector" class="ml-2 text-gray-700">โปรเจคเตอร์</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="sound-system" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="เครื่องเสียง">
                  <label for="sound-system" class="ml-2 text-gray-700">เครื่องเสียง</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="whiteboard" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="กระดานไวท์บอร์ด">
                  <label for="whiteboard" class="ml-2 text-gray-700">กระดานไวท์บอร์ด</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="air-conditioner" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="เครื่องปรับอากาศ">
                  <label for="air-conditioner" class="ml-2 text-gray-700">เครื่องปรับอากาศ</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="wifi" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="Wi-Fi">
                  <label for="wifi" class="ml-2 text-gray-700">Wi-Fi</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="drinking-water" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="น้ำดื่ม">
                  <label for="drinking-water" class="ml-2 text-gray-700">น้ำดื่ม</label>
                </div>
              </div>
            </div>
            <div>
              <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors">
                จองห้องประชุม
              </button>
            </div>
          </form>
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-4 mt-8">
          <button 
            type="button" 
            class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            @click="router.push('/booking')"
          >
            <span>⬅️</span>
            ย้อนกลับ
          </button>
          <button 
            type="button"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            @click="router.push('/bookcompleteinfo')"
          >
            <span>✔️</span>
            ถัดไป
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>