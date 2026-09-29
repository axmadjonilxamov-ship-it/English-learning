import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { ProgressState } from "@/types";

async function currentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

async function loadState(userId: string): Promise<ProgressState> {
  const rows = await sql`select lesson_id from lesson_progress where user_id = ${userId}`;
  return { lessons: rows.map((r) => r.lesson_id as string) };
}

/** Kirgan foydalanuvchining tugatgan darslari. Kirmagan bo'lsa — null. */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json(null);
  return NextResponse.json(await loadState(userId));
}

/**
 * Klientdagi darslarni serverdagilarga qo'shadi (hech narsa o'chirilmaydi)
 * va to'liq ro'yxatni qaytaradi.
 */
export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Avval tizimga kiring" }, { status: 401 });

  let body: Partial<ProgressState>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const lessons = (body.lessons ?? []).filter((v): v is string => typeof v === "string").slice(0, 2000);

  if (lessons.length) {
    await sql`
      insert into lesson_progress (user_id, lesson_id)
      select ${userId}, unnest(${lessons}::text[])
      on conflict (user_id, lesson_id) do nothing`;
  }

  return NextResponse.json(await loadState(userId));
}
