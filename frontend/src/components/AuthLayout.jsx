import { ChevronDown, Globe } from 'lucide-react'
import logo from '../assets/logo.png'

export default function AuthLayout({ children, logoTile = false }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <img
          src={logo}
          alt="Logo Pilar Cendekia"
          className={`auth-logo${logoTile ? ' tile' : ''}`}
        />
        {children}
      </section>

      <footer className="auth-footer">
        <div className="auth-footer-links">
          <span>Pusat Bantuan</span>
          <span>Kebijakan Privasi</span>
          <span>Syarat &amp; Ketentuan</span>
        </div>
        <span className="lang-pill">
          <Globe size={13} /> Bahasa Indonesia <ChevronDown size={13} />
        </span>
        <small>© {new Date().getFullYear()} Pilar Cendekia. Seluruh Hak Cipta Dilindungi.</small>
      </footer>
    </main>
  )
}