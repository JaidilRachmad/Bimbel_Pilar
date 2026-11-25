import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import EKwitansi from '../../components/EKwitansi';
import FloatingWhatsApp from '../../components/FloatingWhatsapp';
import { 
  CheckCircle2, XCircle,
  FileText, Loader2, AlertCircle, CalendarDays, ChevronDown
} from 'lucide-react';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const formatBulan = (bulan, tahun) => `${MONTHS[Number(bulan) - 1] || '-'} ${tahun || ''}`;

const formatTanggal = (value) => {
  if (!value || value === '-') return '-';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const getPeriodeKey = (item) =>
  `${item.tahun}-${String(item.bulan).padStart(2, '0')}`;

const getPeriodeLabel = (key) => {
  const [tahun, bulan] = key.split('-');
  return formatBulan(Number(bulan), tahun);
};

export default function TagihanSpp() {
  const [tagihanSiswa, setTagihanSiswa] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('terdekat');
  const [selectedPeriod, setSelectedPeriod] = useState('semua');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchMySpp = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tagihan-spp/me');
      const rawData = response.data;
      const fetchedItems = rawData?.data?.data || rawData?.data || rawData || [];
      
      const mappedData = fetchedItems.map((item) => {
        let metodeTersimpan = 'Transfer';
        let tanggalTersimpan = '-';

        if (item.invoice_pembayaran) {
          const invoice = Array.isArray(item.invoice_pembayaran) 
            ? item.invoice_pembayaran[0] 
            : item.invoice_pembayaran;

          if (invoice) {
            metodeTersimpan = invoice.metode_pembayaran || 'Transfer';
            tanggalTersimpan = invoice.tanggal_pembayaran || '-';
          }
        }

        return {
          ...item,
          metode_pembayaran: metodeTersimpan,
          tanggal_pembayaran: tanggalTersimpan,
          kelas_name: item.siswa_profile?.kelas_siswa?.[0]?.kelas?.nama_kelas || '-'
        };
      });

      // Urutkan berdasarkan tahun dan bulan terbaru
      mappedData.sort((a, b) => {
        if (a.tahun !== b.tahun) return b.tahun - a.tahun;
        return b.bulan - a.bulan;
      });

      setTagihanSiswa(mappedData);
      setError('');
      // setSelectedPeriod((currentPeriod) =>
      //   currentPeriod ||
      //   (mappedData.length > 0 ? getPeriodeKey(mappedData[0]) : '')
      // );
      setSelectedPeriod((currentPeriod) => currentPeriod || 'semua');
    } catch (error) {
      console.error("Gagal mengambil data SPP:", error);
      setTagihanSiswa([]);
      setError(error.response?.data?.message || 'Gagal memuat data tagihan SPP.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySpp();
  }, []);

  const paketSiswa =
    tagihanSiswa.find((spp) =>
      spp.paket ||
      spp.siswa_profile?.kelas_siswa?.[0]?.paket
    )?.paket ||
    tagihanSiswa.find((spp) => spp.siswa_profile?.kelas_siswa?.[0]?.paket)
      ?.siswa_profile?.kelas_siswa?.[0]?.paket ||
    '';
  const paketTahunanTerdeteksi =
    paketSiswa === 'Tahunan' ||
    (
      tagihanSiswa.length > 0 &&
      tagihanSiswa.every((spp) => spp.status === 'Lunas') &&
      tagihanSiswa.some((spp) => spp.invoice_pembayaran)
    );
  const tagihanBelumBayar = tagihanSiswa
    .filter((spp) => spp.status === 'Belum Bayar')
    .sort((a, b) => {
      const dateA = new Date(`${a.tanggal_jatuh_tempo || '9999-12-31'}T00:00:00`).getTime();
      const dateB = new Date(`${b.tanggal_jatuh_tempo || '9999-12-31'}T00:00:00`).getTime();
      return dateA - dateB;
    });
  const riwayatPembayaran = tagihanSiswa.filter((spp) => spp.status === 'Lunas');
  const today = new Date();
  const periodeBulanIni =
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const tagihanBulanIni = tagihanSiswa.find(
    (spp) => getPeriodeKey(spp) === periodeBulanIni,
  ) || null;
  const tagihanTerdekat = tagihanBulanIni || tagihanBelumBayar[0] || null;
  const periodeOptions = [...new Set(tagihanSiswa.map(getPeriodeKey))]
    .sort((a, b) => b.localeCompare(a));
  // const tagihanPeriode = tagihanSiswa.filter(
  //   (spp) => getPeriodeKey(spp) === selectedPeriod,
  // );
  const tagihanPeriode = tagihanSiswa.filter(
  (spp) =>
    selectedPeriod === 'semua' ||
    getPeriodeKey(spp) === selectedPeriod,
);

  useEffect(() => {
    if (paketTahunanTerdeteksi) {
      setActiveTab('lunas');
    } else {
      setActiveTab('terdekat');
    }
  }, [paketTahunanTerdeteksi]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header Halaman */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tagihan & Riwayat SPP</h1>
        <p className="text-gray-500 mt-1">Pantau status pembayaran dan unduh kuitansi digital Anda.</p>
      </div>

      {error && (
        <div role="alert" className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50/70 px-4 pt-3 sm:px-6">
          <div className="flex gap-5 overflow-x-auto">
            {[
              !paketTahunanTerdeteksi
                ? { key: 'terdekat', label: 'Tagihan Bulan Ini', count: tagihanBelumBayar.length }
                : null,
              !paketTahunanTerdeteksi
                ? { key: 'periode', label: 'Tagihan Satu Periode', count: periodeOptions.length }
                : null,
              { key: 'lunas', label: 'Lunas', count: riwayatPembayaran.length },
            ].filter(Boolean).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 pt-1 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'terdekat' && (
          <div className="p-5 sm:p-6">
            {tagihanTerdekat ? (
              <div className={`grid gap-5 rounded-xl border p-5 md:grid-cols-[1fr_auto] md:items-center ${
                tagihanTerdekat.status === 'Lunas'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50/40'
              }`}>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Periode</p>
                    <p className="mt-1 font-bold text-gray-900">
                      {formatBulan(tagihanTerdekat.bulan, tagihanTerdekat.tahun)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Nominal</p>
                    <p className={`mt-1 text-lg font-bold ${
                      tagihanTerdekat.status === 'Lunas' ? 'text-green-700' : 'text-red-600'
                    }`}>
                      Rp {(tagihanTerdekat.nominal || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {tagihanTerdekat.status === 'Lunas' ? 'Tanggal Bayar' : 'Jatuh Tempo'}
                    </p>
                    <p className="mt-1 font-semibold text-gray-700">
                      {tagihanTerdekat.status === 'Lunas'
                        ? formatTanggal(tagihanTerdekat.tanggal_pembayaran)
                        : formatTanggal(tagihanTerdekat.tanggal_jatuh_tempo)}
                    </p>
                  </div>
                </div>
                {tagihanTerdekat.status === 'Lunas' ? (
                  <div className="inline-flex max-w-xs items-start gap-2 rounded-lg px-3 py-2 text-xs leading-relaxed text-white-700 md:text-right">
                    <span>
                      Tagihan bulan ini sudah lunas. Silakan buka pilihan Lunas untuk download E-Kwitansi.
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center justify-center gap-1 rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700">
                    <XCircle className="h-3.5 w-3.5" /> Belum Bayar
                  </span>
                )}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-500">
                <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-green-500" />
                <p className="font-semibold text-gray-700">Tidak ada tagihan yang belum dibayar.</p>
                <p className="mt-1 text-xs">Semua tagihan SPP sudah lunas.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'periode' && (
          <div>
            <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="flex items-center gap-2 font-bold text-gray-800">
                <CalendarDays className="h-5 w-5 text-blue-700" /> Pilih periode
              </h3>
              {periodeOptions.length > 0 && (
                <div className="relative">
                  {/* <select
                    value={selectedPeriod}
                    onChange={(event) => setSelectedPeriod(event.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {periodeOptions.map((period) => (
                      <option key={period} value={period}>
                        {getPeriodeLabel(period)}
                      </option>
                    ))}
                  </select> */}
                  <select
                    value={selectedPeriod}
                    onChange={(event) => setSelectedPeriod(event.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="semua">Semua Bulan</option>

                    {periodeOptions.map((period) => (
                      <option key={period} value={period}>
                        {getPeriodeLabel(period)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-white text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-semibold">Periode</th>
                    <th className="p-4 font-semibold">Nominal</th>
                    <th className="p-4 font-semibold">Tanggal</th>
                    <th className="p-4 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tagihanPeriode.length > 0 ? tagihanPeriode.map((item) => (
                    <tr key={item.id} className="transition hover:bg-gray-50">
                      <td className="p-4 text-sm font-bold text-gray-800">
                        {formatBulan(item.bulan, item.tahun)}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        Rp {(item.nominal || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {item.status === 'Lunas'
                          ? formatTanggal(item.tanggal_pembayaran)
                          : formatTanggal(item.tanggal_jatuh_tempo)}
                      </td>
                      <td className="p-4 text-center">
                        {item.status === 'Lunas' ? (
                          <button
                            onClick={() => setSelectedInvoice(item)}
                            className="mx-auto flex items-center justify-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-[#1E3A8A] transition hover:bg-blue-100"
                          >
                            <FileText className="h-4 w-4" /> E-Kwitansi
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                            <XCircle className="h-3.5 w-3.5" /> Belum Bayar
                          </span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500">
                        Belum ada tagihan pada periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'lunas' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-white text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Periode</th>
                  <th className="p-4 font-semibold">Nominal</th>
                  <th className="p-4 font-semibold">Tanggal Bayar</th>
                  <th className="p-4 font-semibold">Metode</th>
                  <th className="p-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {riwayatPembayaran.length > 0 ? riwayatPembayaran.map((item) => (
                  <tr key={item.id} className="transition hover:bg-gray-50">
                    <td className="p-4 text-sm font-bold text-gray-800">
                      {formatBulan(item.bulan, item.tahun)}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      Rp {(item.nominal || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatTanggal(item.tanggal_pembayaran)}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {item.metode_pembayaran || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedInvoice(item)}
                        className="mx-auto flex items-center justify-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-[#1E3A8A] transition hover:bg-blue-100"
                      >
                        <FileText className="h-4 w-4" /> E-Kwitansi
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      Belum ada riwayat pembayaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-center mt-8 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Bimbel Pilar Cendekia. Seluruh hak cipta dilindungi.
      </div>

      {/* ================= KOMPONEN E-KWITANSI ================= */}
      <EKwitansi 
        isOpen={!!selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
        data={selectedInvoice ? {
          ...selectedInvoice,
          nama: selectedInvoice.siswa_profile?.nama || 'Siswa',
          nama_wali: selectedInvoice.siswa_profile?.nama_wali || 'Bapak/Ibu Wali',
          kelas: selectedInvoice.kelas_name || 'Kelas X',
          metode_pembayaran: selectedInvoice.metode_pembayaran,
          tanggal_pembayaran: selectedInvoice.tanggal_pembayaran
        } : null} 
      />
      <FloatingWhatsApp />
    </DashboardLayout>
  );
}