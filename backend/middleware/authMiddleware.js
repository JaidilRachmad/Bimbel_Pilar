
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET harus dikonfigurasi dengan secret yang kuat."
    );
  }

  return secret;
}

async function authenticateToken(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token autentikasi tidak ditemukan.",
      });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token autentikasi tidak ditemukan.",
      });
    }

    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
      issuer: "bimbel-pilar-api",
      audience: "bimbel-pilar-client",
    });

    if (!decoded.sub) {
      return res.status(401).json({
        success: false,
        message: "Token autentikasi tidak valid.",
      });
    }

    // Ambil role terkini dari database, bukan hanya dari JWT.
    const profile = await authModel.findProfileById(
      decoded.sub
    );

    if (!profile) {
      return res.status(401).json({
        success: false,
        message: "Profil pengguna tidak ditemukan.",
      });
    }

    req.user = {
      id: profile.id,
      role: profile.role,
    };

    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Token autentikasi tidak valid atau kedaluwarsa.",
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Pengguna belum terautentikasi.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Kamu tidak memiliki izin untuk mengakses fitur ini.",
      });
    }

    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};