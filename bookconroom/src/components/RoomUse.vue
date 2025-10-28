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
          <router-link  to="/room-info/:id" class="nav-link" :class="$route.path === '/room-info/:id' ? 'nav-active' : ''">
            <span class="text-lg">🛋️</span>
            <span class="text-sm">ข้อมูลห้องประชุม</span>
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
          <router-link to="/room-info/:id" class="mobile-nav-link" @click="showMobileMenu = false">
            <span class="text-lg">🛋️</span> <span class="text-sm">ข้อมูลห้องประชุม</span>
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
              🗂️
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 m-0">ตารางการใช้ห้องประชุม</h1>
              <p class="text-base text-gray-500 m-0 mt-1">ดูตารางการจองห้องประชุมทั้งหมด</p>
            </div>
          </div>

          <!-- Toolbar -->
          <div class="modern-card shadow-md">
            <div class="flex flex-wrap gap-4 items-center justify-between">
              <div class="flex items-center gap-2">
                <button class="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium" @click="gotoPrevMonth" type="button">
                  ← เดือนก่อน
                </button>
                <button class="px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all text-sm font-medium" @click="gotoToday" type="button">
                  วันนี้
                </button>
                <button class="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium" @click="gotoNextMonth" type="button">
                  เดือนถัดไป →
                </button>
              </div>

              <div class="text-xl font-bold text-gray-900">
                {{ monthTitleTH }}
              </div>

              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700" for="roomcal-room">ห้อง:</label>
                <select
                  id="roomcal-room"
                  v-model.number="roomId"
                  class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option :value="0">ทุกห้อง</option>
                  <option v-for="r in rooms" :key="r.id" :value="r.id">
                    {{ r.roomName }}<span v-if="r.capacity"> ({{ r.capacity }} ที่นั่ง)</span>
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Calendar -->
          <div class="modern-card shadow-md p-0 overflow-hidden">
            <!-- Week header -->
            <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
              <div class="px-3 py-3 text-center">อาทิตย์</div>
              <div class="px-3 py-3 text-center">จันทร์</div>
              <div class="px-3 py-3 text-center">อังคาร</div>
              <div class="px-3 py-3 text-center">พุธ</div>
              <div class="px-3 py-3 text-center">พฤหัสบดี</div>
              <div class="px-3 py-3 text-center">ศุกร์</div>
              <div class="px-3 py-3 text-center">เสาร์</div>
            </div>

            <!-- Cells -->
            <div class="grid grid-cols-7 gap-px bg-gray-200">
              <div
                v-for="cell in calendarCells"
                :key="cell.key"
                class="bg-white min-h-[140px] p-3 flex flex-col hover:bg-gray-50 transition-colors cursor-pointer"
                :class="{
                  'opacity-60': cell.isOtherMonth,
                  'ring-2 ring-blue-500 ring-inset': cell.isToday
                }"
                @click="openDayModal(cell)"
              >
                <!-- date -->
                <div class="flex items-center justify-between mb-2">
                  <div class="text-xs font-medium text-gray-500">{{ weekdayShort(cell.date) }}</div>
                  <div 
                    class="text-sm font-semibold"
                    :class="cell.isToday ? 'w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center' : 'text-gray-700'"
                  >
                    {{ cell.date.getDate() }}
                  </div>
                </div>

                <!-- events -->
                <div class="space-y-1 overflow-y-auto custom-scroll flex-1">
                  <template v-if="cell.events.length">
                    <div
                      v-for="ev in cell.events.slice(0, MAX_PER_CELL)"
                      :key="ev.id"
                      class="text-[11px] px-2 py-1.5 rounded-lg border shadow-sm leading-tight truncate cursor-pointer hover:shadow-md transition-all"
                      :class="badgeClass(ev.status)"
                      :title="eventTitle(ev)"
                    >
                      <div class="font-semibold">{{ timeRange(ev.startTime, ev.endTime) }}</div>
                      <div v-if="!roomId" class="text-[10px] opacity-80 mt-0.5">{{ ev.room?.roomName }}</div>
                    </div>

                    <!-- + more -->
                    <button
                      v-if="cell.events.length > MAX_PER_CELL"
                      class="text-[11px] px-2 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all font-medium w-full"
                      type="button"
                    >
                      +{{ cell.events.length - MAX_PER_CELL }} เพิ่มเติม
                    </button>
                  </template>

                  <div v-else class="text-[11px] text-gray-400 text-center py-2">ไม่มีรายการ</div>
                </div>
              </div>
            </div>

            <!-- Legend -->
            <div class="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3 text-xs">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded bg-amber-100 border border-amber-200"></span>
                <span class="text-gray-600">รอผู้เข้าร่วมยืนยัน</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded bg-blue-100 border border-blue-200"></span>
                <span class="text-gray-600">รอผู้ดูแลอนุมัติ</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded bg-green-100 border border-green-200"></span>
                <span class="text-gray-600">อนุมัติแล้ว</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded bg-gray-100 border border-gray-200"></span>
                <span class="text-gray-600">ยกเลิกแล้ว</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Day Modal -->
    <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="closeModal"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-gray-900">
                รายการวันที่ {{ formatDateTH(modal.date) }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">{{ modal.events.length }} รายการ</p>
            </div>
            <button class="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors" @click="closeModal" type="button">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="modal.events.length" class="space-y-3">
            <div
              v-for="ev in modal.events"
              :key="ev.id"
              class="flex items-start gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-md"
              :class="badgeClass(ev.status)"
            >
              <div class="flex-shrink-0">
                <div class="w-16 h-16 rounded-xl bg-blue-500 text-white flex flex-col items-center justify-center">
                  <div class="text-xs font-medium">{{ weekdayShort(new Date(ev.startTime)) }}</div>
                  <div class="text-2xl font-bold">{{ new Date(ev.startTime).getDate() }}</div>
                </div>
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h4 class="font-bold text-gray-900 text-base">
                    {{ ev.room?.roomName || '—' }}
                  </h4>
                  <span class="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap" :class="statusBadgeClass(ev.status)">
                    {{ statusTH(ev.status) }}
                  </span>
                </div>
                
                <div class="space-y-1 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ timeRange(ev.startTime, ev.endTime) }}
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    {{ ev.bookedBy?.fullName || '—' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <p class="text-gray-500 font-medium">ไม่มีรายการจองในวันนี้</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'

const router = useRouter()
const showMobileMenu = ref(false)
const me = ref(null)

/* ===== constants ===== */
const MAX_PER_CELL = 3

/* ===== state ===== */
const viewDate = ref(new Date())
const rooms = ref([])
const roomId = ref(0)
const bookings = ref([])

/* ===== modal state ===== */
const modal = ref({
  open: false,
  date: null,
  events: []
})

/* ===== Notifications ===== */
const showNotif = ref(false)
const notifs = ref([])
const unreadCount = ref(0)
const loadingNoti = ref(false)

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
    case 'BOOKING': return refId ? { path: `/booking/${refId}` } : { path: '/booking-list' }
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

/* ===== helpers: วัน/เดือน ===== */
const TH_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const TH_WEEKDAY_SHORT = ['อา','จ','อ','พ','พฤ','ศ','ส']

const monthTitleTH = computed(() => {
  const d = viewDate.value
  return `${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
})
function weekdayShort(d){ return TH_WEEKDAY_SHORT[d.getDay()] }
function formatDateTH(d){
  const dd = d.getDate()
  const mm = TH_MONTHS[d.getMonth()]
  const yy = d.getFullYear() + 543
  return `${dd} ${mm} ${yy}`
}

function startOfMonth(d){ const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x }
function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0, 23,59,59,999) }
function startOfCalendarGrid(d){
  const first = startOfMonth(d)
  const offset = first.getDay()
  const x = new Date(first)
  x.setDate(first.getDate() - offset)
  return x
}

/* ===== fetch ===== */
async function fetchRooms(){
  const { data } = await api.get('/api/rooms')
  rooms.value = Array.isArray(data) ? data : []
}
async function fetchMonth(){
  const start = startOfMonth(viewDate.value).toISOString()
  const end = endOfMonth(viewDate.value).toISOString()
  const params = { start, end, page: 1, pageSize: 1000 }
  if (roomId.value) params.roomId = roomId.value
  const { data } = await api.get('/api/bookings', { params })
  bookings.value = Array.isArray(data?.items) ? data.items : []
}

/* ===== calendar cells with events ===== */
const calendarCells = computed(() => {
  const start = startOfCalendarGrid(viewDate.value)
  const cells = []
  for (let i = 0; i < 42; i++){
    const d = new Date(start); d.setDate(start.getDate() + i)
    const sameMonth = d.getMonth() === viewDate.value.getMonth()
    const today = isSameDate(d, new Date())

    const dayStart = new Date(d); dayStart.setHours(0,0,0,0)
    const dayEnd = new Date(d); dayEnd.setHours(23,59,59,999)

    const events = bookings.value
      .filter(b => new Date(b.startTime).getTime() < dayEnd.getTime() &&
                   new Date(b.endTime).getTime() > dayStart.getTime())
      .sort((a,b)=> new Date(a.startTime) - new Date(b.startTime))

    cells.push({ key: i, date: d, isOtherMonth: !sameMonth, isToday: today, events })
  }
  return cells
})

function isSameDate(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate() }

/* ===== formatters ===== */
function timeRange(s,e){
  const opt = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(s).toLocaleTimeString([],opt)} - ${new Date(e).toLocaleTimeString([],opt)}`
}
function eventTitle(ev){
  const room = ev.room?.roomName ? ` · ${ev.room.roomName}` : ''
  const by = ev.bookedBy?.fullName ? ` · โดย ${ev.bookedBy.fullName}` : ''
  return `${timeRange(ev.startTime, ev.endTime)}${room}${by}`
}

function badgeClass(status){
  switch(status){
    case 'AWAITING_ATTENDEE_CONFIRM': return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'AWAITING_ADMIN_APPROVAL':   return 'bg-blue-50 text-blue-800 border-blue-200'
    case 'APPROVED':                  return 'bg-green-50 text-green-800 border-green-200'
    case 'CANCELLED':                 return 'bg-gray-50 text-gray-700 border-gray-200'
    default:                          return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

function statusBadgeClass(status){
  switch(status){
    case 'AWAITING_ATTENDEE_CONFIRM': return 'bg-amber-100 text-amber-800'
    case 'AWAITING_ADMIN_APPROVAL':   return 'bg-blue-100 text-blue-800'
    case 'APPROVED':                  return 'bg-green-500 text-white'
    case 'CANCELLED':                 return 'bg-gray-200 text-gray-700'
    default:                          return 'bg-gray-200 text-gray-700'
  }
}

function statusTH(s){
  switch (s) {
    case 'AWAITING_ATTENDEE_CONFIRM': return 'รอผู้เข้าร่วม'
    case 'AWAITING_ADMIN_APPROVAL':   return 'รอผู้ดูแล'
    case 'APPROVED':                  return 'อนุมัติแล้ว'
    case 'CANCELLED':                 return 'ยกเลิกแล้ว'
    default: return s
  }
}

/* ===== navigation ===== */
function gotoToday(){ viewDate.value = new Date() }
function gotoPrevMonth(){ const d=new Date(viewDate.value); d.setMonth(d.getMonth()-1); viewDate.value=d }
function gotoNextMonth(){ const d=new Date(viewDate.value); d.setMonth(d.getMonth()+1); viewDate.value=d }

/* ===== modal helpers ===== */
function openDayModal(cell){
  modal.value.open = true
  modal.value.date = cell.date
  modal.value.events = cell.events.slice()
}
function closeModal(){
  modal.value.open = false
  modal.value.date = null
  modal.value.events = []
}

let notiTimer = null

/* ===== lifecycle ===== */
watch([viewDate, roomId], fetchMonth)

onMounted(async () => {
  await fetchMe()
  await fetchRooms()
  await fetchMonth()
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

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 transparent;
}
.custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 9999px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
</style>
