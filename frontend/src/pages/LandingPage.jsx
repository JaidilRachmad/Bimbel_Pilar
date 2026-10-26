import { Link } from 'react-router-dom';
import {
  BookOpen, Users, BarChart3, CreditCard, ShieldCheck,
  Sparkles, ArrowRight, GraduationCap, LogIn, Menu, X
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    {
      icon: <BookOpen className="w-7 h-7" />,
      title: 'Sesi Pembelajaran Terstruktur',
      desc: 'Jadwal, materi, dan link pertemuan tercatat rapi per kelas.',
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: 'Penilaian & Raport Otomatis',
      desc: 'Nilai tiap pertemuan direkap otomatis, raport dilengkapi deskripsi AI.',
    },
    {
      icon: <CreditCard className="w-7 h-7" />,
      title: 'SPP & E-Kwitansi Digital',
      desc: 'Tagihan bulanan, status pembayaran, dan kwitansi digital.',
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: 'Multi Peran',
      desc: 'Dashboard untuk siswa, tentor, dan admin dengan akses berbeda.',
    },
    {
      icon: <ShieldCheck className="w-7 h-7" />,
      title: 'Keamanan Berlapis',
      desc: 'Autentikasi Supabase + Row Level Security untuk perlindungan data.',
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: 'Deskripsi AI untuk Raport',
      desc: 'Catatan wali kelas digenerate otomatis, tinggal disunting admin.',
    },
  ];

  const roles = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: 'Siswa',
      desc: 'Lihat jadwal, materi, nilai, raport, dan status SPP.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Tentor',
      desc: 'Kelola sesi, input nilai, pantau perkembangan siswa.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: 'Admin',
      desc: 'Kelola user, kelas, tagihan, dan laporan progres.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800">

      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo-pilar-cendekia.png"
              alt="Pilar Cendekia"
              className="h-12 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#fitur" className="hover:text-[#2C5FA8] transition">Fitur</a>
            <a href="#peran" className="hover:text-[#2C5FA8] transition">Peran</a>
            <a href="#tentang" className="hover:text-[#2C5FA8] transition">Tentang</a>
          </div>

          <div className="hidden md:block">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C5FA8] text-white rounded-lg font-semibold hover:bg-[#1E4A85] transition shadow-sm hover:shadow-md"
            >
              <LogIn className="w-4 h-4" /> Masuk
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-[#2C5FA8]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-3 text-sm font-medium">
            <a href="#fitur" className="block py-1" onClick={() => setMenuOpen(false)}>Fitur</a>
            <a href="#peran" className="block py-1" onClick={() => setMenuOpen(false)}>Peran</a>
            <a href="#tentang" className="block py-1" onClick={() => setMenuOpen(false)}>Tentang</a>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 mt-2 px-5 py-2.5 bg-[#2C5FA8] text-white rounded-lg font-semibold"
              onClick={() => setMenuOpen(false)}
            >
              <LogIn className="w-4 h-4" /> Masuk
            </Link>
          </div>
        )}
      </nav>

      {/* ================= HERO ================= */}
      <section className="pt-36 pb-20 px-6 relative overflow-hidden bg-gradient-to-b from-[#E8F6FE] to-white">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#4DB8F0] rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#F5A623] rounded-full blur-3xl opacity-20" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Logo besar di hero */}
          <img
            src="/logo-pilar-cendekia.png"
            alt="Pilar Cendekia"
            className="h-32 md:h-40 w-auto mx-auto mb-8 drop-shadow-lg"
          />

          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2C5FA8]/10 text-[#2C5FA8] rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Platform Bimbingan Belajar Terintegrasi
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Belajar Lebih Terarah,
            <br />
            <span className="bg-gradient-to-r from-[#2C5FA8] to-[#4DB8F0] bg-clip-text text-transparent">
              Progres Lebih Terukur
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Kelola jadwal, materi, penilaian, raport, dan pembayaran SPP
            dalam satu platform. Untuk siswa, tentor, dan admin.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#2C5FA8] text-white rounded-xl font-semibold hover:bg-[#1E4A85] transition shadow-lg shadow-[#2C5FA8]/30"
            >
              <LogIn className="w-5 h-5" /> Masuk ke Dashboard
            </Link>
            <a
              href="#fitur"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-[#2C5FA8] hover:text-[#2C5FA8] transition"
            >
              Lihat Fitur <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="fitur" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">Fitur Utama</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola bimbingan belajar, dalam satu platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-[#4DB8F0] hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2C5FA8] to-[#4DB8F0] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ROLES ================= */}
      <section id="peran" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">Satu Platform, Tiga Peran</h2>
            <p className="mt-3 text-slate-600">
              Setiap pengguna punya dashboard sendiri sesuai kebutuhannya.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((r, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-gradient-to-br from-[#E8F6FE] to-white border border-slate-200 hover:shadow-lg transition"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#2C5FA8] text-white flex items-center justify-center mb-5">
                  {r.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{r.title}</h3>
                <p className="text-slate-600 text-sm">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section id="tentang" className="py-20 px-6">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2C5FA8] to-[#4DB8F0] px-8 py-16 text-center text-white">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#F5A623]/20 rounded-full blur-3xl" />

          <div className="relative">
            <img
              src="/logo-pilar-cendekia.png"
              alt="Pilar Cendekia"
              className="h-20 w-auto mx-auto mb-6 bg-white rounded-2xl p-2"
            />
            <h2 className="text-3xl md:text-4xl font-bold">Siap Memulai?</h2>
            <p className="mt-4 text-white/90 max-w-xl mx-auto">
              Masuk ke dashboard Anda menggunakan akun yang sudah diberikan admin.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-white text-[#2C5FA8] rounded-xl font-semibold hover:bg-slate-100 transition shadow-lg"
            >
              <LogIn className="w-5 h-5" /> Masuk Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 py-10 px-6 text-center text-sm text-slate-500">
        <img
          src="/logo-pilar-cendekia.png"
          alt="Pilar Cendekia"
          className="h-12 w-auto mx-auto mb-3"
        />
        <p>© {new Date().getFullYear()} Pilar Cendekia. Platform Bimbingan Belajar Terintegrasi.</p>
        <p className="mt-1">
          <a href="https://pilarcendekia.com" className="text-[#2C5FA8] hover:underline">
            pilarcendekia.com
          </a>
        </p>
      </footer>
    </div>
  );
}