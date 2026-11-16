const crypto = require("node:crypto");
const supabase = require("../config/supabaseClient");
const tokenService = require("../models/tokenService");

async function findProfileById(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      role,
      siswa_profile ( nama ),
      tentor_profile ( nama )
    `)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Gagal mengambil profil pengguna.");
  }

  if (!data) return data;

  return {
    id: data.id,
    role: data.role,
    nama: data.siswa_profile?.nama ?? data.tentor_profile?.nama ?? null,
  };
}

async function findProfileByAccessToken(token) {
  const tokenHash = tokenService.encrypt(token);
  
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      role,
      siswa_profile ( nama ),
      tentor_profile ( nama )
    `)
    .eq("token_akses", tokenHash)
    .in("role", ["siswa", "tentor"])
    .maybeSingle();

  if (error) {
    throw new Error("Gagal memverifikasi token akses.");
  }

  if (error) {
    throw new Error("Gagal memverifikasi token akses.");
  }

  if (!data) return data;

  return {
    id: data.id,
    role: data.role,
    nama: data.siswa_profile?.nama ?? data.tentor_profile?.nama ?? null,
  };
}

module.exports = {
  findProfileById,
  findProfileByAccessToken,
};