"use strict";

const userModel = require("../models/userModel");
const tokenService = require("../models/tokenService");
const AppError = require("../utils/AppError");
const { asyncHandler, sendSuccess } = require("../utils/http");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PAKET_LIST = Object.freeze(["Bulanan", "Tahunan"]);

function isValidDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function assertValid(errors) {
  if (errors.length) throw AppError.badRequest("Validasi gagal", errors);
}

const createAccount = asyncHandler(async (req, res) => {
  const {
    role,
    nama,
    noTelp,
    extraField,
    kelasId,
    tanggalMulaiBelajar,
    paket,
  } = req.body ?? {};

  if (!role || !nama || !noTelp) {
    throw AppError.badRequest("Field role, nama, dan noTelp wajib diisi!");
  }

  if (!["siswa", "tentor"].includes(role)) {
    throw AppError.badRequest("Role harus berupa 'siswa' atau 'tentor'");
  }

  if (role === "siswa" && !UUID_PATTERN.test(kelasId || "")) {
    throw AppError.badRequest("kelasId wajib diisi dengan ID kelas yang valid untuk siswa.");
  }

  if (role === "tentor" && kelasId !== undefined) {
    throw AppError.badRequest("Tentor tidak dapat ditambahkan ke kelas melalui endpoint ini.");
  }

  let tagihanSpp;
  if (role === "siswa") {
    const errors = [];
    if (typeof extraField !== "string" || extraField.trim() === "") {
      errors.push("Nama orang tua/wali wajib diisi untuk siswa.");
    }
    if (!isValidDate(tanggalMulaiBelajar || "")) {
      errors.push("tanggalMulaiBelajar wajib berupa tanggal valid berformat YYYY-MM-DD.");
    }
    if (!PAKET_LIST.includes(paket)) {
      errors.push(`paket wajib salah satu dari: ${PAKET_LIST.join(", ")}.`);
    }

    assertValid(errors);
    tagihanSpp = { tanggalMulaiBelajar, paket };
  }

  const rawToken = tokenService.generateRandomToken();
  const hashedToken = tokenService.encrypt(rawToken);
  const newProfile = await userModel.createUserProfile({
    role,
    tokenAkses: hashedToken,
    nama,
    noTelp,
    extraField,
    kelasId,
    tagihanSpp
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