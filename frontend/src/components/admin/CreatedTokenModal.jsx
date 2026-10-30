import { useState } from 'react'
import { Check, Copy, KeyRound, X } from 'lucide-react'

export default function CreatedTokenModal({ token, onClose }) {
  const [copyError, setCopyError] = useState('')
  const [copied, setCopied] = useState(false)

  const copyToken = async () => {
    setCopyError('')
    setCopied(false)

    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
    } catch {
      setCopyError('Token tidak dapat disalin. Silakan salin token secara manual.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="created-token-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 id="created-token-title" className="text-lg font-bold text-gray-900">Akun berhasil dibuat</h2>
              <p className="text-sm text-gray-500">Simpan token akses ini dan berikan kepada pengguna.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Token akses</p>
          <p className="break-all font-mono text-sm font-semibold text-gray-900">{token}</p>
        </div>
        {copied && <p role="status" className="mt-3 text-sm text-green-700">Token berhasil disalin.</p>}
        {copyError && <p role="alert" className="mt-3 text-sm text-red-700">{copyError}</p>}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Selesai
          </button>
          <button type="button" onClick={copyToken} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Tersalin' : 'Copy token'}
          </button>
        </div>
      </section>
    </div>
  )
}
