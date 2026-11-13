"use strict";

const crypto = require("crypto");
const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");

const USER_PAGE_SIZE = 1000;

async function rollbackSiswaCreation(userId) {
  const rollbackOperations = [
    ["tagihan_spp", "siswa_id"],
    ["kelas_siswa", "siswa_id"],
    ["siswa_profile", "id"],
    ["profiles", "id"],
  ];
  const errors = [];

  for (const [table, column] of rollbackOperations) {
    try {
      const { error } = await supabase.from(table).delete().eq(column, userId);
      if (error) errors.push(`${table}: ${error.message}`);
    } catch (error) {
      errors.push(`${table}: ${error.message || String(error)}`);
    }
  }

  return errors;
}

function monthKey(dateString) {
  const [year, month] = dateString.split("-").map(Number);
  return year * 12 + month - 1;
}

function createMonthlyBills(siswaId, { harga, periode_mulai, periode_selesai, tanggalMulaiBelajar, paket }) {
  const classStart = monthKey(periode_mulai);
  const classEnd = monthKey(periode_selesai);
  const requestedStart = monthKey(tanggalMulaiBelajar);
  const start = Math.max(classStart, requestedStart);
  const end = classEnd;
  const effectivePaket = requestedStart > classStart ? "Bulanan" : paket;
  const nominal = effectivePaket === "Tahunan" ? Math.round(harga * 0.9) : harga;
  const bills = [];

  for (let monthNumber = start; monthNumber <= end; monthNumber += 1) {
    const year = Math.floor(monthNumber / 12);
    const monthIndex = monthNumber % 12;
    const dueDate = new Date(Date.UTC(year, monthIndex, 10)).toISOString().slice(0, 10);

    bills.push({
      siswa_id: siswaId,
      nominal,
      status: effectivePaket === "Tahunan" ? "Lunas" : "Belum Bayar",
      tanggal_jatuh_tempo: dueDate,
      bulan: monthIndex + 1,
      tahun: year,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return bills;
}

class UserModel {
  async createUserProfile({ role, tokenAkses, nama, noTelp, extraField, kelasId, tagihanSpp }) {
    let kelas;
    if (role === "siswa") {
      const { data, error: kelasError } = await supabase
        .from("kelas")
        .select("id, harga, periode_mulai, periode_selesai")
        .eq("id", kelasId)
        .maybeSingle();
      kelas = data;

      if (kelasError) {
        throw AppError.internal(`Gagal memeriksa kelas siswa: ${kelasError.message}`);
      }

      if (!kelas) {
        throw AppError.notFound("Kelas yang dipilih tidak ditemukan.");
      }
      if (monthKey(tagihanSpp.tanggalMulaiBelajar) > monthKey(kelas.periode_selesai)) {
        throw AppError.badRequest("Tanggal mulai belajar tidak boleh setelah periode kelas selesai.");
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
      try {
        const { error: siswaError } = await supabase
          .from("siswa_profile")
          .insert([{ id: userId, nama, no_telp: noTelp, nama_wali: extraField }]);

        if (siswaError) {
          throw AppError.internal(`Gagal simpan siswa_profile: ${siswaError.message}`);
        }

        const { error: kelasSiswaError } = await supabase
          .from("kelas_siswa")
          .insert([{
            siswa_id: userId,
            kelas_id: kelasId,
            tanggal_mulai_belajar: tagihanSpp.tanggalMulaiBelajar,
            paket: monthKey(tagihanSpp.tanggalMulaiBelajar) > monthKey(kelas.periode_mulai)
              ? "Bulanan"
              : tagihanSpp.paket,
          }]);

        if (kelasSiswaError) {
          throw AppError.internal(`Gagal menghubungkan siswa ke kelas: ${kelasSiswaError.message}`);
        }

        const effectivePaket = monthKey(tagihanSpp.tanggalMulaiBelajar) > monthKey(kelas.periode_mulai)
          ? "Bulanan"
          : tagihanSpp.paket;
        const bills = createMonthlyBills(userId, {
          ...kelas,
          ...tagihanSpp,
        });
        const { data: insertedBills, error: tagihanError } = await supabase
          .from("tagihan_spp")
          .insert(bills)
          .select("id, nominal, bulan, tahun");

        if (tagihanError) {
          throw AppError.internal(`Gagal membuat tagihan SPP siswa: ${tagihanError.message}`);
        }

        if (effectivePaket === "Tahunan") {
          const paidAt = new Date().toISOString().split("T")[0];
          const invoices = (insertedBills || []).map((bill, index) => ({
            tagihan_id: bill.id,
            nomor_invoice: `INV/${bill.tahun}/${String(bill.bulan).padStart(2, "0")}/${Date.now()}${index}`,
            tanggal_pembayaran: paidAt,
            total_pembayaran: bill.nominal,
            metode_pembayaran: "Tahunan",
            keterangan: "Pembayaran SPP tahunan",
          }));
          const { error: invoiceError } = await supabase.from("invoice_pembayaran").insert(invoices);
          if (invoiceError) {
            throw AppError.internal(`Gagal membuat invoice SPP tahunan: ${invoiceError.message}`);
          }
        }
      } catch (error) {
        const rollbackErrors = await rollbackSiswaCreation(userId);
        const rollbackMessage = rollbackErrors.length
          ? ` Pembersihan akun gagal: ${rollbackErrors.join("; ")}.`
          : "";

        throw AppError.internal(`${error.message || String(error)}${rollbackMessage}`);
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

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        throw AppError.notFound("Pengguna tidak ditemukan.");
      }
      throw AppError.internal(`Gagal mengambil profil pengguna: ${profileError.message}`);
    }

    const userRole = role || profileData.role;

    if (userRole === "siswa") {
      const updateData = {};
      if (nama) updateData.nama = nama;
      if (noTelp) updateData.no_telp = noTelp;
      if (extraField) updateData.nama_wali = extraField;

      const { data: updatedSiswa, error } = await supabase
        .from("siswa_profile")
        .update(updateData)
        .eq("id", userId)
        .select("id")
        .maybeSingle();

      if (error) throw AppError.internal(`Gagal update siswa: ${error.message}`);
      if (!updatedSiswa) throw AppError.notFound("Profil siswa tidak ditemukan.");
    } else if (userRole === "tentor") {
      const updateData = {};
      if (nama) updateData.nama = nama;
      if (noTelp) updateData.no_telp = noTelp;
      if (extraField) updateData.alamat = extraField;

      const { data: updatedTentor, error } = await supabase
        .from("tentor_profile")
        .update(updateData)
        .eq("id", userId)
        .select("id")
        .maybeSingle();

      if (error) throw AppError.internal(`Gagal update tentor: ${error.message}`);
      if (!updatedTentor) throw AppError.notFound("Profil tentor tidak ditemukan.");
    }

    return { id: userId, message: "Profil berhasil diperbarui" };
  }

  async findAllUsers(roleFilter) {
    const profiles = [];
    let offset = 0;

    while (true) {
      let query = supabase.from("profiles").select(`
        id, role, token_akses, created_at,
        siswa_profile ( nama, no_telp, nama_wali,
          kelas_siswa ( kelas:kelas_id ( id, nama_kelas ) )
        ),
        tentor_profile ( nama, no_telp, alamat )
      `, { count: "exact" });

      if (roleFilter) query = query.eq("role", roleFilter);

      const { data, error, count } = await query
        .order("id", { ascending: true })
        .range(offset, offset + USER_PAGE_SIZE - 1);

      if (error) {
        throw AppError.internal(`Gagal mengambil data pengguna: ${error.message}`);
      }

      profiles.push(...data);
      if (!Number.isInteger(count) || count < 0) {
        throw AppError.internal("Gagal mengambil jumlah data pengguna dari database.");
      }
      if (offset + data.length >= count) break;
      if (data.length === 0) {
        throw AppError.internal("Gagal memuat seluruh data pengguna: halaman pengguna kosong sebelum data selesai diambil.");
      }
      offset += data.length;
    }

    return profiles.map((p) => {
      const kelasList = (p.siswa_profile?.kelas_siswa ?? [])
        .map((membership) => membership.kelas)
        .filter(Boolean)
        .map((kelas) => ({ id: kelas.id, nama: kelas.nama_kelas }));
      return {
        id: p.id,
        role: p.role,
        token_akses: p.token_akses,
        created_at: p.created_at,
        nama: p.siswa_profile?.nama ?? p.tentor_profile?.nama ?? null,
        no_telp: p.siswa_profile?.no_telp ?? p.tentor_profile?.no_telp ?? null,
        extraField: p.siswa_profile?.nama_wali ?? p.tentor_profile?.alamat ?? null,
        kelas: kelasList[0] ?? null,
        kelasList,
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