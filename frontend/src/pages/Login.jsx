import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowLeft, KeyRound, Mail, Lock, Code } from 'lucide-react';

export default function Login() {
  const [loginType, setLoginType] = useState('user');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      alert('Backend belum siap. Silakan gunakan tombol Dev Bypass di kanan atas.');
    }, 1000);
  };

  const handleDevLogin = (role) => {
    localStorage.setItem('dev_role', role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'tentor') navigate('/tentor');
    else navigate('/siswa');
  };

  return (
    <div className="min-h-screen flex w-full font-sans">
      
      {/* ================= AREA DEV MODE ================= */}
      <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-400 p-4 rounded-lg shadow-sm text-sm z-50">
        <p className="font-bold text-yellow-800 mb-2 flex items-center gap-1"><Code className="w-4 h-4"/> DEV MODE</p>
        <p className="text-yellow-700 mb-2 text-xs">Bypass login untuk tes UI:</p>
        <div className="flex gap-2">
          <button onClick={() => handleDevLogin('siswa')} className="bg-white border px-2 py-1 rounded hover:bg-slate-50 font-semibold shadow-sm">Siswa</button>
          <button onClick={() => handleDevLogin('tentor')} className="bg-white border px-2 py-1 rounded hover:bg-slate-50 font-semibold shadow-sm">Tentor</button>
          <button onClick={() => handleDevLogin('admin')} className="bg-white border px-2 py-1 rounded hover:bg-slate-50 font-semibold shadow-sm">Admin</button>
        </div>
      </div>
      {/* ================================================== */}

      {/* ================= SISI KIRI (BRANDING) ================= */}
      {/* hidden lg:flex artinya hanya muncul di layar besar */}
      <div className="hidden lg:flex w-1/2 bg-[#0F172A] text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-screen filter blur-[100px] opacity-30"></div>
        
        <div className="relative z-10 text-center max-w-md">
          <img 
            src="/logo-pilar-cendekia.png" 
            alt="Pilar Cendekia" 
            className="h-32 w-auto mx-auto mb-8 bg-white rounded-2xl p-3 shadow-2xl" 
          />
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Sistem Informasi<br/>Bimbel Pilar Cendekia</h1>
          <p className="text-blue-200 text-lg">Platform terintegrasi untuk siswa, tentor, dan admin dalam mengelola kegiatan belajar mengajar.</p>
        </div>
      </div>

      {/* ================= SISI KANAN (FORM LOGIN) ================= */}
      <div className="w-full lg:w-1/2 bg-[#F8FAFC] flex flex-col justify-center items-center p-6 relative">
        
        {/* Tombol Back (Hanya muncul di Mobile) */}
        <Link to="/" className="absolute top-8 left-8 lg:hidden text-slate-400 hover:text-[#1E3A8A] transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        
        {/* Tombol Back (Muncul di Desktop) */}
        <Link to="/" className="absolute top-8 left-8 hidden lg:flex items-center gap-2 text-slate-500 hover:text-[#1E3A8A] transition font-medium">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
        </Link>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 border border-slate-100">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Selamat Datang</h2>
            <p className="text-slate-500 mt-2 text-sm">
              {loginType === 'user' ? 'Masukan token akses untuk masuk ke portal.' : 'Masuk ke panel khusus Administrator.'}
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
            <button 
              onClick={() => { setLoginType('user'); setError(''); }} 
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${loginType === 'user' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Siswa / Tentor
            </button>
            <button 
              onClick={() => { setLoginType('admin'); setError(''); }} 
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${loginType === 'admin' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Admin
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-100">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-5">
            {loginType === 'user' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Token Akses</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    value={token} 
                    onChange={(e) => setToken(e.target.value)} 
                    placeholder="Contoh: AKS-12345" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none uppercase transition-all" 
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Admin</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="admin@pilarcendekia.com" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition-all" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition-all" 
                    />
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#1E3A8A] text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-900 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Memproses...' : <><LogIn className="w-5 h-5" /> Masuk Ke Platform</>}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-8">
            &copy; {new Date().getFullYear()} Bimbel Pilar Cendekia. All rights reserved.
          </p>
        </div>
      </div>

    </div>
  );
}