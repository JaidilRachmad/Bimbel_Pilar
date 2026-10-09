"use strict";
/**
 * ROUTES — Jadwal & Materi Belajar
 * Mengatur hak akses endpoint:
 * - Guru: Akses CRUD penuh (Tambah, Lihat, Update, Hapus Jadwal & Materi)[cite: 48]
 * - Siswa: Melihat daftar sesi/materi miliknya dan mengunduh materi[cite: 48]
 */
const express = require("express");
const config = require("../config/env");
const JadwalMateriController = require("../controllers/jadwalMateriController");
const { authenticateToken } = require("../middlewares/auth");
const { authorize } = require("../middlewares/permissionMiddlewares");

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
router.get("/me", authorize(config.roles.siswa), JadwalMateriController.getMyJadwalSiswa);

/**
 * @swagger
 * /jadwal-materi/{id}/download:
 *   get:
 *     summary: Siswa atau Guru mengunduh materi belajar dari sesi tertentu
 *     tags: [Jadwal & Materi]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/:id/download", authorize(config.roles.guru, config.roles.siswa), JadwalMateriController.downloadMateri);

/**
 * @swagger
 * /jadwal-materi:
 *   get:
 *     summary: Daftar seluruh sesi pembelajaran / jadwal materi (Akses Guru & Admin)
 *     tags: [Jadwal & Materi]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Guru membuat jadwal sesi dan upload materi belajar baru
 *     tags: [Jadwal & Materi]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/", authorize(config.roles.guru), JadwalMateriController.getAll);
router.post("/", authorize(config.roles.guru), JadwalMateriController.create);

router.get("/:id", authorize(config.roles.guru), JadwalMateriController.getById);
router.put("/:id", authorize(config.roles.guru), JadwalMateriController.update);
router.delete("/:id", authorize(config.roles.guru), JadwalMateriController.remove);

module.exports = router;