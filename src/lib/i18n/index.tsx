"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANG, isLang, pick, type Lang, type Text } from "./types";
import { UI, type UIKey } from "./ui";
import { LANG_KEY } from "@/lib/boot-script";

export * from "./types";
export { UI } from "./ui";
export type { UIKey } from "./ui";


type Api = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Interfeys matni. */
  t: (key: UIKey) => string;
  /** Ma'lumotlardagi ko'p tilli matn. */
  tx: (value: Text) => string;
  /** Til tanlangani aniqlandimi (birinchi renderda hali yo'q). */
  ready: boolean;
};

const LangContext = createContext<Api | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  // Birinchi render serverdagidek bo'lishi uchun standart tildan boshlaymiz.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LANG_KEY);
    } catch {
      // Maxfiy rejimda o'qib bo'lmaydi — standart til qoladi.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isLang(saved)) setLangState(saved);
    setReady(true);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // Saqlab bo'lmasa ham, shu sessiyada til ishlaydi.
    }
  }, []);

  const api = useMemo<Api>(
    () => ({
      lang,
      setLang,
      ready,
      t: (key) => UI[key]?.[lang] ?? UI[key]?.uz ?? String(key),
      tx: (value) => pick(value, lang),
    }),
    [lang, setLang, ready],
  );

  return <LangContext.Provider value={api}>{children}</LangContext.Provider>;
}

export function useLang(): Api {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang faqat <LangProvider> ichida ishlaydi");
  return ctx;
}

/** Qisqartma: faqat tarjima funksiyasi kerak bo'lganda. */
export function useT() {
  return useLang().t;
}
