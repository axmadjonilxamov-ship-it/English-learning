"use client";

import { Icon } from "@/components/Icon";
import { speak } from "@/lib/speech";
import { useT } from "@/lib/i18n";
import type { Lesson, Level, Task } from "@/types";

/** "Qoida" ilovasi: darsning qoidasi va misollari to'liq ko'rinishda. */
export function RulePanel({ lesson, level }: { lesson: Lesson; level: Level }) {
  const t = useT();
  const examples = collectExamples(lesson.tasks);

  return (
    <div className="flex-1 overflow-auto bg-[#151918] p-7 max-md:p-4">
      <div className="mx-auto max-w-[760px]">
        <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/5 p-6 max-md:p-4">
          <div className="flex items-start gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl border-2 border-white/10 bg-[#0b0f0d] text-3xl">
              {lesson.rule.icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl font-extrabold text-white">{lesson.rule.name}</h3>
              <p className="mt-1 font-mono text-blue-400">{lesson.rule.en}</p>
            </div>
          </div>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-slate-200">{lesson.rule.desc}</p>
        </div>

        <h4 className="mb-3 mt-7 text-sm font-extrabold uppercase tracking-[0.16em] text-slate-400">
          {t("lesson.explanation")}
        </h4>
        <p className="rounded-2xl bg-white/5 p-5 text-[1.05rem] leading-relaxed text-slate-200 max-md:p-4">
          {lesson.text}
        </p>

        {examples.length > 0 && (
          <>
            <h4 className="mb-3 mt-7 text-sm font-extrabold uppercase tracking-[0.16em] text-slate-400">
              {t("lesson.examples")}
            </h4>
            <div className="grid gap-2">
              {examples.map((ex, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <b className="block text-white">{ex.en}</b>
                    <span className="text-sm text-slate-400">{ex.uz}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speak(ex.en)}
                    aria-label={t("common.listen")}
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-blue-400"
                  >
                    <Icon name="volume" className="size-5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="mt-7 text-sm text-slate-500">
          {level.cefr} · {level.modules[lesson.module].name} · {lesson.index + 1}
        </p>
      </div>
    </div>
  );
}

/** "Lug'at" ilovasi: shu darsdagi barcha so'zlar. */
export function VocabPanel({ lesson }: { lesson: Lesson }) {
  const t = useT();
  const words = collectWords(lesson.tasks);

  return (
    <div className="flex-1 overflow-auto bg-[#151918] p-7 max-md:p-4">
      <div className="mx-auto max-w-[760px]">
        <h4 className="mb-3 text-sm font-extrabold uppercase tracking-[0.16em] text-slate-400">
          {t("lesson.wordsHere")}
        </h4>

        {words.length === 0 ? (
          <p className="rounded-2xl bg-white/5 p-5 text-slate-400">
            {t("lesson.noWords")}
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {words.map((w, i) => (
              <button
                key={i}
                type="button"
                onClick={() => speak(w.en)}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
              >
                <div className="min-w-0 flex-1">
                  <b className="block text-white">{w.en}</b>
                  <span className="text-sm text-slate-400">{w.uz}</span>
                </div>
                <Icon name="volume" className="size-4 shrink-0 text-slate-500" />
              </button>
            ))}
          </div>
        )}

        <p className="mt-6 text-sm text-slate-500">{t("lesson.tapToHear")}</p>
      </div>
    </div>
  );
}

// ---------- Darsdagi matnlarni yig'ish ----------

type Pair = { en: string; uz: string };

/** Mashqlardan to'liq gaplarni ajratib oladi. */
function collectExamples(tasks: Task[]): Pair[] {
  const out: Pair[] = [];
  for (const task of tasks) {
    if (task.t === "build") {
      out.push({ en: task.s + (task.end ?? "."), uz: task.uz });
    } else if (task.t === "choose") {
      const en = task.q.replace("___", task.a).replace(/\s*\(.*?\)/g, "").trim();
      const uz = task.uz.replace(/\s*\(.*?\)/g, "").trim();
      if (en && uz && !en.includes("___")) out.push({ en, uz });
    }
  }
  return out;
}

/** Mashqlardan alohida so'zlarni ajratib oladi. */
function collectWords(tasks: Task[]): Pair[] {
  const out: Pair[] = [];
  const seen = new Set<string>();
  const add = (en: string, uz: string) => {
    const key = en.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ en, uz });
  };

  for (const task of tasks) {
    if (task.t === "match") {
      for (const [en, uz] of task.pairs) add(en, uz);
    } else if (task.t === "listen") {
      add(task.w, task.uz);
    } else if (task.t === "choose") {
      // To'g'ri javob ham foydali so'z — variantlar ichidan faqat shuni olamiz.
      if (!task.a.includes(" ")) add(task.a, task.uz);
    }
  }
  return out;
}
