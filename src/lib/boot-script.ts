/**
 * Sahifa chizilishidan oldin `<head>` ichida ishlaydigan kichik skript.
 *
 * MUHIM: bu fayl `"use client"` bo'lmasligi kerak. Client moduldan olingan
 * oddiy (komponent bo'lmagan) qiymat serverda haqiqiy satr emas, o'rniga
 * "client reference" bo'lib qoladi va `<script>` ichiga xato matni tushadi.
 * Shu sabab skript va uning kalitlari alohida, neytral faylda turadi.
 */

/** Tanlangan mavzu (`light` / `dark`) shu kalit bilan saqlanadi. */
export const THEME_KEY = "englishup:theme";

/** Tanlangan til (`uz` / `ru` / `en`) shu kalit bilan saqlanadi. */
export const LANG_KEY = "englishup:lang";

/**
 * Mavzu: saqlangani bo'lsa o'sha, bo'lmasa tizim sozlamasi.
 * Sahifa chizilishidan oldin qo'yiladi — shu tufayli qorong'i rejimda
 * sahifa bir lahza oq bo'lib "chaqnamaydi".
 */
export const themeScript = `
(function(){try{
  var t = localStorage.getItem(${JSON.stringify(THEME_KEY)});
  var dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
}catch(e){}})();
`;

/** Til: saqlangani darhol `<html lang>` ga qo'yiladi. */
export const langScript = `
(function(){try{
  var l = localStorage.getItem(${JSON.stringify(LANG_KEY)});
  if (l === "uz" || l === "ru" || l === "en") document.documentElement.lang = l;
}catch(e){}})();
`;
