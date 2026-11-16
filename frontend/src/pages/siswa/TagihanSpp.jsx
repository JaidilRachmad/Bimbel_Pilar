import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import EKwitansi from '../../components/EKwitansi';
import { 
  CheckCircle2, XCircle, 
  FileText, Loader2, AlertCircle
} from 'lucide-react';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const formatBulan = (bulan, tahun) => `${MONTHS[Number(bulan) - 1] || '-'} ${tahun || ''}`;

export default function TagihanSpp() {
  const [tagihanSiswa, setTagihanSiswa] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    } catch (error) {
      console.error("Gagal mengambil data SPP:", error);
      // Fallback dummy data untuk testing UI
      setTagihanSiswa([
        { id: 1, bulan: 11, tahun: 2026, nominal: 350000, status: "Belum Bayar", tanggal_jatuh_tempo: "2026-11-10", kelas_name: "9 Intensif", siswa_profile: { nama: "Siswa Test" } },
        { id: 2, bulan: 10, tahun: 2026, nominal: 350000, status: "Lunas", metode_pembayaran: "Cash", tanggal_pembayaran: "2026-10-05", kelas_name: "9 Intensif", siswa_profile: { nama: "Siswa Test" } },
        { id: 3, bulan: 9, tahun: 2026, nominal: 350000, status: "Lunas", metode_pembayaran: "Transfer", tanggal_pembayaran: "2026-09-08", kelas_name: "9 Intensif", siswa_profile: { nama: "Siswa Test" } }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySpp();
  }, []);

  // Memisahkan data untuk 2 tabel
  const tagihanBelumBayar = tagihanSiswa.filter(spp => spp.status === 'Belum Bayar');
  const riwayatPembayaran = tagihanSiswa.filter(spp => spp.status === 'Lunas');

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

      <div className="space-y-6">
        
        {/* --- TABEL 1: TUNGGAKAN (BELUM BAYAR) --- */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
            <h3 className="font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Tagihan Belum Dibayar
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-semibold">Bulan Tagihan</th>
                  <th className="p-4 font-semibold">Nominal</th>
                  <th className="p-4 font-semibold">Jatuh Tempo</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tagihanBelumBayar.length > 0 ? (
                  tagihanBelumBayar.map((item) => (
                    <tr key={item.id} className="hover:bg-red-50/30 transition">
                      <td className="p-4 text-sm font-bold text-gray-800">
                        {formatBulan(item.bulan, item.tahun)}
                      </td>
                      <td className="p-4 text-sm font-bold text-red-600">
                        Rp {(item.nominal || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {item.tanggal_jatuh_tempo || '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Belum Bayar
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                        <p className="font-semibold text-gray-700">Semua tagihan sudah lunas!</p>
                        <p className="text-xs">Terima kasih telah melakukan pembayaran tepat waktu.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- TABEL 2: RIWAYAT PEMBAYARAN (LUNAS) --- */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" /> Riwayat Pembayaran
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-semibold">Bulan Tagihan</th>
                  <th className="p-4 font-semibold">Nominal</th>
                  <th className="p-4 font-semibold">Tgl Bayar</th>
                  <th className="p-4 font-semibold">Metode</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {riwayatPembayaran.length > 0 ? (
                  riwayatPembayaran.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 text-sm font-bold text-gray-800">
                        {formatBulan(item.bulan, item.tahun)}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        Rp {(item.nominal || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {item.tanggal_pembayaran}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {item.metode_pembayaran}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => setSelectedInvoice(item)}
                          className="text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-1 mx-auto transition"
                        >
                          <FileText className="w-4 h-4" /> E-Kwitansi
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      Belum ada riwayat pembayaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
    </DashboardLayout>
  );
}