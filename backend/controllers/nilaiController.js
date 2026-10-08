"use strict";
/**
 * CONTROLLER (MVC) — Penilaian Siswa
 * Tugas: baca request -> validasi format input -> panggil model -> kirim response.
 */
const PenilaianSiswaModel = require("../models/penilaianSiswaModel");
const AppError = require("../utils/AppError");
const { asyncHandler, sendSuccess } = require("../utils/http");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_QUERY_KEYS = Object.freeze(["page", "limit", "sesi_id", "siswa_id"]);

function assertValid(errors) {
    if (errors.length) throw AppError.badRequest("Validasi gagal", errors);
}

function parsePositiveInt(value, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) return NaN;
    return Number.parseInt(value, 10);
}

function validateId(params) {
    assertValid(UUID_PATTERN.test(params.id || "") ? [] : ["ID penilaian tidak valid"]);
    return params.id;
}

function validateBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw AppError.badRequest("Validasi gagal", ["Body harus berupa objek JSON"]);
    }

    const errors = [];
    if (Object.keys(body).some((key) => !PenilaianSiswaModel.WRITABLE_FIELDS.includes(key))) {
        errors.push("Terdapat field yang tidak diizinkan"); // Cegah mass assignment
    }

    if (!UUID_PATTERN.test(body.sesi_id || "")) {
        errors.push("sesi_id wajib diisi dan harus berformat UUID yang valid");
    }

    if (!UUID_PATTERN.test(body.siswa_id || "")) {
        errors.push("siswa_id wajib diisi dan harus berformat UUID yang valid");
    }

    if (typeof body.nilai !== "string" || body.nilai.trim() === "") {
        errors.push("nilai wajib diisi (misal: angka atau predikat huruf seperti A, B, 85)");
    }

    assertValid(errors);
    return {
        sesi_id: body.sesi_id,
        siswa_id: body.siswa_id,
        nilai: body.nilai.trim(),
        keterangan: body.keterangan ? body.keterangan.trim() : null,
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

    let sesi_id;
    if (query.sesi_id !== undefined) {
        if (!UUID_PATTERN.test(query.sesi_id)) errors.push("Filter sesi_id tidak valid");
        sesi_id = query.sesi_id;
    }

    let siswa_id;
    if (query.siswa_id !== undefined) {
        if (!UUID_PATTERN.test(query.siswa_id)) errors.push("Filter siswa_id tidak valid");
        siswa_id = query.siswa_id;
    }

    assertValid(errors);
    return { page, limit, sesi_id, siswa_id };
}

const PenilaianSiswaController = {
    getAll: asyncHandler(async (req, res) => {
        const { items, meta } = await PenilaianSiswaModel.getPaginated(validateListQuery(req.query));
        return sendSuccess(res, 200, { data: items, meta });
    }),

    getById: asyncHandler(async (req, res) => {
        const data = await PenilaianSiswaModel.getById(validateId(req.params));
        return sendSuccess(res, 200, { data });
    }),

    getMyNilai: asyncHandler(async (req, res) => {
        const siswaId = req.user.siswa_id || req.user.id;
        const data = await PenilaianSiswaModel.getBySiswaId(siswaId);
        return sendSuccess(res, 200, { data });
    }),

    create: asyncHandler(async (req, res) => {
        const data = await PenilaianSiswaModel.create(validateBody(req.body));
        return sendSuccess(res, 201, { message: "Penilaian siswa berhasil ditambahkan", data });
    }),

    update: asyncHandler(async (req, res) => {
        const id = validateId(req.params);
        const data = await PenilaianSiswaModel.update(id, validateBody(req.body));
        return sendSuccess(res, 200, { message: "Penilaian siswa berhasil diperbarui", data });
    }),

    remove: asyncHandler(async (req, res) => {
        await PenilaianSiswaModel.remove(validateId(req.params));
        return sendSuccess(res, 200, { message: "Penilaian siswa berhasil dihapus" });
    }),
};

module.exports = PenilaianSiswaController;