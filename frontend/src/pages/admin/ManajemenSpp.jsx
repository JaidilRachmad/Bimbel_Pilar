import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { dummySppAdmin, dummySiswaDropdown } from '../../data/dummy';
import { 
  PlusCircle, Search, FileText, CheckCircle2, XCircle, 
  Edit, Trash2, Printer, Filter
} from 'lucide-react';

export default function ManajemenSpp() {
  const [formData, setFormData] = useState({
    siswa: '',
    bulan: 'Mei 2026',
    nominal: '350000',
    status: 'Belum Bayar'
  });

  const handleSimpan = (e) => {
    e.preventDefault();
    alert(`Simulasi: Tagihan untuk ${formData.siswa} bulan ${formData.bulan} berhasil disimpan!`);
  };

  return (
    <AdminLayout>
      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen SPP</h1>
        <p className="text-gray-500 mt-1">Kelola tagihan bulanan dan pantau status pembayaran siswa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= KOLOM KIRI: FORM TAMBAH TAGIHAN ================= */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
              <PlusCircle className="w-5 h-5 text-blue-600" /> Buat / Update Tagihan
            </h2>

            <form onSubmit={handleSimpan} className="space-y-4">
              {/* Pilih Siswa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Siswa</label>
                <select 
                  required
                  value={formData.siswa}
                  onChange={(e) => setFormData({...formData, siswa: e.target.value})}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {dummySiswaDropdown.map(siswa => (
                    <option key={siswa.id} value={siswa.nama}>{siswa.nama}</option>
                  ))}
                </select>
              </div>

              {/* Bulan Tagihan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bulan Tagihan</label>
                <input 
                  type="text" 
                  required
                  value={formData.bulan}
                  onChange={(e) => setFormData({...formData, bulan: e.target.value})}
                  placeholder="Contoh: Mei 2026"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nominal (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={formData.nominal}
                  onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                  placeholder="350000"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Pembayaran</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="Belum Bayar">Belum Bayar</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full bg-[#1E3A8A] text-white py-2.5 rounded-xl font-semibold hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow-sm text-sm"
                >
                  <FileText className="w-4 h-4" /> Simpan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ================= KOLOM KANAN: TABEL DAFTAR TAGIHAN ================= */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
            
            {/* Toolbar Tabel */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-gray-800">Daftar Tagihan & Pembayaran</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama siswa..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-gray-200">Siswa</th>
                    <th className="p-4 font-semibold border-b border-gray-200">Bulan</th>
                    <th className="p-4 font-semibold border-b border-gray-200">Nominal</th>
                    <th className="p-4 font-semibold border-b border-gray-200 text-center">Status</th>
                    <th className="p-4 font-semibold border-b border-gray-200 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dummySppAdmin.map((spp) => (
                    <tr key={spp.id} className="hover:bg-gray-50 transition group">
                      <td className="p-4">
                        <p className="text-sm font-bold text-gray-800">{spp.nama}</p>
                        <p className="text-xs text-gray-500">{spp.kelas}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{spp.bulan}</td>
                      <td className="p-4 text-sm font-semibold text-gray-800">
                        Rp {spp.nominal.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          spp.status === 'Lunas' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {spp.status === 'Lunas' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {spp.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition" title="Cetak Invoice">
                            <Printer className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-gray-50 mt-auto">
              <span>Menampilkan 4 dari 80 tagihan</span>
              <div className="flex gap-1">
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 bg-white" disabled>Prev</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded font-semibold shadow-sm">1</button>
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100 bg-white">2</button>
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100 bg-white">Next</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}