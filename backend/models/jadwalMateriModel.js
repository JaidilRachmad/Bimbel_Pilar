"use strict";
/**
 * MODEL (MVC) — Jadwal & Materi Belajar
 * Tugas: Berinteraksi dengan database Supabase, aturan bisnis, dan query data sesi pembelajaran.
 */
const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");

const TABLE = "sesi_pembelajaran";
const TABLE_KELAS_SISWA = "kelas_siswa";
const COLUMNS = "id, kelas_id, tentor_id, mata_pelajaran, materi, tanggal, jam_mulai, jam_selesai, link_materi, created_at";
const NOT_FOUND = "Jadwal dan materi belajar tidak ditemukan";

const WRITABLE_FIELDS = Object.freeze([
    "kelas_id",
    "tentor_id",
    "mata_pelajaran",
    "materi",
    "tanggal",
    "jam_mulai",
    "jam_selesai",
    "link_materi"
]);

function pickWritable(input = {}) {
    const out = {};
    for (const key of WRITABLE_FIELDS) {
        if (input[key] !== undefined) out[key] = input[key];
    }
    if (Object.keys(out).length === 0) throw new Error("Tidak ada field yang boleh disimpan");
    return out;
}

class JadwalMateriModel {
    static WRITABLE_FIELDS = WRITABLE_FIELDS;

    static async getPaginated({ page, limit, kelas_id, tentor_id }) {
        const offset = (page - 1) * limit;
        const { rows, total } = await JadwalMateriModel.#selectPage({ offset, limit, kelas_id, tentor_id });
        return {
            items: rows,
            meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
        };
    }

    // Khusus Siswa: Mengambil jadwal & materi berdasarkan daftar kelas yang diikuti siswa di tabel kelas_siswa[cite: 1, 20, 48]
    static async getPaginatedForSiswa(siswaId, { page, limit }) {
        const offset = (page - 1) * limit;
        
        const { data: kelasSiswaList, error: errKelas } = await supabase
            .from(TABLE_KELAS_SISWA)
            .select("kelas_id")
            .eq("siswa_id", siswaId);

        if (errKelas) throw errKelas;
        const kelasIds = (kelasSiswaList || []).map(ks => ks.kelas_id);

        if (kelasIds.length === 0) {
            return { items: [], meta: { page, limit, total: 0, total_pages: 0 } };
        }

        let query = supabase.from(TABLE).select(COLUMNS, { count: "exact" }).in("kelas_id", kelasIds);

        const { data, error, count } = await query
            .order("tanggal", { ascending: false })
            .order("jam_mulai", { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        const total = count ?? 0;
        return {
            items: data,
            meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
        };
    }

    static async getById(id) {
        const item = await JadwalMateriModel.#selectById(id);
        if (!item) throw AppError.notFound(NOT_FOUND);
        return item;
    }

    static async create(input) {
        return JadwalMateriModel.#insert(pickWritable(input));
    }

    static async update(id, input) {
        const item = await JadwalMateriModel.#updateById(id, pickWritable(input));
        if (!item) throw AppError.notFound(NOT_FOUND);
        return item;
    }

    static async remove(id) {
        const deleted = await JadwalMateriModel.#deleteById(id);
        if (!deleted) throw AppError.notFound(NOT_FOUND);
    }

    static async #selectPage({ offset, limit, kelas_id, tentor_id }) {
        let query = supabase.from(TABLE).select(COLUMNS, { count: "exact" });
        if (kelas_id) query = query.eq("kelas_id", kelas_id);
        if (tentor_id) query = query.eq("tentor_id", tentor_id);

        const { data, error, count } = await query
            .order("tanggal", { ascending: false })
            .order("jam_mulai", { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { rows: data, total: count ?? 0 };
    }

    static async #selectById(id) {
        const { data, error } = await supabase.from(TABLE).select(COLUMNS).eq("id", id).maybeSingle();
        if (error) throw error;
        return data;
    }

    static async #insert(payload) {
        const { data, error } = await supabase.from(TABLE).insert(payload).select(COLUMNS).single();
        if (error) throw error;
        return data;
    }

    static async #updateById(id, payload) {
        const { data, error } = await supabase.from(TABLE).update(payload).eq("id", id).select(COLUMNS).maybeSingle();
        if (error) throw error;
        return data;
    }

    static async #deleteById(id) {
        const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select("id").maybeSingle();
        if (error) throw error;
        return data;
    }
}

module.exports = JadwalMateriModel;