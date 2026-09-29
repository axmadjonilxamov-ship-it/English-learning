"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { TOTAL_LESSONS } from "@/data";
import { useLang, useT } from "@/lib/i18n";

type Totals = {
  users: string;
  active_sessions: string;
  lessons_done: string;
  violations: string;
  banned_devices: string;
  blocked_now: string;
};

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  created_at: string;
  lessons: string;
  violations: string;
  banned: boolean | null;
  blocked_until: string | null;
};

type DeviceRow = {
  device_id: string;
  violations: string;
  blocked_until: string | null;
  forever: boolean;
  user_id: string | null;
  updated_at: string;
};

type RecentRow = { kind: string; quiz_score: number | null; created_at: string; name: string | null };

type Data = { totals: Totals; users: UserRow[]; devices: DeviceRow[]; recent: RecentRow[] };

const when = (v: string | null, locale: string) => (v ? new Date(v).toLocaleString(locale) : "—");
const isBlocked = (until: string | null) => !!until && new Date(until).getTime() > Date.now();

type Gate = "loading" | "open" | "locked" | "anonymous" | "not-admin" | "failed";

export default function AdminPage() {
  const { t, lang } = useLang();
  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "uz-UZ";
  const [data, setData] = useState<Data | null>(null);
  const [gate, setGate] = useState<Gate>("loading");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin");
      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        // "locked" — hisob admin, faqat parol kerak.
        setGate(body.reason === "locked" ? "locked" : body.reason === "anonymous" ? "anonymous" : "not-admin");
        return;
      }
      if (!res.ok) throw new Error();
      setData(await res.json());
      setGate("open");
    } catch {
      setGate("failed");
    }
  }, []);

  // Sahifa ochilganda ma'lumotni serverdan yuklaymiz.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const act = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (gate === "loading") return <p className="py-20 text-center text-ink-muted">{t("common.loading")}</p>;
  if (gate === "locked") return <PasswordGate onUnlocked={load} />;
  if (gate !== "open" || !data) {
    const message =
      gate === "anonymous"
        ? t("admin.needLogin")
        : gate === "not-admin"
          ? t("admin.noRights")
          : t("admin.loadFailed");
    return (
      <div className="anim-enter mx-auto max-w-[460px] py-16 text-center">
        <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-red-500/10 text-red-500">
          <Icon name="lock" className="size-10" />
        </div>
        <h1 className="text-2xl font-extrabold">{message}</h1>
        {gate === "not-admin" && (
          <p className="mt-2 text-sm text-ink-muted">
            Admin huquqini bazada belgilang:
            <code className="mt-2 block rounded-lg bg-surface-2 p-2 text-xs">
              update &quot;user&quot; set role = &apos;admin&apos; where email = &apos;...&apos;;
            </code>
          </p>
        )}
        <Link
          href={gate === "anonymous" ? "/login" : "/"}
          className="mt-6 inline-block rounded-2xl bg-brand-600 px-5 py-3 font-bold text-white"
        >
          {gate === "anonymous" ? t("nav.login") : t("common.homepage")}
        </Link>
      </div>
    );
  }

  const totals = data.totals;

  return (
    <div className="anim-enter">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[clamp(1.6rem,4vw,2.1rem)] font-extrabold tracking-tight">{t("admin.title")}</h1>
          <p className="text-ink-muted">{t("admin.lead")}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 font-bold transition hover:bg-surface-2 disabled:opacity-50"
          >
            <Icon name="refresh" className="size-4" /> {t("common.refresh")}
          </button>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/unlock", { method: "DELETE" });
              setGate("locked");
              setData(null);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 font-bold transition hover:bg-surface-2"
          >
            <Icon name="lock" className="size-4" /> {t("admin.lock")}
          </button>
        </div>
      </div>

      {/* Umumiy raqamlar */}
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
        {[
          { label: t("admin.users"), value: totals.users, icon: "user" as const },
          { label: t("admin.activeSessions"), value: totals.active_sessions, icon: "cloud" as const },
          { label: t("admin.lessonsDone"), value: totals.lessons_done, icon: "check" as const },
          { label: t("admin.violations"), value: totals.violations, icon: "quiz" as const },
          { label: t("admin.blockedNow"), value: totals.blocked_now, icon: "lock" as const },
          { label: t("admin.bannedForever"), value: totals.banned_devices, icon: "lock" as const },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <Icon name={s.icon} className="mb-2 size-5 text-ink-muted" />
            <b className="block text-2xl font-extrabold leading-tight">{s.value}</b>
            <span className="text-xs text-ink-muted">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Foydalanuvchilar */}
      <h2 className="mb-3 mt-10 text-xl font-extrabold">{t("admin.users")} ({data.users.length})</h2>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              {[
                t("admin.colName"),
                t("admin.colEmail"),
                t("admin.colLessons"),
                t("admin.colViolations"),
                t("admin.colStatus"),
                t("admin.colJoined"),
                t("admin.colActions"),
              ].map((h) => (
                <th key={h} className="px-4 py-3 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => {
              const blocked = isBlocked(u.blocked_until);
              return (
                <tr key={u.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <b>{u.name || "—"}</b>
                    {u.role === "admin" && (
                      <span className="ml-2 rounded-full bg-brand-500/15 px-2 py-0.5 text-[0.65rem] font-bold text-brand-600 dark:text-brand-400">
                        ADMIN
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.lessons}/{TOTAL_LESSONS}
                  </td>
                  <td className="px-4 py-3">{u.violations}</td>
                  <td className="px-4 py-3">
                    {u.banned ? (
                      <span className="font-bold text-red-500">{t("admin.statusForever")}</span>
                    ) : blocked ? (
                      <span className="font-bold text-amber-500">{when(u.blocked_until, locale)} {t("admin.statusUntil")}</span>
                    ) : (
                      <span className="text-green-600">{t("admin.statusActive")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{when(u.created_at, locale)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act({ action: "block", userId: u.id, minutes: 10 })}
                        className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-600 hover:bg-amber-500/25"
                      >
                        {t("admin.block10")}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act({ action: u.banned ? "unban" : "ban", userId: u.id })}
                        className="rounded-lg bg-red-500/15 px-2.5 py-1 text-xs font-bold text-red-500 hover:bg-red-500/25"
                      >
                        {u.banned ? t("admin.unbanBtn") : t("admin.banBtn")}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act({ action: "unblock", userId: u.id })}
                        className="rounded-lg bg-green-500/15 px-2.5 py-1 text-xs font-bold text-green-600 hover:bg-green-500/25"
                      >
                        {t("admin.unblockBtn")}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act({ action: u.role === "admin" ? "remove-admin" : "make-admin", userId: u.id })}
                        className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-bold text-ink-muted hover:bg-line"
                      >
                        {u.role === "admin" ? t("admin.removeAdmin") : t("admin.makeAdmin")}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Qurilmalar */}
      <h2 className="mb-3 mt-10 text-xl font-extrabold">{t("admin.devices")} ({data.devices.length})</h2>
      {data.devices.length === 0 ? (
        <p className="card p-5 text-ink-muted">{t("admin.noViolations")}</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                {[t("admin.colDevice"), t("admin.colViolations"), t("admin.colStatus"), t("admin.colLast"), t("admin.colActions")].map((h) => (
                  <th key={h} className="px-4 py-3 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.devices.map((d) => (
                <tr key={d.device_id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{d.device_id.slice(0, 18)}…</td>
                  <td className="px-4 py-3 font-bold">{d.violations}</td>
                  <td className="px-4 py-3">
                    {d.forever ? (
                      <span className="font-bold text-red-500">{t("admin.statusForever")}</span>
                    ) : isBlocked(d.blocked_until) ? (
                      <span className="font-bold text-amber-500">{t("admin.statusForever")}</span>
                    ) : (
                      <span className="text-green-600">{t("admin.statusActive")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{when(d.updated_at, locale)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act({ action: d.forever ? "unban" : "ban", deviceId: d.device_id })}
                        className="rounded-lg bg-red-500/15 px-2.5 py-1 text-xs font-bold text-red-500 hover:bg-red-500/25"
                      >
                        {d.forever ? t("admin.unbanBtn") : t("admin.banBtn")}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act({ action: "unblock", deviceId: d.device_id })}
                        className="rounded-lg bg-green-500/15 px-2.5 py-1 text-xs font-bold text-green-600 hover:bg-green-500/25"
                      >
                        {t("admin.unblockBtn")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Oxirgi qoidabuzarliklar */}
      {data.recent.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 text-xl font-extrabold">{t("admin.recent")}</h2>
          <div className="card divide-y divide-line">
            {data.recent.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="text-lg">🚦</span>
                <span className="flex-1">
                  <b>{r.name || t("admin.guest")}</b> {t("admin.ranRed")}
                  {r.quiz_score !== null && (
                    <span className="text-ink-muted">
                      {" "}
                      · {t("admin.test")} {r.quiz_score}%
                    </span>
                  )}
                </span>
                <span className="text-xs text-ink-muted">{when(r.created_at, locale)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Admin paneli parol bilan qulflangan — hisob admin bo'lsa ham parol so'raladi. */
function PasswordGate({ onUnlocked }: { onUnlocked: () => void }) {
  const t = useT();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword("");
        onUnlocked();
        return;
      }
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? t("auth.errInvalid"));
    } catch {
      setError(t("tr.errorNet"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="anim-enter mx-auto max-w-[400px] py-12">
      <div className="mb-6 flex justify-center">
        <div className="grid size-16 place-items-center rounded-2xl bg-brand-600 text-white">
          <Icon name="lock" className="size-8" />
        </div>
      </div>
      <div className="card p-7 max-md:p-5">
        <h1 className="text-center text-xl font-extrabold tracking-tight">{t("admin.locked")}</h1>
        <p className="mt-1.5 text-center text-sm text-ink-muted">{t("admin.enterPassword")}</p>

        <form onSubmit={submit} className="mt-6 grid gap-3">
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder={t("admin.passwordField")}
            className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-center text-lg tracking-widest outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
          />

          {error && (
            <p role="alert" className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-center text-sm font-semibold text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !password}
            className="w-full rounded-2xl bg-brand-600 py-3.5 font-bold text-white transition hover:bg-brand-500 disabled:opacity-50"
          >
            {busy ? t("admin.checking") : t("nav.login")}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-ink-muted">
          {t("admin.passwordNote")}
        </p>
      </div>
      <p className="mt-4 text-center text-sm">
        <Link href="/" className="text-ink-muted hover:text-ink">
          {t("common.homepage")}
        </Link>
      </p>
    </div>
  );
}
