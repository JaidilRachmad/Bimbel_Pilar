import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllUsers } from '../../services/userService';
import { getErrorInfo } from '../../services/authService';
import {
  UserPlus, Search, Edit, Trash2, Key, Filter, ChevronDown
} from 'lucide-react';

// Ambil angka tingkat dari nama kelas, contoh "Kelas 9A - Unggulan" -> "9"
const getTingkat = (nama) => nama.match(/\d+/)?.[0] ?? '?';

const formatTanggal = (tanggal) =>
  tanggal ? new Date(tanggal).toLocaleDateString('id-ID') : '-';

export default function DaftarPengguna() {
  const [activeTab, setActiveTab] = useState('tentor'); // 'tentor' atau 'siswa'
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openKelas, setOpenKelas] = useState(null);

  // Ambil data sesuai tab yang aktif
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getAllUsers(activeTab)
      .then((data) => active && setUsers(data.users))
      .catch((err) => active && setError(getErrorInfo(err).message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [activeTab]);

  // Filter berdasarkan nama. Field nama belum dikembalikan backend, jadi pakai fallback
  const filteredUsers = users.filter((user) =>
    (user.nama ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kelompokkan siswa per kelas untuk tab siswa
  const groupedByKelas = useMemo(() => {
    const groups = {};
    filteredUsers.forEach((user) => {
      const kelas = user.kelas?.nama ?? 'Belum ada kelas';
      if (!groups[kelas]) groups[kelas] = [];
      groups[kelas].push(user);
    });
    return Object.entries(groups);
  }, [filteredUsers]);

  const handleChangeTab = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setOpenKelas(null);
  };

  const renderTable = (list) => (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
          <th className="p-4 font-semibold border-b border-gray-200">Nama Lengkap</th>
          <th className="p-4 font-semibold border-b border-gray-200">Token Akses</th>
          <th className="p-4 font-semibold border-b border-gray-200">Dibuat</th>
          <th className="p-4 font-semibold border-b border-gray-200 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {list.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50 transition group">
            <td className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  activeTab === 'tentor' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {(user.nama ?? '?').charAt(0)}
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {user.nama ?? 'Nama belum tersedia'}
                </span>
              </div>
            </td>
            <td className="p-4">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg w-max">
                <Key className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-sm font-mono font-semibold text-gray-700 tracking-wider">••••••••</span>
              </div>
            </td>
            <td className="p-4 text-sm text-gray-600 font-medium">{formatTanggal(user.created_at)}</td>
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
        ))}
      </tbody>
    </table>
  );

  const renderContent = () => {
    if (loading) return <p className="p-8 text-center text-gray-500">Memuat data {activeTab}...</p>;
    if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
    if (filteredUsers.length === 0) {
      return <p className="p-8 text-center text-gray-500">Tidak ada data {activeTab} yang ditemukan.</p>;
    }

    if (activeTab === 'tentor') {
      return <div className="overflow-x-auto">{renderTable(filteredUsers)}</div>;
    }

    // Tab siswa: accordion per kelas
    return (
      <div className="p-4 space-y-3">
        {groupedByKelas.map(([kelas, list]) => {
          const isOpen = openKelas === kelas;
          return (
            <div key={kelas} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
              <button
                onClick={() => setOpenKelas(isOpen ? null : kelas)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-md bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                    {getTingkat(kelas)}
                  </span>
                  <span className="font-bold text-gray-800">{kelas}</span>
                  <span className="text-xs text-gray-500">{list.length} Siswa</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="border-t border-gray-100 overflow-x-auto">
                  {renderTable(list)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

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
          onClick={() => handleChangeTab('tentor')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'tentor'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Daftar Tentor
        </button>
        <button
          onClick={() => handleChangeTab('siswa')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'siswa'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Daftar Siswa
        </button>
      </div>

      {/* Tabel / Daftar Pengguna */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Toolbar (Search & Filter) */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Cari nama ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            <Filter className="w-4 h-4" /> Filter Status
          </button>
        </div>

        {renderContent()}

        {/* Footer */}
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
