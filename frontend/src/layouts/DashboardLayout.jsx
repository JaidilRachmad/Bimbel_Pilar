import { useState } from 'react';
import { Bell, PanelLeftOpen, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';

const roleLabel = {
  admin: 'Admin',
  tentor: 'Tentor',
  siswa: 'Siswa',
};

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const role = user?.role;
  const name = user?.nama ?? (role === 'admin' ? 'Admin' : roleLabel[role] ?? 'Pengguna');
  const detail = role === 'siswa' ? user?.kelas ?? 'Siswa' : roleLabel[role] ?? 'Pengguna';
  const avatarClass = role === 'tentor'
    ? 'bg-orange-100 text-orange-600'
    : 'bg-blue-100 text-blue-600';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar
        role={role}
        open={isSidebarOpen}
        desktopOpen={isDesktopSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCollapse={() => {
          setIsSidebarOpen(false);
          setIsDesktopSidebarOpen(false);
        }}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Buka sidebar"
              title="Buka sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 lg:hidden"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
            {!isDesktopSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsDesktopSidebarOpen(true)}
                aria-label="Buka sidebar"
                title="Buka sidebar"
                className="hidden h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 lg:flex"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="ml-auto flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-blue-600">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${avatarClass}`}>
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{name}</p>
                <p className="text-xs text-gray-500">{detail}</p>
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
