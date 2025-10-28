<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Fixed Left Sidebar - Hidden on mobile -->
    <aside class="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
      <div class="h-full flex flex-col">
        <!-- Logo Section -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl shadow-md">
              🏢
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">ระบบจองห้องประชุม</h3>
              <p class="text-[10px] text-gray-500">Meeting Room System</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link to="/" class="nav-link" :class="$route.path === '/' ? 'nav-active' : ''">
            <span class="text-lg">🏠</span>
            <span class="text-sm">หน้าแรก</span>
          </router-link>
          <router-link to="/booking" class="nav-link" :class="$route.path.startsWith('/booking') ? 'nav-active' : ''">
            <span class="text-lg">📅</span>
            <span class="text-sm">จองห้องประชุม</span>
          </router-link>
          <router-link to="/booking-list" class="nav-link" :class="$route.path === '/booking-list' ? 'nav-active' : ''">
            <span class="text-lg">📋</span>
            <span class="text-sm">รายการจองของฉัน</span>
          </router-link>
          <router-link to="/room-use" class="nav-link" :class="$route.path === '/room-use' ? 'nav-active' : ''">
            <span class="text-lg">🗂️</span>
            <span class="text-sm">ตารางการใช้ห้อง</span>
          </router-link>
          <router-link to="/room-status" class="nav-link" :class="$route.path === '/room-status' ? 'nav-active' : ''">
            <span class="text-lg">ℹ️</span>
            <span class="text-sm">สถานะห้องประชุม</span>
          </router-link>
          <router-link to="/report" class="nav-link" :class="$route.path === '/report' ? 'nav-active' : ''">
            <span class="text-lg">⚠️</span>
            <span class="text-sm">แจ้งปัญหา</span>
          </router-link>
          <router-link to="/my-invites" class="nav-link" :class="$route.path === '/my-invites' ? 'nav-active' : ''">
            <span class="text-lg">📨</span>
            <span class="text-sm">คำเชิญของฉัน</span>
          </router-link>
        </nav>

        <!-- Footer -->
        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'ผู้ใช้' }}</div>
              <div class="text-[10px] text-gray-500 truncate">{{ me?.email || '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Header -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white border-b border-gray-200">
      <div class="w-full px-8 py-4 flex justify-between items-center">
        <!-- Left -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-lg lg:hidden">
            🏢
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900 m-0">
              ระบบจองห้องประชุม
            </h2>
            <p class="text-xs text-gray-500 m-0 hidden sm:block lg:hidden">Meeting Room Booking System</p>
          </div>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-3">
          <!-- Search -->
          <div class="hidden lg:block relative">
            <input 
              type="search" 
              placeholder="ค้นหา..." 
              class="w-64 pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>

          <!-- Mobile Menu Toggle -->
          <button @click="showMobileMenu = !showMobileMenu" class="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button
              data-noti-bell
              class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 relative"
              @click="toggleNotif"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <!-- Dropdown -->
            <div
              v-if="showNotif"
              data-noti-dropdown
              class="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50"
            >
              <div class="p-3 border-b border-gray-100">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-900">การแจ้งเตือน</span>
                    <span class="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-medium">{{ unreadCount }}</span>
                  </div>
                  <button @click="showNotif=false" class="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>

              <div class="max-h-[60vh] sm:max-h-80 overflow-y-auto">
                <div v-if="loadingNoti" class="p-6 text-center">
                  <div class="inline-block w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <p class="text-xs text-gray-500 mt-2">กำลังโหลด...</p>
                </div>

                <template v-else>
                  <div v-if="notifs.length === 0" class="p-8 text-center">
                    <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                    </div>
                    <p class="text-xs text-gray-500 font-medium">ไม่มีการแจ้งเตือน</p>
                  </div>
                  <div v-else class="divide-y divide-gray-100">
                    <div
                      v-for="n in notifs"
                      :key="n.id"
                      class="p-3 hover:bg-gray-50 flex items-start gap-3 cursor-pointer"
                      @click="goNotif(n)"
                    >
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" :class="n.isRead ? 'bg-gray-100' : 'bg-blue-50'">
                        <span v-if="n.type === 'APPROVED'">✅</span>
                        <span v-else-if="n.type === 'REJECTED'">❌</span>
                        <span v-else>📣</span>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-medium" :class="n.isRead ? 'text-gray-600' : 'text-gray-900'">
                          {{ n.title || 'การแจ้งเตือน' }}
                        </div>
                        <div class="text-[11px] text-gray-500 mt-0.5">
                          {{ n.message || '-' }}
                        </div>
                        <div class="text-[9px] text-gray-400 mt-1">
                          {{ formatTime(n.createdAt) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <div class="p-2 border-t border-gray-100 flex gap-2">
                <button class="flex-1 text-[10px] px-2 py-1.5 hover:bg-gray-50 border border-gray-200 rounded-lg font-medium" @click="refreshNotif">
                  🔄 รีเฟรช
                </button>
                <button class="flex-1 text-[10px] px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50" @click="markAllAsRead" :disabled="unreadCount===0">
                  ✓ อ่านทั้งหมด
                </button>
              </div>
            </div>
          </div>

          <!-- Profile -->
          <router-link to="/profile" class="hidden sm:block">
            <div class="w-10 h-10 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500">
              <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-full h-full object-cover" />
            </div>
          </router-link>

          <!-- Logout -->
          <button @click="logout" class="hidden sm:block px-4 py-2.5 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Menu -->
    <div v-if="showMobileMenu" class="lg:hidden fixed inset-0 z-50 bg-black/20" @click="showMobileMenu = false">
      <div class="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl" @click.stop>
        <div class="p-4 border-b">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-900 text-sm">เมนู</h3>
            <button @click="showMobileMenu = false" class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <router-link to="/profile" class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'ผู้ใช้' }}</div>
              <div class="text-[10px] text-gray-500">ดูโปรไฟล์</div>
            </div>
          </router-link>
        </div>
        <nav class="p-2 space-y-1">
          <router-link to="/" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🏠</span> <span class="text-sm">หน้าแรก</span>
          </router-link>
          <router-link to="/booking" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">📅</span> <span class="text-sm">จองห้องประชุม</span>
          </router-link>
          <router-link to="/booking-list" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">📋</span> <span class="text-sm">รายการจองของฉัน</span>
          </router-link>
          <router-link to="/room-use" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🗂️</span> <span class="text-sm">ตารางการใช้ห้อง</span>
          </router-link>
          <router-link to="/room-status" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">ℹ️</span> <span class="text-sm">สถานะห้องประชุม</span>
          </router-link>
          <router-link to="/report" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">⚠️</span> <span class="text-sm">แจ้งปัญหา</span>
          </router-link>
          <router-link to="/my-invites" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">📨</span> <span class="text-sm">คำเชิญของฉัน</span>
          </router-link>
        </nav>
        <div class="p-3 border-t absolute bottom-0 left-0 right-0 bg-white">
          <button @click="logout" class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:ml-64 pt-20">
      <main class="w-full h-[calc(100vh-5rem)] px-8 py-6 overflow-y-auto">
        <div class="max-w-full space-y-6">
          <!-- Hero Card -->
          <section class="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-10 text-white shadow-lg">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-5">
              <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              ระบบพร้อมใช้งาน
            </div>
            <h1 class="text-4xl font-bold mb-4 leading-tight">
              จองห้องประชุม<br/>ได้ทุกที่ ทุกเวลา
            </h1>
            <p class="text-blue-100 text-base mb-6 max-w-xl">
              ระบบจองห้องประชุมอัจฉริยะ พร้อมแจ้งเตือนแบบเรียลไทม์
            </p>
            <div class="flex gap-4">
              <RouterLink to="/booking" class="px-6 py-3 bg-white text-blue-600 rounded-xl text-base font-semibold hover:bg-blue-50 shadow-md hover:shadow-lg transition-all">
                📅 จองเลย
              </RouterLink>
            </div>
          </section>

          <!-- Stats Cards - สถิติวันนี้ -->
          <section>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-semibold text-gray-900">สถิติการจอง - วันนี้ {{ currentDate }} {{ currentMonth }} {{ currentYear }}</h2>
              <span class="text-sm text-gray-500 flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0114 0z"/></svg>
                อัปเดต: {{ currentTime }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="stat-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-base font-medium text-blue-700">ทั้งหมด</span>
                  <div class="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center text-2xl shadow-sm">📊</div>
                </div>
                <div class="text-5xl font-bold text-blue-700 mb-2">{{ kpi.total }}</div>
                <div class="text-sm text-blue-600">การจองทั้งหมด</div>
              </div>

              <div class="stat-card bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-base font-medium text-green-700">อนุมัติแล้ว</span>
                  <div class="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center text-2xl shadow-sm">✅</div>
                </div>
                <div class="text-5xl font-bold text-green-700 mb-2">{{ kpi.approved }}</div>
                <div class="text-sm text-green-600">สถานะ: APPROVED</div>
              </div>

              <div class="stat-card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-base font-medium text-amber-700">รอการยืนยันผู้เข้าร่วม</span>
                  <div class="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center text-2xl shadow-sm">⏳</div>
                </div>
                <div class="text-5xl font-bold text-amber-700 mb-2">{{ kpi.pending }}</div>
                <div class="text-sm text-amber-600">สถานะ: AWAITING_ATTENDEE_CONFIRM</div>
              </div>

              <div class="stat-card bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-md hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-base font-medium text-red-700">ยกเลิก</span>
                  <div class="w-14 h-14 rounded-xl bg-red-500 flex items-center justify-center text-2xl shadow-sm">❌</div>
                </div>
                <div class="text-5xl font-bold text-red-700 mb-2">{{ kpi.cancelled ?? 0 }}</div>
                <div class="text-sm text-red-600">สถานะ: CANCELLED</div>
              </div>
            </div>
          </section>

          <!-- Main Grid -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <!-- Left Column -->
            <div class="xl:col-span-2 space-y-6">
              <!-- Usage Chart -->
              <div class="modern-card shadow-md">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <h4 class="font-semibold text-gray-900 text-lg">การใช้งานห้องประชุม</h4>
                    <p class="text-sm text-gray-500 mt-1">สถิติย้อนหลัง</p>
                  </div>
                  <div class="text-sm text-gray-500">
                    <select v-model="days" class="px-2 py-1 border border-gray-200 rounded-lg text-sm">
                      <option :value="7">7 วันล่าสุด</option>
                      <option :value="30">30 วันล่าสุด</option>
                    </select>
                  </div>
                </div>

                <div class="h-64 flex items-end gap-2">
                  <div
                    v-for="(v, i) in chartData"
                    :key="i"
                    class="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer"
                    :style="{ height: Math.max(10, v.valuePct) + '%' }"
                    :title="`${v.label}: ${v.count} การจอง`"
                  >
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-700">{{ v.count }}</div>
                  </div>
                </div>
                <div class="mt-4 grid" :style="{ gridTemplateColumns: `repeat(${chartData.length}, 1fr)` }">
                  <div v-for="(v, i) in chartData" :key="'l' + i" class="text-center text-xs text-gray-500">{{ v.label }}</div>
                </div>
              </div>

              <!-- Upcoming Bookings -->
              <div class="modern-card shadow-md">
                <div class="flex items-center justify-between mb-5">
                  <h4 class="font-semibold text-gray-900 text-lg">การจองล่าสุด</h4>
                  <RouterLink to="/booking-list" class="text-sm font-medium text-blue-600 hover:text-blue-700">ดูทั้งหมด →</RouterLink>
                </div>
                <div class="p-5 bg-gray-50 rounded-xl shadow-inner">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl shrink-0 shadow-md">
                      🏢
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold text-gray-900 text-base">Room-30A</div>
                      <div class="text-sm text-gray-500 mt-1">09:00 AM - 06:00 PM</div>
                      <div class="text-sm text-gray-500">31 ตุลาคม 2568</div>
                    </div>
                    <span class="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-500 text-white shadow-sm">จอง</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <!-- Upcoming meetings (next 24 hours / in progress) -->
              <div class="modern-card shadow-md">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="font-semibold text-gray-900 text-base">การประชุมกำลังจะมาถึง</h4>
                  <div class="flex items-center gap-2">
                    <div class="text-sm text-gray-500">ภายใน 7 วันข้างหน้า</div>
                  </div>
                </div>

                <div v-if="loadingUpcoming" class="py-6 text-center text-gray-500">กำลังโหลด...</div>
                <div v-else>
                  <div v-if="comingSoon.length === 0" class="text-gray-500 py-6 text-center">ไม่มีการประชุมที่กำลังจะมาถึง</div>
                  <ul class="space-y-3">
                    <li v-for="u in comingSoon" :key="u.id" class="p-3 bg-white border rounded-lg flex items-start gap-3">
                      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-lg font-semibold text-blue-700 shrink-0">
                        {{ formatDay(u.start) }}
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <div class="font-medium text-sm">{{ u.title || u.room?.roomName || 'ห้องประชุม' }}</div>
                          <span class="text-xs px-2 py-0.5 rounded-full" :class="statusClass(u.status)">{{ statusLabel(u.status) }}</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">{{ formatDate(u.start) }} · {{ timeRange(u.start, u.end) }}</div>
                        <div class="text-xs text-gray-600 mt-2">ผู้จอง: {{ u.requester?.name || '-' }}</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'

const router = useRouter()
const showMobileMenu = ref(false)

function logout () {
  localStorage.removeItem('access_token')
  localStorage.removeItem('me_cache')
  router.push('/login')
}

/* ===== DateTime ===== */
const currentTime  = ref('')
const currentDate  = ref('')
const currentMonth = ref('')
const currentYear  = ref('')

const thaiMonths = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
]

const updateDateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentDate.value = now.getDate()
  currentMonth.value = thaiMonths[now.getMonth()]
  currentYear.value = now.getFullYear() + 543
}

/* ===== Notifications ===== */
const me = ref(null)
const showNotif = ref(false)
const notifs = ref([])
const unreadCount = ref(0)
const loadingNoti = ref(false)

async function fetchMe () {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = data
  } catch { me.value = null }
}

async function fetchNotifications() {
  loadingNoti.value = true
  try {
    const { data } = await api.get('/api/notifications')
    notifs.value = data.items || []
    unreadCount.value = notifs.value.filter(n => !n.isRead).length
  } catch (e) {
    console.error(e)
  } finally {
    loadingNoti.value = false
  }
}

function formatTime (iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

function toggleNotif () {
  showNotif.value = !showNotif.value
  if (showNotif.value) fetchNotifications()
}
function refreshNotif () { return fetchNotifications() }
async function markAllAsRead () {
  try {
    await api.post('/api/notifications/mark-all-read')
    notifs.value = notifs.value.map(n => ({ ...n, isRead: true }))
    unreadCount.value = 0
  } catch (e) { console.error(e) }
}
async function markAsRead (n) {
  try { await api.patch(`/api/notifications/${n.id}/read`); n.isRead = true; unreadCount.value = Math.max(0, unreadCount.value - 1) } catch (e) { console.error(e) }
}
function resolveRouteByNotif (n) {
  const refType = n?.refType, refId = n?.refId
  switch (refType) {
    case 'BOOKING': return refId ? { path: `/booking/${refId}` } : { path: '/booking-list' }
    case 'ISSUE':   return { path: '/report', query: refId ? { issueId: String(refId) } : {} }
    case 'INVITE':  return { path: '/my-invites' }
    default:        return { path: '/home' }
  }
}
async function goNotif (n) {
  try {
    if (!n.isRead) { n.isRead = true; await markAsRead(n) }
    showNotif.value = false
    router.push(resolveRouteByNotif(n))
  } catch (e) { n.isRead = false; console.error(e) }
}

function handleClickOutside (e) {
  const dropdown = document.querySelector('[data-noti-dropdown]')
  const bellBtn = document.querySelector('[data-noti-bell]')
  if (!dropdown) { showNotif.value = false; return }
  if (!dropdown.contains(e.target) && !(bellBtn && bellBtn.contains(e.target))) showNotif.value = false
}

/** ===== KPI & Chart ===== */
const kpi = ref({ total: 0, approved: 0, pending: 0, cancelled: 0 })
const deltas = ref({ approved: 0, pending: 0 })
const days = ref(7)
const chartData = ref([])

function groupByDate(items, daysBack) {
  const map = new Map()
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    map.set(d.toISOString().slice(0, 10), { date: d, count: 0 })
  }
  items.forEach(b => {
    const s = b.startAt ?? b.startTime ?? b.start ?? b.from
    if (!s) return
    const k = new Date(s)
    if (Number.isNaN(k.getTime())) return
    k.setHours(0, 0, 0, 0)
    const key = k.toISOString().slice(0, 10)
    if (map.has(key)) map.get(key).count++
  })
  const max = Math.max(1, ...Array.from(map.values()).map(v => v.count))
  return Array.from(map.values()).map(v => ({
    label: v.date.toLocaleDateString('th-TH', { weekday: 'short' }),
    count: v.count,
    valuePct: Math.round((v.count / max) * 100)
  }))
}

async function loadRecentAndChart() {
  try {
    const since = new Date()
    since.setDate(since.getDate() - days.value)
    const res = await api.get('/api/bookings', { params: { page: 1, pageSize: 500, start_gte: since.toISOString() } })
    const list = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.data) ? res.data : [])
    chartData.value = groupByDate(list, Math.min(days.value, 30))
  } catch (e) {
    console.error('loadRecentAndChart', e)
    chartData.value = []
  }
}

/** โหลด KPI: ลองหลาย endpoint+พารามิเตอร์ และ fallback นับเองจาก /api/bookings */
async function loadKpi() {
  const now = new Date()
  const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0)
  const endOfDay   = new Date(now); endOfDay.setHours(23,59,59,999)

  const paramsCandidates = [
    { date: startOfDay.toISOString().slice(0,10) },
    { on:   startOfDay.toISOString().slice(0,10) },
    { from: startOfDay.toISOString(), to: endOfDay.toISOString() },
    { start_gte: startOfDay.toISOString(), end_lte: endOfDay.toISOString() },
    { dateFrom: startOfDay.toISOString().slice(0,10), dateTo: endOfDay.toISOString().slice(0,10) },
  ]
  const endpoints = [
    ['/api/stats/bookings'],
    ['/api/stats'],
    ['/api/bookings/stats'],
    ['/api/bookings/summary'],
  ]

  let res = null
  outer: for (const [url] of endpoints) {
    for (const p of paramsCandidates) {
      try {
        const r = await api.get(url, { params: p })
        if (r?.status === 200) { res = r; break outer }
      } catch (_) {}
    }
  }

  if (res?.data) {
    const d = res.data
    kpi.value.total     = d.totalToday ?? d.total ?? d.count ?? d.all ?? 0
    kpi.value.approved  = d.approved ?? d.approvedCount ?? d.confirmed ?? 0
    kpi.value.pending   = d.pending ?? d.pendingCount ?? d.waiting ?? d.awaiting ?? 0
    kpi.value.cancelled = d.cancelled ?? d.cancelledCount ?? 0
    deltas.value.approved = d.deltaApproved ?? d.approvedDelta ?? 0
    deltas.value.pending  = d.deltaPending  ?? d.pendingDelta  ?? 0
    return
  }

  // fallback: ดึงรายการแล้วนับเอง
  let list = []
  for (const p of paramsCandidates) {
    try {
      const r = await api.get('/api/bookings', { params: { page: 1, pageSize: 500, ...p } })
      const raw = r?.data?.items ?? r?.data ?? []
      list = Array.isArray(raw) ? raw : []
      if (list.length) break
    } catch (_) {}
  }

  const inToday = (b) => {
    const s = new Date(b.startAt ?? b.startTime ?? b.start ?? b.from)
    if (Number.isNaN(s.getTime())) return false
    return s >= startOfDay && s <= endOfDay
  }
  const items = list.filter(inToday)

  const isApproved = (s) => ['APPROVED','CONFIRMED','ACCEPTED'].includes(String(s||'').toUpperCase())
  const isPending  = (s) => ['PENDING','REQUESTED','AWAITING_ATTENDEE_CONFIRM','AWAITING'].includes(String(s||'').toUpperCase())
  const isCancel   = (s) => String(s||'').toUpperCase() === 'CANCELLED'

  kpi.value.total     = items.length
  kpi.value.approved  = items.filter(x => isApproved(x.status)).length
  kpi.value.pending   = items.filter(x => isPending(x.status)).length
  kpi.value.cancelled = items.filter(x => isCancel(x.status)).length
}

/** Upcoming */
const upcoming = ref([])
const loadingUpcoming = ref(false)
const comingSoon = ref([])

function toISODate(dt) { return new Date(dt).toISOString().slice(0,10) }
function formatDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`
}
function formatDay(iso){ const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : d.getDate() }
function timeRange(s,e){ if(!s||!e) return '-'; const o={hour:'2-digit',minute:'2-digit'}; return `${new Date(s).toLocaleTimeString('th-TH',o)} - ${new Date(e).toLocaleTimeString('th-TH',o)}` }
function statusLabel(s){ if(!s) return 'รอเริ่ม'; if(s==='IN_PROGRESS') return 'กำลังประชุม'; if(s==='DONE') return 'เสร็จสิ้น'; return s }
function statusClass(s){ if(s==='IN_PROGRESS') return 'bg-green-100 text-green-700'; if(s==='DONE') return 'bg-blue-100 text-blue-700'; return 'bg-amber-100 text-amber-800' }

async function fetchUpcoming() {
  loadingUpcoming.value = true
  try {
    const now = new Date()
    const start = toISODate(now)
    const endDate = new Date(now); endDate.setDate(now.getDate() + 7)
    const end = toISODate(endDate)
    const candidates = [
      ['/api/bookings', { params: { from: start, to: end, page: 1, pageSize: 200 } }],
      ['/api/bookings/upcoming', { params: { days: 7 } }],
      ['/api/bookings', { params: { dateFrom: start, dateTo: end, page: 1, pageSize: 200 } }]
    ]
    let res = null
    for (const [url, opt] of candidates) { try { const r = await api.get(url, opt); if (r?.status === 200) { res = r; break } } catch {} }
    if (!res) { upcoming.value = []; return }
    const data = res.data?.items ?? res.data ?? []
    const raw = (Array.isArray(data) ? data : []).map(it => ({
      id: it.id,
      title: it.title || it.room?.name || it.roomName,
      room: it.room || { roomName: it.roomName },
      requester: it.requester || it.user || it.owner || {},
      status: it.status,
      start: it.startAt ?? it.startTime ?? it.start,
      end: it.endAt ?? it.endTime ?? it.end
    })).filter(i => {
      if (!i.start) return false
      const s = new Date(i.start)
      const e = i.end ? new Date(i.end) : new Date(s.getTime() + 1)
      return !Number.isNaN(e.getTime()) && e.getTime() > now.getTime()
    })
    upcoming.value = raw
  } catch (e) {
    console.error('fetchUpcoming', e); upcoming.value = []
  } finally { loadingUpcoming.value = false }
}

async function fetchComingSoon() {
  loadingUpcoming.value = true
  try {
    const now = new Date()
    const start = toISODate(now)
    const endWindow = new Date(now); endWindow.setDate(now.getDate() + 7)
    const end = toISODate(endWindow)
    const candidates = [
      ['/api/bookings', { params: { from: start, to: end, page: 1, pageSize: 200 } }],
      ['/api/bookings/coming-soon', { params: { days: 7 } }],
      ['/api/bookings', { params: { dateFrom: start, dateTo: end, page: 1, pageSize: 200 } }]
    ]
    let res = null
    for (const [url, opt] of candidates) { try { const r = await api.get(url, opt); if (r?.status === 200) { res = r; break } } catch {} }
    if (!res) { comingSoon.value = []; return }
    const data = res.data?.items ?? res.data ?? []
    comingSoon.value = (Array.isArray(data) ? data : []).map(it => ({
      id: it.id,
      title: it.title || it.room?.name || it.roomName,
      room: it.room || { roomName: it.roomName },
      requester: it.requester || it.user || it.owner || {},
      status: it.status,
      start: it.startAt ?? it.startTime ?? it.start,
      end: it.endAt ?? it.endTime ?? it.end
    })).filter(i => {
      if (!i.start) return false
      const s = new Date(i.start)
      const e = i.end ? new Date(i.end) : new Date(s.getTime() + 1)
      return !Number.isNaN(e.getTime()) && e.getTime() > now.getTime() && s.getTime() <= endWindow.getTime()
    })
  } catch (e) {
    console.error('fetchComingSoon', e); comingSoon.value = []
  } finally { loadingUpcoming.value = false }
}

/** ===== lifecycle ===== */
let clockTimer = null
let notiTimer = null
let kpiTimer = null

const onBookingsChanged = () => {
  loadRecentAndChart()
  fetchComingSoon()
  fetchUpcoming()
  loadKpi()
}

onMounted(async () => {
  updateDateTime()
  clockTimer = setInterval(updateDateTime, 1000)

  await fetchMe()
  await fetchNotifications()
  notiTimer = setInterval(fetchNotifications, 30000)
  document.addEventListener('click', handleClickOutside)

  await Promise.all([loadRecentAndChart(), fetchComingSoon(), fetchUpcoming(), loadKpi()])
  window.addEventListener('bookings:changed', onBookingsChanged)

  kpiTimer = setInterval(loadKpi, 60000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (notiTimer) clearInterval(notiTimer)
  if (kpiTimer) clearInterval(kpiTimer)
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('bookings:changed', onBookingsChanged)
})

watch(days, () => loadRecentAndChart())
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900;
}
.nav-active {
  @apply bg-blue-50 text-blue-600;
}

.mobile-nav-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900;
}

.modern-card {
  @apply bg-white rounded-2xl border border-gray-200 p-6;
}

.stat-card {
  @apply rounded-2xl border p-6;
}
</style>
