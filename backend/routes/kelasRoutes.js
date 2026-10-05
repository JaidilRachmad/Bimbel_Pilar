"use strict";
const express = require("express");
const config = require("../config/env");
const KelasController = require("../controllers/kelasController");
const { authenticateToken } = require("../middlewares/auth");
const { authorize } = require("../middlewares/permissionMiddlewares");

const router = express.Router();

router.use(authenticateToken, authorize(config.roles.admin));

/**
 * @swagger
 * tags:
 *   - name: Kelas
 *     description: CRUD kelas (khusus Admin)
 * components:
 *   schemas:
 *     KelasInput:
 *       type: object
 *       required: [nama_kelas, jenjang]
 *       additionalProperties: false
 *       properties:
 *         nama_kelas: { type: string, maxLength: 50, example: "Kelas 9A" }
 *         jenjang: { type: string, example: "SMP" }
 */

/**
 * @swagger
 * /kelas:
 *   get:
 *     summary: Daftar kelas (dengan pagination)
 *     tags: [Kelas]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: jenjang, schema: { type: string } }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Query tidak valid }
 *       401: { description: Belum login }
 *       403: { description: Bukan admin }
 *   post:
 *     summary: Tambah kelas
 *     tags: [Kelas]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/KelasInput' } } }
 *     responses:
 *       201: { description: Dibuat }
 *       400: { description: Validasi gagal }
 *       409: { description: Duplikat }
 */
router.get("/", KelasController.getAll);
router.post("/", KelasController.create);

/**
 * @swagger
 * /kelas/{id}:
 *   parameters:
 *     - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *   get:
 *     summary: Detail kelas
 *     tags: [Kelas]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Tidak ditemukan }
 *   put:
 *     summary: Perbarui kelas
 *     tags: [Kelas]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/KelasInput' } } }
 *     responses:
 *       200: { description: Diperbarui }
 *       404: { description: Tidak ditemukan }
 *       409: { description: Duplikat }
 *   delete:
 *     summary: Hapus kelas (ditolak jika masih ada siswa)
 *     tags: [Kelas]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dihapus }
 *       404: { description: Tidak ditemukan }
 *       409: { description: Masih dipakai }
 */
router.get("/:id", KelasController.getById);
router.put("/:id", KelasController.update);
router.delete("/:id", KelasController.remove);

module.exports = router;