"use strict";

const KelasTentorModel = require("../models/kelasTentorModel");
const AppError = require("../utils/AppError");
const { asyncHandler, sendSuccess } = require("../utils/http");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_QUERY_KEYS = Object.freeze(["page", "limit", "kelas_id", "tentor_id"]);
const PAGINATION = Object.freeze({ defaultLimit: 10, maxLimit: 100 });

function assertValid(errors) {
    if (errors.length) throw AppError.badRequest("Validasi gagal", errors);
}

function parsePositiveInt(value, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) return NaN;
    return Number.parseInt(value, 10);
}

function validateId(params) {
    assertValid(UUID_PATTERN.test(params.id || "") ? [] : ["ID relasi tidak valid"]);
    return params.id;
}

function validateBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw AppError.badRequest("Validasi gagal", ["Body harus berupa objek JSON"]);
    }

    const errors = [];
    if (Object.keys(body).some((key) => !KelasTentorModel.WRITABLE_FIELDS.includes(key))) {
        errors.push("Terdapat field yang tidak diizinkan");
    }
    if (!UUID_PATTERN.test(body.kelas_id || "")) {
        errors.push("kelas_id wajib diisi dan harus berformat UUID yang valid");
    }
    if (!UUID_PATTERN.test(body.tentor_id || "")) {
        errors.push("tentor_id wajib diisi dan harus berformat UUID yang valid");
    }

    assertValid(errors);
    return { kelas_id: body.kelas_id, tentor_id: body.tentor_id };
}

function validateListQuery(query) {
    const errors = [];
    const { defaultLimit, maxLimit } = PAGINATION;

    if (Object.keys(query).some((key) => !ALLOWED_QUERY_KEYS.includes(key))) {
        errors.push("Terdapat parameter query yang tidak diizinkan");
    }

    const page = parsePositiveInt(query.page, 1);
    const limit = parsePositiveInt(query.limit, defaultLimit);
    if (!Number.isInteger(page) || page < 1) errors.push("page harus bilangan bulat >= 1");
    if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
        errors.push(`limit harus 1 sampai ${maxLimit}`);
    }

    let kelas_id;
    if (query.kelas_id !== undefined) {
        if (!UUID_PATTERN.test(query.kelas_id)) errors.push("Filter kelas_id tidak valid");
        kelas_id = query.kelas_id;
    }

    let tentor_id;
    if (query.tentor_id !== undefined) {
        if (!UUID_PATTERN.test(query.tentor_id)) errors.push("Filter tentor_id tidak valid");
        tentor_id = query.tentor_id;
    }

    assertValid(errors);
    return { page, limit, kelas_id, tentor_id };
}

const KelasTentorController = {
    getAll: asyncHandler(async (req, res) => {
        const { items, meta } = await KelasTentorModel.getPaginated(validateListQuery(req.query));
        return sendSuccess(res, 200, { data: items, meta });
    }),

    getMine: asyncHandler(async (req, res) => {
        const data = await KelasTentorModel.getByTentorId(req.user.id);
        return sendSuccess(res, 200, { data });
    }),

    getById: asyncHandler(async (req, res) => {
        const data = await KelasTentorModel.getById(validateId(req.params));
        return sendSuccess(res, 200, { data });
    }),

    create: asyncHandler(async (req, res) => {
        const data = await KelasTentorModel.create(validateBody(req.body));
        return sendSuccess(res, 201, { message: "Tentor berhasil ditugaskan ke kelas", data });
    }),

    update: asyncHandler(async (req, res) => {
        const id = validateId(req.params);
        const data = await KelasTentorModel.update(id, validateBody(req.body));
        return sendSuccess(res, 200, { message: "Penugasan tentor berhasil diperbarui", data });
    }),

    remove: asyncHandler(async (req, res) => {
        await KelasTentorModel.remove(validateId(req.params));
        return sendSuccess(res, 200, { message: "Tentor berhasil dikeluarkan dari kelas" });
    })
};

module.exports = KelasTentorController;
