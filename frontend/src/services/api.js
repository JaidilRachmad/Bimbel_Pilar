import axios from 'axios'
import { clearSession, getSession } from '../utils/storage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const session = getSession()
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url ?? ''
    const isLoginCall = url.includes('/auth/admin/login') || url.includes('/auth/token')

    if (error.response?.status === 401 && !isLoginCall) {
      clearSession()
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(error)
  }
)

export default api