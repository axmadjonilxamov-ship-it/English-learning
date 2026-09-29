"use client";

import Link from "next/link";
import { CityMap } from "@/components/city/CityMap";
import { Icon } from "@/components/Icon";
import { Bar, ButtonLink, Ring, SectionHead, StatCard } from "@/components/ui";
import { LEVELS } from "@/data";
import { useProgress } from "@/lib/progress";
import { useT } from "@/lib/i18n";

export default function HomePage() {
  const { state, levelProgress, currentLesson, totals, synced } = useProgress();
  const t = useT();
  const all = totals();

  return (
    <div className="anim-enter">
      <section className="mb-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3.5 py-1.5 text-sm font-bold text-brand-600 dark:text-brand-400">
            {t("home.badge")}
          </span>
          <h1 className="text-[clamp(2rem,4.6vw,3.2rem)] font-extrabold leading-[1.1] tracking-[-0.035em]">
            {t("home.title1")}{" "}
            <span className="bg-gradient-to-r from-brand-700 via-brand-500 to-brand-400 bg-clip-text text-transparent dark:from-brand-400 dark:via-brand-300 dark:to-accent-400">
              {t("home.titleAccent")}
            </span>{" "}
            {t("home.title2")}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-ink-muted">
            {t("home.lead")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="flex min-w-[140px] flex-col rounded-2xl border border-line bg-surface px-[18px] py-3">
            <b className="text-2xl font-extrabold leading-tight">
              {all.done}/{all.total}
            </b>
            <span className="text-xs text-ink-muted">{t("home.lessonsDone")}</span>
          </div>
          <div className="flex min-w-[140px] flex-col rounded-2xl border border-line bg-surface px-[18px] py-3">
            <b className="text-2xl font-extrabold leading-tight">{all.percent}%</b>
            <span className="text-xs text-ink-muted">{t("home.coursePercent")}</span>
          </div>
        </div>
      </section>

      <CityMap />

      {!synced && (
        <Link
          href="/register"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-accent-500/35 bg-accent-500/10 px-5 py-4 transition hover:bg-accent-500/15"
        >
          <Icon name="cloud" className="size-5 text-accent-500" />
          <span className="flex-1 text-sm">
            <b>{t("home.guestWarning")}</b> <span className="text-ink-muted">{t("home.guestHint")}</span>
          </span>
          <Icon name="right" className="size-5 text-accent-500" />
        </Link>
      )}

      <SectionHead
        title={t("home.levels")}
        hint={t("home.levelOrder")}
      />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(290px,1fr))]">
        {LEVELS.map((level) => {
          const p = levelProgress(level);
          const next = currentLesson(level);
          return (
            <div key={level.id} className="card flex flex-col gap-3.5 p-5">
              <div className="flex items-center gap-2.5">
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-extrabold text-white"
                  style={{ background: level.palette[1] }}
                >
                  {level.cefr}
                </span>
                <h3 className="flex-1 text-lg font-extrabold">{level.full ?? level.name}</h3>
                <Link
                  href={`/path/${level.id}`}
                  aria-label={`${level.name} — ${t("path.title")}`}
                  className="grid size-9 place-items-center rounded-xl border border-line text-ink-muted transition hover:border-brand-500 hover:text-brand-500"
                >
                  <Icon name="map" className="size-4" />
                </Link>
              </div>

              <div className="flex items-center gap-2.5 text-sm font-bold text-ink-muted">
                <Bar percent={p.percent} color={level.palette[1]} />
                <span>
                  {p.done}/{p.total}
                </span>
              </div>

              <div className="grid gap-1">
                {level.modules.map((mod, mi) => {
                  const done = mod.lessons.filter((l) => state.lessons.includes(l.id)).length;
                  return (
                    <Link
                      key={mod.name}
                      href={`/path/${level.id}?m=${mi}`}
                      className="flex items-center gap-3 rounded-xl p-2 font-semibold transition hover:bg-surface-2"
                    >
                      <span
                        className="grid size-8 place-items-center rounded-xl text-base"
                        style={{ background: level.palette[mi] }}
                      >
                        {mod.icon}
                      </span>
                      <span className="flex-1">{mod.name}</span>
                      <small className="font-bold text-ink-muted">
                        {done}/{mod.lessons.length}
                      </small>
                    </Link>
                  );
                })}
              </div>

              <ButtonLink href={`/lesson/${level.id}/${next}`} variant="primary" className="w-full">
                {p.done === 0 ? t("common.start") : p.done === p.total ? t("common.repeat") : t("common.continue")}
                <Icon name="right" className="size-4" />
              </ButtonLink>
            </div>
          );
        })}
      </div>

      <SectionHead title={t("home.yourProgress")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Ring percent={all.percent} />} value={all.done} label={t("home.lessonsCompleted")} />
        <StatCard
          icon={
            <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-brand-500 text-white">
              <Icon name="book" />
            </div>
          }
          value={all.total - all.done}
          label={t("home.lessonsAhead")}
        />
        <Link href="/translate" className="card flex items-center gap-4 p-5 transition hover:border-brand-500/40">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
            <Icon name="translate" />
          </div>
          <div>
            <b className="block text-[1.35rem] font-extrabold leading-tight tracking-tight">{t("tr.title")}</b>
            <span className="text-sm text-ink-muted">{t("home.translatorCard")}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
