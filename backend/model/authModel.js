const crypto = require("node:crypto");
const { dbClient } = require("../../config/supabase");

function hashAccessToken(token) {
  const secret = process.env.TOKEN_HASH_SECRET;

  if (!secret) {
    throw new Error("TOKEN_HASH_SECRET belum dikonfigurasi.");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(token, "utf8")
    .digest("hex");
}

async function findProfileById(userId) {
  const { data, error } = await dbClient
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
  const tokenHash = hashAccessToken(token);

  const { data, error } = await dbClient
    .from("profiles")
    .select("id, role")
    .eq("token_akses", tokenHash)
    .in("role", ["siswa", "tentor"])
    .maybeSingle();

  if (error) {
    throw new Error("Gagal memverifikasi token akses.");
  }

  return data;
}

module.exports = {
  hashAccessToken,
  findProfileById,
  findProfileByAccessToken,
};