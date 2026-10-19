"use strict";
/**
 * ROUTES — Penilaian Siswa
 * Mengatur hak akses endpoint: Siswa (milik sendiri), tentor & Admin (CRUD dan Analisis Laporan).
 */
require("dotenv").config();
const express = require("express");
const router = express.Router();
const NilaiController = require("../controllers/nilaiController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const ADMIN_ROLE =  "admin";
const SISWA_ROLE = "siswa";
const TENTOR_ROLE = "tentor"

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
router.get("/me", authorizeRoles(SISWA_ROLE), NilaiController.getMyNilai);

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
// Tentor dan Admin dapat membaca data nilai, sedangkan input hanya oleh Tentor
router.get("/", authorizeRoles(TENTOR_ROLE, ADMIN_ROLE), NilaiController.getAll);
router.post("/", authorizeRoles(TENTOR_ROLE), NilaiController.create);

router.get("/:id", authorizeRoles(TENTOR_ROLE, ADMIN_ROLE), NilaiController.getById);
router.put("/:id", authorizeRoles(TENTOR_ROLE), NilaiController.update);
router.delete("/:id", authorizeRoles(TENTOR_ROLE), NilaiController.remove);

module.exports = router;