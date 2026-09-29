"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { TRAFFIC_QUIZ, type TrafficQuestion } from "@/data/traffic-quiz";
import { PASS_SCORE } from "@/lib/enforcement";
import { seededShuffle } from "@/lib/shuffle";
import { useT } from "@/lib/i18n";

const LENGTH = 10;

/**
 * Qizil chiroqdan o'tgandan keyin chiqadigan test.
 * 80% dan yuqori bo'lsa — politsiya orqadan qoladi. Aks holda ekran bloklanadi.
 */
export function TrafficQuizModal({
  seed,
  violations,
  onFinish,
}: {
  /** Har safar boshqa savollar chiqishi uchun. */
  seed: string;
  violations: number;
  onFinish: (percent: number) => void;
}) {
  const t = useT();
  const questions = useMemo<TrafficQuestion[]>(
    () =>
      seededShuffle(TRAFFIC_QUIZ, seed)
        .slice(0, LENGTH)
        .map((q, i) => ({ ...q, options: seededShuffle(q.options, `${seed}:${i}`) })),
    [seed],
  );

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const question = questions[index];
  const percent = Math.round((correct / questions.length) * 100);

  const choose = (option: string) => {
    if (picked) return;
    setPicked(option);
    const ok = option === question.answer;
    const score = correct + (ok ? 1 : 0);
    if (ok) setCorrect(score);

    setTimeout(() => {
      if (index + 1 >= questions.length) {
        setDone(true);
        onFinish(Math.round((score / questions.length) * 100));
      } else {
        setIndex(index + 1);
        setPicked(null);
      }
    }, ok ? 650 : 1400);
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[640px] overflow-hidden rounded-3xl border border-red-500/40 bg-[#12161a] text-gray-100 shadow-2xl">
        {/* Politsiya sarlavhasi */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-700 via-red-700 to-blue-700 px-6 py-4 max-md:px-4">
          <span className="text-3xl">🚓</span>
          <div className="min-w-0 flex-1">
            <b className="block text-lg">{t("block.policeStopped")}</b>
            <span className="text-sm text-white/80">
              {t("block.ranRed")} · {violations}{t("block.time")}
            </span>
          </div>
        </div>

        {done ? (
          <div className="p-8 text-center max-md:p-5">
            <div
              className={`mx-auto mb-4 grid size-20 place-items-center rounded-full ${
                percent >= PASS_SCORE ? "bg-green-500" : "bg-red-600"
              }`}
            >
              <Icon name={percent >= PASS_SCORE ? "check" : "lock"} className="size-10" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-extrabold">{percent}%</h3>
            <p className="mt-2 text-slate-300">
              {percent >= PASS_SCORE
                ? t("block.passed")
                : `${PASS_SCORE}% ${t("block.failed")}`}
            </p>
          </div>
        ) : (
          <div className="p-6 max-md:p-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-sm font-bold">
                {index + 1} / {questions.length}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-red-500 transition-[width] duration-300"
                  style={{ width: `${(index / questions.length) * 100}%` }}
                />
              </div>
              <span className="whitespace-nowrap text-sm font-bold text-green-400">✓ {correct}</span>
            </div>

            <p className="text-xl font-bold leading-snug">{question.q}</p>
            <p className="mt-1.5 text-sm text-slate-400">{question.uz}</p>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {question.options.map((option) => {
                const isAnswer = option === question.answer;
                const state = !picked ? "idle" : isAnswer ? "correct" : option === picked ? "wrong" : "idle";
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={!!picked}
                    onClick={() => choose(option)}
                    className={`rounded-xl border-2 px-4 py-3 text-left font-semibold transition ${
                      state === "correct"
                        ? "border-green-500 bg-green-500/15 text-green-200"
                        : state === "wrong"
                          ? "anim-shake border-red-500 bg-red-500/15 text-red-200"
                          : "border-white/10 bg-white/5 hover:border-blue-400"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              {t("block.needScore")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
