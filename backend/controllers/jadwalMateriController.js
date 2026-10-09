"use strict";
/**
 * CONTROLLER (MVC) — Jadwal & Materi Belajar
 * Tugas: baca request -> validasi format input -> panggil model -> kirim response.
 */
const config = require("../config/env");
const JadwalMateriModel = require("../models/jadwalMateriModel");
const AppError = require("../utils/AppError");
const { asyncHandler, sendSuccess } = require("../utils/http");
const supabase = require("../config/supabaseClient");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_QUERY_KEYS = Object.freeze(["page", "limit", "kelas_id", "guru_id"]);

function assertValid(errors) {
    if (errors.length) throw AppError.badRequest("Validasi gagal", errors);
}

function parsePositiveInt(value, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) return NaN;
    return Number.parseInt(value, 10);
}

function validateId(params) {
    assertValid(UUID_PATTERN.test(params.id || "") ? [] : ["ID jadwal materi tidak valid"]);
    return params.id;
}

function validateBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw AppError.badRequest("Validasi gagal", ["Body harus berupa objek JSON"]);
    }

    const errors = [];
    if (Object.keys(body).some((key) => !JadwalMateriModel.WRITABLE_FIELDS.includes(key))) {
        errors.push("Terdapat field yang tidak diizinkan"); // Cegah mass assignment
    }

    if (!UUID_PATTERN.test(body.kelas_id || "")) {
        errors.push("kelas_id wajib diisi dan harus berformat UUID yang valid");
    }

    if (!UUID_PATTERN.test(body.guru_id || "")) {
        errors.push("guru_id wajib diisi dan harus berformat UUID yang valid");
    }

    if (typeof body.mata_pelajaran !== "string" || body.mata_pelajaran.trim() === "") {
        errors.push("mata_pelajaran wajib diisi");
    }

    if (body.tanggal && !/^\d{4}-\d{2}-\d{2}$/.test(body.tanggal)) {
        errors.push("Format tanggal harus YYYY-MM-DD");
    }

    assertValid(errors);
    return {
        kelas_id: body.kelas_id,
        guru_id: body.guru_id,
        mata_pelajaran: body.mata_pelajaran.trim(),
        materi: body.materi ? body.materi.trim() : null,
        tanggal: body.tanggal || null,
        jam_mulai: body.jam_mulai || null,
        jam_selesai: body.jam_selesai || null,
        link_materi: body.link_materi ? body.link_materi.trim() : null,
    };
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

    let kelas_id;
    if (query.kelas_id !== undefined) {
        if (!UUID_PATTERN.test(query.kelas_id)) errors.push("Filter kelas_id tidak valid");
        kelas_id = query.kelas_id;
    }

    let guru_id;
    if (query.guru_id !== undefined) {
        if (!UUID_PATTERN.test(query.guru_id)) errors.push("Filter guru_id tidak valid");
        guru_id = query.guru_id;
    }

    assertValid(errors);
    return { page, limit, kelas_id, guru_id };
}

const JadwalMateriController = {
    getAll: asyncHandler(async (req, res) => {
        const { items, meta } = await JadwalMateriModel.getPaginated(validateListQuery(req.query));
        return sendSuccess(res, 200, { data: items, meta });
    }),

    getMyJadwalSiswa: asyncHandler(async (req, res) => {
        const siswaId = req.user.siswa_id || req.user.id;
        const page = parsePositiveInt(req.query.page, 1);
        const limit = parsePositiveInt(req.query.limit, config.pagination.defaultLimit);
        
        const { items, meta } = await JadwalMateriModel.getPaginatedForSiswa(siswaId, { page, limit });
        return sendSuccess(res, 200, { data: items, meta });
    }),

    getById: asyncHandler(async (req, res) => {
        const data = await JadwalMateriModel.getById(validateId(req.params));
        return sendSuccess(res, 200, { data });
    }),

    downloadMateri: asyncHandler(async (req, res) => {
        const id = validateId(req.params);
        const data = await JadwalMateriModel.getById(id);

        // Validasi hak akses siswa berdasarkan kelas yang terdaftar di tabel kelas_siswa[cite: 1, 8, 20]
        if (req.user.role === "siswa") {
            const siswaId = req.user.siswa_id || req.user.id;
            const { data: checkKelas } = await supabase
                .from("kelas_siswa")
                .select("id")
                .eq("kelas_id", data.kelas_id)
                .eq("siswa_id", siswaId)
                .maybeSingle();

            if (!checkKelas) {
                throw AppError.forbidden("Anda tidak memiliki hak akses untuk mengunduh materi dari kelas ini");
            }
        }

        return sendSuccess(res, 200, { message: "Materi siap diunduh", link_materi: data.link_materi, data });
    }),

    create: asyncHandler(async (req, res) => {
        const data = await JadwalMateriModel.create(validateBody(req.body));
        return sendSuccess(res, 201, { message: "Jadwal dan materi belajar berhasil ditambahkan", data });
    }),

    update: asyncHandler(async (req, res) => {
        const id = validateId(req.params);
        const data = await JadwalMateriModel.update(id, validateBody(req.body));
        return sendSuccess(res, 200, { message: "Jadwal dan materi belajar berhasil diperbarui", data });
    }),

    remove: asyncHandler(async (req, res) => {
        await JadwalMateriModel.remove(validateId(req.params));
        return sendSuccess(res, 200, { message: "Jadwal dan materi belajar berhasil dihapus" });
    }),
};

module.exports = JadwalMateriController;