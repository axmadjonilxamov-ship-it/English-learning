import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

const FOREVER_LIMIT = 20;

type Body = {
  deviceId?: string;
  violations?: number;
  blockedUntil?: number;
  forever?: boolean;
  /** Yangi qoidabuzarlik bo'lsa, jurnalga yoziladi. */
  logViolation?: boolean;
  /** Test natijasi (foizda) — bo'lsa jurnalga qo'shiladi. */
  quizScore?: number;
};

const toMs = (v: unknown) => (v ? new Date(String(v)).getTime() : 0);

async function currentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

/**
 * Qurilmaning qoidabuzarlik holatini serverga yozadi va eng qattiq holatni
 * qaytaradi — brauzerdagi ma'lumot o'chirilsa ham blok saqlanib qoladi.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const device = String(body.deviceId ?? "").slice(0, 100);
  if (!device) return NextResponse.json({ error: "Qurilma aniqlanmadi" }, { status: 400 });

  const violations = Math.max(0, Math.min(10_000, Math.round(Number(body.violations) || 0)));
  const blockedUntil = Math.max(0, Number(body.blockedUntil) || 0);
  const forever = Boolean(body.forever) || violations > FOREVER_LIMIT;
  const userId = await currentUserId();

  if (body.logViolation) {
    const score =
      typeof body.quizScore === "number" ? Math.max(0, Math.min(100, Math.round(body.quizScore))) : null;
    await sql`
      insert into violation (device_id, user_id, kind, quiz_score)
      values (${device}, ${userId}, 'red_light', ${score})`;
  }

  const rows = await sql`
    insert into device_block (device_id, user_id, violations, blocked_until, forever)
    values (
      ${device},
      ${userId},
      ${violations},
      ${blockedUntil ? new Date(blockedUntil).toISOString() : null}::timestamptz,
      ${forever}
    )
    on conflict (device_id) do update set
      user_id = coalesce(excluded.user_id, device_block.user_id),
      violations = greatest(device_block.violations, excluded.violations),
      blocked_until = greatest(device_block.blocked_until, excluded.blocked_until),
      forever = device_block.forever or excluded.forever,
      updated_at = now()
    returning violations, blocked_until, forever`;

  const row = rows[0];
  return NextResponse.json({
    violations: Number(row.violations),
    blockedUntil: toMs(row.blocked_until),
    forever: Boolean(row.forever),
  });
}

/** Sahifa ochilganda serverdagi holatni tekshiradi. */
export async function GET(request: Request) {
  const device = new URL(request.url).searchParams.get("device") ?? "";
  if (!device) return NextResponse.json({ violations: 0, blockedUntil: 0, forever: false });

  const rows = await sql`
    select violations, blocked_until, forever from device_block where device_id = ${device}`;
  const row = rows[0];
  if (!row) return NextResponse.json({ violations: 0, blockedUntil: 0, forever: false });

  return NextResponse.json({
    violations: Number(row.violations),
    blockedUntil: toMs(row.blocked_until),
    forever: Boolean(row.forever),
  });
}
