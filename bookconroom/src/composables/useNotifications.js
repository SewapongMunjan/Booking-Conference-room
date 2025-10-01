import { ref } from 'vue'
import api from '@/lib/api.js'

const items = ref([])
const unreadCount = ref(0)
const loading = ref(false)

export function useNotifications() {
  async function refresh(unreadOnly = false) {
    loading.value = true
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/api/notifications', { params: unreadOnly ? { unread: 1 } : {} }),
        api.get('/api/notifications/unread-count')
      ])
      items.value = listRes.data?.items ?? []
      unreadCount.value = countRes.data?.count ?? 0
    } finally {
      loading.value = false
    }
  }
  async function markAllRead() {
    await api.patch('/api/notifications/read-all')
    await refresh()
  }
  async function markRead(id) {
    await api.patch(`/api/notifications/${id}/read`)
    await refresh()
  }
  return { items, unreadCount, loading, refresh, markAllRead, markRead }
}
