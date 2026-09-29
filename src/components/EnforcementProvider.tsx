"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { TrafficQuizModal } from "./path/TrafficQuizModal";
import {
  FOREVER_LIMIT,
  applyQuizResult,
  deviceId,
  isBlocked,
  readEnforcement,
  registerViolation,
  remainingLabel,
  syncEnforcement,
  type Enforcement,
} from "@/lib/enforcement";
import { useT } from "@/lib/i18n";

type Api = {
  state: Enforcement;
  /** Qizil chiroqdan o'tilganda chaqiriladi — test ochiladi. */
  redLight: () => void;
  /** Hozir ekran bloklanganmi (o'yin to'xtashi kerakmi). */
  blocked: boolean;
  /** Test ochiqmi — o'yin pauzada bo'lishi kerak. */
  busy: boolean;
};

const EnforcementContext = createContext<Api | null>(null);

export function EnforcementProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Enforcement>({ violations: 0, blockedUntil: 0, forever: false });
  const [quiz, setQuiz] = useState<{ seed: string; violations: number } | null>(null);
  const [, tick] = useState(0);

  // Brauzer va serverdagi holatni birlashtiramiz. localStorage serverda yo'q,
  // shuning uchun uni faqat brauzerda, birinchi renderdan keyin o'qiymiz.
  useEffect(() => {
    const local = readEnforcement();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(local);
    (async () => {
      try {
        const res = await fetch(`/api/enforcement?device=${encodeURIComponent(deviceId())}`);
        if (!res.ok) return;
        const server: Enforcement = await res.json();
        setState((prev) => {
          const merged = {
            violations: Math.max(prev.violations, server.violations),
            blockedUntil: Math.max(prev.blockedUntil, server.blockedUntil),
            forever: prev.forever || server.forever,
          };
          return merged;
        });
      } catch {
        // Internet yo'q bo'lsa, brauzerdagi holat amal qiladi.
      }
    })();
  }, []);

  // Blok tugashini kuzatib turamiz (sanoqni yangilash uchun).
  useEffect(() => {
    if (!isBlocked(state) || state.forever) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  const redLight = useCallback(() => {
    setState((prev) => {
      const next = registerViolation(prev);
      void syncEnforcement(next, { violation: true });
      setQuiz({ seed: `${Date.now()}`, violations: next.violations });
      return next;
    });
  }, []);

  const finishQuiz = useCallback((percent: number) => {
    setTimeout(() => {
      setState((prev) => {
        const next = applyQuizResult(prev, percent);
        void syncEnforcement(next, { quizScore: percent });
        return next;
      });
      setQuiz(null);
    }, 1600);
  }, []);

  const blocked = isBlocked(state);

  return (
    <EnforcementContext.Provider value={{ state, redLight, blocked, busy: !!quiz }}>
      {children}

      {quiz && !state.forever && (
        <TrafficQuizModal seed={quiz.seed} violations={quiz.violations} onFinish={finishQuiz} />
      )}

      {blocked && <BlockScreen state={state} />}
    </EnforcementContext.Provider>
  );
}

/** Bloklangan ekran — butun saytni yopadi. */
function BlockScreen({ state }: { state: Enforcement }) {
  const t = useT();
  if (state.forever) {
    return (
      <div className="fixed inset-0 z-[200] grid place-items-center bg-[#0a0b14] p-6 text-center">
        <div className="max-w-[560px]">
          <div className="mx-auto mb-6 grid size-24 place-items-center rounded-full bg-red-600/15 text-red-500">
            <Icon name="lock" className="size-12" />
          </div>
          <h1 className="text-[clamp(1.6rem,5vw,2.4rem)] font-extrabold leading-tight text-white">
            {t("block.foreverTitle")}
          </h1>
          <p className="mt-4 text-lg text-slate-300">{t("block.foreverText")}</p>
          <p className="mt-6 text-sm text-slate-500">
            {state.violations} {t("block.foreverCount")} ({FOREVER_LIMIT}+). {t("block.foreverClosed")}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {t("block.contactAdmin")}
          </p>
          <div className="mt-8 flex justify-center opacity-40">
            <Logo />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-[#0a0b14]/97 p-6 text-center backdrop-blur">
      <div className="max-w-[460px]">
        <div className="mx-auto mb-6 grid size-24 place-items-center rounded-full bg-amber-500/15 text-amber-500">
          <span className="text-5xl">🚦</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">{t("block.tempTitle")}</h1>
        <p className="mt-3 text-slate-300">
          {t("block.tempText")}
        </p>
        <p className="mt-8 font-mono text-[clamp(3rem,12vw,5rem)] font-extrabold leading-none text-white">
          {remainingLabel(state.blockedUntil)}
        </p>
        <p className="mt-4 text-sm text-slate-500">
          {t("block.violations")}: {state.violations} / {FOREVER_LIMIT}. {t("block.eachAdds")}
        </p>
        <p className="mt-2 text-xs text-slate-600">
          {t("block.deviceNote")}
        </p>
      </div>
    </div>
  );
}

export function useEnforcement(): Api {
  const ctx = useContext(EnforcementContext);
  if (!ctx) throw new Error("useEnforcement faqat <EnforcementProvider> ichida ishlaydi");
  return ctx;
}
