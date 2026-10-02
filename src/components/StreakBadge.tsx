"use client";

import { useState } from "react";
import Link from "next/link";
import { LEVELS } from "@/data";
import { useProgress } from "@/lib/progress";
import { missedDays } from "@/lib/streak";
import { useT } from "@/lib/i18n";
import { StreakFlame } from "./StreakFlame";
import type { UIKey } from "@/lib/i18n";

/**
 * Sarlavhadagi kunlik seriya belgisi.
 *
 * Alanga holatga qarab o'zgaradi: bugun dars qilinsa tabassum qiladi, bugun
 * hali qilinmagan bo'lsa xavotirga tushadi, seriya uzilsa yig'laydi. Bosilsa
 * qisqa izoh va darsga o'tish havolasi chiqadi.
 */

const TEXT: Record<string, { title: UIKey; hint: UIKey }> = {
  done: { title: "streak.doneTitle", hint: "streak.doneHint" },
  atRisk: { title: "streak.riskTitle", hint: "streak.riskHint" },
  broken: { title: "streak.brokenTitle", hint: "streak.brokenHint" },
  none: { title: "streak.noneTitle", hint: "streak.noneHint" },
};

export function StreakBadge() {
  const t = useT();
  const { streak, ready, currentLevelIndex } = useProgress();
  const [open, setOpen] = useState(false);

  // Holat aniqlanmaguncha ko'rsatmaymiz — aks holda son "0" dan sakrab o'zgaradi.
  if (!ready) return null;

  const { status, count, best, raw } = streak;
  const missed = missedDays(raw);
  const level = LEVELS[currentLevelIndex()];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("streak.title")}
        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 font-bold transition ${
          status === "done"
            ? "border-accent-500/40 bg-accent-500/10 text-accent-600 dark:text-accent-400"
            : status === "atRisk"
              ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "border-line bg-surface text-ink-muted hover:bg-surface-2"
        }`}
      >
        <StreakFlame status={status} className="size-6" />
        <span className="text-sm tabular-nums">{count}</span>
      </button>

      {open && (
        <>
          {/* Tashqariga bosilsa yopiladi */}
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="anim-enter absolute right-0 top-full z-50 w-64 pt-2">
            <div className="card p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <StreakFlame status={status} className="size-12" />
                <div>
                  <div className="text-2xl font-extrabold leading-none tabular-nums">{count}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    {t("streak.days")}
                  </div>
                </div>
              </div>

              <b className="mt-3 block text-sm">{t(TEXT[status].title)}</b>
              <p className="mt-0.5 text-sm text-ink-muted">
                {status === "broken" && missed > 0 && (
                  <>
                    {missed} {t("streak.missed")}{" "}
                  </>
                )}
                {t(TEXT[status].hint)}
              </p>

              {best > 0 && (
                <p className="mt-2 border-t border-line pt-2 text-xs text-ink-muted">
                  {t("streak.best")}: <b className="text-ink">{best}</b> {t("streak.days")}
                </p>
              )}

              {status !== "done" && (
                <Link
                  href={`/path/${level.id}`}
                  onClick={() => setOpen(false)}
                  className="mt-3 block rounded-xl bg-brand-600 py-2.5 text-center text-sm font-bold text-white transition hover:bg-brand-500"
                >
                  {t("streak.continue")}
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
