"use strict";

const userModel = require("../models/userModel");
const tokenService = require("../models/tokenService");
const AppError = require("../utils/AppError");
const { asyncHandler, sendSuccess } = require("../utils/http");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BULAN_INDONESIA = Object.freeze([
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]);
const MIN_TAHUN_TAGIHAN = 2000;
const MAX_TAHUN_TAGIHAN = 2100;
const MAX_NOMINAL_TAGIHAN = 9999999999.99;

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
    bulanMulai,
    tahunMulai,
    bulanSelesai,
    tahunSelesai,
    nominal,
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
    if (!BULAN_INDONESIA.includes(bulanMulai)) {
      errors.push("bulanMulai harus berupa nama bulan Indonesia yang valid.");
    }
    if (!BULAN_INDONESIA.includes(bulanSelesai)) {
      errors.push("bulanSelesai harus berupa nama bulan Indonesia yang valid.");
    }
    if (!Number.isInteger(tahunMulai) || tahunMulai < MIN_TAHUN_TAGIHAN || tahunMulai > MAX_TAHUN_TAGIHAN) {
      errors.push(`tahunMulai harus berupa tahun ${MIN_TAHUN_TAGIHAN}-${MAX_TAHUN_TAGIHAN}.`);
    }
    if (!Number.isInteger(tahunSelesai) || tahunSelesai < MIN_TAHUN_TAGIHAN || tahunSelesai > MAX_TAHUN_TAGIHAN) {
      errors.push(`tahunSelesai harus berupa tahun ${MIN_TAHUN_TAGIHAN}-${MAX_TAHUN_TAGIHAN}.`);
    }
    if (
      Number.isInteger(tahunMulai)
      && Number.isInteger(tahunSelesai)
      && BULAN_INDONESIA.includes(bulanMulai)
      && BULAN_INDONESIA.includes(bulanSelesai)
      && tahunSelesai * 12 + BULAN_INDONESIA.indexOf(bulanSelesai)
        < tahunMulai * 12 + BULAN_INDONESIA.indexOf(bulanMulai)
    ) {
      errors.push("Rentang bulan dan tahun selesai tidak boleh sebelum rentang mulai.");
    }
    if (
      typeof nominal !== "number"
      || !Number.isFinite(nominal)
      || nominal <= 0
      || nominal > MAX_NOMINAL_TAGIHAN
      || String(nominal).split(".")[1]?.length > 2
    ) {
      errors.push("nominal wajib berupa angka positif maksimal 2 angka desimal.");
    }

    assertValid(errors);
    tagihanSpp = { bulanMulai, tahunMulai, bulanSelesai, tahunSelesai, nominal };
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