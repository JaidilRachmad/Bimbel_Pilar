import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, CreditCard, LogOut, Bell, User 
} from 'lucide-react';
import { userSiswa } from '../data/dummy';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const role = user?.role;
  const name = user?.nama ?? (role === 'admin' ? 'Admin' : roleLabel[role] ?? 'Pengguna');
  const detail = role === 'siswa' ? user?.kelas ?? 'Siswa' : roleLabel[role] ?? 'Pengguna';
  const avatarClass = role === 'tentor'
    ? 'bg-orange-100 text-orange-600'
    : 'bg-blue-100 text-blue-600';

  return (
    // h-screen w-screen overflow-hidden memastikan layout tidak melebar keluar layar
    <div className="flex h-screen w-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      {/* w-64 shrink-0 memastikan lebar sidebar tetap 64 (256px) dan tidak mengecil */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0 h-full">
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-slate-700/50 shrink-0">
          {/* Bungkus gambar di div fixed size agar tidak meluber */}
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 mr-3 shrink-0 overflow-hidden">
            <img 
              src="/logo-pilar-cendekia.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-white">Pilar<br/>Cendekia</span>
            <span className="text-[10px] text-blue-400 tracking-widest uppercase mt-1">Student Portal</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white font-semibold shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700/50 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      {/* flex-1 w-full overflow-x-hidden memastikan konten mengambil sisa ruang dengan benar */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">

          <div className="ml-auto flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-blue-600">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{userSiswa.nama_lengkap}</p>
                <p className="text-xs text-gray-500">{userSiswa.kelas}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Area Halaman */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>

      </div>
    </div>
  );
}