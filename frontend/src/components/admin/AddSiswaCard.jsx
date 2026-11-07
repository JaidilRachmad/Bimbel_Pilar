import { useState } from 'react'
import { ArrowLeft, UserRoundPlus } from 'lucide-react'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const MIN_YEAR = 2000
const MAX_YEAR = 2100

export default function AddSiswaCard({
  kelasList,
  kelasLoading,
  kelasError,
  initialData,
  mode = 'create',
  onSubmit,
  onBack,
  submitting,
  error,
}) {
  const [form, setForm] = useState({
    nama: initialData?.nama ?? '',
    noTelp: initialData?.no_telp ?? '',
    extraField: initialData?.extraField ?? '',
    kelasId: initialData?.kelas?.id ?? '',
    bulanMulai: '',
    tahunMulai: '',
    bulanSelesai: '',
    tahunSelesai: '',
    nominal: '',
  })
  const hasChanges = mode === 'edit' && (
    form.nama.trim() !== (initialData?.nama ?? '').trim()
    || form.noTelp.trim() !== (initialData?.no_telp ?? '').trim()
    || form.extraField.trim() !== (initialData?.extraField ?? '').trim()
  )

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      role: 'siswa',
      nama: form.nama.trim(),
      noTelp: form.noTelp.trim(),
      extraField: form.extraField.trim(),
      kelasId: form.kelasId,
      bulanMulai: form.bulanMulai,
      tahunMulai: Number(form.tahunMulai),
      bulanSelesai: form.bulanSelesai,
      tahunSelesai: Number(form.tahunSelesai),
      nominal: Number(form.nominal),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
      {mode === 'create' && (
        <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-700">
          <ArrowLeft className="h-4 w-4" /> Pilih jenis pengguna
        </button>
      )}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
          <UserRoundPlus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{mode === 'edit' ? 'Edit Data Siswa' : 'Tambah Siswa'}</h3>
          <p className="text-sm text-gray-500">{mode === 'edit' ? 'Perbarui data profil siswa.' : 'Isi data siswa dan pilih kelas yang tersedia.'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Nama lengkap
          <input name="nama" value={form.nama} onChange={updateField} required maxLength={100} autoComplete="name" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Nomor telepon
          <input name="noTelp" value={form.noTelp} onChange={updateField} required maxLength={30} type="tel" autoComplete="tel" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Nama orang tua / wali
          <input name="extraField" value={form.extraField} onChange={updateField} required maxLength={100} autoComplete="name" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
        </label>
        {mode === 'create' ? <label className="block text-sm font-medium text-gray-700">
          Kelas
          <select name="kelasId" value={form.kelasId} onChange={updateField} required disabled={kelasLoading || kelasList.length === 0} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100">
            <option value="">{kelasLoading ? 'Memuat kelas...' : 'Pilih kelas'}</option>
            {kelasList.map((kelas) => (
              <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas} ({kelas.jenjang})</option>
            ))}
          </select>
        </label> : (
          <div className="text-sm font-medium text-gray-700">
            Kelas
            <p className="mt-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-600">
              {initialData?.kelas?.nama ?? 'Belum ada kelas'}
            </p>
          </div>
        )}
        {mode === 'create' && <fieldset className="grid gap-4 rounded-xl border border-gray-200 p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold text-gray-700">Periode tagihan SPP</legend>
          <label className="block text-sm font-medium text-gray-700">
            Bulan mulai
            <select name="bulanMulai" value={form.bulanMulai} onChange={updateField} required className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
              <option value="">Pilih bulan</option>
              {MONTHS.map((month) => <option key={month} value={month}>{month}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Tahun mulai
            <input name="tahunMulai" type="number" value={form.tahunMulai} onChange={updateField} required min={MIN_YEAR} max={MAX_YEAR} step="1" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Bulan selesai
            <select name="bulanSelesai" value={form.bulanSelesai} onChange={updateField} required className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
              <option value="">Pilih bulan</option>
              {MONTHS.map((month) => <option key={month} value={month}>{month}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Tahun selesai
            <input name="tahunSelesai" type="number" value={form.tahunSelesai} onChange={updateField} required min={MIN_YEAR} max={MAX_YEAR} step="1" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
          </label>
          <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
            Nominal tagihan per bulan (Rp)
            <input name="nominal" type="number" value={form.nominal} onChange={updateField} required min="0.01" max="9999999999.99" step="0.01" inputMode="decimal" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
            <span className="mt-1 block text-xs font-normal text-gray-500">Nominal ini akan diterapkan ke setiap bulan dalam rentang yang dipilih.</span>
          </label>
        </fieldset>}
      </div>

      {kelasError && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{kelasError}</p>}
      {!kelasLoading && !kelasError && kelasList.length === 0 && (
        <p role="alert" className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Belum ada kelas yang tersedia. Tambahkan kelas terlebih dahulu.</p>
      )}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={submitting || (mode === 'edit' ? !hasChanges : (kelasLoading || kelasList.length === 0 || Boolean(kelasError)))} className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? (mode === 'edit' ? 'Menyimpan...' : 'Membuat akun...') : (mode === 'edit' ? 'Simpan perubahan' : 'Buat akun siswa')}
        </button>
      </div>
    </form>
  )
}
