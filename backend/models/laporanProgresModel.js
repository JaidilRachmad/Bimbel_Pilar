"use strict";
/**
 * MODEL (MVC) — Laporan Progres Belajar
 * Tugas: Berinteraksi dengan database Supabase, aturan bisnis, dan query data laporan progres.
 */
const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");

const TABLE = "laporan_progres";
const COLUMNS = `
    id,
    siswa_id,
    periode,
    catatan_wali_kelas,
    saran_pengembangan,
    nilai_id,
    created_at,
    updated_at,
    siswa_profile:siswa_id (id, nama),
    penilaian_siswa:nilai_id (id, nilai, keterangan)
`;
const NOT_FOUND = "Data laporan progres belajar tidak ditemukan";

const WRITABLE_FIELDS = Object.freeze([
    "siswa_id",
    "periode",
    "catatan_wali_kelas",
    "saran_pengembangan",
    "nilai_id"
]);

function pickWritable(input = {}) {
    const out = {};
    for (const key of WRITABLE_FIELDS) {
        if (input[key] !== undefined) out[key] = input[key];
    }
    if (Object.keys(out).length === 0) throw new Error("Tidak ada field yang boleh disimpan");
    return out;
}

class LaporanProgresModel {
    static WRITABLE_FIELDS = WRITABLE_FIELDS;

    // Admin & Siswa: Mengambil data dengan paginasi dan filter opsional
    static async getPaginated({ page, limit, siswa_id, periode }) {
        const offset = (page - 1) * limit;
        let query = supabase.from(TABLE).select(COLUMNS, { count: "exact" });
        
        if (siswa_id) query = query.eq("siswa_id", siswa_id);
        if (periode) query = query.eq("periode", periode);

        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return {
            items: data,
            meta: { page, limit, total: count ?? 0, total_pages: Math.ceil((count ?? 0) / limit) },
        };
    }

    static async getStudentIdsWithReports() {
        const studentIds = new Set();
        const pageSize = 1000;
        let offset = 0;

        while (true) {
            const { data, error } = await supabase
                .from(TABLE)
                .select("siswa_id")
                .order("siswa_id", { ascending: true })
                .range(offset, offset + pageSize - 1);

            if (error) throw error;
            data.forEach(({ siswa_id }) => studentIds.add(siswa_id));
            if (data.length < pageSize) return [...studentIds];
            offset += data.length;
        }
    }

    // Mengambil data berdasarkan ID (untuk detail / unduh laporan)
    static async getById(id) {
        const { data, error } = await supabase.from(TABLE).select(COLUMNS).eq("id", id).maybeSingle();
        if (error) throw error;
        if (!data) throw AppError.notFound(NOT_FOUND);
        return data;
    }

    // Siswa: Mengambil daftar laporan miliknya sendiri
    static async getBySiswaId(siswaId) {
        const { data, error } = await supabase
            .from(TABLE)
            .select(COLUMNS)
            .eq("siswa_id", siswaId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    }

    // Admin: Membuat laporan progres baru
    static async create(input) {
        return LaporanProgresModel.saveGeneratedReport(input);
    }

    // Admin: Memperbarui laporan progres
    static async update(id, input) {
        const payload = {
            ...pickWritable(input),
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase
            .from(TABLE)
            .update(payload)
            .eq("id", id)
            .select(COLUMNS)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw AppError.notFound(NOT_FOUND);
        return data;
    }

    // Admin: Menghapus laporan progres
    static async remove(id) {
        const { data, error } = await supabase
            .from(TABLE)
            .delete()
            .eq("id", id)
            .select("id")
            .maybeSingle();

        if (error) throw error;
        if (!data) throw AppError.notFound(NOT_FOUND);
    }

    // Ambil data siswa lengkap dengan kelas dan histori nilai untuk bahan prompt AI
    static async getStudentWithAcademicData(siswaId) {
        // 1. Cek profil siswa di siswa_profile
        let { data: siswa, error: siswaErr } = await supabase
            .from("siswa_profile")
            .select("id, nama, nama_wali, no_telp")
            .eq("id", siswaId)
            .maybeSingle();

        if (siswaErr) throw siswaErr;

        // Jika tidak ditemukan di siswa_profile, periksa tabel profiles
        if (!siswa) {
            const { data: profile, error: profErr } = await supabase
                .from("profiles")
                .select("id, role")
                .eq("id", siswaId)
                .maybeSingle();

            if (profErr) throw profErr;
            if (!profile || profile.role !== "siswa") {
                return null;
            }

            siswa = {
                id: profile.id,
                nama: "Siswa",
                nama_wali: null,
                no_telp: null,
            };
        }

        // 2. Ambil info kelas dari kelas_siswa
        const { data: kelasSiswa, error: kelasErr } = await supabase
            .from("kelas_siswa")
            .select("kelas_id, kelas:kelas_id (id, nama_kelas, jenjang)")
            .eq("siswa_id", siswaId)
            .limit(1)
            .maybeSingle();

        if (kelasErr) {
            throw AppError.internal(`Gagal mengambil kelas siswa: ${kelasErr.message}`);
        }

        // 3. Ambil nilai dan catatan tentor dari penilaian_siswa
        const { data: nilaiList, error: nilaiErr } = await supabase
            .from("penilaian_siswa")
            .select(`
                id,
                nilai,
                keterangan,
                created_at,
                sesi_pembelajaran:sesi_id (
                    mata_pelajaran,
                    materi,
                    tanggal,
                    jam_mulai,
                    jam_selesai
                )
            `)
            .eq("siswa_id", siswaId)
            .order("created_at", { ascending: false });

        if (nilaiErr) {
            throw AppError.internal(`Gagal mengambil nilai siswa: ${nilaiErr.message}`);
        }

        return {
            id: siswa.id,
            nama: siswa.nama || "Siswa",
            nama_wali: siswa.nama_wali,
            no_telp: siswa.no_telp,
            kelas_id: kelasSiswa?.kelas?.id || null,
            nama_kelas: kelasSiswa?.kelas?.nama_kelas || null,
            jenjang: kelasSiswa?.kelas?.jenjang || null,
            grades: (nilaiList || []).map((n) => ({
                id: n.id,
                nilai: n.nilai,
                keterangan: n.keterangan,
                mata_pelajaran: n.sesi_pembelajaran?.mata_pelajaran || "Mata Pelajaran",
                materi: n.sesi_pembelajaran?.materi || "",
                tanggal: n.sesi_pembelajaran?.tanggal || "",
                created_at: n.created_at,
            })),
        };
    }

    // Simpan atau perbarui satu laporan per siswa dan periode
    static async saveGeneratedReport({ siswa_id, periode, catatan_wali_kelas, saran_pengembangan, nilai_id }) {
        const { data: existingSiswa, error: siswaError } = await supabase
            .from("siswa_profile")
            .select("id")
            .eq("id", siswa_id)
            .maybeSingle();

        if (siswaError) throw AppError.internal(`Gagal memeriksa profil siswa: ${siswaError.message}`);
        if (!existingSiswa) {
            throw AppError.notFound("Profil siswa tidak ditemukan. Pastikan akun siswa sudah memiliki data profil.");
        }

        const { data: existingReport, error: reportError } = await supabase
            .from(TABLE)
            .select("created_at")
            .eq("siswa_id", siswa_id)
            .eq("periode", periode)
            .maybeSingle();

        if (reportError) throw AppError.internal(`Gagal memeriksa laporan sebelumnya: ${reportError.message}`);

        const now = new Date().toISOString();
        const payload = {
            siswa_id,
            periode,
            catatan_wali_kelas,
            saran_pengembangan,
            nilai_id: nilai_id || null,
            created_at: existingReport?.created_at || now,
            updated_at: now,
        };

        const { data, error } = await supabase
            .from(TABLE)
            .upsert(payload, { onConflict: "siswa_id,periode" })
            .select(COLUMNS)
            .single();

        if (error) {
            if (error.code === "23503") {
                throw AppError.badRequest("Tidak dapat menyimpan laporan karena data siswa atau nilai terkait tidak valid.");
            }
            if (error.code === "23505") {
                throw AppError.conflict("Laporan siswa untuk periode ini gagal diperbarui karena terjadi duplikasi data. Coba simpan kembali.");
            }
            if (error.code === "23514" || error.code === "22001") {
                throw AppError.badRequest("Isi laporan tidak memenuhi batas atau aturan yang ditetapkan database.");
            }
            throw AppError.internal(`Gagal menyimpan laporan: ${error.message}`);
        }
        return data;
    }
}

module.exports = LaporanProgresModel;
