"use strict";

const AppError = require("../utils/AppError");
const supabase = require("../config/supabaseClient");

/**
 * Middleware untuk memverifikasi token akses pengguna
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw AppError.unauthorized("Token akses tidak disertakan atau format salah");
    }

    const token = authHeader.split(" ")[1];

    // Lakukan verifikasi token terhadap tabel profiles di Supabase (atau logika token Anda)
    // Contoh validasi token:
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, role, token_akses")
      .eq("token_akses", token) // sesuaikan dengan metode hash jika token di-hash
      .maybeSingle();

    if (error || !profile) {
      throw AppError.unauthorized("Token akses tidak valid atau sudah kedaluwarsa");
    }

    // Lampirkan data user ke objek req
    req.user = {
      id: profile.id,
      role: profile.role,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware untuk memvalidasi peran pengguna (authorizeRole)
 * @(...allowedRoles) -> menerima daftar role yang diizinkan, misal: 'tentor', 'siswa'
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden("Anda tidak memiliki hak akses untuk melakukan aksi ini"));
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};