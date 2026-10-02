import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { mergeStreak, normaliseStreak } from "@/lib/streak";
import type { ProgressState } from "@/types";

async function currentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

async function loadState(userId: string): Promise<ProgressState> {
  const [lessons, stat] = await Promise.all([
    sql`select lesson_id from lesson_progress where user_id = ${userId}`,
    // `::text` muhim: aks holda drayver `date` ni `Date` obyektiga aylantiradi
    // va vaqt mintaqasi tufayli sana bir kunga surilib ketishi mumkin.
    sql`select streak_count, streak_last::text as streak_last, streak_best
        from user_stat where user_id = ${userId}`,
  ]);

  const row = stat[0];
  return {
    lessons: lessons.map((r) => r.lesson_id as string),
    streak: normaliseStreak({
      count: Number(row?.streak_count ?? 0),
      last: (row?.streak_last as string | null) ?? null,
      best: Number(row?.streak_best ?? 0),
    }),
  };
}

/** Kirgan foydalanuvchining tugatgan darslari va seriyasi. Kirmagan bo'lsa — null. */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json(null);
  return NextResponse.json(await loadState(userId));
}

/**
 * Klientdagi darslarni serverdagilarga qo'shadi (hech narsa o'chirilmaydi),
 * seriyani esa ikkalasining kattasiga tenglashtiradi, va to'liq holatni
 * qaytaradi.
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

  // Seriyani birlashtiramiz: ikkita qurilmadan kelgan ma'lumot bir-birini
  // orqaga surib yubormasligi kerak.
  const stored = await loadState(userId);
  const merged = mergeStreak(stored.streak, normaliseStreak(body.streak));
  if (merged.last) {
    await sql`
      insert into user_stat (user_id, streak_count, streak_last, streak_best, updated_at)
      values (${userId}, ${merged.count}, ${merged.last}::date, ${merged.best}, now())
      on conflict (user_id) do update set
        streak_count = excluded.streak_count,
        streak_last = excluded.streak_last,
        streak_best = excluded.streak_best,
        updated_at = now()`;
  }

  return NextResponse.json({ ...stored, lessons: [...new Set([...stored.lessons, ...lessons])], streak: merged });
}
