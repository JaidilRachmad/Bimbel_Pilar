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

const updateAccessToken = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw AppError.badRequest("ID pengguna wajib disertakan!");
  }

  const rawToken = tokenService.generateRandomToken();
  const hashedToken = tokenService.encrypt(rawToken);

  await userModel.updateProfileToken(id, hashedToken);

  return sendSuccess(res, "Token akses berhasil diperbarui!", {
    id,
    token_akses_baru_asli: rawToken
  }, 200);
});

const updateUserData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nama, noTelp, extraField, role } = req.body;

  if (!id) {
    throw AppError.badRequest("ID pengguna wajib disertakan!");
  }

  if (role && !["siswa", "tentor", "admin"].includes(role)) {
    throw AppError.badRequest("Role tidak valid!");
  }

  const updatedProfile = await userModel.updateUserProfile(id, {
    role,
    nama,
    noTelp,
    extraField
  });

  return sendSuccess(res, "Data profil pengguna berhasil diperbarui!", updatedProfile, 200);
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query; 

  const users = await userModel.findAllUsers(role);

  return sendSuccess(res, "Berhasil mengambil data seluruh pengguna.", {
    total: users.length,
    users
  }, 200);
});

const deleteUserAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw AppError.badRequest("ID pengguna wajib disertakan!");
  }

  await userModel.deleteUserProfile(id);

  return sendSuccess(res, "Akun pengguna berhasil dihapus.", { id }, 200);
});

module.exports = {
  updateAccessToken,
  updateUserData,
  getAllUsers,
  createAccount,
  deleteUserAccount
};