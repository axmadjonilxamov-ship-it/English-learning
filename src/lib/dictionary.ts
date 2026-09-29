import { ALL_WORDS, GRAMMAR, LEVELS, WORD_CATEGORY } from "@/data";

export type DictionaryEntry = {
  en: string;
  uz: string;
  /** Transkripsiya — faqat lug'atdagi so'zlarda bo'ladi. */
  tr?: string;
  /** Misol gap. */
  ex?: string;
  /** Mavzu yoki dars nomi — natija qayerdan olingani. */
  source?: string;
};

/** Qidiruv uchun matnni soddalashtiradi: registr, apostrof va tinish belgilari e'tiborsiz. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[.,!?;:"“”()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildIndex(): Map<string, DictionaryEntry[]> {
  const index = new Map<string, DictionaryEntry[]>();

  const add = (entry: DictionaryEntry) => {
    for (const key of [normalize(entry.en), normalize(entry.uz)]) {
      if (!key) continue;
      const list = index.get(key) ?? [];
      // Bir xil juftlik ikki marta tushmasin.
      if (!list.some((e) => e.en === entry.en && e.uz === entry.uz)) list.push(entry);
      index.set(key, list);
    }
  };

  // 1. Lug'at so'zlari — eng to'liq ma'lumot (transkripsiya va misol bilan).
  for (const word of ALL_WORDS) {
    add({ en: word.en, uz: word.uz, tr: word.tr, ex: word.ex, source: WORD_CATEGORY.get(word.en) });
  }

  // 2. Darslardagi gaplar — foydalanuvchi aynan shularni o'rganyapti.
  for (const level of LEVELS) {
    for (const lesson of level.lessons) {
      const source = `${level.name} · ${lesson.title}`;
      for (const task of lesson.tasks) {
        if (task.t === "build") {
          add({ en: task.s, uz: task.uz, source });
        } else if (task.t === "choose") {
          // Bo'sh joyni to'g'ri javob bilan to'ldiramiz va qavs ichidagi izohni olib tashlaymiz.
          const en = task.q.replace("___", task.a).replace(/\s*\(.*?\)/g, "").trim();
          const uz = task.uz.replace(/\s*\(.*?\)/g, "").trim();
          if (en && uz && !en.includes("___")) add({ en, uz, source });
        } else if (task.t === "listen") {
          add({ en: task.w, uz: task.uz, source });
        } else if (task.t === "match") {
          for (const [en, uz] of task.pairs) add({ en, uz, source });
        }
      }
    }
  }

  // 3. Grammatika misollari.
  for (const topic of GRAMMAR) {
    for (const [en, uz] of topic.examples) add({ en, uz, source: topic.title });
  }

  return index;
}

let cache: Map<string, DictionaryEntry[]> | null = null;

function index() {
  if (!cache) cache = buildIndex();
  return cache;
}

/** Aniq mos kelgan tarjimalarni qaytaradi (ikkala yo'nalishda ham qidiradi). */
export function lookup(query: string): DictionaryEntry[] {
  return index().get(normalize(query)) ?? [];
}

/** Yozib turganda taklif qilinadigan so'zlar. */
export function suggest(query: string, limit = 6): DictionaryEntry[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const starts: DictionaryEntry[] = [];
  const contains: DictionaryEntry[] = [];

  for (const word of ALL_WORDS) {
    const entry: DictionaryEntry = {
      en: word.en,
      uz: word.uz,
      tr: word.tr,
      ex: word.ex,
      source: WORD_CATEGORY.get(word.en),
    };
    const en = normalize(word.en);
    const uz = normalize(word.uz);
    if (en === q || uz === q) continue;
    if (en.startsWith(q) || uz.startsWith(q)) starts.push(entry);
    else if (en.includes(q) || uz.includes(q)) contains.push(entry);
  }
  return [...starts, ...contains].slice(0, limit);
}

/** Matn asosan lotin-inglizchami yoki o'zbekchami — yo'nalishni avtomatik topish uchun. */
export function looksUzbek(text: string): boolean {
  const t = normalize(text);
  if (!t) return false;
  // O'zbek tiliga xos harflar va keng tarqalgan qo'shimchalar.
  if (/[‘'`]/.test(text) && /\b\w+(ning|dan|ga|da|ni|lar|man|siz|di|moqchi)\b/.test(t)) return true;
  if (/\b(men|sen|biz|siz|ular|bu|shu|va|uchun|bilan|emas|yo'q|bor|qanday|nima|kim)\b/.test(t)) return true;
  const uzSuffix = /\w+(lar|ning|dan|ga|da|ni|man|miz|siz|moqchi|yapti|gan|di)\b/g;
  const words = t.split(" ").filter(Boolean);
  const hits = (t.match(uzSuffix) ?? []).length;
  return words.length > 0 && hits / words.length > 0.5;
}
