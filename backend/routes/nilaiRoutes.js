"use strict";
/**
 * ROUTES — Penilaian Siswa
 * Mengatur hak akses endpoint: Siswa (milik sendiri), tentor & Admin (CRUD dan Analisis Laporan).
 */
const express = require("express");
const config = require("../config/env");
const PenilaianSiswaController = require("../controllers/penilaianSiswaController");
const { authenticateToken } = require("../middlewares/auth");
const { authorize } = require("../middlewares/permissionMiddlewares");

const router = express.Router();

// Wajib autentikasi untuk semua endpoint
router.use(authenticateToken);

/**
 * @swagger
 * /penilaian-siswa/me:
 *   get:
 *     summary: Siswa melihat nilai dan progres belajar miliknya sendiri
 *     tags: [Penilaian Siswa]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       401: { description: Belum login }
 */
// Endpoint khusus Siswa (hanya melihat nilai miliknya sendiri)
router.get("/me", authorize(config.roles.siswa), PenilaianSiswaController.getMyNilai);

/**
 * @swagger
 * /penilaian-siswa:
 *   get:
 *     summary: Daftar penilaian siswa (Akses tentor & Admin)
 *     tags: [Penilaian Siswa]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Input nilai siswa baru (Akses tentor)
 *     tags: [Penilaian Siswa]
 *     security: [{ bearerAuth: [] }]
 */
// tentor dan Admin dapat membaca data nilai (Admin untuk generate laporan, tentor untuk input)[cite: 48]
router.get("/", authorize(config.roles.tentor, config.roles.admin), PenilaianSiswaController.getAll);
router.post("/", authorize(config.roles.tentor), PenilaianSiswaController.create);

router.get("/:id", authorize(config.roles.tentor, config.roles.admin), PenilaianSiswaController.getById);
router.put("/:id", authorize(config.roles.tentor), PenilaianSiswaController.update);
router.delete("/:id", authorize(config.roles.tentor), PenilaianSiswaController.remove);

module.exports = router;