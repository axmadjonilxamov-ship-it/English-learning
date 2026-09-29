"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { useSession, signIn, signUp } from "@/lib/auth-client";
import { useT } from "@/lib/i18n";

/** Hisobsiz foydalanish mumkin bo'lgan vaqt. */
const GRACE_MS = 5 * 60 * 1000;

const START_KEY = "englishup:first-visit";

/** Sahifalar, unda oyna chiqmaydi (aks holda kirish imkonsiz bo'lib qoladi). */
const ALLOWED = ["/login", "/register"];

/**
 * Mehmon 5 daqiqadan keyin ro'yxatdan o'tishi kerak.
 * Oyna yopilmaydi — faqat kirish yoki ro'yxatdan o'tish bilan ketadi.
 */
export function AuthGate() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const [due, setDue] = useState(false);

  // Birinchi tashrifdan beri o'tgan vaqtni hisoblaymiz (localStorage faqat brauzerda).
  useEffect(() => {
    if (isPending || session) return;

    // Birinchi tashrif vaqtini eslab qolamiz — sahifa yangilansa ham hisob davom etadi.
    let start = Date.now();
    try {
      const saved = localStorage.getItem(START_KEY);
      if (saved) start = Number(saved) || start;
      else localStorage.setItem(START_KEY, String(start));
    } catch {
      // localStorage yopiq bo'lsa, sanoq shu sahifa uchun boshlanadi.
    }

    const left = start + GRACE_MS - Date.now();
    if (left <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDue(true);
      return;
    }
    const id = setTimeout(() => setDue(true), left);
    return () => clearTimeout(id);
  }, [session, isPending]);

  if (!due || session || isPending || ALLOWED.includes(pathname)) return null;

  return <AuthWall />;
}

function AuthWall() {
  const router = useRouter();
  const t = useT();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isRegister && password.length < 8) {
      setError(t("auth.errShort"));
      return;
    }
    setBusy(true);
    const result = isRegister
      ? await signUp.email({ email, password, name: name.trim() || email.split("@")[0] })
      : await signIn.email({ email, password });
    setBusy(false);

    if (result.error) {
      const m = (result.error.message ?? "").toLowerCase();
      setError(
        m.includes("already") || m.includes("exists")
          ? t("auth.errExists")
          : m.includes("invalid")
            ? t("auth.errInvalid")
            : isRegister
              ? t("auth.errRegister")
              : t("auth.errLogin"),
      );
      return;
    }
    router.refresh();
  };

  const input =
    "w-full rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15";

  return (
    <div className="fixed inset-0 z-[150] grid place-items-center bg-page/95 p-4 backdrop-blur-md">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex justify-center">
          <Logo size={50} />
        </div>

        <div className="card p-7 max-md:p-5">
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-brand-500/10 px-3.5 py-2.5 text-sm text-brand-600 dark:text-brand-400">
            <Icon name="lock" className="size-4 shrink-0" />
            <span>{t("auth.gateExpired")}</span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            {isRegister ? t("auth.gateTitle") : t("auth.gateLogin")}
          </h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            {t("auth.gateLead")}
          </p>

          <form onSubmit={submit} className="mt-5 grid gap-3">
            {isRegister && (
              <label className="grid gap-1.5">
                <span className="text-sm font-bold">{t("auth.name")}</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} />
              </label>
            )}
            <label className="grid gap-1.5">
              <span className="text-sm font-bold">{t("auth.email")}</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={input}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold">{t("auth.password")}</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder={isRegister ? t("auth.passwordHint") : undefined}
                className={input}
              />
            </label>

            {error && (
              <p role="alert" className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm font-semibold text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 w-full rounded-2xl bg-brand-600 py-3.5 font-bold text-white transition hover:bg-brand-500 disabled:opacity-50"
            >
              {busy ? t("common.wait") : isRegister ? t("auth.registerTitle") : t("nav.login")}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-muted">
            {isRegister ? t("auth.haveAccount") : t("auth.noAccount")}
            <button
              type="button"
              onClick={() => {
                setMode(isRegister ? "login" : "register");
                setError(null);
              }}
              className="font-bold text-brand-600 dark:text-brand-400"
            >
              {isRegister ? t("nav.login") : t("auth.registerTitle")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
