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
          <router-link to="/admin/approvals" class="nav-link">
            <span class="text-lg">🛡️</span>
            <span class="text-sm">Approvals</span>
          </router-link>
          <router-link to="/admin/my-bookings" class="nav-link">
            <span class="text-lg">📋</span>
            <span class="text-sm">My Bookings</span>
          </router-link>
          <router-link to="/admin/issues" class="nav-link nav-active">
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
            <h2 class="text-lg font-semibold text-gray-900 m-0">Issues</h2>
            <p class="text-xs text-gray-500 m-0 hidden sm:block lg:hidden">จัดการปัญหาและแจ้งซ่อม</p>
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
          <!-- Page Header -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-3xl shadow-lg">
              ⚠️
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 m-0">Issues Management</h1>
              <p class="text-base text-gray-500 m-0 mt-1">จัดการปัญหาและแจ้งซ่อมห้องประชุม</p>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">📋</div>
                <div>
                  <div class="text-sm text-gray-500">ทั้งหมด</div>
                  <div class="text-2xl font-bold text-gray-900">{{ items.length }}</div>
                </div>
              </div>
            </div>

            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">⏳</div>
                <div>
                  <div class="text-sm text-gray-500">รอดำเนินการ</div>
                  <div class="text-2xl font-bold text-amber-600">{{ items.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length }}</div>
                </div>
              </div>
            </div>

            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">✅</div>
                <div>
                  <div class="text-sm text-gray-500">แก้ไขแล้ว</div>
                  <div class="text-2xl font-bold text-green-600">{{ items.filter(i => i.status === 'RESOLVED').length }}</div>
                </div>
              </div>
            </div>

            <div class="modern-card shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">🔒</div>
                <div>
                  <div class="text-sm text-gray-500">ปิดงาน</div>
                  <div class="text-2xl font-bold text-gray-600">{{ items.filter(i => i.status === 'CLOSED').length }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Issues List -->
          <div class="modern-card shadow-md">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">รายการปัญหา</h2>
                <p class="text-sm text-gray-500 mt-1">จัดการและติดตามปัญหาทั้งหมด</p>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="loading" class="text-sm text-gray-500">🔄 กำลังโหลด...</span>
              </div>
            </div>

            <div v-if="filtered.length === 0 && !loading" class="text-center py-12">
              <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p class="text-gray-500 font-medium">ไม่มีรายการปัญหา</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="issue in filtered"
                :key="issue.id"
                class="border-2 border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all"
              >
                <div class="flex items-start gap-4">
                  <!-- Priority Badge -->
                  <div class="flex flex-col items-center justify-center w-16 h-16 rounded-xl text-white shrink-0 shadow-md" :class="priorityBg(issue.priority)">
                    <span class="text-2xl">{{ priorityIcon(issue.priority) }}</span>
                    <span class="text-[10px] mt-0.5 uppercase font-semibold">{{ issue.priority || 'MED' }}</span>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 class="font-semibold text-gray-900 text-base mb-1">
                          {{ issue.subject || issue.title || 'ไม่มีหัวข้อ' }}
                        </h3>
                        <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span v-if="issue.room?.roomName" class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            {{ issue.room.roomName }}
                          </span>
                          <span v-if="issue.issueType" class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                            </svg>
                            {{ issueTypeTH(issue.issueType) }}
                          </span>
                          <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            {{ dateTH(issue.createdAt) }}
                          </span>
                          <span v-if="issue.reportedBy?.fullName" class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            {{ issue.reportedBy.fullName }}
                          </span>
                        </div>
                        <div v-if="issue.description" class="text-sm text-gray-500 mt-2 line-clamp-2">
                          {{ issue.description }}
                        </div>
                      </div>

                      <span :class="['px-3 py-1.5 rounded-full font-medium text-xs whitespace-nowrap', statusBadge(issue.status)]">
                        {{ statusTH(issue.status) }}
                      </span>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        class="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-all font-medium"
                        @click="view(issue)"
                      >
                        📋 รายละเอียด
                      </button>
                      <button
                        v-if="issue.status !== 'RESOLVED' && issue.status !== 'CLOSED'"
                        class="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-medium disabled:opacity-50"
                        :disabled="actingId === issue.id"
                        @click="markInProgress(issue)"
                      >
                        🔄 กำลังดำเนินการ
                      </button>
                      <button
                        v-if="issue.status !== 'RESOLVED' && issue.status !== 'CLOSED'"
                        class="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all font-medium disabled:opacity-50"
                        :disabled="actingId === issue.id"
                        @click="resolve(issue)"
                      >
                        ✓ แก้ไขแล้ว
                      </button>
                      <button
                        v-if="issue.status === 'RESOLVED'"
                        class="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                        :disabled="actingId === issue.id"
                        @click="closeIssue(issue)"
                      >
                        🔒 ปิดงาน
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetail" class="fixed inset-0 z-50 flex items-center justify-center p-4" @keydown.esc="closeDetail">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDetail"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 class="text-lg font-semibold text-gray-900">รายละเอียดปัญหา</h2>
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
                <div class="text-xs text-gray-500 uppercase tracking-wider">หัวข้อ</div>
                <div class="text-sm font-medium text-gray-900">{{ detail.subject || detail.title || '-' }}</div>
              </div>
              <div class="space-y-1">
                <div class="text-xs text-gray-500 uppercase tracking-wider">ห้อง</div>
                <div class="text-sm font-medium text-gray-900">{{ detail.room?.roomName || '-' }}</div>
              </div>
              <div class="space-y-1">
                <div class="text-xs text-gray-500 uppercase tracking-wider">ประเภท</div>
                <div class="text-sm font-medium text-gray-900">{{ issueTypeTH(detail.issueType) }}</div>
              </div>
              <div class="space-y-1">
                <div class="text-xs text-gray-500 uppercase tracking-wider">ระดับความสำคัญ</div>
                <div><span :class="['px-3 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1', priorityColor(detail.priority)]">
                  <span>{{ priorityIcon(detail.priority) }}</span>
                  <span>{{ priorityText(detail.priority) }}</span>
                </span></div>
              </div>
              <div class="space-y-1">
                <div class="text-xs text-gray-500 uppercase tracking-wider">ผู้แจ้ง</div>
                <div class="text-sm font-medium text-gray-900">{{ detail.reportedBy?.fullName || '-' }}</div>
              </div>
              <div class="space-y-1">
                <div class="text-xs text-gray-500 uppercase tracking-wider">สถานะ</div>
                <div><span :class="['px-3 py-1 rounded-full text-xs font-medium inline-block', statusBadge(detail.status)]">{{ statusTH(detail.status) }}</span></div>
              </div>
            </div>

            <hr class="border-gray-200">

            <!-- Description -->
            <div class="space-y-2">
              <div class="text-sm font-semibold text-gray-900">รายละเอียด</div>
              <div class="text-sm text-gray-700 whitespace-pre-wrap">{{ detail.description || 'ไม่มีรายละเอียด' }}</div>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div class="space-y-1">
                <div class="text-xs text-gray-500">วันที่แจ้ง</div>
                <div class="text-sm text-gray-900">{{ dateTH(detail.createdAt) }}</div>
              </div>
              <div v-if="detail.resolvedAt" class="space-y-1">
                <div class="text-xs text-gray-500">วันที่แก้ไข</div>
                <div class="text-sm text-gray-900">{{ dateTH(detail.resolvedAt) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-2">
          <button class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-white transition-all" @click="closeDetail">
            ปิด
          </button>
          <button 
            v-if="detail && detail.status !== 'RESOLVED' && detail.status !== 'CLOSED'"
            class="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all"
            @click="resolve(detail); closeDetail()"
          >
            ✓ แก้ไขแล้ว
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'

const router = useRouter()
const showMobileMenu = ref(false)
const q = ref('')
const items = ref([])
const loading = ref(false)
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

const filtered = computed(() => {
  const kw = q.value.toLowerCase()
  return items.value.filter(i => 
    (i.room?.roomName || '').toLowerCase().includes(kw) || 
    (i.subject || i.title || '').toLowerCase().includes(kw) ||
    (i.description || '').toLowerCase().includes(kw)
  )
})

async function fetchMe() {
  try {
    const { data } = await api.get('/api/auth/me')
    me.value = data
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

function dateTH(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  const m = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`
}

function statusTH(s) {
  switch (s) {
    case 'PENDING': return 'รอดำเนินการ'
    case 'IN_PROGRESS': return 'กำลังดำเนินการ'
    case 'RESOLVED': return 'แก้ไขแล้ว'
    case 'CLOSED': return 'ปิดงาน'
    default: return s || '-'
  }
}

function statusBadge(s) {
  switch (s) {
    case 'PENDING': return 'bg-amber-100 text-amber-800 border border-amber-200'
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border border-blue-200'
    case 'RESOLVED': return 'bg-green-500 text-white'
    case 'CLOSED': return 'bg-gray-200 text-gray-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function priorityIcon(p) {
  switch (p) {
    case 'LOW': return '🟢'
    case 'MEDIUM': return '🟡'
    case 'HIGH': return '🔴'
    default: return '🟡'
  }
}

function priorityText(p) {
  switch (p) {
    case 'LOW': return 'ต่ำ'
    case 'MEDIUM': return 'ปานกลาง'
    case 'HIGH': return 'สูง'
    default: return 'ปานกลาง'
  }
}

function priorityBg(p) {
  switch (p) {
    case 'LOW': return 'bg-gradient-to-br from-green-500 to-green-600'
    case 'MEDIUM': return 'bg-gradient-to-br from-amber-500 to-amber-600'
    case 'HIGH': return 'bg-gradient-to-br from-red-500 to-red-600'
    default: return 'bg-gradient-to-br from-amber-500 to-amber-600'
  }
}

function priorityColor(p) {
  switch (p) {
    case 'LOW': return 'bg-green-100 text-green-800'
    case 'MEDIUM': return 'bg-amber-100 text-amber-800'
    case 'HIGH': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function issueTypeTH(type) {
  const map = {
    'BOOKING_EQUIPMENT': 'อุปกรณ์เสริม',
    'BOOKING_CONFIRMATION': 'การยืนยัน',
    'BOOKING_DOCUMENT': 'เอกสาร',
    'BOOKING_APPROVAL': 'การอนุมัติ',
    'BOOKING_SUPPORT': 'บริการสนับสนุน',
    'SYSTEM_ERROR': 'ระบบ',
    'OTHER': 'อื่นๆ'
  }
  return map[type] || type || '-'
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/api/issues', { params: { sort: '-createdAt', page: 1, pageSize: 500 } })
    items.value = Array.isArray(data?.items) ? data.items : []
  } catch (e) {
    console.error(e)
    items.value = []
  } finally {
    loading.value = false
  }
}

async function markInProgress(issue) {
  try {
    actingId.value = issue.id
    await api.patch(`/api/issues/${issue.id}/status`, { status: 'IN_PROGRESS' })
    await load()
    await Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'อัพเดทสถานะสำเร็จ',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })
  } catch (e) {
    console.error(e)
    await Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: e?.response?.data?.error || 'อัพเดทสถานะไม่สำเร็จ',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    actingId.value = null
  }
}

async function resolve(issue) {
  const result = await Swal.fire({
    title: 'ยืนยันแก้ไขปัญหา?',
    html: `<b>${issue.subject || issue.title || 'ปัญหานี้'}</b><br/>จะถูกทำเครื่องหมายว่าแก้ไขแล้ว`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#16a34a',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'แก้ไขแล้ว',
    cancelButtonText: 'ยกเลิก'
  })
  if (!result.isConfirmed) return

  try {
    actingId.value = issue.id
    await api.post(`/api/issues/${issue.id}/resolve`)
    await load()
    await Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'ทำเครื่องหมายแก้ไขแล้ว',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })
  } catch (e) {
    console.error(e)
    await Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: e?.response?.data?.error || 'ไม่สามารถทำเครื่องหมายได้',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    actingId.value = null
  }
}

async function closeIssue(issue) {
  const result = await Swal.fire({
    title: 'ปิดงานนี้?',
    html: `<b>${issue.subject || issue.title || 'ปัญหานี้'}</b><br/>จะถูกปิดงานและไม่สามารถแก้ไขได้`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ปิดงาน',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#6b7280',
    cancelButtonColor: '#6b7280'
  })
  if (!result.isConfirmed) return

  try {
    actingId.value = issue.id
    await api.patch(`/api/issues/${issue.id}/status`, { status: 'CLOSED' })
    await load()
    await Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'ปิดงานสำเร็จ',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })
  } catch (e) {
    console.error(e)
    await Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: e?.response?.data?.error || 'ไม่สามารถปิดงานได้',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    actingId.value = null
  }
}

async function view(issue) {
  showDetail.value = true
  detailLoading.value = true
  detailError.value = ''
  detail.value = null
  try {
    const { data } = await api.get(`/api/issues/${issue.id}`)
    detail.value = data?.issue || data
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
  await load()
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