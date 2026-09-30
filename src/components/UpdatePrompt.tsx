"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "./Icon";
import { useT } from "@/lib/i18n";

/**
 * "Ilovani yangilang" bildirishnomasi.
 *
 * Sahifa ochilganda unga qurilish belgisi tikilgan bo'ladi. Vaqti-vaqti bilan
 * serverdagi belgi so'raladi; farq chiqsa — sayt yangilangan, lekin
 * foydalanuvchida eski versiya turibdi. Shunda tepada bildirishnoma chiqadi.
 *
 * Bu, ayniqsa, qurilmaga o'rnatilgan ilova (PWA) uchun kerak: u haftalab
 * yopilmasligi mumkin va o'zi yangilanmaydi.
 */

/** Shu sahifa yuklanganda amal qilgan versiya (qurilish vaqtida tikiladi). */
const CURRENT = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";

/** Har 10 daqiqada bir tekshiramiz — bundan tez-tez qilishning ma'nosi yo'q. */
const CHECK_MS = 10 * 60 * 1000;

export function UpdatePrompt() {
  const t = useT();
  /** Serverdagi yangi versiya belgisi (topilgan bo'lsa). */
  const [fresh, setFresh] = useState<string | null>(null);
  /** Foydalanuvchi yopib qo'ygan versiya — qayta bezovta qilmaymiz. */
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/version", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { build?: string };
      if (data.build && data.build !== CURRENT) setFresh(data.build);
    } catch {
      // Internet yo'q bo'lsa tekshirib bo'lmaydi — keyingi urinishda ko'ramiz.
    }
  }, []);

  useEffect(() => {
    // Sahifa hozir yuklandi, demak u allaqachon eng yangisi — darhol
    // tekshirishning ma'nosi yo'q. Vaqt o'tgach yoki ilovaga qaytilganda
    // tekshiramiz.
    const id = setInterval(check, CHECK_MS);
    // Foydalanuvchi boshqa ilovadan qaytganda ham tekshiramiz — PWA uzoq
    // vaqt fonda turgan bo'lishi mumkin.
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [check]);

  /** Keshni tozalab, sahifani qayta yuklaydi. */
  const update = async () => {
    setBusy(true);
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      const registration = await navigator.serviceWorker?.getRegistration();
      await registration?.update();
    } catch {
      // Keshni tozalay olmasak ham qayta yuklash ko'p hollarda yetarli.
    }
    location.reload();
  };

  if (!fresh || fresh === dismissed) return null;

  return (
    <div className="anim-enter fixed inset-x-3 top-[5.5rem] z-40 mx-auto max-w-[460px]">
      <div className="card flex items-center gap-3 p-4 shadow-2xl">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
          <Icon name="refresh" />
        </div>
        <div className="min-w-0 flex-1">
          <b className="block text-sm">{t("update.title")}</b>
          <span className="text-xs text-ink-muted">{t("update.desc")}</span>
        </div>
        <button
          type="button"
          onClick={update}
          disabled={busy}
          className="shrink-0 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-500 disabled:opacity-50"
        >
          {busy ? t("common.wait") : t("update.button")}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(fresh)}
          aria-label={t("common.close")}
          className="shrink-0 text-ink-muted transition hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
