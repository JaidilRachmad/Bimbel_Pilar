import { useEffect, useState } from 'react'
import { GraduationCap, UserRoundPlus, Users, X } from 'lucide-react'
import { getAllKelas } from '../../services/kelasService'
import AddSiswaCard from './AddSiswaCard'
import AddTentorCard from './AddTentorCard'

export default function AddUserModal({ onClose, onSubmit, submitting, error }) {
  const [role, setRole] = useState(null)
  const [kelasList, setKelasList] = useState([])
  const [kelasLoaded, setKelasLoaded] = useState(false)
  const [kelasError, setKelasError] = useState('')
  const kelasLoading = role === 'siswa' && !kelasLoaded && !kelasError

  const returnToRoleSelection = () => {
    setRole(null)
    setKelasList([])
    setKelasLoaded(false)
    setKelasError('')
  }

  useEffect(() => {
    if (role !== 'siswa' || kelasLoaded) return undefined

    let active = true

    async function loadAllKelas() {
      try {
        const firstPage = await getAllKelas({ page: 1, limit: 100 })
        if (!Array.isArray(firstPage?.data) || !firstPage.meta) {
          throw new Error('Format data kelas dari server tidak valid.')
        }

        const allKelas = [...firstPage.data]
        for (let page = 2; page <= firstPage.meta.total_pages; page += 1) {
          const result = await getAllKelas({ page, limit: 100 })
          if (!Array.isArray(result?.data) || !result.meta) {
            throw new Error('Format data kelas dari server tidak valid.')
          }
          allKelas.push(...result.data)
        }

        if (active) setKelasList(allKelas)
      } catch (requestError) {
        if (active) {
          setKelasError(requestError.response?.data?.message || requestError.message || 'Gagal memuat kelas.')
        }
      } finally {
        if (active) setKelasLoaded(true)
      }
    }

    loadAllKelas()
    return () => {
      active = false
    }
  }, [role, kelasLoaded])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="add-user-title" className="my-auto w-full max-w-xl rounded-2xl bg-gray-50 p-5 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 id="add-user-title" className="text-xl font-bold text-gray-900">Tambah Pengguna</h2>
            <p className="mt-1 text-sm text-gray-500">Pilih jenis akun yang ingin dibuat.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {role === null ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <button type="button" onClick={() => setRole('tentor')} className="rounded-2xl border border-blue-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-500 hover:shadow-md">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="block font-bold text-gray-900">Tambah Guru / Tentor</span>
              <span className="mt-1 block text-sm text-gray-500">Buat akun tentor dan isi data alamatnya.</span>
              <UserRoundPlus className="mt-5 h-5 w-5 text-blue-700" />
            </button>
            <button type="button" onClick={() => setRole('siswa')} className="rounded-2xl border border-orange-200 bg-white p-5 text-left shadow-sm transition hover:border-orange-500 hover:shadow-md">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                <Users className="h-5 w-5" />
              </span>
              <span className="block font-bold text-gray-900">Tambah Siswa</span>
              <span className="mt-1 block text-sm text-gray-500">Buat akun siswa dan tentukan kelasnya.</span>
              <UserRoundPlus className="mt-5 h-5 w-5 text-orange-700" />
            </button>
          </div>
        ) : role === 'tentor' ? (
          <AddTentorCard
            onSubmit={onSubmit}
            onBack={returnToRoleSelection}
            submitting={submitting}
            error={error}
          />
        ) : (
          <AddSiswaCard
            kelasList={kelasList}
            kelasLoading={kelasLoading}
            kelasError={kelasError}
            onSubmit={onSubmit}
            onBack={returnToRoleSelection}
            submitting={submitting}
            error={error}
          />
        )}
      </section>
    </div>
  )
}
