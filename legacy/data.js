// So'zlar bazasi: yangi so'z qo'shish uchun kerakli kategoriyaga qator qo'shing.
const WORDS = {
  "Kundalik": [
    { en: "hello", uz: "salom", tr: "/həˈləʊ/", ex: "Hello! How are you?" },
    { en: "thank you", uz: "rahmat", tr: "/θæŋk juː/", ex: "Thank you for your help." },
    { en: "please", uz: "iltimos", tr: "/pliːz/", ex: "Please sit down." },
    { en: "sorry", uz: "kechirasiz", tr: "/ˈsɒri/", ex: "Sorry, I am late." },
    { en: "friend", uz: "do'st", tr: "/frend/", ex: "She is my best friend." },
    { en: "morning", uz: "ertalab", tr: "/ˈmɔːnɪŋ/", ex: "Good morning, teacher!" },
    { en: "water", uz: "suv", tr: "/ˈwɔːtə/", ex: "Can I have some water?" },
    { en: "time", uz: "vaqt", tr: "/taɪm/", ex: "What time is it?" },
  ],
  "Oila": [
    { en: "mother", uz: "ona", tr: "/ˈmʌðə/", ex: "My mother is a doctor." },
    { en: "father", uz: "ota", tr: "/ˈfɑːðə/", ex: "My father works in a bank." },
    { en: "sister", uz: "opa / singil", tr: "/ˈsɪstə/", ex: "I have one sister." },
    { en: "brother", uz: "aka / uka", tr: "/ˈbrʌðə/", ex: "His brother is tall." },
    { en: "grandmother", uz: "buvi", tr: "/ˈɡrænˌmʌðə/", ex: "My grandmother cooks plov." },
    { en: "child", uz: "bola", tr: "/tʃaɪld/", ex: "The child is playing." },
    { en: "family", uz: "oila", tr: "/ˈfæməli/", ex: "I love my family." },
  ],
  "Ovqat": [
    { en: "bread", uz: "non", tr: "/bred/", ex: "We eat bread every day." },
    { en: "apple", uz: "olma", tr: "/ˈæpl/", ex: "This apple is sweet." },
    { en: "meat", uz: "go'sht", tr: "/miːt/", ex: "I don't eat much meat." },
    { en: "milk", uz: "sut", tr: "/mɪlk/", ex: "Children drink milk." },
    { en: "tea", uz: "choy", tr: "/tiː/", ex: "Would you like some tea?" },
    { en: "rice", uz: "guruch", tr: "/raɪs/", ex: "Plov is made with rice." },
    { en: "egg", uz: "tuxum", tr: "/eɡ/", ex: "I had two eggs for breakfast." },
  ],
  "Fe'llar": [
    { en: "go", uz: "bormoq", tr: "/ɡəʊ/", ex: "I go to school every day." },
    { en: "eat", uz: "yemoq", tr: "/iːt/", ex: "Let's eat together." },
    { en: "read", uz: "o'qimoq", tr: "/riːd/", ex: "She reads books." },
    { en: "write", uz: "yozmoq", tr: "/raɪt/", ex: "Write your name here." },
    { en: "speak", uz: "gapirmoq", tr: "/spiːk/", ex: "Do you speak English?" },
    { en: "listen", uz: "tinglamoq", tr: "/ˈlɪsn/", ex: "Listen to the teacher." },
    { en: "learn", uz: "o'rganmoq", tr: "/lɜːn/", ex: "I want to learn English." },
    { en: "buy", uz: "sotib olmoq", tr: "/baɪ/", ex: "I need to buy a new phone." },
  ],
  "Sifatlar": [
    { en: "big", uz: "katta", tr: "/bɪɡ/", ex: "They live in a big house." },
    { en: "small", uz: "kichik", tr: "/smɔːl/", ex: "It is a small cat." },
    { en: "beautiful", uz: "chiroyli", tr: "/ˈbjuːtɪfl/", ex: "Samarkand is a beautiful city." },
    { en: "happy", uz: "baxtli / xursand", tr: "/ˈhæpi/", ex: "I am very happy today." },
    { en: "difficult", uz: "qiyin", tr: "/ˈdɪfɪkəlt/", ex: "This task is difficult." },
    { en: "easy", uz: "oson", tr: "/ˈiːzi/", ex: "English is easy!" },
    { en: "hot", uz: "issiq", tr: "/hɒt/", ex: "Summer is hot in Tashkent." },
    { en: "cold", uz: "sovuq", tr: "/kəʊld/", ex: "The water is cold." },
  ],
};

const GRAMMAR = [
  {
    title: "To be (am / is / are)",
    text: "\"To be\" fe'li \"bo'lmoq\" ma'nosini beradi. O'zbek tilida ko'pincha tushib qoladi, lekin ingliz tilida albatta ishlatiladi.",
    formula: "I → am · he / she / it → is · you / we / they → are",
    examples: [
      ["I am a student.", "Men talabaman."],
      ["She is happy.", "U xursand."],
      ["They are at home.", "Ular uyda."],
    ],
  },
  {
    title: "Present Simple",
    text: "Doimiy, odatiy harakatlar uchun ishlatiladi. He / she / it bilan fe'lga -s qo'shiladi.",
    formula: "Ega + fe'l(+s) · Inkor: don't / doesn't + fe'l · So'roq: Do / Does + ega + fe'l?",
    examples: [
      ["I drink tea every morning.", "Men har kuni ertalab choy ichaman."],
      ["He works in a hospital.", "U kasalxonada ishlaydi."],
      ["Does she speak English?", "U inglizcha gapiradimi?"],
    ],
  },
  {
    title: "Present Continuous",
    text: "Hozir, aynan shu paytda bo'layotgan harakatlar uchun.",
    formula: "Ega + am / is / are + fe'l-ing",
    examples: [
      ["I am reading a book now.", "Men hozir kitob o'qiyapman."],
      ["They are playing football.", "Ular futbol o'ynashyapti."],
    ],
  },
  {
    title: "Past Simple",
    text: "O'tgan zamonda tugagan harakatlar. To'g'ri fe'llarga -ed qo'shiladi, noto'g'ri fe'llar yodlanadi (go → went, eat → ate).",
    formula: "Ega + fe'l-ed / 2-shakl · Inkor: didn't + fe'l · So'roq: Did + ega + fe'l?",
    examples: [
      ["I visited Bukhara last year.", "Men o'tgan yili Buxoroga bordim."],
      ["She went to school yesterday.", "U kecha maktabga bordi."],
      ["Did you eat breakfast?", "Nonushta qildingmi?"],
    ],
  },
  {
    title: "Artikllar: a / an / the",
    text: "A / an — birinchi marta tilga olingan, sanaladigan birlikdagi otlar oldidan. An — unli tovush bilan boshlansa. The — aniq, ma'lum narsa haqida gapirganda.",
    formula: "a book · an apple · the book (o'sha kitob)",
    examples: [
      ["I have a cat. The cat is black.", "Mening mushugim bor. Mushuk qora."],
      ["She is an engineer.", "U muhandis."],
    ],
  },
  {
    title: "Future: will / going to",
    text: "Will — hozir qaror qilingan yoki taxminiy kelajak. Going to — oldindan rejalashtirilgan ish.",
    formula: "Ega + will + fe'l · Ega + am / is / are + going to + fe'l",
    examples: [
      ["I will help you.", "Men senga yordam beraman."],
      ["We are going to travel to London.", "Biz Londonga sayohat qilmoqchimiz."],
    ],
  },
];
