"use strict";

const crypto = require("crypto");
const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");

class UserModel {
  async createUserProfile({ role, tokenAkses, nama, noTelp, extraField }) {
    // Generate UUID v4 secara otomatis di backend
    const userId = crypto.randomUUID();

    // 1. Simpan ke tabel profiles utama dengan menyertakan id UUID
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: userId, role, token_akses: tokenAkses }]);

    if (profileError) {
      throw AppError.internal(`Gagal simpan profile: ${profileError.message}`);
    }

    // 2. Simpan ke tabel spesifik berdasarkan role (siswa / tentor)
    if (role === "siswa") {
      const { error: siswaError } = await supabase
        .from("siswa_profile")
        .insert([{ id: userId, nama, no_telp: noTelp, nama_wali: extraField }]);

      if (siswaError) {
        throw AppError.internal(`Gagal simpan siswa_profile: ${siswaError.message}`);
      }
    } else if (role === "tentor") {
      const { error: tentorError } = await supabase
        .from("tentor_profile")
        .insert([{ id: userId, nama, no_telp: noTelp, alamat: extraField }]);

      if (tentorError) {
        throw AppError.internal(`Gagal simpan tentor_profile: ${tentorError.message}`);
      }
    }

    return { id: userId };
  }
}

module.exports = new UserModel();