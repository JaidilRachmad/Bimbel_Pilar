import gradeScale from '../config/grade-scale.json'

const LETTER_TO_NUMBER = gradeScale.letterToNumber
const NUMBER_TO_LETTER = Object.fromEntries(
  Object.entries(LETTER_TO_NUMBER).map(([letter, number]) => [number, letter]),
)
const NUMERIC_GRADE_PATTERN = /^(?:\d+(?:\.\d*)?|\.\d+)$/

export function parseGradeInput(value) {
  const normalized = String(value ?? '').trim().toUpperCase()
  if (Object.hasOwn(LETTER_TO_NUMBER, normalized)) {
    return { nilai: LETTER_TO_NUMBER[normalized], tipe_nilai: 'huruf' }
  }
  if (!NUMERIC_GRADE_PATTERN.test(normalized)) return null

  const nilai = Number(normalized)
  if (!Number.isFinite(nilai) || nilai < 0 || nilai > 100) return null
  return { nilai, tipe_nilai: 'angka' }
}

export function formatGradeValue(grade) {
  if (!grade || grade.nilai === undefined || grade.nilai === null) return ''
  if (grade.tipe_nilai === 'huruf') {
    return NUMBER_TO_LETTER[Number(grade.nilai)] || String(grade.nilai)
  }
  return String(grade.nilai)
}
