import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { dummyUsers } from '../../data/dummy';
import { 
  UserPlus, Search, Edit, Trash2, Key, Filter, Copy
} from 'lucide-react';

export default function DaftarPengguna() {
  const [activeTab, setActiveTab] = useState('tentor'); // 'tentor' atau 'siswa'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data berdasarkan tab yang aktif dan kolom pencarian
  const filteredUsers = dummyUsers.filter(user => {
    const matchRole = user.role === activeTab;
    const matchSearch = user.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        user.token.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <AdminLayout>
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Pengguna</h1>
          <p className="text-gray-500 mt-1">Kelola akun akses untuk Tentor dan Siswa Bimbel Pilar.</p>
        </div>
        
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white rounded-xl hover:bg-blue-900 transition text-sm font-semibold shadow-sm">
          <UserPlus className="w-4 h-4" /> Tambah Pengguna
        </button>
      </div>

      {/* Tabs Menu (Tentor / Siswa) */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => { setActiveTab('tentor'); setSearchQuery(''); }}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'tentor' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Daftar Tentor
        </button>
        <button
          onClick={() => { setActiveTab('siswa'); setSearchQuery(''); }}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'siswa' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Daftar Siswa
        </button>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Toolbar Tabel (Search & Filter) */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={`Cari nama atau token ${activeTab}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            <Filter className="w-4 h-4" /> Filter Status
          </button>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-200">Nama Lengkap</th>
                <th className="p-4 font-semibold border-b border-gray-200">Token Akses</th>
                <th className="p-4 font-semibold border-b border-gray-200">
                  {activeTab === 'tentor' ? 'Mata Pelajaran' : 'Kelas'}
                </th>
                <th className="p-4 font-semibold border-b border-gray-200 text-center">Status</th>
                <th className="p-4 font-semibold border-b border-gray-200 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                          activeTab === 'tentor' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {user.nama.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-800">{user.nama}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg w-max">
                        <Key className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-sm font-mono font-semibold text-gray-700 tracking-wider">{user.token}</span>
                        <button title="Salin Token" className="text-gray-400 hover:text-blue-600 ml-1 transition">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-medium">{user.detail}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        user.status === 'Aktif' ? 'bg-green-100 text-green-700' : 
                        user.status === 'Izin' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Tidak ada data {activeTab} yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <span>Menampilkan {filteredUsers.length} data</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded font-semibold">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}