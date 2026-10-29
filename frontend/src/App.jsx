import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GuestRoute, ProtectedRoute } from './components/RouteGuards'
// import LoginToken from './pages/LoginToken'
// import LoginAdmin from './pages/LoginAdmin'
// import AdminLayout from './layouts/AdminLayout'
// import TentorLayout from './layouts/TentorLayout'
// import DashboardLayout from './layouts/DashboardLayout'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginToken = lazy(() => import('./pages/LoginToken'))
const LoginAdmin = lazy(() => import('./pages/LoginAdmin'))

const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const TentorLayout = lazy(() => import('./layouts/TentorLayout'))
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))

const DaftarPengguna = lazy(() => import('./pages/admin/DaftarPengguna'))
const DaftarKelas = lazy(() => import('./pages/admin/DaftarKelas'))

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader__spinner" />
      <p>Memuat halaman...</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginToken />} />
              <Route path="/admin/login" element={<LoginAdmin />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout/>} />
              <Route path="/admin/pengguna" element={<DaftarPengguna />} />
              <Route path="/admin/kelas" element={<DaftarKelas />} />
            </Route>
            
            <Route element={<ProtectedRoute roles={['tentor']} />}>
              <Route path="/tentor/*" element={<TentorLayout />} />
            </Route>
            <Route element={<ProtectedRoute roles={['siswa']} />}>
              <Route path="/siswa/*" element={<DashboardLayout/>} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
