import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { getJadwalSiswa, getLinkUnduhMateri } from '../../services/materiSiswaService'
import {
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  LoaderCircle,
  RefreshCw,
  Clock3,
} from 'lucide-react'

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback
}

function formatTanggal(tanggal) {
  if (!tanggal) return 'Tanggal belum ditentukan'
  const parsedDate = new Date(`${tanggal}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) return tanggal
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate)
}

function getJam(jam) {
  return jam ? jam.slice(0, 5) : null
}

function getSessionEnd(session) {
  if (!session.tanggal) return null
  const endTime = getJam(session.jam_selesai) || '23:59:59'
  const parsedDate = new Date(`${session.tanggal}T${endTime}`)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function isSessionCompleted(session, now = Date.now()) {
  const sessionEnd = getSessionEnd(session)
  return sessionEnd !== null && sessionEnd.getTime() <= now
}

async function fetchAllStudentSessions() {
  const firstPage = await getJadwalSiswa({ page: 1, limit: 10 })
  const allSessions = [...firstPage.data]
  for (let page = 2; page <= firstPage.meta.total_pages; page += 1) {
    const nextPage = await getJadwalSiswa({ page, limit: 10 })
    allSessions.push(...nextPage.data)
  }
  return allSessions
}

export default function DashboardSiswa() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [referenceTime, setReferenceTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)
  const [downloadError, setDownloadError] = useState('')

  const loadSessions = async () => {
    setLoading(true)
    setError('')
    try {
      setSessions(await fetchAllStudentSessions())
      setReferenceTime(Date.now())
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Gagal memuat materi belajar.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function fetchSessions() {
      try {
        const allSessions = await fetchAllStudentSessions()
        if (active) {
          setSessions(allSessions)
          setReferenceTime(Date.now())
        }
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError, 'Gagal memuat materi belajar.'))
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchSessions()
    return () => {
      active = false
    }
  }, [])

  const subjects = useMemo(() => {
    const groups = new Map()
    sessions.forEach((session) => {
      const subject = session.mata_pelajaran || 'Lainnya'
      groups.set(subject, [...(groups.get(subject) || []), session])
    })
    return [...groups.entries()].map(([subject, subjectSessions]) => {
      const completed = subjectSessions.filter((session) => isSessionCompleted(session, referenceTime)).length
      return {
        subject,
        sessions: subjectSessions,
        completed,
        total: subjectSessions.length,
        percentage: subjectSessions.length
          ? Math.round((completed / subjectSessions.length) * 100)
          : 0,
      }
    })
  }, [sessions, referenceTime])

  const handleDownload = async (session) => {
    const downloadTab = window.open('about:blank', '_blank')
    if (!downloadTab) {
      setDownloadError('Izinkan pop-up untuk membuka materi di tab baru.')
      return
    }

    downloadTab.opener = null
    setDownloadingId(session.id)
    setDownloadError('')
    try {
      const link = await getLinkUnduhMateri(session.id)
      if (!link) throw new Error('Tautan materi belum tersedia untuk sesi ini.')
      const url = new URL(link)
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Tautan materi tidak valid.')
      }
      downloadTab.location.replace(url.href)
    } catch (requestError) {
      downloadTab.close()
      setDownloadError(getErrorMessage(requestError, 'Materi gagal dibuka.'))
    } finally {
      setDownloadingId(null)
    }
  }

  const displayName = user?.nama_lengkap || user?.nama || 'Siswa'
  const materialCount = sessions.filter((session) => session.link_materi).length
  const completedCount = subjects.reduce((total, subject) => total + subject.completed, 0)
  const totalCount = subjects.reduce((total, subject) => total + subject.total, 0)
  const overallProgress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0
  const nextSession = sessions
    .filter((session) => {
      const sessionEnd = getSessionEnd(session)
      return sessionEnd && sessionEnd.getTime() > referenceTime
    })
    .sort((first, second) => getSessionEnd(first) - getSessionEnd(second))[0]
  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl">
        <section className="mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.4fr_0.8fr]">
            <div className="bg-gradient-to-br from-[#102a56] via-[#17468a] to-[#2563a8] p-6 text-white sm:p-8">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                <GraduationCap className="h-4 w-4" /> Portal Akademik Siswa
              </div>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">Selamat belajar, {displayName}</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                Pantau perjalanan belajarmu dan akses materi untuk setiap pertemuan kelas.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                <CalendarDays className="h-3.5 w-3.5" />{currentDate}
              </div>
            </div>
            <div className="p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Progres keseluruhan</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{completedCount}<span className="text-lg font-semibold text-slate-400">/{totalCount}</span></p>
                  <p className="mt-1 text-xs text-slate-500">pertemuan telah berlalu</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-[5px] border-blue-100 bg-blue-50 text-sm font-extrabold text-blue-800">
                  {overallProgress}%
                </div>
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Progres keseluruhan pertemuan" aria-valuenow={overallProgress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-cyan-500 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{materialCount} materi tersedia untuk dipelajari</p>
            </div>
          </div>
        </section>

        <div className="mb-7 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CalendarCheck2 className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pertemuan selesai</p>
                <p className="mt-0.5 text-lg font-extrabold text-slate-900">{completedCount} <span className="text-sm font-medium text-slate-500">dari {totalCount}</span></p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Dihitung berdasarkan jadwal yang telah melewati waktu sesi.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><BookOpen className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Materi pembelajaran</p>
                <p className="mt-0.5 text-lg font-extrabold text-slate-900">{materialCount} <span className="text-sm font-medium text-slate-500">tersedia</span></p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Materi dapat dibuka dari daftar jadwal di bawah.</p>
          </article>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Ringkasan akademik</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">Progres & jadwal pembelajaran</h2>
          </div>
          <button
            type="button"
            onClick={loadSessions}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Muat ulang
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <button type="button" onClick={loadSessions} className="font-bold underline underline-offset-2">Coba lagi</button>
          </div>
        )}
        {downloadError && (
          <div role="alert" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{downloadError}</div>
        )}

        {!loading && !error && nextSession && (
          <section className="mb-7 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm"><Clock3 className="h-5 w-5" /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Pertemuan berikutnya</p>
                  <h3 className="mt-1 font-bold text-slate-900">{nextSession.mata_pelajaran} · {nextSession.materi || 'Sesi pembelajaran'}</h3>
                  <p className="mt-1 text-sm text-slate-600">{formatTanggal(nextSession.tanggal)}{getJam(nextSession.jam_mulai) ? ` · ${getJam(nextSession.jam_mulai)}` : ''}</p>
                </div>
              </div>
              {nextSession.link_materi && (
                <button type="button" onClick={() => handleDownload(nextSession)} disabled={downloadingId === nextSession.id} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50">
                  {downloadingId === nextSession.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Buka materi
                </button>
              )}
            </div>
          </section>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-14 text-sm text-slate-500 shadow-sm">
            <LoaderCircle className="h-5 w-5 animate-spin text-blue-700" />
            Memuat jadwal dan materi...
          </div>
        ) : error ? null : sessions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 font-bold text-slate-900">Belum ada materi belajar</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Jadwal dan materi dari tentor akan muncul di sini setelah dibagikan ke kelasmu.
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {subjects.map(({ subject, sessions: subjectSessions, completed, total, percentage }) => (
              <section key={subject} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><BookOpen className="h-5 w-5" /></span>
                    <div>
                      <h3 className="font-bold text-slate-900">{subject}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">Progres pertemuan</p>
                    </div>
                  </div>
                  <div className="sm:min-w-64 sm:max-w-xs sm:flex-1">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-slate-700">{completed}/{total} pertemuan</span>
                      <span className="font-semibold text-blue-700">{percentage}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`Progres pertemuan ${subject}`} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {subjectSessions.map((session) => {
                    const hasMaterial = Boolean(session.link_materi)
                    const completedSession = isSessionCompleted(session, referenceTime)
                    const timeStart = getJam(session.jam_mulai)
                    const timeEnd = getJam(session.jam_selesai)
                    return (
                      <article key={session.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600"><FileText className="h-5 w-5" /></span>
                            <div className="min-w-0">
                              <h4 className="break-words font-bold text-slate-900">{session.materi || 'Sesi pembelajaran'}</h4>
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatTanggal(session.tanggal)}</span>
                                {(timeStart || timeEnd) && <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{timeStart || '--:--'} – {timeEnd || '--:--'}</span>}
                              </div>
                            </div>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${completedSession ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                            {completedSession ? <><CheckCircle2 className="mr-1 inline h-3 w-3" />Selesai</> : 'Terjadwal'}
                          </span>
                        </div>
                        <div className="mt-5 border-t border-slate-100 pt-4">
                          {!hasMaterial && <p className="mb-3 text-xs text-slate-500">Materi belum dibagikan oleh tentor.</p>}
                          <button
                            type="button"
                            onClick={() => handleDownload(session)}
                            disabled={!hasMaterial || downloadingId === session.id}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                          >
                            {downloadingId === session.id
                              ? <LoaderCircle className="h-4 w-4 animate-spin" />
                              : hasMaterial ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                            {downloadingId === session.id ? 'Membuka materi...' : hasMaterial ? 'Buka / unduh materi' : 'Materi belum tersedia'}
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
      <SppWarning /> 
    </DashboardLayout>
  )
}
