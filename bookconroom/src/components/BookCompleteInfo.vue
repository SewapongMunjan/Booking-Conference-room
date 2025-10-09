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

        <!-- Summary Card -->
        <div class="bg-white rounded-xl shadow-sm p-8 border-2">
          <h2 class="text-xl font-semibold text-blue-600 mb-6">สรุป</h2>
          <div class="mb-6">
            <span class="text-gray-700 font-medium">การประชุม</span>
            <div class="text-blue-600 text-lg font-bold">20 กรกฎาคม 2568</div>
          </div>
          <div class="mb-6">
            <div class="border-b border-blue-200 pb-2 mb-2 text-blue-600 font-semibold">ผู้จองห้องประชุม</div>
            <div class="grid grid-cols-3 gap-6 mb-2">
              <div>
                <span class="text-gray-700">ชื่อผู้จอง</span>
                <div class="text-gray-900 font-medium">เสวพงศ์ มันจันทร์</div>
              </div>
              <div>
                <span class="text-gray-700">เบอร์โทรศัพท์</span>
                <div class="text-gray-900 font-medium">0987654321</div>
              </div>
              <div>
                <span class="text-gray-700">Email</span>
                <div class="text-gray-900 font-medium">Sewapong.m@ku.th</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div>
                <span class="text-gray-700">วันที่สร้างข้อมูล</span>
                <div class="text-gray-900 font-medium">17/07/2568</div>
              </div>
              <div>
                <span class="text-gray-700">เวลา</span>
                <div class="text-gray-900 font-medium">10:45</div>
              </div>
            </div>
          </div>
          <div class="mb-6">
            <div class="border-b border-blue-200 pb-2 mb-2 text-blue-600 font-semibold">รายละเอียดการจอง</div>
            <div class="grid grid-cols-6 gap-6">
              <div>
                <span class="text-gray-700">วันที่ประชุม</span>
                <div class="text-gray-900 font-medium">20/07/2586 - 20/07/2586</div>
              </div>
              <div>
                <span class="text-gray-700">เวลา</span>
                <div class="text-gray-900 font-medium">13:30 - 16:00</div>
              </div>
              <div>
                <span class="text-gray-700">ห้องประชุม</span>
                <div class="text-gray-900 font-medium">A1016</div>
              </div>
              <div>
                <span class="text-gray-700">ชั้น</span>
                <div class="text-gray-900 font-medium">1</div>
              </div>
              <div>
                <span class="text-gray-700">จำนวนที่นั่ง</span>
                <div class="text-gray-900 font-medium">50</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-6 mt-4">
              <div>
                <span class="text-gray-700">ประเภทห้องประชุม</span>
                <div class="text-gray-900 font-medium">ขนาดเล็ก</div>
              </div>
              <div>
                <span class="text-gray-700">รูปแบบการจอง</span>
                <div class="text-gray-900 font-medium">จองครั้งเดียว</div>
              </div>
            </div>
          </div>
          <div>
            <div class="border-b border-blue-200 pb-2 mb-2 text-blue-600 font-semibold">การให้บริการ</div>
            <div>
              <span class="text-gray-700">อุปกรณ์</span>
              <div class="grid grid-cols-2 gap-2 mt-2">
                <div class="text-gray-900 font-medium">โปรเจคเตอร์</div>
                <div class="text-gray-900 font-medium">เครื่องเสียง</div>
                <div class="text-gray-900 font-medium">ขาเอก</div>
                <div class="text-gray-900 font-medium">เครื่องปรับอากาศ</div>
                <div class="text-gray-900 font-medium">Wi-Fi</div>
                <div class="text-gray-900 font-medium">น้ำดื่ม</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: "BookingRoom",
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>