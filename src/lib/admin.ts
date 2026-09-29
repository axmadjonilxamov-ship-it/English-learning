import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

/** Parol tasdiqlangach beriladigan cookie. */
export const UNLOCK_COOKIE = "elc_admin";

/** Parol qancha vaqtga eslab qolinadi. */
export const UNLOCK_TTL_MS = 8 * 60 * 60 * 1000;

const secret = () => process.env.BETTER_AUTH_SECRET ?? "";

/** Ikkita satrni vaqt bo'yicha xavfsiz solishtiradi (parolni taxmin qilishni qiyinlashtiradi). */
function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  // Uzunliklar har xil bo'lsa ham bir xil vaqt ketishi uchun xeshlab solishtiramiz.
  const hx = createHmac("sha256", secret()).update(x).digest();
  const hy = createHmac("sha256", secret()).update(y).digest();
  return timingSafeEqual(hx, hy);
}

/** Parol to'g'rimi. */
export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  return safeEqual(input, expected);
}

/** Cookie uchun imzolangan token yasaydi: <tugash vaqti>.<imzo> */
export function makeUnlockToken(userId: string): string {
  const expires = Date.now() + UNLOCK_TTL_MS;
  const sig = createHmac("sha256", secret()).update(`${userId}.${expires}`).digest("hex");
  return `${expires}.${sig}`;
}

function verifyUnlockToken(token: string | undefined, userId: string): boolean {
  if (!token) return false;
  const [expiresRaw, sig] = token.split(".");
  const expires = Number(expiresRaw);
  if (!expires || !sig || expires < Date.now()) return false;
  const want = createHmac("sha256", secret()).update(`${userId}.${expires}`).digest("hex");
  return sig.length === want.length && timingSafeEqual(Buffer.from(sig), Buffer.from(want));
}

export type AdminCheck =
  | { ok: true; id: string; name: string }
  | { ok: false; reason: "anonymous" | "not-admin" | "locked" };

/**
 * Admin panelga kirish ikki bosqichli:
 *   1. Hisobda `role = 'admin'` bo'lishi kerak;
 *   2. Admin paroli kiritilgan bo'lishi kerak (imzolangan cookie).
 *
 * Birinchi adminni SQL bilan belgilang:
 *   update "user" set role = 'admin' where email = 'siz@example.com';
 */
export async function checkAdmin(): Promise<AdminCheck> {
  const session = await auth.api.getSession({ headers: await headers() });
  const id = session?.user?.id;
  if (!id) return { ok: false, reason: "anonymous" };

  const rows = await sql`select role, name from "user" where id = ${id}`;
  if (rows[0]?.role !== "admin") return { ok: false, reason: "not-admin" };

  const token = (await cookies()).get(UNLOCK_COOKIE)?.value;
  if (!verifyUnlockToken(token, id)) return { ok: false, reason: "locked" };

  return { ok: true, id, name: String(rows[0].name ?? "") };
}

/** Faqat admin bo'lgan (lekin hali parol kiritmagan) foydalanuvchini aniqlaydi. */
export async function currentAdminCandidate(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const id = session?.user?.id;
  if (!id) return null;
  const rows = await sql`select role from "user" where id = ${id}`;
  return rows[0]?.role === "admin" ? id : null;
}
