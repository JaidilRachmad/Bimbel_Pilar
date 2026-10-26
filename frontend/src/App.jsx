import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GuestRoute, ProtectedRoute } from './components/RouteGuards'
import LoginToken from './pages/LoginToken'
import LoginAdmin from './pages/LoginAdmin'
import DashboardPlaceholder from './pages/DashboardPlaceholder'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginToken />} />
            <Route path="/admin/login" element={<LoginAdmin />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<DashboardPlaceholder title="Dashboard Admin" />} />
          </Route>
          <Route element={<ProtectedRoute roles={['tentor']} />}>
            <Route path="/tentor" element={<DashboardPlaceholder title="Dashboard Tentor" />} />
          </Route>
          <Route element={<ProtectedRoute roles={['siswa']} />}>
            <Route path="/siswa" element={<DashboardPlaceholder title="Dashboard Siswa" />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
