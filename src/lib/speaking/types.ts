/**
 * IELTS Speaking baholash natijasining shakli.
 *
 * Bu fayl faqat turlardan iborat — hech qanday server kutubxonasi import
 * qilinmaydi, shuning uchun uni brauzerdagi komponentlar ham xavfsiz
 * ishlata oladi (API kalitlari hech qachon bu yerga tushmaydi).
 */

export type SpeakingPart = "part1" | "part2" | "part3";

export type SpeakingScores = {
  /** Ravonlik va bog'lanish. */
  fluency_coherence: number;
  /** Lug'at boyligi. */
  lexical_resource: number;
  /** Grammatika. */
  grammar: number;
  /** Talaffuz — faqat transkripsiya asosida chamalanadi (quyidagi izohga qarang). */
  pronunciation_estimate: number;
  /** Umumiy ball. */
  overall: number;
};

export type SpeakingMistake = {
  /** Foydalanuvchi aytgan jumla (ingliz tilida). */
  original: string;
  /** To'g'rilangan variant (ingliz tilida). */
  correction: string;
  /** Nima uchun xato ekani — o'zbek tilida. */
  explanation: string;
};

export type SpeakingFeedback = {
  /** Kuchli tomonlar — o'zbek tilida. */
  strengths: string[];
  mistakes: SpeakingMistake[];
  /** Tavsiya etilgan so'z va iboralar — ingliz tilida, qavs ichida o'zbekcha izoh. */
  vocabulary_suggestions: string[];
};

export type SpeakingEvaluation = {
  /** Whisper qaytargan matn — so'zma-so'z, "uh"/"um" lari bilan. */
  transcript: string;
  scores: SpeakingScores;
  feedback: SpeakingFeedback;
  /** Xuddi shu savolga 7.5–8.0 darajadagi namunaviy javob (ingliz tilida). */
  improved_answer: string;
  /**
   * Talaffuz bahosi qayerdan olingani.
   * `"transcript"` — faqat matn asosida chamalangan (hozirgi holat);
   * `"audio"` — kelajakda talaffuz API'si (Speechace / Azure) qo'shilsa.
   */
  pronunciation_source: "transcript" | "audio";
};

/** Server xatoliklari — brauzerga shu shaklda qaytadi. */
export type SpeakingErrorResponse = { error: string };
