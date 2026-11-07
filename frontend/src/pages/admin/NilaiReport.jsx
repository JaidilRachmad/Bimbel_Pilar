import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  generateStudentReport, getStudentGrades, getStudentReport, getStudentReportIds, saveStudentReport,
} from '../../services/laporanService';
import { getAllKelas } from '../../services/kelasService';
import { getAllUsers } from '../../services/userService';
import {
  ArrowLeft, Check, CheckCircle2, ChevronRight, Download,
  AlertCircle, Edit3, LoaderCircle, Save, School, Sparkles, User, Users
} from 'lucide-react';

const currentPeriod = () => new Date().toLocaleDateString('id-ID', {
  month: 'long',
  year: 'numeric',
});

function getErrorMessage(error, fallback) {
  const response = error.response?.data;
  if (response?.errors?.length) {
    return `${response.message || fallback} ${response.errors.join(' ')}`;
  }
  return response?.message || error.message || fallback;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function NilaiReport() {
  const [kelasList, setKelasList] = useState([]);
  const [studentReportIds, setStudentReportIds] = useState(new Set());
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [nilaiList, setNilaiList] = useState([]);
  const [catatan, setCatatan] = useState('');
  const [saran, setSaran] = useState('');
  const [periode, setPeriode] = useState(currentPeriod);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [loadingNilai, setLoadingNilai] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let active = true;

    async function loadKelas() {
      setLoadingKelas(true);
      setError('');
      try {
        const firstPage = await getAllKelas({ page: 1, limit: 100 });
        if (!Array.isArray(firstPage?.data) || !firstPage.meta) {
          throw new Error('Format data kelas dari server tidak valid.');
        }
        const classes = [...firstPage.data];
        for (let page = 2; page <= firstPage.meta.total_pages; page += 1) {
          const result = await getAllKelas({ page, limit: 100 });
          if (!Array.isArray(result?.data)) {
            throw new Error('Format data kelas dari server tidak valid.');
          }
          classes.push(...result.data);
        }

        const [result, reportStudentIds] = await Promise.all([
          getAllUsers('siswa'),
          getStudentReportIds(),
        ]);
        if (!Array.isArray(result?.users) || !Array.isArray(reportStudentIds)) {
          throw new Error('Format data siswa dari server tidak valid.');
        }

        const kelasById = new Map(classes.map((kelas) => [kelas.id, { ...kelas, kelas_siswa: [] }]));
        const unassignedStudents = [];
        result.users.forEach((siswa) => {
          const memberships = siswa.kelasList?.length
            ? siswa.kelasList
            : siswa.kelas
              ? [siswa.kelas]
              : [];
          const studentEntry = { siswa_id: siswa.id, siswa_profile: { nama: siswa.nama } };

          if (memberships.length === 0) {
            unassignedStudents.push(studentEntry);
            return;
          }

          memberships.forEach((kelasSiswa) => {
            const kelas = kelasById.get(kelasSiswa.id);
            if (kelas) kelas.kelas_siswa.push(studentEntry);
            else unassignedStudents.push(studentEntry);
          });
        });

        const allClasses = [...kelasById.values()];
        if (unassignedStudents.length > 0) {
          allClasses.push({
            id: 'unassigned-students',
            nama_kelas: 'Siswa Belum Memiliki Kelas',
            jenjang: 'Belum ditentukan',
            kelas_siswa: unassignedStudents,
          });
        }

        if (active) {
          setKelasList(allClasses);
          setStudentReportIds(new Set(reportStudentIds));
        }
      } catch (requestError) {
        if (active) {
          setKelasList([]);
          setError(getErrorMessage(requestError, 'Gagal memuat data kelas.'));
        }
      } finally {
        if (active) setLoadingKelas(false);
      }
    }

    loadKelas();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedSiswa) return undefined;
    let active = true;

    async function loadNilai() {
      setLoadingNilai(true);
      setError('');
      try {
        const grades = await getStudentGrades(selectedSiswa.id);
        if (active) setNilaiList(grades);
      } catch (requestError) {
        if (active) {
          setNilaiList([]);
          setError(getErrorMessage(requestError, 'Gagal memuat nilai siswa.'));
        }
      } finally {
        if (active) setLoadingNilai(false);
      }
    }

    loadNilai();
    return () => {
      active = false;
    };
  }, [selectedSiswa]);

  useEffect(() => {
    if (!selectedSiswa) return undefined;
    if (!periode.trim()) return undefined;

    let active = true;
    const timeout = setTimeout(async () => {
      setError('');
      try {
        const report = await getStudentReport(selectedSiswa.id, periode.trim());
        if (active) {
          setCatatan(report?.catatan_wali_kelas || '');
          setSaran(report?.saran_pengembangan || '');
        }
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError, 'Gagal memuat laporan siswa.'));
      } finally {
        if (active) setLoadingReport(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [selectedSiswa, periode]);

  const openSiswa = (membership) => {
    setSelectedSiswa({
      id: membership.siswa_id,
      nama: membership.siswa_profile?.nama || 'Nama siswa tidak tersedia',
    });
    setNilaiList([]);
    setCatatan('');
    setSaran('');
    setPeriode(currentPeriod());
    setLoadingReport(true);
    setError('');
    setStatusMessage({ type: '', text: '' });
  };

  const handleGenerateAI = async () => {
    if (!hasAssignedClass) {
      setStatusMessage({
        type: 'error',
        text: 'Siswa belum terdaftar di kelas. Daftarkan siswa ke kelas terlebih dahulu.',
      });
      return;
    }
    if (!hasReportableGrades) {
      setStatusMessage({
        type: 'error',
        text: 'Siswa belum memiliki nilai dari tentor. Masukkan nilai terlebih dahulu.',
      });
      return;
    }

    setLoadingAI(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const report = await generateStudentReport(selectedSiswa.id, { periode });
      setCatatan(report.catatan_wali_kelas || '');
      setSaran(report.saran_pengembangan || '');
      setPeriode(report.periode || periode);
      setStatusMessage({
        type: 'success',
        text: 'Laporan berhasil digenerate. Periksa hasilnya, lalu simpan ke database.',
      });
    } catch (requestError) {
      setStatusMessage({
        type: 'error',
        text: getErrorMessage(requestError, 'Gagal men-generate laporan AI.'),
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSaveReport = async () => {
    if (!periode.trim()) {
      setStatusMessage({ type: 'error', text: 'Periode laporan wajib diisi.' });
      return;
    }
    if (!catatan.trim() && !saran.trim()) {
      setStatusMessage({ type: 'error', text: 'Isi catatan atau saran sebelum menyimpan laporan.' });
      return;
    }

    setSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      await saveStudentReport({
        siswa_id: selectedSiswa.id,
        periode: periode.trim(),
        catatan_wali_kelas: catatan.trim(),
        saran_pengembangan: saran.trim(),
      });
      setStudentReportIds((current) => new Set(current).add(selectedSiswa.id));
      setStatusMessage({ type: 'success', text: 'Laporan berhasil disimpan atau diperbarui di database.' });
    } catch (requestError) {
      setStatusMessage({
        type: 'error',
        text: getErrorMessage(requestError, 'Gagal menyimpan laporan ke database.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const siswaKelas = selectedKelas?.kelas_siswa || [];
  const hasAssignedClass = selectedKelas?.id !== 'unassigned-students';
  const hasReportableGrades = nilaiList.some((grade) => (
    grade.nilai !== null
    && grade.nilai !== undefined
    && String(grade.nilai).trim() !== ''
    && Number.isFinite(Number(grade.nilai))
  ));

  return (
    <DashboardLayout>
      {!selectedKelas ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Nilai &amp; Report</h1>
            <p className="mt-1 text-gray-500">Pilih kelas untuk melihat daftar siswa dan laporan belajarnya.</p>
          </div>

          {error && (
            <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loadingKelas ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white p-10 text-sm text-gray-500">
              <LoaderCircle className="h-5 w-5 animate-spin" /> Memuat data kelas...
            </div>
          ) : kelasList.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Belum ada data kelas.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {kelasList.map((kelas) => (
                <button
                  key={kelas.id}
                  type="button"
                  onClick={() => setSelectedKelas(kelas)}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <School className="h-6 w-6" />
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{kelas.nama_kelas}</h2>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <span>{kelas.jenjang}</span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {kelas.kelas_siswa?.length || 0} siswa
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : !selectedSiswa ? (
        <>
          <button
            type="button"
            onClick={() => setSelectedKelas(null)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Kelas
          </button>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{selectedKelas.nama_kelas}</h1>
            <p className="mt-1 text-gray-500">Pilih siswa untuk melihat nilai dan membuat laporan.</p>
          </div>

          {siswaKelas.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Belum ada siswa yang terdaftar di kelas ini.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                      <th className="border-b border-gray-200 p-4 font-semibold">Nama Siswa</th>
                      <th className="border-b border-gray-200 p-4 font-semibold">Laporan</th>
                      <th className="border-b border-gray-200 p-4 text-center font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {siswaKelas.map((membership) => (
                      <tr key={membership.siswa_id} className="group transition hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                              {(membership.siswa_profile?.nama || '?').charAt(0)}
                            </span>
                            <span className="text-sm font-bold text-gray-800">
                              {membership.siswa_profile?.nama || 'Nama siswa tidak tersedia'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            studentReportIds.has(membership.siswa_id)
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {studentReportIds.has(membership.siswa_id) ? 'Ada' : 'Belum ada'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => openSiswa(membership)}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                          >
                            Lihat Nilai <ChevronRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setSelectedSiswa(null);
              setStatusMessage({ type: '', text: '' });
              setError('');
            }}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Siswa
          </button>

          <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedSiswa.nama}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> {selectedKelas.nama_kelas}
                  </span>
                  <span aria-hidden="true">•</span>
                  <label className="flex items-center gap-1.5">
                    Periode
                    <input
                      value={periode}
                      onChange={(event) => {
                                const nextPeriode = event.target.value;
                                setLoadingReport(Boolean(nextPeriode.trim()));
                                if (!nextPeriode.trim()) {
                                  setCatatan('');
                                  setSaran('');
                                }
                                setPeriode(nextPeriode);
                              }}
                      aria-label="Periode laporan"
                      className="w-32 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900"
            >
              <Download className="h-4 w-4" /> Unduh Report
            </button>
          </div>

          {error && (
            <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 p-4 text-lg font-bold text-gray-800">
              <CheckCircle2 className="h-5 w-5 text-blue-600" /> Detail Pertemuan &amp; Nilai
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <th className="border-b border-gray-200 p-4 text-center font-semibold">Pert.</th>
                    <th className="border-b border-gray-200 p-4 font-semibold">Tanggal</th>
                    <th className="border-b border-gray-200 p-4 font-semibold">Mata Pelajaran</th>
                    <th className="border-b border-gray-200 p-4 font-semibold">Materi Pokok</th>
                    <th className="border-b border-gray-200 p-4 text-center font-semibold">Nilai</th>
                    <th className="border-b border-gray-200 p-4 text-center font-semibold">Status</th>
                    <th className="border-b border-gray-200 p-4 font-semibold">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loadingNilai ? (
                    <tr><td colSpan="7" className="p-8 text-center text-sm text-gray-500">Memuat nilai siswa...</td></tr>
                  ) : nilaiList.length === 0 ? (
                    <tr><td colSpan="7" className="p-8 text-center text-sm text-gray-500">Belum ada nilai tersimpan untuk siswa ini.</td></tr>
                  ) : nilaiList.map((item, index) => {
                    const sesi = item.sesi_pembelajaran || {};
                    const status = Number(item.nilai) < 80 ? 'Perlu ditingkatkan' : 'Baik';
                    return (
                      <tr key={item.id} className="transition hover:bg-gray-50">
                        <td className="p-4 text-center text-sm font-bold text-gray-500">{index + 1}</td>
                        <td className="whitespace-nowrap p-4 text-sm text-gray-600">{formatDate(sesi.tanggal || item.created_at)}</td>
                        <td className="p-4 text-sm font-bold text-gray-800">{sesi.mata_pelajaran || '-'}</td>
                        <td className="p-4 text-sm text-gray-600">{sesi.materi || '-'}</td>
                        <td className="p-4 text-center">
                          <span className="inline-block rounded-lg bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">{item.nilai}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block rounded px-2 py-1 text-xs font-bold ${status === 'Baik' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {status}
                          </span>
                        </td>
                        <td className="p-4 text-sm italic text-gray-600">{item.keterangan || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {statusMessage.text && (
            <div
              role={statusMessage.type === 'error' ? 'alert' : 'status'}
              className={`mb-6 flex items-center gap-3 rounded-xl border p-4 text-sm font-medium ${statusMessage.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
                }`}
            >
              {statusMessage.type === 'success'
                ? <Check className="h-5 w-5 shrink-0 text-green-600" />
                : <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <Edit3 className="h-5 w-5 text-gray-500" /> Catatan Perkembangan Siswa
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">Laporan evaluasi dan saran perkembangan belajar siswa.</p>
              </div>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={
                  loadingAI
                  || saving
                  || loadingReport
                  || loadingNilai
                  || !hasAssignedClass
                  || !hasReportableGrades
                }
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingAI
                  ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Memproses laporan...</>
                  : <><Sparkles className="h-4 w-4" /> Generate Laporan AI</>}
              </button>
            </div>

            {!hasAssignedClass ? (
              <p role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Siswa belum terdaftar di kelas. Generate laporan tersedia setelah siswa didaftarkan.
              </p>
            ) : !loadingNilai && !hasReportableGrades && !error ? (
              <p role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Belum ada nilai dari tentor untuk siswa ini. Masukkan nilai terlebih dahulu sebelum generate laporan.
              </p>
            ) : null}

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Catatan Wali Kelas
                <textarea
                  value={catatan}
                  onChange={(event) => setCatatan(event.target.value)}
                  disabled={loadingReport}
                  rows={4}
                  placeholder="Catatan evaluasi pencapaian belajar siswa..."
                  className={`mt-2 w-full rounded-xl border p-4 text-sm font-normal leading-relaxed outline-none transition-all ${
                    loadingReport ? 'cursor-wait opacity-60' : 'cursor-text'
                  } border-gray-200 bg-gray-50 text-gray-700 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500`}
                />
              </label>
              <label className="block text-sm font-semibold text-gray-700">
                Saran Pengembangan
                <textarea
                  value={saran}
                  onChange={(event) => setSaran(event.target.value)}
                  disabled={loadingReport}
                  rows={4}
                  placeholder="Saran dan fokus belajar untuk sesi berikutnya..."
                  className={`mt-2 w-full rounded-xl border p-4 text-sm font-normal leading-relaxed outline-none transition-all ${
                    loadingReport ? 'cursor-wait opacity-60' : 'cursor-text'
                  } border-gray-200 bg-gray-50 text-gray-700 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500`}
                />
              </label>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleSaveReport}
                disabled={saving || loadingAI || loadingReport || (!catatan.trim() && !saran.trim()) || !periode.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Menyimpan...</>
                  : <><Save className="h-4 w-4" /> Simpan ke Database</>}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            &copy; 2026 Pilar Cendekia Education Management System. All Rights Reserved.
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
