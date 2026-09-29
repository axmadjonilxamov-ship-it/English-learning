"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import {
  PART1_SECONDS,
  PART1_SETS,
  PART2_CARDS,
  PART2_PREP_SECONDS,
  PART2_SPEAK_SECONDS,
  PART3_SECONDS,
  PART3_SETS,
  MAX_RECORDING_SECONDS,
  type Part1Set,
  type Part2Card,
  type Part3Set,
} from "@/data/ielts-speaking";
import { shuffle } from "@/lib/shuffle";
import { useLang } from "@/lib/i18n";
import { useRecorder, type RecorderError } from "@/lib/use-recorder";
import { useRandomItem } from "@/lib/use-random-item";
import type { SpeakingEvaluation, SpeakingPart } from "@/lib/speaking/types";

const NOTES_KEY = "englishup:ielts-speaking-notes";

/** Xatolik turini interfeys matniga bog'laydi. */
const ERROR_KEY = {
  unsupported: "speaking.errUnsupported",
  denied: "speaking.errDenied",
  empty: "speaking.errEmpty",
  failed: "speaking.errFailed",
} as const satisfies Record<RecorderError, string>;

function clock(total: number): string {
  const safe = Math.max(0, total);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export default function SpeakingPage() {
  const { t, lang } = useLang();

  const [part, setPart] = useState<SpeakingPart>("part1");
  // Sahifa har ochilganda boshqa savol chiqadi.
  const [set1, setSet1] = useRandomItem<Part1Set>(PART1_SETS, "englishup:ielts-speaking-last1");
  const [index1, setIndex1] = useState(0);
  const [card2, setCard2] = useRandomItem<Part2Card>(PART2_CARDS, "englishup:ielts-speaking-last2");
  const [set3, setSet3] = useRandomItem<Part3Set>(PART3_SETS, "englishup:ielts-speaking-last3");
  const [index3, setIndex3] = useState(0);

  // Part 2 tayyorgarligi
  const [prepLeft, setPrepLeft] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [result, setResult] = useState<SpeakingEvaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const limit = part === "part2" ? PART2_SPEAK_SECONDS : MAX_RECORDING_SECONDS;
  const recorder = useRecorder(limit);
  const { start, stop, reset, status, seconds, recorded, live, liveSupported } = recorder;

  // Qoralamani saqlab boramiz — sahifa yopilsa ham yo'qolmasin.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTES_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setNotes(saved);
    } catch {
      // localStorage yopiq bo'lsa, shunchaki saqlanmaydi.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, notes);
    } catch {
      // Saqlab bo'lmasa ham yozishda davom etish mumkin.
    }
  }, [notes]);

  /** Savol matni — serverga ham shu yuboriladi. */
  const question = useMemo(() => {
    if (part === "part1") return set1.questions[index1];
    if (part === "part3") return set3.questions[index3];
    return `${card2.prompt} You should say: ${card2.bullets.join("; ")}`;
  }, [card2, index1, index3, part, set1, set3]);

  /** Har bir qism uchun tavsiya etilgan javob uzunligi. */
  const target =
    part === "part1" ? PART1_SECONDS : part === "part2" ? PART2_SPEAK_SECONDS : PART3_SECONDS;

  const clearAnswer = useCallback(() => {
    reset();
    setResult(null);
    setApiError(null);
    setPrepLeft(null);
  }, [reset]);

  const switchPart = (next: SpeakingPart) => {
    stop();
    clearAnswer();
    setPart(next);
  };

  /** "Boshqasi" — shu qism ichidan yangi savol tanlaydi. */
  const another = () => {
    stop();
    clearAnswer();
    if (part === "part1") {
      setSet1(shuffle(PART1_SETS.filter((s) => s.id !== set1.id))[0] ?? set1);
      setIndex1(0);
    } else if (part === "part2") {
      setCard2(shuffle(PART2_CARDS.filter((c) => c.id !== card2.id))[0] ?? card2);
    } else {
      setSet3(shuffle(PART3_SETS.filter((s) => s.id !== set3.id))[0] ?? set3);
      setIndex3(0);
    }
  };

  /** Part 1 va Part 3 da to'plam ichidagi keyingi savol. */
  const nextQuestion = () => {
    stop();
    clearAnswer();
    if (part === "part1") setIndex1((i) => (i + 1) % set1.questions.length);
    if (part === "part3") setIndex3((i) => (i + 1) % set3.questions.length);
  };

  // Part 2: tayyorgarlik taymeri, nol bo'lganda yozish o'zi boshlanadi.
  const startRef = useRef(start);
  useEffect(() => {
    startRef.current = start;
  }, [start]);

  useEffect(() => {
    if (prepLeft === null) return;
    const id = setTimeout(() => {
      // Oxirgi soniya o'tdi — yozish o'zi boshlanadi.
      if (prepLeft <= 1) {
        setPrepLeft(null);
        void startRef.current();
      } else {
        setPrepLeft(prepLeft - 1);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [prepLeft]);

  /** Tayyorgarlikni kutmay, darhol gapirishni boshlash. */
  const beginSpeaking = () => {
    setPrepLeft(null);
    void start();
  };

  const submit = async () => {
    if (!recorded) return;
    setBusy(true);
    setApiError(null);
    setResult(null);
    try {
      const form = new FormData();
      const extension = recorded.blob.type.includes("mp4") ? "mp4" : "webm";
      form.append("audio", new File([recorded.blob], `answer.${extension}`, { type: recorded.blob.type }));
      form.append("part", part);
      form.append("question", question);

      const res = await fetch("/api/speaking/evaluate", { method: "POST", body: form });
      const data: unknown = await res.json();
      if (!res.ok) {
        const message = (data as { error?: string })?.error;
        setApiError(message || t("speaking.errNetwork"));
        return;
      }
      setResult(data as SpeakingEvaluation);
    } catch {
      setApiError(t("speaking.errNetwork"));
    } finally {
      setBusy(false);
    }
  };

  const tabs = [
    ["part1", t("speaking.part1Tab")],
    ["part2", t("speaking.part2Tab")],
    ["part3", t("speaking.part3Tab")],
  ] as const;

  const hint =
    part === "part1"
      ? t("speaking.part1Hint")
      : part === "part2"
        ? t("speaking.part2Hint")
        : t("speaking.part3Hint");

  const recording = status === "recording";
  const overtime = recording && seconds > target;

  return (
    <div className="anim-enter">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/ielts" className="text-sm font-semibold text-ink-muted hover:text-ink">
            ← {t("nav.ielts")}
          </Link>
          <h1 className="mt-1 text-[clamp(1.6rem,4vw,2.1rem)] font-extrabold tracking-tight">IELTS Speaking</h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-mono text-lg font-bold ${
              overtime
                ? "bg-red-500/15 text-red-500"
                : recording
                  ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                  : "bg-surface-2"
            }`}
          >
            {recording && <span className="size-2.5 animate-pulse rounded-full bg-red-500" />}
            {clock(seconds)} / {clock(target)}
          </span>
        </div>
      </div>

      {/* Qism tanlash */}
      <div className="mb-3 flex gap-2 max-sm:flex-col">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => switchPart(id)}
            className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
              part === id
                ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400"
                : "border-line bg-surface hover:bg-surface-2"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mb-4 text-sm text-ink-muted">{hint}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Savol */}
        <div className="card p-5 max-md:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-extrabold">
              {part === "part2" ? t("speaking.cueCard") : t("speaking.question")}
            </h2>
            <button
              type="button"
              onClick={another}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-sm font-bold transition hover:bg-surface-2"
            >
              <Icon name="refresh" className="size-4" /> {t("ielts.another")}
            </button>
          </div>

          {part === "part1" && (
            <>
              <span className="inline-block rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ink-muted">
                {t("speaking.topic")}: {set1.topic[lang]}
              </span>
              <p className="mt-3 text-[1.15rem] font-semibold leading-relaxed">{set1.questions[index1]}</p>
              <ol className="mt-4 grid gap-1.5 text-sm text-ink-muted">
                {set1.questions.map((q, i) => (
                  <li key={q} className={i === index1 ? "font-bold text-ink" : ""}>
                    {i + 1}. {q}
                  </li>
                ))}
              </ol>
            </>
          )}

          {part === "part2" && (
            <>
              <p className="text-[1.15rem] font-semibold leading-relaxed">{card2.prompt}</p>
              <p className="mt-3 text-sm font-bold text-ink-muted">You should say:</p>
              <ul className="mt-1.5 grid gap-1 pl-5 text-[1.02rem] leading-relaxed">
                {card2.bullets.map((b) => (
                  <li key={b} className="list-disc">
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl bg-surface-2 px-4 py-3 text-sm">
                <b className="text-ink-muted">{t("speaking.followUp")}:</b> {card2.followUp}
              </p>
            </>
          )}

          {part === "part3" && (
            <>
              <span className="inline-block rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ink-muted">
                {t("speaking.topic")}: {set3.theme[lang]}
              </span>
              <p className="mt-3 text-[1.15rem] font-semibold leading-relaxed">{set3.questions[index3]}</p>
              <ol className="mt-4 grid gap-1.5 text-sm text-ink-muted">
                {set3.questions.map((q, i) => (
                  <li key={q} className={i === index3 ? "font-bold text-ink" : ""}>
                    {i + 1}. {q}
                  </li>
                ))}
              </ol>
            </>
          )}

          {part !== "part2" && (
            <button
              type="button"
              onClick={nextQuestion}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-line px-3.5 py-2 text-sm font-bold transition hover:bg-surface-2"
            >
              {t("speaking.nextQuestion")} <Icon name="right" className="size-4" />
            </button>
          )}
        </div>

        {/* Javob berish */}
        <div className="card flex flex-col p-5 max-md:p-4">
          <h2 className="mb-3 font-extrabold">{t("ielts.yourAnswer")}</h2>

          {/* Part 2 tayyorgarligi */}
          {part === "part2" && (
            <div className="mb-4 rounded-xl border border-line bg-surface-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-bold">
                  <Icon name="clock" className="size-4" />
                  {prepLeft === null ? t("speaking.prep") : t("speaking.prepRunning")}
                </span>
                {prepLeft === null ? (
                  <button
                    type="button"
                    onClick={() => {
                      clearAnswer();
                      setPrepLeft(PART2_PREP_SECONDS);
                    }}
                    disabled={recording || busy}
                    className="rounded-xl border border-line bg-surface px-3.5 py-1.5 text-sm font-bold transition hover:bg-surface-2 disabled:opacity-40"
                  >
                    {t("speaking.startPrep")}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-brand-600 dark:text-brand-400">
                      {clock(prepLeft)}
                    </span>
                    <button
                      type="button"
                      onClick={beginSpeaking}
                      className="rounded-xl border border-line bg-surface px-3 py-1.5 text-sm font-bold transition hover:bg-surface-2"
                    >
                      {t("speaking.skipPrep")}
                    </button>
                  </div>
                )}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("speaking.notesPlaceholder")}
                spellCheck={false}
                aria-label={t("speaking.notes")}
                className="mt-3 min-h-[92px] w-full resize-y rounded-xl border border-line bg-surface p-3 text-sm leading-relaxed outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              />
            </div>
          )}

          {/* Mikrofon */}
          <div className="flex flex-wrap items-center gap-2">
            {recording ? (
              <button
                type="button"
                onClick={stop}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-500"
              >
                <Icon name="stop" className="size-5" /> {t("speaking.stopRecord")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setApiError(null);
                  void start();
                }}
                disabled={status === "starting" || busy || prepLeft !== null}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-500 disabled:opacity-40"
              >
                <Icon name="mic" className="size-5" />
                {status === "starting"
                  ? t("speaking.starting")
                  : recorded
                    ? t("speaking.rerecord")
                    : t("speaking.record")}
              </button>
            )}
          </div>

          {recording && (
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-red-500">
              <span className="size-2.5 animate-pulse rounded-full bg-red-500" />
              {t("speaking.recording")}
            </p>
          )}

          {/* Jonli matn */}
          {(recording || live) && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-muted">
                {t("speaking.livePreview")}
              </p>
              {liveSupported ? (
                <p className="min-h-[72px] rounded-xl bg-surface-2 p-3 text-sm leading-relaxed">
                  {live || <span className="text-ink-muted">{t("speaking.liveWaiting")}</span>}
                </p>
              ) : (
                <p className="rounded-xl bg-surface-2 p-3 text-sm text-ink-muted">{t("speaking.liveOff")}</p>
              )}
            </div>
          )}

          {/* Tinglash va yuborish */}
          {recorded && !recording && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
                {t("speaking.playback")} · {clock(recorded.seconds)}
              </p>
              <audio src={recorded.url} controls className="w-full" />
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="mt-3 w-full rounded-2xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-500 disabled:opacity-40"
              >
                {busy ? t("speaking.evaluating") : t("speaking.evaluate")}
              </button>
            </div>
          )}

          {/* Xatoliklar */}
          {recorder.error && (
            <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {t(ERROR_KEY[recorder.error])}
            </p>
          )}
          {apiError && (
            <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {apiError}
            </p>
          )}
        </div>
      </div>

      {busy && (
        <div className="card anim-enter mt-6 flex items-center gap-3 p-6">
          <span className="size-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <span className="font-semibold">{t("speaking.evaluating")}</span>
        </div>
      )}

      {result && !busy && <Result result={result} />}
    </div>
  );
}

function Result({ result }: { result: SpeakingEvaluation }) {
  const { t } = useLang();
  const colour = (band: number) =>
    band >= 7 ? "text-green-600" : band >= 6 ? "text-amber-500" : "text-red-500";

  const criteria = [
    [t("speaking.fluency"), result.scores.fluency_coherence],
    [t("speaking.lexical"), result.scores.lexical_resource],
    [t("speaking.grammar"), result.scores.grammar],
    [t("speaking.pronunciation"), result.scores.pronunciation_estimate],
  ] as const;

  return (
    <div className="anim-enter mt-6 grid gap-4">
      {/* Umumiy ball */}
      <div className="card p-6 max-md:p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <div className={`font-mono text-[3.5rem] font-extrabold leading-none ${colour(result.scores.overall)}`}>
              {result.scores.overall.toFixed(1)}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-ink-muted">
              {t("ielts.estimate")}
            </div>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            {criteria.map(([label, band]) => (
              <div key={label} className="flex items-baseline justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3">
                <span className="text-sm font-semibold">{label}</span>
                <span className={`font-mono text-xl font-extrabold ${colour(band)}`}>{band.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {result.pronunciation_source === "transcript" && (
          <p className="mt-4 rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink-muted">{t("speaking.pronNote")}</p>
        )}
        <p className="mt-2 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          {t("speaking.disclaimer")}
        </p>
      </div>

      {/* Transkripsiya */}
      <div className="card p-5 max-md:p-4">
        <h3 className="font-extrabold">{t("speaking.transcript")}</h3>
        <p className="mt-2 whitespace-pre-line rounded-xl bg-surface-2 p-4 font-serif text-[1.02rem] leading-relaxed">
          {result.transcript}
        </p>
        <p className="mt-2 text-xs text-ink-muted">{t("speaking.transcriptNote")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Kuchli tomonlar */}
        <div className="card p-5 max-md:p-4">
          <h3 className="mb-3 font-extrabold">{t("speaking.strengths")}</h3>
          <ul className="grid gap-2">
            {result.feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 shrink-0 text-green-600">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Foydali lug'at */}
        <div className="card p-5 max-md:p-4">
          <h3 className="mb-3 font-extrabold">{t("speaking.vocab")}</h3>
          <ul className="grid gap-2">
            {result.feedback.vocabulary_suggestions.map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400">+</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Xatolar */}
      <div className="card p-5 max-md:p-4">
        <h3 className="mb-3 font-extrabold">{t("speaking.mistakes")}</h3>
        {result.feedback.mistakes.length === 0 ? (
          <p className="text-sm text-ink-muted">{t("speaking.noMistakes")}</p>
        ) : (
          <ul className="grid gap-3">
            {result.feedback.mistakes.map((m, i) => (
              <li key={i} className="rounded-xl bg-surface-2 p-4">
                <p className="text-sm text-red-600 line-through dark:text-red-400">{m.original}</p>
                <p className="mt-1 font-semibold text-green-700 dark:text-green-400">{m.correction}</p>
                <p className="mt-1.5 text-sm text-ink-muted">{m.explanation}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Namunaviy javob */}
      <div className="card p-5 max-md:p-4">
        <h3 className="font-extrabold">{t("speaking.improved")}</h3>
        <p className="mt-1 text-xs text-ink-muted">{t("speaking.improvedNote")}</p>
        <p className="mt-3 whitespace-pre-line rounded-xl bg-surface-2 p-4 font-serif text-[1.05rem] leading-relaxed">
          {result.improved_answer}
        </p>
      </div>
    </div>
  );
}
