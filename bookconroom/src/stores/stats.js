import { defineStore } from 'pinia'
import api from '@/lib/api.js'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    loading: false,
    error: '',
    stats: {
      totalToday: 0,
      approved: 0,
      pending: 0,
      cancelled: 0,
    }
  }),
  actions: {
    async fetchStats(params = {}) {
      this.loading = true
      this.error = ''
      try {
        // ปรับ endpoint ตาม backend ถ้าแตกต่าง
        const res = await api.get('/api/stats/bookings', { params })
        const d = res.data ?? {}
        // mapping แบบยืดหยุ่น (fallbacks)
        this.stats.totalToday = d.totalToday ?? d.total ?? d.count ?? 0
        this.stats.approved = d.approved ?? d.approvedCount ?? d.approvedBookings ?? 0
        this.stats.pending = d.pending ?? d.pendingCount ?? d.waiting ?? 0
        this.stats.cancelled = d.cancelled ?? d.cancelledCount ?? d.cancelledBookings ?? 0
      } catch (e) {
        console.error('fetchStats failed', e)
        this.error = e?.response?.data?.error || e?.message || 'fetch failed'
      } finally {
        this.loading = false
      }
    }
  }
})