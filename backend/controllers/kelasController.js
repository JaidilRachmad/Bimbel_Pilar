"use strict";
/**
 * CONTROLLER (MVC) — Kelas
 * Tugas: baca request -> validasi format input -> panggil model -> kirim response.
 * Tidak berisi query database dan tidak berisi aturan bisnis.
 */
const config = require("../config/env");
const KelasModel = require("../models/kelasModel");
const AppError = require("../utils/AppError");
const { asyncHandler, sendSuccess } = require("../utils/http");

// ======================= VALIDASI INPUT  =======================

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAMA_KELAS_PATTERN = /^[A-Za-z0-9 .()-]+$/; // masking: < > ' " ; ` \ { } ditolak
const NAMA_KELAS_MAX = 50;
const ALLOWED_QUERY_KEYS = Object.freeze(["page", "limit", "jenjang"]);

function assertValid(errors) {
    if (errors.length) throw AppError.badRequest("Validasi gagal", errors);
}

function normalizeJenjang(value) {
    return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function parsePositiveInt(value, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) return NaN;
    return Number.parseInt(value, 10);
}

function validateId(params) {
    assertValid(UUID_PATTERN.test(params.id || "") ? [] : ["ID kelas tidak valid"]);
    return params.id;
}

function validateBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw AppError.badRequest("Validasi gagal", ["Body harus berupa objek JSON"]);
    }

    const errors = [];
    if (Object.keys(body).some((key) => !KelasModel.WRITABLE_FIELDS.includes(key))) {
        errors.push("Terdapat field yang tidak diizinkan"); // cegah mass assignment
    }

    let nama = "";
    if (typeof body.nama_kelas !== "string" || body.nama_kelas.trim() === "") {
        errors.push("nama_kelas wajib diisi");
    } else {
        nama = body.nama_kelas.trim().replace(/\s+/g, " ");
        if (nama.length > NAMA_KELAS_MAX) errors.push(`nama_kelas maksimal ${NAMA_KELAS_MAX} karakter`);
        if (!NAMA_KELAS_PATTERN.test(nama)) {
            errors.push("nama_kelas hanya boleh berisi huruf, angka, spasi, titik, tanda hubung, dan kurung");
        }
    }

    const jenjang = normalizeJenjang(body.jenjang);
    if (!config.jenjangList.includes(jenjang)) {
        errors.push(`jenjang wajib salah satu dari: ${config.jenjangList.join(", ")}`);
    }

    assertValid(errors);
    return { nama_kelas: nama, jenjang };
}

function validateListQuery(query) {
    const errors = [];
    const { defaultLimit, maxLimit } = config.pagination;

    if (Object.keys(query).some((key) => !ALLOWED_QUERY_KEYS.includes(key))) {
        errors.push("Terdapat parameter query yang tidak diizinkan");
    }

    const page = parsePositiveInt(query.page, 1);
    const limit = parsePositiveInt(query.limit, defaultLimit);
    if (!Number.isInteger(page) || page < 1) errors.push("page harus bilangan bulat >= 1");
    if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) errors.push(`limit harus 1 sampai ${maxLimit}`);

    let jenjang;
    if (query.jenjang !== undefined) {
        jenjang = normalizeJenjang(query.jenjang);
        if (!config.jenjangList.includes(jenjang)) errors.push("Filter jenjang tidak valid");
    }

    assertValid(errors);
    return { page, limit, jenjang };
}

// ======================= HANDLER =======================

const KelasController = {
    getAll: asyncHandler(async (req, res) => {
        const { items, meta } = await KelasModel.getPaginated(validateListQuery(req.query));
        return sendSuccess(res, 200, { data: items, meta });
    }),

    getById: asyncHandler(async (req, res) => {
        const data = await KelasModel.getById(validateId(req.params));
        return sendSuccess(res, 200, { data });
    }),

    create: asyncHandler(async (req, res) => {
        const data = await KelasModel.create(validateBody(req.body));
        return sendSuccess(res, 201, { message: "Kelas berhasil ditambahkan", data });
    }),

    update: asyncHandler(async (req, res) => {
        const id = validateId(req.params);
        const data = await KelasModel.update(id, validateBody(req.body));
        return sendSuccess(res, 200, { message: "Kelas berhasil diperbarui", data });
    }),

    remove: asyncHandler(async (req, res) => {
        await KelasModel.remove(validateId(req.params));
        return sendSuccess(res, 200, { message: "Kelas berhasil dihapus" });
    }),
};

module.exports = KelasController;