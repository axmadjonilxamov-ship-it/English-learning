/**
 * IELTS Writing uchun avtomatik tahlil.
 *
 * Bu rasmiy baho EMAS — inson ekspert o'rnini bosa olmaydi. Lekin IELTS ning
 * to'rtta mezoni bo'yicha o'lchab bo'ladigan narsalarni (hajm, xatboshilar,
 * bog'lovchilar, lug'at xilma-xilligi, gap tuzilishi) tekshiradi va nimani
 * yaxshilash kerakligini aniq ko'rsatadi.
 */

export type TaskKind = "task1" | "task2";

export type Point = { ok: boolean; text: string };

export type CriterionResult = {
  key: "task" | "coherence" | "lexical" | "grammar";
  title: string;
  /** Taxminiy ball (4–9). */
  band: number;
  points: Point[];
};

export type WritingAnalysis = {
  words: number;
  sentences: number;
  paragraphs: number;
  minWords: number;
  overall: number;
  criteria: CriterionResult[];
};

// ---------- Lug'atlar ----------

const LINKERS = {
  qoshimcha: ["moreover", "furthermore", "in addition", "additionally", "besides", "also", "what is more"],
  qarama: ["however", "in contrast", "on the other hand", "nevertheless", "although", "whereas", "while", "despite", "even though"],
  sabab: ["because", "therefore", "as a result", "consequently", "thus", "due to", "since", "hence", "owing to"],
  misol: [
    "for example", "for instance", "such as", "namely", "to illustrate",
    "a case in point", "take ", "including", "like the", "in particular",
  ],
  tartib: ["firstly", "first of all", "secondly", "finally", "then", "next", "lastly"],
  xulosa: [
    "in conclusion", "to conclude", "concluding", "overall", "to sum up", "in summary",
    "all in all", "on balance", "taking everything into account", "to summarise", "in short",
  ],
};

const REFERENCES = ["this", "these", "those", "such", "it", "they", "which", "their", "its"];

/** Grafik tasvirlash uchun kerakli so'zlar (Task 1). */
const TREND_WORDS = [
  "increase", "increased", "rise", "rose", "grow", "grew", "climb", "climbed",
  "decrease", "decreased", "fall", "fell", "decline", "declined", "drop", "dropped",
  "peak", "peaked", "fluctuate", "fluctuated", "remain", "remained", "stable", "steady",
  "sharply", "slightly", "gradually", "dramatically", "significantly", "considerably",
];

/** Task 1 da shaxsiy fikr bo'lmasligi kerak. */
const OPINION_WORDS = ["i think", "i believe", "in my opinion", "i feel", "my view", "i would say"];

/** Kam uchraydigan, bahoni ko'taradigan so'zlar. */
const ADVANCED = [
  "significant", "substantial", "considerable", "crucial", "vital", "essential",
  "beneficial", "detrimental", "inevitable", "widespread", "prominent", "notable",
  "tendency", "phenomenon", "implication", "consequence", "alternative", "factor",
  "furthermore", "nevertheless", "consequently", "predominantly", "arguably",
];

/** Ko'p uchraydigan imlo xatolari. */
const MISSPELLINGS: Record<string, string> = {
  becouse: "because",
  bacause: "because",
  wich: "which",
  wtih: "with",
  teh: "the",
  recieve: "receive",
  enviroment: "environment",
  goverment: "government",
  neccessary: "necessary",
  occured: "occurred",
  seperate: "separate",
  definately: "definitely",
  alot: "a lot",
  oppinion: "opinion",
  advantagies: "advantages",
  tecnology: "technology",
  bussiness: "business",
  developement: "development",
};

/** Juda sodda, takrorlanadigan so'zlar — ular ko'p bo'lsa lug'at tor hisoblanadi. */
/** Juda sodda so'zlar — ular haddan ortiq takrorlansa lug'at tor hisoblanadi.
 * "people" bu ro'yxatda yo'q: akademik esseda u butunlay tabiiy so'z. */
const BASIC_WORDS = ["good", "bad", "big", "nice", "thing", "stuff", "a lot of"];

// ---------- Yordamchilar ----------

const countOccurrences = (text: string, phrase: string) => {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = /^[a-z]+$/.test(phrase) ? `\\b${escaped}\\b` : escaped;
  return (text.match(new RegExp(pattern, "g")) ?? []).length;
};

const hasAny = (text: string, list: string[]) => list.some((w) => countOccurrences(text, w) > 0);

/**
 * So'z "murakkabroq" ekanini shakli bo'yicha aniqlaydi.
 *
 * Ro'yxat har doim ham yetarli emas — kuchli yozuvchi bizning ro'yxatimizda
 * yo'q so'zlarni ishlatishi mumkin. Shuning uchun akademik qo'shimchalarga
 * qarab ham baholaymiz.
 */
const ACADEMIC_SUFFIX = /(tion|sion|ment|ity|ness|ance|ence|ical|ative|ious|eous|ously|ilit|ise|ize|ify)$/;

function advancedCount(words: string[]): number {
  const seen = new Set<string>();
  for (const w of words) {
    if (w.length >= 8 && ACADEMIC_SUFFIX.test(w)) seen.add(w);
  }
  return seen.size;
}

/** Ballni 4–9 oralig'ida ushlab turadi. */
const clampBand = (n: number) => Math.max(4, Math.min(9, Math.round(n * 2) / 2));

// ---------- Asosiy tahlil ----------

/** Matnni to'rtta IELTS mezoni bo'yicha tahlil qiladi. */
export function analyse(text: string, kind: TaskKind, promptText: string): WritingAnalysis {
  const minWords = kind === "task1" ? 150 : 250;
  const lower = text.toLowerCase();

  const wordList = text.trim().split(/\s+/).filter((w) => /[a-zA-Z]/.test(w));
  const words = wordList.length;
  const clean = wordList.map((w) => w.toLowerCase().replace(/[^a-z']/g, "")).filter(Boolean);

  const sentenceList = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).filter(Boolean).length > 2);
  const sentences = sentenceList.length;
  // Ko'pchilik xatboshini bitta Enter bilan ajratadi, shuning uchun bo'sh qator
  // ham, oddiy qator uzilishi ham xatboshi hisoblanadi.
  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.split(/\s+/).filter(Boolean).length >= 8).length;

  const criteria: CriterionResult[] = [
    taskCriterion(kind, lower, words, minWords, promptText, paragraphs),
    coherenceCriterion(lower, paragraphs, sentences),
    lexicalCriterion(lower, clean, promptText),
    grammarCriterion(lower, sentenceList),
  ];

  // IELTS da umumiy ball to'rtta mezonning o'rtachasi, lekin eng zaif tomon
  // natijani sezilarli pasaytiradi — shuni hisobga olamiz.
  const average = criteria.reduce((sum, c) => sum + c.band, 0) / criteria.length;
  const weakest = Math.min(...criteria.map((c) => c.band));
  const overall = clampBand(average * 0.75 + weakest * 0.25);

  return { words, sentences, paragraphs, minWords, overall, criteria };
}

// ---------- 1. Task Achievement / Task Response ----------

function taskCriterion(
  kind: TaskKind,
  lower: string,
  words: number,
  minWords: number,
  promptText: string,
  paragraphs: number,
): CriterionResult {
  const points: Point[] = [];
  // Yetarli hajmdagi, tuzilgan matn 6.5 dan boshlanadi — keyin kuchli va
  // zaif tomonlariga qarab ko'tariladi yoki tushadi.
  let band = 6.5;

  // Hajm — eng qattiq talab.
  if (words === 0) {
    points.push({ ok: false, text: "Matn bo'sh." });
    band = 4;
  } else if (words < minWords) {
    const share = words / minWords;
    const missing = minWords - words;
    points.push({
      ok: false,
      text: `${words} so'z — ${missing} ta yetishmayapti (kamida ${minWords}). IELTS da hajm yetmasa bu mezon qattiq tushadi.`,
    });
    band -= share < 0.7 ? 2.5 : share < 0.9 ? 1.5 : 1;
  } else {
    points.push({ ok: true, text: `${words} so'z — talab (${minWords}) bajarildi.` });
    if (words >= minWords * 1.15) band += 0.5;
  }

  if (kind === "task1") {
    // Umumiy xulosa (overview) — 7 dan yuqori ball uchun shart.
    const hasOverview =
      /\boverall\b|\bin general\b|\bgenerally\b|\bit is clear\b|\bclearly\b|\bon the whole\b|\bbroadly\b/.test(lower) ||
      /\bthe most (striking|noticeable|obvious|significant|apparent)\b/.test(lower) ||
      /\b(in summary|to summarise|what stands out)\b/.test(lower);
    points.push(
      hasOverview
        ? { ok: true, text: "Umumiy xulosa (overview) bor — bu 7+ ball uchun shart." }
        : { ok: false, text: "Overview yo'q. “Overall, …” bilan boshlanadigan umumiy xulosa qo'shing." },
    );
    if (hasOverview) band += 0.5;
    else band -= 0.5;

    // Tendensiya so'zlari
    const trendCount = TREND_WORDS.filter((w) => countOccurrences(lower, w) > 0).length;
    points.push(
      trendCount >= 5
        ? { ok: true, text: `Tendensiya so'zlari yaxshi ishlatilgan (${trendCount} xil).` }
        : { ok: false, text: `Tendensiya so'zlari kam (${trendCount} xil). rose, fell, sharply, gradually kabi so'zlardan foydalaning.` },
    );
    if (trendCount >= 5) band += 0.5;

    // Raqamlar bilan qo'llab-quvvatlash
    const numbers = (lower.match(/\d+([.,]\d+)?\s*(%|per cent|percent|million|thousand)?/g) ?? []).length;
    points.push(
      numbers >= 4
        ? { ok: true, text: "Ma'lumotlar raqamlar bilan qo'llab-quvvatlangan." }
        : { ok: false, text: "Aniq raqamlar kam. Asosiy ko'rsatkichlarni raqam bilan keltiring." },
    );
    if (numbers >= 4) band += 0.5;
    else band -= 0.5;

    // Task 1 da shaxsiy fikr bo'lmasligi kerak
    const hasOpinion = hasAny(lower, OPINION_WORDS);
    points.push(
      hasOpinion
        ? { ok: false, text: "Task 1 da shaxsiy fikr yozilmaydi — “I think”, “In my opinion” ni olib tashlang." }
        : { ok: true, text: "Shaxsiy fikr yo'q — Task 1 uchun to'g'ri." },
    );
    if (hasOpinion) band -= 1;
  } else {
    // Task 2 — aniq pozitsiya
    const hasPosition =
      /\b(i (strongly |firmly |personally )?(believe|think|agree|disagree|would argue|feel|maintain|contend))\b/.test(lower) ||
      /\b(in my (opinion|view)|from my (point of view|perspective)|to my mind|as far as i am concerned)\b/.test(lower) ||
      /\bthis essay (will )?(argue|discuss|examine|explore)\b/.test(lower) ||
      /\b(i am convinced|my own view|personally,)/.test(lower);
    points.push(
      hasPosition
        ? { ok: true, text: "Pozitsiyangiz aniq bildirilgan." }
        : { ok: false, text: "Pozitsiya aniq emas. Kirishda fikringizni aniq ayting va oxirigacha o'zgartirmang." },
    );
    band += hasPosition ? 0.5 : -0.5;

    // Misollar
    const hasExamples = hasAny(lower, LINKERS.misol);
    points.push(
      hasExamples
        ? { ok: true, text: "Fikrlar misollar bilan asoslangan." }
        : { ok: false, text: "Misol yo'q. “For example, …” bilan har bir asosiy fikrga misol keltiring." },
    );
    band += hasExamples ? 0.5 : -0.5;

    // Xulosa
    const hasConclusion = hasAny(lower, LINKERS.xulosa);
    points.push(
      hasConclusion
        ? { ok: true, text: "Xulosa qismi bor." }
        : { ok: false, text: "Xulosa yo'q. “In conclusion, …” bilan yakunlang." },
    );
    band += hasConclusion ? 0.5 : -0.5;

    // Barcha qismlarga javob — savoldagi savol belgilari soni bilan taqqoslaymiz
    const questionParts = (promptText.match(/\?/g) ?? []).length;
    if (questionParts >= 2) {
      points.push({
        ok: paragraphs >= 4,
        text:
          paragraphs >= 4
            ? "Savolning ikkala qismi ham yoritilganga o'xshaydi."
            : "Savolda ikkita qism bor — har biriga alohida xatboshi ajrating.",
      });
      if (paragraphs < 4) band -= 0.5;
    }
  }

  return { key: "task", title: kind === "task1" ? "Task Achievement" : "Task Response", band: clampBand(band), points };
}

// ---------- 2. Coherence and Cohesion ----------

function coherenceCriterion(lower: string, paragraphs: number, sentences: number): CriterionResult {
  const points: Point[] = [];
  let band = 6.5;

  // Xatboshilar
  if (paragraphs >= 4) {
    points.push({ ok: true, text: `${paragraphs} ta xatboshi — tuzilma aniq.` });
    band += 0.5;
  } else if (paragraphs >= 2) {
    points.push({ ok: false, text: `${paragraphs} ta xatboshi. Kirish, 2 ta asosiy qism va xulosa bo'lsin.` });
    band -= 0.5;
  } else {
    points.push({ ok: false, text: "Matn xatboshilarga bo'linmagan. Har bir fikrni yangi qatordan boshlang." });
    band -= 1;
  }

  // Bog'lovchilar turlari
  const usedGroups = Object.entries(LINKERS).filter(([, list]) => hasAny(lower, list));
  const totalLinkers = Object.values(LINKERS)
    .flat()
    .reduce((sum, w) => sum + countOccurrences(lower, w), 0);

  if (usedGroups.length >= 4) {
    points.push({ ok: true, text: `Bog'lovchilar xilma-xil (${usedGroups.length} xil guruh).` });
    band += 0.5;
  } else {
    points.push({
      ok: false,
      text: `Bog'lovchilar kam (${usedGroups.length} xil guruh). however, as a result, for example, in conclusion dan foydalaning.`,
    });
    band -= 0.5;
  }

  // Haddan ortiq ishlatish ham xato
  if (sentences > 0 && totalLinkers / sentences > 0.9) {
    points.push({ ok: false, text: "Bog'lovchilar haddan ortiq ko'p — matn sun'iy eshitiladi." });
    band -= 0.5;
  }

  // Ishora so'zlari
  const refCount = REFERENCES.filter((w) => countOccurrences(lower, w) > 0).length;
  points.push(
    refCount >= 4
      ? { ok: true, text: "Ishora so'zlari (this, these, such) fikrlarni bog'lab turibdi." }
      : { ok: false, text: "Ishora so'zlari kam. this, these, such, which bilan gaplarni bog'lang." },
  );
  if (refCount >= 4) band += 0.5;

  return { key: "coherence", title: "Coherence and Cohesion", band: clampBand(band), points };
}

// ---------- 3. Lexical Resource ----------

function lexicalCriterion(lower: string, clean: string[], promptText: string): CriterionResult {
  const points: Point[] = [];
  let band = 6.5;

  // Lug'at xilma-xilligi
  const unique = new Set(clean).size;
  const ratio = clean.length > 0 ? unique / clean.length : 0;
  if (ratio >= 0.5) {
    points.push({ ok: true, text: `Lug'at xilma-xil (${Math.round(ratio * 100)}% noyob so'z).` });
    band += 0.5;
  } else if (ratio >= 0.4) {
    points.push({ ok: false, text: `So'zlar biroz takrorlanyapti (${Math.round(ratio * 100)}% noyob). Sinonimlardan foydalaning.` });
  } else {
    points.push({ ok: false, text: `So'zlar ko'p takrorlanyapti (${Math.round(ratio * 100)}% noyob). Sinonim va parafraz ishlating.` });
    band -= 0.5;
  }

  // Kam uchraydigan so'zlar: ro'yxatdagilar + akademik shakldagilar
  const fromList = ADVANCED.filter((w) => countOccurrences(lower, w) > 0);
  const byShape = advancedCount(clean);
  const advancedTotal = Math.max(fromList.length, byShape);
  points.push(
    advancedTotal >= 4
      ? {
          ok: true,
          text: `Kengroq lug'at ishlatilgan (${advancedTotal} ta)${fromList.length ? `: ${fromList.slice(0, 4).join(", ")}` : ""}.`,
        }
      : { ok: false, text: "Kam uchraydigan so'zlar oz. significant, crucial, beneficial, consequently kabi so'zlarni qo'shing." },
  );
  if (advancedTotal >= 12) band += 1;
  else if (advancedTotal >= 5) band += 0.5;
  else band -= 0.5;

  // Juda sodda so'zlar
  const basic = BASIC_WORDS.filter((w) => countOccurrences(lower, w) >= 4);
  if (basic.length >= 3) {
    points.push({ ok: false, text: `Sodda so'zlar ko'p takrorlangan: ${basic.slice(0, 3).join(", ")}. Aniqroq so'z tanlang.` });
    band -= 0.5;
  }

  // Savoldan ko'chirish
  const promptWords = new Set(
    promptText
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z]/g, ""))
      .filter((w) => w.length > 6),
  );
  const copied = [...promptWords].filter((w) => countOccurrences(lower, w) >= 3);
  points.push(
    copied.length <= 2
      ? { ok: true, text: "Savoldagi so'zlar o'z so'zingiz bilan aytilgan (parafraz)." }
      : { ok: false, text: `Savoldagi so'zlar ko'p takrorlangan: ${copied.slice(0, 3).join(", ")}. Parafraz qiling.` },
  );
  if (copied.length > 2) band -= 0.5;

  // Imlo
  const misspelled = Object.keys(MISSPELLINGS).filter((w) => countOccurrences(lower, w) > 0);
  if (misspelled.length > 0) {
    points.push({
      ok: false,
      text: `Imlo xatosi: ${misspelled.map((w) => `${w} → ${MISSPELLINGS[w]}`).slice(0, 3).join(", ")}.`,
    });
    band -= Math.min(1, misspelled.length * 0.5);
  } else {
    points.push({ ok: true, text: "Keng tarqalgan imlo xatolari topilmadi." });
  }

  return { key: "lexical", title: "Lexical Resource", band: clampBand(band), points };
}

// ---------- 4. Grammatical Range and Accuracy ----------

function grammarCriterion(lower: string, sentenceList: string[]): CriterionResult {
  const points: Point[] = [];
  let band = 6.5;

  const lengths = sentenceList.map((s) => s.split(/\s+/).filter(Boolean).length);
  const avg = lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const shortCount = lengths.filter((n) => n <= 8).length;
  const longCount = lengths.filter((n) => n >= 18).length;

  // Gap uzunligi xilma-xilligi
  if (lengths.length < 4) {
    points.push({ ok: false, text: "Gaplar juda kam — fikrni kengroq yozing." });
    band -= 1;
  } else if (shortCount > 0 && longCount > 0) {
    points.push({ ok: true, text: `Qisqa va uzun gaplar aralash (o'rtacha ${Math.round(avg)} so'z).` });
    band += 0.25;
  } else {
    points.push({
      ok: false,
      text: `Gaplar bir xil uzunlikda (o'rtacha ${Math.round(avg)} so'z). Qisqa va murakkab gaplarni aralashtiring.`,
    });
    band -= 0.5;
  }

  // Ergash gaplar
  const relative = ["which", "who", "whose", "that"].reduce((n, w) => n + countOccurrences(lower, w), 0);
  points.push(
    relative >= 3
      ? { ok: true, text: "Ergash gaplar (which, who, that) ishlatilgan." }
      : { ok: false, text: "Ergash gaplar kam. “…, which shows that…” kabi tuzilmalarni qo'shing." },
  );
  band += relative >= 3 ? 0.25 : -0.5;

  // Shart gaplar
  const conditional = /\bif\b|\bunless\b|would have|\bwere to\b/.test(lower);
  points.push(
    conditional
      ? { ok: true, text: "Shart gap ishlatilgan." }
      : { ok: false, text: "Shart gap yo'q. “If governments invested more, …” kabi gap qo'shing." },
  );
  band += conditional ? 0.25 : -0.25;

  // Majhul nisbat
  const passive =
    /\b(is|are|was|were|been|being|be)\s+\w+(ed|en)\b/.test(lower) ||
    /\b(is|are|was|were)\s+(made|given|taken|seen|done|known|shown|built|held|found|sent|spent|told|brought)\b/.test(lower);
  points.push(
    passive
      ? { ok: true, text: "Majhul nisbat (passive) ishlatilgan — rasmiy uslub uchun yaxshi." }
      : { ok: false, text: "Passive yo'q. “The data was collected…” kabi tuzilmani qo'shing." },
  );
  band += passive ? 0.25 : -0.25;

  // Tinish belgilari
  const commas = countOccurrences(lower, ",");
  if (sentenceList.length >= 5 && commas < sentenceList.length * 0.5) {
    points.push({ ok: false, text: "Vergul kam — murakkab gaplarda vergul qo'ying." });
    band -= 0.25;
  }

  return { key: "grammar", title: "Grammatical Range and Accuracy", band: clampBand(band), points };
}
