/**
 * Foydalanuvchi parolini tiklaydi.
 *
 * Parollar xeshlab saqlanadi va ularni o'qib bo'lmaydi — faqat yangisini
 * qo'yish mumkin. Skript better-auth'ning o'z xeshlagichidan foydalanadi,
 * shuning uchun natija sayt bilan to'liq mos keladi.
 *
 * Ishlatish:
 *   node scripts/reset-password.mjs kimdir@example.com            (tasodifiy parol)
 *   node scripts/reset-password.mjs kimdir@example.com "Yangi123" (o'zingiz tanlagan)
 *
 * Yangi parol `parol.txt` fayliga yoziladi (bu fayl git'ga tushmaydi).
 */
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { hashPassword, verifyPassword } from "better-auth/crypto";

// .env.local ni o'qiymiz (Next.js tashqarisida avtomatik yuklanmaydi).
process.loadEnvFile?.(".env.local");

const [email, given] = process.argv.slice(2);
if (!email) {
  console.error("Email kiriting: node scripts/reset-password.mjs kimdir@example.com");
  process.exit(1);
}

/** Eslab qolish oson, lekin taxmin qilish qiyin parol yasaydi. */
function makePassword() {
  const words = ["Tong", "Daryo", "Chinor", "Quyosh", "Bahor", "Shamol", "Oltin", "Yulduz"];
  const pick = () => words[randomBytes(1)[0] % words.length];
  const digits = String(randomBytes(2).readUInt16BE() % 10000).padStart(4, "0");
  return `${pick()}-${pick()}-${digits}`;
}

const password = given ?? makePassword();
if (password.length < 8) {
  console.error("Parol kamida 8 ta belgidan iborat bo'lsin.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const users = await sql`select id, name from "user" where email = ${email}`;
if (users.length === 0) {
  console.error(`"${email}" bilan foydalanuvchi topilmadi.`);
  process.exit(1);
}
const user = users[0];

const hash = await hashPassword(password);

const updated = await sql`
  update account set password = ${hash}, "updatedAt" = now()
  where "userId" = ${user.id} and "providerId" = 'credential'
  returning id`;

// Hisob parol bilan emas, boshqa usulda yaratilgan bo'lsa — yangi yozuv qo'shamiz.
if (updated.length === 0) {
  await sql`
    insert into account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
    values (${crypto.randomUUID()}, ${user.id}, 'credential', ${user.id}, ${hash}, now(), now())`;
}

// Yangi parol haqiqatan ishlashini tekshiramiz.
const ok = await verifyPassword({ password, hash });
if (!ok) {
  console.error("Xeshni tekshirib bo'lmadi — parol o'zgartirilmadi deb hisoblang.");
  process.exit(1);
}

// Parolni terminalga chiqarmaymiz — faylga yozamiz.
writeFileSync(
  "parol.txt",
  `${user.name ?? ""} <${email}>\nYangi parol: ${password}\n\n` +
    `Saytga kiring va keyin bu faylni o'chirib tashlang.\n`,
  "utf8",
);

console.log(`✓ "${email}" paroli yangilandi va tekshirildi.`);
console.log("  Yangi parol 'parol.txt' faylida — uni oching.");
