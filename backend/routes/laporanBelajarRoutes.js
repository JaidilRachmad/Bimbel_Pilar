"use strict";
/**
 * ROUTES — Laporan Progres Belajar
 * Mengatur hak akses endpoint: 
 * - Admin: Akses penuh (CRUD & Generate)
 * - Siswa: Melihat dan mengunduh laporan progres miliknya sendiri
 * - Guru/Tentor: Tidak memiliki hak akses
 */
const express = require("express");
const config = require("../config/env");
const LaporanProgresController = require("../controllers/laporanProgresController");
const { authenticateToken } = require("../middlewares/auth");
const { authorize } = require("../middlewares/permissionMiddlewares");

const router = express.Router();

// Wajib autentikasi untuk semua endpoint di bawah ini
router.use(authenticateToken);

/**
 * @swagger
 * /laporan-progres/me:
 *   get:
 *     summary: Siswa melihat daftar laporan progres belajar miliknya sendiri
 *     tags: [Laporan Progres]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/me", authorize(config.roles.siswa), LaporanProgresController.getMyLaporan);

/**
 * @swagger
 * /laporan-progres/{id}/download:
 *   get:
 *     summary: Siswa atau Admin mengunduh dokumen laporan progres
 *     tags: [Laporan Progres]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/:id/download", authorize(config.roles.admin, config.roles.siswa), LaporanProgresController.downloadLaporan);

/**
 * @swagger
 * /laporan-progres:
 *   get:
 *     summary: Daftar seluruh laporan progres (Akses Admin)
 *     tags: [Laporan Progres]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Tambah atau generate laporan progres baru (Akses Admin)
 *     tags: [Laporan Progres]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/", authorize(config.roles.admin), LaporanProgresController.getAll);
router.post("/", authorize(config.roles.admin), LaporanProgresController.create);

router.get("/:id", authorize(config.roles.admin), LaporanProgresController.getById);
router.put("/:id", authorize(config.roles.admin), LaporanProgresController.update);
router.delete("/:id", authorize(config.roles.admin), LaporanProgresController.remove);

module.exports = router;