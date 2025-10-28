<template>
  <button
    @click="downloadPdf"
    :disabled="busy"
    class="px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium bg-white flex items-center gap-2"
  >
    <svg v-if="!busy" class="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 11l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <svg v-else class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/>
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    </svg>

    <span>{{ busy ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด PDF' }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/lib/api.js'

const props = defineProps({
  bookingId: { type: [Number, String], required: true }
})
const emit = defineEmits(['success', 'error'])

const busy = ref(false)

async function downloadPdf() {
  if (!props.bookingId) {
    emit('error', new Error('Missing booking id'))
    return
  }
  busy.value = true
  try {
    const res = await api.get(`/api/bookings/${props.bookingId}/pdf`, {
      responseType: 'blob'
    })

    // attempt to get filename from header
    const disposition = (res.headers && (res.headers['content-disposition'] || res.headers['Content-Disposition'])) || ''
    let filename = 'booking.pdf'
    const m = /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/.exec(disposition)
    if (m && m[1]) filename = decodeURIComponent(m[1])

    const blob = new Blob([res.data], { type: res.data.type || 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    emit('success', filename)
  } catch (e) {
    emit('error', e)
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
button[disabled] { opacity: 0.8; cursor: progress; }
</style>