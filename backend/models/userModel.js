"use strict";

const crypto = require("crypto");
const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");

class UserModel {
  async createUserProfile({ role, tokenAkses, nama, noTelp, extraField }) {
    const userId = crypto.randomUUID();

    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: userId, role, token_akses: tokenAkses }]);

    if (profileError) {
      throw AppError.internal(`Gagal simpan profile: ${profileError.message}`);
    }

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
  async updateProfileToken(userId, hashedToken) {
    const { error } = await dbClient
      .from("profiles")
      .update({ token_akses: hashedToken, updated_at: new Date() })
      .eq("id", userId);

    if (error) {
      throw AppError.internal(`Gagal memperbarui token: ${error.message}`);
    }
    return true;
  }

  async updateUserProfile(userId, { role, nama, noTelp, extraField }) {
    if (role) {
      await dbClient.from("profiles").update({ role }).eq("id", userId);
    }

    const { data: profileData } = await dbClient
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    const userRole = role || profileData?.role;

    if (userRole === "siswa") {
      const updateData = {};
      if (nama) updateData.nama = nama;
      if (noTelp) updateData.no_telp = noTelp;
      if (extraField) updateData.nama_wali = extraField;

      const { error } = await dbClient
        .from("siswa_profile")
        .update(updateData)
        .eq("id", userId);

      if (error) throw AppError.internal(`Gagal update siswa: ${error.message}`);
    } else if (userRole === "tentor") {
      const updateData = {};
      if (nama) updateData.nama = nama;
      if (noTelp) updateData.no_telp = noTelp;
      if (extraField) updateData.alamat = extraField;

      const { error } = await dbClient
        .from("tentor_profile")
        .update(updateData)
        .eq("id", userId);

      if (error) throw AppError.internal(`Gagal update tentor: ${error.message}`);
    }

    return { id: userId, message: "Profil berhasil diperbarui" };
  }

  async findAllUsers(roleFilter) {
    let query = dbClient.from("profiles").select("id, role, token_akses, created_at");

    if (roleFilter) {
      query = query.eq("role", roleFilter);
    }

    const { data: profiles, error } = await query;

    if (error) {
      throw AppError.internal(`Gagal mengambil data pengguna: ${error.message}`);
    }

    return profiles;
  }

  async deleteUserProfile(userId) {
    const { data: profile, error: fetchError } = await dbClient
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      throw AppError.notFound("Pengguna tidak ditemukan.");
    }

    if (profile.role === "siswa") {
      const { error: siswaError } = await dbClient
        .from("siswa_profile")
        .delete()
        .eq("id", userId);

      if (siswaError) {
        throw AppError.internal(`Gagal menghapus siswa_profile: ${siswaError.message}`);
      }
    } else if (profile.role === "tentor") {
      const { error: tentorError } = await dbClient
        .from("tentor_profile")
        .delete()
        .eq("id", userId);

      if (tentorError) {
        throw AppError.internal(`Gagal menghapus tentor_profile: ${tentorError.message}`);
      }
    }
    const { error: profileError } = await dbClient
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      throw AppError.internal(`Gagal menghapus profile utama: ${profileError.message}`);
    }

    return true;
  }
}

module.exports = new UserModel();