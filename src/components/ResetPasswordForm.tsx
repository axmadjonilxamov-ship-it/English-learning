"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { Field, inputClass } from "./AuthForm";
import { authClient } from "@/lib/auth-client";
import { useT } from "@/lib/i18n";

/**
 * Yangi parol o'rnatish.
 *
 * `token` xatdagi havoladan keladi. Havola noto'g'ri yoki eskirgan bo'lsa,
 * better-auth bizni `?error=INVALID_TOKEN` bilan qaytaradi — o'shanda shu
 * yerda yangi havola so'rash taklif qilinadi.
 */
export function ResetPasswordForm({ token, invalid }: { token: string | null; invalid: boolean }) {
  const t = useT();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const broken = invalid || !token;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("auth.errShort"));
      return;
    }
    if (password !== repeat) {
      setError(t("reset.errMismatch"));
      return;
    }

    setBusy(true);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token: token ?? "" });
      if (result.error) {
        const message = (result.error.message ?? "").toLowerCase();
        setError(message.includes("token") ? t("reset.errToken") : t("reset.errGeneric"));
        return;
      }
      setDone(true);
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
        {done ? (
          <>
            <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-green-500/15 text-green-600 dark:text-green-400">
              <Icon name="check" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">{t("reset.doneTitle")}</h1>
            <p className="mt-1.5 text-sm text-ink-muted">{t("reset.doneLead")}</p>
            <button
              type="button"
              onClick={() => {
                router.push("/login");
                router.refresh();
              }}
              className="mt-6 w-full rounded-2xl bg-brand-600 py-3.5 font-bold text-white transition hover:bg-brand-500"
            >
              {t("nav.login")}
            </button>
          </>
        ) : broken ? (
          <>
            <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-red-500/15 text-red-500">
              <Icon name="lock" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">{t("reset.errToken")}</h1>
            <p className="mt-1.5 text-sm text-ink-muted">{t("reset.tokenLead")}</p>
            <Link
              href="/forgot-password"
              className="mt-6 block rounded-2xl bg-brand-600 py-3.5 text-center font-bold text-white transition hover:bg-brand-500"
            >
              {t("reset.requestAgain")}
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold tracking-tight">{t("reset.title")}</h1>
            <p className="mt-1.5 text-sm text-ink-muted">{t("reset.lead")}</p>

            <form onSubmit={submit} className="mt-6 grid gap-3.5">
              <Field label={t("reset.newPassword")}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder={t("auth.passwordHint")}
                  className={inputClass}
                />
              </Field>

              <Field label={t("reset.repeat")}>
                <input
                  type="password"
                  required
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
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
                {busy ? t("common.wait") : t("reset.save")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
