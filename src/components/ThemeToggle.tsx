"use client";

import { Icon } from "./Icon";
import { useT } from "@/lib/i18n";
import { THEME_KEY } from "@/lib/boot-script";

export function ThemeToggle() {
  const t = useT();
  // Joriy mavzu React holatida emas, `html` elementidagi klassda saqlanadi.
  // Shuning uchun ikkala ikonkani ham chizamiz va kerakligini CSS ko'rsatadi —
  // bu server va brauzer o'rtasidagi nomuvofiqlikning oldini oladi.
  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {
      // localStorage yopiq bo'lsa ham mavzu shu sessiyada ishlaydi.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("nav.theme")}
      className="grid size-10 place-items-center rounded-xl border border-line bg-surface text-ink transition hover:-rotate-12"
    >
      <Icon name="sun" className="hidden size-5 dark:block" />
      <Icon name="moon" className="size-5 dark:hidden" />
    </button>
  );
}
