import api from './api'

export async function getAllKelas({ page = 1, limit = 10, jenjang } = {}) {
  const params = { page, limit }
  if (jenjang) params.jenjang = jenjang

  const { data } = await api.get('/kelas', { params })
  return data.data // { data: kelas[], meta }
}

export async function getKelasById(id) {
  const { data } = await api.get(`/kelas/${id}`)
  return data.data.data
}

export async function createKelas({ nama_kelas, jenjang }) {
  const { data } = await api.post('/kelas', { nama_kelas, jenjang })
  return data.data.data
}

export async function updateKelas(id, { nama_kelas, jenjang }) {
  const { data } = await api.put(`/kelas/${id}`, { nama_kelas, jenjang })
  return data.data.data
}

export async function deleteKelas(id) {
  const { data } = await api.delete(`/kelas/${id}`)
  return data.data
}
