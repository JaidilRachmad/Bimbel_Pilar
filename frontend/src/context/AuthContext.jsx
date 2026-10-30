import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMe, logoutRequest } from '../services/authService'
import { clearSession, getSession, saveSession } from '../utils/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession()?.user ?? null)
  const [loading, setLoading] = useState(() => Boolean(getSession()?.token))

  // Validasi token yang tersimpan ke backend saat aplikasi dibuka
  useEffect(() => {
    if (!getSession()?.token) return
    let active = true
    fetchMe()
      .then((me) => active && setUser(me))
      .catch(() => {
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const login = useCallback((data, remember) => {
    saveSession({ token: data.token, user: data.user }, remember)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest() // kirim sebelum token dihapus
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}