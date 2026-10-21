import DashboardLayout from '../../layouts/DashboardLayout';
import { laporanProgresSiswa, catatanProgres } from '../../data/dummy';
import { Download, Share2, FileText, TrendingUp, MessageSquare, ChevronDown } from 'lucide-react';

export default function LaporanProgres() {
  return (
    <DashboardLayout>
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Progres Belajar</h1>
          <p className="text-gray-500 mt-1">Visualisasikan pencapaian akademik Anda. Pantau perkembangan nilai, partisipasi kelas, dan dapatkan saran belajar.</p>
        </div>
        
        {/* Tombol Aksi */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm font-semibold shadow-sm">
            <Download className="w-4 h-4" /> Unduh PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white rounded-xl hover:bg-blue-900 transition text-sm font-semibold shadow-sm">
            <Share2 className="w-4 h-4" /> Bagikan ke Orang Tua
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-t-2xl border border-gray-200 border-b-0 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FileText className="w-5 h-5 text-blue-600" />
          Riwayat Akademik April 2026
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
              {laporanProgresSiswa.map((item) => (
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
                    <span className="inline-block px-3 py-1 rounded-lg bg-orange-100 text-orange-700 font-bold text-sm">
                      {item.nilaiTertinggi}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 italic max-w-xs">"{item.keterangan}"</td>
                </tr>
              ))}
            </tbody>
          </table>
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
        Menampilkan data perkembangan belajar bulan April 2026. <br/>
        &copy; 2026 Bimbel Pilar Cendekia. Seluruh hak cipta dilindungi.
      </div>

    </DashboardLayout>
  );
}