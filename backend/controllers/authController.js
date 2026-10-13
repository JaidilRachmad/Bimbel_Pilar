
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");
const authModel = require("../models/authModel");

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

const failedAdminLogins = new Map();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET harus dikonfigurasi dengan secret yang kuat."
    );
  }

  return secret;
}

function createAccessJwt(profile) {
  return jwt.sign(
    {
      role: profile.role,
    },
    getJwtSecret(),
    {
      algorithm: "HS256",
      subject: profile.id,
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      issuer: "bimbel-pilar-api",
      audience: "bimbel-pilar-client",
    }
  );
}

function getAdminLoginKey(req, email) {
  return `${email.toLowerCase()}|${req.ip}`;
}

/**
 * POST /api/auth/admin/login
 */
async function adminLogin(req, res) {
  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi.",
      });
    }

    const loginKey = getAdminLoginKey(req, email);
    const now = Date.now();
    const current = failedAdminLogins.get(loginKey);

    if (current && current.lockedUntil > now) {
      const retryAfter = Math.ceil(
        (current.lockedUntil - now) / 1000
      );

      res.set("Retry-After", String(retryAfter));

      return res.status(429).json({
        success: false,
        message:
          "Terlalu banyak percobaan login. Coba lagi dalam 5 menit.",
        retryAfter,
      });
    }

    // Jika periode penguncian sudah selesai, mulai hitungan baru.
    if (current && current.lockedUntil <= now) {
      failedAdminLogins.delete(loginKey);
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error || !data.user) {
      const previous = failedAdminLogins.get(loginKey);
      const attempts = (previous?.attempts || 0) + 1;

      const lockedUntil =
        attempts >= MAX_FAILED_ATTEMPTS
          ? Date.now() + LOCKOUT_DURATION_MS
          : 0;

      failedAdminLogins.set(loginKey, {
        attempts,
        lockedUntil,
      });

      if (lockedUntil) {
        res.set("Retry-After", "300");

        return res.status(429).json({
          success: false,
          message:
            "Tiga kali gagal login. Akun login ini dikunci sementara selama 5 menit.",
          retryAfter: 300,
        });
      }

      return res.status(401).json({
        success: false,
        message: "Email atau password tidak valid.",
        remainingAttempts: MAX_FAILED_ATTEMPTS - attempts,
      });
    }

    const profile = await authModel.findProfileById(data.user.id);

    // Hanya pengguna dengan role admin yang boleh masuk.
    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();

      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Akun ini bukan admin.",
      });
    }

    // Login berhasil, hapus hitungan kegagalan.
    failedAdminLogins.delete(loginKey);

    const token = createAccessJwt(profile);

    return res.status(200).json({
      success: true,
      message: "Login admin berhasil.",
      token,
      user: {
        id: profile.id,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
}

/**
 * POST /api/auth/token
 */
async function tokenLogin(req, res) {
  try {
    const accessToken =
      typeof req.body?.token_akses === "string"
        ? req.body.token_akses.trim()
        : "";

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Token akses wajib diisi.",
      });
    }

    const profile =
      await authModel.findProfileByAccessToken(accessToken);

    if (!profile) {
      return res.status(401).json({
        success: false,
        message: "Token akses tidak valid.",
      });
    }

    const token = createAccessJwt(profile);

    return res.status(200).json({
      success: true,
      message: "Login berhasil.",
      token,
      user: {
        id: profile.id,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error("Token login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
}

/**
 * GET /api/auth/me
 * Mengambil informasi pengguna yang sedang login.
 */
async function getMe(req, res) {
  try {
    const profile = await authModel.findProfileById(
      req.user.id
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profil pengguna tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: profile.id,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil profil pengguna.",
    });
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  return res.status(200).json({
    success: true,
    message:
      "Logout berhasil. Hapus JWT dari penyimpanan frontend.",
  });
}

module.exports = {
  adminLogin,
  tokenLogin,
  getMe,
  logout,
};