"use strict";
/**
 * ROUTES — Penilaian Siswa (Nilai)
 * Mengatur hak akses endpoint: Siswa (milik sendiri), tentor & Admin.
 */
require("dotenv").config();
const express = require("express");

// Import menggunakan nama file yang benar
const NilaiController = require("../controllers/nilaiController"); 
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const checkSpp = require('../middleware/checkSpp');

const router = express.Router();

// Wajib login untuk semua endpoint
router.use(authenticateToken);

// Endpoint khusus Siswa (Diproteksi dengan checkSpp)
router.get(
  "/me", 
  authorizeRoles("siswa"), 
  checkSpp, 
  NilaiController.getMyNilai
);

// Tentor dan Admin dapat membaca data nilai, input hanya oleh Tentor
router.get("/", authorizeRoles("tentor", "admin"), NilaiController.getAll);
router.post("/", authorizeRoles("tentor"), NilaiController.create);

router.get("/:id", authorizeRoles("tentor", "admin"), NilaiController.getById);
router.put("/:id", authorizeRoles("tentor"), NilaiController.update);
router.delete("/:id", authorizeRoles("tentor"), NilaiController.remove);

module.exports = router;