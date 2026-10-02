import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import {
  UNLOCK_COOKIE,
  UNLOCK_TTL_MS,
  checkAdminPassword,
  currentAdminCandidate,
  makeUnlockToken,
} from "@/lib/admin";
import { clearAttempts, rateLimit } from "@/lib/rate-limit";

/**
 * Parolni taxmin qilishga qarshi cheklov: bitta IP dan 1 daqiqada 5 tadan
 * ortiq urinish bo'lsa, 5 daqiqaga to'xtatiladi.
 */
const LIMIT = { max: 5, windowSeconds: 60, lockoutSeconds: 5 * 60 };

/** Parolni tekshiradi va muvaffaqiyatli bo'lsa imzolangan cookie qo'yadi. */
export async function POST(request: Request) {
  const userId = await currentAdminCandidate();
  // Parolni faqat admin hisobiga kirgan foydalanuvchi sinay oladi.
  if (!userId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const head = await headers();
  const ip = head.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  // Hisob IP va foydalanuvchi bo'yicha yuritiladi.
  const limit = await rateLimit(`admin:${ip}:${userId}`, LIMIT);
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
