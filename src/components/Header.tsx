"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo, LogoMark } from "./Logo";
import { Icon, type IconName } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";
import { useSession, signOut } from "@/lib/auth-client";
import { LangSwitcher } from "./LangSwitcher";
import { StreakBadge } from "./StreakBadge";
import { useT, type UIKey } from "@/lib/i18n";

const NAV: { href: string; label: UIKey; icon: IconName }[] = [
  { href: "/", label: "nav.city", icon: "map" },
  { href: "/translate", label: "nav.translate", icon: "translate" },
  { href: "/ielts", label: "nav.ielts", icon: "award" },
];

/**
 * Menyu havolalari. Bir xil ro'yxat ikki joyda ishlatiladi: keng ekranda
 * sarlavha ichida, telefonda esa ekran pastidagi panelda.
 */
function NavLinks({
  variant,
  isActive,
}: {
  variant: "bar" | "bottom";
  isActive: (href: string) => boolean;
}) {
  const t = useT();
  const shape =
    variant === "bottom"
      ? "flex-1 flex-col gap-0.5 px-1 py-2 text-[0.68rem]"
      : "gap-2 px-3.5 py-2 text-[0.95rem] max-lg:gap-1.5 max-lg:px-2 max-lg:text-[0.875rem]";

  return NAV.map(({ href, label, icon }) => {
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center rounded-xl font-semibold transition ${shape} ${
          active
            ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
            : "text-ink-muted hover:bg-surface-2 hover:text-ink"
        }`}
      >
        <Icon name={icon} className={variant === "bottom" ? "size-[22px]" : "size-[18px]"} />
        <span>{t(label)}</span>
      </Link>
    );
  });
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const t = useT();

  // Kurs yo'li va dars sahifalarida "Shaharcha" bo'limi faol bo'lib turadi.
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/" || pathname.startsWith("/path") || pathname.startsWith("/lesson")
      : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-3 z-50 mx-auto mt-3 flex w-[calc(100%-2rem)] max-w-[1280px] items-center gap-4 rounded-2xl border border-line bg-surface/80 px-4 py-2.5 backdrop-blur-xl max-md:top-2 max-md:w-[calc(100%-1rem)] max-md:bg-surface">
      <Link href="/" aria-label="Bosh sahifa">
        {/* Keng ekranda to'liq logotip; tor ekranda esa faqat belgi, aks holda
            menyu va o'ng tomondagi tugmalar sarlavhaga sig'may qoladi. */}
        <Logo className="max-lg:hidden" />
        <LogoMark size={38} className="lg:hidden" />
      </Link>

      <nav aria-label={t("nav.menu")} className="mx-auto flex gap-1 max-md:hidden">
        <NavLinks variant="bar" isActive={isActive} />
      </nav>

      <div className="flex items-center gap-2">
        {isPending ? (
          <div className="size-10 animate-pulse rounded-xl bg-surface-2" />
        ) : session ? (
          <div className="group relative">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-xl bg-brand-600 font-bold text-white"
              aria-label={t("nav.profile")}
            >
              {(session.user.name || session.user.email || "?").charAt(0).toUpperCase()}
            </button>
            <div className="invisible absolute right-0 top-full w-56 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div className="card overflow-hidden p-1 shadow-xl">
                <div className="px-3 py-2">
                  <p className="truncate font-bold">{session.user.name || t("nav.user")}</p>
                  <p className="truncate text-sm text-ink-muted">{session.user.email}</p>
                </div>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 border-t border-line px-3 py-2 font-semibold hover:bg-surface-2"
                >
                  <Icon name="quiz" className="size-4" /> {t("nav.admin")}
                </Link>
                <Link
                  href="/certificate"
                  className="flex items-center gap-2 border-t border-line px-3 py-2 font-semibold hover:bg-surface-2"
                >
                  <Icon name="award" className="size-4" /> {t("nav.certificate")}
                </Link>
                <p className="flex items-center gap-2 border-t border-line px-3 py-2 text-xs text-ink-muted">
                  <Icon name="cloud" className="size-4" /> {t("nav.synced")}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    router.refresh();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-semibold text-red-500 hover:bg-surface-2"
                >
                  <Icon name="logout" className="size-4" /> {t("nav.logout")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-bold transition hover:bg-surface-2 max-sm:px-3"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-500 max-lg:hidden"
            >
              {t("nav.register")}
            </Link>
          </>
        )}

        <StreakBadge />
        <LangSwitcher />
        <ThemeToggle />
      </div>
      </header>

      {/* Telefonda menyu ekran pastida turadi.
          MUHIM: bu panel sarlavha ichida bo'lmasligi kerak. Sarlavhada
          `backdrop-blur` bor, `backdrop-filter` esa ichidagi `fixed`
          elementlar uchun tayanch (containing block) yasaydi — natijada
          panel ekran tagiga emas, sarlavhaning o'ziga nisbatan joylashib,
          uning ustiga chiqib qolardi. */}
      <nav
        aria-label={t("nav.menu")}
        className="fixed inset-x-2 bottom-2 z-50 hidden justify-around rounded-[1.25rem] border border-line bg-surface/95 p-1.5 shadow-lg backdrop-blur-xl max-md:flex"
      >
        <NavLinks variant="bottom" isActive={isActive} />
      </nav>
    </>
  );
}
