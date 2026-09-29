"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { SpotContext, type Spot } from "./shell";
import { TaskView, TaskInstruction, taskSentence, type TaskHandle } from "./tasks";
import { RulePanel, VocabPanel } from "./panels";
import { LEVELS } from "@/data";
import { useProgress } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { useT } from "@/lib/i18n";
import type { Level, Lesson } from "@/types";

export function LessonClient({ level, lesson }: { level: Level; lesson: Lesson }) {
  const router = useRouter();
  const { completeLesson } = useProgress();
  const t = useT();

  const [step, setStep] = useState(0);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind: "ok" | "bad" } | null>(null);
  const [spot, setSpot] = useState<Spot>({ target: null, nonce: 0 });
  const [finished, setFinished] = useState(false);
  const [tab, setTab] = useState<"mashq" | "qoida" | "lugat">("mashq");
  const taskRef = useRef<TaskHandle>(null);

  const task = lesson.tasks[step];
  const isLast = step === lesson.tasks.length - 1;
  const mod = level.modules[lesson.module];

  const highlight = (target: "ribbon" | "paper") => {
    // Kerakli joy faqat "Mashq" bo'limida ko'rinadi.
    setTab("mashq");
    setSpot((s) => ({ target, nonce: s.nonce + 1 }));
  };

  const handleSolved = () => {
    setSolved(true);
    setMessage({ text: t("common.correct"), kind: "ok" });
    if (task.t !== "listen") speak(taskSentence(task));
  };

  const next = () => {
    if (!solved) return;
    if (!isLast) {
      setStep(step + 1);
      setSolved(false);
      setMessage(null);
      return;
    }
    completeLesson(lesson.id);
    setFinished(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && solved && !finished && !(e.target as HTMLElement)?.matches?.("input")) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const nextLesson = level.lessons[lesson.index + 1];
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const afterHref = nextLesson
    ? `/lesson/${level.id}/${nextLesson.index}`
    : nextLevel
      ? `/path/${nextLevel.id}`
      : `/path/${level.id}`;
  const afterLabel = nextLesson
    ? t("lesson.nextLesson")
    : nextLevel
      ? `${nextLevel.name} ${t("lesson.nextLevel")}`
      : `${t("lesson.backToPath")} →`;

  const dots = useMemo(
    () =>
      lesson.tasks.map((_, i) => (i < step || (i === step && solved) ? "done" : i === step ? "current" : "todo")),
    [lesson.tasks, step, solved],
  );

  return (
    <SpotContext.Provider value={spot}>
      <div className="anim-enter -mx-4 -mt-10 grid min-h-[calc(100vh-90px)] grid-cols-[64px_minmax(320px,440px)_1fr] grid-rows-[1fr_auto] bg-[#0b100e] text-gray-200 max-xl:grid-cols-[64px_1fr] max-md:-mt-7 max-md:grid-cols-1">
        {/* Chap chiziq */}
        <aside className="row-span-2 flex flex-col items-center gap-5 border-r border-white/6 bg-[#0d1311] py-4.5 py-[18px] max-xl:row-span-3 max-md:row-span-1 max-md:flex-row max-md:gap-4 max-md:border-b max-md:border-r-0 max-md:px-4 max-md:py-2.5">
          <button
            type="button"
            onClick={() => router.push(`/path/${level.id}`)}
            aria-label={t("lesson.backToPath")}
            className="grid size-[42px] place-items-center rounded-xl border border-white/8 bg-[#121a24] text-white transition hover:bg-slate-700"
          >
            <Icon name="left" />
          </button>
          <div className="font-extrabold tracking-wider text-blue-500 [writing-mode:vertical-rl] max-md:[writing-mode:horizontal-tb]">
            {level.name}
          </div>
          <div className="flex flex-col gap-3.5 max-md:flex-row">
            {dots.map((state, i) => (
              <i
                key={i}
                className={`size-2.5 rounded-full transition ${
                  state === "done"
                    ? "bg-green-500"
                    : state === "current"
                      ? "bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,.25)]"
                      : "bg-slate-700"
                }`}
              />
            ))}
          </div>
          <div className="mt-auto text-lg font-extrabold max-md:ml-auto max-md:mt-0">{lesson.index + 1}</div>
        </aside>

        {/* Tushuntirish */}
        <div className="border-r border-white/5 bg-gradient-to-b from-[#0f1814] to-[#0b100e] px-8 pb-8 pt-14 max-xl:col-start-2 max-xl:border-r-0 max-xl:pb-2 max-xl:pt-8 max-md:col-start-1 max-md:px-4 max-md:pt-6">
          <span className="inline-block rounded-lg bg-blue-500/15 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-blue-400">
            {level.cefr} · {mod.name}
          </span>
          <h1 className="mb-3 mt-3.5 text-[clamp(1.9rem,3vw,2.5rem)] font-extrabold text-white">{lesson.title}</h1>
          <p className="text-[1.08rem] leading-relaxed text-slate-300">{lesson.text}</p>

          <div className="mt-6.5 mt-[26px] rounded-[1.25rem] border-[1.5px] border-yellow-500/50 bg-yellow-500/4 bg-yellow-500/[0.04] p-5.5 p-[22px]">
            <div className="text-[0.82rem] font-extrabold tracking-[0.16em] text-yellow-400">{t("lesson.ruleHeading")}</div>
            <div className="my-3.5 flex gap-4 rounded-2xl border border-white/6 bg-black/30 p-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl border-2 border-white/8 bg-[#0b0f0d] text-[1.7rem]">
                {lesson.rule.icon}
              </div>
              <div>
                <b className="text-[1.1rem] text-white">{lesson.rule.name}</b>
                <div className="mt-0.5 text-sm text-slate-400">
                  <b className="text-sm text-blue-400">{lesson.rule.en}</b> · {lesson.en}
                </div>
                <p className="mb-3 mt-1.5 text-slate-300">{lesson.rule.desc}</p>
                <button
                  type="button"
                  onClick={() => highlight("ribbon")}
                  className="rounded-full border-[1.5px] border-yellow-500 bg-yellow-500/10 px-4 py-1.5 font-bold text-yellow-400 transition hover:bg-yellow-500/20"
                >
                  {t("lesson.show")}
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              {t("lesson.spotNote")}
            </p>
          </div>

          <div className="mt-4.5 mt-[18px] rounded-[1.25rem] border-[1.5px] border-yellow-500/45 bg-gradient-to-b from-yellow-500/10 to-yellow-500/3 px-5.5 px-[22px] py-5">
            <div className="flex items-center gap-3 text-[0.82rem] font-extrabold tracking-[0.16em] text-yellow-400">
              {t("lesson.taskHeading")}
              <button
                type="button"
                onClick={() => highlight("paper")}
                className="rounded-full border border-blue-500 bg-blue-500/12 px-2.5 py-0.5 text-[0.78rem] font-bold tracking-normal text-blue-300"
              >
                {t("lesson.whereShow")}
              </button>
            </div>
            <p className="mt-3 text-[1.08rem] text-slate-200">
              <TaskInstruction task={task} />
            </p>
          </div>
        </div>

        {/* Mashq oynasi */}
        <div className="flex p-6 pb-3 max-xl:col-span-2 max-xl:col-start-2 max-md:col-span-1 max-md:col-start-1 max-md:px-2 max-md:py-4">
          <div className="relative flex min-h-[560px] flex-1 flex-col overflow-hidden rounded-[14px] border border-white/8 bg-[#1b1f1e] shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)] max-md:min-h-0">
            <div className="flex h-[38px] items-center bg-gray-100 px-3.5">
              <span className="flex gap-[7px]">
                <i className="size-[11px] rounded-full bg-[#ff5f57]" />
                <i className="size-[11px] rounded-full bg-[#febc2e]" />
                <i className="size-[11px] rounded-full bg-[#28c840]" />
              </span>
              <span className="mr-12 flex-1 truncate text-center text-sm text-gray-400 max-md:mr-0">
                {level.id}-{lesson.index + 1}.lesson — English Learning Center
              </span>
            </div>
            <div className="flex gap-7 bg-[#1f2322] px-6 pt-3 max-md:gap-5 max-md:px-4">
              {([
                ["mashq", "lesson.tabExercise"],
                ["qoida", "lesson.tabRule"],
                ["lugat", "lesson.tabWords"],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  aria-current={tab === id ? "page" : undefined}
                  className={`border-b-[3px] pb-2 text-[1.05rem] transition ${
                    tab === id
                      ? "border-blue-500 font-bold text-blue-400"
                      : "border-transparent text-gray-200 hover:text-white"
                  }`}
                >
                  {t(label)}
                </button>
              ))}
            </div>

            <div className={`flex flex-1 flex-col ${tab === "mashq" ? "" : "hidden"}`}>
              <TaskView
                key={`${lesson.id}-${step}`}
                ref={taskRef}
                task={task}
                heading={lesson.en}
                onSolved={handleSolved}
                onWrong={(text) => setMessage({ text, kind: "bad" })}
              />
            </div>
            {tab === "qoida" && <RulePanel lesson={lesson} level={level} />}
            {tab === "lugat" && <VocabPanel lesson={lesson} />}

            <div className="flex h-11 items-center gap-4 bg-gray-100 px-4.5 px-[18px] text-sm text-gray-500">
              <button type="button" onClick={() => speak(taskSentence(task))} className="font-semibold text-blue-600">
                + {t("common.listen")}
              </button>
              <span className={`font-bold ${message?.kind === "ok" ? "text-green-600" : "text-red-600"}`}>
                {message?.text}
              </span>
              <span className="ml-auto whitespace-nowrap">
                {t("lesson.step")} {step + 1} / {lesson.tasks.length}
              </span>
            </div>

            {finished && (
              <div className="absolute inset-0 grid place-items-center bg-[#060a09]/75 p-4 backdrop-blur-sm">
                <div className="max-w-[420px] rounded-3xl border border-green-500/35 bg-[#111a17] p-9 text-center text-white">
                  <div className="mx-auto mb-4.5 mb-[18px] grid size-[84px] place-items-center rounded-full bg-green-500 shadow-[0_0_0_10px_rgba(34,197,94,.15)]">
                    <Icon name="check" className="size-10" strokeWidth={3} />
                  </div>
                  <h3 className="text-2xl font-extrabold">{t("lesson.done")}</h3>
                  <p className="mb-6 mt-2 text-slate-400">
                    “{lesson.title}” — {lesson.tasks.length} {t("lesson.doneText")}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    <Link
                      href={`/path/${level.id}`}
                      className="rounded-2xl border border-white/12 bg-white/5 px-5 py-3 font-bold transition hover:bg-white/10"
                    >
                      {t("lesson.backToPath")}
                    </Link>
                    <Link
                      href={afterHref}
                      className="rounded-2xl bg-brand-600 px-5 py-3 font-bold text-white transition hover:bg-brand-500"
                    >
                      {afterLabel}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pastki panel */}
        <div className="sticky bottom-0 z-20 col-start-2 flex items-center justify-between gap-3 border-t border-white/6 bg-[#0b100e]/92 px-6 py-3 backdrop-blur max-xl:col-span-2 max-md:col-span-1 max-md:col-start-1 max-md:bottom-[84px] max-md:mx-2 max-md:rounded-2xl max-md:border max-md:border-white/8 max-md:px-4">
          <span
            aria-hidden="true"
            className="size-[38px] rounded-full border-2 border-green-500/50 bg-[radial-gradient(circle,#22c55e_0_7px,transparent_8px)] max-md:hidden"
          />
          <div className="ml-auto flex gap-2.5">
            <button
              type="button"
              onClick={() => taskRef.current?.help()}
              disabled={solved}
              className="rounded-2xl border border-white/12 bg-white/5 px-[1.15rem] py-2.5 font-bold text-gray-200 transition hover:bg-white/10 disabled:opacity-40"
            >
              {t("common.help")}
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!solved || finished}
              className={`rounded-2xl bg-brand-600 px-[1.15rem] py-2.5 font-bold text-white transition hover:bg-brand-500 disabled:pointer-events-none disabled:opacity-40 ${
                solved && !finished ? "animate-pulse" : ""
              }`}
            >
              {isLast ? t("lesson.finish") : t("lesson.nextArrow")}
            </button>
          </div>
        </div>
      </div>
    </SpotContext.Provider>
  );
}
