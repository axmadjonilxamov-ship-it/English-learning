import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import {
  UNLOCK_COOKIE,
  UNLOCK_TTL_MS,
  checkAdminPassword,
  currentAdminCandidate,
  makeUnlockToken,
} from "@/lib/admin";
import { sql } from "@/lib/db";

/**
 * Parolni taxmin qilishga qarshi cheklov: bitta IP dan 1 daqiqada 5 tadan
 * ortiq urinish bo'lsa, 5 daqiqaga to'xtatiladi.
 *
 * Hisob bazada saqlanadi, xotirada emas — Vercel kabi muhitlarda har bir
 * so'rov boshqa nusxada bajarilishi mumkin, xotiradagi hisob esa ular
 * o'rtasida bo'linmaydi va cheklovni chetlab o'tish mumkin bo'lib qoladi.
 */
const MAX_TRIES = 5;
const WINDOW_SECONDS = 60;
const LOCKOUT_SECONDS = 5 * 60;

async function rateLimit(key: string): Promise<{ allowed: boolean; waitMs: number }> {
  const rows = await sql`
    insert into login_attempt (key, count, window_end)
    values (${key}, 1, now() + make_interval(secs => ${WINDOW_SECONDS}))
    on conflict (key) do update set
      -- Blok davom etayotgan bo'lsa, hisobni o'zgartirmaymiz.
      count = case
        when login_attempt.locked_until > now() then login_attempt.count
        when login_attempt.window_end <= now() then 1
        else login_attempt.count + 1
      end,
      window_end = case
        when login_attempt.window_end <= now() and login_attempt.locked_until <= now()
          then now() + make_interval(secs => ${WINDOW_SECONDS})
        when login_attempt.locked_until > now() then login_attempt.window_end
        else login_attempt.window_end
      end,
      locked_until = case
        when login_attempt.locked_until > now() then login_attempt.locked_until
        when login_attempt.window_end > now() and login_attempt.count + 1 > ${MAX_TRIES}
          then now() + make_interval(secs => ${LOCKOUT_SECONDS})
        else login_attempt.locked_until
      end,
      updated_at = now()
    returning
      count,
      greatest(0, extract(epoch from (locked_until - now())))::int as wait_seconds`;

  const row = rows[0];
  const wait = Number(row?.wait_seconds ?? 0);
  return { allowed: wait <= 0, waitMs: wait * 1000 };
}

/** Muvaffaqiyatli kirishdan keyin hisobni tozalaymiz. */
async function clearAttempts(key: string) {
  await sql`delete from login_attempt where key = ${key}`;
}

/** Parolni tekshiradi va muvaffaqiyatli bo'lsa imzolangan cookie qo'yadi. */
export async function POST(request: Request) {
  const userId = await currentAdminCandidate();
  // Parolni faqat admin hisobiga kirgan foydalanuvchi sinay oladi.
  if (!userId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const head = await headers();
  const ip = head.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  // Hisob IP va foydalanuvchi bo'yicha yuritiladi.
  const limit = await rateLimit(`admin:${ip}:${userId}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Juda ko'p urinish. ${Math.ceil(limit.waitMs / 60_000)} daqiqadan keyin qayta urining.` },
      { status: 429 },
    );
  }

  let password = "";
  try {
    password = String(((await request.json()) as { password?: string }).password ?? "");
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Parol noto'g'ri" }, { status: 401 });
  }

  await clearAttempts(`admin:${ip}:${userId}`);

  const store = await cookies();
  store.set(UNLOCK_COOKIE, makeUnlockToken(userId), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: UNLOCK_TTL_MS / 1000,
  });

  return NextResponse.json({ ok: true });
}

/** Panelni qulflaydi (chiqish). */
export async function DELETE() {
  (await cookies()).delete(UNLOCK_COOKIE);
  return NextResponse.json({ ok: true });
}
