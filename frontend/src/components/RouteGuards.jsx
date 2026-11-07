import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homePath } from '../utils/roles'

export function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="screen-center">Memuat…</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePath(user.role)} replace />
  }
  return <Outlet />
}

// Halaman login: kalau sudah login, langsung ke dashboard sesuai role
export function GuestRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="screen-center">Memuat…</div>
  if (user) return <Navigate to={homePath(user.role)} replace />
  return <Outlet />
}