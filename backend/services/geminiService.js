"use strict";

const { GoogleGenAI } = require("@google/genai");
const AppError = require("../utils/AppError");

const SYSTEM_INSTRUCTION = `Anda adalah seorang konsultan pendidikan bimbingan belajar (bimbel) yang profesional, suportif, dan konstruktif.
Tugas Anda adalah menyusun laporan perkembangan belajar siswa berdasarkan data nilai mata pelajaran dan catatan tentor.

Anda HARUS mengembalikan respons dalam format JSON murni (valid JSON) dengan tepat dua kunci (keys):
1. "catatan_wali_kelas": Berisi apresiasi pencapaian belajar saat ini dan analisis performa secara objektif berdasarkan nilai mata pelajaran serta catatan yang diberikan oleh tentor (berbentuk paragraf naratif).
2. "saran_pengembangan": Berisi saran konkret, kata-kata motivasi, dan fokus area perbaikan untuk sesi belajar berikutnya (berbentuk paragraf naratif).

BATASAN MUTLAK:
- DILARANG menggunakan format poin-poin (bullet points), penomoran (numbered lists), atau tanda hubung berlebih.
- Jangan menyertakan judul atau markdown di dalam nilai JSON, murni teks paragraf naratif berbahasa Indonesia yang hangat dan profesional.`;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw AppError.internal("GEMINI_API_KEY belum dikonfigurasi di environment variable (.env).");
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGenerateContentWithFallback(ai, contents, systemInstruction) {
  const modelsToTry = [
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.8-flash",
  ];

  const uniqueModels = [...new Set(modelsToTry)];
  let lastError = null;

  for (const model of uniqueModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents,
          config: { 
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 600,
            responseMimeType: "application/json", // Memaksa AI mengembalikan format JSON
          },
        });
        return result;
      } catch (error) {
        lastError = error;
        const errorMsg = String(error?.message || "");
        const isUnavailable = [429, 500, 503].includes(error?.status)
          || errorMsg.includes("429")
          || errorMsg.includes("500")
          || errorMsg.includes("503")
          || errorMsg.includes("high demand");
        const isNotFound = error?.status === 404
          || errorMsg.includes("404")
          || errorMsg.includes("no longer available")
          || /models?.*?(?:not found|not supported|not available)/i.test(errorMsg);

        if (isNotFound) {
          break;
        }

        if (isUnavailable && attempt < 2) {
          await sleep(1500);
          continue;
        }

        if (!isNotFound && !isUnavailable) throw error;
        break;
      }
    }
  }

  throw lastError;
}

async function generateStudentProgressReport({ student, grades = [], periode }) {
  const ai = getGeminiClient();

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
        const catatan = item.keterangan || item.catatan ? `, Catatan Tentor: "${item.keterangan || item.catatan}"` : "";
        
        // Memperbaiki baris yang sebelumnya terpotong (syntax error)
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
    const response = await callGenerateContentWithFallback(ai, promptContent, SYSTEM_INSTRUCTION);
    const rawText = response.text;
    
    let parsedJson;
    try {
      parsedJson = JSON.parse(rawText);
    } catch (parseError) {
      console.error("Gagal parse JSON dari AI:", rawText);
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
    console.error("Gagal generate laporan dengan Gemini AI:", error);
    if (error instanceof AppError) throw error;
    throw AppError.internal(`Gagal menghasilkan analisis laporan perkembangan dari Gemini AI: ${error.message || "Layanan AI tidak merespons"}`);
  }
}

module.exports = {
  getGeminiClient,
  generateStudentProgressReport,
};