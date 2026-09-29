"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { LogoMark } from "@/components/Logo";
import { LEVELS, TOTAL_LESSONS, TOTAL_TASKS } from "@/data";
import { useProgress } from "@/lib/progress";
import { useSession } from "@/lib/auth-client";
import { useLang } from "@/lib/i18n";

/** Sertifikat raqami — bir xil foydalanuvchi uchun doim bir xil chiqadi. */
function certificateNumber(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `ELC-${String((h >>> 0) % 1_000_000).padStart(6, "0")}`;
}

export default function CertificatePage() {
  const { totals, levelProgress, ready } = useProgress();
  const { data: session, isPending } = useSession();
  const { t, lang } = useLang();

  const all = totals();
  const completed = all.done >= TOTAL_LESSONS;
  const name = session?.user?.name?.trim();

  if (isPending || !ready) {
    return <p className="py-20 text-center text-ink-muted">{t("common.loading")}</p>;
  }

  // Hali tugatilmagan — nima qolganini ko'rsatamiz.
  if (!completed) {
    return (
      <div className="anim-enter mx-auto max-w-[640px] py-6 text-center">
        <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-surface-2 text-ink-muted">
          <Icon name="award" className="size-10" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">{t("cert.notReady")}</h1>
        <p className="mt-2 text-ink-muted">
          {t("cert.needAll")} {TOTAL_LESSONS} {t("cert.needAll2")}
        </p>

        <div className="card mt-6 p-5 text-left">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500 transition-[width] duration-500"
                style={{ width: `${all.percent}%` }}
              />
            </div>
            <b className="text-sm">
              {all.done}/{all.total}
            </b>
          </div>
          <div className="grid gap-1.5">
            {LEVELS.map((level) => {
              const p = levelProgress(level);
              const done = p.done === p.total;
              return (
                <Link
                  key={level.id}
                  href={`/path/${level.id}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-surface-2"
                >
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                      done ? "bg-green-500 text-white" : "bg-surface-2 text-ink-muted"
                    }`}
                  >
                    {done ? <Icon name="check" className="size-4" strokeWidth={3} /> : p.done}
                  </span>
                  <span className="flex-1 font-semibold">{level.full ?? level.name}</span>
                  <small className="text-ink-muted">
                    {p.done}/{p.total}
                  </small>
                </Link>
              );
            })}
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 font-bold text-white transition hover:bg-brand-500"
        >
          {t("cert.keepLearning")} <Icon name="right" className="size-4" />
        </Link>
      </div>
    );
  }

  // Tugatgan, lekin hisobsiz — ismni bilmaymiz.
  if (!name) {
    return (
      <div className="anim-enter mx-auto max-w-[520px] py-6 text-center">
        <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-accent-500/15 text-accent-500">
          <Icon name="award" className="size-10" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">{t("cert.congrats")}</h1>
        <p className="mt-2 text-ink-muted">
          {t("cert.needName")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Link href="/register" className="rounded-2xl bg-brand-600 px-6 py-3.5 font-bold text-white transition hover:bg-brand-500">
            {t("auth.registerTitle")}
          </Link>
          <Link href="/login" className="rounded-2xl border border-line px-6 py-3.5 font-bold transition hover:bg-surface-2">
            {t("nav.login")}
          </Link>
        </div>
      </div>
    );
  }

  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "uz-UZ";
  const date = new Date().toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  const number = certificateNumber(session!.user.id);

  return (
    <div className="anim-enter mx-auto max-w-[900px]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t("cert.ready")}</h1>
          <p className="text-ink-muted">{TOTAL_LESSONS} {t("cert.allDone")}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 font-bold text-white transition hover:bg-brand-500"
        >
          <Icon name="print" className="size-5" /> {t("cert.print")}
        </button>
      </div>

      {/* Sertifikat */}
      <div className="certificate relative overflow-hidden rounded-2xl border-[3px] border-brand-700 bg-white p-10 text-center text-[#1f2937] shadow-2xl max-md:p-5">
        <div className="pointer-events-none absolute inset-3 rounded-xl border border-accent-500/50" />

        <div className="relative">
          <div className="mb-5 flex items-center justify-center gap-3">
            <LogoMark size={54} className="[&_path]:fill-brand-700" />
            <span className="flex flex-col items-start leading-none">
              <span className="font-display text-2xl font-extrabold text-brand-700">English</span>
              <span className="mt-1 text-[0.5rem] font-bold uppercase tracking-[0.3em] text-gray-500">
                Learning Center
              </span>
            </span>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.35em] text-accent-600">{t("cert.word")}</p>
          <h2 className="mt-2 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold text-brand-700">
            Certificate of Completion
          </h2>

          <p className="mt-7 text-sm text-gray-500">{t("cert.thisCertifies")}</p>
          <p className="mt-2 border-b-2 border-accent-500/60 pb-2 font-display text-[clamp(1.6rem,5vw,2.4rem)] font-extrabold">
            {name}
          </p>
          <p className="mx-auto mt-4 max-w-[560px] text-[0.98rem] leading-relaxed text-gray-600">
            {t("cert.body1")} <b className="text-gray-900">English Learning Center</b> — {t("cert.body2")}{" "}
            <b className="text-gray-900">{TOTAL_LESSONS}</b> {t("cert.body3")}{" "}
            <b className="text-gray-900">{TOTAL_TASKS}</b> {t("cert.body4")}
          </p>

          <div className="mx-auto mt-7 flex max-w-[560px] flex-wrap justify-center gap-2">
            {LEVELS.map((level) => (
              <span
                key={level.id}
                className="rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ background: level.palette[1] }}
              >
                {level.name} · {level.cefr}
              </span>
            ))}
          </div>

          <div className="mt-9 flex items-end justify-between gap-4 text-left max-md:flex-col max-md:items-center max-md:text-center">
            <div>
              <p className="border-t border-gray-400 pt-1.5 text-xs text-gray-500">{t("cert.date")}</p>
              <p className="font-bold">{date}</p>
            </div>

            <div className="grid size-20 shrink-0 place-items-center rounded-full border-[3px] border-accent-500 text-accent-600">
              <Icon name="award" className="size-9" />
            </div>

            <div className="max-md:order-first">
              <p className="border-t border-gray-400 pt-1.5 text-xs text-gray-500">{t("cert.number")}</p>
              <p className="font-mono font-bold">{number}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-ink-muted print:hidden">
        {t("cert.printHint")}
      </p>
    </div>
  );
}
