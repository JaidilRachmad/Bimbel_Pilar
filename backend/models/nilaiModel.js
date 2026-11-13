"use strict";
/**
 * MODEL (MVC) — Penilaian Siswa
 * Tugas: Berinteraksi dengan database Supabase, aturan bisnis, dan query data.
 */
const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");

const TABLE = "penilaian_siswa";
const COLUMNS = "id, sesi_id, siswa_id, nilai, keterangan, created_at";
const COLUMNS_WITH_SESSION = `${COLUMNS}, sesi_pembelajaran:sesi_id (mata_pelajaran, materi, tanggal, jam_mulai, jam_selesai)`;
const NOT_FOUND = "Data penilaian siswa tidak ditemukan";

const WRITABLE_FIELDS = Object.freeze(["sesi_id", "siswa_id", "nilai", "keterangan"]);

function pickWritable(input = {}) {
    const out = {};
    for (const key of WRITABLE_FIELDS) {
        if (input[key] !== undefined) out[key] = input[key];
    }
    if (Object.keys(out).length === 0) throw new Error("Tidak ada field yang boleh disimpan");
    return out;
}

class PenilaianSiswaModel {
    static WRITABLE_FIELDS = WRITABLE_FIELDS;

    static async getPaginated({ page, limit, sesi_id, siswa_id, tentor_id }) {
        const offset = (page - 1) * limit;
        let query = supabase.from(TABLE).select(COLUMNS_WITH_SESSION, { count: "exact" });
        
        if (sesi_id) query = query.eq("sesi_id", sesi_id);
        if (siswa_id) query = query.eq("siswa_id", siswa_id);
        if (tentor_id) {
            const { data: sessions, error: sessionError } = await supabase
                .from("sesi_pembelajaran")
                .select("id")
                .eq("tentor_id", tentor_id);
            if (sessionError) throw sessionError;
            const sessionIds = (sessions || []).map(({ id }) => id);
            if (sesi_id && !sessionIds.includes(sesi_id)) {
                return { items: [], meta: { page, limit, total: 0, total_pages: 0 } };
            }
            if (sessionIds.length === 0) {
                return { items: [], meta: { page, limit, total: 0, total_pages: 0 } };
            }
            query = query.in("sesi_id", sesi_id ? [sesi_id] : sessionIds);
        }

        const { data, error, count, status, statusText } = await query
            .order("created_at", { ascending: false })
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
            .select(COLUMNS_WITH_SESSION)
            .eq("siswa_id", siswaId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        const sessionIds = [...new Set((data || []).map((grade) => grade.sesi_id))];
        if (sessionIds.length === 0) return data || [];

        const { data: sessionGrades, error: sessionGradesError } = await supabase
            .from(TABLE)
            .select("sesi_id, nilai")
            .in("sesi_id", sessionIds);

        if (sessionGradesError) throw sessionGradesError;

        const statsBySession = new Map();
        for (const grade of sessionGrades || []) {
            const score = Number(grade.nilai);
            if (!Number.isFinite(score)) continue;

            const stats = statsBySession.get(grade.sesi_id) || { total: 0, count: 0, highest: -Infinity };
            stats.total += score;
            stats.count += 1;
            stats.highest = Math.max(stats.highest, score);
            statsBySession.set(grade.sesi_id, stats);
        }

        return data.map((grade) => {
            const stats = statsBySession.get(grade.sesi_id);
            return {
                ...grade,
                rata_rata_kelas: stats?.count
                    ? Math.round((stats.total / stats.count) * 100) / 100
                    : null,
                nilai_tertinggi: stats?.count ? stats.highest : null,
            };
        });
    }

    static async create(input) {
        const payload = {
            ...pickWritable(input),
            created_at: new Date().toISOString(),
        };
        const { data, error } = await supabase.from(TABLE).insert(payload).select(COLUMNS).single();
        if (error) throw error;
        return data;
    }

    static async update(id, input) {
        const payload = pickWritable(input);
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

module.exports = PenilaianSiswaModel;