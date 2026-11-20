"use strict";

const OpenAI = require("openai");
const AppError = require("../utils/AppError");

const SYSTEM_INSTRUCTION = `Anda adalah seorang konsultan pendidikan bimbingan belajar (bimbel) yang profesional, suportif, dan konstruktif.
Tugas Anda adalah menyusun laporan perkembangan belajar siswa berdasarkan data nilai mata pelajaran dan catatan tentor.

Anda HARUS mengembalikan respons dalam format JSON murni (valid JSON) dengan tepat dua kunci (keys):
1. "catatan_wali_kelas": Berisi apresiasi pencapaian belajar saat ini dan analisis performa secara objektif berdasarkan nilai mata pelajaran serta catatan yang diberikan oleh tentor (berbentuk paragraf naratif).
2. "saran_pengembangan": Berisi saran konkret, kata-kata motivasi, dan fokus area perbaikan untuk sesi belajar berikutnya (berbentuk paragraf naratif).

BATASAN MUTLAK:
- DILARANG menggunakan format poin-poin (bullet points), penomoran (numbered lists), atau tanda hubung berlebih.
- Jangan menyertakan judul atau markdown di dalam nilai JSON, murni teks paragraf naratif berbahasa Indonesia yang hangat dan profesional.`;

function getProviderConfig() {
  const provider = (process.env.AI_PROVIDER || "nvidia").trim().toLowerCase();

  if (provider !== "nvidia") {
    throw AppError.internal(`Provider AI "${provider}" tidak didukung. Gunakan AI_PROVIDER=nvidia.`);
  }

  const apiKey = process.env.NVIDIA_API_KEY?.trim();
  if (!apiKey) {
    throw AppError.internal("NVIDIA_API_KEY belum dikonfigurasi di environment variable (.env).");
  }

  const model = process.env.NVIDIA_MODEL?.trim();
  if (!model) {
    throw AppError.internal("NVIDIA_MODEL belum dikonfigurasi di environment variable (.env).");
  }

  return {
    provider,
    apiKey,
    model,
    baseUrl: process.env.NVIDIA_BASE_URL?.trim() || "https://integrate.api.nvidia.com/v1",
  };
}

function getAiClient(config) {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  });
}

async function generateStudentProgressReport({ student, grades = [], periode }) {
  const config = getProviderConfig();
  const ai = getAiClient(config);

  const studentName = student.nama || "Siswa";
  const className = student.nama_kelas || student.jenjang || "Reguler";
  const reportPeriod = periode || "Bulan Berjalan";

  let gradesSummary = "";
  if (grades.length > 0) {
    gradesSummary = grades
      .map((item, idx) => {
        const mapel = item.mata_pelajaran || item.mapel || "Mata Pelajaran";
        const materi = item.materi ? ` (Materi: ${item.materi})` : "";
        const tanggal = item.tanggal ? `, Tanggal: ${item.tanggal}` : "";
        const nilai = item.nilai !== undefined && item.nilai !== null ? item.nilai : "-";
        const catatan = item.keterangan || item.catatan
          ? `, Catatan Tentor: "${item.keterangan || item.catatan}"`
          : "";

        return `${idx + 1}. ${mapel}${materi} - Nilai: ${nilai}${tanggal}${catatan}`;
      })
      .join("\n");
  } else {
    gradesSummary = "Catatan: Siswa baru bergabung atau belum ada penilaian resmi yang tersimpan di sesi sebelumnya.";
  }

  const promptContent = `Susun laporan berdasarkan profil dan rekap penilaian resmi berikut:
- Nama Siswa: ${studentName}
- Kelas: ${className}
- Periode Laporan: ${reportPeriod}

Nilai dan catatan tentor per sesi:
${gradesSummary}

Instruksi Tambahan:
Gunakan mata pelajaran, materi, nilai, tanggal, dan catatan tentor yang tersedia sebagai referensi. Analisis capaian secara objektif. Kembalikan hasilnya strictly dalam format JSON dengan kunci "catatan_wali_kelas" dan "saran_pengembangan".`;

  try {
    const response = await ai.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: promptContent },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
      chat_template_kwargs: { enable_thinking: false },
      reasoning_budget: 0,
    });

    const rawText = response.choices?.[0]?.message?.content;
    if (!rawText) {
      throw AppError.internal("NVIDIA tidak mengembalikan isi respons.");
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(rawText);
    } catch (parseError) {
      console.error("Gagal parse JSON dari NVIDIA:", rawText);
      throw AppError.internal("Format respons AI tidak valid.");
    }

    const catatanWali = parsedJson.catatan_wali_kelas || "";
    const saranPengembangan = parsedJson.saran_pengembangan || "";

    return {
      studentName,
      className,
      periode: reportPeriod,
      catatan_wali_kelas: catatanWali,
      saran_pengembangan: saranPengembangan,
      teks_lengkap: `${catatanWali}\n\n${saranPengembangan}`,
    };
  } catch (error) {
    console.error("Gagal generate laporan dengan NVIDIA AI:", error);
    if (error instanceof AppError) throw error;
    const providerStatus = error.status || error.statusCode;
    const providerCode = error.code || error.type;
    const providerMessage = error.message || "Layanan AI tidak merespons";
    throw AppError.internal(
      `Gagal menghasilkan analisis laporan perkembangan dari NVIDIA AI`
      + (providerStatus ? ` (${providerStatus}${providerCode ? ` ${providerCode}` : ""})` : "")
      + `: ${providerMessage}`
    );
  }
}

module.exports = {
  getProviderConfig,
  generateStudentProgressReport,
};
