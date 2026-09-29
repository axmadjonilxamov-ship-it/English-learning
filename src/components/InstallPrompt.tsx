"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { useT } from "@/lib/i18n";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const HIDE_KEY = "englishup:install-hidden";

/**
 * Servis-ishchini ro'yxatdan o'tkazadi va saytni qurilmaga o'rnatishni taklif qiladi.
 * Android/Windows'da tizim taklifi, iPhone'da esa qo'lda qo'shish yo'riqnomasi chiqadi.
 */
export function InstallPrompt() {
  const t = useT();
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Ro'yxatdan o'tmasa ham sayt normal ishlaydi.
      });
    }

    try {
      if (localStorage.getItem(HIDE_KEY)) return;
    } catch {
      return;
    }

    // Allaqachon o'rnatilgan bo'lsa, taklif kerak emas.
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iPhone/iPad Safari `beforeinstallprompt` ni qo'llab-quvvatlamaydi.
    const ua = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    if (isIos && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)) {
      const id = setTimeout(() => {
        setIosHint(true);
        setHidden(false);
      }, 20_000);
      return () => {
        clearTimeout(id);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const close = () => {
    setHidden(true);
    try {
      localStorage.setItem(HIDE_KEY, "1");
    } catch {
      // Eslab qololmasa, keyingi safar yana chiqadi — bu xavfli emas.
    }
  };

  if (hidden || (!event && !iosHint)) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-[460px] max-md:bottom-24">
      <div className="card flex items-center gap-3 p-4 shadow-2xl">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
          <Icon name="cards" />
        </div>
        <div className="min-w-0 flex-1">
          <b className="block text-sm">{t("install.title")}</b>
          <span className="text-xs text-ink-muted">
            {iosHint ? t("install.ios") : t("install.offline")}
          </span>
        </div>
        {event && (
          <button
            type="button"
            onClick={async () => {
              await event.prompt();
              await event.userChoice;
              close();
            }}
            className="shrink-0 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white"
          >
            {t("install.button")}
          </button>
        )}
        <button
          type="button"
          onClick={close}
          aria-label={t("common.close")}
          className="shrink-0 text-ink-muted hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
