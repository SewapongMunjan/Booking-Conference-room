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
          <!-- Search -->
          <div class="hidden lg:block relative">
            <input 
              type="search" 
              v-model="keyword"
              @input="fetchMine"
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
          <!-- Page Header -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg">
              📋
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 m-0">รายการจองของฉัน</h1>
              <p class="text-base text-gray-500 m-0 mt-1">จัดการและติดตามการจองห้องประชุมของคุณ</p>
            </div>
          </div>

          <!-- Filters -->
          <div class="modern-card shadow-md">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">ตัวกรองการค้นหา</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                <select v-model="status" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white">
                  <option v-for="opt in statusOptions" :key="opt.value || 'ALL'" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <!-- Date From -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">จากวันที่</label>
                <input type="datetime-local" v-model="startLocal" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
              </div>

              <!-- Date To -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ถึงวันที่</label>
                <input type="datetime-local" v-model="endLocal" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
              </div>

              <!-- Actions -->
              <div class="flex items-end gap-2">
                <button class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all" @click="applyDateFilter">
                  🔍 กรอง
                </button>
                <button class="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all" @click="clearDateFilter">
                  ✕
                </button>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span v-if="loading" class="text-sm text-gray-500">🔄 กำลังโหลด...</span>
                <span v-if="errorMsg" class="text-sm text-red-600">⚠️ {{ errorMsg }}</span>
              </div>
              <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" @click="resetFilters">
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          </div>

          <!-- Booking List -->
          <div class="modern-card shadow-md">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">การจองทั้งหมด ({{ total }})</h2>
            </div>

            <div v-if="items.length === 0 && !loading" class="text-center py-12">
              <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p class="text-gray-500 font-medium">ไม่มีรายการจอง</p>
              <p class="text-sm text-gray-400 mt-1">เริ่มต้นจองห้องประชุมของคุณได้เลย</p>
              <router-link to="/booking" class="inline-block mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all">
                + จองห้องประชุม
              </router-link>
            </div>

            <div class="space-y-4" v-else>
              <div
                v-for="b in items"
                :key="b.id"
                :data-booking-id="b.id"
                class="group border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div class="flex items-start gap-4">
                  <!-- Date Badge -->
                  <div class="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shrink-0 shadow-md">
                    <span class="text-2xl font-bold leading-none">{{ toDay(b.startTime) }}</span>
                    <span class="text-[10px] mt-0.5">{{ toMonthTH(b.startTime) }}</span>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 class="font-semibold text-gray-900 text-base mb-1">
                          {{ b.room?.roomName || '-' }}
                        </h3>
                        <div class="flex items-center gap-4 text-sm text-gray-600">
                          <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {{ timeRange(b.startTime, b.endTime) }}
                          </span>
                          <span v-if="b.room?.capacity" class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                            {{ b.room.capacity }} ที่นั่ง
                          </span>
                        </div>
                      </div>

                      <span :class="['px-3 py-1.5 rounded-full font-medium text-xs whitespace-nowrap', badgeClass(b.status)]">
                        {{ statusTH(b.status) }}
                      </span>
                    </div>

                    <!-- Invite Stats -->
                    <div v-if="b.inviteStats && b.inviteStats.invited > 0" class="mb-3">
                      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                        รอเชิญตอบ {{ b.inviteStats.invited }} คน
                      </span>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2">
                      <button
                        class="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all font-medium"
                        @click="goDetail(b.id)"
                      >
                        📋 ดูรายละเอียด
                      </button>

                      <button
                        v-if="b.status !== 'CANCELLED'"
                        class="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all font-medium"
                        @click="cancelBooking(b)"
                      >
                        ✕ ยกเลิกการจอง
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-2">
              <button 
                class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
                :disabled="page===1" 
                @click="() => { page--; fetchMine() }"
              >
                ← ก่อนหน้า
              </button>
              <span class="px-4 py-2 text-sm text-gray-600">
                หน้า <strong>{{ page }}</strong> / {{ totalPages }}
              </span>
              <button 
                class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
                :disabled="page===totalPages" 
                @click="() => { page++; fetchMine() }"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import api from '@/lib/api.js'

const route = useRoute()
const router = useRouter()

const showMobileMenu = ref(false)
const me = ref(null)

/** ตัวเลือกสถานะ */
const statusOptions = [
  { label: 'ทั้งหมด', value: '' },
  { label: 'รอผู้เข้าร่วมยืนยัน', value: 'AWAITING_ATTENDEE_CONFIRM' },
  { label: 'รอผู้ดูแลอนุมัติ',   value: 'AWAITING_ADMIN_APPROVAL' },
  { label: 'อนุมัติแล้ว',        value: 'APPROVED' },
  { label: 'ยกเลิกแล้ว',         value: 'CANCELLED' },
]

/** STATE */
const status   = ref('')
const keyword  = ref('')

const items    = ref([])
const loading  = ref(false)
const errorMsg = ref('')

let page     = ref(1)
const pageSize = ref(10)
const total    = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

/** ฟิลเตอร์ช่วงวันเวลา */
const startLocal = ref('')
const endLocal   = ref('')
const startISO = computed(() => startLocal.value ? new Date(startLocal.value).toISOString() : '')
const endISO   = computed(() => endLocal.value   ? new Date(endLocal.value).toISOString()   : '')

/** Notifications */
const showNotif = ref(false)
const notifs = ref([])
const unreadCount = ref(0)
const loadingNoti = ref(false)
const errorNoti = ref('')

function logout () {
  localStorage.removeItem('access_token')
  localStorage.removeItem('me_cache')
  router.push('/login')
}

async function fetchMe () {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = data
  } catch { me.value = null }
}

async function fetchNotifications() {
  loadingNoti.value = true
  errorNoti.value = ''
  try {
    const { data } = await api.get('/api/notifications')
    notifs.value = data.items || []
    unreadCount.value = notifs.value.filter(n => !n.isRead).length
  } catch (e) {
    console.error(e)
    errorNoti.value = 'โหลดการแจ้งเตือนไม่สำเร็จ'
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

/** Helpers แสดงผล */
function toDay(iso){ const d = new Date(iso); return String(d.getDate()) }
function toMonthTH(iso){
  const d = new Date(iso)
  const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return m[d.getMonth()]
}
function timeRange(s,e){
  const opt = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(s).toLocaleTimeString([],opt)} - ${new Date(e).toLocaleTimeString([],opt)}`
}
function statusTH(s){
  switch (s) {
    case 'AWAITING_ATTENDEE_CONFIRM': return 'รอผู้เข้าร่วมยืนยัน'
    case 'AWAITING_ADMIN_APPROVAL':   return 'รอผู้ดูแลอนุมัติ'
    case 'APPROVED':                  return 'อนุมัติแล้ว'
    case 'CANCELLED':                 return 'ยกเลิกแล้ว'
    default: return s
  }
}
function badgeClass(s){
  switch (s) {
    case 'AWAITING_ATTENDEE_CONFIRM': return 'bg-amber-100 text-amber-800'
    case 'AWAITING_ADMIN_APPROVAL':   return 'bg-blue-100 text-blue-800'
    case 'APPROVED':                  return 'bg-green-500 text-white'
    case 'CANCELLED':                 return 'bg-gray-200 text-gray-700'
    default: return 'bg-gray-200 text-gray-700'
  }
}

/** ปุ่มฟิลเตอร์วันที่ */
function applyDateFilter(){
  page.value = 1
  fetchMine()
}
function clearDateFilter(){
  startLocal.value = ''
  endLocal.value   = ''
  page.value = 1
  fetchMine()
}

/** รีเซ็ตทุกตัวกรอง */
function resetFilters(){
  status.value  = ''
  keyword.value = ''
  startLocal.value = ''
  endLocal.value   = ''
  page.value = 1
  fetchMine()
}

/** โหลดรายการของฉัน */
async function fetchMine(){
  loading.value = true
  errorMsg.value = ''
  try{
    const params = {
      mine: 1,
      page: page.value,
      pageSize: pageSize.value,
      withInviteStats: 1,
    }
    if (status.value && String(status.value).trim() !== '') {
      params.status = status.value
    }
    if (startISO.value && endISO.value) {
      params.start = startISO.value
      params.end   = endISO.value
    }

    const { data } = await api.get('/api/bookings', { params })
    let serverList = Array.isArray(data?.items) ? data.items : []

    // keyword filter ฝั่ง client
    if (keyword.value?.trim()) {
      const k = keyword.value.trim().toLowerCase()
      serverList = serverList.filter(b =>
        (b.room?.roomName || '').toLowerCase().includes(k)
      )
      total.value = serverList.length
      // slice ตามหน้า
      const start = (page.value - 1) * pageSize.value
      const end   = start + pageSize.value
      items.value = serverList.slice(start, end)
    } else {
      items.value = serverList
      total.value = typeof data?.total === 'number' ? data.total : serverList.length
    }

    await maybeFocus()
  } catch (e) {
    console.error(e)
    errorMsg.value = e?.response?.data?.error || 'โหลดรายการไม่สำเร็จ'
    Swal.fire({
      icon: 'error',
      title: 'โหลดรายการไม่สำเร็จ',
      text: errorMsg.value,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#ef4444'
    })
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

/** ยกเลิกการจอง */
async function cancelBooking(b){
  const result = await Swal.fire({
    title: `ยืนยันยกเลิกการจอง?`,
    html: `ห้อง <b>${b.room?.roomName || b.id}</b><br/>ช่วงเวลา ${timeRange(b.startTime, b.endTime)}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'ยกเลิกการจอง',
    cancelButtonText: 'กลับ'
  })
  if (!result.isConfirmed) return

  try {
    await api.patch(`/api/bookings/${b.id}/cancel`)

    items.value = items.value.filter(x => x.id !== b.id)
    total.value = Math.max(0, total.value - 1)
    if (items.value.length === 0 && page.value > 1) {
      page.value -= 1
      await fetchMine()
    }

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'ยกเลิกการจองสำเร็จ',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })
  } catch (e) {
    console.error(e)
    Swal.fire({
      icon: 'error',
      title: 'ยกเลิกไม่สำเร็จ',
      text: e?.response?.data?.error || 'เกิดข้อผิดพลาด',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#ef4444'
    })
  }
}

function goDetail(id){
  if (!id) return
  router.push({ path: `/booking-info/${id}` })
}

async function maybeFocus () {
  const focusId = route.query.focusId
  if (!focusId) return
  await nextTick()
  const el = document.querySelector(`[data-booking-id="${focusId}"]`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-2','ring-blue-500','rounded-md','bg-blue-50')
    setTimeout(() => el.classList.remove('ring-2','ring-blue-500','rounded-md','bg-blue-50'), 2500)
  }
}

let notiTimer = null

onMounted(async () => {
  await fetchMe()
  await fetchMine()
  await fetchNotifications()
  notiTimer = setInterval(() => fetchNotifications(), 30000)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (notiTimer) clearInterval(notiTimer)
  document.removeEventListener('click', handleClickOutside)
})

watch(status, () => { page.value = 1; fetchMine() })
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
