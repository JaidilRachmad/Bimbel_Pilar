import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GuestRoute, ProtectedRoute } from './components/RouteGuards'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginToken = lazy(() => import('./pages/LoginToken'))
const LoginAdmin = lazy(() => import('./pages/LoginAdmin'))

// siswa
const DashboardSiswa = lazy(()=> import('./pages/siswa/DashboardSiswa'))
const NilaiSiswa = lazy(() => import('./pages/siswa/LaporanProgres'))
const TagihanSpp = lazy(() => import('./pages/siswa/TagihanSpp'))

// tentor
const DashboardTentor = lazy(()=> import('./pages/tentor/DashboardTentor'))

// admin
const DashboardAdmin = lazy(() => import('./pages/admin/DashboardAdmin'))
const DaftarPengguna = lazy(() => import('./pages/admin/DaftarPengguna'))
const DaftarKelas = lazy(() => import('./pages/admin/DaftarKelas'))
const LaporanBelajar = lazy(() => import('./pages/admin/NilaiReport'))
const ManajemenSpp = lazy(() => import('./pages/admin/ManajemenSpp'))

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
              <Route path="/admin" element={<DashboardAdmin/>} />
              <Route path="/admin/pengguna" element={<DaftarPengguna />} />
              <Route path="/admin/kelas" element={<DaftarKelas />} />
              <Route path="/admin/laporan" element={<LaporanBelajar />} />
              <Route path="/admin/spp" element={<ManajemenSpp />} />
            </Route>
            
            <Route element={<ProtectedRoute roles={['tentor']} />}>
              <Route path="/tentor" element={<DashboardTentor />} />
            </Route>

            <Route element={<ProtectedRoute roles={['siswa']} />}>
              <Route path="/siswa" element={<DashboardSiswa/>} />
              <Route path="/siswa/nilai" element={<NilaiSiswa/>} />
              <Route path="/siswa/spp" element={<TagihanSpp/>} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>

    </BrowserRouter>
  )
}
