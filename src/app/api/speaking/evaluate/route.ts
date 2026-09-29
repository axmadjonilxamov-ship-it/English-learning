import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { sql } from "@/lib/db";
import { SpeakingError } from "@/lib/speaking/errors";
import { evaluateSpeaking } from "@/lib/speaking/evaluate";
import type { SpeakingPart } from "@/lib/speaking/types";

/**
 * IELTS Speaking javobini baholaydi.
 *
 * Kutiladigan so'rov: `multipart/form-data`
 *   audio    — yozib olingan fayl (webm/opus yoki brauzer bergan boshqa format)
 *   part     — "part1" | "part2" | "part3"
 *   question — foydalanuvchi javob bergan savol
 *
 * Kalitlar (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) faqat shu server kodida
 * o'qiladi — brauzerga hech qachon yuborilmaydi.
 */

// Xizmatlarga murojaat uzoq davom etishi mumkin (transkripsiya + tahlil).
export const runtime = "nodejs";
export const maxDuration = 300;

/** 10 MB — ikki daqiqalik opus yozuvi bundan ancha kichik bo'ladi. */
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_QUESTION_LENGTH = 600;
const PARTS: SpeakingPart[] = ["part1", "part2", "part3"];

/**
 * Bir IP dan 10 daqiqada 12 tadan ortiq baholash so'ralsa, 10 daqiqaga
 * to'xtatiladi. Hisob bazada — Vercel'da har so'rov boshqa nusxada
 * bajarilishi mumkin, xotiradagi hisob esa ular o'rtasida bo'linmaydi.
 */
const MAX_TRIES = 12;
const WINDOW_SECONDS = 10 * 60;
const LOCKOUT_SECONDS = 10 * 60;

async function rateLimit(key: string): Promise<{ allowed: boolean; waitMs: number }> {
  const rows = await sql`
    insert into login_attempt (key, count, window_end)
    values (${key}, 1, now() + make_interval(secs => ${WINDOW_SECONDS}))
    on conflict (key) do update set
      count = case
        when login_attempt.locked_until > now() then login_attempt.count
        when login_attempt.window_end <= now() then 1
        else login_attempt.count + 1
      end,
      window_end = case
        when login_attempt.window_end <= now() and login_attempt.locked_until <= now()
          then now() + make_interval(secs => ${WINDOW_SECONDS})
        else login_attempt.window_end
      end,
      locked_until = case
        when login_attempt.locked_until > now() then login_attempt.locked_until
        when login_attempt.window_end > now() and login_attempt.count + 1 > ${MAX_TRIES}
          then now() + make_interval(secs => ${LOCKOUT_SECONDS})
        else login_attempt.locked_until
      end,
      updated_at = now()
    returning greatest(0, extract(epoch from (locked_until - now())))::int as wait_seconds`;

  const wait = Number(rows[0]?.wait_seconds ?? 0);
  return { allowed: wait <= 0, waitMs: wait * 1000 };
}

export async function POST(request: Request) {
  const head = await headers();
  const ip = head.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  try {
    const limit = await rateLimit(`speak:${ip}`);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Juda ko'p so'rov yubordingiz. ${Math.ceil(
            limit.waitMs / 60_000,
          )} daqiqadan keyin qayta urining.`,
        },
        { status: 429 },
      );
    }
  } catch (cause) {
    // Baza vaqtincha ishlamasa, baholashni to'xtatmaymiz.
    console.error("Cheklovni tekshirib bo'lmadi:", cause);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const audio = form.get("audio");
  const part = String(form.get("part") ?? "");
  const question = String(form.get("question") ?? "").trim();

  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json(
      { error: "Ovoz yozuvi topilmadi. Mikrofon tugmasini bosib javob bering." },
      { status: 400 },
    );
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json({ error: "Yozuv juda uzun. Qisqaroq javob bering." }, { status: 413 });
  }
  if (!PARTS.includes(part as SpeakingPart)) {
    return NextResponse.json({ error: "Qism noto'g'ri ko'rsatilgan" }, { status: 400 });
  }
  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json({ error: "Savol noto'g'ri ko'rsatilgan" }, { status: 400 });
  }

  try {
    const result = await evaluateSpeaking({
      audio,
      part: part as SpeakingPart,
      question,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SpeakingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Speaking baholashda kutilmagan xato:", error);
    return NextResponse.json(
      { error: "Kutilmagan xato yuz berdi. Qayta urinib ko'ring." },
      { status: 500 },
    );
  }
}
