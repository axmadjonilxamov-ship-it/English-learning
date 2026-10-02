"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { LEVELS, TOTAL_LESSONS } from "@/data";
import {
  EMPTY_STREAK,
  advance,
  mergeStreak,
  normaliseStreak,
  statusOf,
  visibleCount,
  type Streak,
  type StreakStatus,
} from "@/lib/streak";
import type { Level, ProgressState } from "@/types";

const STORAGE_KEY = "englishup:progress";

const EMPTY: ProgressState = { lessons: [], streak: EMPTY_STREAK };

function readLocal(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const saved = { ...EMPTY, ...JSON.parse(raw) } as ProgressState;
    return { ...saved, streak: normaliseStreak(saved.streak) };
  } catch {
    return EMPTY;
  }
}

function writeLocal(state: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Maxfiy rejimda localStorage yopiq bo'lishi mumkin — bu holda jimgina davom etamiz.
  }
}

/** Ikkita holatni yo'qotishsiz birlashtiradi. */
function merge(a: ProgressState, b: ProgressState): ProgressState {
  return {
    lessons: [...new Set([...a.lessons, ...b.lessons])],
    streak: mergeStreak(normaliseStreak(a.streak), normaliseStreak(b.streak)),
  };
}

export type LevelProgress = { done: number; total: number; percent: number };

type ProgressApi = {
  state: ProgressState;
  /** Server bilan birinchi sinxronlash tugadimi. */
  ready: boolean;
  /** Kirgan foydalanuvchi bormi — natijalar bulutga saqlanyaptimi. */
  synced: boolean;
  isLessonDone: (lessonId: string) => boolean;
  completeLesson: (lessonId: string) => void;
  /** Kunlik seriya: ko'rsatiladigan son, eng yaxshi natija va holat. */
  streak: { count: number; best: number; status: StreakStatus; raw: Streak };
  levelProgress: (level: Level) => LevelProgress;
  /** Darajadagi birinchi tugatilmagan dars indeksi. */
  currentLesson: (level: Level) => number;
  /** Foydalanuvchi qaysi darajada — shaharchadagi belgini joylash uchun. */
  currentLevelIndex: () => number;
  totals: () => LevelProgress;
};

const ProgressContext = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id ?? null;

  const [state, setState] = useState<ProgressState>(EMPTY);
  const [serverLoaded, setServerLoaded] = useState(false);
  // Kirmagan foydalanuvchi uchun serverni kutish shart emas.
  const ready = !isPending && (!userId || serverLoaded);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<ProgressState | null>(null);

  // Brauzerdagi holatni darhol ko'rsatamiz. localStorage serverda mavjud emas,
  // shuning uchun uni faqat brauzerda, birinchi renderdan keyin o'qiymiz —
  // aks holda serverdagi va brauzerdagi HTML mos kelmay qoladi.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setState(readLocal()), []);

  /** O'zgarishlarni serverga yuboradi (bir necha o'zgarish bitta so'rovga birlashadi). */
  const schedulePush = useCallback(
    (next: ProgressState) => {
      if (!userId) return;
      pending.current = next;
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(async () => {
        const payload = pending.current;
        pending.current = null;
        if (!payload) return;
        try {
          const res = await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) return;
          const server: ProgressState = await res.json();
          setState((local) => {
            const merged = merge(local, server);
            writeLocal(merged);
            return merged;
          });
        } catch {
          // Internet yo'q bo'lsa, holat brauzerda qoladi va keyingi o'zgarishda yana yuboriladi.
        }
      }, 800);
    },
    [userId],
  );

  // Kirgandan keyin: serverdagi va brauzerdagi holatni birlashtirib, ikkalasiga ham yozamiz.
  useEffect(() => {
    if (isPending || !userId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/progress");
        const server: ProgressState | null = res.ok ? await res.json() : null;
        if (cancelled) return;
        const local = readLocal();
        const merged = server ? merge(local, { ...EMPTY, ...server }) : local;
        writeLocal(merged);
        setState(merged);
        // Brauzerda serverda yo'q narsa bo'lsa, uni ham saqlab qo'yamiz.
        if (server && merged.lessons.length !== server.lessons.length) schedulePush(merged);
      } catch {
        if (!cancelled) setState(readLocal());
      } finally {
        if (!cancelled) setServerLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, isPending, schedulePush]);

  const api = useMemo<ProgressApi>(() => {
    const doneLessons = new Set(state.lessons);

    const update = (fn: (prev: ProgressState) => ProgressState) =>
      setState((prev) => {
        const next = fn(prev);
        if (next === prev) return prev;
        writeLocal(next);
        schedulePush(next);
        return next;
      });

    return {
      state,
      ready,
      synced: !!userId,
      isLessonDone: (id) => doneLessons.has(id),
      completeLesson: (id) =>
        // Dars tugadi — seriya ham shu yerda oshadi (kuniga bir marta).
        update((prev) => {
          const current = normaliseStreak(prev.streak);
          const streak = advance(current);
          const known = prev.lessons.includes(id);
          // Tugatilgan darsga qayta kirilsa va seriya ham o'zgarmasa, holatni
          // qayta yozmaymiz — aks holda har tashrifda serverga so'rov ketardi.
          const sameStreak = streak.last === current.last && streak.count === current.count;
          if (known && sameStreak) return prev;
          return { lessons: known ? prev.lessons : [...prev.lessons, id], streak };
        }),
      streak: {
        count: visibleCount(state.streak),
        best: state.streak.best,
        status: statusOf(state.streak),
        raw: state.streak,
      },
      levelProgress: (level) => {
        const done = level.lessons.filter((l) => doneLessons.has(l.id)).length;
        return { done, total: level.lessons.length, percent: Math.round((done / level.lessons.length) * 100) };
      },
      currentLesson: (level) => {
        const i = level.lessons.findIndex((l) => !doneLessons.has(l.id));
        return i === -1 ? level.lessons.length - 1 : i;
      },
      currentLevelIndex: () => {
        const i = LEVELS.findIndex((lv) => lv.lessons.some((l) => !doneLessons.has(l.id)));
        return i === -1 ? LEVELS.length - 1 : i;
      },
      totals: () => ({
        done: state.lessons.length,
        total: TOTAL_LESSONS,
        percent: Math.round((state.lessons.length / TOTAL_LESSONS) * 100),
      }),
    };
  }, [state, ready, userId, schedulePush]);

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress faqat <ProgressProvider> ichida ishlaydi");
  return ctx;
}
