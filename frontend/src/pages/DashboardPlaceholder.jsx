import { useAuth } from '../context/AuthContext'
import '../styles/auth.css'

export default function DashboardPlaceholder({ title }) {
  const { user, logout } = useAuth()
  return (
    <main className="dash">
      <h1>{title}</h1>
      <p>Login berhasil sebagai <strong>{user.role}</strong>.</p>
      <p className="dash-id">ID: {user.id}</p>
      <button className="btn-primary" onClick={logout}>Logout</button>
    </main>
  )
}