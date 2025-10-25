<template>
  <button
    class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm"
    :disabled="downloading"
    @click="downloadPdf"
  >
    {{ downloading ? 'กำลังสร้าง PDF...' : (label || 'ดาวน์โหลด PDF') }}
  </button>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  bookingId: { type: [Number, String], required: true },
  label: { type: String, default: '' }
})

const downloading = ref(false)

async function downloadPdf() {
  try {
    downloading.value = true
    const token = localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const base = import.meta.env.VITE_API_BASE || ''
    const url = `${base}/api/bookings/${props.bookingId}/pdf`
    const resp = await fetch(url, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!resp.ok) {
      let msg = resp.statusText
      try { const j = await resp.json(); msg = j?.error || j?.message || msg } catch {}
      throw new Error(`Download failed: ${resp.status} ${msg}`)
    }
    const blob = await resp.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = `booking-${props.bookingId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
  } catch (e) {
    console.error(e)
    alert('ดาวน์โหลด PDF ไม่สำเร็จ')
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
</style>