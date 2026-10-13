"use strict";

const userModel = require("../models/userModel");
const tokenService = require("../models/tokenService");
const AppError = require("../utils/AppError");
const { asyncHandler, sendSuccess } = require("../utils/http");

const createAccount = asyncHandler(async (req, res) => {
  const { role, nama, noTelp, extraField } = req.body;

  if (!role || !nama || !noTelp) {
    throw AppError.badRequest("Field role, nama, dan noTelp wajib diisi!");
  }

  if (!["siswa", "tentor"].includes(role)) {
    throw AppError.badRequest("Role harus berupa 'siswa' atau 'tentor'");
  }
  const rawToken = tokenService.generateRandomToken();
  const hashedToken = tokenService.encrypt(rawToken);
  const newProfile = await userModel.createUserProfile({
    role,
    tokenAkses: hashedToken,
    nama,
    noTelp,
    extraField
  });

  return sendSuccess(res, "Akun dan token akses berhasil dibuat!", {
    id: newProfile.id,
    role,
    nama,
    token_akses_asli: rawToken 
  }, 201);
});

module.exports = {
  createAccount
};