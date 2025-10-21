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
          <router-link to="/booking" class="nav-link" :class="$route.path === '/booking' ? 'nav-active' : ''">
            <span class="text-lg">📅</span>
            <span class="text-sm">จองห้องประชุม</span>
          </router-link>
          <router-link to="/booking-list" class="nav-link nav-active">
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
            <h2 class="text-lg font-semibold text-gray-900 m-0">ระบบจองห้องประชุม</h2>
            <p class="text-xs text-gray-500 m-0 hidden sm:block lg:hidden">Meeting Room Booking System</p>
          </div>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-3">
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
          <!-- Page Header with Back Button -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg">
                📋
              </div>
              <div>
                <h1 class="text-3xl font-bold text-gray-900 m-0">รายละเอียดการจอง</h1>
                <p class="text-base text-gray-500 m-0 mt-1">ข้อมูลการจองห้องประชุม</p>
              </div>
            </div>
            <router-link
              to="/booking-list"
              class="px-4 py-2.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 font-medium transition-all flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              กลับ
            </router-link>
          </div>

          <!-- loading / error -->
          <div v-if="loading" class="modern-card shadow-md">
            <div class="flex items-center justify-center py-12">
              <div class="text-center">
                <div class="inline-block w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p class="text-gray-600 mt-4">กำลังโหลดรายละเอียด...</p>
              </div>
            </div>
          </div>

          <div v-else-if="error" class="modern-card shadow-md">
            <div class="text-center py-12">
              <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p class="text-red-600 font-medium">{{ error }}</p>
            </div>
          </div>

          <template v-else>
            <!-- Main Info Card -->
            <section class="modern-card shadow-md">
              <div class="flex items-start justify-between gap-4 flex-wrap">
                <div class="flex items-start gap-4 flex-1 min-w-0">
                  <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
                    📅
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 flex-wrap mb-2">
                      <h2 class="text-2xl font-bold text-gray-900 m-0">
                        {{ booking.room?.roomName || '-' }}
                      </h2>
                      <span
                        class="px-3 py-1.5 rounded-full text-xs font-semibold"
                        :class="statusBadgeClass(booking.status)"
                      >
                        {{ statusTH(booking.status) }}
                      </span>
                    </div>
                    <div class="space-y-1.5">
                      <p class="text-sm text-gray-600 m-0 flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {{ formatRange(booking.startTime, booking.endTime) }}
                      </p>
                      <p class="text-sm text-gray-600 m-0 flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        ผู้จอง: {{ booking.bookedBy?.fullName || '-' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-2">
                  <!-- ผู้ถูกเชิญ: confirm/decline -->
                  <template v-if="inviteForMe && !inviteLocked">
                    <button
                      class="px-4 py-2.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 text-sm font-medium transition-all flex items-center gap-1.5 shadow-sm"
                      @click="confirmInvite"
                      :disabled="actionBusy"
                    >
                      ✅ ยืนยันเข้าร่วม
                    </button>
                    <button
                      class="px-4 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm font-medium transition-all flex items-center gap-1.5 shadow-sm"
                      @click="declineInvite"
                      :disabled="actionBusy"
                    >
                      ❌ ปฏิเสธ
                    </button>
                  </template>

                  <!-- แอดมิน: approve -->
                  <button
                    v-if="isAdmin && booking.status === 'AWAITING_ADMIN_APPROVAL'"
                    class="px-4 py-2.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium transition-all flex items-center gap-1.5 shadow-sm"
                    @click="approveBooking"
                    :disabled="actionBusy"
                  >
                    🛡️ อนุมัติการจอง
                  </button>

                  <!-- ผู้จองหรือแอดมิน: cancel -->
                  <button
                    v-if="canCancel"
                    class="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-all flex items-center gap-1.5"
                    @click="cancelBooking"
                    :disabled="actionBusy || booking.status === 'CANCELLED'"
                  >
                    🚫 ยกเลิกการประชุม
                  </button>
                </div>
              </div>

              <!-- วัตถุประสงค์ -->
              <div v-if="booking.purpose" class="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <div class="flex-1">
                    <span class="font-semibold text-blue-900 text-sm">วัตถุประสงค์:</span>
                    <p class="text-sm text-blue-700 mt-1 m-0">{{ booking.purpose }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- ผู้เข้าร่วมตามตำแหน่ง + คำเชิญรายบุคคล -->
            <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Required Positions -->
              <div class="modern-card shadow-md">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 text-lg m-0">ตำแหน่งที่ต้องเข้าร่วม</h3>
                    <p class="text-xs text-gray-500 m-0">ที่ผู้จองเลือกไว้</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <div
                    v-if="!booking.requiredPositions?.length"
                    class="text-center py-8 text-gray-400"
                  >
                    <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <p class="text-sm">ไม่มีข้อมูล</p>
                  </div>
                  <div
                    v-for="rp in booking.requiredPositions"
                    :key="rp.id"
                    class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
                  >
                    <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <span class="text-purple-600">👤</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ rp.position?.name || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Invites -->
              <div class="modern-card shadow-md">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 text-lg m-0">คำเชิญรายบุคคล</h3>
                    <p class="text-xs text-gray-500 m-0">สถานะการตอบรับ</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <div
                    v-if="!booking.invites?.length"
                    class="text-center py-8 text-gray-400"
                  >
                    <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <p class="text-sm">ไม่มีข้อมูล</p>
                  </div>
                  <div
                    v-for="inv in booking.invites"
                    :key="inv.id"
                    class="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                        <img 
                          :src="inv.user?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" 
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ inv.user?.fullName || '-' }}</div>
                        <div class="text-xs text-gray-500">{{ inv.user?.positionId ? 'ตำแหน่ง #' + inv.user.positionId : '' }}</div>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium" :class="inviteBadge(inv.status)">
                      {{ inviteStatusTH(inv.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <!-- ผู้จดประชุม + บริการเสริม -->
            <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Note Takers -->
              <div class="modern-card shadow-md">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 text-lg m-0">ผู้จดประชุม</h3>
                    <p class="text-xs text-gray-500 m-0">ระบบเลือกจากคิวอัตโนมัติ</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <div
                    v-if="!booking.noteTakers?.length"
                    class="text-center py-8 text-gray-400"
                  >
                    <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <p class="text-sm">ไม่มีข้อมูล</p>
                  </div>
                  <div
                    v-for="nt in booking.noteTakers"
                    :key="nt.id"
                    class="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                        <span class="text-xl">📝</span>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ nt.user?.fullName || '-' }}
                        </div>
                        <div class="text-xs text-gray-500">ลำดับที่ {{ nt.roleIndex + 1 }}</div>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      {{ nt.status }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Services -->
              <div class="modern-card shadow-md">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 text-lg m-0">บริการ/ออปชั่น</h3>
                    <p class="text-xs text-gray-500 m-0">ที่ร้องขอสำหรับการประชุมนี้</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <div
                    v-if="!booking.services?.length"
                    class="text-center py-8 text-gray-400"
                  >
                    <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <p class="text-sm">ไม่มีข้อมูล</p>
                  </div>
                  <div
                    v-for="bs in booking.services"
                    :key="bs.id"
                    class="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <span class="text-xl">🔧</span>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ bs.service?.name || '-' }}
                        </div>
                        <div v-if="bs.quantity" class="text-xs text-gray-500">จำนวน: {{ bs.quantity }}</div>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium" :class="serviceBadge(bs.status)">
                      {{ serviceStatusTH(bs.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { isAdmin } = useAuth()

const showMobileMenu = ref(false)
const loading = ref(true)
const error   = ref('')
const booking = ref(null)
const me      = ref(null)
const actionBusy = ref(false)

/** Notifications */
const showNotif = ref(false)
const notifs = ref([])
const unreadCount = ref(0)
const loadingNoti = ref(false)

function logout () {
  localStorage.removeItem('access_token')
  localStorage.removeItem('me_cache')
  router.push('/login')
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
  try {
    await api.patch(`/api/notifications/${n.id}/read`)
    n.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch (e) { console.error(e) }
}

function resolveRouteByNotif (n) {
  const refType = n?.refType
  const refId = n?.refId
  switch (refType) {
    case 'BOOKING': return refId ? { path: `/booking-info/${refId}` } : { path: '/booking-list' }
    case 'ISSUE': return { path: '/report', query: refId ? { issueId: String(refId) } : {} }
    case 'INVITE': return { path: '/my-invites' }
    default: return { path: '/home' }
  }
}

async function goNotif (n) {
  try {
    if (!n.isRead) {
      n.isRead = true
      await markAsRead(n)
    }
    showNotif.value = false
    router.push(resolveRouteByNotif(n))
  } catch (e) {
    n.isRead = false
    console.error(e)
  }
}

function handleClickOutside (e) {
  const dropdown = document.querySelector('[data-noti-dropdown]')
  const bellBtn = document.querySelector('[data-noti-bell]')
  if (!dropdown) { showNotif.value = false; return }
  if (!dropdown.contains(e.target) && !(bellBtn && bellBtn.contains(e.target))) {
    showNotif.value = false
  }
}

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

function statusTH(s) {
  switch (s) {
    case 'AWAITING_ATTENDEE_CONFIRM': return 'รอผู้เข้าร่วมยืนยัน'
    case 'AWAITING_ADMIN_APPROVAL': return 'รอผู้ดูแลอนุมัติ'
    case 'APPROVED': return 'อนุมัติแล้ว'
    case 'CANCELLED': return 'ยกเลิกแล้ว'
    case 'REJECTED': return 'ปฏิเสธ'
    default: return s
  }
}

function statusBadgeClass (status) {
  switch (status) {
    case 'APPROVED': return 'bg-emerald-500 text-white'
    case 'REJECTED': return 'bg-red-500 text-white'
    case 'CANCELLED': return 'bg-gray-300 text-gray-700'
    case 'AWAITING_ADMIN_APPROVAL': return 'bg-amber-100 text-amber-800'
    case 'AWAITING_ATTENDEE_CONFIRM': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function inviteStatusTH(s) {
  switch (s) {
    case 'ACCEPTED': return 'ยอมรับ'
    case 'DECLINED': return 'ปฏิเสธ'
    case 'PENDING': return 'รอตอบรับ'
    default: return s
  }
}

function inviteBadge (status) {
  switch (status) {
    case 'ACCEPTED': return 'bg-emerald-100 text-emerald-700'
    case 'DECLINED': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-200 text-gray-600'
  }
}

function serviceStatusTH(s) {
  switch (s) {
    case 'CONFIRMED': return 'ยืนยันแล้ว'
    case 'IN_PROGRESS': return 'กำลังดำเนินการ'
    case 'PENDING': return 'รอดำเนินการ'
    case 'REJECTED': return 'ปฏิเสธ'
    case 'COMPLETED': return 'เสร็จสิ้น'
    default: return s
  }
}

function serviceBadge (status) {
  switch (status) {
    case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700'
    case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700'
    case 'PENDING': return 'bg-gray-200 text-gray-600'
    case 'REJECTED': return 'bg-red-100 text-red-700'
    case 'COMPLETED': return 'bg-blue-100 text-blue-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

/** ===== data drive ===== */
const bookingId = computed(() => {
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
  
  const result = await Swal.fire({
    title: 'ยืนยันเข้าร่วมประชุม?',
    text: 'คุณต้องการยืนยันการเข้าร่วมประชุมนี้ใช่หรือไม่?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก'
  })

  if (!result.isConfirmed) return

  actionBusy.value = true
  try {
    await api.post(`/api/bookings/${bookingId.value}/confirm`)
    await fetchBooking()
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'ยืนยันการเข้าร่วมสำเร็จ',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })
  } catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'ยืนยันไม่สำเร็จ',
      text: e?.response?.data?.error || 'เกิดข้อผิดพลาด',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    actionBusy.value = false
  }
}

async function declineInvite () {
  if (!bookingId.value) return
  
  const result = await Swal.fire({
    title: 'ปฏิเสธคำเชิญ?',
    text: 'คุณต้องการปฏิเสธการเข้าร่วมประชุมนี้ใช่หรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'ปฏิเสธ',
    cancelButtonText: 'ยกเลิก'
  })

  if (!result.isConfirmed) return

  actionBusy.value = true
  try {
    await api.post(`/api/bookings/${bookingId.value}/decline`)
    await fetchBooking()
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'ปฏิเสธคำเชิญสำเร็จ',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })
  } catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'ดำเนินการไม่สำเร็จ',
      text: e?.response?.data?.error || 'เกิดข้อผิดพลาด',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    actionBusy.value = false
  }
}

async function approveBooking () {
  if (!bookingId.value) return
  
  const result = await Swal.fire({
    title: 'อนุมัติการจอง?',
    text: 'คุณต้องการอนุมัติการจองนี้ใช่หรือไม่?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'อนุมัติ',
    cancelButtonText: 'ยกเลิก'
  })

  if (!result.isConfirmed) return

  actionBusy.value = true
  try {
    await api.post(`/api/bookings/${bookingId.value}/approve`)
    await fetchBooking()
    
    Swal.fire({
      icon: 'success',
      title: 'อนุมัติสำเร็จ',
      text: 'อนุมัติการจองเรียบร้อยแล้ว',
      confirmButtonColor: '#10b981'
    })
  } catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'อนุมัติไม่สำเร็จ',
      text: e?.response?.data?.error || 'เกิดข้อผิดพลาด',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    actionBusy.value = false
  }
}

async function cancelBooking () {
  if (!bookingId.value) return
  
  const result = await Swal.fire({
    title: 'ยกเลิกการประชุม?',
    text: 'คุณต้องการยกเลิกการประชุมนี้ใช่หรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'ยกเลิกการประชุม',
    cancelButtonText: 'กลับ'
  })

  if (!result.isConfirmed) return

  actionBusy.value = true
  try {
    await api.patch(`/api/bookings/${bookingId.value}/cancel`)
    await fetchBooking()
    
    Swal.fire({
      icon: 'success',
      title: 'ยกเลิกสำเร็จ',
      text: 'ยกเลิกการประชุมเรียบร้อยแล้ว',
      confirmButtonColor: '#10b981'
    })
  } catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'ยกเลิกไม่สำเร็จ',
      text: e?.response?.data?.error || 'เกิดข้อผิดพลาด',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    actionBusy.value = false
  }
}

let notiTimer = null

/** ===== lifecycle ===== */
onMounted(async () => {
  await fetchMe()
  await fetchBooking()
  await fetchNotifications()
  notiTimer = setInterval(() => fetchNotifications(), 30000)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (notiTimer) clearInterval(notiTimer)
  document.removeEventListener('click', handleClickOutside)
})
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
</style>
