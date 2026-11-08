"use strict";

require("dotenv").config();
const express = require("express");
const router = express.Router();
const KelasTentorController = require("../controllers/kelasTentorController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /kelas-tentor/my:
 *   get:
 *     summary: Daftar kelas yang diampu tentor yang sedang login (khusus Tentor)
 *     tags: [Kelas-Tentor]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       401: { description: Belum login }
 *       403: { description: Bukan tentor }
 */
// Harus didefinisikan sebelum router.use(admin) di bawah.
router.get("/my", authenticateToken, authorizeRoles("tentor"), KelasTentorController.getMine);

router.use(authenticateToken, authorizeRoles("admin"));

/**
 * @swagger
 * tags:
 *   - name: Kelas-Tentor
 *     description: Pengaturan penugasan tentor ke satu atau beberapa kelas (khusus Admin)
 * components:
 *   schemas:
 *     KelasTentorInput:
 *       type: object
 *       required: [kelas_id, tentor_id]
 *       additionalProperties: false
 *       properties:
 *         kelas_id: { type: string, format: uuid }
 *         tentor_id: { type: string, format: uuid }
 */

/**
 * @swagger
 * /kelas-tentor:
 *   get:
 *     summary: Daftar penugasan kelas dan tentor dengan pagination
 *     tags: [Kelas-Tentor]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100, default: 10 } }
 *       - { in: query, name: kelas_id, schema: { type: string, format: uuid } }
 *       - { in: query, name: tentor_id, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Query tidak valid }
 *       401: { description: Belum login }
 *       403: { description: Bukan admin }
 *   post:
 *     summary: Menugaskan tentor ke kelas
 *     tags: [Kelas-Tentor]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/KelasTentorInput' } } }
 *     responses:
 *       201: { description: Penugasan dibuat }
 *       400: { description: Validasi gagal }
 *       404: { description: Kelas atau tentor tidak ditemukan }
 *       409: { description: Penugasan duplikat }
 */
router.get("/", KelasTentorController.getAll);
router.post("/", KelasTentorController.create);

/**
 * @swagger
 * /kelas-tentor/{id}:
 *   parameters:
 *     - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *   get:
 *     summary: Detail penugasan kelas dan tentor
 *     tags: [Kelas-Tentor]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Penugasan tidak ditemukan }
 *   put:
 *     summary: Memperbarui penugasan tentor
 *     tags: [Kelas-Tentor]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/KelasTentorInput' } } }
 *     responses:
 *       200: { description: Diperbarui }
 *       404: { description: Kelas, tentor, atau penugasan tidak ditemukan }
 *       409: { description: Penugasan duplikat }
 *   delete:
 *     summary: Mengeluarkan tentor dari kelas
 *     tags: [Kelas-Tentor]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dihapus }
 *       404: { description: Penugasan tidak ditemukan }
 */
router.get("/:id", KelasTentorController.getById);
router.put("/:id", KelasTentorController.update);
router.delete("/:id", KelasTentorController.remove);

module.exports = router;
