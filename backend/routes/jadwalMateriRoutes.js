"use strict";
/**
 * ROUTES — Jadwal & Materi Belajar
 * Mengatur hak akses endpoint:
 * - tentor: Akses CRUD penuh (Tambah, Lihat, Update, Hapus Jadwal & Materi)[cite: 48]
 * - Siswa: Melihat daftar sesi/materi miliknya dan mengunduh materi[cite: 48]
 */
const express = require("express");
const JadwalMateriController = require("../controllers/jadwalMateriController");
const { authenticateToken, authorizeRole} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /jadwal-materi/me:
 *   get:
 *     summary: Siswa melihat daftar sesi & materi belajar berdasarkan kelas yang diikutinya
 *     tags: [Jadwal & Materi]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/me", authorizeRole("siswa"), JadwalMateriController.getMyJadwalSiswa);

/**
 * @swagger
 * /jadwal-materi/{id}/download:
 *   get:
 *     summary: Siswa atau tentor mengunduh materi belajar dari sesi tertentu
 *     tags: [Jadwal & Materi]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/:id/download", authorizeRole("tentor", "siswa"), JadwalMateriController.downloadMateri);

/**
 * @swagger
 * /jadwal-materi:
 *   get:
 *     summary: Daftar seluruh sesi pembelajaran / jadwal materi (Akses tentor & Admin)
 *     tags: [Jadwal & Materi]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: tentor membuat jadwal sesi dan upload materi belajar baru
 *     tags: [Jadwal & Materi]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/", authorizeRole("tentor"), JadwalMateriController.getAll);
router.post("/", authorizeRole("tentor"), JadwalMateriController.create);

router.get("/:id", authorizeRole("tentor"), JadwalMateriController.getById);
router.put("/:id", authorizeRole("tentor"), JadwalMateriController.update);
router.delete("/:id", authorizeRole("tentor"), JadwalMateriController.remove);

module.exports = router;