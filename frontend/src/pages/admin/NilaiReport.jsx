import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { detailNilaiSiswa, dummyCatatanWali } from '../../data/dummy';
import { 
  Download, Sparkles, Edit3, Save, ArrowLeft, 
  User, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NilaiReport() {
  const [isEditing, setIsEditing] = useState(false);
  const [catatan, setCatatan] = useState(dummyCatatanWali.catatan);

  const handleGenerateAI = () => {
    // Simulasi loading AI
    alert("Menghubungi AI untuk membuat analisis... (Simulasi UI)");
    setCatatan("AI sedang menganalisis data nilai... (Teks ini akan digantikan oleh hasil dari API Backend nanti).");
  };

  return (
    <AdminLayout>
      {/* Tombol Back ke Daftar Kelas */}
      <Link to="/admin/kelas" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kelas
      </Link>

      {/* Header Profil Siswa */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dummyCatatanWali.nama}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> {dummyCatatanWali.kelas}</span>
              <span>•</span>
              <span>Laporan: {dummyCatatanWali.periode}</span>
            </div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white rounded-xl hover:bg-blue-900 transition text-sm font-semibold shadow-sm">
          <Download className="w-4 h-4" /> Unduh Report
        </button>
      </div>

      {/* Tabel Detail Pertemuan & Nilai */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 text-lg font-bold text-gray-800">
          <CheckCircle2 className="w-5 h-5 text-blue-600" /> Detail Pertemuan & Nilai
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-200 text-center">Pert.</th>
                <th className="p-4 font-semibold border-b border-gray-200">Tanggal</th>
                <th className="p-4 font-semibold border-b border-gray-200">Mata Pelajaran</th>
                <th className="p-4 font-semibold border-b border-gray-200">Materi Pokok</th>
                <th className="p-4 font-semibold border-b border-gray-200 text-center">Nilai</th>
                <th className="p-4 font-semibold border-b border-gray-200 text-center">Status</th>
                <th className="p-4 font-semibold border-b border-gray-200">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {detailNilaiSiswa.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-center text-sm font-bold text-gray-500">{item.pertemuan}</td>
                  <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{item.tanggal}</td>
                  <td className="p-4 text-sm font-bold text-gray-800">{item.mapel}</td>
                  <td className="p-4 text-sm text-gray-600">{item.materi}</td>
                  <td className="p-4 text-center">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm">
                      {item.nilai}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      item.status === 'Lengkap' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 italic">"{item.catatan}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Area Catatan Wali Kelas & Generate AI */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-gray-500" /> Catatan Wali Kelas
          </h3>
          <button 
            onClick={handleGenerateAI}
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition text-sm font-bold shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> Generate Analisis AI
          </button>
        </div>
        
        <div className="relative">
          <textarea 
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            readOnly={!isEditing}
            rows="4"
            className={`w-full p-4 border rounded-xl text-sm leading-relaxed outline-none transition-all ${
              isEditing 
                ? 'bg-white border-blue-400 focus:ring-2 focus:ring-blue-500 text-gray-800' 
                : 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed'
            }`}
          ></textarea>
          
          {/* Tombol Aksi Text Area */}
          <div className="flex gap-2 mt-3">
            {isEditing ? (
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center justify-center gap-2 flex-1 bg-[#1E3A8A] text-white py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition text-sm"
              >
                <Save className="w-4 h-4" /> Simpan Catatan
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition text-sm"
              >
                <Edit3 className="w-4 h-4" /> Edit Catatan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-8 text-xs text-gray-400">
        &copy; 2026 Pilar Cendekia Education Management System. All Rights Reserved.
      </div>
    </AdminLayout>
  );
}