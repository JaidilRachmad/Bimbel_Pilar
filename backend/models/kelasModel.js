"use strict";
const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");

const TABLE = "kelas";
const TABLE_KELAS_SISWA = "kelas_siswa";
const COLUMNS = "id, nama_kelas, jenjang, harga, paket, created_at"; 
const NOT_FOUND = "Kelas tidak ditemukan";
const WRITABLE_FIELDS = Object.freeze(["nama_kelas", "jenjang", "harga", "paket"]); // field yang boleh diubah melalui API

function pickWritable(input = {}) {
    const out = {};
    for (const key of WRITABLE_FIELDS) {
        if (input[key] !== undefined) out[key] = input[key];
    }
    if (Object.keys(out).length === 0) throw new Error("Tidak ada field yang boleh disimpan");
    return out;
}

// Kunci urut: angka tingkat (6-9), lalu tipe kelas (Intensif < Reguler, sesuai abjad), lalu nama lengkap
function sortKey(namaKelas = "") {
    const nama = String(namaKelas).trim().toLowerCase();
    const match = nama.match(/\d+/);
    const angka = match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
    const tipe = nama.replace(/^\D*\d+\s*[a-z]?(?=\s|$)/, "").trim();
    return { angka, tipe, nama };
}
function compareKelas(a, b) {
    const ka = sortKey(a.nama_kelas);
    const kb = sortKey(b.nama_kelas);
    return (ka.angka - kb.angka)
        || ka.tipe.localeCompare(kb.tipe, "id")
        || ka.nama.localeCompare(kb.nama, "id", { numeric: true })
        || String(a.id).localeCompare(String(b.id));
}

class KelasModel {
    static WRITABLE_FIELDS = WRITABLE_FIELDS;

    // ======================= 1. ATURAN BISNIS =======================
    static async getPaginated({ page, limit, jenjang, sort = "asc" }) {
        const offset = (page - 1) * limit;
        const { rows, total } = await KelasModel.#selectPage({ offset, limit, jenjang, sort });
        return {
            items: rows,
            meta: { page, limit, total, total_pages: Math.ceil(total / limit) }, //pagination limit
        };
    }
    static async getById(id) {
        const kelas = await KelasModel.#selectById(id);
        if (!kelas) throw AppError.notFound(NOT_FOUND);
        return kelas;
    }
    static async create(input) {
        return KelasModel.#insert(pickWritable(input));
    }
    static async update(id, input) {
        const kelas = await KelasModel.#updateById(id, pickWritable(input));
        if (!kelas) throw AppError.notFound(NOT_FOUND);
        return kelas;
    }
    static async remove(id) {
        const jumlahSiswa = await KelasModel.#countSiswa(id);
        if (jumlahSiswa > 0) {
            throw AppError.conflict(`Kelas masih memiliki ${jumlahSiswa} siswa. Keluarkan siswa terlebih dahulu.`);
        }
        const deleted = await KelasModel.#deleteById(id);
        if (!deleted) throw AppError.notFound(NOT_FOUND);
    }

    // ======================= 2. AKSES DATABASE =======================
    static async #selectPage({ offset, limit, jenjang, sort }) {
        let query = supabase
            .from(TABLE)
            .select(`
                ${COLUMNS},
                kelas_siswa (
                    id,
                    siswa_id,
                    siswa_profile:siswa_id (id, nama)
                ),
                kelas_tentor (
                    id,
                    tentor_id,
                    tentor_profile:tentor_id (id, nama)
                )
            `, { count: "exact" });

        if (jenjang) query = query.eq("jenjang", jenjang);

        // Urutan custom (natural + Intensif/Reguler) tidak bisa lewat ORDER BY SQL,
        // jadi ambil semua baris lalu urutkan & paginasi di memori (tabel kecil).
        const { data, error } = await query;
        if (error) throw error;

        const sorted = [...data].sort(compareKelas);
        if (sort === "desc") sorted.reverse();
        return { rows: sorted.slice(offset, offset + limit), total: sorted.length };
    }
    static async #selectById(id) {
        const { data, error } = await supabase
            .from(TABLE)
            .select(`
                ${COLUMNS},
                kelas_siswa (
                    id,
                    siswa_id,
                    siswa_profile:siswa_id (id, nama)
                ),
                kelas_tentor (
                    id,
                    tentor_id,
                    tentor_profile:tentor_id (id, nama)
                )
            `)
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;
        return data
    }
    static async #insert(payload) {
        const { data, error } = await supabase.from(TABLE).insert(payload).select(COLUMNS).single();
        if (error) throw error;
        return data;
    }
    static async #updateById(id, payload) {
        const { data, error } = await supabase
            .from(TABLE).update(payload).eq("id", id).select(COLUMNS).maybeSingle();
        if (error) throw error;
        return data;
    }
    static async #deleteById(id) {
        const { data, error } = await supabase
            .from(TABLE).delete().eq("id", id).select("id").maybeSingle();
        if (error) throw error;
        return data;
    }
    static async #countSiswa(kelasId) {
        const { count, error } = await supabase
            .from(TABLE_KELAS_SISWA)
            .select("id", { count: "exact", head: true })
            .eq("kelas_id", kelasId);
        if (error) throw error;
        return count ?? 0;
    }
}

module.exports = KelasModel;