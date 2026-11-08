"use strict";

const { GoogleGenAI } = require("@google/genai");
const AppError = require("../utils/AppError");

const SYSTEM_INSTRUCTION = `Anda adalah seorang konsultan pendidikan bimbingan belajar (bimbel) yang profesional, suportif, dan konstruktif.
Tugas Anda adalah menyusun laporan perkembangan belajar siswa secara naratif, personal, dan mendalam berdasarkan data nilai mata pelajaran dan catatan tentor.
Gunakan hanya nilai dan catatan tentor yang tercantum pada rekap sebagai bukti perkembangan siswa. Jangan membuat nilai, mata pelajaran, materi, atau catatan tentor yang tidak tersedia. Bedakan dengan jelas fakta nilai dari catatan tentor dan jangan menganggap keterangan kosong sebagai penilaian.

ATURAN STRUKTUR OUTPUT (SANGAT KETAT):
1. Hasil laporan HARUS terdiri dari TEPAT 2 (dua) paragraf naratif utuh berbahasa Indonesia.
2. PARAGRAF 1: Berisi apresiasi pencapaian belajar siswa saat ini dan analisis performa secara objektif berdasarkan nilai mata pelajaran serta catatan yang diberikan oleh tentor.
3. PARAGRAF 2: Berisi saran konkret, kata-kata motivasi, dan fokus area perbaikan untuk sesi belajar berikutnya.
4. BATASAN MUTLAK:
   - DILARANG menggunakan format poin-poin (bullet points), penomoran (numbered lists), atau tanda hubung (- / * / •).
   - DILARANG menyertakan judul paragraf, markdown heading (###), atau label seperti "Paragraf 1:" / "Paragraf 2:".
   - Tuliskan murni dua paragraf naratif mengalir yang dipisahkan oleh satu baris kosong (double newline).
   - Nada bahasa harus hangat, formal, santun, dan memotivasi.`;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw AppError.internal("GEMINI_API_KEY belum dikonfigurasi di environment variable (.env).");
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

function parseTwoParagraphs(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw AppError.internal("Gemini AI tidak mengembalikan teks laporan yang valid.");
  }

  // Bersihkan karakter formatting yang dilarang jika ada
  const cleaned = rawText
    .replace(/^#+\s+/gm, "")
    .replace(/^(?:paragraf\s*[12]|bagian\s*[12])\s*[:\-.]?\s*/gim, "")
    .replace(/^[\*\-•]\s+/gm, "")
    .trim();

  // Pisahkan berdasarkan pemisah paragraf (double newline atau lebih)
  const rawParagraphs = cleaned
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  let paragraf1 = "";
  let paragraf2 = "";

  if (rawParagraphs.length === 0) {
    throw AppError.internal("Gagal memproses narasi laporan dari AI.");
  } else if (rawParagraphs.length === 1) {
    const sentences = rawParagraphs[0].split(/(?<=[.!?])\s+/);
    if (sentences.length >= 2) {
      const mid = Math.ceil(sentences.length / 2);
      paragraf1 = sentences.slice(0, mid).join(" ");
      paragraf2 = sentences.slice(mid).join(" ");
    } else {
      throw AppError.internal("Gemini AI harus mengembalikan dua paragraf laporan yang lengkap.");
    }
  } else if (rawParagraphs.length === 2) {
    paragraf1 = rawParagraphs[0];
    paragraf2 = rawParagraphs[1];
  } else {
    // Jika lebih dari 2 paragraf, satukan paragraf awal sebagai paragraf 1 dan sisanya sebagai paragraf 2
    paragraf1 = rawParagraphs[0];
    paragraf2 = rawParagraphs.slice(1).join(" ");
  }

  return {
    paragraf1,
    paragraf2,
    teksLengkap: `${paragraf1}\n\n${paragraf2}`,
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGenerateContentWithFallback(ai, contents, systemInstruction) {
  const modelsToTry = [
    process.env.GEMINI_MODEL || "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
  ];

  // Hapus duplikat model
  const uniqueModels = [...new Set(modelsToTry)];
  let lastError = null;

  for (const model of uniqueModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents,
          config: { systemInstruction },
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
          // Model tidak ditemukan atau deprecated, langsung lewati ke model berikutnya
          break;
        }

        if (isUnavailable && attempt < 2) {
          // Tunggu sebentar lalu coba lagi
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
        return `${idx + 1}. ${mapel}${materi} - Nilai: ${nilai}${tanggal}${catatan}`;
      })
      .join("\n");
  } else {
    gradesSummary = "Catatan: Siswa baru bergabung atau belum ada penilaian resmi yang tersimpan di sesi sebelumnya.";
  }

  const promptContent = `Susun laporan berdasarkan profil dan rekap penilaian resmi berikut. Setiap nilai dan keterangan merupakan data yang dicatat tentor untuk siswa ini:
- Nama Siswa: ${studentName}
- Kelas: ${className}
- Periode Laporan: ${reportPeriod}

Nilai dan catatan tentor per sesi:
${gradesSummary}

Instruksi Tambahan:
Gunakan mata pelajaran, materi, nilai, tanggal, dan catatan tentor yang tersedia sebagai referensi. Jika catatan tentor tidak tersedia, jangan mengarangnya. Analisis capaian secara objektif dari nilai yang ada dan jangan menyatakan tren peningkatan/penurunan tanpa bukti perbandingan. Susun tepat 2 paragraf naratif utuh berbahasa Indonesia tanpa format poin-poin.`;

  try {
    const response = await callGenerateContentWithFallback(ai, promptContent, SYSTEM_INSTRUCTION);
    const rawText = response.text;
    const parsed = parseTwoParagraphs(rawText);

    return {
      studentName,
      className,
      periode: reportPeriod,
      catatan_wali_kelas: parsed.paragraf1,
      saran_pengembangan: parsed.paragraf2,
      teks_lengkap: parsed.teksLengkap,
    };
  } catch (error) {
    console.error("Gagal generate laporan dengan Gemini AI:", error);
    if (error instanceof AppError) throw error;
    throw AppError.internal(`Gagal menghasilkan analisis laporan perkembangan dari Gemini AI: ${error.message || "Layanan AI tidak merespons"}`);
  }
}

module.exports = {
  getGeminiClient,
  parseTwoParagraphs,
  generateStudentProgressReport,
};
