import { useEffect, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getKelasMy } from '../../services/kelasTentorService'
import {
  createJadwalSesi,
  createNilai,
  deleteJadwalSesi,
  deleteNilai,
  getJadwalSesi,
  getNilaiTentor,
  getNilaiSesi,
  updateJadwalSesi,
  updateNilai,
} from '../../services/tentorDashboardService'
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  Link as LinkIcon,
  LoaderCircle,
  Pencil,
  School,
  Trash2,
  UploadCloud,
  Users,
  X,
} from 'lucide-react'

const MAPEL_TABS = ['Matematika', 'IPA', 'Bahasa Indonesia', 'Bahasa Inggris']
const KONVERSI_NILAI = { A: 100, B: 90, C: 80, D: 70, E: 60 }
const EMPTY_SESSION = {
  materi: '',
  tanggal: '',
  jam_mulai: '',
  jam_selesai: '',
}

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback
}

function formatTanggal(tanggal) {
  if (!tanggal) return 'Tanggal belum ditentukan'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${tanggal}T00:00:00`))
}

function getStudentName(enrollment) {
  const profile = enrollment.siswa_profile
  if (Array.isArray(profile)) return profile[0]?.nama || 'Siswa'
  return profile?.nama || 'Siswa'
}

function getStudentId(enrollment) {
  return enrollment.siswa_id || enrollment.siswa_profile?.id
}

async function getAllPages(fetchPage, params) {
  const firstPage = await fetchPage({ ...params, page: 1 })
  const items = [...firstPage.data]
  for (let page = 2; page <= firstPage.meta.total_pages; page += 1) {
    const nextPage = await fetchPage({ ...params, page })
    items.push(...nextPage.data)
  }
  return items
}

function toGradeNumber(value) {
  const normalized = String(value ?? '').trim().toUpperCase()
  if (Object.hasOwn(KONVERSI_NILAI, normalized)) return KONVERSI_NILAI[normalized]
  if (normalized === '') return null
  const number = Number(normalized)
  return Number.isFinite(number) && number >= 0 && number <= 100 ? number : null
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

export default function DashboardTentor() {
  const [kelasList, setKelasList] = useState([])
  const [loadingKelas, setLoadingKelas] = useState(true)
  const [kelasError, setKelasError] = useState('')
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [activeTab, setActiveTab] = useState(MAPEL_TABS[0])
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [sessionError, setSessionError] = useState('')
  const [expandedSessionId, setExpandedSessionId] = useState(null)
  const [gradeCountsBySession, setGradeCountsBySession] = useState({})
  const [loadingGradeProgress, setLoadingGradeProgress] = useState(false)
  const [gradeProgressError, setGradeProgressError] = useState('')

  const [showSessionForm, setShowSessionForm] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [sessionForm, setSessionForm] = useState(EMPTY_SESSION)
  const [savingSession, setSavingSession] = useState(false)
  const [sessionFormError, setSessionFormError] = useState('')

  const [sessionForNilai, setSessionForNilai] = useState(null)
  const [gradeRows, setGradeRows] = useState([])
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [savingGradeId, setSavingGradeId] = useState(null)
  const [gradeError, setGradeError] = useState('')
  const [gradeNotice, setGradeNotice] = useState('')

  const [sessionForMateri, setSessionForMateri] = useState(null)
  const [materiLink, setMateriLink] = useState('')
  const [savingMateri, setSavingMateri] = useState(false)
  const [materiError, setMateriError] = useState('')
  const studentCount = new Set(
    (selectedKelas?.kelas?.kelas_siswa || []).map(getStudentId).filter(Boolean),
  ).size

  useEffect(() => {
    let active = true
    getKelasMy()
      .then((assignments) => {
        if (active) setKelasList(assignments.filter((assignment) => assignment.kelas))
      })
      .catch((error) => {
        if (active) setKelasError(getErrorMessage(error, 'Gagal memuat kelas yang diampu.'))
      })
      .finally(() => {
        if (active) setLoadingKelas(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedKelas) return undefined
    let active = true

    async function loadSessions() {
      setLoadingSessions(true)
      setSessionError('')
      setSessions([])
      let visibleSessions = []
      try {
        const allSessions = await getAllPages(getJadwalSesi, {
          kelas_id: selectedKelas.kelas_id,
          limit: 10,
        })
        visibleSessions = allSessions.filter((session) => session.mata_pelajaran === activeTab)
        if (active) setSessions(visibleSessions)
      } catch (error) {
        if (active) setSessionError(getErrorMessage(error, 'Gagal memuat jadwal sesi.'))
      } finally {
        if (active) setLoadingSessions(false)
      }

      setLoadingGradeProgress(true)
      setGradeProgressError('')
      try {
        const allGrades = await getAllPages(getNilaiTentor, { limit: 100 })
        if (active) {
          const classStudentIds = new Set(
            (selectedKelas.kelas.kelas_siswa || []).map(getStudentId).filter(Boolean),
          )
          setGradeCountsBySession((currentCounts) => {
            const counts = { ...currentCounts }
            visibleSessions.forEach((session) => {
              counts[session.id] = new Set(
                allGrades
                  .filter((grade) => grade.sesi_id === session.id && classStudentIds.has(grade.siswa_id))
                  .map((grade) => grade.siswa_id),
              ).size
            })
            return counts
          })
        }
      } catch (error) {
        if (active) setGradeProgressError(getErrorMessage(error, 'Gagal memuat progres input nilai.'))
      } finally {
        if (active) setLoadingGradeProgress(false)
      }
    }

    Promise.resolve().then(loadSessions)
    return () => {
      active = false
    }
  }, [selectedKelas, activeTab])

  useEffect(() => {
    if (!sessionForNilai) return undefined
    let active = true

    Promise.resolve()
      .then(() => {
        setLoadingGrades(true)
        setGradeError('')
        setGradeNotice('')
        return getNilaiSesi(sessionForNilai.id)
      })
      .then((grades) => {
        if (!active) return
        const gradeByStudent = new Map(grades.map((grade) => [grade.siswa_id, grade]))
        const enrollments = selectedKelas?.kelas?.kelas_siswa || []
        const rows = enrollments.map((enrollment) => {
          const studentId = getStudentId(enrollment)
          const grade = gradeByStudent.get(studentId)
          return {
            siswa_id: studentId,
            nama: getStudentName(enrollment),
            nilai: grade ? String(grade.nilai) : '',
            keterangan: grade?.keterangan || '',
            gradeId: grade?.id || null,
          }
        })
        setGradeRows(rows)
      })
      .catch((error) => {
        if (active) setGradeError(getErrorMessage(error, 'Gagal memuat nilai siswa.'))
      })
      .finally(() => {
        if (active) setLoadingGrades(false)
      })

    return () => {
      active = false
    }
  }, [sessionForNilai, selectedKelas])

  const refreshSessions = async () => {
    const firstPage = await getJadwalSesi({
      kelas_id: selectedKelas.kelas_id,
      page: 1,
      limit: 10,
    })
    const allSessions = [...firstPage.data]
    for (let page = 2; page <= firstPage.meta.total_pages; page += 1) {
      const nextPage = await getJadwalSesi({
        kelas_id: selectedKelas.kelas_id,
        page,
        limit: 10,
      })
      allSessions.push(...nextPage.data)
    }
    setSessions(allSessions.filter((session) => session.mata_pelajaran === activeTab))
  }

  const openCreateSession = () => {
    setEditingSession(null)
    setSessionForm(EMPTY_SESSION)
    setSessionFormError('')
    setShowSessionForm(true)
  }

  const openEditSession = (session) => {
    setEditingSession(session)
    setSessionForm({
      materi: session.materi || '',
      tanggal: session.tanggal || '',
      jam_mulai: session.jam_mulai?.slice(0, 5) || '',
      jam_selesai: session.jam_selesai?.slice(0, 5) || '',
    })
    setSessionFormError('')
    setShowSessionForm(true)
  }

  const getSessionPayload = (form = sessionForm) => ({
    kelas_id: selectedKelas.kelas_id,
    tentor_id: selectedKelas.tentor_id,
    mata_pelajaran: activeTab,
    materi: form.materi.trim(),
    tanggal: form.tanggal,
    jam_mulai: form.jam_mulai,
    jam_selesai: form.jam_selesai,
    link_materi: Object.hasOwn(form, 'link_materi')
      ? form.link_materi
      : editingSession?.link_materi ?? null,
  })

  const saveSession = async (event) => {
    event.preventDefault()
    if (!sessionForm.materi.trim() || !sessionForm.tanggal || !sessionForm.jam_mulai || !sessionForm.jam_selesai) {
      setSessionFormError('Topik, tanggal, jam mulai, dan jam selesai wajib diisi.')
      return
    }
    if (sessionForm.jam_selesai <= sessionForm.jam_mulai) {
      setSessionFormError('Jam selesai harus setelah jam mulai.')
      return
    }

    setSavingSession(true)
    setSessionFormError('')
    try {
      const payload = getSessionPayload()
      if (editingSession) {
        await updateJadwalSesi(editingSession.id, payload)
      } else {
        await createJadwalSesi(payload)
      }
      await refreshSessions()
      setShowSessionForm(false)
      setExpandedSessionId(editingSession?.id || null)
    } catch (error) {
      setSessionFormError(getErrorMessage(error, 'Sesi gagal disimpan.'))
    } finally {
      setSavingSession(false)
    }
  }

  const removeSession = async (session) => {
    if (!window.confirm(`Hapus sesi "${session.materi}" beserta tautan materinya?`)) return
    setSessionError('')
    try {
      await deleteJadwalSesi(session.id)
      setSessions((current) => current.filter((item) => item.id !== session.id))
      if (expandedSessionId === session.id) setExpandedSessionId(null)
    } catch (error) {
      setSessionError(getErrorMessage(error, 'Sesi gagal dihapus.'))
    }
  }

  const openMateri = (session) => {
    setSessionForMateri(session)
    setMateriLink(session.link_materi || '')
    setMateriError('')
  }

  const saveMateri = async (event) => {
    event.preventDefault()
    if (!materiLink.trim()) {
      setMateriError('Masukkan tautan materi. Untuk menghapus, gunakan tombol Hapus Materi.')
      return
    }
    try {
      new URL(materiLink)
    } catch {
      setMateriError('Tautan materi harus berupa URL yang valid.')
      return
    }
    setSavingMateri(true)
    setMateriError('')
    try {
      await updateJadwalSesi(
        sessionForMateri.id,
        getSessionPayload({ ...sessionForMateri, link_materi: materiLink.trim() }),
      )
      await refreshSessions()
      setSessionForMateri(null)
    } catch (error) {
      setMateriError(getErrorMessage(error, 'Tautan materi gagal disimpan.'))
    } finally {
      setSavingMateri(false)
    }
  }

  const removeMateri = async () => {
    if (!window.confirm('Hapus tautan materi dari sesi ini?')) return
    setSavingMateri(true)
    setMateriError('')
    try {
      await updateJadwalSesi(
        sessionForMateri.id,
        getSessionPayload({ ...sessionForMateri, link_materi: null }),
      )
      await refreshSessions()
      setSessionForMateri(null)
    } catch (error) {
      setMateriError(getErrorMessage(error, 'Materi gagal dihapus.'))
    } finally {
      setSavingMateri(false)
    }
  }

  const updateGradeRow = (studentId, field, value) => {
    setGradeRows((rows) =>
      rows.map((row) => row.siswa_id === studentId ? { ...row, [field]: value } : row),
    )
  }

  const saveGrade = async (row) => {
    const numericGrade = toGradeNumber(row.nilai)
    if (numericGrade === null) {
      setGradeError('Nilai wajib berupa angka 0–100 atau huruf A–E.')
      return
    }
    setSavingGradeId(row.siswa_id)
    setGradeError('')
    setGradeNotice('')
    const isNewGrade = !row.gradeId
    const payload = {
      sesi_id: sessionForNilai.id,
      siswa_id: row.siswa_id,
      nilai: numericGrade,
      keterangan: row.keterangan.trim() || null,
    }
    try {
      const saved = row.gradeId
        ? await updateNilai(row.gradeId, payload)
        : await createNilai(payload)
      setGradeRows((rows) =>
        rows.map((item) =>
          item.siswa_id === row.siswa_id
            ? { ...item, gradeId: saved.id }
            : item,
        ),
      )
      if (isNewGrade) {
        setGradeCountsBySession((counts) => ({
          ...counts,
          [sessionForNilai.id]: Math.min(
            studentCount,
            (counts[sessionForNilai.id] || 0) + 1,
          ),
        }))
      }
      setGradeNotice(`Nilai ${row.nama} berhasil disimpan.`)
    } catch (error) {
      setGradeError(getErrorMessage(error, 'Nilai gagal disimpan.'))
    } finally {
      setSavingGradeId(null)
    }
  }

  const removeGrade = async (row) => {
    if (!row.gradeId || !window.confirm(`Hapus nilai ${row.nama} untuk sesi ini?`)) return
    setSavingGradeId(row.siswa_id)
    setGradeError('')
    setGradeNotice('')
    try {
      await deleteNilai(row.gradeId)
      setGradeRows((rows) =>
        rows.map((item) =>
          item.siswa_id === row.siswa_id
            ? { ...item, gradeId: null, nilai: '', keterangan: '' }
            : item,
        ),
      )
      setGradeCountsBySession((counts) => ({
        ...counts,
        [sessionForNilai.id]: Math.max(0, (counts[sessionForNilai.id] || 0) - 1),
      }))
      setGradeNotice(`Nilai ${row.nama} berhasil dihapus.`)
    } catch (error) {
      setGradeError(getErrorMessage(error, 'Nilai gagal dihapus.'))
    } finally {
      setSavingGradeId(null)
    }
  }

  const backToClasses = () => {
    setSelectedKelas(null)
    setSessions([])
    setExpandedSessionId(null)
    setActiveTab(MAPEL_TABS[0])
  }

  const renderSessionForm = () => !showSessionForm ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form onSubmit={saveSession} className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">{activeTab}</p>
            <h2 className="mt-1 text-xl font-bold">{editingSession ? 'Edit jadwal sesi' : 'Buat jadwal sesi'}</h2>
          </div>
          <button type="button" onClick={() => setShowSessionForm(false)} aria-label="Tutup" className="rounded-full p-2 text-blue-100 hover:bg-white/15 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label htmlFor="session-topic" className="mb-1.5 block text-sm font-semibold text-slate-700">Topik sesi</label>
            <input id="session-topic" autoFocus value={sessionForm.materi} onChange={(event) => setSessionForm({ ...sessionForm, materi: event.target.value })} placeholder="Contoh: Persamaan linear" className={inputClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label htmlFor="session-date" className="mb-1.5 block text-sm font-semibold text-slate-700">Tanggal</label>
              <input id="session-date" type="date" value={sessionForm.tanggal} onChange={(event) => setSessionForm({ ...sessionForm, tanggal: event.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="session-start" className="mb-1.5 block text-sm font-semibold text-slate-700">Jam mulai</label>
              <input id="session-start" type="time" value={sessionForm.jam_mulai} onChange={(event) => setSessionForm({ ...sessionForm, jam_mulai: event.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="session-end" className="mb-1.5 block text-sm font-semibold text-slate-700">Jam selesai</label>
              <input id="session-end" type="time" value={sessionForm.jam_selesai} onChange={(event) => setSessionForm({ ...sessionForm, jam_selesai: event.target.value })} className={inputClass} />
            </div>
          </div>
          {sessionFormError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{sessionFormError}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button type="button" onClick={() => setShowSessionForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200">Batal</button>
          <button disabled={savingSession} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
            {savingSession && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {editingSession ? 'Simpan perubahan' : 'Buat sesi'}
          </button>
        </div>
      </form>
    </div>
  )

  const renderGradeModal = () => !sessionForNilai ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700">{activeTab} · {selectedKelas.kelas.nama_kelas}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Kelola nilai siswa</h2>
            <p className="mt-1 text-sm text-slate-500">{sessionForNilai.materi}</p>
          </div>
          <button onClick={() => setSessionForNilai(null)} aria-label="Tutup" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-auto p-5 sm:p-7">
          <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Input angka 0–100 atau huruf A–E. Nilai huruf akan dikonversi menjadi angka: A=100, B=90, C=80, D=70, E=60.
          </div>
          {gradeError && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{gradeError}</p>}
          {gradeNotice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{gradeNotice}</p>}
          {loadingGrades ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" />Memuat data nilai...</div>
          ) : gradeRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 font-semibold text-slate-800">Belum ada siswa di kelas ini</p>
              <p className="mt-1 text-sm text-slate-500">Daftar siswa akan muncul setelah mereka ditambahkan ke kelas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[690px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-4 py-3 font-bold">Nama siswa</th><th className="w-36 px-4 py-3 font-bold">Nilai</th><th className="px-4 py-3 font-bold">Keterangan</th><th className="w-44 px-4 py-3 text-right font-bold">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gradeRows.map((row) => (
                    <tr key={row.siswa_id} className="align-top">
                      <td className="px-4 py-4 font-semibold text-slate-800">{row.nama}</td>
                      <td className="px-4 py-3">
                        <input aria-label={`Nilai ${row.nama}`} type="text" inputMode="decimal" value={row.nilai} onChange={(event) => updateGradeRow(row.siswa_id, 'nilai', event.target.value)} placeholder="A atau 90" className={`${inputClass} text-center font-bold`} />
                      </td>
                      <td className="px-4 py-3"><input aria-label={`Keterangan ${row.nama}`} value={row.keterangan} onChange={(event) => updateGradeRow(row.siswa_id, 'keterangan', event.target.value)} placeholder="Catatan perkembangan..." className={inputClass} /></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button disabled={savingGradeId === row.siswa_id} onClick={() => saveGrade(row)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50">
                            {savingGradeId === row.siswa_id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                            {row.gradeId ? 'Simpan' : 'Tambah'}
                          </button>
                          {row.gradeId && <button disabled={savingGradeId === row.siswa_id} onClick={() => removeGrade(row)} aria-label={`Hapus nilai ${row.nama}`} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-7">
          <button onClick={() => setSessionForNilai(null)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100">Selesai</button>
        </div>
      </div>
    </div>
  )

  const renderMateriModal = () => !sessionForMateri ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form onSubmit={saveMateri} className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700"><FileText className="h-4 w-4" />Materi sesi</span>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{sessionForMateri.link_materi ? 'Kelola tautan materi' : 'Tambah tautan materi'}</h2>
            <p className="mt-1 text-sm text-slate-500">{sessionForMateri.materi}</p>
          </div>
          <button type="button" onClick={() => setSessionForMateri(null)} aria-label="Tutup" className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3 p-6">
          <label htmlFor="materi-link" className="block text-sm font-semibold text-slate-700">Tautan Google Drive atau materi online</label>
          <div className="relative">
            <LinkIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="materi-link" type="url" value={materiLink} onChange={(event) => setMateriLink(event.target.value)} placeholder="https://drive.google.com/..." className={`${inputClass} pl-10`} />
          </div>
          {materiError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{materiError}</p>}
          <p className="text-xs text-slate-500">CRUD materi di dashboard ini mengelola tautan yang terhubung ke jadwal sesi.</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          {sessionForMateri.link_materi ? (
            <button type="button" disabled={savingMateri} onClick={removeMateri} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-4 w-4" />Hapus materi</button>
          ) : <span />}
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={() => setSessionForMateri(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200">Batal</button>
            <button disabled={savingMateri} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
              {savingMateri && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {sessionForMateri.link_materi ? 'Simpan perubahan' : 'Tambah materi'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )

  const renderClassList = () => (
    <section>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Ruang tentor</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Dashboard mengajar</h1>
        <p className="mt-2 max-w-2xl text-slate-500">Pilih kelas untuk mengelola jadwal, nilai siswa, dan materi pembelajaran.</p>
      </div>
      {kelasError && <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{kelasError}</div>}
      {loadingKelas ? (
        <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-14 text-sm text-slate-500 shadow-sm"><LoaderCircle className="h-5 w-5 animate-spin text-blue-700" />Memuat kelas...</div>
      ) : kelasList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <School className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 font-bold text-slate-900">Belum ada kelas yang diampu</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Hubungi admin untuk mendapatkan penugasan kelas.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {kelasList.map((item) => (
            <button key={item.id} type="button" onClick={() => setSelectedKelas(item)} className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100">
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><School className="h-6 w-6" /></span>
                <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
              </div>
              <h2 className="mt-5 text-lg font-bold text-slate-900">{item.kelas.nama_kelas}</h2>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{item.kelas.jenjang || 'Kelas'}</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-500"><Users className="h-4 w-4" />{item.kelas.kelas_siswa?.length || 0} siswa</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )

  const renderClassDetail = () => (
    <section>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={backToClasses} aria-label="Kembali ke daftar kelas" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"><ArrowLeft className="h-5 w-5" /></button>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">{selectedKelas.kelas.jenjang || 'Kelas tentor'}</p>
          <h1 className="truncate text-2xl font-extrabold text-slate-900">{selectedKelas.kelas.nama_kelas}</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola jadwal, nilai, serta tautan materi.</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/70 px-5 pt-4 sm:px-7">
          <div className="flex gap-7 overflow-x-auto">
            {MAPEL_TABS.map((mapel) => (
              <button key={mapel} onClick={() => { setActiveTab(mapel); setExpandedSessionId(null) }} className={`whitespace-nowrap border-b-2 px-1 pb-3 pt-1 text-sm font-semibold transition ${activeTab === mapel ? 'border-blue-700 text-blue-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{mapel}</button>
            ))}
          </div>
        </div>
        <div className="p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Jadwal sesi {activeTab}</h2>
              <p className="mt-1 text-sm text-slate-500">{sessions.length} sesi terjadwal</p>
            </div>
            <button onClick={openCreateSession} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"><CalendarPlus className="h-4 w-4" />Tambah sesi</button>
          </div>
          {sessionError && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{sessionError}</div>}
          {gradeProgressError && <div role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Progres input nilai tidak dapat dimuat: {gradeProgressError}</div>}
          {loadingSessions ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin text-blue-700" />Memuat jadwal...</div>
          ) : sessions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-14 text-center">
              <CalendarPlus className="mx-auto h-9 w-9 text-slate-400" />
              <h3 className="mt-3 font-bold text-slate-900">Belum ada sesi</h3>
              <p className="mt-1 text-sm text-slate-500">Tambahkan sesi pertama untuk {activeTab} di kelas ini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const studentCount = new Set(
                  (selectedKelas.kelas.kelas_siswa || []).map(getStudentId).filter(Boolean),
                ).size
                return sessions.map((session) => {
                  const expanded = expandedSessionId === session.id
                  const gradedCount = Math.min(gradeCountsBySession[session.id] || 0, studentCount)
                  const gradeProgress = studentCount
                    ? Math.round((gradedCount / studentCount) * 100)
                    : 0
                  return (
                    <article key={session.id} className={`overflow-hidden rounded-2xl border transition ${expanded ? 'border-blue-200 shadow-md ring-1 ring-blue-100' : 'border-slate-200 hover:border-blue-200'}`}>
                      <div className="flex items-start gap-3 p-4 sm:p-5">
                        <button onClick={() => setExpandedSessionId(expanded ? null : session.id)} aria-expanded={expanded} className="min-w-0 flex-1 text-left">
                          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-blue-800"><Clock3 className="h-3.5 w-3.5" />{formatTanggal(session.tanggal)}</span>
                            <span>{session.jam_mulai?.slice(0, 5) || '--:--'} – {session.jam_selesai?.slice(0, 5) || '--:--'}</span>
                            {session.link_materi && <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700"><LinkIcon className="h-3 w-3" />Materi tersedia</span>}
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{session.materi || 'Sesi pembelajaran'}</h3>
                        </button>
                        <div className="flex shrink-0 items-center gap-1">
                          <button onClick={() => openEditSession(session)} aria-label={`Edit sesi ${session.materi}`} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => removeSession(session)} aria-label={`Hapus sesi ${session.materi}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          <button onClick={() => setExpandedSessionId(expanded ? null : session.id)} aria-label={expanded ? 'Tutup detail sesi' : 'Buka detail sesi'} className={`rounded-full p-2 transition ${expanded ? 'bg-blue-50 text-blue-700' : 'text-slate-400 hover:bg-slate-100'}`}><ChevronDown className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-slate-600">Progres input nilai</span>
                          <span className="text-xs font-bold text-slate-800">
                            {loadingGradeProgress ? 'Memuat...' : `${gradedCount}/${studentCount} siswa`}
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`Progres input nilai sesi ${session.materi || ''}`} aria-valuenow={gradeProgress} aria-valuemin={0} aria-valuemax={100}>
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500" style={{ width: `${gradeProgress}%` }} />
                        </div>
                      </div>
                      {expanded && (
                        <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2">
                          <button onClick={() => setSessionForNilai(session)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-blue-800 transition hover:bg-blue-50"><CheckCircle className="h-4 w-4" />Kelola nilai siswa</button>
                          <button onClick={() => openMateri(session)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"><UploadCloud className="h-4 w-4" />{session.link_materi ? 'Kelola materi' : 'Tambah materi'}</button>
                          {session.link_materi && <a href={session.link_materi} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white sm:col-span-2"><LinkIcon className="h-4 w-4" />Buka materi di tab baru<ChevronRight className="h-4 w-4" /></a>}
                        </div>
                      )}
                    </article>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </div>
    </section>
  )

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-7xl px-1 py-2 sm:px-3 sm:py-4">
        {selectedKelas ? renderClassDetail() : renderClassList()}
      </main>
      {renderSessionForm()}
      {renderGradeModal()}
      {renderMateriModal()}
    </DashboardLayout>
  )
}
