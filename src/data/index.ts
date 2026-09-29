import type { Level, Lesson, Word } from "@/types";
import { RAW_LEVELS } from "./courses";
import { WORDS } from "./words";

export { WORDS };
export { GRAMMAR } from "./grammar";

/**
 * Xom ma'lumotga hisoblangan maydonlarni qo'shadi:
 * har bir darsga noyob `id`, tegishli `module` va daraja ichidagi `index`.
 */
function buildLevels(): Level[] {
  return RAW_LEVELS.map((raw) => {
    const lessons: Lesson[] = [];
    const modules = raw.modules.map((mod, moduleIndex) => ({
      ...mod,
      lessons: mod.lessons.map((lesson, lessonIndex) => {
        const full: Lesson = {
          ...lesson,
          id: `${raw.id}-${moduleIndex}-${lessonIndex}`,
          module: moduleIndex,
          index: lessons.length,
        };
        lessons.push(full);
        return full;
      }),
    }));
    return { ...raw, modules, lessons };
  });
}

export const LEVELS: Level[] = buildLevels();

export const TOTAL_LESSONS = LEVELS.reduce((sum, lv) => sum + lv.lessons.length, 0);

/** Barcha darslardagi mashqlar soni — sertifikatda ko'rsatiladi. */
export const TOTAL_TASKS = LEVELS.reduce(
  (sum, lv) => sum + lv.lessons.reduce((n, lesson) => n + lesson.tasks.length, 0),
  0,
);

export function getLevel(id: string): Level | undefined {
  return LEVELS.find((lv) => lv.id === id);
}

export function getLesson(levelId: string, index: number): Lesson | undefined {
  return getLevel(levelId)?.lessons[index];
}

// ---------- Lug'at (tarjimon uchun) ----------

export const ALL_WORDS: Word[] = Object.values(WORDS).flat();

/** So'z qaysi mavzuga tegishli ekanini qaytaradi — tarjimon natijasida ko'rsatiladi. */
export const WORD_CATEGORY = new Map<string, string>(
  Object.entries(WORDS).flatMap(([category, list]) => list.map((w) => [w.en, category] as const)),
);
