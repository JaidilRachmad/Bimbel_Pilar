"use strict";
/**
 * ROUTES — Laporan Progres Belajar
 * Mengatur hak akses endpoint: 
 * - Admin: Akses penuh (CRUD & Generate)
 * - Siswa: Melihat dan mengunduh laporan progres miliknya sendiri
 * - Guru/Tentor: Tidak memiliki hak akses
 */
const express = require("express");
const LaporanProgresController = require("../controllers/laporanProgresController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Wajib autentikasi untuk semua endpoint di bawah ini
router.use(authenticateToken);

/**
 * @swagger
 * /laporan/me:
 *   get:
 *     summary: Siswa melihat daftar laporan progres belajar miliknya sendiri
 *     tags: [Laporan Progres]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/me", authorizeRoles("siswa"), LaporanProgresController.getMyLaporan);

/**
 * @swagger
 * /laporan/generate/{siswaId}:
 *   post:
 *     summary: Generate laporan berdasarkan nilai dan catatan tentor milik siswa (Akses Admin)
 *     tags: [Laporan Progres]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: siswaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               periode:
 *                 type: string
 *                 example: "April 2026"
 *     responses:
 *       200: { description: Laporan berhasil digenerate }
 *       400: { description: siswaId tidak valid }
 *       401: { description: Belum login }
 *       403: { description: Hanya admin yang dapat men-generate laporan }
 *       404: { description: Data siswa tidak ditemukan }
 *       500: { description: Error server atau layanan AI }
 */
router.post("/generate/:siswaId", authorizeRoles("admin"), LaporanProgresController.generateReport);

/**
 * @swagger
 * /laporan/{id}/download:
 *   get:
 *     summary: Siswa atau Admin mengunduh dokumen laporan progres
 *     tags: [Laporan Progres]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/:id/download", authorizeRoles("admin", "siswa"), LaporanProgresController.downloadLaporan);

router.get("/status", authorizeRoles("admin"), LaporanProgresController.getReportStatuses);

/**
 * @swagger
 * /laporan:
 *   get:
 *     summary: Daftar laporan progres dengan filter siswa atau periode (Akses Admin)
 *     tags: [Laporan Progres]
 *     security: [{ bearerAuth: [] }]
 * /laporan/simpan:
 *   post:
 *     summary: Simpan atau perbarui laporan untuk siswa dan periode yang sama (Akses Admin)
 *     tags: [Laporan Progres]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Laporan berhasil disimpan atau diperbarui }
 *       400: { description: Validasi gagal atau data terkait tidak valid }
 *       409: { description: Konflik data laporan }
 */
router.get("/", authorizeRoles("admin"), LaporanProgresController.getAll);
router.post("/tambah", authorizeRoles("admin"), LaporanProgresController.create);

router.get("/:id", authorizeRoles("admin"), LaporanProgresController.getById);
router.put("/:id", authorizeRoles("admin"), LaporanProgresController.update);
router.delete("/:id", authorizeRoles("admin"), LaporanProgresController.remove);

module.exports = router;
