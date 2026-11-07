import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  School,
  Users,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const menuByRole = {
  admin: [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Daftar Pengguna', path: '/admin/pengguna', icon: Users },
    { name: 'Daftar Kelas', path: '/admin/kelas', icon: School },
    { name: 'Keuangan / SPP', path: '/admin/spp', icon: Wallet },
    { name: 'Nilai & Report', path: '/admin/laporan', icon: FileText },
  ],
  tentor: [
    { name: 'Dashboard', path: '/tentor', icon: LayoutDashboard },
  ],
  siswa: [
    { name: 'Dashboard', path: '/siswa', icon: LayoutDashboard },
    { name: 'Laporan Progres Belajar', path: '/siswa/nilai', icon: FileText },
    { name: 'Tagihan SPP', path: '/siswa/spp', icon: CreditCard },
  ],
};

const portalByRole = {
  admin: 'Admin Panel',
  tentor: 'Teacher Portal',
  siswa: 'Student Portal',
};

export default function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const menuItems = menuByRole[role] ?? [];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0 h-full">
      <div className="h-20 flex items-center px-6 border-b border-slate-700/50 shrink-0">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 mr-3 shrink-0 overflow-hidden">
          <img src={logo} alt="Logo Pilar Cendekia" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-tight text-white">Pilar Cendekia</span>
          <span className="text-[10px] text-blue-400 tracking-widest uppercase mt-1">
            {portalByRole[role] ?? 'Portal'}
          </span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {menuItems.map(({ name, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={name}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{name}</span>
            </Link>
          );
        })}
      </nav>

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
  );
}
