import api from './api'

export async function getKelasTentor({ page = 1, limit = 100, kelas_id, tentor_id } = {}) {
  const params = { page, limit }
  if (kelas_id) params.kelas_id = kelas_id
  if (tentor_id) params.tentor_id = tentor_id

  const { data } = await api.get('/kelas-tentor', { params })
  return data.data // { data: assignment[], meta }
}

// Khusus tentor: kelas yang diampu tentor yang sedang login
export async function getKelasMy() {
  const { data } = await api.get('/kelas-tentor/my')
  return data.data.data // assignment[] -> { id, kelas_id, tentor_id, kelas: { id, nama_kelas, jenjang } }
}

export async function createKelasTentor({ kelas_id, tentor_id }) {
  const { data } = await api.post('/kelas-tentor', { kelas_id, tentor_id })
  return data.data.data
}

export async function updateKelasTentor(id, { kelas_id, tentor_id }) {
  const { data } = await api.put(`/kelas-tentor/${id}`, { kelas_id, tentor_id })
  return data.data.data
}

export async function deleteKelasTentor(id) {
  const { data } = await api.delete(`/kelas-tentor/${id}`)
  return data.data
}

export async function syncTentorKelas(tentorId, kelasIds) {
  const assignments = []
  const firstPage = await getKelasTentor({ page: 1, limit: 100, tentor_id: tentorId })

  if (!Array.isArray(firstPage?.data) || !firstPage.meta) {
    throw new Error('Format data penugasan tentor dari server tidak valid.')
  }

  assignments.push(...firstPage.data)
  for (let page = 2; page <= firstPage.meta.total_pages; page += 1) {
    const result = await getKelasTentor({ page, limit: 100, tentor_id: tentorId })
    if (!Array.isArray(result?.data) || !result.meta) {
      throw new Error('Format data penugasan tentor dari server tidak valid.')
    }
    assignments.push(...result.data)
  }

  const selectedIds = [...new Set(kelasIds)]
  const selectedSet = new Set(selectedIds)
  const currentByKelas = new Map(assignments.map((assignment) => [assignment.kelas_id, assignment]))

  await Promise.all(
    selectedIds
      .filter((kelasId) => !currentByKelas.has(kelasId))
      .map((kelasId) => createKelasTentor({ kelas_id: kelasId, tentor_id: tentorId })),
  )

  await Promise.all(
    assignments
      .filter((assignment) => !selectedSet.has(assignment.kelas_id))
      .map((assignment) => deleteKelasTentor(assignment.id)),
  )
}
