import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { resetPasswordMail, sendMail } from "./mail";
import { rateLimit } from "./rate-limit";

/**
 * Autentifikatsiya sozlamalari (better-auth).
 * Foydalanuvchilar va sessiyalar Neon Postgres bazasida saqlanadi —
 * parollar better-auth tomonidan xeshlanadi, biz ularni hech qachon ko'rmaymiz.
 */
/**
 * `pg` ulanish satridagi `sslmode` ni o'zi talqin qiladi va kelgusi versiyada
 * xatti-harakatini o'zgartirishi haqida ogohlantiradi. Shuning uchun SSL ni
 * satrdan olib tashlab, to'g'ridan-to'g'ri (to'liq tekshiruv bilan) beramiz.
 */
function pgPool() {
  const raw = process.env.DATABASE_URL;
  // `next build` sahifalarni yig'ayotganda bu modul ham yuklanadi, o'sha paytda
  // ulanish satri bo'lmasligi mumkin. `Pool` birinchi so'rovgacha ulanmaydi,
  // shuning uchun bu yerda xato tashlamaymiz — build yiqilmasin.
  if (!raw) return new Pool();

  const url = new URL(raw);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");
  return new Pool({ connectionString: url.toString(), ssl: { rejectUnauthorized: true } });
}

/**
 * Sayt qaysi manzildan ochilayotgan bo'lsa ham ishlashi kerak:
 * `localhost`, uy tarmog'idagi IP (192.168.x.x) yoki internetdagi domen.
 *
 * better-auth soxta so'rovlardan himoyalanish uchun manzilni tekshiradi,
 * shuning uchun ruxsat etilganlarini shu yerda aniqlaymiz. Internetga
 * chiqarganingizda domeningizni `TRUSTED_ORIGINS` ga yozib qo'ying
 * (vergul bilan ajratib).
 */
function trustedOrigins(request?: Request): string[] {
  const allowed = new Set<string>();

  const add = (value?: string | null) => {
    if (!value) return;
    try {
      allowed.add(new URL(value).origin);
    } catch {
      // Noto'g'ri yozilgan manzilni e'tiborsiz qoldiramiz.
    }
  };

  add(process.env.BETTER_AUTH_URL);
  for (const extra of (process.env.TRUSTED_ORIGINS ?? "").split(",")) add(extra.trim());

  // Vercel'da joylashtirilganda domen avtomatik beriladi — sozlamani
  // unutib qo'yilsa ham sayt ishlashi uchun shuni ham qo'shamiz.
  for (const host of [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL]) {
    if (host) add(host.startsWith("http") ? host : `https://${host}`);
  }

  // So'rov kelgan manzil mahalliy tarmoqdan bo'lsa, unga ham ruxsat beramiz —
  // shunda bir Wi-Fi'dagi telefon va kompyuterlar saytga kira oladi.
  const origin = request?.headers.get("origin") ?? request?.headers.get("referer");
  if (origin) {
    try {
      const url = new URL(origin);
      const host = url.hostname;
      const isLocal =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "[::1]" ||
        host.endsWith(".local") ||
        /^10\./.test(host) ||
        /^192\.168\./.test(host) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(host);
      if (isLocal) allowed.add(url.origin);
    } catch {
      // Manzilni o'qib bo'lmasa, ruxsat bermaymiz.
    }
  }

  return [...allowed];
}

export const auth = betterAuth({
  database: pgPool(),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Hozircha pochta orqali tasdiqlash yo'q — ro'yxatdan o'tgan zahoti kirish mumkin.
    requireEmailVerification: false,
    // Tiklash havolasi 1 soat amal qiladi.
    resetPasswordTokenExpiresIn: 60 * 60,
    /**
     * Parolni tiklash xatini yuboradi.
     *
     * Bir manzilga soatda 3 tadan ortiq xat yuborilmaydi: aks holda birov
     * boshqa odamning pochtasini xat bilan to'ldirib yuborishi va Gmail'ning
     * kunlik chegarasi tugab qolishi mumkin. Chegaradan o'tilsa xat jimgina
     * yuborilmaydi — better-auth baribir bir xil javob qaytaradi, shuning
     * uchun tashqaridan manzil bor-yo'qligini bilib bo'lmaydi.
     */
    sendResetPassword: async ({ user, url }) => {
      const key = `reset:${user.email.toLowerCase()}`;
      const limit = await rateLimit(key, {
        max: 3,
        windowSeconds: 60 * 60,
        lockoutSeconds: 60 * 60,
      }).catch(() => ({ allowed: true, waitMs: 0 }));

      if (!limit.allowed) {
        console.warn("Parolni tiklash: juda ko'p so'rov yuborilgan, xat yuborilmadi.");
        return;
      }

      await sendMail(resetPasswordMail(user.email, url, user.name));
    },
  },
  user: {
    additionalFields: {
      // Saytda ko'rinadigan ism (ro'yxatdan o'tishda so'raladi).
      displayName: { type: "string", required: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 kun
    updateAge: 60 * 60 * 24, // kuniga bir marta yangilanadi
  },
  // Server action'lardan keyin cookie to'g'ri o'rnatilishi uchun.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
