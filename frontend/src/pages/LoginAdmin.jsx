import { useEffect, useState } from 'react'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { supabase } from '../config/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { getErrorInfo, loginAdmin } from '../services/authService'
import { Link } from 'react-router-dom'
import '../styles/auth.css'

function formatCountdown(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function LoginAdmin() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [lockSeconds, setLockSeconds] = useState(0)

  const locked = lockSeconds > 0

  // Hitung mundur saat akun terkunci (HTTP 429 dari backend)
  useEffect(() => {
    if (lockSeconds <= 0) return
    const id = setTimeout(() => setLockSeconds((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [lockSeconds])

  async function handleSubmit(e) {
    e.preventDefault()
    if (locked) return

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.')
      return
    }

    setLoading(true)
    setError('')
    setInfo('')
    try {
      const data = await loginAdmin(email.trim(), password)
      login(data, remember)
    } catch (err) {
      const e2 = getErrorInfo(err)
      let msg = e2.message
      if (e2.status === 429 && e2.retryAfter) setLockSeconds(e2.retryAfter)
      if (e2.status === 401 && typeof e2.remainingAttempts === 'number') {
        msg += ` Sisa percobaan: ${e2.remainingAttempts}.`
      }
      setError(msg)
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    setError('')
    setInfo('')
    if (!email.trim()) {
      setError('Isi email terlebih dahulu, lalu klik "Lupa Password?".')
      return
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )
    if (resetError) {
      setError('Gagal mengirim email reset password. Coba lagi nanti.')
    } else {
      setInfo('Jika email terdaftar, tautan reset password telah dikirim.')
    }
  }

  return (
    <AuthLayout logoTile>
      <h1 className="auth-title">Login Admin</h1>
      <p className="auth-subtitle">Masuk menggunakan email dan password terdaftar.</p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="field-label" htmlFor="email">Email</label>
        <div className="field">
          <Mail size={16} />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            autoComplete="username"
            disabled={loading}
          />
        </div>

        <div className="field-label">
          <label htmlFor="password">Password</label>
          <button type="button" className="link-btn" onClick={handleForgotPassword}>
            Lupa Password?
          </button>
        </div>
        <div className="field">
          <Lock size={16} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
          />
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <label className="check-row">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Ingat saya di perangkat ini
        </label>

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {info && <div className="alert alert-info" role="status">{info}</div>}

        <button type="submit" className="btn-primary" disabled={loading || locked}>
          {loading ? (
            <span className="spinner" />
          ) : locked ? (
            `Coba lagi dalam ${formatCountdown(lockSeconds)}`
          ) : (
            <>Login ke Dashboard <ArrowRight size={16} /></>
          )}
        </button>
      </form>
      <Link to="/login" className="switch-link">Masuk dengan Token (Siswa/Tentor)</Link>
    </AuthLayout>
  )
}