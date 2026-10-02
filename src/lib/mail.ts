import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/**
 * Xat yuborish — Gmail SMTP orqali.
 *
 * Sozlamalar faqat serverda o'qiladi:
 *   GMAIL_USER          — xat yuboriladigan gmail manzili
 *   GMAIL_APP_PASSWORD  — Google hisobidagi "ilova paroli" (oddiy parol emas!)
 *
 * Ilova parolini olish: Google hisobingizda ikki bosqichli tasdiqlashni
 * yoqing, so'ng https://myaccount.google.com/apppasswords sahifasidan yangi
 * parol yasang. Google uni bo'shliqlar bilan ko'rsatadi — bo'shliqlarni
 * o'zimiz olib tashlaymiz, shuning uchun qanday ko'chirsangiz ham ishlaydi.
 */

let cached: Transporter | null = null;

function transport(): Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) return null;
  cached ??= nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  return cached;
}

/** Sozlanganmi — sahifalarda ogohlantirish ko'rsatish uchun. */
export function mailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export type Mail = { to: string; subject: string; text: string; html: string };

/** Xatni yuboradi. Xato bo'lsa `false` qaytaradi va jurnalga yozadi. */
export async function sendMail({ to, subject, text, html }: Mail): Promise<boolean> {
  const mailer = transport();
  if (!mailer) {
    console.error("Xat yuborilmadi: GMAIL_USER yoki GMAIL_APP_PASSWORD sozlanmagan.");
    return false;
  }
  try {
    await mailer.sendMail({
      from: `"English Learning Center" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (cause) {
    // Asl xato faqat jurnalga tushadi — unda manzil va sozlamalar bo'lishi mumkin.
    console.error("Xat yuborishda xato:", cause);
    return false;
  }
}

/**
 * Parolni tiklash xati.
 *
 * Foydalanuvchi saytda qaysi tilni tanlaganini server bilmaydi (til brauzerda
 * saqlanadi), shuning uchun matn o'zbekcha, ostida esa qisqa inglizcha
 * izoh beriladi.
 */
export function resetPasswordMail(to: string, url: string, name?: string | null): Mail {
  const greeting = name ? `Assalomu alaykum, ${name}!` : "Assalomu alaykum!";

  const text = [
    greeting,
    "",
    "English Learning Center hisobingiz parolini tiklash so'rovi keldi.",
    "Yangi parol o'rnatish uchun quyidagi havolani brauzerda oching:",
    "",
    url,
    "",
    "Havola 1 soat ichida amal qiladi va bir marta ishlatiladi.",
    "Agar bu so'rovni siz yubormagan bo'lsangiz, bu xatni e'tiborsiz qoldiring —",
    "hisobingiz va parolingiz o'zgarmaydi.",
    "",
    "— English Learning Center",
    "",
    "---",
    "EN: Someone asked to reset the password for your English Learning Center",
    "account. Open the link above to set a new one. It works for one hour and",
    "can be used once. If this wasn't you, you can safely ignore this email.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="uz">
<body style="margin:0;padding:24px;background:#f6f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#11132a">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e4e6ef;border-radius:16px;padding:28px">
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#646b86">
      English Learning Center
    </p>
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">Parolni tiklash</h1>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6">${greeting}</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6">
      Hisobingiz parolini tiklash so'rovi keldi. Yangi parol o'rnatish uchun quyidagi tugmani bosing.
    </p>
    <p style="margin:0 0 20px">
      <a href="${url}" style="display:inline-block;background:#2f4fb5;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:12px;font-weight:700;font-size:15px">
        Yangi parol o'rnatish
      </a>
    </p>
    <p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#646b86">
      Havola <b>1 soat</b> ichida amal qiladi va bir marta ishlatiladi.
      Tugma ishlamasa, shu manzilni brauzerga ko'chiring:<br>
      <span style="word-break:break-all;color:#2f4fb5">${url}</span>
    </p>
    <p style="margin:0;padding-top:16px;border-top:1px solid #e4e6ef;font-size:13px;line-height:1.6;color:#646b86">
      Bu so'rovni siz yubormagan bo'lsangiz, xatni e'tiborsiz qoldiring — parolingiz o'zgarmaydi.
      <br><br>
      <i>EN: Someone asked to reset your password. Use the button above to set a new one — the link
      works for one hour. If this wasn't you, you can safely ignore this email.</i>
    </p>
  </div>
</body>
</html>`;

  return { to, subject: "Parolni tiklash — English Learning Center", text, html };
}
