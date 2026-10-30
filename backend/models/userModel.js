"use strict";

const crypto = require("crypto");
const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");

class UserModel {
  async createUserProfile({ role, tokenAkses, nama, noTelp, extraField, kelasId }) {
    if (role === "siswa") {
      const { data: kelas, error: kelasError } = await supabase
        .from("kelas")
        .select("id")
        .eq("id", kelasId)
        .maybeSingle();

      if (kelasError) {
        throw AppError.internal(`Gagal memeriksa kelas siswa: ${kelasError.message}`);
      }

      if (!kelas) {
        throw AppError.notFound("Kelas yang dipilih tidak ditemukan.");
      }
    }

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

      const { error: kelasSiswaError } = await supabase
        .from("kelas_siswa")
        .insert([{ siswa_id: userId, kelas_id: kelasId }]);

      if (kelasSiswaError) {
        const { error: rollbackSiswaError } = await supabase
          .from("siswa_profile")
          .delete()
          .eq("id", userId);
        const { error: rollbackProfileError } = await supabase
          .from("profiles")
          .delete()
          .eq("id", userId);
        const rollbackErrors = [rollbackSiswaError, rollbackProfileError].filter(Boolean);
        const rollbackMessage = rollbackErrors.length
          ? ` Pembersihan akun gagal: ${rollbackErrors.map(({ message }) => message).join("; ")}`
          : "";

        throw AppError.internal(
          `Gagal menghubungkan siswa ke kelas: ${kelasSiswaError.message}.${rollbackMessage}`
        );
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
    if (!userId || typeof userId !== "string") {
    throw AppError.badRequest("Format ID pengguna tidak valid.");
    }

    const { data: updatedData, error } = await supabase
    .from("profiles")
    .update({ 
      token_akses: hashedToken, 
      updated_at: new Date() 
    })
    .eq("id", userId)
    .select();

    if (error) {
      throw AppError.internal(`Gagal memperbarui token: ${error.message}`);
    }

    if (!updatedData || updatedData.length === 0) {
    throw AppError.notFound("Gagal memperbarui token: Pengguna tidak ditemukan atau diblokir policy RLS.");
    
  }
    return true;
  }

  async updateUserProfile(userId, { role, nama, noTelp, extraField }) {
    if (role) {
      await supabase.from("profiles").update({ role }).eq("id", userId);
    }

    const { data: profileData } = await supabase
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

      const { error } = await supabase
        .from("siswa_profile")
        .update(updateData)
        .eq("id", userId);

      if (error) throw AppError.internal(`Gagal update siswa: ${error.message}`);
    } else if (userRole === "tentor") {
      const updateData = {};
      if (nama) updateData.nama = nama;
      if (noTelp) updateData.no_telp = noTelp;
      if (extraField) updateData.alamat = extraField;

      const { error } = await supabase
        .from("tentor_profile")
        .update(updateData)
        .eq("id", userId);

      if (error) throw AppError.internal(`Gagal update tentor: ${error.message}`);
    }

    return { id: userId, message: "Profil berhasil diperbarui" };
  }

  async findAllUsers(roleFilter) {
    let query = supabase.from("profiles").select(`
      id, role, token_akses, created_at,
      siswa_profile ( nama, no_telp, nama_wali,
        kelas_siswa ( kelas:kelas_id ( id, nama_kelas ) )
      ),
      tentor_profile ( nama, no_telp, alamat )
    `);

    if (roleFilter) {
      query = query.eq("role", roleFilter);
    }

    const { data: profiles, error } = await query;

    if (error) {
      throw AppError.internal(`Gagal mengambil data pengguna: ${error.message}`);
    }

    return profiles.map((p) => {
      const kelasSiswa = p.siswa_profile?.kelas_siswa?.[0]?.kelas;
      return {
        id: p.id,
        role: p.role,
        token_akses: p.token_akses,
        created_at: p.created_at,
        nama: p.siswa_profile?.nama ?? p.tentor_profile?.nama ?? null,
        no_telp: p.siswa_profile?.no_telp ?? p.tentor_profile?.no_telp ?? null,
        kelas: kelasSiswa ? { id: kelasSiswa.id, nama: kelasSiswa.nama_kelas } : null,
      };
    });
  }

  async deleteUserProfile(userId) {
    if (!userId || typeof userId !== "string") {
      throw AppError.badRequest("Format ID pengguna tidak valid.");
    }

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) {
      throw AppError.internal(`Gagal mencari pengguna: ${fetchError.message}`);
    }

    if (!profile) {
      throw AppError.notFound("Pengguna tidak ditemukan.");
    }

    if (profile.role === "siswa") {
      const { error: siswaError } = await supabase
        .from("siswa_profile")
        .delete()
        .eq("id", userId);

      if (siswaError) {
        throw AppError.internal(`Gagal menghapus siswa_profile: ${siswaError.message}`);
      }
    } else if (profile.role === "tentor") {
      const { error: tentorError } = await supabase
        .from("tentor_profile")
        .delete()
        .eq("id", userId);

      if (tentorError) {
        throw AppError.internal(`Gagal menghapus tentor_profile: ${tentorError.message}`);
      }
    }
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (profileError) {
      throw AppError.internal(`Gagal menghapus profile utama: ${profileError.message}`);
    }
    
    return true;
  }
}

module.exports = new UserModel();