const crypto = require("node:crypto");
const supabase = require("../config/supabaseClient");
const tokenService = require("../models/tokenService");

async function findProfileById(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Gagal mengambil profil pengguna.");
  }

  return data;
}

async function findProfileByAccessToken(token) {
  const tokenHash = tokenService.encrypt(token);
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("token_akses", tokenHash)
    .in("role", ["siswa", "tentor"])
    .maybeSingle();

  if (error) {
    throw new Error("Gagal memverifikasi token akses.");
  }

  if (error) {
    throw new Error("Gagal memverifikasi token akses.");
  }

  return data;
}

module.exports = {
  findProfileById,
  findProfileByAccessToken,
};