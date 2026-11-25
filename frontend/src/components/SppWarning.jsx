import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AlertCircle, X } from 'lucide-react'; 

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function SppWarning() {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [tagihanNunggak, setTagihanNunggak] = useState(null);

  useEffect(() => {
    const cekTunggakan = async () => {
      try {
        const response = await api.get('/tagihan-spp/me');
        const rawData = response.data;
        const fetchedItems = rawData?.data?.data || rawData?.data || rawData || [];
        
        const today = new Date();
        const tanggalHariIni = today.getDate();
        
        // 1. Warning HANYA muncul untuk tanggal 1 sampai 9
        const isWarningPeriod = tanggalHariIni >= 1 && tanggalHariIni < 10;

        if (isWarningPeriod) {
          // 2. Cari tagihan yang belum dibayar DAN belum diblokir oleh admin
          const nunggak = fetchedItems.find((spp) => {
            if (spp.status === 'Lunas') return false;
            
            // Jika admin sudah membuka blokir (is_blocked: false), jangan tampilkan warning
            if (spp.is_blocked !== undefined && spp.is_blocked === false) return false;
            
            // Jika belum bayar, tampilkan warning
            return true;
          });
          
          if (nunggak) {
            setTagihanNunggak(nunggak);
            setShowWarning(true);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data SPP:", error);
      }
    };
    
    cekTunggakan();
  }, []);

  if (!showWarning || !tagihanNunggak) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative">
        
        {/* Tombol Close (X) karena ini hanya peringatan, bukan blokir total */}
        <button 
          onClick={() => setShowWarning(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white/50 rounded-full p-1 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-orange-50 p-6 flex flex-col items-center text-center border-b border-orange-100">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-orange-800 mb-2">Pengingat Pembayaran</h2>
          <p className="text-sm text-orange-700">
            Anda memiliki tagihan SPP yang belum dibayar. Mohon segera lakukan pembayaran sebelum tanggal 10 agar akses tidak terblokir.
          </p>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Tagihan:</span>
              <span className="font-bold text-gray-800">SPP {MONTHS[Number(tagihanNunggak.bulan) - 1] || '-'} {tagihanNunggak.tahun}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Nominal:</span>
              <span className="font-bold text-orange-600">Rp {tagihanNunggak.nominal ? tagihanNunggak.nominal.toLocaleString('id-ID') : 0}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setShowWarning(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Nanti Saja
            </button>
            <button 
              onClick={() => {
                setShowWarning(false);
                navigate('/siswa/spp');
              }}
              className="flex-1 bg-[#1E3A8A] text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition shadow-sm"
            >
              Cek Tagihan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}