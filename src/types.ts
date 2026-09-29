/** Bo'sh joyni to'g'ri so'z bilan to'ldirish. `q` ichida `___` bo'lishi shart. */
export type TaskChoose = {
  t: "choose";
  q: string;
  opts: string[];
  a: string;
  uz: string;
};

/** So'zlarni bosib, to'g'ri gap tuzish. */
export type TaskBuild = {
  t: "build";
  s: string;
  /** Gap oxiridagi tinish belgisi — berilmasa nuqta qo'yiladi. */
  end?: string;
  uz: string;
};

/** Inglizcha so'zni o'zbekcha tarjimasi bilan juftlash. */
export type TaskMatch = {
  t: "match";
  pairs: [en: string, uz: string][];
};

/** So'zni tinglab, inglizcha yozish. */
export type TaskListen = {
  t: "listen";
  w: string;
  uz: string;
};

export type Task = TaskChoose | TaskBuild | TaskMatch | TaskListen;
export type TaskKind = Task["t"];

/** Darsdagi qoida kartochkasi. */
export type Rule = {
  icon: string;
  name: string;
  en: string;
  desc: string;
};

export type RawLesson = {
  title: string;
  en: string;
  /** Taxminiy davomiyligi, daqiqada. */
  min: number;
  text: string;
  rule: Rule;
  tasks: Task[];
};

/** Hisoblangan maydonlar bilan to'ldirilgan dars. */
export type Lesson = RawLesson & {
  /** Global noyob id, masalan "beginner-1-0" — progress shu bo'yicha saqlanadi. */
  id: string;
  /** Qaysi modulga tegishli (modules massividagi indeks). */
  module: number;
  /** Daraja ichidagi tartib raqami. */
  index: number;
};

export type RawModule = {
  name: string;
  /** Shaharchadagi bino ustidagi qisqa nom. */
  short: string;
  icon: string;
  lessons: RawLesson[];
};

export type Module = Omit<RawModule, "lessons"> & { lessons: Lesson[] };

export type RawLevel = {
  id: string;
  name: string;
  /** To'liq nomi, qisqartma ishlatilgan bo'lsa (Pre-Inter → Pre-Intermediate). */
  full?: string;
  cefr: string;
  /** Shaharchadagi uchta binoning rangi. */
  palette: [string, string, string];
  modules: RawModule[];
};

export type Level = Omit<RawLevel, "modules"> & {
  modules: Module[];
  /** Barcha modullardagi darslar, ketma-ket. */
  lessons: Lesson[];
};

/** Lug'at so'zi. */
export type Word = {
  en: string;
  uz: string;
  /** Transkripsiya, masalan /ˈfæməli/ */
  tr: string;
  /** Misol gap. */
  ex: string;
};

export type GrammarTopic = {
  title: string;
  text: string;
  formula: string;
  examples: [en: string, uz: string][];
};

/** Foydalanuvchining saqlanadigan holati. */
export type ProgressState = {
  /** Tugatilgan darslar id'lari. */
  lessons: string[];
};
