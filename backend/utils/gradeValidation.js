"use strict";

const { letterToNumber } = require("../config/grade-scale.json");
const LETTER_SCORES = new Set(Object.values(letterToNumber));
const ALLOWED_TYPES = new Set(["angka", "huruf"]);

function getGradeValidationErrors(value, type) {
    const errors = [];
    let hasValidNumericValue = false;

    if (value === undefined || value === null) {
        errors.push("Nilai wajib diisi.");
    } else if (typeof value !== "number" || !Number.isFinite(value)) {
        errors.push("Nilai harus berupa angka yang valid (contoh: 85, 85.5, 90).");
    } else if (value < 0 || value > 100) {
        errors.push("Nilai harus berada di antara rentang 0 sampai 100.");
    } else {
        hasValidNumericValue = true;
    }

    if (!ALLOWED_TYPES.has(type)) {
        errors.push("tipe_nilai harus berupa 'angka' atau 'huruf'");
    } else if (type === "huruf" && hasValidNumericValue && !LETTER_SCORES.has(value)) {
        errors.push("Nilai bertipe huruf harus sesuai dengan konversi A sampai E.");
    }

    return errors;
}

module.exports = { getGradeValidationErrors };
