"use strict";

const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");

const TABLE = "tagihan_spp";
// Menambahkan is_blocked ke dalam COLUMNS agar terbaca di frontend
const COLUMNS = "id, siswa_id, nominal, status, bulan, tahun, tanggal_jatuh_tempo, is_blocked, created_at, updated_at, siswa_profile(nama, nama_wali, kelas_siswa(kelas(nama_kelas))), invoice_pembayaran(metode_pembayaran, tanggal_pembayaran)";
const NOT_FOUND = "Tagihan SPP tidak ditemukan";

const WRITABLE_FIELDS = Object.freeze([
    "siswa_id",
    "nominal",
    "status",
    "tanggal_jatuh_tempo",
    "bulan",
    "tahun",
    "is_blocked" // Tambahkan ini agar bisa diupdate
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
        const payload = { ...pickWritable(input), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        const { data, error } = await supabase.from(TABLE).insert(payload).select(COLUMNS).single();
        if (error) throw error;
        return data;
    }

    static async update(id, input) {
        const payload = { ...pickWritable(input), updated_at: new Date().toISOString() };
        const { data, error } = await supabase.from(TABLE).update(payload).eq("id", id).select(COLUMNS).maybeSingle();
        if (error) throw error;
        if (!data) throw AppError.notFound(NOT_FOUND);
        return data;
    }

    static async updateInvoiceDate(tagihanId, tanggal_pembayaran) {
        const { data, error } = await supabase
            .from('invoice_pembayaran')
            .update({ tanggal_pembayaran: tanggal_pembayaran })
            .eq('tagihan_id', tagihanId)
            .select()
            .maybeSingle(); 
        if (error) throw error;
        return data;
    }

    static async remove(id) {
        const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select("id").maybeSingle();
        if (error) throw error;
        if (!data) throw AppError.notFound(NOT_FOUND);
    }

    static async updateNominal(id, nominal) {
        const { data, error } = await supabase
            .from(TABLE)
            .update({ nominal: nominal, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select(COLUMNS)
            .maybeSingle();
        if (error) throw error;
        return data;
    }

    static async bukaBlokir(id) {
        const { data, error } = await supabase
            .from(TABLE)
            .update({ is_blocked: false, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select(COLUMNS)
            .maybeSingle();
        if (error) throw error;
        return data;
    }
}

module.exports = TagihanSppModel;