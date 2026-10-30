import { useState } from 'react';
import TentorLayout from '../../layouts/TentorLayout';
import { sesiTentor, dummySiswaTentor } from '../../data/dummy';
import { 
  Plus, Calendar, Clock, Edit, Trash2, 
  FileText, X, Save, User
} from 'lucide-react';

export default function DashboardTentor() {
  const [isModalSesiOpen, setIsModalSesiOpen] = useState(false);
  const [isModalNilaiOpen, setIsModalNilaiOpen] = useState(false);

  return (
    <TentorLayout>
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beranda Guru</h1>
          <p className="text-gray-500 mt-1">Selamat datang kembali, mari kelola sesi dan materi hari ini.</p>
        </div>
        <button 
          onClick={() => setIsModalSesiOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white rounded-xl hover:bg-blue-900 transition text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Sesi Baru
        </button>
      </div>

      <div className="flex justify-between items-end mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" /> Sesi Mendatang
        </h2>
        <a href="#" className="text-sm text-blue-600 font-semibold hover:underline">Lihat Kalender</a>
      </div>

      {/* Grid Kartu Sesi */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sesiTentor.map((sesi) => (
          <div key={sesi.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col h-full">
            {/* Header Card */}
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${sesi.warnaTipe}`}>
                {sesi.tipe}
              </span>
              <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {sesi.durasi}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-gray-900 text-lg mb-1">{sesi.kelas}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">Topik: {sesi.topik}</p>

            {/* Waktu */}
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 p-2.5 rounded-lg mb-4">
              <Clock className="w-4 h-4 text-blue-600" /> {sesi.waktu}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-auto">
              <button 
                onClick={() => setIsModalNilaiOpen(true)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition text-center"
              >
                Input Nilai
              </button>
              <button className="flex items-center justify-center w-10 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Lihat Materi">
                <FileText className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center w-10 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Hapus Sesi">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL: TAMBAH SESI BARU ================= */}
      {isModalSesiOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#1E3A8A] p-5 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2"><Plus className="w-5 h-5"/> Tambah Sesi Pembelajaran Baru</h3>
              <button onClick={() => setIsModalSesiOpen(false)} className="hover:bg-white/20 p-1 rounded transition"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
                  <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Kelas 6A - Matematika</option>
                    <option>Kelas 5C - Fisika</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                  <input type="text" placeholder="Contoh: Matematika" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topik Pembahasan</label>
                <input type="text" placeholder="Masukkan topik detail sesi hari ini" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Ruang</label>
                  <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Virtual (Zoom/Meet)</option>
                    <option>Tatap Muka</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                  <input type="time" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                  <input type="time" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran Materi (PDF/Gambar)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                  <p className="text-sm text-gray-500">Pilih file atau seret ke sini</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setIsModalSesiOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition">Batal</button>
              <button onClick={() => setIsModalSesiOpen(false)} className="px-5 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition flex items-center gap-2">
                <Save className="w-4 h-4" /> Simpan Sesi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: INPUT NILAI ================= */}
      {isModalNilaiOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Input Nilai & Laporan</h3>
                <p className="text-sm text-gray-500">Sesi: Matematika (Aljabar Linear)</p>
              </div>
              <button onClick={() => setIsModalNilaiOpen(false)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <tr>
                      <th className="p-3 border-b font-semibold">Nama Siswa</th>
                      <th className="p-3 border-b font-semibold w-24">Nilai</th>
                      <th className="p-3 border-b font-semibold">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dummySiswaTentor.map((siswa) => (
                      <tr key={siswa.id}>
                        <td className="p-3 text-sm font-medium text-gray-800">{siswa.nama}</td>
                        <td className="p-3">
                          <input type="number" placeholder="80" className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </td>
                        <td className="p-3">
                          <input type="text" placeholder="Catatan..." className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setIsModalNilaiOpen(false)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition">Batal</button>
              <button onClick={() => setIsModalNilaiOpen(false)} className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition">Simpan Nilai</button>
            </div>
          </div>
        </div>
      )}

    </TentorLayout>
  );
}