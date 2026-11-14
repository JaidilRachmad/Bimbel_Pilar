import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { ArrowLeft, BookOpen, Download, FileText, TrendingUp, MessageSquare, ChevronDown } from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function getMonthKey(dateValue) {
  if (!dateValue) return null;
  const dateOnly = String(dateValue).match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (dateOnly) return `${dateOnly[1]}-${dateOnly[2]}`;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getReportMonthKey(report) {
  const period = String(report.periode || '').trim().toLocaleLowerCase('id-ID');
  const match = period.match(/^([a-z]+)\s+(\d{4})$/);
  if (match) {
    const monthIndex = MONTH_NAMES.findIndex(
      (month) => month.toLocaleLowerCase('id-ID') === match[1],
    );
    if (monthIndex >= 0) return `${match[2]}-${String(monthIndex + 1).padStart(2, '0')}`;
  }
  return getMonthKey(report.created_at);
}

export default function LaporanProgres() {
  const [laporanProgresSiswa, setLaporanProgresSiswa] = useState([]);
  const [laporanBulanan, setLaporanBulanan] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      try {
        const [nilaiResponse, laporanResponse] = await Promise.all([
          api.get('/nilai/me'),
          api.get('/laporan/me'),
        ]);
        if (!active) return;

        const nilaiList = nilaiResponse.data.data.data;
        const laporanList = laporanResponse.data.data;
        const mappedGrades = nilaiList.map((nilai) => {
          const sesi = Array.isArray(nilai.sesi_pembelajaran)
            ? nilai.sesi_pembelajaran[0]
            : nilai.sesi_pembelajaran;
          const dateValue = sesi?.tanggal || nilai.created_at;

          return {
            id: nilai.id,
            tanggal: sesi?.tanggal
              ? new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date(`${sesi.tanggal}T00:00:00`))
              : '—',
            mapel: sesi?.mata_pelajaran || '—',
            materi: sesi?.materi || '—',
            nilaiSaya: nilai.nilai,
            rataRataKelas: nilai.rata_rata_kelas ?? '—',
            nilaiTertinggi: nilai.nilai_tertinggi ?? '—',
            nilaiTertinggiNama: Array.isArray(nilai.nilai_tertinggi_nama) ? nilai.nilai_tertinggi_nama : [],
            keterangan: nilai.keterangan || '—',
            tanggalSort: dateValue,
            monthKey: getMonthKey(dateValue),
          };
        }).sort((a, b) => new Date(b.tanggalSort) - new Date(a.tanggalSort));

        setLaporanProgresSiswa(mappedGrades);
        setLaporanBulanan(laporanList.map((report) => ({
          ...report,
          monthKey: getReportMonthKey(report),
        })));
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Gagal memuat laporan progres dari server.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProgress();
    return () => {
      active = false;
    };
  }, []);

  const monthOptions = useMemo(() => {
    const months = new Map();
    for (const grade of laporanProgresSiswa) {
      if (!grade.monthKey) continue;
      const month = months.get(grade.monthKey) || { monthKey: grade.monthKey, grades: [] };
      month.grades.push(grade);
      months.set(grade.monthKey, month);
    }
    for (const report of laporanBulanan) {
      if (!report.monthKey) continue;
      const month = months.get(report.monthKey) || { monthKey: report.monthKey, grades: [] };
      month.hasReport = true;
      months.set(report.monthKey, month);
    }

    return [...months.values()]
      .map((month) => {
        const [year, monthNumber] = month.monthKey.split('-').map(Number);
        const date = new Date(year, monthNumber - 1, 1);
        const average = month.grades.length
          ? Math.round(month.grades.reduce((sum, grade) => sum + Number(grade.nilaiSaya || 0), 0) / month.grades.length)
          : null;
        return {
          ...month,
          label: new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date),
          sortValue: year * 100 + monthNumber,
          average,
        };
      })
      .sort((first, second) => second.sortValue - first.sortValue);
  }, [laporanBulanan, laporanProgresSiswa]);

  const selectedGrades = selectedMonth
    ? laporanProgresSiswa.filter((grade) => grade.monthKey === selectedMonth)
    : [];
  const selectedPeriod = monthOptions.find((month) => month.monthKey === selectedMonth)?.label || '';
  const selectedReport = laporanBulanan.find((report) => report.monthKey === selectedMonth);
  const hasGeneratedReport = Boolean(
    String(selectedReport?.catatan_wali_kelas || '').trim()
    && String(selectedReport?.saran_pengembangan || '').trim(),
  );
  const catatanProgres = {
    deskripsi: selectedReport?.catatan_wali_kelas || 'Belum ada deskripsi progres.',
    saran: selectedReport?.saran_pengembangan || 'Belum ada saran pengembangan.',
  };

  function handleDownloadPdf() {
    window.print();
  }

  return (
    <DashboardLayout>
      <style>{`
        @media print {
          @page { size: landscape; margin: 12mm; }
          html, body, #root {
            width: auto !important;
            height: auto !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
            overflow: visible !important;
          }
          .monthly-report-print,
          .monthly-report-print * { visibility: visible !important; }
          .monthly-report-print {
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            color: #111827 !important;
            background: #fff !important;
          }
          .monthly-report-print table { width: 100% !important; }
          .monthly-report-print tr { break-inside: avoid; }
        }
      `}</style>
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Progres Belajar</h1>
          <p className="text-gray-500 mt-1">Visualisasikan pencapaian akademik Anda. Pantau perkembangan nilai, partisipasi kelas, dan dapatkan saran belajar.</p>
        </div>
        
        {/* Tombol Aksi */}
        {selectedMonth && (
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            {hasGeneratedReport && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm font-semibold shadow-sm"
              >
                <Download className="w-4 h-4" /> Unduh PDF
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Memuat data laporan...
        </div>
      ) : !selectedMonth ? (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Pilih Periode Laporan</h2>
            <p className="mt-1 text-sm text-gray-500">Pilih bulan untuk melihat nilai dan catatan progres belajar.</p>
          </div>
          {monthOptions.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Belum ada data nilai atau laporan progres.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {monthOptions.map((month) => (
                <button
                  key={month.monthKey}
                  type="button"
                  onClick={() => setSelectedMonth(month.monthKey)}
                  className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <BookOpen className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      {month.grades.length} nilai
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold capitalize text-gray-900">{month.label}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {month.average === null ? 'Belum ada nilai' : `Rata-rata nilai ${month.average}`}
                    {month.hasReport ? ' · Laporan tersedia' : ''}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
      <div className="monthly-report-print">
      <h2 className="mb-4 hidden text-xl font-bold text-gray-900 print:block">
        Laporan Progres Belajar - {selectedPeriod}
      </h2>
      <button
        type="button"
        onClick={() => setSelectedMonth(null)}
        className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50 print:hidden"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar bulan
      </button>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-t-2xl border border-gray-200 border-b-0 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FileText className="w-5 h-5 text-blue-600" />
          Riwayat Akademik {selectedPeriod}
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition">
            Semua Mapel <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white border border-gray-200 rounded-b-2xl overflow-hidden shadow-sm mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-200">Tanggal</th>
                <th className="p-4 font-semibold border-b border-gray-200">Sesi / Materi</th>
                <th className="p-4 font-semibold border-b border-gray-200 text-center">Nilai Saya</th>
                <th className="p-4 font-semibold border-b border-gray-200 text-center">Rata-rata Kelas</th>
                <th className="p-4 font-semibold border-b border-gray-200 text-center">Nilai Tertinggi</th>
                <th className="p-4 font-semibold border-b border-gray-200">Keterangan Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {selectedGrades.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{item.tanggal}</td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-gray-800">{item.mapel}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.materi}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${item.nilaiSaya >= 80 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.nilaiSaya}
                    </span>
                  </td>
                  <td className="p-4 text-center text-sm font-medium text-gray-600">{item.rataRataKelas}</td>
                  <td className="p-4 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="inline-block px-3 py-1 rounded-lg bg-orange-100 text-orange-700 font-bold text-sm">
                        {item.nilaiTertinggi}
                      </span>
                      {item.nilaiTertinggiNama.length > 0 && (
                        <span className="text-[10px] font-medium text-orange-700">
                          {item.nilaiTertinggiNama.join(', ')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600 italic max-w-xs">"{item.keterangan}"</td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedGrades.length === 0 && (
            <p className="p-6 text-center text-sm text-gray-500">Belum ada nilai pada periode ini.</p>
          )}
        </div>
      </div>

      {/* Area Catatan Bawah (Deskripsi & Saran) */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Kartu Deskripsi */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-800">Deskripsi Progress</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {catatanProgres.deskripsi}
          </p>
        </div>

        {/* Kartu Saran */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-800">Saran Pengembangan</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {catatanProgres.saran}
          </p>
        </div>

      </div>

      {/* Footer Note */}
      <div className="text-center mt-8 text-xs text-gray-400">
        Menampilkan data nilai dan catatan periode {selectedPeriod}. <br/>
        &copy; 2026 Bimbel Pilar Cendekia. Seluruh hak cipta dilindungi.
      </div>
      </div>
        </>
      )}

    </DashboardLayout>
  );
}