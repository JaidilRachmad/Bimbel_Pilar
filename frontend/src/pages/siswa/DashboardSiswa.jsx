import DashboardLayout from '../../layouts/DashboardLayout';
import { userSiswa, mataPelajaran } from '../../data/dummy';
import { PlayCircle, ChevronRight, BookOpen } from 'lucide-react';

export default function DashboardSiswa() {
  return (
    <DashboardLayout>
      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Halo, {userSiswa.nama_lengkap} 👋</h1>
        <p className="text-slate-500 mt-1">Selamat datang kembali! Terus semangat belajarnya.</p>
      </div>

      {/* Banner Sesi Belajar Terdekat (Live Class) */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] rounded-2xl p-6 text-white flex justify-between items-center mb-8 shadow-lg">
        <div>
          <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block">LIVE NOW</span>
          <h2 className="text-xl font-bold mb-1">Matematika - Bangun Ruang</h2>
          <p className="text-blue-100 text-sm mb-4">Hari ini, 14:00 - 15:30 • Bpk. Bambang S.Pd</p>
          <button className="bg-white text-[#1E3A8A] px-5 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 transition flex items-center gap-2">
            <PlayCircle className="w-4 h-4" /> Masuk Ruang Kelas
          </button>
        </div>
        <div className="hidden md:block opacity-20">
          <BookOpen className="w-32 h-32" />
        </div>
      </div>

      {/* Section Materi Belajar */}
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#3B82F6]" /> Materi Belajar
        </h2>
        <a href="#" className="text-sm text-[#3B82F6] font-semibold hover:underline">Lihat Semua</a>
      </div>

      {/* Grid Mata Pelajaran */}
      <div className="grid md:grid-cols-3 gap-6">
        {mataPelajaran.map((mapel) => (
          <div key={mapel.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition">
            {/* Header Card */}
            <div className="flex justify-between items-center mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${mapel.warna}`}>
                {mapel.kode}
              </div>
              <span className="text-xs font-semibold text-slate-400">{mapel.totalMateri} Materi</span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-800 mb-1">{mapel.nama}</h3>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="font-bold text-slate-700">{mapel.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-[#3B82F6] h-2 rounded-full" style={{ width: `${mapel.progress}%` }}></div>
              </div>
            </div>

            {/* List Materi */}
            <div className="space-y-2">
              {mapel.listMateri.map((materi, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm text-slate-600">
                  <span>{materi}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}