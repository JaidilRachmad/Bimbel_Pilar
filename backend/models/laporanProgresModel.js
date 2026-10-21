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
    static async getPaginated({ page, limit, siswa_id }) {
        const offset = (page - 1) * limit;
        let query = supabase.from(TABLE).select(COLUMNS, { count: "exact" });
        
        if (siswa_id) query = query.eq("siswa_id", siswa_id);

        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return {
            items: data,
            meta: { page, limit, total: count ?? 0, total_pages: Math.ceil((count ?? 0) / limit) },
        };
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
        const payload = {
            ...pickWritable(input),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase.from(TABLE).insert(payload).select(COLUMNS).single();
        if (error) throw error;
        return data;
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
}

module.exports = LaporanProgresModel;