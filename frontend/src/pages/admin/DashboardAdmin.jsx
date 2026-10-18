import AdminLayout from '../../layouts/AdminLayout';
import { adminStats, daftarPengajar } from '../../data/dummy';
import { Users, GraduationCap, School, Wallet, Filter, ArrowUpRight } from 'lucide-react';

export default function DashboardAdmin() {
  return (
    <AdminLayout>
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Selamat datang kembali, Admin. Berikut ringkasan performa institusi bulan ini.</p>
        </div>
        
        <select className="bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
          <option>Periode: Bulan Ini</option>
          <option>Periode: Bulan Lalu</option>
        </select>
      </div>

      {/* 4 Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Siswa */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
              <ArrowUpRight className="w-3 h-3" /> +4.2%
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Students</p>
          <h3 className="text-2xl font-bold text-gray-900">{adminStats.totalSiswa}</h3>
        </div>

        {/* Total Tentor */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              STABIL
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Teachers</p>
          <h3 className="text-2xl font-bold text-gray-900">{adminStats.totalTentor}</h3>
        </div>

        {/* Kelas Aktif */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <School className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              +2 New
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Active Classes</p>
          <h3 className="text-2xl font-bold text-gray-900">{adminStats.kelasAktif}</h3>
        </div>

        {/* Pendapatan SPP */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Monthly SPP Revenue</p>
          <h3 className="text-2xl font-bold text-gray-900">{adminStats.pendapatanSpp}</h3>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500"></div>
        </div>
      </div>

      {/* Tabel Staf & Pengajar Aktif */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Staf & Pengajar Aktif
          </h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-200">Nama Pengajar</th>
                <th className="p-4 font-semibold border-b border-gray-200">Mata Pelajaran</th>
                <th className="p-4 font-semibold border-b border-gray-200 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {daftarPengajar.map((tentor) => (
                <tr key={tentor.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${tentor.warna}`}>
                        {tentor.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{tentor.nama}</p>
                        <p className="text-xs text-gray-500">ID: {tentor.nip}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600 font-medium">{tentor.mapel}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      tentor.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tentor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 text-center bg-gray-50">
          <button className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition">
            Menampilkan 3 dari 24 Pengajar
          </button>
        </div>
      </div>

    </AdminLayout>
  );
}