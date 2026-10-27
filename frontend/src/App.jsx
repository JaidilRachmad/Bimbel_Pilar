import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GuestRoute, ProtectedRoute } from './components/RouteGuards'
import LoginToken from './pages/LoginToken'
import LoginAdmin from './pages/LoginAdmin'
import AdminLayout from './layouts/AdminLayout'
import TentorLayout from './layouts/TentorLayout'
import DashboardLayout from './layouts/DashboardLayout'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginToken />} />
            <Route path="/admin/login" element={<LoginAdmin />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout/>} />
          </Route>
          <Route element={<ProtectedRoute roles={['tentor']} />}>
            <Route path="/tentor" element={<TentorLayout />} />
          </Route>
          <Route element={<ProtectedRoute roles={['siswa']} />}>
            <Route path="/siswa" element={<DashboardLayout/>} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
