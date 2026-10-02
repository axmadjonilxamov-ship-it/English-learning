"use client";

import { LANGS, LANG_NAMES, LANG_SHORT, useLang } from "@/lib/i18n";

/** Uchta til orasida almashtirish. */
export function LangSwitcher() {
  const { lang, setLang, t } = useLang();

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className="flex shrink-0 overflow-hidden rounded-xl border border-line bg-surface"
    >
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          title={LANG_NAMES[code]}
          className={`px-2.5 py-2 text-xs font-extrabold transition max-sm:px-2 ${
            lang === code ? "bg-brand-600 text-white" : "text-ink-muted hover:bg-surface-2 hover:text-ink"
          }`}
        >
          {LANG_SHORT[code]}
        </button>
      ))}
    </div>
  );
}
