import api from './api'

export async function getKelasSessions({ kelas_id, page = 1, limit = 10 }) {
  const { data } = await api.get('/jadwal-materi', {
    params: { kelas_id, page, limit },
  })
  return data.data
}
