"use strict";
/**
 * ROUTES — Tagihan SPP (Admin)
 * Mengatur jalur endpoint API CRUD SPP khusus Admin dengan dokumentasi Swagger.
 */
const express = require("express");
const config = require("../config/env");
const TagihanSppController = require("../controllers/tagihanSppController");
const { authenticateToken } = require("../middlewares/auth");
const { authorize } = require("../middlewares/permissionMiddlewares");

const router = express.Router();

// Seluruh route di bawah ini wajib login dan hanya dapat diakses oleh Admin
router.use(authenticateToken);

/**
 * @swagger
 * /tagihan-spp/me:
 *   get:
 *     summary: Siswa melihat tagihan dan riwayat SPP milik sendiri
 *     tags: [Tagihan SPP]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       401: { description: Belum login }
 */
// Endpoint khusus Siswa untuk melihat tagihan miliknya sendiri[cite: 46]
router.get("/me", authorize(config.roles.siswa), TagihanSppController.getMyTagihan);

router.use(authorize(config.roles.admin));
/**
 * @swagger
 * tags:
 *   - name: Tagihan SPP
 *   - description: Manajemen tagihan dan pembayaran SPP (Khusus Admin)
 * components:
 *   schemas:
 *     TagihanSppInput:
 *       type: object
 *       required: [siswa_id, nominal, status, bulan, tahun]
 *       additionalProperties: false
 *       properties:
 *         siswa_id: { type: string, format: uuid, example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" }
 *         nominal: { type: number, example: 350000 }
 *         status: { type: string, enum: [BELUM_BAYAR, LUNAS], example: "BELUM_BAYAR" }
 *         bulan: { type: string, example: "Juni" }
 *         tahun: { type: integer, example: 2026 }
 *         tanggal_jatuh_tempo: { type: string, format: date, example: "2026-06-10" }
 */

/**
 * @swagger
 * /tagihan-spp:
 *   get:
 *     summary: Daftar tagihan SPP (dengan pagination)
 *     tags: [Tagihan SPP]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100 } }
 *       - { in: query, name: status, schema: { type: string, enum: [BELUM_BAYAR, LUNAS] } }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Belum login }
 *       403: { description: Bukan admin }
 *   post:
 *     summary: Tambah tagihan SPP baru
 *     tags: [Tagihan SPP]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/TagihanSppInput' } } }
 *     responses:
 *       201: { description: Berhasil dibuat }
 *       400: { description: Validasi gagal }
 */
router.get("/", TagihanSppController.getAll);
router.post("/", TagihanSppController.create);

/**
 * @swagger
 * /tagihan-spp/{id}:
 *   parameters:
 *     - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *   get:
 *     summary: Detail tagihan SPP berdasarkan ID
 *     tags: [Tagihan SPP]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Tidak ditemukan }
 *   put:
 *     summary: Perbarui data tagihan SPP
 *     tags: [Tagihan SPP]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/TagihanSppInput' } } }
 *     responses:
 *       200: { description: Berhasil diperbarui }
 *       404: { description: Tidak ditemukan }
 *   delete:
 *     summary: Hapus tagihan SPP
 *     tags: [Tagihan SPP]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Berhasil dihapus }
 *       404: { description: Tidak ditemukan }
 */
router.get("/:id", TagihanSppController.getById);
router.put("/:id", TagihanSppController.update);
router.delete("/:id", TagihanSppController.remove);

module.exports = router;    