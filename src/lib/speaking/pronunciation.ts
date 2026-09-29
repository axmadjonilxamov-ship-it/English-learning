import "server-only";

/**
 * Talaffuzni audio bo'yicha baholash.
 *
 * Hozircha bunday xizmat ulanmagan: talaffuz bahosi faqat transkripsiya
 * asosida chamalanadi va natijada `pronunciation_source: "transcript"` deb
 * belgilanadi.
 *
 * Kelajakda Speechace yoki Azure Pronunciation Assessment ni qo'shish uchun
 * quyidagi interfeysni bajaradigan funksiya yozib, `pronunciationAssessor`
 * ni o'shanga tenglashtirish kifoya — `evaluate.ts` ni o'zgartirish shart
 * emas, chunki u faqat shu interfeysga tayanadi.
 *
 * Masalan:
 *
 * ```ts
 * const speechace: PronunciationAssessor = async (audio, reference) => {
 *   const form = new FormData();
 *   form.append("user_audio_file", audio);
 *   if (reference) form.append("text", reference);
 *   const res = await fetch(`https://api.speechace.co/api/scoring/...`, {
 *     method: "POST",
 *     body: form,
 *   });
 *   const data = await res.json();
 *   return { band: toBand(data.text_score.quality_score) };
 * };
 * export const pronunciationAssessor: PronunciationAssessor | null = speechace;
 * ```
 */
export type PronunciationResult = {
  /** IELTS shkalasidagi ball (0–9, yarim ballik qadam bilan). */
  band: number;
  /** Ixtiyoriy: xizmatdan kelgan qo'shimcha izohlar. */
  notes?: string[];
};

export type PronunciationAssessor = (
  audio: File,
  /** Foydalanuvchi aytgan matn — ba'zi xizmatlar solishtirish uchun so'raydi. */
  reference?: string,
) => Promise<PronunciationResult>;

/** Hozircha ulanmagan. */
export const pronunciationAssessor: PronunciationAssessor | null = null;

/** IELTS bahosi har doim yarim ballik qadamda bo'ladi. */
export function toHalfBand(value: number): number {
  return Math.min(9, Math.max(0, Math.round(value * 2) / 2));
}
