// Import client Supabase yang sudah dikonfigurasi oleh teman Anda
const supabase = require('../config/supabaseClient');

const checkSpp = async (req, res, next) => {
  try {
    const siswaId = req.user.id; 
    
    // Cek apakah ada tagihan 'Belum Bayar' yang sudah melewati tanggal_jatuh_tempo
    const { data: tagihanNunggak, error } = await supabase
      .from('tagihan_spp')
      .select('id')
      .eq('siswa_id', siswaId)
      .eq('status', 'Belum Bayar') 
      .lt('tanggal_jatuh_tempo', new Date().toISOString().split('T')[0]); 

    if (error) throw error;

    if (tagihanNunggak && tagihanNunggak.length > 0) {
      return res.status(403).json({ 
        message: "Akses Terkunci, lunasi SPP" 
      });
    }

    next();
  } catch (error) {
    console.error("Error di checkSpp:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

module.exports = checkSpp;