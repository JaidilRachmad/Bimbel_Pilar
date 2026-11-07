// ================= DATA SISWA =================
export const userSiswa = {
  nama_lengkap: "Asaki Aktam Nijananda",
  role: "siswa",
  kelas: "Kelas 5 SD",
};

export const mataPelajaran = [
  {
    id: 1,
    kode: "BI",
    nama: "Bahasa Indonesia",
    progress: 80,
    totalMateri: 12,
    warna: "bg-orange-100 text-orange-600",
    listMateri: ["Puisi & Prosa", "Struktur Kalimat"]
  },
  {
    id: 2,
    kode: "IPA",
    nama: "Ilmu Pengetahuan Alam",
    progress: 52,
    totalMateri: 8,
    warna: "bg-blue-100 text-blue-600",
    listMateri: ["Sistem Peredaran Darah", "Ekosistem & Bioma"]
  },
  {
    id: 3,
    kode: "MTK",
    nama: "Matematika",
    progress: 45,
    totalMateri: 15,
    warna: "bg-indigo-100 text-indigo-600",
    listMateri: ["Bangun Ruang", "Operasi Hitung Pecahan"]
  }
];

export const laporanProgresSiswa = [
  {
    id: 1,
    tanggal: "12 April 2026",
    mapel: "Matematika",
    materi: "Bangun Ruang (Kubus & Balok)",
    nilaiSaya: 85,
    rataRataKelas: 80,
    nilaiTertinggi: 95,
    keterangan: "Sangat baik, peningkatan pemahaman rumusnya."
  },
  {
    id: 2,
    tanggal: "08 April 2026",
    mapel: "Bahasa Indonesia",
    materi: "Teks Puisi Baru",
    nilaiSaya: 92,
    rataRataKelas: 84,
    nilaiTertinggi: 98,
    keterangan: "Analisis kritik yang mendalam, kosa kata sangat kaya."
  },
  {
    id: 3,
    tanggal: "05 April 2026",
    mapel: "IPA",
    materi: "Sistem Pencernaan",
    nilaiSaya: 78,
    rataRataKelas: 75,
    nilaiTertinggi: 90,
    keterangan: "Perlu pendalaman materi pada bagian enzim."
  }
];

export const catatanProgres = {
  deskripsi: "Secara keseluruhan, Ananda menunjukkan perkembangan yang sangat baik pada materi Bangun Ruang dan Bahasa Indonesia. Perlu sedikit peningkatan pada detail Biologi khususnya sistem pencernaan untuk mencapai standar nilai tertinggi.",
  saran: "Tingkatkan les mandiri untuk materi IPA. Pertahankan partisipasi aktif dalam diskusi kelas."
};

// Tambahkan di bawah variabel catatanProgres
export const ringkasanSpp = {
  totalDibayar: "Rp 1.050.000",
  tunggakan: "Rp 350.000",
  statusAkun: "Aktif"
};

export const tagihanAktif = {
  id: "INV-2026-05",
  bulan: "Mei 2026",
  nominal: 350000,
  status: "Belum Bayar",
  jatuhTempo: "10 Mei 2026"
};

export const riwayatSpp = [
  {
    id: 1,
    bulan: "April 2026",
    nominal: "Rp 350.000",
    tanggalBayar: "05 April 2026",
    status: "Lunas"
  },
  {
    id: 2,
    bulan: "Maret 2026",
    nominal: "Rp 350.000",
    tanggalBayar: "02 Maret 2026",
    status: "Lunas"
  },
  {
    id: 3,
    bulan: "Februari 2026",
    nominal: "Rp 350.000",
    tanggalBayar: "10 Februari 2026",
    status: "Lunas"
  }
];

// ================= DATA ADMIN =================
export const adminStats = {
  totalSiswa: "1,482",
  totalTentor: "24",
  kelasAktif: "42",
  pendapatanSpp: "Rp 518.7M"
};

export const daftarPengajar = [
  { id: 1, nama: "Ahmad Fauzi, M.Pd", nip: "TCH-2024-001", mapel: "Matematika & Kalkulus", status: "Aktif", warna: "bg-blue-100 text-blue-600" },
  { id: 2, nama: "Siti Nurhaliza, S.Si", nip: "TCH-2024-005", mapel: "Biologi & Kimia", status: "Aktif", warna: "bg-emerald-100 text-emerald-600" },
  { id: 3, nama: "Bambang Rudiyanto", nip: "TCH-2024-012", mapel: "Bahasa Inggris", status: "Izin Sakit", warna: "bg-orange-100 text-orange-600" }
];

// ================= DATA DAFTAR PENGGUNA (ADMIN) =================
export const dummyUsers = [
  // Data Tentor
  { id: "T01", role: "tentor", nama: "Ahmad Fauzi, M.Pd", token: "TNT-84920", detail: "Matematika", status: "Aktif" },
  { id: "T02", role: "tentor", nama: "Siti Nurhaliza, S.Si", token: "TNT-11234", detail: "Biologi", status: "Aktif" },
  { id: "T03", role: "tentor", nama: "Bambang Rudiyanto", token: "TNT-55678", detail: "B. Inggris", status: "Izin" },
  
  // Data Siswa
  { id: "S01", role: "siswa", nama: "Asaki Aktam Nijananda", token: "SIS-99001", detail: "Kelas 5 SD", status: "Aktif" },
  { id: "S02", role: "siswa", nama: "Raka Mahesa", token: "SIS-99002", detail: "Kelas 6 SD", status: "Aktif" },
  { id: "S03", role: "siswa", nama: "Shafira Maharani", token: "SIS-99003", detail: "Kelas 4 SD", status: "Aktif" },
  { id: "S04", role: "siswa", nama: "Gibran Ahmad Iqbal", token: "SIS-99004", detail: "Kelas 5 SD", status: "Nonaktif" },
];

// ================= DATA DAFTAR KELAS (ADMIN) =================
export const adminKelasStats = {
  totalSiswa: "248",
  totalKelas: "12",
  rataRata: "20.6",
  kelasPenuh: "2"
};

export const dummyKelas = [
  { 
    id: "K01", 
    nama: "Kelas 9A - Unggulan", 
    jenjang: "SMP", 
    jumlahSiswa: 24, 
    kapasitas: 25, 
    waliKelas: "Drs. Bambang H." 
  },
  { 
    id: "K02", 
    nama: "Kelas 6B - Reguler", 
    jenjang: "SD", 
    jumlahSiswa: 18, 
    kapasitas: 20, 
    waliKelas: "Sri Wahyuni, S.Pd." 
  },
  { 
    id: "K03", 
    nama: "Kelas 7C - Intensif", 
    jenjang: "SMP", 
    jumlahSiswa: 20, 
    kapasitas: 20, 
    waliKelas: "Nurul Hidayah, M.Si." 
  },
  { 
    id: "K04", 
    nama: "Kelas 5A - Basic", 
    jenjang: "SD", 
    jumlahSiswa: 15, 
    kapasitas: 25, 
    waliKelas: "Agus Susanto, S.Pd." 
  }
];

// ================= DATA KEUANGAN SPP (ADMIN) =================
export const dummySppAdmin = [
  { id: "SPP-01", nama: "Hapis Apriansyah", kelas: "Kelas 4 SD", bulan: "Mei 2026", nominal: 350000, status: "Belum Bayar", jatuhTempo: "10 Mei 2026" },
  { id: "SPP-02", nama: "Lyvia Ayuning", kelas: "Kelas 6 SD", bulan: "Mei 2026", nominal: 350000, status: "Lunas", jatuhTempo: "10 Mei 2026" },
  { id: "SPP-03", nama: "Jaidil Rachmad", kelas: "Kelas 5 SD", bulan: "Mei 2026", nominal: 350000, status: "Belum Bayar", jatuhTempo: "10 Mei 2026" },
  { id: "SPP-04", nama: "Asaki Aktam", kelas: "Kelas 5 SD", bulan: "April 2026", nominal: 350000, status: "Lunas", jatuhTempo: "10 April 2026" },
];

export const dummySiswaDropdown = [
  { id: "S01", nama: "Asaki Aktam Nijananda" },
  { id: "S02", nama: "Raka Mahesa" },
  { id: "S03", nama: "Shafira Maharani" },
  { id: "S04", nama: "Gibran Ahmad Iqbal" },
];

// ================= DATA NILAI & REPORT (ADMIN) =================
export const detailNilaiSiswa = [
  { id: 1, pertemuan: 1, tanggal: "02 Apr 2026", mapel: "B. Indonesia", materi: "Struktur Teks Narasi", nilai: 95, status: "Lengkap", catatan: "Sangat Aktif" },
  { id: 2, pertemuan: 2, tanggal: "05 Apr 2026", mapel: "Matematika", materi: "Pecahan Campuran", nilai: 88, status: "Lengkap", catatan: "Memahami Materi" },
  { id: 3, pertemuan: 3, tanggal: "09 Apr 2026", mapel: "IPAS", materi: "Siklus Hidup Hewan", nilai: 92, status: "Lengkap", catatan: "Sangat Aktif" },
  { id: 4, pertemuan: 4, tanggal: "12 Apr 2026", mapel: "Matematika", materi: "Operasi Hitung Desimal", nilai: 78, status: "Remedial", catatan: "Fokus Ditingkatkan" },
];

export const dummyCatatanWali = {
  siswaId: "S01",
  nama: "Asaki Aktam Nijananda",
  kelas: "Kelas 5 SD",
  periode: "April 2026",
  catatan: "Asaki menunjukkan kemajuan yang sangat signifikan pada pemahaman konsep Bahasa Indonesia. Namun, perlu perhatian ekstra untuk topik Pecahan Campuran di Matematika agar nilai dapat lebih konsisten di pertemuan mendatang."
};

// ================= DATA TENTOR =================
export const userTentor = {
  nama_lengkap: "Pak Guru",
  role: "tentor",
};

export const sesiTentor = [
  {
    id: "S01",
    tipe: "LIVE SESI",
    warnaTipe: "bg-red-100 text-red-600",
    durasi: "45 Menit",
    kelas: "Kelas 6A - Matematika",
    topik: "Aljabar Linear & Persamaan Dasar",
    waktu: "Hari ini, 10:30 - 11:15",
  },
  {
    id: "S02",
    tipe: "DISKUSI",
    warnaTipe: "bg-blue-100 text-blue-600",
    durasi: "60 Menit",
    kelas: "Kelas 5C - Fisika",
    topik: "Hukum Newton & Gaya Gravitasi",
    waktu: "Besok, 08:00 - 09:00",
  },
  {
    id: "S03",
    tipe: "PRAKTIKUM",
    warnaTipe: "bg-orange-100 text-orange-600",
    durasi: "90 Menit",
    kelas: "Kelas 4B - Biologi",
    topik: "Struktur Sel Tumbuhan",
    waktu: "15 Okt, 13:00 - 14:30",
  }
];

export const dummySiswaTentor = [
  { id: "S01", nama: "Asaki Aktam" },
  { id: "S02", nama: "Raka Mahesa" },
  { id: "S03", nama: "Shafira Maharani" },
];