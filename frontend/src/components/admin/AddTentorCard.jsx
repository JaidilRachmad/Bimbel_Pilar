import { useState } from 'react'
import { ArrowLeft, UserRoundPlus } from 'lucide-react'

export default function AddTentorCard({ onSubmit, onBack, submitting, error }) {
  const [form, setForm] = useState({ nama: '', noTelp: '', extraField: '' })

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
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-700">
        <ArrowLeft className="h-4 w-4" /> Pilih jenis pengguna
      </button>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <UserRoundPlus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Tambah Guru / Tentor</h3>
          <p className="text-sm text-gray-500">Isi data profil tentor untuk membuat akun.</p>
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
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={submitting} className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Membuat akun...' : 'Buat akun tentor'}
        </button>
      </div>
    </form>
  )
}
