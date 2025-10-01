export function toast(msg, type='info') {
  // ใช้ window.dispatchEvent + component ฟัง event ก็ได้
  alert(msg) // ง่ายสุดก่อน; ถ้าอยากสวย ใช้ไลบรารีเช่น vue-toastification
}
