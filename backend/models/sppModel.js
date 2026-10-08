"use strict";
/**
 * MODEL (MVC) — Tagihan SPP
 * Tugas: Berinteraksi dengan database Supabase, aturan bisnis, dan query data.
 */
const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");

const TABLE = "tagihan_spp";
const COLUMNS = "id, siswa_id, nominal, status, tanggal_jatuh_tempo, bulan, tahun, created_at, updated_at";
const NOT_FOUND = "Tagihan SPP tidak ditemukan";

const WRITABLE_FIELDS = Object.freeze([
    "siswa_id",
    "nominal",
    "status",
    "tanggal_jatuh_tempo",
    "bulan",
    "tahun",
]);

function pickWritable(input = {}) {
    const out = {};
    for (const key of WRITABLE_FIELDS) {
        if (input[key] !== undefined) out[key] = input[key];
    }
    if (Object.keys(out).length === 0) throw new Error("Tidak ada field yang boleh disimpan");
    return out;
}

class TagihanSppModel {
    static WRITABLE_FIELDS = WRITABLE_FIELDS;

    // ======================= ATURAN BISNIS & QUERY =======================

    static async getPaginated({ page, limit, status }) {
        const offset = (page - 1) * limit;
        let query = supabase.from(TABLE).select(COLUMNS, { count: "exact" });
        
        if (status) query = query.eq("status", status);

        const { data, error, count } = await query
            .order("tahun", { ascending: false })
            .order("bulan", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return {
            items: data,
            meta: { page, limit, total: count ?? 0, total_pages: Math.ceil((count ?? 0) / limit) },
        };
    }

    static async getById(id) {
        const { data, error } = await supabase.from(TABLE).select(COLUMNS).eq("id", id).maybeSingle();
        if (error) throw error;
        if (!data) throw AppError.notFound(NOT_FOUND);
        return data;
    }

    static async getBySiswaId(siswaId) {
        const { data, error } = await supabase
            .from(TABLE)
            .select(COLUMNS)
            .eq("siswa_id", siswaId)
            .order("tahun", { ascending: false })
            .order("bulan", { ascending: false });

        if (error) throw error;
        return data;
    }

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

module.exports = TagihanSppModel;