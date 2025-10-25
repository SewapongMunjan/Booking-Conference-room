import api from './api.js'

// try decode JWT from localStorage (non-verified, best-effort)
function tryDecodeToken() {
  try {
    const raw = localStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('accessToken')
    if (!raw) return null
    const parts = raw.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    // common locations: payload.user, payload.sub, payload.name, payload.email
    return payload.user ?? payload.sub ?? payload
  } catch (_) {
    return null
  }
}

export async function fetchCurrentUser() {
  // 1) try decode token first
  const fromToken = tryDecodeToken()
  if (fromToken) return { data: fromToken, status: 200 }

  // 2) fallback: try a few likely endpoints but keep attempts quiet
  const candidates = [
    '/api/me',
    '/api/users/me',
    '/api/auth/me',
    '/api/profile',
    '/api/user',
    '/api/users/current',
    '/me',
    '/user/me'
  ]

  for (const path of candidates) {
    try {
      const res = await api.get(path)
      if (res?.status === 200) return res
    } catch (err) {
      // swallow errors to avoid noisy console logs (Network tab will still show requests)
      // optionally filter certain statuses if needed
    }
  }

  return null
}