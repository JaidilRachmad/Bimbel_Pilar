import DashboardLayout from '../../layouts/DashboardLayout';
import { ringkasanSpp, tagihanAktif, riwayatSpp } from '../../data/dummy';
import { 
  Printer, CreditCard, Building2, AlertCircle, 
  CheckCircle2, Download, ChevronRight 
} from 'lucide-react';

export default function TagihanSpp() {
  return (
    <DashboardLayout>
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tagihan & Riwayat SPP</h1>
          <p className="text-gray-500 mt-1">Kelola pembayaran bulanan dan pantau riwayat administrasi belajar Anda.</p>
        </div>
        
        {/* Tombol Aksi */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-500 rounded-xl hover:bg-gray-50 transition text-sm font-semibold shadow-sm opacity-70 cursor-not-allowed" disabled>
            <Printer className="w-4 h-4" /> Cetak Kuitansi
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white rounded-xl hover:bg-blue-900 transition text-sm font-semibold shadow-sm">
            <CreditCard className="w-4 h-4" /> Bayar Admin
          </button>
        </div>
      </div>

      {/* Grid Layout: Kiri (Ringkasan) & Kanan (Tagihan Aktif) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Kolom Kiri: Ringkasan & Info Bank */}
        <div className="space-y-6">
          {/* Card Ringkasan */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Ringkasan</h3>
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">
                {ringkasanSpp.statusAkun}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Total Dibayar</p>
                <p className="text-lg font-bold text-green-600">{ringkasanSpp.totalDibayar}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Tunggakan</p>
                <p className="text-lg font-bold text-red-600">{ringkasanSpp.tunggakan}</p>
              </div>
            </div>
          </div>

          {/* Card Informasi Pembayaran */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-500" /> Informasi Pembayaran
            </h3>
            <p className="text-xs text-gray-500 mb-3">Lakukan transfer ke rekening resmi berikut:</p>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4 flex items-center gap-4">
              <div className="w-12 h-8 bg-blue-800 rounded text-white flex items-center justify-center font-bold text-xs">BNI</div>
              <div>
                <p className="text-sm font-bold text-gray-800">123456789</p>
                <p className="text-xs text-gray-500">a.n. Bimbel Pilar Cendekia</p>
              </div>
            </div>
            
            <p className="text-[11px] text-gray-500 leading-relaxed italic">
              *Konfirmasi otomatis dalam 10-15 menit setelah transfer (pada jam kerja).
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Tagihan Aktif */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
            {/* Header Tagihan */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
                  BELUM BAYAR
                </span>
                <h2 className="text-xl font-bold text-gray-900">SPP {tagihanAktif.bulan}</h2>
                <p className="text-sm text-gray-500 mt-1">Jatuh tempo: {tagihanAktif.jatuhTempo}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>

            {/* Nominal */}
            <div className="p-6 flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">Nominal Tagihan</p>
              <p className="text-4xl font-bold text-gray-900">
                Rp {tagihanAktif.nominal.toLocaleString('id-ID')}
              </p>
              
              {/* Warning Box */}
              <div className="mt-6 bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800 leading-relaxed">
                  Segera lunasi pembayaran sebelum tanggal <strong>10</strong> agar akses portal belajar tetap aktif tanpa kendala.
                </p>
              </div>
            </div>

            {/* Footer Tombol */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold text-sm">
                Invoice
              </button>
              <button className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-xl hover:bg-blue-900 transition font-semibold text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Bayar Sekarang
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Tabel Riwayat Pembayaran */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Riwayat Pembayaran</h3>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 bg-gray-50">
            <option>Tahun 2026</option>
            <option>Tahun 2025</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-200">Bulan Tagihan</th>
                <th className="p-4 font-semibold border-b border-gray-200">Nominal</th>
                <th className="p-4 font-semibold border-b border-gray-200">Tanggal Bayar</th>
                <th className="p-4 font-semibold border-b border-gray-200 text-center">Status</th>
                <th className="p-4 font-semibold border-b border-gray-200 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {riwayatSpp.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-sm font-bold text-gray-800">{item.bulan}</td>
                  <td className="p-4 text-sm text-gray-600">{item.nominal}</td>
                  <td className="p-4 text-sm text-gray-600">{item.tanggalBayar}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-3 h-3" /> {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center justify-center gap-1 mx-auto">
                      <Download className="w-4 h-4" /> Kuitansi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 text-center">
          <button className="text-sm font-semibold text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1 mx-auto transition">
            Lihat Semua Riwayat <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-8 text-xs text-gray-400">
        &copy; 2026 Bimbel Pilar Cendekia. Seluruh hak cipta dilindungi.
      </div>

    </DashboardLayout>
  );
}