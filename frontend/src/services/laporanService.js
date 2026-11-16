import api from './api';

export async function generateStudentReport(siswaId, { periode, periodeKey } = {}) {
  const { data } = await api.post(`/laporan/generate/${siswaId}`, {
    periode,
    periode_key: periodeKey,
  });
  return data.data;
}

export async function getStudentGrades(siswaId, periodeKey) {
  const { data } = siswaId
    ? await api.get('/nilai', { params: { siswa_id: siswaId, limit: 100 } })
    : await api.get('/nilai/me');
  const grades = data.data.data;
  if (!periodeKey) return grades;
  return grades.filter((grade) => {
    const sesi = Array.isArray(grade.sesi_pembelajaran)
      ? grade.sesi_pembelajaran[0]
      : grade.sesi_pembelajaran;
    return String(sesi?.tanggal || '').startsWith(`${periodeKey}-`);
  });
}

export async function saveStudentReport(payload) {
  const { data } = await api.post('/laporan/tambah', payload);
  return data.data;
}

export async function getStudentReport(siswaId, periode) {
  const { data } = await api.get('/laporan', {
    params: { siswa_id: siswaId, periode, limit: 1 },
  });
  return data.data.data[0] || null;
}

export async function getStudentReportIds() {
  const { data } = await api.get('/laporan/status');
  return data.data.siswa_ids;
}

export async function getAllLaporan(params) {
  const { data } = await api.get('/laporan', { params });
  return data.data;
}

export async function getLaporanById(id) {
  const { data } = await api.get(`/laporan/${id}`);
  return data;
}

export async function updateLaporan(id, payload) {
  const { data } = await api.put(`/laporan/${id}`, payload);
  return data;
}
