import { useEffect, useState } from 'react'
import { ArrowLeft, UserRoundPlus, X } from 'lucide-react'

export default function AddTentorCard({
  initialData,
  mode = 'create',
  kelasList = [],
  kelasLoading = false,
  kelasError = '',
  initialKelasIds = [],
  onSubmit,
  onBack,
  submitting,
  error,
}) {
  const [form, setForm] = useState({
    nama: initialData?.nama ?? '',
    noTelp: initialData?.no_telp ?? '',
    extraField: initialData?.extraField ?? '',
  })
  const [kelasIds, setKelasIds] = useState(initialKelasIds)
  useEffect(() => {
    setKelasIds(initialKelasIds)
  }, [initialKelasIds])

  const hasChanges = mode === 'edit' && (
    form.nama.trim() !== (initialData?.nama ?? '').trim()
    || form.noTelp.trim() !== (initialData?.no_telp ?? '').trim()
    || form.extraField.trim() !== (initialData?.extraField ?? '').trim()
    || kelasIds.length !== initialKelasIds.length
    || kelasIds.some((kelasId) => !initialKelasIds.includes(kelasId))
  )

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      role: 'tentor',
      nama: form.nama.trim(),
      noTelp: form.noTelp.trim(),
      extraField: form.extraField.trim(),
      kelasIds,
    })
  }

  const toggleKelas = (kelasId) => {
    setKelasIds((currentIds) => (
      currentIds.includes(kelasId)
        ? currentIds.filter((currentId) => currentId !== kelasId)
        : [...currentIds, kelasId]
    ))
  }

  const removeKelas = (kelasId) => {
    setKelasIds((currentIds) => currentIds.filter((currentId) => currentId !== kelasId))
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      {mode === 'create' && (
        <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" /> Pilih jenis pengguna
        </button>
      )}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <UserRoundPlus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{mode === 'edit' ? 'Edit Data Guru / Tentor' : 'Tambah Guru / Tentor'}</h3>
          <p className="text-sm text-gray-500">{mode === 'edit' ? 'Perbarui profil dan kelas yang diampu.' : 'Isi profil tentor dan pilih kelas yang diampu.'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Nama lengkap
          <input name="nama" value={form.nama} onChange={updateField} required maxLength={100} autoComplete="name" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Nomor telepon
          <input name="noTelp" value={form.noTelp} onChange={updateField} required maxLength={30} type="tel" autoComplete="tel" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Alamat
          <textarea name="extraField" value={form.extraField} onChange={updateField} required maxLength={500} rows={3} autoComplete="street-address" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </label>
        <fieldset className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <legend className="px-1 text-sm font-medium text-gray-700">Kelas yang diampu</legend>
          {kelasLoading ? (
            <p className="py-2 text-sm text-gray-500">Memuat daftar kelas...</p>
          ) : kelasError ? (
            <p role="alert" className="py-2 text-sm text-red-600">{kelasError}</p>
          ) : kelasList.length === 0 ? (
            <p className="py-2 text-sm text-gray-500">Belum ada kelas yang tersedia.</p>
          ) : (
            <>
              <div className="mt-2 grid max-h-40 gap-2 overflow-y-auto sm:grid-cols-2">
                {kelasList.map((kelas) => (
                  <label key={kelas.id} className="flex cursor-pointer items-center gap-2 rounded-md bg-white px-2.5 py-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={kelasIds.includes(kelas.id)}
                      onChange={() => toggleKelas(kelas.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500"
                    />
                    <span>{kelas.nama_kelas} <span className="text-xs text-gray-400">({kelas.jenjang})</span></span>
                  </label>
                ))}
              </div>
              {kelasIds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-200 pt-3">
                  {kelasList.filter((kelas) => kelasIds.includes(kelas.id)).map((kelas) => (
                    <span key={kelas.id} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                      {kelas.nama_kelas}
                      <button type="button" onClick={() => removeKelas(kelas.id)} aria-label={`Hapus ${kelas.nama_kelas}`} className="rounded-full hover:bg-blue-200">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </fieldset>
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={submitting || (mode === 'edit' && !hasChanges)} className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? (mode === 'edit' ? 'Menyimpan...' : 'Membuat akun...') : (mode === 'edit' ? 'Simpan perubahan' : 'Buat akun tentor')}
        </button>
      </div>
    </form>
  )
}
