import api from './api'

export async function getJadwalSiswa({ page = 1, limit = 10 } = {}) {
  const { data } = await api.get('/jadwal-materi/me', { params: { page, limit } })
  return data.data
}

export async function getLinkUnduhMateri(sesiId) {
  const { data } = await api.get(`/jadwal-materi/${sesiId}/download`)
  return data.data.link_materi
}
