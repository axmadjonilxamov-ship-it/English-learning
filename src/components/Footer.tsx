"use client";

import { Logo } from "./Logo";
import { useT } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  return (
    <footer className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-7 text-sm text-ink-muted max-md:pb-28">
      <Logo size={28} />
      <span>{t("footer.tagline")}</span>
    </footer>
  );
}
