import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getKelasMy } from '../../services/kelasTentorService';
import { ChevronRight, LoaderCircle, School, Users } from 'lucide-react';

export default function DashboardTentor() {
  const navigate = useNavigate();
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getKelasMy()
      .then((assignments) => {
        if (active) setKelasList(assignments.filter((a) => a.kelas));
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Gagal memuat kelas yang diampu.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Beranda Guru</h1>
        <p className="mt-1 text-gray-500">Pilih kelas yang kamu ampu untuk mengelola sesi pembelajaran.</p>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white p-10 text-sm text-gray-500">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Memuat kelas...
        </div>
      ) : kelasList.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Kamu belum ditugaskan ke kelas mana pun. Hubungi admin untuk penugasan kelas.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {kelasList.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/tentor/kelas/${item.kelas_id}`)}
              className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="mb-5 flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <School className="h-6 w-6" />
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{item.kelas.nama_kelas}</h2>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <span>{item.kelas.jenjang}</span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {item.kelas.kelas_siswa?.length || 0} siswa
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
