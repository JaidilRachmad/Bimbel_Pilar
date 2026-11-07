import { Printer, Download, ArrowLeft, X } from 'lucide-react';
import logoPilar from '../assets/logo.png';

export default function EKwitansi({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-50 overflow-y-auto print:bg-white print:static">
      
      {/* Container Utama */}
      <div className="max-w-4xl mx-auto py-8 px-4 md:px-0 print:p-0">
        
        {/* HEADER ATAS (Navigasi & Tombol) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 print:hidden">
          <button onClick={onClose} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700 font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Tagihan
          </button>
        </div>

        {/* JUDUL HALAMAN */}
        <h1 className="text-2xl font-bold text-[#1E3A8A] mb-4 print:hidden">Rincian Kwitansi Digital</h1>

        {/* KERTAS KWITANSI */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-200 overflow-hidden print:border-none print:shadow-none">
          
          {/* HEADER BIRU */}
          <div className="bg-[#1E3A8A] text-white px-8 py-6">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center">
                <img src={logoPilar} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-wide">BIMBEL PILAR CENDEKIA</h2>
                <p className="text-[13px] text-blue-100 mt-1">Dukuh MJ I / 1403 Gedongkiwo Mantrijeron RT/RW 73/15<br/>Kota Yogyakarta 55142</p>
                <p className="text-[13px] text-blue-100 mt-1 font-medium">No. WA : 0895-3773-67903 || PilarCendekia.com</p>
              </div>
            </div>
            
            <div className="border-t border-blue-800/50 pt-4 text-center">
              <h3 className="text-white font-bold tracking-widest text-[15px]">E-KWITANSI BIMBEL PILAR CENDEKIA YOGYAKARTA</h3>
            </div>
          </div>

          {/* BODY KWITANSI */}
          <div className="p-8">
            
            {/* Info Siswa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-8 text-sm">
              <div className="flex">
                <span className="w-28 text-gray-500">Nama Siswa</span>
                <span className="font-semibold text-gray-900">: {data.nama || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-gray-500">Kelas</span>
                <span className="font-semibold text-gray-900">: {data.kelas || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-gray-500">Nama Wali</span>
                <span className="font-semibold text-gray-900">: {data.nama_wali || 'Bapak/Ibu Wali'}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-gray-500">Periode</span>
                <span className="font-semibold text-gray-900">: {data.bulan_mulai} {data.tahun_mulai} - Pendaftaran {data.tahun_mulai ? (data.tahun_mulai + 1).toString().slice(-2) : ''}/{data.tahun_mulai ? (data.tahun_mulai + 2).toString().slice(-2) : ''}</span>
              </div>
            </div>

            {/* Tabel Rincian */}
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-[#1E3A8A] text-xs">Jenis Pembayaran</th>
                    <th className="px-4 py-3 font-bold text-[#1E3A8A] text-xs text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 text-gray-700">SPP {data.bulan_mulai} {data.tahun_mulai}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatRupiah(data.nominal || data.total_pembayaran)}</td>
                  </tr>
                  {data.pendaftaran && (
                    <tr>
                      <td className="px-4 py-3 text-gray-700">Pendaftaran T/A {data.tahun_mulai}/{data.tahun_mulai + 1} (Naik Kelas)</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatRupiah(data.pendaftaran)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-200">
                    <td className="px-4 py-4 font-bold text-[#1E3A8A] text-right text-sm">Total Terbayar</td>
                    <td className="px-4 py-4 font-bold text-[#1E3A8A] text-right text-sm">
                      {formatRupiah((data.nominal || data.total_pembayaran) + (data.pendaftaran || 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Metode & Tanggal */}
            <div className="space-y-2 mb-8 text-sm">
              <div className="flex">
                <span className="w-44 text-gray-500">Metode Pembayaran</span>
                <span className="font-semibold text-gray-900">: {data.metode_pembayaran || 'Transfer/QRIS/Cash'}</span>
              </div>
              <div className="flex">
                <span className="w-44 text-gray-500">Tanggal Pembayaran</span>
                <span className="font-semibold text-gray-900">: {data.tanggal_pembayaran || '-'}</span>
              </div>
            </div>

            {/* Footer Text */}
            <div className="text-center border-t border-gray-100 pt-6">
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-2xl mx-auto mb-4">
                Terima kasih atas kepercayaan Ayah/Bunda kepada kami, dan pembayaran yang telah diselesaikan. Semoga ilmu yang diperoleh di Bimbel Pilar Cendekia Yogyakarta membawa manfaat dan mendorong prestasi putra/putri tercinta.
              </p>
              
              <div className="inline-block bg-[#F5A623] text-[#1E3A8A] font-bold px-6 py-2 rounded text-xs shadow-sm mb-4">
                "PENDIDIKAN ADALAH INVESTASI JANGKA PANJANG TERBAIK"
              </div>
              
              <p className="text-[#1E3A8A] font-bold text-sm">pilarcendekia.com</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}