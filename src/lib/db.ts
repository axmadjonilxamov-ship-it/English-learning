import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL topilmadi — .env.local faylini tekshiring");
}

/**
 * Neon'ning HTTP drayveri: serverless muhitda ulanishni ochiq ushlab turmaydi,
 * shuning uchun Vercel'da eng tez ishlaydi.
 *
 * Foydalanish: sql`select * from lesson_progress where user_id = ${id}`
 */
export const sql = neon(process.env.DATABASE_URL);
