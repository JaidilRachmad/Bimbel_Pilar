import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  CreditCard,
  GraduationCap,
  LayoutGrid,
  ReceiptText,
  RefreshCw,
  School,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { getAllKelas } from '../../services/kelasService';
import { getAllUsers } from '../../services/userService';

const REFRESH_INTERVAL = 60_000;
const MAX_UNPAID_PREVIEW = 5;

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Data dashboard gagal dimuat.';
}

function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(value);
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getBillStatus(bill) {
  return String(bill.status || '').trim().toLocaleLowerCase('id-ID');
}

function getStudentName(bill) {
  const profile = Array.isArray(bill.siswa_profile)
    ? bill.siswa_profile[0]
    : bill.siswa_profile;
  return profile?.nama || 'Nama siswa tidak tersedia';
}

function formatBillPeriod(bill) {
  const monthNames = [
    'januari', 'februari', 'maret', 'april', 'mei', 'juni',
    'juli', 'agustus', 'september', 'oktober', 'november', 'desember',
  ];
  const rawMonth = String(bill.bulan ?? '').trim().toLocaleLowerCase('id-ID');
  const periodMatch = String(bill.periode ?? '').match(/(\d{4})[-/](\d{1,2})/);
  const monthYearMatch = rawMonth.match(/^(\d{4})[-/](\d{1,2})$/);
  const namedPeriodMatch = rawMonth.match(/^([a-z]+)\s+(\d{4})$/);
  const monthMatch = rawMonth.match(/^(?:\d{4}[-/])?(\d{1,2})$/);
  const monthByName = monthNames.indexOf(namedPeriodMatch?.[1] || rawMonth) + 1;
  const month = monthMatch ? Number(monthMatch[1]) : monthByName;
  const rawYear = Number(bill.tahun);
  const periodYear = Number(
    periodMatch?.[1]
      || monthYearMatch?.[1]
      || namedPeriodMatch?.[2],
  );
  const dateValue = bill.tanggal_jatuh_tempo || bill.created_at;
  const dateMatch = typeof dateValue === 'string'
    ? /^(\d{4})-(\d{2})/.exec(dateValue)
    : null;
  const year = Number.isInteger(rawYear) && rawYear >= 2000
    ? rawYear
    : Number.isInteger(periodYear)
      ? periodYear
      : dateMatch
        ? Number(dateMatch[1])
        : NaN;
  const resolvedMonth = Number.isInteger(month) && month >= 1 && month <= 12
    ? month
    : dateMatch
      ? Number(dateMatch[2])
      : NaN;

  if (!Number.isInteger(resolvedMonth) || resolvedMonth < 1 || resolvedMonth > 12 || !Number.isInteger(year)) {
    return 'Periode tagihan';
  }
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
    .format(new Date(year, resolvedMonth - 1, 1));
}

function formatDueDate(value) {
  if (!value) return 'Jatuh tempo belum diatur';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Jatuh tempo belum diatur';
  return `Jatuh tempo ${new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date)}`;
}

async function loadAllClasses() {
  const firstPage = await getAllKelas({ page: 1, limit: 100 });
  if (!Array.isArray(firstPage?.data) || !Number.isInteger(firstPage.meta?.total_pages)) {
    throw new Error('Format data kelas dari server tidak valid.');
  }

  const classes = [...firstPage.data];
  for (let page = 2; page <= firstPage.meta.total_pages; page += 1) {
    const result = await getAllKelas({ page, limit: 100 });
    if (!Array.isArray(result?.data)) {
      throw new Error('Format data kelas dari server tidak valid.');
    }
    classes.push(...result.data);
  }
  return classes;
}

async function loadAllBills() {
  const bills = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await api.get('/tagihan-spp', { params: { page, limit: 100 } });
    const payload = response.data?.data;
    const pageBills = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : null;
    const meta = payload?.meta || response.data?.meta;

    if (!pageBills || !Number.isInteger(meta?.total_pages) || meta.total_pages < 0) {
      throw new Error('Format data tagihan SPP dari server tidak valid.');
    }

    bills.push(...pageBills);
    totalPages = meta.total_pages;
    page += 1;
  }

  return bills;
}

function isClassActive(kelas, today) {
  return (!kelas.periode_mulai || kelas.periode_mulai <= today)
    && (!kelas.periode_selesai || kelas.periode_selesai >= today);
}

export default function DashboardAdmin() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const requestInFlight = useRef(false);
  const mounted = useRef(false);

  const loadDashboard = useCallback(async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    if (mounted.current) {
      setRefreshing(true);
      setError('');
    }

    try {
      const [students, tutors, classes, allBills] = await Promise.all([
        getAllUsers('siswa'),
        getAllUsers('tentor'),
        loadAllClasses(),
        loadAllBills(),
      ]);

      if (!Array.isArray(students?.users) || !Array.isArray(tutors?.users)) {
        throw new Error('Format data pengguna dari server tidak valid.');
      }

      const now = new Date();
      const today = getLocalDateKey(now);
      const paidBills = allBills.filter((bill) => getBillStatus(bill) === 'lunas');
      const unpaidBills = allBills
        .filter((bill) => getBillStatus(bill) === 'belum bayar')
        .sort((left, right) => (
          String(left.tanggal_jatuh_tempo || '9999-12-31')
            .localeCompare(String(right.tanggal_jatuh_tempo || '9999-12-31'))
        ));
      const overdueBills = unpaidBills.filter((bill) => (
        bill.tanggal_jatuh_tempo
        && bill.tanggal_jatuh_tempo < today
      ));
      const amountFor = (bills) => bills.reduce(
        (sum, bill) => sum + (Number(bill.nominal) || 0),
        0,
      );
      if (mounted.current) {
        setMetrics({
          totalStudents: students.users.length,
          totalTutors: tutors.users.length,
          totalClasses: classes.length,
          activeClasses: classes.filter((kelas) => isClassActive(kelas, today)).length,
          allBillCount: allBills.length,
          allPaidCount: paidBills.length,
          allUnpaidCount: unpaidBills.length,
          overdueCount: overdueBills.length,
          allPaidAmount: amountFor(paidBills),
          allUnpaidAmount: amountFor(unpaidBills),
          unpaidPreview: unpaidBills.slice(0, MAX_UNPAID_PREVIEW),
        });
        setLastUpdated(now);
      }
    } catch (requestError) {
      if (mounted.current) setError(getErrorMessage(requestError));
    } finally {
      requestInFlight.current = false;
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const initialLoadId = window.setTimeout(loadDashboard, 0);
    const intervalId = window.setInterval(loadDashboard, REFRESH_INTERVAL);
    return () => {
      mounted.current = false;
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
    };
  }, [loadDashboard]);

  const paidPercentage = metrics?.allBillCount
    ? Math.round((metrics.allPaidCount / metrics.allBillCount) * 100)
    : 0;
  const paidAmountPercentage = metrics
    ? (() => {
        const totalAmount = metrics.allPaidAmount + metrics.allUnpaidAmount;
        return totalAmount
          ? Math.round((metrics.allPaidAmount / totalAmount) * 100)
          : 0;
      })()
    : 0;
  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <DashboardLayout>
      <section className="mx-auto max-w-[1500px] space-y-6">
        <header className="relative overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-[#172d67] via-[#1f4f8f] to-[#5c7db8] px-5 py-7 text-white shadow-[0_24px_55px_-35px_rgba(30,64,175,0.75)] sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[42px] border-white/8" />
          <div className="pointer-events-none absolute -bottom-32 right-28 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                Pusat kendali administrasi
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Selamat datang, Admin</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/90 sm:text-base">
                Pantau operasional lembaga, status keuangan, dan tagihan yang membutuhkan tindak lanjut.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  {todayLabel}
                </p>
                <p className="mt-1 text-xs text-blue-100">
                  {lastUpdated
                    ? `Sinkron ${new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(lastUpdated)}`
                    : 'Menunggu sinkronisasi'}
                </p>
              </div>
              <button
                type="button"
                onClick={loadDashboard}
                disabled={refreshing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#1e3a70] shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/30 disabled:cursor-wait disabled:opacity-70"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                Perbarui
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </span>
            <button type="button" onClick={loadDashboard} className="rounded-lg px-3 py-1.5 font-semibold transition hover:bg-rose-100">
              Coba lagi
            </button>
          </div>
        )}

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]" aria-label="Informasi operasional">
          <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.5)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Operasional</p>
                <h2 className="mt-1 text-lg font-extrabold text-slate-950">Komposisi lembaga</h2>
              </div>
              <LayoutGrid className="h-5 w-5 text-teal-500" aria-hidden="true" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Siswa', value: metrics?.totalStudents, icon: UsersRound, color: 'text-blue-700', bg: 'bg-blue-50' },
                { label: 'Tentor', value: metrics?.totalTutors, icon: GraduationCap, color: 'text-violet-700', bg: 'bg-violet-50' },
                { label: 'Kelas aktif', value: metrics?.activeClasses, icon: School, color: 'text-teal-700', bg: 'bg-teal-50' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`rounded-2xl ${bg} p-4`}>
                  <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
                  <p className="mt-4 text-xs font-semibold text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-950">{loading ? '—' : formatNumber(value ?? 0)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-slate-950 p-5 text-white shadow-[0_18px_45px_-32px_rgba(15,23,42,0.7)]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-300">Akses cepat</p>
            <h2 className="mt-1 text-lg font-extrabold">Kelola administrasi</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Link to="/admin/spp" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:border-white/20 hover:bg-white/10">
                <span className="flex items-center gap-2"><ReceiptText className="h-4 w-4 text-blue-300" />Manajemen SPP</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link to="/admin/pengguna" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:border-white/20 hover:bg-white/10">
                <span className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-violet-300" />Kelola Pengguna</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="finance-title">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Analitik keuangan</p>
              <h2 id="finance-title" className="mt-1 text-xl font-extrabold text-slate-950">Status pembayaran SPP</h2>
            </div>
            <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:inline-flex">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              Seluruh periode
            </span>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="grid gap-4 rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.5)] lg:grid-cols-[0.9fr_1.1fr] lg:p-6">
              <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                <div
                  className="relative flex h-48 w-48 items-center justify-center rounded-full shadow-[0_16px_35px_-22px_rgba(16,185,129,0.55)]"
                  style={{ background: `conic-gradient(#10b981 0% ${loading ? 0 : paidPercentage}%, #fb7185 ${loading ? 0 : paidPercentage}% 100%)` }}
                  role="img"
                  aria-label={loading
                    ? 'Memuat diagram pembayaran'
                    : `${formatNumber(metrics?.allPaidCount ?? 0)} lunas dari ${formatNumber(metrics?.allBillCount ?? 0)} tagihan`}
                >
                  <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white text-center ring-8 ring-slate-50">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-950">{loading ? '—' : `${paidPercentage}%`}</span>
                    <span className="mt-1 text-xs font-semibold text-slate-500">tingkat pelunasan</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Distribusi status</p>
                    <p className="mt-1 text-xs text-slate-500">Jumlah dan nominal tagihan</p>
                  </div>
                  <CircleDollarSign className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Lunas', count: metrics?.allPaidCount, amount: metrics?.allPaidAmount, dot: 'bg-emerald-500', amountClass: 'text-emerald-700' },
                    { label: 'Belum bayar', count: metrics?.allUnpaidCount, amount: metrics?.allUnpaidAmount, dot: 'bg-rose-400', amountClass: 'text-rose-700' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`h-3 w-3 shrink-0 rounded-full ${item.dot}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-500">{loading ? '—' : formatNumber(item.count ?? 0)} tagihan</p>
                        </div>
                      </div>
                      <p className={`text-right text-sm font-extrabold ${item.amountClass}`}>{loading ? '—' : formatRupiah(item.amount ?? 0)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-sm font-medium text-slate-500">Total tagihan tercatat</span>
                  <span className="text-sm font-extrabold text-slate-900">{loading ? '—' : formatNumber(metrics?.allBillCount ?? 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section aria-labelledby="unpaid-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">Tindak lanjut</p>
              <h2 id="unpaid-title" className="mt-1 text-xl font-extrabold text-slate-950">Tagihan belum dibayar</h2>
              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? 'Memuat tagihan…'
                  : `${formatNumber(metrics?.allUnpaidCount ?? 0)} tagihan · ${formatRupiah(metrics?.allUnpaidAmount ?? 0)} · ${formatNumber(metrics?.overdueCount ?? 0)} terlambat`}
              </p>
            </div>
            <Link to="/admin/spp" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700">
              Lihat semua tagihan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_18px_45px_-32px_rgba(15,23,42,0.5)]">
            {loading ? (
              <p className="py-10 text-center text-sm text-slate-400">Memuat data tagihan…</p>
            ) : metrics?.unpaidPreview.length ? (
              <>
                <div className="hidden grid-cols-[minmax(220px,1.5fr)_minmax(130px,0.8fr)_minmax(150px,0.9fr)_auto] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-400 md:grid">
                  <span>Siswa</span>
                  <span>Periode</span>
                  <span>Jatuh tempo</span>
                  <span className="text-right">Nominal</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {metrics.unpaidPreview.map((bill) => {
                    const overdue = bill.tanggal_jatuh_tempo && bill.tanggal_jatuh_tempo < getLocalDateKey();
                    return (
                      <li key={bill.id} className="grid gap-3 px-5 py-4 transition hover:bg-blue-50/40 md:grid-cols-[minmax(220px,1.5fr)_minmax(130px,0.8fr)_minmax(150px,0.9fr)_auto] md:items-center md:gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${overdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            <AlertCircle className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{getStudentName(bill)}</p>
                            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${overdue ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                              {overdue ? 'Terlambat' : 'Belum bayar'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-600">{formatBillPeriod(bill)}</p>
                        <p className={`text-sm font-medium ${overdue ? 'text-rose-700' : 'text-slate-500'}`}>{formatDueDate(bill.tanggal_jatuh_tempo)}</p>
                        <p className="text-right text-sm font-extrabold text-slate-900">{formatRupiah(Number(bill.nominal) || 0)}</p>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="flex items-center gap-3 px-5 py-7">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <BadgeCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-bold text-emerald-800">Tidak ada tagihan belum dibayar</p>
                  <p className="mt-1 text-sm text-emerald-700">Seluruh tagihan SPP tercatat telah lunas.</p>
                </div>
              </div>
            )}
          </div>
          {!loading && metrics?.allUnpaidCount > MAX_UNPAID_PREVIEW && (
            <p className="mt-3 text-right text-xs text-slate-500">
              Menampilkan {MAX_UNPAID_PREVIEW} dari {formatNumber(metrics.allUnpaidCount)} tagihan belum bayar.
            </p>
          )}
        </section>
      </section>
    </DashboardLayout>
  );
}
