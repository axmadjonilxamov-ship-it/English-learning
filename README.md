# English Learning Center

O'zbek tilida so'zlashuvchilar uchun ingliz tili platformasi. Bosh sahifa — tungi
shaharcha xaritasi: har bir tuman bitta daraja (Beginner'dan IELTS gacha), har bir
bino esa bitta modul. Binoga bosilsa, egri yo'l bo'ylab chizilgan kurs yo'li ochiladi.

Saytda ikkita bo'lim bor: **Shaharcha** (darslar) va **Tarjimon**.
Shaharchada binoni tanlasangiz, **qizil mashina** oq marshrut bo'ylab o'sha binoga
yuradi va yetib borgach kurs yo'li ochiladi. **Shift** — turbo. Yo'ldagi svetafor
qizil bo'lsa mashina o'zi to'xtaydi; Shift bosib turib o'tib ketsangiz, politsiya
quvadi va yo'l qoidalari bo'yicha ingliz tilida test beriladi.
Kursda **240 ta dars** va **720 ta mashq** bor — har darajaga 40 tadan.
Barcha darslarni tugatgan foydalanuvchi ismi yozilgan **sertifikat** oladi.

## Texnologiyalar

| Qism | Nima ishlatilgan |
| --- | --- |
| Karkas | Next.js 16 (App Router, Turbopack) |
| Til | TypeScript (`strict`) |
| Dizayn | Tailwind CSS 4 |
| Baza | Neon Postgres (`@neondatabase/serverless`) |
| Kirish / ro'yxat | better-auth (email + parol) |
| Talaffuz | Brauzerning Web Speech API'si |
| Tarjima | Saytning o'z lug'ati + MyMemory API (kalitsiz) |

## Ishga tushirish

```bash
npm install
npm run dev
```

Keyin <http://localhost:9999> ni oching.

`.env.local` faylida ikkita sozlama bo'lishi kerak (namuna: `.env.example`):

```
DATABASE_URL="postgresql://…"      # Neon ulanish satri
BETTER_AUTH_SECRET="…"             # openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:9999"
```

## Boshqalarga ochish

`npm run dev` serverni butun tarmoqqa ochadi. Terminalda ikkita manzil chiqadi:

```
Local:    http://localhost:9999          ← faqat shu kompyuter
Network:  http://192.168.x.x:9999        ← bir Wi-Fi'dagi hamma
```

Ikkinchi manzilni telefon yoki boshqa kompyuterga bersangiz, sayt ochiladi.
Kirish va ro'yxatdan o'tish ham ishlaydi: `src/lib/auth.ts` dagi
`trustedOrigins` mahalliy tarmoq manzillariga ruxsat beradi, begona
saytlardan kelgan so'rovlarni esa rad etadi.

Internetdagi hamma uchun ochish kerak bo'lsa, saytni joylashtirish lozim
(masalan Vercel). U holda domeningizni `.env` ga yozing:

```
BETTER_AUTH_URL="https://sizning-domeningiz.com"
TRUSTED_ORIGINS="https://sizning-domeningiz.com"
```

Boshqa buyruqlar:

```bash
npm run build   # ishlab chiqarish uchun yig'ish
npm run start   # yig'ilgan saytni ishga tushirish
npm run lint    # kod tekshiruvi
```

## Papkalar

```
src/
  app/
    page.tsx                      Shaharcha xaritasi (bosh sahifa)
    path/[level]/                 Kurs yo'li — darslar egri yo'l bo'ylab
    lesson/[level]/[index]/       Dars: chapda qoida, o'ngda mashq oynasi
    translate/                    Tarjimon (inglizcha ↔ o'zbekcha)
    ielts/                        IELTS: Writing ishlaydi, qolganlari tayyorlanmoqda
    certificate/                  Kurs tugagach beriladigan sertifikat
    admin/                        Admin panel (role = 'admin' kerak)
    login/ register/              Kirish va ro'yxatdan o'tish
    api/auth/[...all]/            better-auth ishlov beruvchisi
    api/progress/                 Tugatilgan darslarni saqlash
    api/translate/                Tarjima so'rovi
    api/enforcement/              Qoidabuzarlik va blok holati
    api/admin/                    Admin statistikasi va boshqaruvi
  components/
    city/CityMap.tsx              Shaharcha (SVG)
    path/RoadPath.tsx             Kurs yo'li (SVG)
    lesson/                       Dars oynasi va 4 xil mashq
  data/
    levels/                       Darslar — har darajaga bitta fayl (40 tadan)
    courses.ts                    Daraja fayllarini birlashtiradi
    words.ts  grammar.ts          Lug'at va grammatika
  lib/
    auth.ts  auth-client.ts       Autentifikatsiya
    db.ts                         Bazaga ulanish
    progress.tsx                  Natijalarni saqlash va sinxronlash
    dictionary.ts                 Darslardan tuzilgan lug'at (tarjimon uchun)
    writing-analysis.ts           IELTS Writing tahlili (4 ta mezon)
    city-scenery.ts               Shaharchaning statik bezagi
```

`legacy/` papkasida saytning eski, sof HTML/CSS/JS versiyasi turibdi — kerak
bo'lmasa, o'chirib tashlash mumkin.

## Yangi dars qo'shish

`src/data/levels/` papkasidan kerakli daraja faylini oching (masalan
`beginner.ts`), modulni toping va `lessons` massiviga yangi element qo'shing.
`id`, tartib raqami va progress avtomatik hisoblanadi.

```ts
{
  title: "Darsning o'zbekcha nomi",
  en: "English title",
  min: 4,
  text: "Qoidaning o'zbekcha tushuntirishi.",
  rule: { icon: "📘", name: "Qoida", en: "Formula", desc: "Izoh" },
  tasks: [
    { t: "choose", q: "She ___ a doctor.", opts: ["am", "is", "are"], a: "is", uz: "U shifokor." },
    { t: "build", s: "I am very happy", uz: "Men juda xursandman" },
    { t: "match", pairs: [["mother", "ona"], ["father", "ota"]] },
    { t: "listen", w: "family", uz: "oila" },
  ],
}
```

## Tarjimon qanday ishlaydi

So'rov avval saytning **o'z lug'atiga** tushadi. Lug'at darslardagi barcha
so'zlar, gaplar va grammatika misollaridan avtomatik tuziladi
(`src/lib/dictionary.ts`), shuning uchun o'rganilayotgan gaplar darhol, internetsiz
va transkripsiya hamda misol bilan tarjima qilinadi.

Lug'atda topilmagan matn **MyMemory** tarjima xizmatiga yuboriladi — u bepul va
API kalit talab qilmaydi. So'rov server tomonidan yuboriladi va bir soat keshlanadi.

## Natijalar qanday saqlanadi

Progress avval brauzerda (`localStorage`) saqlanadi, shuning uchun sayt hisobsiz
ham to'liq ishlaydi. Foydalanuvchi tizimga kirsa, brauzerdagi va bazadagi
darslar **birlashtiriladi** — hech narsa yo'qolmaydi.

Bazadagi jadvallar: `user`, `session`, `account`, `verification` (better-auth)
va `lesson_progress`.

## Joylashtirish

Loyiha Vercel uchun tayyor. Vercel'da `DATABASE_URL`, `BETTER_AUTH_SECRET` va
`BETTER_AUTH_URL` (sayt manzili) o'zgaruvchilarini kiritish kifoya.

## Qoidalar va bloklash

Shaharchadagi mashina qizil chiroqda avtomatik to'xtaydi. **Shift** bosib turib
qizildan o'tsangiz — bu qoidabuzarlik: politsiya quvadi va yo'l qoidalari
bo'yicha 10 ta inglizcha savol beriladi.

- **80% dan yuqori** — politsiya qo'yib yuboradi, davom etasiz.
- **80% dan past** — ekran **2 daqiqaga** bloklanadi. Har bir yangi
  qoidabuzarlik yana 2 daqiqa qo'shadi.
- **20 tadan ortiq** qoidabuzarlik — kirish butunlay yopiladi.

Blok qurilmaga qo'yiladi (`localStorage` + serverdagi `device_block` jadvali),
shuning uchun tabni yopib qayta ochish yordam bermaydi.

## Admin panel

`/admin` sahifasi. Kirish **ikki bosqichli**:

1. Hisobda `role = 'admin'` bo'lishi kerak:
   ```sql
   update "user" set role = 'admin' where email = 'siz@example.com';
   ```
2. Panel ochilishidan oldin **admin paroli** so'raladi. Parol `.env.local`
   faylidagi `ADMIN_PASSWORD` da saqlanadi va faqat serverda tekshiriladi —
   sayt kodiga tushmaydi.

Parol to'g'ri kiritilsa, imzolangan `httpOnly` cookie qo'yiladi va panel
8 soat ochiq turadi. "Qulflash" tugmasi uni bekor qiladi. Xato parol bir
daqiqada 5 martadan ko'p kiritilsa, urinishlar 5 daqiqaga to'xtatiladi.

Panelda: umumiy statistika, foydalanuvchilar ro'yxati (tugatgan darslari,
qoidabuzarliklari), qoidabuzar qurilmalar va oxirgi hodisalar. Har bir
foydalanuvchi yoki qurilmani vaqtincha bloklash, butunlay yopish, blokdan
chiqarish va admin qilish mumkin.

## Qurilmaga o'rnatish

Sayt PWA sifatida ishlaydi: Android va Windows'da brauzer o'zi "O'rnatish"
taklifini beradi, iPhone'da esa **Ulashish → Bosh ekranga qo'shish**.
O'rnatilgandan keyin ilova internetsiz ham ochiladi.

## IELTS

`/ielts` sahifasida to'rtta bo'lim bor. Hozircha **Writing** ishlaydi,
Listening, Reading va Speaking "soon…" deb turadi.

**Writing** — Task 1 (grafik tasvirlash, 150+ so'z, 20 daqiqa) va Task 2
(esse, 250+ so'z, 40 daqiqa). Taymer bor, yozilgani brauzerda saqlanadi,
"Boshqasi" tugmasi yangi topshiriq beradi.

Yozganingiz IELTS ning to'rtta rasmiy mezoni bo'yicha tekshiriladi
(`src/lib/writing-analysis.ts`):

| Mezon | Nima tekshiriladi |
| --- | --- |
| Task Achievement / Response | Hajm, overview (Task 1), aniq pozitsiya (Task 2), misollar, xulosa |
| Coherence and Cohesion | Xatboshilar, bog'lovchilar xilma-xilligi, ishora so'zlari |
| Lexical Resource | Lug'at xilma-xilligi, kam uchraydigan so'zlar, parafraz, imlo |
| Grammatical Range | Gap uzunligi xilma-xilligi, ergash gap, shart gap, passive |

Bu **avtomatik tahlil**, rasmiy baho emas — o'lchab bo'ladigan narsalarni
tekshiradi. Mazmun sifatini faqat inson ekspert baholay oladi.
