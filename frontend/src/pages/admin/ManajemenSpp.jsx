import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import EKwitansi from '../../components/EKwitansi';
import { 
  CheckCircle2, XCircle, Printer, Loader2, 
  Trash2, Edit, Search, Filter, ChevronDown, ChevronRight, User, X
} from 'lucide-react';

export default function ManajemenSpp() {
  const [dataSpp, setDataSpp] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // State Pencarian & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua Kelas');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [expandedStudents, setExpandedStudents] = useState({});

  // State untuk Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSppData, setEditingSppData] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchTagihan = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tagihan-spp');
      const rawData = response.data;
      const fetchedItems = rawData?.data?.data || rawData?.data || rawData || [];
      
      const mappedData = fetchedItems.map((item, index) => {
        let metodeTersimpan = 'Transfer';
        let tanggalTersimpan = '-';

        if (item.invoice_pembayaran) {
          const invoice = Array.isArray(item.invoice_pembayaran) 
            ? item.invoice_pembayaran[0] 
            : item.invoice_pembayaran;

          if (invoice) {
            metodeTersimpan = invoice.metode_pembayaran || 'Transfer';
            tanggalTersimpan = invoice.tanggal_pembayaran || '-';
          }
        }

        return {
          ...item,
          metode_pembayaran: metodeTersimpan,
          tanggal_pembayaran: tanggalTersimpan,
          kelas_name: item.siswa_profile?.kelas_siswa?.[0]?.kelas?.nama_kelas || (index % 2 === 0 ? 'Kelas 6 SD' : 'Kelas 7 SMP')
        };
      });

      setDataSpp(Array.isArray(mappedData) ? mappedData : []);
    } catch (error) {
      console.error("Gagal mengambil data SPP:", error);
      alert("Gagal memuat data SPP");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTagihan();
  }, []);

  const toggleStudent = (siswaId) => {
    setExpandedStudents(prev => ({
      ...prev,
      [siswaId]: !prev[siswaId]
    }));
  };

  const handleMetodeChange = (id, metode) => {
    setDataSpp(dataSpp.map(spp => 
      spp.id === id ? { ...spp, metode_pembayaran: metode } : spp
    ));
  };

  const handleTandaiLunas = async (spp) => {
    // Konfirmasi sebelum melunasi
    if(!window.confirm(`Yakin ingin melunasi SPP ${spp.siswa_profile?.nama}?`)) return;

    try {
      await api.put(`/tagihan-spp/${spp.id}/bayar`, {
        // Otomatis menggunakan tanggal hari ini sesuai permintaan
        tanggal_pembayaran: new Date().toISOString().split('T')[0], 
        metode_pembayaran: spp.metode_pembayaran
      });
      alert(`Berhasil melunasi SPP ${spp.siswa_profile?.nama}`);
      fetchTagihan();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal melunasi tagihan");
    }
  };

  const handleHapus = (id) => {
    if(window.confirm("Yakin ingin menghapus tagihan ini?")) {
       setDataSpp(dataSpp.filter(spp => spp.id !== id));
    }
  };

  // --- FUNGSI EDIT TANGGAL ---
  const handleOpenEdit = (spp) => {
    setEditingSppData(spp);
    setEditDate(spp.tanggal_pembayaran !== '-' ? spp.tanggal_pembayaran : new Date().toISOString().split('T')[0]);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editDate) return alert("Pilih tanggal terlebih dahulu");
    setIsSaving(true);
    
    try {
      await api.put(`/tagihan-spp/${editingSppData.id}/edit-tanggal`, {
        tanggal_pembayaran: editDate
      });
      alert("Tanggal pembayaran berhasil diperbarui!");
      setIsEditModalOpen(false);
      fetchTagihan(); 
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan tanggal. (Pastikan endpoint backend sudah dibuat)");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredData = dataSpp.filter((spp) => {
    const matchSearch = spp.siswa_profile?.nama?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKelas = filterKelas === 'Semua Kelas' || spp.kelas_name === filterKelas;
    const matchStatus = filterStatus === 'Semua Status' || spp.status === filterStatus;
    return matchSearch && matchKelas && matchStatus;
  });

  const groupedByStudent = filteredData.reduce((acc, current) => {
    const id = current.siswa_id;
    if (!acc[id]) {
      acc[id] = {
        siswa_id: id,
        nama: current.siswa_profile?.nama || "Nama Tidak Ditemukan",
        kelas: current.kelas_name,
        tagihan: []
      };
    }
    acc[id].tagihan.push(current);
    return acc;
  }, {});

  const studentsList = Object.values(groupedByStudent);
  const uniqueKelas = ['Semua Kelas', ...new Set(dataSpp.map(item => item.kelas_name))];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen SPP</h1>
        <p className="text-gray-500 mt-1">Kelola tagihan bulanan. Klik pada nama siswa untuk melihat rincian bulan.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* TOOLBAR SEARCH & FILTER */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama siswa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-1/2 md:w-auto">
              <select 
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                {uniqueKelas.map((kelas, idx) => (
                  <option key={idx} value={kelas}>{kelas}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative w-1/2 md:w-auto">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Lunas">Lunas</option>
                <option value="Belum Bayar">Belum Bayar</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* TABEL UTAMA */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-semibold">Nama Siswa</th>
                  <th className="p-4 font-semibold">Kelas</th>
                  <th className="p-4 font-semibold">Status Keseluruhan</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentsList.length > 0 ? (
                  studentsList.map((siswa) => {
                    const isExpanded = expandedStudents[siswa.siswa_id];
                    const isAllLunas = siswa.tagihan.every(t => t.status === 'Lunas');

                    return (
                      <React.Fragment key={siswa.siswa_id}>
                        {/* BARIS UTAMA */}
                        <tr 
                          className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                          onClick={() => toggleStudent(siswa.siswa_id)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="text-gray-400">
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                              </div>
                              <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{siswa.nama}</p>
                                <p className="text-xs text-gray-500">{siswa.tagihan.length} Bulan Tagihan</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-600">{siswa.kelas}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              isAllLunas ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {isAllLunas ? 'Semua Lunas' : 'Ada Tunggakan'}
                            </span>
                          </td>
                          <td className="p-4 text-center text-sm text-blue-600 font-semibold hover:underline">
                            {isExpanded ? 'Tutup Detail' : 'Lihat Detail'}
                          </td>
                        </tr>

                        {/* BARIS DETAIL (EXPANDED) */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="4" className="p-0 border-b border-gray-200 bg-gray-50">
                              <div className="p-4 pl-16">
                                <table className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                  <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                                    <tr>
                                      <th className="p-3 font-semibold">Bulan Tagihan</th>
                                      <th className="p-3 font-semibold">Nominal</th>
                                      <th className="p-3 font-semibold">Status</th>
                                      <th className="p-3 font-semibold">Tgl Pembayaran</th> 
                                      <th className="p-3 font-semibold">Metode</th>
                                      <th className="p-3 font-semibold text-center">Aksi</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {siswa.tagihan.map((spp) => (
                                      <tr key={spp.id} className="hover:bg-gray-50">
                                        <td className="p-3 text-sm font-medium text-gray-800">
                                          {spp.bulan_mulai} {spp.tahun_mulai}
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">
                                          Rp {spp.nominal ? spp.nominal.toLocaleString('id-ID') : 0}
                                        </td>
                                        <td className="p-3">
                                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                                            spp.status === 'Lunas' ? 'text-green-600' : 'text-red-600'
                                          }`}>
                                            {spp.status === 'Lunas' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                            {spp.status}
                                          </span>
                                        </td>
                                        
                                        {/* DATA TANGGAL PEMBAYARAN */}
                                        <td className="p-3 text-sm text-gray-600 font-medium">
                                          {spp.tanggal_pembayaran}
                                        </td>

                                        <td className="p-3">
                                          <select 
                                            value={spp.metode_pembayaran}
                                            onChange={(e) => handleMetodeChange(spp.id, e.target.value)}
                                            disabled={spp.status === 'Lunas'}
                                            className="bg-white border border-gray-300 text-gray-700 text-xs rounded-md block w-28 p-1.5 outline-none disabled:opacity-50"
                                          >
                                            <option value="Transfer">Transfer</option>
                                            <option value="Cash">Cash</option>
                                          </select>
                                        </td>
                                        
                                        {/* KOLOM AKSI DISEMPURNAKAN */}
                                        <td className="p-3">
                                          <div className="flex items-center justify-center gap-1.5">
                                            
                                            {/* JIKA BELUM BAYAR: Hanya Tombol Lunas */}
                                            {spp.status !== 'Lunas' && (
                                              <button 
                                                onClick={() => handleTandaiLunas(spp)}
                                                className="px-2 py-1 bg-green-500 text-white rounded text-[11px] font-bold hover:bg-green-600 transition"
                                              >
                                                Lunas
                                              </button>
                                            )}

                                            {/* JIKA SUDAH LUNAS: Muncul Print & Edit Tanggal */}
                                            {spp.status === 'Lunas' && (
                                              <>
                                                <button onClick={() => setSelectedInvoice(spp)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Print">
                                                  <Printer className="w-4 h-4" />
                                                </button>
                                                
                                                <button onClick={() => handleOpenEdit(spp)} className="p-1 text-orange-500 hover:bg-orange-50 rounded" title="Edit Tanggal">
                                                  <Edit className="w-4 h-4" />
                                                </button>
                                              </>
                                            )}
                                            
                                            {/* Tombol Hapus Selalu Ada */}
                                            <button onClick={() => handleHapus(spp.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                            
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      Tidak ada data siswa yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-gray-50">
          <span>Total {studentsList.length} Siswa</span>
        </div>
      </div>

      {/* ================= MODAL EDIT TANGGAL PEMBAYARAN ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Edit Tanggal Pembayaran</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Siswa: <span className="font-bold text-gray-900">{editingSppData?.siswa_profile?.nama}</span></p>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pembayaran</label>
              <input 
                type="date" 
                value={editDate} 
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition">Batal</button>
              <button onClick={handleSaveEdit} disabled={isSaving} className="px-5 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition">
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= KOMPONEN E-KWITANSI ================= */}
      <EKwitansi 
        isOpen={!!selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
        data={selectedInvoice ? {
          ...selectedInvoice,
          nama: selectedInvoice.siswa_profile?.nama || 'Siswa',
          kelas: selectedInvoice.kelas_name || 'Kelas X',
          metode_pembayaran: selectedInvoice.metode_pembayaran,
          tanggal_pembayaran: selectedInvoice.tanggal_pembayaran
        } : null} 
      />
    </DashboardLayout>
  );
}