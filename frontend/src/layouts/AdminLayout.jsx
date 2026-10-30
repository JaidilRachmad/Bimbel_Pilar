import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, School, Wallet, FileText, LogOut, Bell, Search, User 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png'

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Menu khusus Admin
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Daftar Pengguna', path: '/admin/pengguna', icon: <Users className="w-5 h-5" /> },
    { name: 'Daftar Kelas', path: '/admin/kelas', icon: <School className="w-5 h-5" /> },
    { name: 'Keuangan / SPP', path: '/admin/spp', icon: <Wallet className="w-5 h-5" /> },
    { name: 'Nilai & Report', path: '/admin/laporan', icon: <FileText className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-gray-900 overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-4 border-b border-slate-700/50">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 mr-3 shrink-0">
            <img src={logo} alt="Logo Pilar Cendekia" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-white">Pilar Cendekia</span>
            <span className="text-[10px] text-blue-400 tracking-widest uppercase mt-1">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
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

        <div className="p-4 border-t border-slate-700/50">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari data, laporan..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-blue-600">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Super Admin</p>
                <p className="text-xs text-gray-500">Pilar Cendekia Pusat</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}