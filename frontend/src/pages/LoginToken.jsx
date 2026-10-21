import { useState } from 'react'
import { ArrowRight, KeyRound, Lock } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { getErrorInfo, loginWithToken } from '../services/authService'
import { Link } from 'react-router-dom'
import '../styles/auth.css'

export default function LoginToken() {
  const { login } = useAuth()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const value = token.trim()
    if (!value) {
      setError('Token akses wajib diisi.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await loginWithToken(value)
      login(data, true) // GuestRoute otomatis mengarahkan ke dashboard sesuai role
    } catch (err) {
      setError(getErrorInfo(err).message)
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="auth-title">Masuk dengan Token</h1>
      <p className="auth-subtitle">
        Gunakan token akses yang diberikan oleh admin untuk mengakses portal pembelajaran.
      </p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="field-label" htmlFor="token">Token Akses</label>
        <div className="field">
          <KeyRound size={16} />
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Masukkan token akses"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            disabled={loading}
          />
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : <>Masuk ke Platform <ArrowRight size={16} /></>}
        </button>
      </form>

      <p className="secure-note"><Lock size={12} /> SISTEM PEMBELAJARAN TERENKRIPSI</p>
      <Link to="/admin/login" className="switch-link">Masuk sebagai Admin</Link>
    </AuthLayout>
  )
}