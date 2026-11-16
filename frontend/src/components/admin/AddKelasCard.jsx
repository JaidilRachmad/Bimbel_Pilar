import { useState } from 'react'
import { X } from 'lucide-react'

export default function AddKelasCard({
  mode = 'create',
  initialData,
  onClose,
  onSubmit,
  submitting,
  error,
}) {
  const [namaKelas, setNamaKelas] = useState(initialData?.nama_kelas ?? '')
  const [jenjang, setJenjang] = useState(initialData?.jenjang ?? '')
  const [harga, setHarga] = useState(
  initialData?.harga != null ? String(initialData.harga) : ''
)
  const [periodeMulai, setPeriodeMulai] = useState(initialData?.periode_mulai ?? '')
  const [periodeSelesai, setPeriodeSelesai] = useState(initialData?.periode_selesai ?? '')
  const hasChanges = mode === 'edit' && (
    namaKelas.trim() !== (initialData?.nama_kelas ?? '').trim()
    || jenjang !== (initialData?.jenjang ?? '')
    || Number(harga || 0) !== Number(initialData?.harga ?? 0)
    || periodeMulai !== (initialData?.periode_mulai ?? '')
    || periodeSelesai !== (initialData?.periode_selesai ?? '')
  )
const formatRupiah = (value) => {
  const digits = String(value).replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('id-ID') : ''
}
const handleHargaChange = (event) => {
  const digits = event.target.value.replace(/\D/g, '')
  // batasi panjang agar tidak overflow (maks 9 digit = 999.999.999)
  setHarga(digits.slice(0, 9))
}
  const hargaNumber = Number(harga || 0)
  const hargaValid = Number.isInteger(hargaNumber) && hargaNumber >= 1000

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!hargaValid || !periodeMulai || !periodeSelesai || periodeMulai > periodeSelesai) return
    onSubmit({
      nama_kelas: namaKelas.trim(),
      jenjang,
      harga: hargaNumber,
      periode_mulai: periodeMulai,
      periode_selesai: periodeSelesai,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-kelas-title"
        className="w-full max-w-lg rounded-2xl border border-indigo-100 bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 id="add-kelas-title" className="text-xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Kelas' : 'Tambah Kelas'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {mode === 'edit' ? 'Perbarui nama kelas atau jenjang.' : 'Masukkan nama kelas dan pilih jenjang.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Tutup"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Nama kelas
            <input
              value={namaKelas}
              onChange={(event) => setNamaKelas(event.target.value)}
              required
              maxLength={50}
              pattern="[A-Za-z0-9 .()\-]+"
              title="Gunakan huruf, angka, spasi, titik, tanda hubung, atau kurung."
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <span className="mt-1 block text-xs font-normal text-gray-500">Contoh: 6A Reguler.</span>
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Jenjang
            <select
              value={jenjang}
              onChange={(event) => setJenjang(event.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Pilih jenjang</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Harga
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">
                Rp
              </span>
              <input
                inputMode="numeric"
                value={formatRupiah(harga)}
                onChange={handleHargaChange}
                required
                placeholder="300.000"
                aria-invalid={harga !== '' && !hargaValid}
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <span className={`mt-1 block text-xs font-normal ${harga !== '' && !hargaValid ? 'text-red-600' : 'text-gray-500'}`}>
              Minimal Rp1.000. Contoh: 300.000
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Periode mulai
              <input type="date" value={periodeMulai} onChange={(event) => setPeriodeMulai(event.target.value)} required className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Periode selesai
              <input type="date" value={periodeSelesai} min={periodeMulai || undefined} onChange={(event) => setPeriodeSelesai(event.target.value)} required className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </label>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !hargaValid || !periodeMulai || !periodeSelesai || periodeMulai > periodeSelesai || !jenjang || (mode === 'edit' && !hasChanges)}
              className="rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? 'Menyimpan...' : mode === 'edit' ? 'Simpan perubahan' : 'Simpan kelas'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
