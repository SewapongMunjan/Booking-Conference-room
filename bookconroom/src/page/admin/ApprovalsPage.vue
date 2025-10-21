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
              <p class="text-[10px] text-gray-500">Admin Console</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link to="/admin/dashboard-modern" class="nav-link">
            <span class="text-lg">🏠</span>
            <span class="text-sm">Dashboard</span>
          </router-link>
          <router-link to="/admin/approvals" class="nav-link nav-active">
            <span class="text-lg">🛡️</span>
            <span class="text-sm">Approvals</span>
          </router-link>
          <router-link to="/admin/my-bookings" class="nav-link">
            <span class="text-lg">📋</span>
            <span class="text-sm">My Bookings</span>
          </router-link>
          <router-link to="/admin/issues" class="nav-link">
            <span class="text-lg">⚠️</span>
            <span class="text-sm">Issues</span>
          </router-link>
          <router-link to="/admin/loans" class="nav-link">
            <span class="text-lg">🔌</span>
            <span class="text-sm">Loans</span>
          </router-link>
          <router-link to="/admin/room-status" class="nav-link">
            <span class="text-lg">ℹ️</span>
            <span class="text-sm">Room Status</span>
          </router-link>
        </nav>

        <!-- Footer -->
        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <img :src="me?.avatarUrl || 'https://cdn-icons-png.flaticon.com/128/456/456283.png'" class="w-9 h-9 rounded-lg" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'Admin' }}</div>
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
            <h2 class="text-lg font-semibold text-gray-900 m-0">Approvals</h2>
            <p class="text-xs text-gray-500 m-0 hidden sm:block lg:hidden">อนุมัติการจองห้องประชุม</p>
          </div>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-3">
          <!-- Search (Desktop only) -->
          <div class="hidden md:block relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </span>
            <input 
              v-model="q" 
              placeholder="ค้นหา..." 
              class="w-64 pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              @input="fetchList"
            />
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

          <!-- Profile (Desktop) -->
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
              <div class="font-medium text-xs text-gray-900 truncate">{{ me?.name || 'Admin' }}</div>
              <div class="text-[10px] text-gray-500">ดูโปรไฟล์</div>
            </div>
          </router-link>
        </div>
        <nav class="p-2 space-y-1">
          <router-link to="/admin/dashboard-modern" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🏠</span> <span class="text-sm">Dashboard</span>
          </router-link>
          <router-link to="/admin/approvals" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🛡️</span> <span class="text-sm">Approvals</span>
          </router-link>
          <router-link to="/admin/my-bookings" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">📋</span> <span class="text-sm">My Bookings</span>
          </router-link>
          <router-link to="/admin/issues" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">⚠️</span> <span class="text-sm">Issues</span>
          </router-link>
          <router-link to="/admin/loans" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🔌</span> <span class="text-sm">Loans</span>
          </router-link>
          <router-link to="/admin/room-status" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">ℹ️</span> <span class="text-sm">Room Status</span>
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
      <main class="w-full min-h-[calc(100vh-5rem)] px-8 py-6">
        <div class="max-w-7xl mx-auto space-y-6">
          <!-- Guard -->
          <div v-if="!isAdmin" class="modern-card shadow-md bg-amber-50 border-amber-200">
            <div class="p-8 text-center">
              <div class="text-5xl mb-4">🔒</div>
              <h2 class="text-xl font-semibold text-amber-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
              <p class="text-amber-700">บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ กรุณาเข้าสู่ระบบด้วยบัญชี Admin</p>
            </div>
          </div>

          <template v-else>
            <!-- Page Header -->
            <div class="flex items-center gap-4 mb-6">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
                🛡️
              </div>
              <div>
                <h1 class="text-3xl font-bold text-gray-900 m-0">Approvals</h1>
                <p class="text-base text-gray-500 m-0 mt-1">จัดการและอนุมัติคำขอจองห้องประชุม</p>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="modern-card shadow-md">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">📋</div>
                  <div>
                    <div class="text-sm text-gray-500">รออนุมัติทั้งหมด</div>
                    <div class="text-2xl font-bold text-gray-900">{{ total }}</div>
                  </div>
                </div>
              </div>

              <div class="modern-card shadow-md">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">✅</div>
                  <div>
                    <div class="text-sm text-gray-500">อนุมัติแล้ว</div>
                    <div class="text-2xl font-bold text-green-600">{{ items.filter(b => b.status === 'APPROVED').length }}</div>
                  </div>
                </div>
              </div>

              <div class="modern-card shadow-md">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">⏳</div>
                  <div>
                    <div class="text-sm text-gray-500">รอดำเนินการ</div>
                    <div class="text-2xl font-bold text-amber-600">{{ items.length }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bookings List -->
            <div class="modern-card shadow-md">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-xl font-semibold text-gray-900">คำขอรออนุมัติ</h2>
                  <p class="text-sm text-gray-500 mt-1">จัดการและอนุมัติคำขอจองห้องประชุม</p>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="loading" class="text-sm text-gray-500">🔄 กำลังโหลด...</span>
                  <span v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</span>
                </div>
              </div>

              <div v-if="items.length === 0 && !loading" class="text-center py-12">
                <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                </div>
                <p class="text-gray-500 font-medium">ไม่มีคำขอรออนุมัติ</p>
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="(b, idx) in items"
                  :key="b.id"
                  class="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div class="flex items-start gap-4">
                    <!-- Date Badge -->
                    <div class="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shrink-0 shadow-md">
                      <span class="text-2xl font-bold leading-none">{{ day(b.startTime) }}</span>
                      <span class="text-[10px] mt-0.5">{{ monthTH(b.startTime) }}</span>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 class="font-semibold text-gray-900 text-base mb-1">
                            {{ b.room?.roomName || '-' }}
                          </h3>
                          <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
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
                            <span class="flex items-center gap-1">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                              </svg>
                              {{ b.bookedBy?.fullName || '-' }}
                            </span>
                          </div>
                        </div>

                        <span :class="['px-3 py-1.5 rounded-full font-medium text-xs whitespace-nowrap', badge(b.status)]">
                          {{ statusTH(b.status) }}
                        </span>
                      </div>

                      <!-- Actions -->
                      <div class="flex items-center gap-2 mt-3">
                        <button
                          class="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-all font-medium"
                          @click="openDetail(b)"
                        >
                          📋 รายละเอียด
                        </button>
                        <button
                          class="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all font-medium disabled:opacity-50"
                          :disabled="actingId === b.id"
                          @click="approve(b)"
                        >
                          ✓ อนุมัติ
                        </button>
                        <button
                          class="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all font-medium disabled:opacity-50"
                          :disabled="actingId === b.id"
                          @click="cancel(b)"
                        >
                          ✕ ยกเลิก
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
                  @click="page--; fetchList()"
                >
                  ← ก่อนหน้า
                </button>
                <span class="px-4 py-2 text-sm text-gray-600">
                  หน้า <strong>{{ page }}</strong> / {{ totalPages }}
                </span>
                <button 
                  class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
                  :disabled="page===totalPages" 
                  @click="page++; fetchList()"
                >
                  ถัดไป →
                </button>
              </div>
            </div>
          </template>
        </div>
      </main>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetail" class="fixed inset-0 z-50 flex items-center justify-center p-4" @keydown.esc="closeDetail">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDetail"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 class="text-lg font-semibold text-gray-900">รายละเอียดการจอง</h2>
          <button class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500" @click="closeDetail">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div class="p-6">
          <div v-if="detailLoading" class="text-center py-12">
            <div class="inline-block w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p class="text-gray-500 mt-4">กำลังโหลด...</p>
          </div>
          <div v-else-if="detailError" class="text-center py-12">
            <div class="text-5xl mb-4">❌</div>
            <p class="text-red-600 font-medium">{{ detailError }}</p>
          </div>
          <div v-else-if="detail" class="space-y-6">
            <!-- Basic Info Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <div class="text-xs text-gray-500 uppercase tracking-wider">ห้อง</div>
                <div class="text-sm font-medium text-gray-900">
                  {{ detail.room?.roomName }} 
                  <span v-if="detail.room?.capacity" class="text-gray-500">· {{ detail.room.capacity }} ที่นั่ง</span>
                </div>
              </div>
              <div class="space-y-1">
                <div class="text-xs text-gray-500 uppercase tracking-wider">ผู้จอง</div>
                <div class="text-sm font-medium text-gray-900">{{ detail.bookedBy?.fullName }}</div>
              </div>
              <div class="space-y-1">
                <div class="text-xs text-gray-500 uppercase tracking-wider">วันเวลา</div>
                <div class="text-sm font-medium text-gray-900">
                  {{ timeRange(detail.startTime, detail.endTime) }} · {{ dateTH(detail.startTime) }}
                </div>
              </div>
              <div class="space-y-1">
                <div class="text-xs text-gray-500 uppercase tracking-wider">สถานะ</div>
                <div><span :class="['px-3 py-1 rounded-full text-xs font-medium inline-block', badge(detail.status)]">{{ statusTH(detail.status) }}</span></div>
              </div>
            </div>

            <hr class="border-gray-200">

            <!-- Details Sections -->
            <div class="space-y-4">
              <!-- Required Positions -->
              <div class="space-y-2">
                <div class="text-sm font-semibold text-gray-900">ตำแหน่งที่ต้องเข้าประชุม</div>
                <div v-if="detail.requiredPositions?.length" class="flex flex-wrap gap-2">
                  <span v-for="rp in detail.requiredPositions" :key="rp.id" class="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                    {{ rp.position?.name }}
                  </span>
                </div>
                <div v-else class="text-sm text-gray-500">ไม่มีข้อมูล</div>
              </div>

              <!-- Invites -->
              <div class="space-y-2">
                <div class="text-sm font-semibold text-gray-900">ผู้ถูกเชิญ</div>
                <div v-if="detail.invites?.length" class="space-y-2">
                  <div v-for="iv in detail.invites" :key="iv.id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span class="text-sm text-gray-900">{{ iv.user?.fullName }}</span>
                    <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', inviteTagClass(iv.status)]">
                      {{ inviteTH(iv.status) }}
                    </span>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500">ไม่มีข้อมูล</div>
              </div>

              <!-- Note Takers -->
              <div class="space-y-2">
                <div class="text-sm font-semibold text-gray-900">ผู้จดประชุม</div>
                <div v-if="detail.noteTakers?.length" class="flex flex-wrap gap-2">
                  <span v-for="nt in detail.noteTakers" :key="nt.id" class="px-3 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800">
                    {{ nt.user?.fullName }}
                  </span>
                </div>
                <div v-else class="text-sm text-gray-500">ไม่มีข้อมูล</div>
              </div>

              <!-- Services -->
              <div class="space-y-2">
                <div class="text-sm font-semibold text-gray-900">บริการ/อุปกรณ์</div>
                <div v-if="detail.services?.length" class="flex flex-wrap gap-2">
                  <span v-for="bs in detail.services" :key="bs.id" class="px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                    {{ bs.service?.name }}
                  </span>
                </div>
                <div v-else class="text-sm text-gray-500">ไม่มีข้อมูล</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-2">
          <button class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-white transition-all" @click="closeDetail">
            ปิด
          </button>
          <button 
            v-if="detail && detail.status === 'AWAITING_ADMIN_APPROVAL'"
            class="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all"
            @click="approve(detail); closeDetail()"
          >
            ✓ อนุมัติ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'

const router = useRouter()
const showMobileMenu = ref(false)
const q = ref('')
const items = ref([])
const loading = ref(false)
const errorMsg = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const actingId = ref(null)

const me = ref(null)

/** Notifications */
const showNotif = ref(false)
const notifs = ref([])
const unreadCount = ref(0)
const loadingNoti = ref(false)

/** Detail Modal */
const showDetail = ref(false)
const detailLoading = ref(false)
const detailError = ref('')
const detail = ref(null)

function parseIsAdminFromToken() {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return false
    const payload = JSON.parse(atob((token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/')))
    return !!payload?.pos?.isAdmin
  } catch {
    return false
  }
}

const isAdmin = computed(() => {
  if (me.value && typeof me.value.isAdmin === 'boolean') return me.value.isAdmin
  return parseIsAdminFromToken()
})

async function fetchMe() {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = { ...data, isAdmin: !!(data?.position?.isAdmin ?? data?.isAdmin) }
  } catch {
    me.value = null
  }
}

function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_role')
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

function formatTime(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

function toggleNotif() {
  showNotif.value = !showNotif.value
  if (showNotif.value) fetchNotifications()
}

function refreshNotif() {
  return fetchNotifications()
}

async function markAllAsRead() {
  try {
    await api.post('/api/notifications/mark-all-read')
    notifs.value = notifs.value.map(n => ({ ...n, isRead: true }))
    unreadCount.value = 0
  } catch (e) {
    console.error(e)
  }
}

async function markAsRead(n) {
  try {
    await api.patch(`/api/notifications/${n.id}/read`)
    n.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch (e) {
    console.error(e)
  }
}

function resolveRouteByNotif(n) {
  const refType = n?.refType
  const refId = n?.refId
  switch (refType) {
    case 'BOOKING':
      return refId ? { path: `/booking/${refId}` } : { path: '/admin/approvals' }
    case 'ISSUE':
      return { path: '/admin/issues', query: refId ? { issueId: String(refId) } : {} }
    case 'INVITE':
      return { path: '/my-invites' }
    default:
      return { path: '/admin/dashboard-modern' }
  }
}

async function goNotif(n) {
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

function handleClickOutside(e) {
  const dropdown = document.querySelector('[data-noti-dropdown]')
  const bellBtn = document.querySelector('[data-noti-bell]')
  if (!dropdown) {
    showNotif.value = false
    return
  }
  if (!dropdown.contains(e.target) && !(bellBtn && bellBtn.contains(e.target))) {
    showNotif.value = false
  }
}

// Booking functions
function day(iso) { return new Date(iso).getDate() }
function monthTH(iso) {
  const m = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return m[new Date(iso).getMonth()]
}
function timeRange(s, e) {
  const opt = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(s).toLocaleTimeString([], opt)} - ${new Date(e).toLocaleTimeString([], opt)}`
}
function dateTH(iso) {
  const d = new Date(iso)
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`
}
function statusTH(s) {
  switch (s) {
    case 'AWAITING_ATTENDEE_CONFIRM': return 'รอผู้เข้าร่วมยืนยัน'
    case 'AWAITING_ADMIN_APPROVAL': return 'รอผู้ดูแลอนุมัติ'
    case 'APPROVED': return 'อนุมัติแล้ว'
    case 'CANCELLED': return 'ยกเลิกแล้ว'
    default: return s
  }
}
function inviteTH(s) {
  switch (s) {
    case 'INVITED': return 'เชิญแล้ว'
    case 'ACCEPTED': return 'ยืนยันแล้ว'
    case 'DECLINED': return 'ปฏิเสธ'
    default: return s
  }
}
function badge(s) {
  if (s === 'AWAITING_ADMIN_APPROVAL') return 'bg-amber-100 text-amber-800 border border-amber-200'
  if (s === 'APPROVED') return 'bg-green-500 text-white'
  if (s === 'CANCELLED') return 'bg-gray-200 text-gray-700'
  return 'bg-blue-100 text-blue-800'
}
function inviteTagClass(s) {
  if (s === 'ACCEPTED') return 'bg-green-100 text-green-800'
  if (s === 'DECLINED') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-700'
}

function sortByNewest(a, b) {
  const ta = Date.parse(a.createdAt || a.startTime || 0)
  const tb = Date.parse(b.createdAt || b.startTime || 0)
  return tb - ta
}

async function fetchList() {
  if (!isAdmin.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    const PENDING_STATUSES = ['AWAITING_ADMIN_APPROVAL', 'AWAITING_ATTENDEE_CONFIRM']
    const paramsBase = { page: 1, pageSize: 500, sort: '-createdAt' }
    const reqs = PENDING_STATUSES.map(st => api.get('/api/bookings', { params: { ...paramsBase, status: st } }))
    const resps = await Promise.allSettled(reqs)
    const collected = []
    for (const r of resps) {
      if (r.status === 'fulfilled') {
        const arr = Array.isArray(r.value?.data?.items) ? r.value.data.items : []
        collected.push(...arr)
      }
    }
    const mergedMap = new Map()
    collected.forEach(it => mergedMap.set(it.id, it))
    const merged = Array.from(mergedMap.values()).sort(sortByNewest)

    const kw = q.value.toLowerCase()
    const filtered = kw
      ? merged.filter(b => (b.room?.roomName || '').toLowerCase().includes(kw) || (b.bookedBy?.fullName || '').toLowerCase().includes(kw))
      : merged

    total.value = filtered.length
    const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value))
    if (page.value > maxPage) page.value = maxPage
    const start = (page.value - 1) * pageSize.value
    const end = start + pageSize.value
    items.value = filtered.slice(start, end)
  } catch (e) {
    console.error(e)
    errorMsg.value = e?.response?.data?.error || 'โหลดรายการไม่สำเร็จ'
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function approve(b) {
  const result = await Swal.fire({
    title: 'อนุมัติการจอง?',
    html: `ห้อง <b>${b.room?.roomName || b.id}</b><br/>เวลา ${timeRange(b.startTime, b.endTime)}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#16a34a',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'อนุมัติ',
    cancelButtonText: 'ยกเลิก'
  })
  if (!result.isConfirmed) return

  try {
    actingId.value = b.id
    await api.post(`/api/bookings/${b.id}/approve`)
    page.value = 1
    await fetchList()
    await Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'อนุมัติสำเร็จ',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })
  } catch (e) {
    console.error(e)
    await Swal.fire({
      icon: 'error',
      title: 'อนุมัติไม่สำเร็จ',
      text: e?.response?.data?.error || 'อนุมัติไม่สำเร็จ',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    actingId.value = null
  }
}

async function cancel(b) {
  const result = await Swal.fire({
    title: 'ยืนยันยกเลิกการจอง?',
    html: `ห้อง <b>${b.room?.roomName || b.id}</b><br/>เวลา ${timeRange(b.startTime, b.endTime)}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ยกเลิกการจอง',
    cancelButtonText: 'กลับ',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280'
  })
  if (!result.isConfirmed) return

  try {
    actingId.value = b.id
    await api.patch(`/api/bookings/${b.id}/cancel`)
    page.value = 1
    await fetchList()
    await Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'ยกเลิกสำเร็จ',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })
  } catch (e) {
    console.error(e)
    await Swal.fire({
      icon: 'error',
      title: 'ยกเลิกไม่สำเร็จ',
      text: e?.response?.data?.error || 'ยกเลิกไม่สำเร็จ',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    actingId.value = null
  }
}

async function openDetail(row) {
  showDetail.value = true
  detailLoading.value = true
  detailError.value = ''
  detail.value = null
  try {
    const { data } = await api.get(`/api/bookings/${row.id}`)
    detail.value = data?.booking || data
  } catch (e) {
    console.error(e)
    detailError.value = e?.response?.data?.error || 'โหลดรายละเอียดไม่สำเร็จ'
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  showDetail.value = false
}

let notiTimer = null

onMounted(async () => {
  await fetchMe()
  page.value = 1
  await fetchList()
  await fetchNotifications()
  notiTimer = setInterval(() => fetchNotifications(), 30000)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (notiTimer) clearInterval(notiTimer)
  document.removeEventListener('click', handleClickOutside)
})

watch([page, q], () => fetchList())
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