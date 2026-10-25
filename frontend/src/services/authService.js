import api from './api'

export async function loginAdmin(email, password) {
  const { data } = await api.post('/auth/admin/login', { email, password })
  return data
}

export async function loginWithToken(tokenAkses) {
  const { data } = await api.post('/auth/token', { token_akses: tokenAkses })
  return data
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me')
  return data.user
}

export async function logoutRequest() {
  try {
    await api.post('/auth/logout')
  } catch {
    // tetap lanjut logout di sisi klien
  }
}

export function getErrorInfo(err) {
  if (err.response) {
    const d = err.response.data ?? {}
    return {
      status: err.response.status,
      message: d.message || 'Terjadi kesalahan pada server.',
      retryAfter: d.retryAfter,
      remainingAttempts: d.remainingAttempts,
    }
  }
  return {
    status: 0,
    message: 'Tidak dapat terhubung ke server. Pastikan backend berjalan dan koneksi internet stabil.',
  }
}