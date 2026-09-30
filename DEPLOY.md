# Saytni internetga joylashtirish (Vercel)

Bu qo'llanma saytni butun internetga ochish uchun. Baza (Neon) allaqachon
bulutda, shuning uchun uni o'zgartirish shart emas.

Joylashtirgandan keyin sayt kompyuteringiz o'chiq bo'lsa ham ishlaydi.

---

## 1. Kodni GitHub'ga yuklash

Vercel kodni GitHub'dan oladi. Avval repozitoriy yarating:

1. <https://github.com/new> ga kiring
2. Nom bering (masalan `english-learning-center`)
3. **Private** tanlang — ichida sozlama fayllari bor
4. "Create repository" bosing (README, .gitignore **qo'shmang**)

Keyin terminalda:

```bash
cd "/Users/macos/Desktop/Learning english"
git remote add origin https://github.com/FOYDALANUVCHI/english-learning-center.git
git branch -M main
git push -u origin main
```

`FOYDALANUVCHI` o'rniga GitHub nomingizni yozing.

> **Maxfiy ma'lumotlar yuklanmaydi.** `.env.local` va `parol.txt` fayllari
> `.gitignore` da — parollar va baza kaliti GitHub'ga tushmaydi. Buni
> tekshirib ko'rdim.

---

## 2. Vercel'ga ulash

1. <https://vercel.com/signup> — GitHub hisobi bilan kiring (bepul)
2. "Add New… → Project" bosing
3. Yangi yaratgan repozitoriyni tanlang
4. Vercel Next.js ni o'zi aniqlaydi — sozlamalarni o'zgartirmang
5. **Hali "Deploy" bosmang** — avval 3-qadamni bajaring

---

## 3. Muhit o'zgaruvchilari

Vercel sahifasida "Environment Variables" bo'limiga quyidagilarni kiritng.
Qiymatlarni kompyuteringizdagi `.env.local` faylidan ko'chiring:

| Nomi | Qiymati |
| --- | --- |
| `DATABASE_URL` | `.env.local` dagi xuddi shu qatorni ko'chiring |
| `BETTER_AUTH_SECRET` | `.env.local` dagi xuddi shu qatorni ko'chiring |
| `ADMIN_PASSWORD` | Admin panel paroli |
| `BETTER_AUTH_URL` | Sayt manzili, masalan `https://english-learning-center.vercel.app` |
| `TRUSTED_ORIGINS` | Xuddi shu manzil |

`.env.local` ni ko'rish uchun:

```bash
open "/Users/macos/Desktop/Learning english/.env.local"
```

> **Manzilni hali bilmasangiz:** `BETTER_AUTH_URL` va `TRUSTED_ORIGINS` ni
> bo'sh qoldirib ham bo'ladi — kod Vercel bergan domenni avtomatik tanidi.
> Lekin o'z domeningizni ulasangiz, ularni albatta to'ldiring.

---

## 4. Deploy

"Deploy" bosing. Bir-ikki daqiqada sayt tayyor bo'ladi va Vercel manzilni
beradi:

```
https://english-learning-center.vercel.app
```

Shu manzilni istalgan odamga berishingiz mumkin.

---

## 5. Keyingi o'zgarishlar

Kodni o'zgartirganingizda:

```bash
git add -A
git commit -m "nima o'zgartirilgani"
git push
```

Vercel o'zi qayta qurib, yangilaydi. Qo'lda hech narsa qilish kerak emas.

---

## Parolni almashtirish

Hozirgi `ADMIN_PASSWORD` — klaviatura naqshidan iborat qisqa parol (uni
`.env.local` faylidan ko'rishingiz mumkin; bu yerga atayin yozilmadi, chunki
bu fayl GitHub'ga tushadi). Internetga chiqargandan keyin uzunroq parolga
almashtirishni maslahat beraman:

1. Vercel → Settings → Environment Variables → `ADMIN_PASSWORD` ni tahrirlang
2. "Redeploy" bosing

Yangi parol yasash:

```bash
openssl rand -base64 18
```

---

## Ishlab chiqarishda tekshirilgan narsalar

| Nima | Holat |
| --- | --- |
| Build (261 sahifa) | ✓ xatosiz |
| Maxfiy fayllar git'dan tashqarida | ✓ `.env.local`, `parol.txt` |
| Baza ulanishi | ✓ Neon pooler (serverless uchun mos) |
| Admin parol cheklovi | ✓ bazada saqlanadi, nusxalar orasida ishlaydi |
| Manzil tekshiruvi | ✓ begona saytdan so'rov 403 |
| Vercel domeni | ✓ avtomatik tanidi |

## Bilib turishingiz kerak

- **Neon bepul tarifi** — baza 5 daqiqa foydalanilmasa uxlab qoladi va
  keyingi so'rovda ~1 soniya kechikish bo'ladi. Foydalanuvchilar ko'paysa
  bu sezilmaydi.
- **IELTS Writing tahlili** avtomatik va taxminiy — rasmiy baho emas.

- **Tarjimon** MyMemory bepul xizmatidan foydalanadi: kunlik chegarasi bor
  (anonim so'rovlar uchun ~5000 belgi). Ko'p ishlatilsa, o'z API kalitini
  olish yoki boshqa xizmatga o'tish kerak bo'ladi.
