// src/composables/useAuth.js
import { computed } from 'vue'

export function useAuth() {
  const isAdmin = computed(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return false
    try {
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))
      )
      return !!payload?.pos?.isAdmin
    } catch {
      return false
    }
  })
  return { isAdmin }
}
