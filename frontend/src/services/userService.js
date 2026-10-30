import api from './api'

// Semua fungsi mengembalikan field `data` dari respons backend (sendSuccess)

export async function getAllUsers(role) {
  const { data } = await api.get('/user', { params: role ? { role } : undefined })
  return data.data // { total, users }
}

export async function createAccount({ role, nama, noTelp, extraField, kelasId }) {
  const { data } = await api.post('/user', { role, nama, noTelp, extraField, kelasId })
  return data.data // { id, role, nama, token_akses_asli }
}

export async function updateUserData(id, { role, nama, noTelp, extraField }) {
  const { data } = await api.put(`/user/${id}`, { role, nama, noTelp, extraField })
  return data.data
}

export async function updateAccessToken(id) {
  const { data } = await api.put(`/user/${id}/token`)
  return data.data // { id, token_akses_baru_asli }
}

export async function deleteUserAccount(id) {
  const { data } = await api.delete(`/user/${id}`)
  return data.data // { id }
}
