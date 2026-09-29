// Kurslar: daraja → modul (shaharchadagi bino) → dars (kurs yo'lidagi bekat) → mashqlar.
// Mashq turlari:
//   choose — bo'sh joyni to'ldirish:  { t: "choose", q: "She ___ a doctor.", opts: [...], a: "is", uz: "tarjima" }
//   build  — so'zlardan gap tuzish:   { t: "build", s: "I am happy", end: "?", uz: "tarjima" }
//   match  — juftlash:                { t: "match", pairs: [["hello", "salom"], ...] }
//   listen — tinglab yozish:          { t: "listen", w: "family", uz: "oila" }
const LEVELS = [
  {
    id: "beginner", name: "Beginner", cefr: "A1", palette: ["#2563eb", "#f59e0b", "#7c3aed"],
    modules: [
      {
        name: "Salomlashish", short: "Salom", icon: "👋",
        lessons: [
          {
            title: "Salom va xayr", en: "Hello & Goodbye", min: 3,
            text: "Ingliz tilida salomlashish kun vaqtiga qarab o'zgaradi. \"Hello\" — har doim mos, \"Hi\" — do'stlar orasida. Xayrlashganda \"Goodbye\" yoki \"See you!\" deyiladi.",
            rule: { icon: "👋", name: "Good morning", en: "Good morning · afternoon · evening", desc: "Ertalab — morning, tushdan keyin — afternoon, kechqurun — evening." },
            tasks: [
              { t: "choose", q: "Good ___! (ertalab)", opts: ["morning", "evening", "night"], a: "morning", uz: "Xayrli tong!" },
              { t: "match", pairs: [["hello", "salom"], ["goodbye", "xayr"], ["thank you", "rahmat"], ["please", "iltimos"]] },
              { t: "build", s: "Nice to meet you", uz: "Tanishganimdan xursandman" },
            ],
          },
          {
            title: "O'zingizni tanishtiring", en: "Introduce yourself", min: 4,
            text: "O'zingizni tanishtirish uchun \"My name is ...\" yoki \"I'm ...\" deyiladi. Qayerdanligingizni aytish uchun \"I'm from ...\" ishlatiladi.",
            rule: { icon: "🙋", name: "My name is…", en: "My name is + ism · I'm from + joy", desc: "I'm = I am. \"I'm from Uzbekistan\" — Men O'zbekistondanman." },
            tasks: [
              { t: "choose", q: "My ___ is Aziz.", opts: ["name", "names", "am"], a: "name", uz: "Mening ismim Aziz." },
              { t: "build", s: "I am from Uzbekistan", uz: "Men O'zbekistondanman" },
              { t: "listen", w: "friend", uz: "do'st" },
            ],
          },
        ],
      },
      {
        name: "To be", short: "To be", icon: "🧩",
        lessons: [
          {
            title: "am / is / are", en: "The verb to be", min: 4,
            text: "\"To be\" — bo'lmoq. O'zbek tilida ko'pincha tushib qoladi (Men talabaman), lekin ingliz tilida albatta aytiladi: I am a student.",
            rule: { icon: "🧩", name: "am · is · are", en: "I am · he/she/it is · you/we/they are", desc: "Ega qaysi bo'lsa, fe'l shunga moslashadi." },
            tasks: [
              { t: "choose", q: "She ___ a doctor.", opts: ["am", "is", "are"], a: "is", uz: "U shifokor." },
              { t: "choose", q: "We ___ students.", opts: ["am", "is", "are"], a: "are", uz: "Biz talabamiz." },
              { t: "build", s: "I am very happy", uz: "Men juda xursandman" },
            ],
          },
          {
            title: "Inkor va so'roq", en: "Negatives & questions", min: 4,
            text: "Inkor uchun \"not\" qo'shiladi: I am not tired. So'roqda fe'l oldinga chiqadi: Are you tired?",
            rule: { icon: "❓", name: "Are you…?", en: "am/is/are + not · Are you…?", desc: "isn't = is not, aren't = are not." },
            tasks: [
              { t: "choose", q: "___ you from Tashkent?", opts: ["Is", "Are", "Am"], a: "Are", uz: "Siz Toshkentdanmisiz?" },
              { t: "choose", q: "He ___ at home now.", opts: ["isn't", "aren't", "am not"], a: "isn't", uz: "U hozir uyda emas." },
              { t: "build", s: "Is she your sister", end: "?", uz: "U sizning opangizmi?" },
            ],
          },
        ],
      },
      {
        name: "Oila va raqamlar", short: "Oila", icon: "👪",
        lessons: [
          {
            title: "Oila a'zolari", en: "My family", min: 3,
            text: "Oila a'zolarini aytishni o'rganamiz. \"This is my mother\" — Bu mening onam.",
            rule: { icon: "👪", name: "This is my…", en: "This is my + oila a'zosi", desc: "Bitta odam — This is, bir nechta odam — These are." },
            tasks: [
              { t: "match", pairs: [["mother", "ona"], ["father", "ota"], ["brother", "aka / uka"], ["sister", "opa / singil"]] },
              { t: "choose", q: "This is my ___. She is 70.", opts: ["grandmother", "brother", "father"], a: "grandmother", uz: "Bu mening buvim. U 70 yoshda." },
              { t: "listen", w: "family", uz: "oila" },
            ],
          },
          {
            title: "Raqamlar 1–20", en: "Numbers", min: 3,
            text: "Raqamlar kundalik hayotda juda kerak: yosh, narx, vaqt. 13 dan 19 gacha raqamlar -teen bilan tugaydi.",
            rule: { icon: "🔢", name: "-teen", en: "thirteen, fourteen … nineteen", desc: "15 — fifteen (fiveteen emas!), 13 — thirteen." },
            tasks: [
              { t: "match", pairs: [["three", "3"], ["seven", "7"], ["twelve", "12"], ["fifteen", "15"]] },
              { t: "choose", q: "I am ___ years old. (18)", opts: ["eighteen", "eighty", "eight"], a: "eighteen", uz: "Men 18 yoshdaman." },
              { t: "listen", w: "twenty", uz: "yigirma" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "elementary", name: "Elementary", cefr: "A2", palette: ["#0891b2", "#ea580c", "#9333ea"],
    modules: [
      {
        name: "Present Simple", short: "Present", icon: "⏰",
        lessons: [
          {
            title: "Odatlar", en: "Daily habits", min: 4,
            text: "Present Simple odatiy, doimiy ishlar uchun: I drink tea every morning. He / she / it bilan fe'lga -s qo'shiladi.",
            rule: { icon: "⏰", name: "he works", en: "he / she / it + fe'l + s", desc: "work → works, go → goes, watch → watches." },
            tasks: [
              { t: "choose", q: "He ___ in a bank.", opts: ["work", "works", "working"], a: "works", uz: "U bankda ishlaydi." },
              { t: "choose", q: "They ___ football on Sundays.", opts: ["play", "plays", "playing"], a: "play", uz: "Ular yakshanba kunlari futbol o'ynashadi." },
              { t: "build", s: "She gets up at seven", uz: "U soat yettida turadi" },
            ],
          },
          {
            title: "do / does", en: "Questions with do", min: 4,
            text: "So'roq va inkorda yordamchi fe'l ishlatiladi: Do you like tea? He doesn't like coffee. Does bilan asosiy fe'lga -s qo'shilmaydi!",
            rule: { icon: "❔", name: "Does he…?", en: "Do / Does + ega + fe'l", desc: "I / you / we / they — do, he / she / it — does." },
            tasks: [
              { t: "choose", q: "___ she speak English?", opts: ["Do", "Does", "Is"], a: "Does", uz: "U inglizcha gapiradimi?" },
              { t: "choose", q: "I ___ like cold weather.", opts: ["don't", "doesn't", "not"], a: "don't", uz: "Men sovuq havoni yoqtirmayman." },
              { t: "build", s: "Do you live in Samarkand", end: "?", uz: "Siz Samarqandda yashaysizmi?" },
            ],
          },
        ],
      },
      {
        name: "Kundalik hayot", short: "Kundalik", icon: "☕",
        lessons: [
          {
            title: "Ovqat va ichimliklar", en: "Food & drinks", min: 3,
            text: "Kafeda buyurtma berish: \"Can I have a cup of tea, please?\" — Menga bir piyola choy bera olasizmi?",
            rule: { icon: "☕", name: "Can I have…?", en: "Can I have + narsa + please?", desc: "Muloyim so'rash uchun eng qulay ibora." },
            tasks: [
              { t: "match", pairs: [["bread", "non"], ["milk", "sut"], ["meat", "go'sht"], ["rice", "guruch"]] },
              { t: "build", s: "Can I have some water please", end: "?", uz: "Menga suv bera olasizmi?" },
              { t: "listen", w: "breakfast", uz: "nonushta" },
            ],
          },
          {
            title: "Vaqt va kunlar", en: "Time & days", min: 3,
            text: "Hafta kunlari doim bosh harf bilan yoziladi: Monday, Tuesday... Kunlar oldidan \"on\" ishlatiladi: on Monday.",
            rule: { icon: "📅", name: "on · at · in", en: "on Monday · at 5 o'clock · in May", desc: "Kun — on, soat — at, oy va yil — in." },
            tasks: [
              { t: "choose", q: "The lesson starts ___ 9 o'clock.", opts: ["at", "on", "in"], a: "at", uz: "Dars soat 9 da boshlanadi." },
              { t: "choose", q: "My birthday is ___ May.", opts: ["in", "on", "at"], a: "in", uz: "Tug'ilgan kunim may oyida." },
              { t: "match", pairs: [["Monday", "dushanba"], ["Wednesday", "chorshanba"], ["Friday", "juma"], ["Sunday", "yakshanba"]] },
            ],
          },
        ],
      },
      {
        name: "There is / are", short: "There is", icon: "🏠",
        lessons: [
          {
            title: "Xonamda nima bor?", en: "There is / there are", min: 4,
            text: "Biror joyda nimadir borligini aytish uchun: There is a bed in my room. Ko'plikda — There are two chairs.",
            rule: { icon: "🏠", name: "There is / are", en: "There is + birlik · There are + ko'plik", desc: "So'roq: Is there…? Are there…?" },
            tasks: [
              { t: "choose", q: "There ___ a book on the table.", opts: ["is", "are", "am"], a: "is", uz: "Stol ustida kitob bor." },
              { t: "choose", q: "There ___ three windows in the room.", opts: ["is", "are", "be"], a: "are", uz: "Xonada uchta deraza bor." },
              { t: "build", s: "There is a park near my house", uz: "Uyim yaqinida park bor" },
            ],
          },
          {
            title: "some / any", en: "Some and any", min: 3,
            text: "Some — tasdiq gaplarda, any — inkor va so'roqda: I have some apples. Do you have any milk?",
            rule: { icon: "🍎", name: "some · any", en: "(+) some · (−) / (?) any", desc: "\"Bir oz / bir nechta\" ma'nosida." },
            tasks: [
              { t: "choose", q: "Is there ___ sugar?", opts: ["any", "some", "a"], a: "any", uz: "Shakar bormi?" },
              { t: "choose", q: "I bought ___ bread.", opts: ["some", "any", "an"], a: "some", uz: "Men non sotib oldim." },
              { t: "build", s: "We don't have any eggs", uz: "Bizda tuxum yo'q" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "preinter", name: "Pre-Inter", full: "Pre-Intermediate", cefr: "A2+", palette: ["#1d4ed8", "#16a34a", "#c2410c"],
    modules: [
      {
        name: "Past Simple", short: "Past", icon: "⏪",
        lessons: [
          {
            title: "To'g'ri fe'llar", en: "Regular verbs", min: 4,
            text: "O'tgan zamonda tugagan ishlar: I visited Bukhara last year. To'g'ri fe'llarga -ed qo'shiladi.",
            rule: { icon: "⏪", name: "-ed", en: "fe'l + ed", desc: "play → played, study → studied, stop → stopped." },
            tasks: [
              { t: "choose", q: "We ___ TV last night.", opts: ["watched", "watch", "watches"], a: "watched", uz: "Kecha kechqurun televizor ko'rdik." },
              { t: "choose", q: "She ___ English for two years.", opts: ["studied", "studyed", "studies"], a: "studied", uz: "U ikki yil ingliz tilini o'qidi." },
              { t: "build", s: "I visited my grandmother yesterday", uz: "Kecha buvimni ko'rgani bordim" },
            ],
          },
          {
            title: "Noto'g'ri fe'llar", en: "Irregular verbs", min: 5,
            text: "Ba'zi fe'llar -ed olmaydi, ularni yodlash kerak: go → went, eat → ate, see → saw, buy → bought.",
            rule: { icon: "🔀", name: "go → went", en: "V1 → V2 (2-shakl)", desc: "Inkor va so'roqda did + 1-shakl: I didn't go. Did you go?" },
            tasks: [
              { t: "match", pairs: [["go", "went"], ["eat", "ate"], ["see", "saw"], ["buy", "bought"]] },
              { t: "choose", q: "Did you ___ the film?", opts: ["see", "saw", "seen"], a: "see", uz: "Filmni ko'rdingmi?" },
              { t: "build", s: "He went to London last summer", uz: "U o'tgan yozda Londonga bordi" },
            ],
          },
        ],
      },
      {
        name: "Kelasi zamon", short: "Future", icon: "🚀",
        lessons: [
          {
            title: "will", en: "Future with will", min: 3,
            text: "\"Will\" — hozir qaror qilingan ish yoki taxmin: I think it will rain. I'll help you!",
            rule: { icon: "🚀", name: "will + fe'l", en: "ega + will + fe'l (1-shakl)", desc: "Inkor: won't = will not." },
            tasks: [
              { t: "choose", q: "I think she ___ win.", opts: ["will", "wills", "is"], a: "will", uz: "Menimcha, u g'alaba qozonadi." },
              { t: "choose", q: "Don't worry, I ___ tell anyone.", opts: ["won't", "willn't", "don't"], a: "won't", uz: "Xavotir olma, hech kimga aytmayman." },
              { t: "build", s: "I will call you tomorrow", uz: "Ertaga senga qo'ng'iroq qilaman" },
            ],
          },
          {
            title: "going to", en: "Future plans", min: 4,
            text: "Oldindan rejalashtirilgan ishlar uchun \"be going to\": We are going to travel to Istanbul.",
            rule: { icon: "🗺️", name: "going to", en: "am/is/are + going to + fe'l", desc: "Reja va aniq belgilar asosidagi bashorat." },
            tasks: [
              { t: "choose", q: "They ___ going to buy a car.", opts: ["are", "is", "will"], a: "are", uz: "Ular mashina sotib olmoqchi." },
              { t: "choose", q: "Look at the clouds! It ___ rain.", opts: ["is going to", "going to", "are going to"], a: "is going to", uz: "Bulutlarga qara! Yomg'ir yog'adi." },
              { t: "build", s: "We are going to study tonight", uz: "Bugun kechqurun o'qimoqchimiz" },
            ],
          },
        ],
      },
      {
        name: "Taqqoslash", short: "Taqqos", icon: "⚖️",
        lessons: [
          {
            title: "Qiyosiy daraja", en: "Comparatives", min: 4,
            text: "Ikki narsani taqqoslash: Tashkent is bigger than Samarkand. Qisqa sifatlarga -er, uzunlariga more qo'shiladi.",
            rule: { icon: "⚖️", name: "-er than", en: "sifat + er + than · more + sifat + than", desc: "big → bigger, good → better, beautiful → more beautiful." },
            tasks: [
              { t: "choose", q: "My brother is ___ than me.", opts: ["taller", "more tall", "tallest"], a: "taller", uz: "Akam mendan balandroq." },
              { t: "choose", q: "This book is ___ than that one.", opts: ["more interesting", "interestinger", "most interesting"], a: "more interesting", uz: "Bu kitob unisidan qiziqroq." },
              { t: "build", s: "Summer is hotter than spring", uz: "Yoz bahordan issiqroq" },
            ],
          },
          {
            title: "Orttirma daraja", en: "Superlatives", min: 4,
            text: "Eng ... ekanini aytish: Everest is the highest mountain. Doim \"the\" bilan ishlatiladi.",
            rule: { icon: "🏆", name: "the -est", en: "the + sifat + est · the most + sifat", desc: "good → the best, bad → the worst." },
            tasks: [
              { t: "choose", q: "She is the ___ student in our class.", opts: ["best", "better", "goodest"], a: "best", uz: "U sinfimizdagi eng yaxshi o'quvchi." },
              { t: "choose", q: "It was the ___ day of my life.", opts: ["happiest", "happier", "most happy"], a: "happiest", uz: "Bu hayotimdagi eng baxtli kun edi." },
              { t: "build", s: "This is the most beautiful city", uz: "Bu eng chiroyli shahar" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "intermediate", name: "Intermediate", cefr: "B1", palette: ["#7c3aed", "#0284c7", "#15803d"],
    modules: [
      {
        name: "Present Perfect", short: "Perfect", icon: "✅",
        lessons: [
          {
            title: "Tajriba", en: "Have you ever…?", min: 5,
            text: "Present Perfect — hayotiy tajriba yoki natijasi hozir ko'rinib turgan ish: I have been to Paris. She has lost her keys.",
            rule: { icon: "✅", name: "have + V3", en: "have / has + fe'lning 3-shakli", desc: "ever — hech (so'roqda), never — hech qachon (inkor ma'nosida)." },
            tasks: [
              { t: "choose", q: "Have you ever ___ sushi?", opts: ["eaten", "ate", "eat"], a: "eaten", uz: "Hech sushi yeganmisan?" },
              { t: "choose", q: "She ___ never been to London.", opts: ["has", "have", "is"], a: "has", uz: "U hech qachon Londonda bo'lmagan." },
              { t: "build", s: "I have already finished my homework", uz: "Men uy vazifamni allaqachon tugatdim" },
            ],
          },
          {
            title: "for / since", en: "For and since", min: 4,
            text: "Hozirgacha davom etayotgan holat: I have lived here for five years / since 2020.",
            rule: { icon: "⏳", name: "for · since", en: "for + davomiylik · since + boshlanish nuqtasi", desc: "for two hours, since Monday." },
            tasks: [
              { t: "choose", q: "I have known him ___ 2015.", opts: ["since", "for", "from"], a: "since", uz: "Men uni 2015-yildan beri bilaman." },
              { t: "choose", q: "We have waited ___ an hour.", opts: ["for", "since", "during"], a: "for", uz: "Biz bir soatdan beri kutyapmiz." },
              { t: "build", s: "She has worked here for three years", uz: "U bu yerda uch yildan beri ishlaydi" },
            ],
          },
        ],
      },
      {
        name: "Modal fe'llar", short: "Modal", icon: "🔑",
        lessons: [
          {
            title: "can / must / should", en: "Modal verbs", min: 4,
            text: "Modal fe'llar qobiliyat, majburiyat va maslahatni bildiradi. Ulardan keyin fe'l \"to\"siz keladi.",
            rule: { icon: "🔑", name: "must · should", en: "can — qila olmoq · must — shart · should — kerak", desc: "You should see a doctor. — Shifokorga borishingiz kerak." },
            tasks: [
              { t: "choose", q: "You look tired. You ___ rest.", opts: ["should", "can", "mustn't"], a: "should", uz: "Charchagan ko'rinasiz. Dam olishingiz kerak." },
              { t: "choose", q: "Students ___ use phones in the exam.", opts: ["mustn't", "should", "can"], a: "mustn't", uz: "Imtihonda telefon ishlatish mumkin emas." },
              { t: "build", s: "Can you help me with this", end: "?", uz: "Bunga yordam bera olasizmi?" },
            ],
          },
          {
            title: "have to", en: "Have to vs must", min: 3,
            text: "\"Have to\" — tashqi majburiyat (qoida, ish). \"Don't have to\" — shart emas, lekin \"mustn't\" — mumkin emas!",
            rule: { icon: "📋", name: "don't have to", en: "don't have to = shart emas", desc: "You don't have to come. — Kelishing shart emas." },
            tasks: [
              { t: "choose", q: "It's Sunday. I ___ go to work.", opts: ["don't have to", "mustn't", "have to"], a: "don't have to", uz: "Bugun yakshanba. Ishga borishim shart emas." },
              { t: "choose", q: "She ___ wear a uniform at school.", opts: ["has to", "have to", "must to"], a: "has to", uz: "U maktabda forma kiyishi kerak." },
              { t: "build", s: "We have to leave at six", uz: "Biz soat oltida ketishimiz kerak" },
            ],
          },
        ],
      },
      {
        name: "Shart gaplar", short: "If", icon: "🔀",
        lessons: [
          {
            title: "First conditional", en: "If + present, will", min: 4,
            text: "Real, bo'lishi mumkin bo'lgan shart: If it rains, we will stay at home. \"If\" qismida will ishlatilmaydi!",
            rule: { icon: "🌧️", name: "If… will", en: "If + Present Simple, will + fe'l", desc: "If you study, you will pass." },
            tasks: [
              { t: "choose", q: "If you ___ hard, you will pass.", opts: ["study", "will study", "studied"], a: "study", uz: "Qattiq o'qisang, imtihondan o'tasan." },
              { t: "choose", q: "If it's sunny, we ___ to the park.", opts: ["will go", "go", "went"], a: "will go", uz: "Havo quyoshli bo'lsa, parkka boramiz." },
              { t: "build", s: "If I have time I will call you", uz: "Vaqtim bo'lsa, senga qo'ng'iroq qilaman" },
            ],
          },
          {
            title: "Zero conditional", en: "General truths", min: 3,
            text: "Doim to'g'ri bo'lgan qoidalar: If you heat water to 100°C, it boils. Ikkala qismda ham Present Simple.",
            rule: { icon: "🔥", name: "If… present", en: "If + Present Simple, Present Simple", desc: "Ilmiy faktlar va umumiy haqiqatlar uchun." },
            tasks: [
              { t: "choose", q: "If you mix red and blue, you ___ purple.", opts: ["get", "will got", "got"], a: "get", uz: "Qizil va ko'kni aralashtirsangiz, binafsha hosil bo'ladi." },
              { t: "choose", q: "Ice ___ if you heat it.", opts: ["melts", "melt", "melted"], a: "melts", uz: "Muzni isitsangiz, eriydi." },
              { t: "build", s: "If I drink coffee I can't sleep", uz: "Qahva ichsam, uxlay olmayman" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "upper", name: "Upper-Inter", full: "Upper-Intermediate", cefr: "B2", palette: ["#dc2626", "#2563eb", "#ca8a04"],
    modules: [
      {
        name: "Passive voice", short: "Passive", icon: "🔄",
        lessons: [
          {
            title: "Majhul nisbat", en: "The passive", min: 5,
            text: "Harakatni kim qilgani muhim bo'lmasa, passive ishlatiladi: The bridge was built in 1990. English is spoken all over the world.",
            rule: { icon: "🔄", name: "be + V3", en: "be (am / is / was…) + fe'lning 3-shakli", desc: "Kim qilgani: by … — The book was written by Navoi." },
            tasks: [
              { t: "choose", q: "This house ___ in 1950.", opts: ["was built", "built", "is build"], a: "was built", uz: "Bu uy 1950-yilda qurilgan." },
              { t: "choose", q: "English ___ in many countries.", opts: ["is spoken", "speaks", "is speaking"], a: "is spoken", uz: "Ko'p davlatlarda ingliz tilida gaplashiladi." },
              { t: "build", s: "The letter was sent yesterday", uz: "Xat kecha yuborildi" },
            ],
          },
          {
            title: "Passive: boshqa zamonlar", en: "Passive tenses", min: 4,
            text: "Passive har qanday zamonda bo'ladi: The room is being cleaned. The work has been done. It will be finished tomorrow.",
            rule: { icon: "🧱", name: "has been done", en: "has been / is being / will be + V3", desc: "\"be\" zamonga qarab o'zgaradi, V3 o'zgarmaydi." },
            tasks: [
              { t: "choose", q: "The results ___ announced tomorrow.", opts: ["will be", "will", "are be"], a: "will be", uz: "Natijalar ertaga e'lon qilinadi." },
              { t: "choose", q: "My car ___ repaired at the moment.", opts: ["is being", "is been", "being"], a: "is being", uz: "Mashinam hozir ta'mirlanmoqda." },
              { t: "build", s: "The project has been completed", uz: "Loyiha yakunlandi" },
            ],
          },
        ],
      },
      {
        name: "Reported speech", short: "Reported", icon: "💬",
        lessons: [
          {
            title: "U aytdiki…", en: "Reported statements", min: 5,
            text: "Birovning gapini yetkazganda zamon bir qadam orqaga suriladi: \"I am tired\" → She said (that) she was tired.",
            rule: { icon: "💬", name: "said that", en: "is → was · will → would · can → could", desc: "Olmoshlar ham o'zgaradi: I → he / she." },
            tasks: [
              { t: "choose", q: "\"I like tea.\" → He said he ___ tea.", opts: ["liked", "likes", "like"], a: "liked", uz: "U choyni yoqtirishini aytdi." },
              { t: "choose", q: "\"I will come.\" → She said she ___ come.", opts: ["would", "will", "can"], a: "would", uz: "U kelishini aytdi." },
              { t: "build", s: "She told me that she was busy", uz: "U menga band ekanini aytdi" },
            ],
          },
          {
            title: "So'roqni yetkazish", en: "Reported questions", min: 4,
            text: "So'roqni yetkazganda so'z tartibi oddiy gapdek bo'ladi: \"Where do you live?\" → He asked where I lived.",
            rule: { icon: "❓", name: "asked if", en: "asked + if / wh- + ega + fe'l", desc: "Ha/yo'q savollarda if yoki whether ishlatiladi." },
            tasks: [
              { t: "choose", q: "\"Are you OK?\" → She asked ___ I was OK.", opts: ["if", "that", "what"], a: "if", uz: "U yaxshimisan deb so'radi." },
              { t: "choose", q: "He asked me where I ___.", opts: ["worked", "did work", "do work"], a: "worked", uz: "U qayerda ishlashimni so'radi." },
              { t: "build", s: "They asked what time it was", uz: "Ular soat necha ekanini so'rashdi" },
            ],
          },
        ],
      },
      {
        name: "Conditionals 2 & 3", short: "If 2·3", icon: "💭",
        lessons: [
          {
            title: "Second conditional", en: "Unreal present", min: 5,
            text: "Hozirgi xayoliy holat: If I had a million dollars, I would travel the world. \"I\" bilan \"were\" ishlatiladi: If I were you…",
            rule: { icon: "💭", name: "If… would", en: "If + Past Simple, would + fe'l", desc: "If I were you, I would… — Sening o'rningda bo'lsam…" },
            tasks: [
              { t: "choose", q: "If I ___ rich, I would buy a house.", opts: ["were", "am", "will be"], a: "were", uz: "Boy bo'lganimda, uy sotib olardim." },
              { t: "choose", q: "If she knew the answer, she ___ tell us.", opts: ["would", "will", "does"], a: "would", uz: "Javobni bilganida, bizga aytardi." },
              { t: "build", s: "If I were you I would apologize", uz: "Sening o'rningda bo'lsam, kechirim so'rardim" },
            ],
          },
          {
            title: "Third conditional", en: "Unreal past", min: 5,
            text: "O'tmishdagi amalga oshmagan shart va afsus: If I had studied, I would have passed.",
            rule: { icon: "🕰️", name: "had + V3", en: "If + had + V3, would have + V3", desc: "O'tmishni o'zgartirib bo'lmaydi — faqat xayol va afsus." },
            tasks: [
              { t: "choose", q: "If we had left earlier, we ___ the train.", opts: ["would have caught", "would catch", "caught"], a: "would have caught", uz: "Ertaroq chiqqanimizda, poyezdga ulgurardik." },
              { t: "choose", q: "If she ___ me, I would have helped.", opts: ["had asked", "asked", "has asked"], a: "had asked", uz: "U mendan so'raganida, yordam bergan bo'lardim." },
              { t: "build", s: "I would have come if you had called", uz: "Qo'ng'iroq qilganingda, kelgan bo'lardim" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ielts", name: "IELTS", cefr: "B2–C1", palette: ["#0e7490", "#be123c", "#4f46e5"],
    modules: [
      {
        name: "Listening", short: "Listening", icon: "🎧",
        lessons: [
          {
            title: "Raqam va sanalar", en: "Numbers & dates", min: 4,
            text: "IELTS Listening 1-qismida ism, telefon raqami, sana ko'p so'raladi. Raqam va so'zlarni aniq eshitib, to'g'ri yozishni mashq qiling.",
            rule: { icon: "🎧", name: "Spelling", en: "13 thirteen ≠ 30 thirty", desc: "-teen oxiri cho'ziq va urg'uli, -ty qisqa. Diqqat bilan tinglang!" },
            tasks: [
              { t: "listen", w: "thirteen", uz: "13" },
              { t: "listen", w: "Wednesday", uz: "chorshanba" },
              { t: "listen", w: "accommodation", uz: "turar joy" },
            ],
          },
          {
            title: "Sinonimlar", en: "Keywords & synonyms", min: 4,
            text: "Savoldagi so'z audioda ko'pincha sinonim bilan aytiladi. Masalan: savolda \"cheap\", audioda \"inexpensive\".",
            rule: { icon: "🔁", name: "Paraphrase", en: "cheap = inexpensive = affordable", desc: "Sinonimlarni bilish — yuqori ball kaliti." },
            tasks: [
              { t: "match", pairs: [["cheap", "affordable"], ["big", "enormous"], ["start", "commence"], ["buy", "purchase"]] },
              { t: "choose", q: "\"The course begins in May\" = The course ___ in May.", opts: ["starts", "ends", "stops"], a: "starts", uz: "Kurs mayda boshlanadi." },
              { t: "listen", w: "environment", uz: "atrof-muhit" },
            ],
          },
        ],
      },
      {
        name: "Reading", short: "Reading", icon: "📖",
        lessons: [
          {
            title: "True / False / Not Given", en: "TFNG questions", min: 5,
            text: "True — matnda aynan shunday. False — matnga zid. Not Given — matnda bu haqda ma'lumot yo'q. Eng ko'p xato Not Given'da bo'ladi!",
            rule: { icon: "📖", name: "TFNG", en: "True · False · Not Given", desc: "O'z bilimingizga emas, faqat matnga tayaning." },
            tasks: [
              { t: "choose", q: "Text: \"Tea was brought to Britain in the 1600s.\" — Tea came to Britain in the 17th century. ___", opts: ["True", "False", "Not Given"], a: "True", uz: "1600-yillar = XVII asr." },
              { t: "choose", q: "Text: \"The museum opens at 9 am.\" — The museum is free. ___", opts: ["True", "False", "Not Given"], a: "Not Given", uz: "Narx haqida matnda hech narsa yo'q." },
              { t: "choose", q: "Text: \"Most students prefer online classes.\" — Few students like online classes. ___", opts: ["True", "False", "Not Given"], a: "False", uz: "Most (ko'pchilik) ≠ few (ozchilik)." },
            ],
          },
          {
            title: "Akademik lug'at", en: "Academic vocabulary", min: 4,
            text: "Reading matnlarida akademik so'zlar ko'p uchraydi. Ularni bilish tezroq va to'g'riroq o'qishga yordam beradi.",
            rule: { icon: "🎓", name: "Academic words", en: "significant · evidence · approach", desc: "Har kuni 5 ta akademik so'z yodlang." },
            tasks: [
              { t: "match", pairs: [["significant", "muhim"], ["evidence", "dalil"], ["increase", "oshmoq"], ["approach", "yondashuv"]] },
              { t: "choose", q: "There is strong ___ that exercise improves memory.", opts: ["evidence", "evident", "evidently"], a: "evidence", uz: "Mashq xotirani yaxshilashiga kuchli dalil bor." },
              { t: "build", s: "The number of tourists increased significantly", uz: "Sayyohlar soni sezilarli darajada oshdi" },
            ],
          },
        ],
      },
      {
        name: "Writing & Speaking", short: "Writing", icon: "✍️",
        lessons: [
          {
            title: "Task 1: grafikni tasvirlash", en: "Describing trends", min: 5,
            text: "Writing Task 1 da grafikdagi o'zgarishlarni tasvirlaysiz: rose sharply, fell slightly, remained stable.",
            rule: { icon: "📈", name: "Trends", en: "rise · fall · remain stable · peak", desc: "Fe'l + ravish: increased dramatically, decreased gradually." },
            tasks: [
              { t: "match", pairs: [["rose", "oshdi"], ["fell", "kamaydi"], ["peaked", "cho'qqiga chiqdi"], ["remained stable", "o'zgarmadi"]] },
              { t: "choose", q: "Sales rose ___ from 10% to 60%.", opts: ["dramatically", "slight", "stable"], a: "dramatically", uz: "Sotuvlar 10% dan 60% gacha keskin oshdi." },
              { t: "build", s: "The graph shows the number of visitors", uz: "Grafik tashrif buyuruvchilar sonini ko'rsatadi" },
            ],
          },
          {
            title: "Speaking: fikr bildirish", en: "Giving opinions", min: 4,
            text: "Speaking'da fikringizni aniq aytib, sababini tushuntiring. Doim \"I think\" emas, turli iboralardan foydalaning.",
            rule: { icon: "🗣️", name: "Opinions", en: "In my opinion · From my point of view", desc: "Fikr + sabab + misol = to'liq javob." },
            tasks: [
              { t: "choose", q: "___ my opinion, reading is better than watching TV.", opts: ["In", "On", "At"], a: "In", uz: "Menimcha, kitob o'qish televizor ko'rishdan yaxshiroq." },
              { t: "choose", q: "From my point of ___, cities are too crowded.", opts: ["view", "look", "see"], a: "view", uz: "Mening nazarimda, shaharlar juda gavjum." },
              { t: "build", s: "I would say that technology helps us learn", uz: "Aytishim mumkinki, texnologiya o'rganishga yordam beradi" },
            ],
          },
        ],
      },
    ],
  },
];

// Har bir darsga yagona id va tartib raqami beramiz.
LEVELS.forEach((lv) => {
  lv.lessons = [];
  lv.modules.forEach((m, mi) => {
    m.lessons.forEach((l, li) => {
      l.id = `${lv.id}-${mi}-${li}`;
      l.module = mi;
      l.index = lv.lessons.length;
      lv.lessons.push(l);
    });
  });
});
