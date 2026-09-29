/** Saytdagi uchta til. */
export const LANGS = ["uz", "ru", "en"] as const;

export type Lang = (typeof LANGS)[number];

export const LANG_NAMES: Record<Lang, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

/** Menyudagi qisqa belgi. */
export const LANG_SHORT: Record<Lang, string> = {
  uz: "UZ",
  ru: "RU",
  en: "EN",
};

export const DEFAULT_LANG: Lang = "uz";

/**
 * Ko'p tilli matn.
 *
 * Oddiy satr berilsa — bu o'zbekcha matn (barcha eski ma'lumotlar shunday).
 * Obyekt berilsa — har bir til uchun alohida matn; tarjima yo'q bo'lsa
 * o'zbekchasi ishlatiladi.
 */
export type Text = string | { uz: string; ru?: string; en?: string };

/** Ko'p tilli matndan kerakli tilni oladi. */
export function pick(value: Text, lang: Lang): string {
  if (typeof value === "string") return value;
  return value[lang] ?? value.uz;
}

/** Ko'p tilli juftliklar — mashqlardagi `[en, uz]` kabi. */
export type TextPair = [string, Text];

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}
