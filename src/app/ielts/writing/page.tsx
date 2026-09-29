"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { TaskChart } from "@/components/ielts/TaskChart";
import {
  TASK1_MINUTES,
  TASK1_PROMPTS,
  TASK2_MINUTES,
  TASK2_PROMPTS,
  type Task1Prompt,
  type Task2Prompt,
} from "@/data/ielts-writing";
import { analyse, type WritingAnalysis } from "@/lib/writing-analysis";
import { shuffle } from "@/lib/shuffle";
import { useLang } from "@/lib/i18n";

type Kind = "task1" | "task2";

const DRAFT_KEY = "englishup:ielts-writing";

export default function WritingPage() {
  const { t, lang } = useLang();
  const [kind, setKind] = useState<Kind>("task1");
  const [t1, setT1] = useState<Task1Prompt>(TASK1_PROMPTS[0]);
  const [t2, setT2] = useState<Task2Prompt>(TASK2_PROMPTS[0]);
  const [text, setText] = useState("");
  const [result, setResult] = useState<WritingAnalysis | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const minutes = kind === "task1" ? TASK1_MINUTES : TASK2_MINUTES;
  const promptText = kind === "task1" ? t1.prompt : t2.prompt;

  // Yozilganini saqlab boramiz — sahifa yopilsa ham yo'qolmasin.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setText(saved);
    } catch {
      // localStorage yopiq bo'lsa, shunchaki saqlanmaydi.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, text);
    } catch {
      // saqlab bo'lmasa ham yozishda davom etish mumkin.
    }
  }, [text]);

  // Taymer
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const words = useMemo(() => text.trim().split(/\s+/).filter((w) => /[a-zA-Z]/.test(w)).length, [text]);
  const minWords = kind === "task1" ? 150 : 250;
  const left = minutes * 60 - seconds;
  const overtime = left < 0;

  const newPrompt = () => {
    if (kind === "task1") setT1(shuffle(TASK1_PROMPTS.filter((p) => p.id !== t1.id))[0] ?? t1);
    else setT2(shuffle(TASK2_PROMPTS.filter((p) => p.id !== t2.id))[0] ?? t2);
    setResult(null);
  };

  const check = () => {
    setResult(analyse(text, kind, promptText));
    setRunning(false);
  };

  const restart = () => {
    setText("");
    setResult(null);
    setSeconds(0);
    setRunning(false);
    areaRef.current?.focus();
  };

  const clock = `${Math.floor(Math.abs(left) / 60)}:${String(Math.abs(left) % 60).padStart(2, "0")}`;

  return (
    <div className="anim-enter">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/ielts" className="text-sm font-semibold text-ink-muted hover:text-ink">
            ← {t("nav.ielts")}
          </Link>
          <h1 className="mt-1 text-[clamp(1.6rem,4vw,2.1rem)] font-extrabold tracking-tight">IELTS Writing</h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-xl px-3.5 py-2 font-mono text-lg font-bold ${
              overtime ? "bg-red-500/15 text-red-500" : running ? "bg-brand-500/10 text-brand-600 dark:text-brand-400" : "bg-surface-2"
            }`}
          >
            {overtime ? "+" : ""}
            {clock}
          </span>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="rounded-xl border border-line bg-surface px-4 py-2 font-bold transition hover:bg-surface-2"
          >
            {running ? t("ielts.pause") : seconds ? t("ielts.resume") : t("common.start")}
          </button>
        </div>
      </div>

      {/* Topshiriq turi */}
      <div className="mb-4 flex gap-2">
        {(
          [
            ["task1", `Task 1 · ${TASK1_MINUTES} ${t("common.minutes")} · 150+ ${t("common.words")}`],
            ["task2", `Task 2 · ${TASK2_MINUTES} ${t("common.minutes")} · 250+ ${t("common.words")}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setKind(id);
              setResult(null);
            }}
            className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
              kind === id ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400" : "border-line bg-surface hover:bg-surface-2"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Topshiriq */}
        <div className="card p-5 max-md:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-extrabold">{t("ielts.task")}</h2>
            <button
              type="button"
              onClick={newPrompt}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-sm font-bold transition hover:bg-surface-2"
            >
              <Icon name="refresh" className="size-4" /> {t("ielts.another")}
            </button>
          </div>

          {kind === "task1" ? (
            <>
              <p className="whitespace-pre-line text-[1.05rem] leading-relaxed">{t1.prompt}</p>
              <div className="mt-4">
                <TaskChart chart={t1.chart} />
              </div>
            </>
          ) : (
            <>
              <span className="inline-block rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ink-muted">
                {t2.type}
              </span>
              <p className="mt-3 whitespace-pre-line text-[1.05rem] leading-relaxed">{t2.prompt}</p>
              <p className="mt-3 text-sm italic text-ink-muted">{t2.hint[lang]}</p>
            </>
          )}
        </div>

        {/* Yozish maydoni */}
        <div className="card flex flex-col p-5 max-md:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-extrabold">{t("ielts.yourAnswer")}</h2>
            <span className={`text-sm font-bold ${words >= minWords ? "text-green-600" : "text-ink-muted"}`}>
              {words} / {minWords} {t("common.words")}
            </span>
          </div>

          <textarea
            ref={areaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (!running && e.target.value.length === 1) setRunning(true);
            }}
            placeholder={
              kind === "task1"
                ? "The chart illustrates…\n\nOverall, …"
                : "In recent years, …\n\nFirstly, …\n\nIn conclusion, …"
            }
            spellCheck={false}
            className="min-h-[340px] flex-1 resize-y rounded-xl border border-line bg-surface-2 p-4 font-serif text-[1.05rem] leading-relaxed outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={check}
              disabled={words < 20}
              className="flex-1 rounded-2xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-500 disabled:opacity-40"
            >
              {t("common.check")}
            </button>
            <button
              type="button"
              onClick={restart}
              className="rounded-2xl border border-line px-5 py-3 font-bold transition hover:bg-surface-2"
            >
              {t("common.clear")}
            </button>
          </div>
          {words < 20 && <p className="mt-2 text-xs text-ink-muted">{t("ielts.min20Words")}</p>}
        </div>
      </div>

      {/* Natija */}
      {result && <Result result={result} />}
    </div>
  );
}

function Result({ result }: { result: WritingAnalysis }) {
  const t = useLang().t;
  const colour = (band: number) =>
    band >= 7 ? "text-green-600" : band >= 6 ? "text-amber-500" : "text-red-500";

  return (
    <div className="anim-enter mt-6">
      <div className="card p-6 max-md:p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <div className={`font-mono text-[3.5rem] font-extrabold leading-none ${colour(result.overall)}`}>
              {result.overall.toFixed(1)}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-ink-muted">{t("ielts.estimate")}</div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            {[
              [t("common.words"), `${result.words} / ${result.minWords}`],
              [t("ielts.sentences"), result.sentences],
              [t("ielts.paragraphs"), result.paragraphs],
            ].map(([label, value]) => (
              <div key={label}>
                <b className="block text-xl">{value}</b>
                <span className="text-ink-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          {t("ielts.disclaimer")}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {result.criteria.map((c) => (
          <div key={c.key} className="card p-5 max-md:p-4">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="font-extrabold">{c.title}</h3>
              <span className={`font-mono text-2xl font-extrabold ${colour(c.band)}`}>{c.band.toFixed(1)}</span>
            </div>
            <ul className="grid gap-2">
              {c.points.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-0.5 shrink-0 ${p.ok ? "text-green-600" : "text-amber-500"}`}>
                    {p.ok ? "✓" : "!"}
                  </span>
                  <span className={p.ok ? "text-ink-muted" : ""}>{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
