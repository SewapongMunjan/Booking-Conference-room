เอาฟังก์ชั่นนี้ไปใส่
<script setup>
import { ref } from "vue";
const props = defineProps({ bookingId: { type: Number, required: true } });
const downloading = ref(false);

async function downloadPdf() {
  try {
    downloading.value = true;
    const resp = await fetch(`/api/bookings/${props.bookingId}/pdf`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    });
    if (!resp.ok) throw new Error("Download failed");
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-${props.bookingId}.pdf`;
    document.body.appendChild(a);
    a.click(); a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert("ดาวน์โหลด PDF ไม่สำเร็จ");
  } finally {
    downloading.value = false;
  }
}
</script>

<template>
  <button class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          :disabled="downloading" @click="downloadPdf">
    {{ downloading ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF' }}
  </button>
</template>