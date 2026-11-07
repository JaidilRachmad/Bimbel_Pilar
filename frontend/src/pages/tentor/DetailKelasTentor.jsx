import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getKelasMy } from '../../services/kelasTentorService';
import { ChevronRight, LoaderCircle, School, Users, ArrowLeft, ChevronDown, CalendarPlus, UploadCloud, CheckCircle, X, Link as LinkIcon, Edit2, Trash2, Save } from 'lucide-react';

export default function DashboardTentor() {
  const navigate = useNavigate();
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- STATE KONTROL VIEW ---
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [activeTab, setActiveTab] = useState('Matematika');
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  // --- STATE MODALS ---
  const [showFormSesi, setShowFormSesi] = useState(false);
  const [editingSesi, setEditingSesi] = useState(null); 
  const [sessionForNilai, setSessionForNilai] = useState(null);
  const [sessionForMateri, setSessionForMateri] = useState(null);

  // --- DATA DUMMY (STATE UNTUK CRUD) ---
  const mapelTabs = ['Matematika', 'IPA', 'Bahasa Indonesia'];
  
  // State data sesi untuk simulasi CRUD di frontend
  const [sessionsData, setSessionsData] = useState({
    'Matematika': [
      { id: 1, tanggal: '2026-10-12', waktuMulai: '08:00', waktuSelesai: '09:30', topik: 'Aljabar Linear & Persamaan Dasar', tipe: 'Live Sesi', materiLink: '' },
      { id: 2, tanggal: '2026-10-15', waktuMulai: '10:00', waktuSelesai: '11:30', topik: 'Geometri Ruang', tipe: 'Diskusi', materiLink: 'https://drive.google.com/file/d/dummy' },
    ],
    'IPA': [
      { id: 3, tanggal: '2026-10-13', waktuMulai: '08:00', waktuSelesai: '09:30', topik: 'Struktur Sel Tumbuhan', tipe: 'Praktikum', materiLink: '' },
    ],
    'Bahasa Indonesia': [
      { id: 4, tanggal: '2026-10-16', waktuMulai: '13:00', waktuSelesai: '14:30', topik: 'Teks Naratif', tipe: 'Diskusi', materiLink: '' },
      { id: 5, tanggal: '2026-10-18', waktuMulai: '08:00', waktuSelesai: '09:30', topik: 'Puisi Kontemporer', tipe: 'Live Sesi', materiLink: '' },
    ]
  });

  // State Input Nilai Siswa
  const [nilaiSiswa, setNilaiSiswa] = useState([
    { id: 1, nama: 'hapis', nilai: '', keterangan: '' },
    { id: 2, nama: 'lyvia', nilai: '', keterangan: '' },
    { id: 3, nama: 'jaidil', nilai: '', keterangan: '' }
  ]);

  // Temporary State Form
  const [formDataSesi, setFormDataSesi] = useState({ topik: '', tanggal: '', tipe: 'Live Sesi', waktuMulai: '', waktuSelesai: '', materiLink: '' });
  const [formMateriLink, setFormMateriLink] = useState('');

  useEffect(() => {
    let active = true;
    getKelasMy()
      .then((assignments) => {
        if (active) setKelasList(assignments.filter((a) => a.kelas));
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Gagal memuat kelas yang diampu.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  // ---------------------------------------------------------------------------
  // HANDLERS CRUD SESI
  // ---------------------------------------------------------------------------
  const handleOpenTambahSesi = () => {
    setEditingSesi(null);
    setFormDataSesi({ topik: '', tanggal: '', tipe: 'Live Sesi', waktuMulai: '', waktuSelesai: '', materiLink: '' });
    setShowFormSesi(true);
  };

  const handleOpenEditSesi = (sesi, e) => {
    e.stopPropagation();
    setEditingSesi(sesi);
    setFormDataSesi({ ...sesi });
    setShowFormSesi(true);
  };

  const handleDeleteSesi = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Yakin ingin menghapus sesi ini?')) {
      setSessionsData(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(s => s.id !== id)
      }));
      if (expandedSessionId === id) setExpandedSessionId(null);
    }
  };

  const handleSaveSesi = () => {
    if (!formDataSesi.topik || !formDataSesi.tanggal) {
      alert('Topik dan tanggal wajib diisi!');
      return;
    }

    if (editingSesi) {
      // UPDATE Sesi
      setSessionsData(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(s => s.id === editingSesi.id ? { ...formDataSesi, id: editingSesi.id } : s)
      }));
      alert('Sesi berhasil diperbarui!');
    } else {
      // CREATE Sesi
      const newSesi = { ...formDataSesi, id: Date.now() };
      setSessionsData(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), newSesi]
      }));
      alert('Sesi baru berhasil ditambahkan!');
    }
    setShowFormSesi(false);
  };

  // ---------------------------------------------------------------------------
  // HANDLERS CRUD MATERI (LINK DRIVE)
  // ---------------------------------------------------------------------------
  const handleOpenMateri = (sesi) => {
    setSessionForMateri(sesi);
    setFormMateriLink(sesi.materiLink || '');
  };

  const handleSaveMateri = () => {
    setSessionsData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(s => s.id === sessionForMateri.id ? { ...s, materiLink: formMateriLink } : s)
    }));
    alert('Link materi berhasil disimpan!');
    setSessionForMateri(null);
  };

  const handleDeleteMateri = () => {
    if(window.confirm('Hapus link materi untuk sesi ini?')) {
      setSessionsData(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(s => s.id === sessionForMateri.id ? { ...s, materiLink: '' } : s)
      }));
      setSessionForMateri(null);
      alert('Materi berhasil dihapus.');
    }
  };

  // ---------------------------------------------------------------------------
  // HANDLERS INPUT NILAI & KONVERSI OTOMATIS (A=100, B=90, C=80, D=70, E=60)
  // ---------------------------------------------------------------------------
  const handleGradeChange = (idSiswa, value) => {
    let finalValue = value.toUpperCase();
    
    const konversi = { 'A': '100', 'B': '90', 'C': '80', 'D': '70', 'E': '60' };
    if (konversi[finalValue]) {
      finalValue = konversi[finalValue];
    }

    if (!/^\d*$/.test(finalValue) && finalValue !== '') return;
    if (finalValue !== '' && (parseInt(finalValue) < 0 || parseInt(finalValue) > 100)) return;

    setNilaiSiswa(prev => prev.map(s => s.id === idSiswa ? { ...s, nilai: finalValue } : s));
  };

  const handleSaveNilai = () => {
    alert('Nilai seluruh siswa berhasil disimpan!');
    setSessionForNilai(null);
  };

  // ---------------------------------------------------------------------------
  // RENDER MODAL: FORM SESI (CREATE/UPDATE)
  // ---------------------------------------------------------------------------
  const renderModalFormSesi = () => {
    if (!showFormSesi) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-blue-600 rounded-t-2xl">
            <h3 className="text-lg font-bold text-white">{editingSesi ? 'Edit Sesi Pembelajaran' : 'Tambah Sesi Baru'}</h3>
            <button onClick={() => setShowFormSesi(false)} className="text-white hover:text-gray-200">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Topik Pembahasan</label>
              <input 
                type="text" 
                value={formDataSesi.topik}
                onChange={(e) => setFormDataSesi({...formDataSesi, topik: e.target.value})}
                placeholder="Masukkan topik detail sesi hari ini" 
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                <input 
                  type="date" 
                  value={formDataSesi.tanggal}
                  onChange={(e) => setFormDataSesi({...formDataSesi, tanggal: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipe Ruang</label>
                <select 
                  value={formDataSesi.tipe}
                  onChange={(e) => setFormDataSesi({...formDataSesi, tipe: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Live Sesi">Live Sesi (Zoom/Meet)</option>
                  <option value="Tatap Muka">Tatap Muka (Offline)</option>
                  <option value="Diskusi">Diskusi / Penugasan</option>
                  <option value="Praktikum">Praktikum</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Jam Mulai</label>
                <input 
                  type="time" 
                  value={formDataSesi.waktuMulai}
                  onChange={(e) => setFormDataSesi({...formDataSesi, waktuMulai: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Jam Selesai</label>
                <input 
                  type="time" 
                  value={formDataSesi.waktuSelesai}
                  onChange={(e) => setFormDataSesi({...formDataSesi, waktuSelesai: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50 px-6 py-4">
            <button onClick={() => setShowFormSesi(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">Batal</button>
            <button onClick={handleSaveSesi} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
              {editingSesi ? 'Simpan Perubahan' : 'Simpan Sesi'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // RENDER MODAL: INPUT NILAI SISWA
  // ---------------------------------------------------------------------------
  const renderModalInputNilai = () => {
    if (!sessionForNilai) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Input Nilai Latihan Soal</h3>
                <p className="text-sm text-gray-500 mt-1">{sessionForNilai.topik} - {activeTab}</p>
                <p className="text-xs text-blue-600 mt-1 font-medium bg-blue-50 inline-block px-2 py-1 rounded">
                  💡 Ketik huruf (A=100, B=90, C=80, D=70, E=60) untuk konversi nilai otomatis.
                </p>
              </div>
              <button onClick={() => setSessionForNilai(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto p-6 flex-1">
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nama Siswa</th>
                    <th className="px-4 py-3 font-semibold w-28">Nilai</th>
                    <th className="px-4 py-3 font-semibold">Keterangan Tambahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {nilaiSiswa.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-800 capitalize">{siswa.nama}</td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={siswa.nilai}
                          onChange={(e) => handleGradeChange(siswa.id, e.target.value)}
                          placeholder="0-100 / A-E" 
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center" 
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={siswa.keterangan}
                          onChange={(e) => setNilaiSiswa(prev => prev.map(s => s.id === siswa.id ? {...s, keterangan: e.target.value} : s))}
                          placeholder="Catatan opsional..." 
                          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-b-2xl border-t border-gray-100 bg-gray-50 px-6 py-4">
            <button onClick={() => setNilaiSiswa(prev => prev.map(s => ({...s, nilai: '', keterangan: ''})))} className="text-sm font-medium text-red-600 hover:text-red-800">Reset Form</button>
            <div className="flex gap-3">
              <button onClick={() => setSessionForNilai(null)} className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={handleSaveNilai} className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-bold text-white hover:bg-blue-800">Simpan Data Nilai</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // RENDER MODAL: UPLOAD MATERI BELAJAR (LINK DRIVE)
  // ---------------------------------------------------------------------------
  const renderModalUploadMateri = () => {
    if (!sessionForMateri) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900">Kelola Materi Belajar</h3>
            <button onClick={() => setSessionForMateri(null)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">Tambahkan atau perbarui tautan Google Drive untuk materi sesi <strong>{sessionForMateri.topik}</strong>.</p>
            <label className="mb-1 block text-sm font-medium text-gray-700">Link Google Drive</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="url" 
                value={formMateriLink}
                onChange={(e) => setFormMateriLink(e.target.value)}
                placeholder="https://drive.google.com/file/d/..." 
                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-b-2xl border-t border-gray-100 bg-gray-50 px-6 py-4">
            {sessionForMateri.materiLink ? (
              <button onClick={handleDeleteMateri} className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> Hapus Materi
              </button>
            ) : <div></div>}
            <div className="flex gap-3">
              <button onClick={() => setSessionForMateri(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">Batal</button>
              <button onClick={handleSaveMateri} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                <Save className="w-4 h-4 inline-block mr-1" /> Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // RENDER: DETAIL KELAS
  // ---------------------------------------------------------------------------
  const renderDetailKelas = () => {
    const currentSessions = sessionsData[activeTab] || [];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => setSelectedKelas(null)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedKelas.kelas.nama_kelas}</h1>
            <p className="mt-1 text-sm text-gray-500">Kelola jadwal sesi, unggah materi belajar, dan input nilai siswa.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50/50 px-6 pt-5">
            <ul className="flex space-x-8 text-sm font-medium text-gray-500 overflow-x-auto hide-scrollbar">
              {mapelTabs.map((mapel) => (
                <li key={mapel}>
                  <button
                    onClick={() => {
                      setActiveTab(mapel);
                      setExpandedSessionId(null);
                    }}
                    className={`pb-4 transition-all duration-200 border-b-2 whitespace-nowrap ${
                      activeTab === mapel
                        ? 'border-blue-600 text-blue-700 font-bold'
                        : 'border-transparent hover:text-gray-800 hover:border-gray-300'
                    }`}
                  >
                    {mapel}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 min-h-[400px]">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-900">
                Jadwal Sesi - {activeTab}
              </h2>
              <button 
                onClick={handleOpenTambahSesi}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <CalendarPlus className="h-4 w-4" />
                Tambah Sesi Baru
              </button>
            </div>

            <div className="space-y-4">
              {currentSessions.length > 0 ? (
                currentSessions.map((sesi) => (
                  <div 
                    key={sesi.id} 
                    className={`group rounded-xl border bg-white transition-all duration-200 ${
                      expandedSessionId === sesi.id 
                        ? 'border-blue-300 shadow-md ring-1 ring-blue-100' 
                        : 'border-gray-200 hover:border-blue-200 hover:shadow-sm'
                    }`}
                  >
                    <div 
                      className="flex cursor-pointer items-center justify-between p-5"
                      onClick={() => setExpandedSessionId(expandedSessionId === sesi.id ? null : sesi.id)}
                    >
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                            {sesi.tipe}
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            {sesi.tanggal} • {sesi.waktuMulai} - {sesi.waktuSelesai}
                          </span>
                          {sesi.materiLink && (
                            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                              <LinkIcon className="w-3 h-3 mr-1" /> Materi Tersedia
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {sesi.topik}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Tombol CRUD Sesi (Edit & Delete) */}
                        <div className={`flex transition-opacity duration-200 ${expandedSessionId === sesi.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <button onClick={(e) => handleOpenEditSesi(sesi, e)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="Edit Sesi">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => handleDeleteSesi(sesi.id, e)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Hapus Sesi">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className={`rounded-full p-2 transition-colors ml-2 ${expandedSessionId === sesi.id ? 'bg-blue-50 text-blue-600' : 'text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600'}`}>
                          <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${expandedSessionId === sesi.id ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>

                    {/* Accordion Actions */}
                    {expandedSessionId === sesi.id && (
                      <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/50 p-5 sm:flex-row">
                        <button 
                          onClick={() => setSessionForNilai(sesi)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 hover:border-blue-300"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Input Nilai Siswa
                        </button>
                        <button 
                          onClick={() => handleOpenMateri(sesi)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50 hover:border-emerald-300"
                        >
                          <UploadCloud className="h-4 w-4" />
                          {sesi.materiLink ? 'Edit Link Materi' : 'Upload Link Materi'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                  <CalendarPlus className="mb-3 h-10 w-10 text-gray-400" />
                  <h3 className="mb-1 text-sm font-bold text-gray-900">Belum ada sesi</h3>
                  <p className="text-sm text-gray-500">Buat jadwal sesi pertama untuk mata pelajaran ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // RENDER: DAFTAR KELAS (BERANDA UTAMA)
  // ---------------------------------------------------------------------------
  const renderDaftarKelas = () => (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Beranda Guru</h1>
        <p className="mt-1 text-gray-500">Pilih kelas yang kamu ampu untuk mengelola sesi pembelajaran.</p>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white p-10 text-sm text-gray-500 shadow-sm">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Memuat kelas...
        </div>
      ) : kelasList.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
          Kamu belum ditugaskan ke kelas mana pun. Hubungi admin untuk penugasan kelas.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {kelasList.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedKelas(item)}
              className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="mb-5 flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <School className="h-6 w-6" />
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{item.kelas.nama_kelas}</h2>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">{item.kelas.jenjang}</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="h-4 w-4" />
                  {item.kelas.kelas_siswa?.length || 0} siswa
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {selectedKelas ? renderDetailKelas() : renderDaftarKelas()}
      
      {/* Modal Components */}
      {renderModalFormSesi()}
      {renderModalInputNilai()}
      {renderModalUploadMateri()}
    </DashboardLayout>
  );
}