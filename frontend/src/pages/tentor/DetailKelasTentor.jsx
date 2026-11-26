import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getKelasMy } from '../../services/kelasTentorService';
import {
  createNilai,
  deleteNilai,
  getJadwalSesi,
  getNilaiSesi,
  updateNilai,
} from '../../services/tentorDashboardService';
import {
  ArrowLeft,
  CalendarPlus,
  LoaderCircle,
  Save,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { formatGradeValue, parseGradeInput } from '../../utils/gradeUtils';

const MAPEL_TABS = ['Matematika', 'IPA', 'Bahasa Indonesia', 'Bahasa Inggris'];

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}

async function getAllSessions(kelasId) {
  const first = await getJadwalSesi({ kelas_id: kelasId, page: 1, limit: 100 });
  const sessions = [...(first.data || [])];
  for (let page = 2; page <= (first.meta?.total_pages || 1); page += 1) {
    const next = await getJadwalSesi({ kelas_id: kelasId, page, limit: 100 });
    sessions.push(...(next.data || []));
  }
  return sessions;
}

export default function DetailKelasTentor() {
  const navigate = useNavigate();
  const { kelasId } = useParams();
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [activeTab, setActiveTab] = useState(MAPEL_TABS[0]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState('');
  const [sessionForNilai, setSessionForNilai] = useState(null);
  const [gradeRows, setGradeRows] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [savingGradeId, setSavingGradeId] = useState(null);
  const [gradeError, setGradeError] = useState('');
  const [gradeNotice, setGradeNotice] = useState('');

  useEffect(() => {
    let active = true;
    getKelasMy()
      .then((assignments) => {
        const assignment = (assignments || [])
          .filter((item) => item.kelas)
          .find((item) => item.kelas_id === kelasId);
        if (!active) return;
        setSelectedKelas(assignment || null);
        setError(assignment ? '' : 'Kelas tidak ditemukan atau tidak termasuk kelas yang Anda ampu.');
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError, 'Gagal memuat kelas.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [kelasId]);

  useEffect(() => {
    if (!selectedKelas) return undefined;
    let active = true;
    setLoadingSessions(true);
    setError('');
    getAllSessions(selectedKelas.kelas_id)
      .then((allSessions) => {
        if (active) {
          setSessions(allSessions.filter((session) => session.mata_pelajaran === activeTab));
        }
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError, 'Gagal memuat jadwal sesi.'));
      })
      .finally(() => {
        if (active) setLoadingSessions(false);
      });
    return () => { active = false; };
  }, [selectedKelas, activeTab]);

  useEffect(() => {
    if (!sessionForNilai || !selectedKelas) return undefined;
    let active = true;
    setLoadingGrades(true);
    setGradeError('');
    setGradeNotice('');
    getNilaiSesi(sessionForNilai.id)
      .then((grades) => {
        if (!active) return;
        const gradeByStudent = new Map(grades.map((grade) => [grade.siswa_id, grade]));
        setGradeRows((selectedKelas.kelas.kelas_siswa || []).map((enrollment) => {
          const studentId = enrollment.siswa_id || enrollment.siswa_profile?.id;
          const profile = Array.isArray(enrollment.siswa_profile)
            ? enrollment.siswa_profile[0]
            : enrollment.siswa_profile;
          const grade = gradeByStudent.get(studentId);
          return {
            siswa_id: studentId,
            nama: profile?.nama || 'Siswa',
            nilai: formatGradeValue(grade),
            tipe_nilai: grade?.tipe_nilai || null,
            keterangan: grade?.keterangan || '',
            gradeId: grade?.id || null,
          };
        }));
      })
      .catch((requestError) => {
        if (active) setGradeError(getErrorMessage(requestError, 'Gagal memuat nilai siswa.'));
      })
      .finally(() => {
        if (active) setLoadingGrades(false);
      });
    return () => { active = false; };
  }, [sessionForNilai, selectedKelas]);

  const updateGradeRow = (studentId, field, value) => {
    setGradeRows((rows) => rows.map((row) =>
      row.siswa_id === studentId ? { ...row, [field]: value } : row,
    ));
  };

  const saveGrade = async (row) => {
    const parsedGrade = parseGradeInput(row.nilai);
    if (!parsedGrade) {
      setGradeError('Nilai wajib berupa angka 0–100 atau huruf A–E.');
      return;
    }
    setSavingGradeId(row.siswa_id);
    setGradeError('');
    setGradeNotice('');
    const payload = {
      sesi_id: sessionForNilai.id,
      siswa_id: row.siswa_id,
      ...parsedGrade,
      keterangan: row.keterangan.trim() || null,
    };
    try {
      const saved = row.gradeId
        ? await updateNilai(row.gradeId, payload)
        : await createNilai(payload);
      setGradeRows((rows) => rows.map((item) =>
        item.siswa_id === row.siswa_id
          ? { ...item, gradeId: saved.id, tipe_nilai: payload.tipe_nilai }
          : item,
      ));
      setGradeNotice(`Nilai ${row.nama} berhasil disimpan.`);
    } catch (requestError) {
      setGradeError(getErrorMessage(requestError, 'Nilai gagal disimpan.'));
    } finally {
      setSavingGradeId(null);
    }
  };

  const removeGrade = async (row) => {
    if (!row.gradeId || !window.confirm(`Hapus nilai ${row.nama}?`)) return;
    setSavingGradeId(row.siswa_id);
    setGradeError('');
    try {
      await deleteNilai(row.gradeId);
      setGradeRows((rows) => rows.map((item) =>
        item.siswa_id === row.siswa_id
          ? { ...item, gradeId: null, nilai: '', tipe_nilai: null, keterangan: '' }
          : item,
      ));
      setGradeNotice(`Nilai ${row.nama} berhasil dihapus.`);
    } catch (requestError) {
      setGradeError(getErrorMessage(requestError, 'Nilai gagal dihapus.'));
    } finally {
      setSavingGradeId(null);
    }
  };

  const gradeModal = sessionForNilai ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Input Nilai Siswa</h3>
            <p className="mt-1 text-sm text-gray-500">
              {sessionForNilai.materi || sessionForNilai.topik || 'Sesi pembelajaran'}
            </p>
            <p className="mt-2 inline-block rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
              Input huruf A–E atau angka 0–100
            </p>
          </div>
          <button type="button" onClick={() => setSessionForNilai(null)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {gradeError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{gradeError}</p>}
          {gradeNotice && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{gradeNotice}</p>}
          {loadingGrades ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
              <LoaderCircle className="h-5 w-5 animate-spin" /> Memuat nilai...
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-900">
                  <tr>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="w-28 px-4 py-3">Nilai</th>
                    <th className="px-4 py-3">Keterangan</th>
                    <th className="w-32 px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gradeRows.map((row) => (
                    <tr key={row.siswa_id}>
                      <td className="px-4 py-3 font-medium text-gray-800">{row.nama}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={row.nilai}
                          onChange={(event) => updateGradeRow(row.siswa_id, 'nilai', event.target.value)}
                          placeholder="A atau 90"
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-center font-bold focus:border-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={row.keterangan}
                          onChange={(event) => updateGradeRow(row.siswa_id, 'keterangan', event.target.value)}
                          placeholder="Catatan perkembangan..."
                          className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={savingGradeId === row.siswa_id}
                            onClick={() => saveGrade(row)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                          >
                            <Save className="h-3.5 w-3.5" />
                            {row.gradeId ? 'Simpan' : 'Tambah'}
                          </button>
                          {row.gradeId && (
                            <button
                              type="button"
                              disabled={savingGradeId === row.siswa_id}
                              onClick={() => removeGrade(row)}
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button type="button" onClick={() => setSessionForNilai(null)} className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-gray-700">
            Selesai
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Memuat kelas...
        </div>
      ) : !selectedKelas ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error || 'Kelas tidak ditemukan.'}
          <button type="button" onClick={() => navigate('/tentor')} className="ml-3 font-bold underline">
            Kembali
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-6 flex items-center gap-4">
            <button type="button" onClick={() => navigate('/tentor')} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedKelas.kelas.nama_kelas}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                {selectedKelas.kelas.kelas_siswa?.length || 0} siswa
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex gap-6 overflow-x-auto border-b border-gray-200 bg-gray-50 px-6 pt-4">
              {MAPEL_TABS.map((mapel) => (
                <button
                  key={mapel}
                  type="button"
                  onClick={() => setActiveTab(mapel)}
                  className={`whitespace-nowrap border-b-2 pb-3 text-sm font-semibold ${
                    activeTab === mapel ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'
                  }`}
                >
                  {mapel}
                </button>
              ))}
            </div>
            <div className="p-6">
              {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              {loadingSessions ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
                  <LoaderCircle className="h-5 w-5 animate-spin" /> Memuat sesi...
                </div>
              ) : sessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
                  <CalendarPlus className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-3 text-sm font-medium text-gray-600">Belum ada sesi untuk {activeTab}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{session.materi || 'Sesi pembelajaran'}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {session.tanggal || '-'} • {session.jam_mulai || '-'} - {session.jam_selesai || '-'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSessionForNilai(session)}
                        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
                      >
                        Input Nilai
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {gradeModal}
    </DashboardLayout>
  );
}
