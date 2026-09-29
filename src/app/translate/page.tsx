"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { looksUzbek, suggest, type DictionaryEntry } from "@/lib/dictionary";
import { speak } from "@/lib/speech";
import { useT } from "@/lib/i18n";
import type { TranslateResponse } from "@/app/api/translate/route";

type Direction = "en-uz" | "uz-en";

export default function TranslatePage() {
  const t = useT();
  const LABEL: Record<Direction, { from: string; to: string }> = {
    "en-uz": { from: t("tr.english"), to: t("tr.uzbek") },
    "uz-en": { from: t("tr.uzbek"), to: t("tr.english") },
  };
  const [direction, setDirection] = useState<Direction>("en-uz");
  const [text, setText] = useState("");
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const translate = useCallback(
    async (value: string, dir: Direction) => {
      const query = value.trim();
      if (!query) return;
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: query, direction: dir }),
        });
        const data = await res.json();
        if (!res.ok) {
          setResult(null);
          setError(data?.error ?? t("tr.errorFail"));
        } else {
          setResult(data as TranslateResponse);
        }
      } catch {
        setResult(null);
        setError(t("tr.errorNet"));
      } finally {
        setBusy(false);
      }
    },
    [t],
  );

  const swap = () => {
    const next: Direction = direction === "en-uz" ? "uz-en" : "en-uz";
    setDirection(next);
    // Tarjimani kiritish maydoniga ko'chiramiz — ketma-ket tarjima qilish qulay bo'lsin.
    if (result) {
      setText(result.text);
      setResult(null);
      setError(null);
    }
  };

  // Yozilgan matn boshqa tilga o'xshasa, yo'nalishni almashtirishni taklif qilamiz.
  const mismatch = useMemo(() => {
    const t = text.trim();
    if (t.length < 4) return false;
    return direction === "en-uz" ? looksUzbek(t) : !looksUzbek(t) && /^[a-z\s',.!?-]+$/i.test(t);
  }, [text, direction]);

  const suggestions = useMemo(() => (result ? [] : suggest(text)), [text, result]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const englishSide = direction === "en-uz" ? text.trim() : result?.text ?? "";

  return (
    <div className="anim-enter mx-auto max-w-[900px]">
      <div className="mb-5">
        <h2 className="text-[clamp(1.6rem,4vw,2.1rem)] font-extrabold tracking-tight">{t("tr.title")}</h2>
        <p className="mt-1.5 text-ink-muted">
          {t("tr.lead")}
        </p>
      </div>

      {/* Yo'nalish */}
      <div className="mb-4 flex items-center gap-2">
        <span className="flex-1 rounded-2xl border border-line bg-surface px-4 py-2.5 text-center font-bold">
          {LABEL[direction].from}
        </span>
        <button
          type="button"
          onClick={swap}
          aria-label={t("tr.swap")}
          className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-surface text-ink-muted transition hover:border-brand-500 hover:text-brand-500"
        >
          <Icon name="swap" />
        </button>
        <span className="flex-1 rounded-2xl border border-line bg-surface px-4 py-2.5 text-center font-bold">
          {LABEL[direction].to}
        </span>
      </div>

      {/* Kiritish */}
      <div className="card p-5 max-md:p-4">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setResult(null);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              translate(text, direction);
            }
          }}
          rows={3}
          maxLength={500}
          placeholder={direction === "en-uz" ? t("tr.placeholderEn") : t("tr.placeholderUz")}
          className="w-full resize-none bg-transparent text-xl outline-none placeholder:text-ink-muted"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="text-xs text-ink-muted">{text.length}/500 · {t("tr.enterHint")}</span>
          {text && (
            <button
              type="button"
              onClick={() => {
                setText("");
                setResult(null);
                setError(null);
                inputRef.current?.focus();
              }}
              className="text-xs font-semibold text-ink-muted hover:text-ink"
            >
              {t("common.clear")}
            </button>
          )}
          <button
            type="button"
            onClick={() => translate(text, direction)}
            disabled={busy || !text.trim()}
            className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 font-bold text-white transition hover:bg-brand-500 disabled:opacity-40"
          >
            <Icon name="translate" className="size-4" />
            {busy ? t("tr.translating") : t("tr.translate")}
          </button>
        </div>
      </div>

      {mismatch && (
        <button
          type="button"
          onClick={() => setDirection(direction === "en-uz" ? "uz-en" : "en-uz")}
          className="mt-3 flex w-full items-center gap-2 rounded-2xl border border-accent-500/35 bg-accent-500/10 px-4 py-3 text-left text-sm transition hover:bg-accent-500/15"
        >
          <Icon name="swap" className="size-4 text-accent-500" />
          <span className="flex-1">
            {direction === "en-uz" ? t("tr.uzbek") : t("tr.english")} {t("tr.looksLike")}{" "}
            <b>
              {LABEL[direction === "en-uz" ? "uz-en" : "en-uz"].from} →{" "}
              {LABEL[direction === "en-uz" ? "uz-en" : "en-uz"].to}
            </b>{" "}
            {t("tr.switchTo")}
          </span>
        </button>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-2xl bg-red-500/10 px-4 py-3 font-semibold text-red-500">
          {error}
        </p>
      )}

      {/* Natija */}
      {result && (
        <div className="anim-enter mt-3 rounded-[1.25rem] border border-brand-500/30 bg-brand-500/5 p-5 max-md:p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {LABEL[direction].to}
            </span>
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[0.7rem] font-semibold text-ink-muted">
              {result.from === "dictionary" ? t("tr.fromDictionary") : t("tr.fromService")}
            </span>
            <div className="ml-auto flex gap-1">
              {englishSide && (
                <button
                  type="button"
                  onClick={() => speak(englishSide)}
                  aria-label={t("common.listen")}
                  className="grid size-9 place-items-center rounded-xl text-ink-muted transition hover:bg-brand-500/10 hover:text-brand-500"
                >
                  <Icon name="volume" className="size-5" />
                </button>
              )}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(result.text);
                    setCopied(true);
                  } catch {
                    // Nusxalash ruxsati bo'lmasa, jimgina o'tkazib yuboramiz.
                  }
                }}
                aria-label={t("tr.copy")}
                className="grid size-9 place-items-center rounded-xl text-ink-muted transition hover:bg-brand-500/10 hover:text-brand-500"
              >
                <Icon name={copied ? "check" : "copy"} className="size-5" />
              </button>
            </div>
          </div>

          <p className="text-2xl font-bold">{result.text}</p>

          {/* Lug'atdan qo'shimcha ma'lumot */}
          {result.entries.length > 0 && (
            <div className="mt-4 grid gap-2 border-t border-brand-500/20 pt-4">
              {result.entries.map((entry, i) => (
                <DictionaryCard key={i} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Yozayotganda taklif */}
      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-muted">
            <Icon name="search" className="size-4" /> {t("tr.foundInDict")}
          </p>
          <div className="grid gap-2">
            {suggestions.map((entry, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const value = direction === "en-uz" ? entry.en : entry.uz;
                  setText(value);
                  translate(value, direction);
                }}
                className="card flex items-center gap-3 p-3 text-left transition hover:border-brand-500/40"
              >
                <div className="flex-1">
                  <b>{entry.en}</b>
                  {entry.tr && <span className="ml-2 text-sm text-ink-muted">{entry.tr}</span>}
                  <span className="block text-sm text-ink-muted">{entry.uz}</span>
                </div>
                <Icon name="right" className="size-4 text-ink-muted" />
              </button>
            ))}
          </div>
        </div>
      )}

      {!result && !text && (
        <p className="mt-6 text-center text-sm text-ink-muted">
          {t("tr.tip")}
        </p>
      )}

      <p className="mt-8 text-center text-xs text-ink-muted">
        {t("tr.footer")}
      </p>
    </div>
  );
}

function DictionaryCard({ entry }: { entry: DictionaryEntry }) {
  const t = useT();
  return (
    <div className="rounded-xl bg-surface p-3.5">
      <div className="flex flex-wrap items-baseline gap-2">
        <b className="text-lg">{entry.en}</b>
        {entry.tr && <span className="text-sm text-ink-muted">{entry.tr}</span>}
        <button
          type="button"
          onClick={() => speak(entry.en)}
          aria-label={t("common.listen")}
          className="text-ink-muted transition hover:text-brand-500"
        >
          <Icon name="volume" className="size-4" />
        </button>
        <span className="ml-auto text-xs text-ink-muted">{entry.source}</span>
      </div>
      <p className="text-ink-muted">{entry.uz}</p>
      {entry.ex && <p className="mt-1.5 text-sm italic text-ink-muted">“{entry.ex}”</p>}
    </div>
  );
}
