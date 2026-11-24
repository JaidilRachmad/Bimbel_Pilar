import api from './api'

export async function getJadwalSesi({ kelas_id, page = 1, limit = 10 }) {
  const { data } = await api.get('/jadwal-materi', {
    params: { kelas_id, page, limit },
  })
  return data.data
}

export async function createJadwalSesi(payload) {
  const { data } = await api.post('/jadwal-materi', payload)
  return data.data.data
}

export async function updateJadwalSesi(id, payload) {
  const { data } = await api.put(`/jadwal-materi/${id}`, payload)
  return data.data.data
}

export async function deleteJadwalSesi(id) {
  const { data } = await api.delete(`/jadwal-materi/${id}`)
  return data.data
}

export async function getNilaiSesi(sesi_id) {
  const { data } = await api.get('/nilai', {
    params: { sesi_id, page: 1, limit: 100 },
  })
  return data.data.data
}

export async function getNilaiTentor({ page = 1, limit = 100 } = {}) {
  const { data } = await api.get('/nilai', { params: { page, limit } })
  return data.data
}

export async function createNilai(payload) {
  const { data } = await api.post('/nilai', payload)
  return data.data.data
}

export async function updateNilai(id, payload) {
  const { data } = await api.put(`/nilai/${id}`, payload)
  return data.data.data
}

export async function deleteNilai(id) {
  const { data } = await api.delete(`/nilai/${id}`)
  return data.data
}
