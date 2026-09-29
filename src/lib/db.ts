import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon'ning HTTP drayveri: serverless muhitda ulanishni ochiq ushlab turmaydi,
 * shuning uchun Vercel'da eng tez ishlaydi.
 *
 * Foydalanish: sql`select * from lesson_progress where user_id = ${id}`
 *
 * Ulanish birinchi so'rovda ochiladi, modul yuklanganda emas. Bu muhim:
 * `next build` sahifalar sozlamasini yig'ayotganda bu faylni ham yuklaydi,
 * o'sha paytda esa `DATABASE_URL` hali bo'lmasligi mumkin. Ilgari shu yerda
 * darhol xato tashlanar edi va butun build yiqilardi.
 */
let client: NeonQueryFunction<false, false> | null = null;

function connect(): NeonQueryFunction<false, false> {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL topilmadi. Mahalliy ishda .env.local faylini, Vercel'da esa Settings → Environment Variables bo'limini tekshiring.",
    );
  }
  client = neon(url);
  return client;
}

export const sql = new Proxy(function () {} as unknown as NeonQueryFunction<false, false>, {
  apply: (_target, _thisArg, args: unknown[]) =>
    (connect() as unknown as (...a: unknown[]) => unknown)(...args),
  get: (_target, prop) => (connect() as unknown as Record<string | symbol, unknown>)[prop],
});
