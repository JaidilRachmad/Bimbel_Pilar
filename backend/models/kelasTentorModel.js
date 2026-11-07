"use strict";

const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");

const TABLE = "kelas_tentor";
const COLUMNS = "id, kelas_id, tentor_id, created_at";
const WRITABLE_FIELDS = Object.freeze(["kelas_id", "tentor_id"]);
const NOT_FOUND = "Relasi kelas dan tentor tidak ditemukan";

function pickWritable(input = {}) {
    const out = {};
    for (const key of WRITABLE_FIELDS) {
        if (input[key] !== undefined) out[key] = input[key];
    }
    if (Object.keys(out).length === 0) throw new Error("Tidak ada field yang boleh disimpan");
    return out;
}

class KelasTentorModel {
    static WRITABLE_FIELDS = WRITABLE_FIELDS;

    static async getPaginated({ page, limit, kelas_id, tentor_id }) {
        const offset = (page - 1) * limit;
        const { rows, total } = await KelasTentorModel.#selectPage({
            offset,
            limit,
            kelas_id,
            tentor_id
        });

        return {
            items: rows,
            meta: { page, limit, total, total_pages: Math.ceil(total / limit) }
        };
    }

    static async getByTentorId(tentorId) {
        const { data, error } = await supabase
            .from(TABLE)
            .select(`
                ${COLUMNS},
                kelas:kelas_id (id, nama_kelas, jenjang, kelas_siswa (id))
            `)
            .eq("tentor_id", tentorId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    }

    static async getById(id) {
        const relation = await KelasTentorModel.#selectById(id);
        if (!relation) throw AppError.notFound(NOT_FOUND);
        return relation;
    }

    static async create(input) {
        const payload = pickWritable(input);
        await KelasTentorModel.#assertReferences(payload);
        await KelasTentorModel.#assertNotDuplicate(payload);
        return KelasTentorModel.#insert(payload);
    }

    static async update(id, input) {
        const current = await KelasTentorModel.#findRawById(id);
        if (!current) throw AppError.notFound(NOT_FOUND);

        const payload = pickWritable(input);
        const nextPayload = {
            kelas_id: payload.kelas_id ?? current.kelas_id,
            tentor_id: payload.tentor_id ?? current.tentor_id
        };

        await KelasTentorModel.#assertReferences(nextPayload);
        await KelasTentorModel.#assertNotDuplicate(nextPayload, id);
        return KelasTentorModel.#updateById(id, payload);
    }

    static async remove(id) {
        const deleted = await KelasTentorModel.#deleteById(id);
        if (!deleted) throw AppError.notFound(NOT_FOUND);
    }

    static async #selectPage({ offset, limit, kelas_id, tentor_id }) {
        let query = supabase
            .from(TABLE)
            .select(`
                ${COLUMNS},
                kelas:kelas_id (id, nama_kelas, jenjang),
                tentor:tentor_id (id, nama, no_telp, alamat)
            `, { count: "exact" });

        if (kelas_id) query = query.eq("kelas_id", kelas_id);
        if (tentor_id) query = query.eq("tentor_id", tentor_id);

        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .order("id", { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { rows: data, total: count ?? 0 };
    }

    static async #selectById(id) {
        const { data, error } = await supabase
            .from(TABLE)
            .select(`
                ${COLUMNS},
                kelas:kelas_id (id, nama_kelas, jenjang),
                tentor:tentor_id (id, nama, no_telp, alamat)
            `)
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    static async #findRawById(id) {
        const { data, error } = await supabase
            .from(TABLE)
            .select("id, kelas_id, tentor_id")
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    static async #assertReferences({ kelas_id, tentor_id }) {
        const [{ data: kelas, error: kelasError }, { data: tentor, error: tentorError }] = await Promise.all([
            supabase.from("kelas").select("id").eq("id", kelas_id).maybeSingle(),
            supabase.from("tentor_profile").select("id").eq("id", tentor_id).maybeSingle()
        ]);

        if (kelasError) throw kelasError;
        if (tentorError) throw tentorError;
        if (!kelas) throw AppError.notFound("Kelas yang dipilih tidak ditemukan");
        if (!tentor) throw AppError.notFound("Tentor yang dipilih tidak ditemukan");
    }

    static async #assertNotDuplicate({ kelas_id, tentor_id }, excludedId) {
        let query = supabase
            .from(TABLE)
            .select("id")
            .eq("kelas_id", kelas_id)
            .eq("tentor_id", tentor_id)
            .limit(1);

        if (excludedId) query = query.neq("id", excludedId);

        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        if (data) throw AppError.conflict("Tentor tersebut sudah ditugaskan ke kelas ini");
    }

    static async #insert(payload) {
        const { data, error } = await supabase
            .from(TABLE)
            .insert(payload)
            .select(COLUMNS)
            .single();

        if (error) throw error;
        return KelasTentorModel.#selectById(data.id);
    }

    static async #updateById(id, payload) {
        const { data, error } = await supabase
            .from(TABLE)
            .update(payload)
            .eq("id", id)
            .select(COLUMNS)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw AppError.notFound(NOT_FOUND);
        return KelasTentorModel.#selectById(data.id);
    }

    static async #deleteById(id) {
        const { data, error } = await supabase
            .from(TABLE)
            .delete()
            .eq("id", id)
            .select("id")
            .maybeSingle();

        if (error) throw error;
        return data;
    }
}

module.exports = KelasTentorModel;
