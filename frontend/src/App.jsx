import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import DashboardSiswa from './pages/siswa/DashboardSiswa';
import LaporanProgres from './pages/siswa/LaporanProgres';
import TagihanSpp from './pages/siswa/TagihanSpp';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import DaftarPengguna from './pages/admin/DaftarPengguna';
import DaftarKelas from './pages/admin/DaftarKelas';
import ManajemenSpp from './pages/admin/ManajemenSpp';
import NilaiReport from './pages/admin/NilaiReport';
import DashboardTentor from './pages/tentor/DashboardTentor';



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rute Siswa */}
        <Route path="/siswa" element={<DashboardSiswa />} />
        <Route path="/siswa/nilai" element={<LaporanProgres />} />
        <Route path="/siswa/spp" element={<TagihanSpp />} />

        {/* Rute Admin */}
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/pengguna" element={<DaftarPengguna />} />
        <Route path="/admin/kelas" element={<DaftarKelas />} />
        <Route path="/admin/spp" element={<ManajemenSpp />} />
        <Route path="/admin/laporan" element={<NilaiReport />} />

        {/* Rute Tentor */}
        <Route path="/tentor" element={<DashboardTentor />} />
      </Routes>
    </BrowserRouter>
  );
}
