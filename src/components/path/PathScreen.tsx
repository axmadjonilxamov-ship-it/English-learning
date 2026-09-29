"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RoadPath } from "@/components/path/RoadPath";
import { Icon } from "@/components/Icon";
import { LEVELS, getLevel } from "@/data";
import { useProgress } from "@/lib/progress";
import { useT } from "@/lib/i18n";

export function PathScreen({ levelId }: { levelId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { levelProgress, currentLesson, isLessonDone } = useProgress();
  const t = useT();

  const level = getLevel(levelId)!;

  const moduleParam = searchParams.get("m");

  // Tanlangan dars hisoblab chiqiladi: so'ralgan moduldagi (yoki umuman)
  // birinchi tugatilmagan dars. Foydalanuvchi bosgan bo'lsa — uning tanlovi ustun.
  const [picked, setPicked] = useState<number | null>(null);
  const viewKey = `${levelId}:${moduleParam ?? ""}`;
  const [prevKey, setPrevKey] = useState(viewKey);
  if (prevKey !== viewKey) {
    setPrevKey(viewKey);
    setPicked(null);
  }

  let suggested: number;
  if (moduleParam !== null) {
    const mod = Number(moduleParam);
    const undone = level.lessons.findIndex((l) => l.module === mod && !isLessonDone(l.id));
    const first = level.lessons.findIndex((l) => l.module === mod);
    suggested = undone !== -1 ? undone : Math.max(first, 0);
  } else {
    suggested = currentLesson(level);
  }
  const selected = picked ?? suggested;

  const progress = levelProgress(level);
  const lesson = level.lessons[selected];
  const done = lesson ? isLessonDone(lesson.id) : false;

  return (
    <div className="anim-enter -mx-4 -mt-10 min-h-[calc(100vh-90px)] bg-[radial-gradient(ellipse_70%_60%_at_50%_55%,#0f2233_0%,#0a0f0d_70%)] pb-6 pt-5 text-gray-200 max-md:-mt-7">
      <div className="relative mx-auto max-w-[1280px] px-4 text-center">
        <Link
          href="/"
          className="absolute left-4 top-0 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10 max-md:static max-md:mb-4"
        >
          <Icon name="left" className="size-4" /> {t("nav.city")}
        </Link>

        <span className="block text-[0.82rem] font-extrabold tracking-[0.25em] text-slate-400">{t("path.title")}</span>
        <div className="mt-3.5 font-extrabold tracking-[0.12em]">
          <b className="text-brand-400">{(level.full ?? level.name).toUpperCase()}</b>{" "}
          <span>
            {progress.done}/{progress.total}
          </span>
        </div>

        <div className="mx-auto mt-3.5 flex w-[min(860px,80%)] gap-2 max-md:w-full">
          {level.modules.map((mod) => {
            const modDone = mod.lessons.filter((l) => isLessonDone(l.id)).length;
            return (
              <div
                key={mod.name}
                title={mod.name}
                className="h-[9px] overflow-hidden rounded-full bg-slate-800"
                style={{ flex: mod.lessons.length }}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-[width] duration-500"
                  style={{ width: `${(modDone / mod.lessons.length) * 100}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Darajalar orasida o'tish */}
      <div className="no-scrollbar mx-auto mt-4 flex max-w-full justify-center gap-2 overflow-x-auto px-4 pb-2 max-md:justify-start">
        {LEVELS.map((lv) => {
          const p = levelProgress(lv);
          const active = lv.id === level.id;
          return (
            <Link
              key={lv.id}
              href={`/path/${lv.id}`}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active ? "border-blue-600 bg-blue-600 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {lv.name}{" "}
              <small className="opacity-70">
                {p.done}/{p.total}
              </small>
            </Link>
          );
        })}
      </div>

      <RoadPath
        level={level}
        selected={selected}
        onSelect={setPicked}
        onOpen={(i) => router.push(`/lesson/${level.id}/${i}`)}
      />

      {lesson && (
        <div className="mx-auto mt-2 max-w-[940px] px-4">
          <div
            className={`flex items-center gap-4.5 gap-[18px] rounded-[1.25rem] border border-l-[5px] px-6 py-4.5 py-[18px] max-md:flex-wrap max-md:px-4 ${
              done
                ? "border-green-500/30 border-l-blue-600 bg-gradient-to-r from-green-500/15 to-green-500/5"
                : "border-blue-500/30 border-l-blue-600 bg-gradient-to-r from-blue-600/15 to-blue-600/5"
            }`}
          >
            <div
              className={`grid size-14 shrink-0 place-items-center rounded-full text-xl font-extrabold text-white ${
                done ? "bg-green-500" : "bg-blue-600"
              }`}
            >
              {done ? <Icon name="check" className="size-7" strokeWidth={3} /> : selected + 1}
            </div>
            <div className="flex min-w-0 flex-col">
              <b className="text-xl text-white">{lesson.title}</b>
              <span className="text-slate-400">
                {level.modules[lesson.module].name} · {lesson.min} {t("common.minutes")} · {lesson.tasks.length} {t("path.exercises")}
              </span>
            </div>
            <Link
              href={`/lesson/${level.id}/${selected}`}
              className={`ml-auto inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-base font-extrabold transition hover:bg-white/5 max-md:ml-0 max-md:w-full max-md:justify-center max-md:bg-white/5 ${
                done ? "text-green-400" : "text-blue-300"
              }`}
            >
              <Icon name="book" className="size-4" /> {done ? t("path.reopenLesson") : t("path.openLesson")}
              <Icon name="right" className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
