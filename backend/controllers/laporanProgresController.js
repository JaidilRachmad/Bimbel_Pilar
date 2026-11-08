"use strict";
/**
 * CONTROLLER (MVC) — Laporan Progres Belajar
 * Tugas: baca request -> validasi format input -> panggil model -> kirim response.
 */
const LaporanProgresModel = require("../models/laporanProgresModel");
const geminiService = require("../services/geminiService");
const AppError = require("../utils/AppError");
const { asyncHandler, sendSuccess } = require("../utils/http");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_QUERY_KEYS = Object.freeze(["page", "limit", "siswa_id", "periode"]);

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

    for (const field of ["catatan_wali_kelas", "saran_pengembangan"]) {
        if (body[field] !== undefined && body[field] !== null && typeof body[field] !== "string") {
            errors.push(`${field} harus berupa teks`);
        }
    }

    if (
        (typeof body.catatan_wali_kelas !== "string" || body.catatan_wali_kelas.trim() === "")
        && (typeof body.saran_pengembangan !== "string" || body.saran_pengembangan.trim() === "")
    ) {
        errors.push("Catatan wali kelas atau saran pengembangan wajib diisi");
    }

    if (body.nilai_id !== undefined && body.nilai_id !== null && !UUID_PATTERN.test(body.nilai_id)) {
        errors.push("nilai_id harus berformat UUID yang valid");
    }

    assertValid(errors);
    return {
        siswa_id: body.siswa_id,
        periode: body.periode.trim(),
        catatan_wali_kelas: body.catatan_wali_kelas?.trim() || null,
        saran_pengembangan: body.saran_pengembangan?.trim() || null,
        nilai_id: body.nilai_id || null,
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

    let periode;
    if (query.periode !== undefined) {
        if (typeof query.periode !== "string" || query.periode.trim() === "") {
            errors.push("Filter periode tidak valid");
        } else {
            periode = query.periode.trim();
        }
    }

    assertValid(errors);
    return { page, limit, siswa_id, periode };
}

const LaporanProgresController = {
    getAll: asyncHandler(async (req, res) => {
        const { items, meta } = await LaporanProgresModel.getPaginated(validateListQuery(req.query));
        return sendSuccess(res, "Daftar laporan progres berhasil dimuat", { data: items, meta });
    }),

    getReportStatuses: asyncHandler(async (req, res) => {
        const siswaIds = await LaporanProgresModel.getStudentIdsWithReports();
        return sendSuccess(res, "Status laporan siswa berhasil dimuat", { siswa_ids: siswaIds });
    }),

    getById: asyncHandler(async (req, res) => {
        const id = validateId(req.params);
        const data = await LaporanProgresModel.getById(id);
        return sendSuccess(res, "Detail laporan progres berhasil dimuat", data);
    }),

    getMyLaporan: asyncHandler(async (req, res) => {
        const siswaId = req.user.siswa_id || req.user.id;
        const data = await LaporanProgresModel.getBySiswaId(siswaId);
        return sendSuccess(res, "Daftar laporan progres siswa berhasil dimuat", data);
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

        return sendSuccess(res, "Laporan siap diunduh", data);
    }),

    create: asyncHandler(async (req, res) => {
        const data = await LaporanProgresModel.create(validateBody(req.body));
        return sendSuccess(res, "Laporan progres berhasil disimpan atau diperbarui", data, 200);
    }),

    update: asyncHandler(async (req, res) => {
        const id = validateId(req.params);
        const data = await LaporanProgresModel.update(id, validateBody(req.body));
        return sendSuccess(res, "Laporan progres berhasil diperbarui", data, 200);
    }),

    remove: asyncHandler(async (req, res) => {
        await LaporanProgresModel.remove(validateId(req.params));
        return sendSuccess(res, "Laporan progres berhasil dihapus", null, 200);
    }),

    // Admin: Hanya men-generate teks AI tanpa langsung menyimpan ke DB
    generateReport: asyncHandler(async (req, res) => {
        const siswaId = req.params.siswaId || req.params.id;
        if (!siswaId || !UUID_PATTERN.test(siswaId)) {
            throw AppError.badRequest("siswaId tidak valid atau harus berformat UUID.");
        }

        const requestedPeriode = typeof req.body?.periode === "string" && req.body.periode.trim() !== ""
            ? req.body.periode.trim()
            : null;

        // Ambil data siswa & nilai
        const studentData = await LaporanProgresModel.getStudentWithAcademicData(siswaId);
        if (!studentData) {
            throw AppError.notFound("Data siswa tidak ditemukan.");
        }
        if (!studentData.kelas_id) {
            throw AppError.unprocessableEntity("Laporan belum dapat digenerate.", [
                "Siswa belum terdaftar di kelas. Daftarkan siswa ke kelas terlebih dahulu.",
            ]);
        }

        const grades = studentData.grades.filter((grade) => (
            grade.nilai !== null
            && grade.nilai !== undefined
            && String(grade.nilai).trim() !== ""
            && Number.isFinite(Number(grade.nilai))
        ));
        if (grades.length === 0) {
            throw AppError.unprocessableEntity("Laporan belum dapat digenerate.", [
                "Siswa belum memiliki nilai dari tentor. Masukkan nilai terlebih dahulu.",
            ]);
        }

        const currentPeriod = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
        const periode = requestedPeriode || currentPeriod;

        // Panggil Gemini AI
        const aiResult = await geminiService.generateStudentProgressReport({
            student: studentData,
            grades,
            periode,
        });

        // Kembalikan teks hasil generate ke frontend tanpa menyimpannya dulu
        return sendSuccess(res, "Laporan berhasil digenerate oleh AI.", {
            periode,
            catatan_wali_kelas: aiResult.catatan_wali_kelas,
            saran_pengembangan: aiResult.saran_pengembangan,
            teks_laporan: aiResult.teks_lengkap,
        }, 200);
    }),
};

module.exports = LaporanProgresController;
