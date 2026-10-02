"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { Field, inputClass } from "./AuthForm";
import { authClient } from "@/lib/auth-client";
import { useT } from "@/lib/i18n";

/**
 * Parolni tiklash so'rovi.
 *
 * Manzil tizimda bor-yo'qligidan qat'i nazar bir xil xabar ko'rsatiladi —
 * aks holda tashqaridan kimning hisobi borligini bilib olish mumkin bo'lardi.
 */
export function ForgotPasswordForm() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      });
      if (result.error) {
        setError(t("forgot.errSend"));
        return;
      }
      setSent(true);
    } catch {
      setError(t("tr.errorNet"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="anim-enter mx-auto max-w-[420px] py-6">
      <div className="mb-7 flex justify-center">
        <Logo size={52} />
      </div>

      <div className="card p-7 max-md:p-5">
        {sent ? (
          <>
            <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-green-500/15 text-green-600 dark:text-green-400">
              <Icon name="check" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">{t("forgot.sentTitle")}</h1>
            <p className="mt-1.5 text-sm text-ink-muted">{t("forgot.sentLead")}</p>
            <Link
              href="/login"
              className="mt-6 block rounded-2xl bg-brand-600 py-3.5 text-center font-bold text-white transition hover:bg-brand-500"
            >
              {t("forgot.backToLogin")}
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold tracking-tight">{t("forgot.title")}</h1>
            <p className="mt-1.5 text-sm text-ink-muted">{t("forgot.lead")}</p>

            <form onSubmit={submit} className="mt-6 grid gap-3.5">
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
                {busy ? t("common.wait") : t("forgot.send")}
              </button>
            </form>

            <p className="mt-5 text-center text-sm">
              <Link href="/login" className="font-bold text-brand-600 dark:text-brand-400">
                {t("forgot.backToLogin")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
