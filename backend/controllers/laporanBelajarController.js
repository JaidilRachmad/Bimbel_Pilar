"use strict";
/**
 * CONTROLLER (MVC) — Laporan Progres Belajar
 * Tugas: baca request -> validasi format input -> panggil model -> kirim response.
 */
const LaporanProgresModel = require("../models/laporanProgresModel");
const AppError = require("../utils/AppError");
const { asyncHandler, sendSuccess } = require("../utils/http");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_QUERY_KEYS = Object.freeze(["page", "limit", "siswa_id"]);

function assertValid(errors) {
    if (errors.length) throw AppError.badRequest("Validasi gagal", errors);
}

function parsePositiveInt(value, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) return NaN;
    return Number.parseInt(value, 10);
}

function validateId(params) {
    assertValid(UUID_PATTERN.test(params.id || "") ? [] : ["ID laporan progres tidak valid"]);
    return params.id;
}

function validateBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw AppError.badRequest("Validasi gagal", ["Body harus berupa objek JSON"]);
    }

    const errors = [];
    if (Object.keys(body).some((key) => !LaporanProgresModel.WRITABLE_FIELDS.includes(key))) {
        errors.push("Terdapat field yang tidak diizinkan"); // Cegah mass assignment
    }

    if (!UUID_PATTERN.test(body.siswa_id || "")) {
        errors.push("siswa_id wajib diisi dan harus berformat UUID yang valid");
    }

    if (typeof body.periode !== "string" || body.periode.trim() === "") {
        errors.push("periode wajib diisi (misal: April 2026)");
    }

    assertValid(errors);
    return {
        siswa_id: body.siswa_id,
        periode: body.periode.trim(),
        catatan_wali_kelas: body.catatan_wali_kelas ? body.catatan_wali_kelas.trim() : null,
        saran_pengembangan: body.saran_pengembangan ? body.saran_pengembangan.trim() : null,
        nilai_id: body.nilai_id && UUID_PATTERN.test(body.nilai_id) ? body.nilai_id : null,
    };
}

function validateListQuery(query) {
    const errors = [];
    if (Object.keys(query).some((key) => !ALLOWED_QUERY_KEYS.includes(key))) {
        errors.push("Terdapat parameter query yang tidak diizinkan");
    }

    const page = parsePositiveInt(query.page, 1);
    const limit = parsePositiveInt(query.limit, 10);
    if (!Number.isInteger(page) || page < 1) errors.push("page harus bilangan bulat >= 1");
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) errors.push("limit harus 1 sampai 100");

    let siswa_id;
    if (query.siswa_id !== undefined) {
        if (!UUID_PATTERN.test(query.siswa_id)) errors.push("Filter siswa_id tidak valid");
        siswa_id = query.siswa_id;
    }

    assertValid(errors);
    return { page, limit, siswa_id };
}

const LaporanProgresController = {
    getAll: asyncHandler(async (req, res) => {
        const { items, meta } = await LaporanProgresModel.getPaginated(validateListQuery(req.query));
        return sendSuccess(res, 200, { data: items, meta });
    }),

    getById: asyncHandler(async (req, res) => {
        const id = validateId(req.params);
        const data = await LaporanProgresModel.getById(id);
        return sendSuccess(res, 200, { data });
    }),

    getMyLaporan: asyncHandler(async (req, res) => {
        const siswaId = req.user.siswa_id || req.user.id;
        const data = await LaporanProgresModel.getBySiswaId(siswaId);
        return sendSuccess(res, 200, { data });
    }),

    downloadLaporan: asyncHandler(async (req, res) => {
        const id = validateId(req.params);
        const data = await LaporanProgresModel.getById(id);

        // Jika user adalah siswa, pastikan hanya mengunduh miliknya sendiri
        if (req.user.role === "siswa") {
            const siswaId = req.user.siswa_id || req.user.id;
            if (data.siswa_id !== siswaId) {
                throw AppError.forbidden("Anda tidak memiliki hak akses untuk mengunduh laporan ini");
            }
        }

        // Response siap diunduh (bisa dikembangkan ke generate PDF atau ambil dari Supabase Storage)
        return sendSuccess(res, 200, { message: "Laporan siap diunduh", data });
    }),

    create: asyncHandler(async (req, res) => {
        const data = await LaporanProgresModel.create(validateBody(req.body));
        return sendSuccess(res, 201, { message: "Laporan progres berhasil ditambahkan", data });
    }),

    update: asyncHandler(async (req, res) => {
        const id = validateId(req.params);
        const data = await LaporanProgresModel.update(id, validateBody(req.body));
        return sendSuccess(res, 200, { message: "Laporan progres berhasil diperbarui", data });
    }),

    remove: asyncHandler(async (req, res) => {
        await LaporanProgresModel.remove(validateId(req.params));
        return sendSuccess(res, 200, { message: "Laporan progres berhasil dihapus" });
    }),
};

module.exports = LaporanProgresController;