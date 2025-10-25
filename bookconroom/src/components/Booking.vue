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
          <router-link to="/booking" class="nav-link nav-active">
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
          <!-- Page Header -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg">
              📅
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 m-0">จองห้องประชุม</h1>
              <p class="text-base text-gray-500 m-0 mt-1">กรอกข้อมูลให้ครบถ้วน แล้วกดยืนยันการจอง</p>
            </div>
          </div>

          <!-- Main Grid -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <!-- LEFT: FORM (2 columns) -->
            <div class="xl:col-span-2 space-y-6">
              <div class="modern-card shadow-md">
                <h2 class="text-xl font-semibold text-gray-900 mb-6">รายละเอียดการจอง</h2>

                <form @submit.prevent="submitBooking" class="space-y-5" novalidate>
                  <!-- Room -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      ห้องประชุม <span class="text-red-500">*</span>
                    </label>
                    <select v-model.number="form.roomId" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white">
                      <option :value="null" disabled>-- เลือกห้องประชุม --</option>
                      <option v-for="r in rooms" :key="r.id" :value="r.id" :disabled="(r.status || '').toUpperCase() !== 'AVAILABLE'">
                        {{ r.roomName }}<span v-if="r.capacity"> ({{ r.capacity }} ที่นั่ง)</span> - {{ r.statusLabel || r.status || 'UNKNOWN' }} 
                      </option>
                    </select>
                    <p v-if="selectedRoom && (selectedRoom.status || '').toUpperCase() !== 'AVAILABLE'" class="text-xs text-red-600 mt-2">
                      ห้องนี้ไม่สามารถจองได้ (สถานะ: {{ selectedRoom.statusLabel || selectedRoom.status }})
                    </p>
                  </div>

                  <!-- Date & Time -->
                  <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <!-- Date -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          วันที่ <span class="text-red-500">*</span>
                        </label>
                        <input 
                          type="date" 
                          v-model="dateOnly" 
                          :min="minDate"
                          class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                        />
                        <p class="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0114 0z"/>
                          </svg>
                          ไม่สามารถเลือกวันที่ย้อนหลังได้
                        </p>
                      </div>

                      <!-- Whole day checkbox -->
                      <div class="flex items-end">
                        <label class="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl cursor-pointer hover:bg-blue-100 transition-all">
                          <input type="checkbox" v-model="wholeDay" :disabled="!dateOnly" class="rounded" />
                          <span class="text-sm font-medium">ใช้ทั้งวัน (09:00-18:00)</span>
                        </label>
                      </div>
                    </div>

                    <!-- Time from / to -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          เวลาเริ่มต้น
                          <span v-if="minTime" class="text-xs text-orange-600 ml-1">(ขั้นต่ำ {{ minTime }})</span>
                        </label>
                        <input
                          type="time"
                          v-model="startTimeOnly"
                          :min="minTime"
                          :disabled="!dateOnly || wholeDay"
                          step="60"
                          class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">เวลาสิ้นสุด</label>
                        <input
                          type="time"
                          v-model="endTimeOnly"
                          :min="startTimeOnly || minTime"
                          :disabled="!dateOnly || wholeDay"
                          step="60"
                          class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <!-- Error Messages -->
                    <div class="space-y-2">
                      <p v-if="isPastTimeToday()" class="text-xs text-red-600 flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        ไม่สามารถเลือกเวลาที่ผ่านไปแล้ว (เวลาปัจจุบัน: {{ getCurrentTime() }})
                      </p>
                      
                      <p v-if="form.startLocal && form.endLocal && !durationOk" class="text-xs text-red-600 flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        เวลาสิ้นสุดต้องช้ากว่าเวลาเริ่มต้น
                      </p>
                    </div>
                  </div>

                  <!-- Positions -->
                  <div>
                    <div class="flex items-center justify-between mb-4">
                      <div>
                        <label class="block text-sm font-semibold text-gray-900 mb-1">ตำแหน่งที่ต้องเข้าประชุม</label>
                        <p class="text-xs text-gray-500">เลือกตำแหน่งที่จำเป็นต้องเข้าร่วมประชุม</p>
                      </div>
                      <div class="flex gap-2">
                        <button type="button" class="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all" @click="selectAllPositions">
                          ✓ เลือกทั้งหมด
                        </button>
                        <button type="button" class="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all" @click="clearPositions">
                          ✕ ล้างทั้งหมด
                        </button>
                      </div>
                    </div>
                    
                    <div v-if="positions.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <label 
                        v-for="p in positions" 
                        :key="p.id" 
                        class="group relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                        :class="form.requiredPositionIds.includes(p.id) 
                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'"
                      >
                        <input 
                          type="checkbox" 
                          :value="p.id" 
                          v-model="form.requiredPositionIds" 
                          class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all" 
                        />
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="font-semibold text-sm text-gray-900 truncate">{{ p.name }}</span>
                            <span v-if="p.isNoteTaker" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 shrink-0">
                              📝 Note
                            </span>
                          </div>
                          <div v-if="p.department" class="flex items-center gap-1.5 text-xs text-gray-500">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            <span class="truncate">{{ p.department.name }}</span>
                          </div>
                        </div>
                        <div 
                          v-if="form.requiredPositionIds.includes(p.id)"
                          class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-md"
                        >
                          <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      </label>
                    </div>
                    <div v-else class="text-center py-8 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                      </div>
                      <p class="text-sm font-medium text-gray-500">ไม่มีข้อมูลตำแหน่ง</p>
                    </div>
                    
                    <!-- Selected Count Badge -->
                    <div v-if="form.requiredPositionIds.length > 0" class="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span class="text-sm font-medium">เลือกแล้ว {{ form.requiredPositionIds.length }} ตำแหน่ง</span>
                    </div>
                  </div>

                  <!-- Services -->
                  <div>
                    <div class="flex items-center justify-between mb-4">
                      <div>
                        <label class="block text-sm font-semibold text-gray-900 mb-1">อุปกรณ์/บริการที่ต้องการ</label>
                        <p class="text-xs text-gray-500">เลือกอุปกรณ์และบริการเสริมสำหรับการประชุม</p>
                      </div>
                      <div class="flex gap-2">
                        <button type="button" class="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-all" @click="selectAllServices">
                          ✓ เลือกทั้งหมด
                        </button>
                        <button type="button" class="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all" @click="clearServices">
                          ✕ ล้างทั้งหมด
                        </button>
                      </div>
                    </div>
                    
                    <div v-if="services.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <label 
                        v-for="s in services"
                        :key="s.id" 
                        class="group relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                        :class="form.serviceIds.includes(s.id) 
                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'"
                      >
                        <input 
                          type="checkbox" 
                          :value="s.id" 
                          v-model="form.serviceIds" 
                          class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all" 
                        />
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="font-semibold text-sm text-gray-900 truncate">{{ s.name }}</span>
                            <span v-if="s.isFree" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 shrink-0">
                              🎁 Free
                            </span>
                          </div>
                          <div v-if="s.description" class="text-xs text-gray-500">
                            {{ s.description }}
                          </div>
                        </div>
                        <div 
                          v-if="form.serviceIds.includes(s.id)"
                          class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-md"
                        >
                          <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      </label>
                    </div>
                    <div v-else class="text-center py-8 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                      </div>
                      <p class="text-sm font-medium text-gray-500">ไม่มีข้อมูลอุปกรณ์/บริการ</p>
                    </div>
                    
                    <!-- Selected Count Badge -->
                    <div v-if="form.serviceIds.length > 0" class="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-200">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span class="text-sm font-medium">เลือกแล้ว {{ form.serviceIds.length }} รายการ</span>
                    </div>
                  </div>

                  <!-- Agenda URL -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      ลิงก์เอกสารประชุม (ถ้ามี)
                    </label>
                    <input
                      type="url"
                      v-model="form.agendaUrl"
                      placeholder="https://example.com/document"
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <p class="text-xs text-gray-500 mt-1.5">
                      แชร์เอกสารประชุมผ่านลิงก์นี้ (Google Drive, Dropbox, ฯลฯ)
                    </p>
                  </div>

                  <!-- Submit Button -->
                  <div class="pt-4">
                    <button 
                      type="submit" 
                      class="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      :disabled="submitting.value"
                    >
                      <span v-if="submitting.value">⏳</span>
                      ✓ ยืนยันการจอง
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- RIGHT: SUMMARY & CALENDAR -->
            <div class="hidden xl:block xl:col-span-1 space-y-6">
              <!-- Room Summary -->
              <div class="bg-white p-4 rounded-xl shadow-md border border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">สรุปการจองห้อง</h2>
                <div class="flex flex-col gap-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">ห้องประชุม:</span>
                    <span class="font-semibold text-gray-900">{{ currentRoomName }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">วันที่:</span>
                    <span class="font-semibold text-gray-900">{{ selectedDayLabel }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">เวลา:</span>
                    <span class="font-semibold text-gray-900">{{ fmtTime(startISO.value) }} - {{ fmtTime(endISO.value) }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">ตำแหน่งที่เข้าประชุม:</span>
                    <div class="flex-1 min-w-0">
                      <span v-if="form.requiredPositionIds.length === 0" class="text-gray-400 text-sm">ไม่มีข้อมูล</span>
                      <div v-else class="flex flex-wrap gap-2">
                        <span v-for="posId in form.requiredPositionIds" :key="posId" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          {{ getPositionName(posId) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">อุปกรณ์/บริการ:</span>
                    <div class="flex-1 min-w-0">
                      <span v-if="form.serviceIds.length === 0" class="text-gray-400 text-sm">ไม่มีข้อมูล</span>
                      <div v-else class="flex flex-wrap gap-2">
                        <span v-for="serviceId in form.serviceIds" :key="serviceId" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          {{ getServiceName(serviceId) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Calendar -->
              <div class="bg-white p-4 rounded-xl shadow-md border border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">ปฏิทินการจอง</h2>
                <div class="flex flex-col gap-4">
                  <div class="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-500">
                    <div>อา.</div>
                    <div>จ.</div>
                    <div>อ.</div>
                    <div>พ.</div>
                    <div>พฤ.</div>
                    <div>ศ.</div>
                    <div>ส.</div>
                  </div>
                  <div class="grid grid-cols-7 gap-2">
                    <div v-for="(day, index) in calendarDays" :key="index" class="relative">
                      <div class="p-2 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-all" @click="selectDate(day)">
                        <div class="text-gray-900 font-semibold">{{ new Date(day).getDate() }}</div>
                        <div v-if="isToday(day)" class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500"></div>
                      </div>
                      <div v-if="isDateBooked(day)" class="absolute inset-0 rounded-lg bg-red-100 pointer-events-none">
                        <div class="w-full h-full flex items-center justify-center">
                          <span class="text-red-500 text-xs font-semibold">จองแล้ว</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api.js'
import Swal from 'sweetalert2'

const router = useRouter()
const showMobileMenu = ref(false)

/* ---------- state ---------- */
const me        = ref(null)
const rooms     = ref([])
const positions = ref([])
const services  = ref([])

const submitting = ref(false)

const form = ref({
  roomId: null,
  startLocal: '',
  endLocal: '',
  requiredPositionIds: [],
  serviceIds: [],
  agendaUrl: ''
})

/* ---------- notifications ---------- */
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

/* ---------- Min date for date picker ---------- */
const minDate = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

/* ---------- helpers: datetime ---------- */
function toISOFromLocal (dtLocal) {
  if (!dtLocal || typeof dtLocal !== 'string' || !dtLocal.includes('T')) return ''
  const [datePart, timePart] = dtLocal.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm]  = timePart.split(':').map(Number)
  const local = new Date(y, (m||1)-1, d||1, hh||0, mm||0, 0, 0)
  if (isNaN(local.getTime())) return ''
  return local.toISOString()
}

const startISO = computed(() => toISOFromLocal(form.value.startLocal))
const endISO   = computed(() => toISOFromLocal(form.value.endLocal))
const startTs  = computed(() => Date.parse(startISO.value || ''))
const endTs    = computed(() => Date.parse(endISO.value || ''))

const durationOk = computed(() => !!form.value.startLocal && !!form.value.endLocal && endTs.value > startTs.value)
const canSubmit  = computed(() => {
  const base = !!form.value.roomId && durationOk.value
  const roomOk = selectedRoom.value ? ((selectedRoom.value.status || '').toUpperCase() === 'AVAILABLE') : false
  return base && roomOk
})

/* ---------- Date/Time split models ---------- */
const wholeDay = ref(false)

const dateOnly = computed({
  get() { return (form.value.startLocal && form.value.startLocal.split('T')[0]) || '' },
  set(v) {
    if (!v) { form.value.startLocal = ''; form.value.endLocal = ''; return }
    const st = startTimeOnly.value || '09:00'
    const et = endTimeOnly.value   || '18:00'
    form.value.startLocal = `${v}T${st}`
    form.value.endLocal   = `${v}T${et}`
  }
})

const startTimeOnly = computed({
  get() { return (form.value.startLocal && form.value.startLocal.split('T')[1]?.slice(0,5)) || '' },
  set(v) { if (!dateOnly.value || !v) return; form.value.startLocal = `${dateOnly.value}T${v}` }
})

const endTimeOnly = computed({
  get() { return (form.value.endLocal && form.value.endLocal.split('T')[1]?.slice(0,5)) || '' },
  set(v) { if (!dateOnly.value || !v) return; form.value.endLocal = `${dateOnly.value}T${v}` }
})

watch(wholeDay, (on) => {
  if (on && dateOnly.value) { 
    startTimeOnly.value = '09:00'
    endTimeOnly.value = '18:00'
  }
})

/* ---------- schedule ---------- */
const roomSchedule = ref([])

function fmtTime (iso) {
  try { 
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch { 
    return '-' 
  }
}

const currentRoomName = computed(() => rooms.value.find(r => r.id === form.value.roomId)?.roomName || 'ยังไม่ได้เลือก')

const selectedDayLabel = computed(() => {
  if (!form.value.startLocal) return ''
  const d = new Date(form.value.startLocal)
  if (isNaN(d.getTime())) return ''
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()+543}`
})

function dayStartISO (localStr) { 
  const d = new Date(localStr)
  if (isNaN(d.getTime())) return ''
  d.setHours(0,0,0,0)
  return d.toISOString()
}

function dayEndISO (localStr) { 
  const d = new Date(localStr)
  if (isNaN(d.getTime())) return ''
  d.setHours(23,59,59,999)
  return d.toISOString()
}

async function fetchRoomSchedule () {
  roomSchedule.value = []
  if (!form.value.roomId || !form.value.startLocal) return
  try {
    const params = { 
      roomId: form.value.roomId, 
      start: dayStartISO(form.value.startLocal), 
      end: dayEndISO(form.value.startLocal), 
      page: 1, 
      pageSize: 200 
    }
    const { data } = await api.get('/api/bookings', { params })
    roomSchedule.value = Array.isArray(data?.items) ? data.items : []
  } catch { 
    roomSchedule.value = [] 
  }
}

function overlaps (aStart, aEnd, bStart, bEnd) { 
  return aStart < bEnd && bStart < aEnd 
}

/* ---------- API ---------- */
async function fetchRooms () { 
  try {
    // ขอ "ทุกห้อง" จาก backend (all=1) และรองรับทั้งรูปแบบ { items: [...] } หรือ [...] 
    const res = await api.get('/api/rooms', { params: { all: 1 } })
    const data = res?.data ?? []
    const items = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : [])
    // normalize fields used by template
    rooms.value = items.map(r => ({
      id: r.id,
      roomName: r.roomName || r.name || r.room_name || `ห้อง ${r.id}`,
      capacity: r.capacity ?? r.seats ?? null,
      status: (r.status || '').toUpperCase(),
      // keep raw object for other use
      raw: r
    }))
  } catch (err) {
    console.error('fetchRooms', err)
    rooms.value = []
  }
}

async function fetchPositions () { 
  try { 
    const { data } = await api.get('/api/positions', { params: { excludeAdmin: 1, sort: 'asc' } })
    positions.value = Array.isArray(data) ? data : []
  } catch { 
    positions.value = [] 
  }
}

async function fetchServices () { 
  try { 
    const { data } = await api.get('/api/services')
    services.value = Array.isArray(data) ? data : []
  } catch { 
    services.value = [] 
  }
}

/* ---------- selections ---------- */
function selectAllPositions() { 
  form.value.requiredPositionIds = positions.value.map(p => p.id) 
}

function clearPositions() { 
  form.value.requiredPositionIds = [] 
}

function selectAllServices() { 
  form.value.serviceIds = services.value.map(s => s.id) 
}

function clearServices() { 
  form.value.serviceIds = [] 
}

/* ---------- Check if booking date/time is in the past ---------- */
function isBookingInPast() {
  if (!form.value.startLocal) return false
  
  const selectedDateTime = new Date(form.value.startLocal)
  const now = new Date()
  
  // ตรวจสอบว่าเวลาที่เลือกผ่านไปแล้วหรือไม่
  return selectedDateTime < now
}

/* ---------- Check if selected time is in the past for today ---------- */
function isPastTimeToday() {
  if (!form.value.startLocal) return false
  
  const selectedDate = new Date(form.value.startLocal)
  const today = new Date()
  
  // เช็คว่าเป็นวันเดียวกันหรือไม่
  const isSameDay = 
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getDate() === today.getDate()
  
  if (!isSameDay) return false
  
  // ถ้าเป็นวันเดียวกัน เช็คเวลา
  return selectedDate < today
}

/* ---------- Get minimum time for today ---------- */
const minTime = computed(() => {
  if (!dateOnly.value) return undefined
  
  const selectedDate = new Date(dateOnly.value)
  const today = new Date()
  
  // เช็คว่าเป็นวันเดียวกันหรือไม่
  const isSameDay = 
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getDate() === today.getDate()
  
  if (!isSameDay) return undefined
  
  // ถ้าเป็นวันนี้ ให้ใช้เวลาปัจจุบัน + 1 ชั่วโมง เป็นเวลาขั้นต่ำ
  const minDateTime = new Date(today.getTime() + 60 * 60 * 1000) // +1 hour
  const hours = String(minDateTime.getHours()).padStart(2, '0')
  const minutes = String(minDateTime.getMinutes()).padStart(2, '0')
  
  return `${hours}:${minutes}`
})

/* ---------- submit ---------- */
async function submitBooking () {
  if (!canSubmit.value) {
    // provide clearer message when room not bookable
    if (selectedRoom.value && (selectedRoom.value.status || '').toUpperCase() !== 'AVAILABLE') {
      await Swal.fire({
        icon: 'warning',
        title: 'ไม่สามารถจองได้',
        text: `ห้อง "${selectedRoom.value.roomName}" ไม่สามารถจองได้ในขณะนี้ (สถานะ: ${selectedRoom.value.statusLabel || selectedRoom.value.status}). โปรดเลือกห้องอื่นหรือรอให้สถานะกลับมาเป็น AVAILABLE.`,
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3b82f6',
      })
      return
    }

    await Swal.fire({
      icon: 'warning',
      title: 'ข้อมูลไม่ครบถ้วน',
      text: 'กรุณาเลือกห้องและเวลาให้ถูกต้อง',
      confirmButtonText: 'ตรวจสอบอีกครั้ง',
      confirmButtonColor: '#3b82f6',
    })
    return
  }

  // เช็คว่าจองย้อนหลังหรือไม่
  if (isBookingInPast()) {
    const selectedDateTime = new Date(form.value.startLocal)
    const now = new Date()
    
    // เช็คว่าเป็นวันเดียวกันหรือไม่
    const isSameDay = 
      selectedDateTime.getFullYear() === now.getFullYear() &&
      selectedDateTime.getMonth() === now.getMonth() &&
      selectedDateTime.getDate() === now.getDate()
    
    if (isSameDay) {
      // ถ้าเป็นวันเดียวกัน แสดงข้อความเรื่องเวลา
      await Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถจองเวลาที่ผ่านไปแล้ว',
        html: `
          <div class="text-left space-y-3">
            <p class="text-gray-600">ระบบไม่อนุญาตให้จองห้องประชุมในเวลาที่ผ่านไปแล้ว</p>
            <div class="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 space-y-2">
              <p class="text-sm text-red-700">
                <strong>เวลาที่เลือก:</strong> ${selectedDayLabel.value} 
                ${fmtTime(startISO.value)} - ${fmtTime(endISO.value)}
              </p>
              <p class="text-sm text-red-700">
                <strong>เวลาปัจจุบัน:</strong> ${formatCurrentDateTime()}
              </p>
            </div>
            <div class="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p class="text-sm text-blue-700">
                💡 <strong>คำแนะนำ:</strong> กรุณาเลือกเวลาที่อยู่ในอนาคตอย่างน้อย 1 ชั่วโมงจากเวลาปัจจุบัน
              </p>
            </div>
          </div>
        `,
        confirmButtonText: 'เลือกเวลาใหม่',
        confirmButtonColor: '#ef4444',
        width: '550px',
      })
    } else {
      // ถ้าเป็นวันที่ย้อนหลัง
      await Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถจองย้อนหลังได้',
        html: `
          <div class="text-left space-y-2">
            <p class="text-gray-600">ระบบไม่อนุญาตให้จองห้องประชุมย้อนหลังจากวันที่ปัจจุบัน</p>
            <div class="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p class="text-sm text-red-700"><strong>วันที่เลือก:</strong> ${selectedDayLabel.value}</p>
              <p class="text-sm text-red-700"><strong>วันที่ปัจจุบัน:</strong> ${formatCurrentDate()}</p>
            </div>
            <p class="text-sm text-gray-500 mt-3">กรุณาเลือกวันที่ตั้งแต่วันนี้เป็นต้นไป</p>
          </div>
        `,
        confirmButtonText: 'เลือกวันที่ใหม่',
        confirmButtonColor: '#ef4444',
        width: '500px',
      })
    }
    return
  }

  const s = new Date(startISO.value), e = new Date(endISO.value)
  const hasConflict = roomSchedule.value.some(b => overlaps(s, e, new Date(b.startTime), new Date(b.endTime)))
  
  if (hasConflict) {
    await Swal.fire({
      icon: 'error',
      title: 'เวลาซ้ำซ้อน',
      text: 'ช่วงเวลาที่เลือกชนกับการจองอื่นในห้องนี้',
      confirmButtonText: 'เลือกเวลาใหม่',
      confirmButtonColor: '#3b82f6',
    })
    return
  }

  const payload = {
    roomId: Number(form.value.roomId),
    startTime: startISO.value,
    endTime: endISO.value,
    requiredPositionIds: form.value.requiredPositionIds,
    serviceIds: form.value.serviceIds,
    agendaUrl: form.value.agendaUrl || undefined
  }

  try {
    submitting.value = true
    await api.post('/api/bookings', payload)
    
    await Swal.fire({
      icon: 'success',
      title: 'จองห้องสำเร็จ!',
      html: `
        <div class="text-left space-y-2">
          <p><strong>ห้อง:</strong> ${currentRoomName.value}</p>
          <p><strong>วันที่:</strong> ${selectedDayLabel.value}</p>
          <p><strong>เวลา:</strong> ${fmtTime(startISO.value)} - ${fmtTime(endISO.value)}</p>
        </div>
      `,
      confirmButtonText: 'ดูรายการจอง',
      showCancelButton: true,
      cancelButtonText: 'ปิด',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/booking-list')
      }
    })
    
    form.value = {
      roomId: null,
      startLocal: '',
      endLocal: '',
      requiredPositionIds: [],
      serviceIds: [],
      agendaUrl: ''
    }
    
    await fetchRoomSchedule()
  } catch (e) {
    console.error(e)
    const errorMessage = e?.response?.data?.error || 'เกิดข้อผิดพลาดในการจองห้อง กรุณาลองใหม่อีกครั้ง'
    
    await Swal.fire({
      icon: 'error',
      title: 'จองห้องไม่สำเร็จ',
      text: errorMessage,
      confirmButtonText: 'ลองอีกครั้ง',
      confirmButtonColor: '#ef4444',
    })
  } finally {
    submitting.value = false
  }
}

/* ---------- Helper: Get current time ---------- */
function getCurrentTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes} น.`
}

/* ---------- Helper: Format current date ---------- */
function formatCurrentDate() {
  const today = new Date()
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()+543}`
}

/* ---------- Helper: Format current date and time ---------- */
function formatCurrentDateTime() {
  const now = new Date()
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  const date = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()+543}`
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return `${date} เวลา ${time} น.`
}

/* ---------- Get names ---------- */
function getPositionName(id) {
  const position = positions.value.find(p => p.id === id)
  return position ? position.name : 'ไม่ระบุ'
}

function getServiceName(id) {
  const service = services.value.find(s => s.id === id)
  return service ? service.name : 'ไม่ระบุ'
}

/* ---------- Calendar Functions ---------- */
const calendarDays = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  
  // Get first day of month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // Get days
  const days = []
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }
  
  return days
})

function isToday(date) {
  const today = new Date()
  const d = new Date(date)
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
}

function isDateBooked(date) {
  // Check if date has any bookings
  const d = new Date(date)
  const dateStr = d.toISOString().split('T')[0]
  
  return roomSchedule.value.some(booking => {
    const bookingDate = new Date(booking.startTime).toISOString().split('T')[0]
    return bookingDate === dateStr
  })
}

function selectDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  dateOnly.value = `${year}-${month}-${day}`
}

let notiTimer = null

/* ---------- lifecycle ---------- */
onMounted(async () => {
  await Promise.all([fetchMe(), fetchRooms(), fetchPositions(), fetchServices()])
  await fetchNotifications()
  notiTimer = setInterval(() => fetchNotifications(), 30000)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (notiTimer) clearInterval(notiTimer)
  document.removeEventListener('click', handleClickOutside)
})

watch(() => [form.value.roomId, form.value.startLocal], () => { 
  fetchRoomSchedule() 
})

/* ---------- เพิ่ม: selectedRoom (ใช้ id จาก form.roomId เพื่อหา object ห้องจาก rooms) ---------- */
const selectedRoom = computed(() => {
  // รองรับรูปแบบ form เป็น ref หรือ plain object
  const roomId = (form && form.value ? form.value.roomId : form.roomId) ?? null
  if (roomId === null || typeof roomId === 'undefined') return null
  return rooms.value.find(r => String(r.id) === String(roomId)) || null
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
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:bg-gray-900;
}

.modern-card {
  @apply bg-white rounded-2xl border border-gray-200 p-6;
}
</style>
