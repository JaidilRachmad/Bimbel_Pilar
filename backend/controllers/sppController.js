"use strict";
/**
 * CONTROLLER (MVC) — Tagihan SPP (Admin)
 * Tugas: baca request -> validasi format input -> panggil model -> kirim response.
 */
const TagihanSppModel = require("../models/tagihanSppModel");
const AppError = require("../utils/AppError");
const { asyncHandler, sendSuccess } = require("../utils/http");

// ======================= VALIDASI INPUT =======================

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BULAN_PATTERN = /^[A-Za-z0-9 ]+$/; // Contoh: "Juni 2026"
const ALLOWED_QUERY_KEYS = Object.freeze(["page", "limit", "status"]);

function assertValid(errors) {
    if (errors.length) throw AppError.badRequest("Validasi gagal", errors);
}

function parsePositiveInt(value, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) return NaN;
    return Number.parseInt(value, 10);
}

function validateId(params) {
    assertValid(UUID_PATTERN.test(params.id || "") ? [] : ["ID tagihan tidak valid"]);
    return params.id;
}

function validateBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw AppError.badRequest("Validasi gagal", ["Body harus berupa objek JSON"]);
    }

    const errors = [];
    if (Object.keys(body).some((key) => !TagihanSppModel.WRITABLE_FIELDS.includes(key))) {
        errors.push("Terdapat field yang tidak diizinkan"); // Cegah mass assignment
    }

    if (!UUID_PATTERN.test(body.siswa_id || "")) {
        errors.push("siswa_id wajib diisi dan harus berformat UUID yang valid");
    }

    let nominal = body.nominal;
    if (nominal === undefined || typeof nominal !== "number" || nominal <= 0) {
        errors.push("nominal wajib diisi dan harus berupa angka positif");
    }

    const statusList = ["BELUM_BAYAR", "LUNAS"];
    if (!statusList.includes(body.status)) {
        errors.push(`status wajib diisi salah satu dari: ${statusList.join(", ")}`);
    }

    let bulan = "";
    if (typeof body.bulan !== "string" || body.bulan.trim() === "") {
        errors.push("bulan wajib diisi");
    } else {
        bulan = body.bulan.trim();
        if (!BULAN_PATTERN.test(bulan)) {
            errors.push("Format bulan tidak valid");
        }
    }

    const tahun = parsePositiveInt(String(body.tahun), NaN);
    if (!Number.isInteger(tahun) || tahun < 2000 || tahun > 2100) {
        errors.push("tahun wajib diisi dengan format angka tahun yang valid (misal: 2026)");
    }

    assertValid(errors);
    return {
        siswa_id: body.siswa_id,
        nominal,
        status: body.status,
        bulan,
        tahun,
        tanggal_jatuh_tempo: body.tanggal_jatuh_tempo || null,
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

    let status;
    if (query.status !== undefined) {
        status = query.status.trim().toUpperCase();
        if (!["BELUM_BAYAR", "LUNAS"].includes(status)) errors.push("Filter status tidak valid");
    }

    assertValid(errors);
    return { page, limit, status };
}

// ======================= HANDLER =======================

const TagihanSppController = {
    getAll: asyncHandler(async (req, res) => {
        const { items, meta } = await TagihanSppModel.getPaginated(validateListQuery(req.query));
        return sendSuccess(res, 200, { data: items, meta });
    }),

    getById: asyncHandler(async (req, res) => {
        const data = await TagihanSppModel.getById(validateId(req.params));
        return sendSuccess(res, 200, { data });
    }),

    getMyTagihan: asyncHandler(async (req, res) => {
        // Mengambil siswa_id dari payload token JWT yang sedang login (req.user)
        const siswaId = req.user.siswa_id || req.user.id;
        const data = await TagihanSppModel.getBySiswaId(siswaId);
        return sendSuccess(res, 200, { data });
    }),

    create: asyncHandler(async (req, res) => {
        const data = await TagihanSppModel.create(validateBody(req.body));
        return sendSuccess(res, 201, { message: "Tagihan SPP berhasil ditambahkan", data });
    }),

    update: asyncHandler(async (req, res) => {
        const id = validateId(req.params);
        const data = await TagihanSppModel.update(id, validateBody(req.body));
        return sendSuccess(res, 200, { message: "Tagihan SPP berhasil diperbarui", data });
    }),

    remove: asyncHandler(async (req, res) => {
        await TagihanSppModel.remove(validateId(req.params));
        return sendSuccess(res, 200, { message: "Tagihan SPP berhasil dihapus" });
    }),
};

module.exports = TagihanSppController;