import { FileText, XCircle } from 'lucide-react';

export default function TagihanCard({
  periode,
  nominal,
  tanggal,
  tanggalLabel,
  metode,
  isLunas = false,
  onShowInvoice,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-gray-900">{periode}</p>
          <p className={`mt-0.5 text-base font-bold ${isLunas ? 'text-gray-800' : 'text-red-600'}`}>
            Rp {(nominal || 0).toLocaleString('id-ID')}
          </p>
        </div>
        {!isLunas && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
            <XCircle className="h-3.5 w-3.5" /> Belum Bayar
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{tanggalLabel}</p>
          <p className="mt-0.5 font-semibold text-gray-700">{tanggal}</p>
        </div>
        {metode && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Metode</p>
            <p className="mt-0.5 font-semibold text-gray-700">{metode}</p>
          </div>
        )}
      </div>

      {isLunas && onShowInvoice && (
        <button
          type="button"
          onClick={onShowInvoice}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-[#1E3A8A] transition hover:bg-blue-100"
        >
          <FileText className="h-4 w-4" /> E-Kwitansi
        </button>
      )}
    </div>
  );
}
