<template>
  <div class="flex items-center gap-3">
    <!-- กระดิ่ง (ไอคอนรูปภาพ) -->
    <button class="w-10 h-10 rounded-full border flex items-center justify-center relative hover:bg-gray-50">
      <img
        src="https://cdn-icons-png.flaticon.com/128/1827/1827370.png"
        alt="แจ้งเตือน"
        class="w-5 h-5"
      />
      <span v-if="unread>0"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[11px] rounded-full bg-red-600 text-white text-center leading-[18px]">
        {{ unread>9 ? '9+' : unread }}
      </span>
    </button>

    <!-- Avatar -> กดไปหน้าข้อมูลผู้ใช้ -->
    <RouterLink to="/profile" class="shrink-0" title="โปรไฟล์">
      <img
        :src="avatar"
        class="w-10 h-10 rounded-full border"
        alt="avatar"
      />
    </RouterLink>

    <button
      class="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
      @click="logout"
    >
      ออกจากระบบ
    </button>
  </div>
</template>

<script setup>
const avatar = 'https://cdn-icons-png.flaticon.com/128/456/456283.png'
const unread = 3 // ตัวอย่าง

function logout () {
  localStorage.removeItem('access_token')
  localStorage.removeItem('me_cache')
  window.location.href = '/login'
}
</script>
