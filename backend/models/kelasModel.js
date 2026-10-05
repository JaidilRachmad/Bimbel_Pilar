"use strict";
const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");

const TABLE = "kelas";
const TABLE_KELAS_SISWA = "kelas_siswa";
const COLUMNS = "id, nama_kelas, jenjang, created_at"; 
const NOT_FOUND = "Kelas tidak ditemukan";

const WRITABLE_FIELDS = Object.freeze(["nama_kelas", "jenjang"]);

// hanya kolom ini yang pernah tertulis ke DB.
function pickWritable(input = {}) {
    const out = {};
    for (const key of WRITABLE_FIELDS) {
        if (input[key] !== undefined) out[key] = input[key];
    }
    if (Object.keys(out).length === 0) throw new Error("Tidak ada field yang boleh disimpan");
    return out;
}

class KelasModel {
    static WRITABLE_FIELDS = WRITABLE_FIELDS;

    // ======================= 1. ATURAN BISNIS =======================

    static async getPaginated({ page, limit, jenjang }) {
        const offset = (page - 1) * limit;
        const { rows, total } = await KelasModel.#selectPage({ offset, limit, jenjang });
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

    // kelas yang masih berisi siswa tidak boleh dihapus.
    static async remove(id) {
        const jumlahSiswa = await KelasModel.#countSiswa(id);
        if (jumlahSiswa > 0) {
            throw AppError.conflict(`Kelas masih memiliki ${jumlahSiswa} siswa. Keluarkan siswa terlebih dahulu.`);
        }
        const deleted = await KelasModel.#deleteById(id);
        if (!deleted) throw AppError.notFound(NOT_FOUND);
    }

    // ======================= 2. AKSES DATABASE =======================

    static async #selectPage({ offset, limit, jenjang }) {
        let query = supabase.from(TABLE).select(COLUMNS, { count: "exact" });
        if (jenjang) query = query.eq("jenjang", jenjang);

        const { data, error, count } = await query
            .order("jenjang", { ascending: true })
            .order("nama_kelas", { ascending: true })
            .order("id", { ascending: true }) 
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