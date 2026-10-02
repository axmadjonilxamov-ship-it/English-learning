import { sql } from "./db";

/**
 * Bazaga tayangan oddiy cheklov.
 *
 * Hisob xotirada emas, `login_attempt` jadvalida yuritiladi: Vercel kabi
 * muhitlarda har bir so'rov boshqa nusxada bajarilishi mumkin, xotiradagi
 * hisob esa ular o'rtasida bo'linmaydi va cheklovni chetlab o'tish mumkin
 * bo'lib qoladi.
 */
export type RateLimitOptions = {
  /** Oynada ruxsat etilgan urinishlar soni. */
  max: number;
  /** Oyna uzunligi (soniya). */
  windowSeconds: number;
  /** Chegaradan o'tilsa, qancha vaqtga to'xtatiladi (soniya). */
  lockoutSeconds: number;
};

export type RateLimitResult = { allowed: boolean; waitMs: number };

export async function rateLimit(
  key: string,
  { max, windowSeconds, lockoutSeconds }: RateLimitOptions,
): Promise<RateLimitResult> {
  const rows = await sql`
    insert into login_attempt (key, count, window_end)
    values (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
    on conflict (key) do update set
      -- Blok davom etayotgan bo'lsa, hisobni o'zgartirmaymiz.
      count = case
        when login_attempt.locked_until > now() then login_attempt.count
        when login_attempt.window_end <= now() then 1
        else login_attempt.count + 1
      end,
      window_end = case
        when login_attempt.window_end <= now() and login_attempt.locked_until <= now()
          then now() + make_interval(secs => ${windowSeconds})
        else login_attempt.window_end
      end,
      locked_until = case
        when login_attempt.locked_until > now() then login_attempt.locked_until
        when login_attempt.window_end > now() and login_attempt.count + 1 > ${max}
          then now() + make_interval(secs => ${lockoutSeconds})
        else login_attempt.locked_until
      end,
      updated_at = now()
    returning greatest(0, extract(epoch from (locked_until - now())))::int as wait_seconds`;

  const wait = Number(rows[0]?.wait_seconds ?? 0);
  return { allowed: wait <= 0, waitMs: wait * 1000 };
}

/** Muvaffaqiyatli amaldan keyin hisobni tozalaydi. */
export async function clearAttempts(key: string): Promise<void> {
  await sql`delete from login_attempt where key = ${key}`;
}
