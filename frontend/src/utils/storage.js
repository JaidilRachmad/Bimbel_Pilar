const KEY = 'pilar_auth'

export function saveSession(session, remember) {
  clearSession()
  const store = remember ? localStorage : sessionStorage
  store.setItem(KEY, JSON.stringify(session))
}

export function getSession() {
  const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
}