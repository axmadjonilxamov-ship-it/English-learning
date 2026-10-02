/**
 * Kunlik seriya ("streak").
 *
 * Seriya dars tugatilgan kunlar ketma-ketligini sanaydi. Bir kun ham dars
 * qilinmasa, seriya uziladi va noldan boshlanadi.
 *
 * Sanalar doim Toshkent vaqti bo'yicha `YYYY-MM-DD` ko'rinishida saqlanadi:
 * shunda chet elga chiqqan foydalanuvchida ham kun bir xil paytda almashadi,
 * va `new Date()` ning vaqt mintaqasiga bog'liqligi muammo tug'dirmaydi.
 */

export type Streak = {
  /** Hozirgi ketma-ketlik (kun). */
  count: number;
  /** Oxirgi dars qilingan kun, `YYYY-MM-DD`. */
  last: string | null;
  /** Shu paytgacha erishilgan eng yaxshi natija. */
  best: number;
};

export const EMPTY_STREAK: Streak = { count: 0, last: null, best: 0 };

/**
 * Seriyaning holati — rasmdagi yuz ifodasi shundan tanlanadi.
 *
 *   none    — hali boshlanmagan;
 *   done    — bugun dars qilindi, seriya davom etmoqda;
 *   atRisk  — kechagi dars bor, bugun hali yo'q (bugun qilinmasa uziladi);
 *   broken  — bir yoki bir necha kun o'tkazib yuborilgan.
 */
export type StreakStatus = "none" | "done" | "atRisk" | "broken";

const ZONE = "Asia/Tashkent";

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Bugungi sana, Toshkent vaqti bo'yicha. */
export function today(now: Date = new Date()): string {
  return formatter.format(now);
}

/** Sanani kunlar soniga suradi (manfiy son — orqaga). */
export function shiftDay(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const moved = new Date(Date.UTC(y, m - 1, d) + days * 86_400_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${moved.getUTCFullYear()}-${pad(moved.getUTCMonth() + 1)}-${pad(moved.getUTCDate())}`;
}

/** Ikki sana orasidagi kunlar soni. */
export function daysBetween(from: string, to: string): number {
  const ms = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((ms(to) - ms(from)) / 86_400_000);
}

/** Dars tugatilganda seriyani yangilaydi. */
export function advance(streak: Streak, day: string = today()): Streak {
  // Bugun allaqachon sanalgan — ikkinchi dars seriyani oshirmaydi.
  if (streak.last === day) return streak;
  const continued = streak.last === shiftDay(day, -1);
  const count = continued ? streak.count + 1 : 1;
  return { count, last: day, best: Math.max(streak.best, count) };
}

export function statusOf(streak: Streak, day: string = today()): StreakStatus {
  if (!streak.last) return "none";
  if (streak.last === day) return "done";
  if (streak.last === shiftDay(day, -1)) return "atRisk";
  return "broken";
}

/** Necha kun o'tkazib yuborilgani (faqat `broken` holatida ma'noli). */
export function missedDays(streak: Streak, day: string = today()): number {
  if (!streak.last) return 0;
  return Math.max(0, daysBetween(streak.last, day) - 1);
}

/**
 * Ko'rsatiladigan seriya.
 *
 * Uzilgan seriyani nolga tushirib ko'rsatamiz, lekin saqlangan qiymatga
 * tegmaymiz — `advance` keyingi darsda uni o'zi qaytadan boshlaydi.
 */
export function visibleCount(streak: Streak, day: string = today()): number {
  return statusOf(streak, day) === "broken" ? 0 : streak.count;
}

/** Ikkita seriyani yo'qotishsiz birlashtiradi (brauzer va server). */
export function mergeStreak(a: Streak, b: Streak): Streak {
  const best = Math.max(a.best, b.best, a.count, b.count);
  if (!a.last) return { ...b, best };
  if (!b.last) return { ...a, best };
  if (a.last === b.last) return { count: Math.max(a.count, b.count), last: a.last, best };
  // Kechikkan ma'lumot yangisini orqaga surib yubormasligi kerak.
  return a.last > b.last ? { ...a, best } : { ...b, best };
}

/** Noto'g'ri yoki eski ma'lumotni xavfsiz ko'rinishga keltiradi. */
export function normaliseStreak(value: unknown): Streak {
  const raw = (value ?? {}) as Partial<Streak>;
  const count = Number.isFinite(raw.count) ? Math.max(0, Math.trunc(raw.count as number)) : 0;
  const best = Number.isFinite(raw.best) ? Math.max(0, Math.trunc(raw.best as number)) : 0;
  const last = typeof raw.last === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.last) ? raw.last : null;
  return { count: last ? count : 0, last, best: Math.max(best, last ? count : 0) };
}
