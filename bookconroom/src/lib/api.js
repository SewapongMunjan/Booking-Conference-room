import axios, { AxiosHeaders } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
})

// attach token
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('access_token')
  if (t) {
    const h = new AxiosHeaders(config.headers || {})
    h.set('Authorization', `Bearer ${t}`)
    config.headers = h
  }
  return config
})

// auto logout on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('me_cache')
      if (location.pathname !== '/login') location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api