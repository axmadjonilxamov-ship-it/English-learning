"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { signIn, signUp } from "@/lib/auth-client";
import { useT } from "@/lib/i18n";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const t = useT();

  /** Better-auth xabarini foydalanuvchi tiliga o'giradi. */
  const translateError = (message: string | undefined, fallback: string) => {
    const m = (message ?? "").toLowerCase();
    if (m.includes("invalid") && (m.includes("email") || m.includes("password"))) return t("auth.errInvalid");
    if (m.includes("already") || m.includes("exists")) return t("auth.errExists");
    if (m.includes("password") && m.includes("short")) return t("auth.errShort");
    if (m.includes("failed to fetch") || m.includes("network")) return t("tr.errorNet");
    return fallback;
  };
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      setError(
        translateError(
          result.error.message,
          isRegister ? t("auth.errRegister") : t("auth.errLogin"),
        ),
      );
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="anim-enter mx-auto max-w-[420px] py-6">
      <div className="mb-7 flex justify-center">
        <Logo size={52} />
      </div>

      <div className="card p-7 max-md:p-5">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {isRegister ? t("auth.registerTitle") : t("auth.welcome")}
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          {isRegister
            ? t("auth.registerLead")
            : t("auth.loginLead")}
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-3.5">
          {isRegister && (
            <Field label={t("auth.name")}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Masalan: Aziz"
                className={inputClass}
              />
            </Field>
          )}

          <Field label={t("auth.email")}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="siz@example.com"
              className={inputClass}
            />
          </Field>

          <Field label={t("auth.password")}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder={isRegister ? t("auth.passwordHint") : "••••••••"}
              className={inputClass}
            />
          </Field>

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
          <Link href={isRegister ? "/login" : "/register"} className="font-bold text-brand-600 dark:text-brand-400">
            {isRegister ? t("nav.login") : t("auth.registerTitle")}
          </Link>
        </p>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-ink-muted">
        <Icon name="lock" className="size-3.5" /> {t("auth.safe")}
      </p>
      <p className="mt-3 text-center text-sm">
        <Link href="/" className="text-ink-muted hover:text-ink">
          {t("auth.continueGuest")}
        </Link>
      </p>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}
