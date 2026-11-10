import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function SppBlocker({ children }) {
  const navigate = useNavigate();
  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [tagihan, setTagihan] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await api.get('/tagihan-spp/me');
        const rawData = response.data;
        const fetchedItems = rawData?.data?.data || rawData?.data || rawData || [];
        
        const today = new Date();
        
        // LOGIKA ASLI (Ubah ke true jika ingin tes paksa)
        // const isPastDueDate = true; 
        const isPastDueDate = today.getDate() > 10; 
        
        const nunggak = fetchedItems.find(spp => spp.status === 'Belum Bayar');

        if (isPastDueDate && nunggak) {
          setIsLocked(true);
          setTagihan(nunggak);
        }
      } catch (error) {
        console.error("Gagal mengecek akses SPP:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, []);

  // Tampilkan loading layar penuh saat ngecek API
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    // Relative wrapper untuk menampung halaman asli dan overlay
    <div className="relative min-h-screen">
      
      {/* 1. TAMPILKAN HALAMAN ASLINYA (Tabel Nilai) DI BELAKANG */}
      <div className={isLocked ? 'pointer-events-none select-none filter blur-[4px]' : ''}>
        {children}
      </div>

      {/* 2. TAMPILKAN OVERLAY (POP-UP) JIKA TERKUNCI */}
      {isLocked && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
            
            {/* HEADER MERAH */}
            <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-red-800 mb-2">Akses Terbatas!</h2>
              <p className="text-sm text-red-700">
                Anda memiliki tagihan SPP yang belum dibayar melewati batas waktu (tanggal 10).
              </p>
            </div>
            
            {/* BODY */}
            <div className="p-6">
              {tagihan && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Tagihan:</span>
                    <span className="font-bold text-gray-800">SPP {tagihan.bulan_mulai} {tagihan.tahun_mulai}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Nominal:</span>
                    <span className="font-bold text-red-600">Rp {tagihan.nominal?.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500 text-center mb-6">
                Sesuai kebijakan Bimbel Pilar Cendekia, akses ke halaman Nilai dan Materi akan dibatasi hingga Anda melunasi tagihan ini.
              </p>

              <button 
                onClick={() => navigate('/siswa/spp')}
                className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow-sm"
              >
                Cek Tagihan & Bayar Sekarang <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}