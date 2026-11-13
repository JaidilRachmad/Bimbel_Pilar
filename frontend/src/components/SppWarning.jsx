import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AlertCircle } from 'lucide-react'; 
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
export default function SppWarning() {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [tagihanNunggak, setTagihanNunggak] = useState(null);

  useEffect(() => {
    // 1. Cek apakah komponen ini benar-benar dipanggil
    console.log("✅ Komponen SppWarning berhasil dimuat!");

    const cekTunggakan = async () => {
      try {
        console.log("⏳ Sedang memanggil API /tagihan-spp/me...");
        const response = await api.get('/tagihan-spp/me');
        
        const rawData = response.data;
        const fetchedItems = rawData?.data?.data || rawData?.data || rawData || [];
        
        console.log("📦 Data tagihan dari API:", fetchedItems); 

        const today = new Date();
        const isBeforeDueDate = today.getDate() < 10;
        const nunggak = fetchedItems.find((spp) => (
          spp.status === 'Belum Bayar'
          && (!spp.tanggal_jatuh_tempo || spp.tanggal_jatuh_tempo > today.toISOString().slice(0, 10))
        ));
        
        console.log("🔍 Hasil pencarian tagihan nunggak:", nunggak); 

        if (isBeforeDueDate && nunggak) {
          setTagihanNunggak(nunggak);
          setShowWarning(true);
        }
      } catch (error) {
        console.error("❌ GAGAL mengambil data SPP:", error.response?.data || error.message);
      }
    };
    
    cekTunggakan();
  }, []);

  // Jika tidak ada peringatan, jangan render apa-apa
  if (!showWarning || !tagihanNunggak) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER MERAH (Tanpa Tombol X) */}
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
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Tagihan:</span>
              <span className="font-bold text-gray-800">SPP {MONTHS[Number(tagihanNunggak.bulan) - 1] || '-'} {tagihanNunggak.tahun}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Nominal:</span>
              <span className="font-bold text-red-600">Rp {tagihanNunggak.nominal ? tagihanNunggak.nominal.toLocaleString('id-ID') : 0}</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center mb-6">
            Sesuai kebijakan Bimbel Pilar Cendekia, akses ke halaman Nilai dan Materi akan dibatasi hingga Anda melunasi tagihan ini.
          </p>

          {/* SATU-SATUNYA TOMBOL UNTUK MENUTUP POP-UP */}
          <button 
            onClick={() => {
              setShowWarning(false);
              navigate('/siswa/spp');
            }}
            className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow-sm"
          >
            Cek Tagihan & Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}