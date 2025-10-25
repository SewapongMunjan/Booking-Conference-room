function b64urlToJsonSafe(str) {
  try {
    const base = (str || '').split('.')[1]
    if (!base) return {}
    const pad = '='.repeat((4 - (base.length % 4)) % 4)
    const s = base.replace(/-/g, '+').replace(/_/g, '/') + pad
    const json = atob(s)
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch { return {} }
}

export function decodeJwtPayloadSafe(token) {
  try { return b64urlToJsonSafe(token) } catch { return {} }
}

export function isAdmin() {
  const flag = (localStorage.getItem('isAdmin') || '').toLowerCase()
  if (flag === '1' || flag === 'true') return true

  const role = (localStorage.getItem('user_role') || '').toUpperCase()
  if (role === 'ADMIN') return true

  const payload = decodeJwtPayloadSafe(localStorage.getItem('access_token') || '')
  if (payload?.pos?.isAdmin === true) return true
  const roles = []
    .concat(payload?.role || [])
    .concat(payload?.roles || [])
    .map(x => String(x).toUpperCase())
  return roles.includes('ADMIN')
}

export function isNoteTaker() {
  const flag = (localStorage.getItem('isNoteTaker') || '').toLowerCase()
  if (flag === '1' || flag === 'true') return true

  const role = (localStorage.getItem('user_role') || '').toUpperCase()
  if (role === 'NOTE_TAKER') return true

  const payload = decodeJwtPayloadSafe(localStorage.getItem('access_token') || '')
  if (payload?.pos?.isNoteTaker === true) return true
  const roles = []
    .concat(payload?.role || [])
    .concat(payload?.roles || [])
    .map(x => String(x).toUpperCase())
  return roles.includes('NOTE_TAKER')
}

export function isNoteManager() {
  const flag = (localStorage.getItem('isNoteManager') || '').toLowerCase()
  if (flag === '1' || flag === 'true') return true

  const role = (localStorage.getItem('user_role') || '').toUpperCase()
  if (role === 'NOTE_MANAGER') return true

  const payload = decodeJwtPayloadSafe(localStorage.getItem('access_token') || '')
  if (payload?.pos?.isNoteManager === true) return true
  const roles = []
    .concat(payload?.role || [])
    .concat(payload?.roles || [])
    .map(x => String(x).toUpperCase())
  return roles.includes('NOTE_MANAGER')
}

export function isHousekeeper() {
  const flag = (localStorage.getItem('isHousekeeper') || '').toLowerCase()
  if (flag === '1' || flag === 'true') return true

  const role = (localStorage.getItem('user_role') || '').toUpperCase()
  if (role === 'HOUSEKEEPER') return true

  const payload = decodeJwtPayloadSafe(localStorage.getItem('access_token') || '')
  if (payload?.pos?.isHousekeeper === true) return true
  const roles = []
    .concat(payload?.role || [])
    .concat(payload?.roles || [])
    .map(x => String(x).toUpperCase())
  return roles.includes('HOUSEKEEPER')
}

export function isHousekeepingLead() {
  const flag = (localStorage.getItem('isHousekeepingLead') || '').toLowerCase()
  if (flag === '1' || flag === 'true') return true

  const role = (localStorage.getItem('user_role') || '').toUpperCase()
  if (role === 'HOUSEKEEPING_LEAD') return true

  const payload = decodeJwtPayloadSafe(localStorage.getItem('access_token') || '')
  if (payload?.pos?.isHousekeepingLead === true) return true
  const roles = []
    .concat(payload?.role || [])
    .concat(payload?.roles || [])
    .map(x => String(x).toUpperCase())
  return roles.includes('HOUSEKEEPING_LEAD')
}