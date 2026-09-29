// Bu fayl legacy/ dagi eski ma'lumotlardan ko'chirilgan.
// Yangi dars qo'shish uchun shu faylni tahrirlang.

import type { GrammarTopic } from "@/types";

export const GRAMMAR: GrammarTopic[] = [
  {
    "title": "To be (am / is / are)",
    "text": "\"To be\" fe'li \"bo'lmoq\" ma'nosini beradi. O'zbek tilida ko'pincha tushib qoladi, lekin ingliz tilida albatta ishlatiladi.",
    "formula": "I → am · he / she / it → is · you / we / they → are",
    "examples": [
      [
        "I am a student.",
        "Men talabaman."
      ],
      [
        "She is happy.",
        "U xursand."
      ],
      [
        "They are at home.",
        "Ular uyda."
      ]
    ]
  },
  {
    "title": "Present Simple",
    "text": "Doimiy, odatiy harakatlar uchun ishlatiladi. He / she / it bilan fe'lga -s qo'shiladi.",
    "formula": "Ega + fe'l(+s) · Inkor: don't / doesn't + fe'l · So'roq: Do / Does + ega + fe'l?",
    "examples": [
      [
        "I drink tea every morning.",
        "Men har kuni ertalab choy ichaman."
      ],
      [
        "He works in a hospital.",
        "U kasalxonada ishlaydi."
      ],
      [
        "Does she speak English?",
        "U inglizcha gapiradimi?"
      ]
    ]
  },
  {
    "title": "Present Continuous",
    "text": "Hozir, aynan shu paytda bo'layotgan harakatlar uchun.",
    "formula": "Ega + am / is / are + fe'l-ing",
    "examples": [
      [
        "I am reading a book now.",
        "Men hozir kitob o'qiyapman."
      ],
      [
        "They are playing football.",
        "Ular futbol o'ynashyapti."
      ]
    ]
  },
  {
    "title": "Past Simple",
    "text": "O'tgan zamonda tugagan harakatlar. To'g'ri fe'llarga -ed qo'shiladi, noto'g'ri fe'llar yodlanadi (go → went, eat → ate).",
    "formula": "Ega + fe'l-ed / 2-shakl · Inkor: didn't + fe'l · So'roq: Did + ega + fe'l?",
    "examples": [
      [
        "I visited Bukhara last year.",
        "Men o'tgan yili Buxoroga bordim."
      ],
      [
        "She went to school yesterday.",
        "U kecha maktabga bordi."
      ],
      [
        "Did you eat breakfast?",
        "Nonushta qildingmi?"
      ]
    ]
  },
  {
    "title": "Artikllar: a / an / the",
    "text": "A / an — birinchi marta tilga olingan, sanaladigan birlikdagi otlar oldidan. An — unli tovush bilan boshlansa. The — aniq, ma'lum narsa haqida gapirganda.",
    "formula": "a book · an apple · the book (o'sha kitob)",
    "examples": [
      [
        "I have a cat. The cat is black.",
        "Mening mushugim bor. Mushuk qora."
      ],
      [
        "She is an engineer.",
        "U muhandis."
      ]
    ]
  },
  {
    "title": "Future: will / going to",
    "text": "Will — hozir qaror qilingan yoki taxminiy kelajak. Going to — oldindan rejalashtirilgan ish.",
    "formula": "Ega + will + fe'l · Ega + am / is / are + going to + fe'l",
    "examples": [
      [
        "I will help you.",
        "Men senga yordam beraman."
      ],
      [
        "We are going to travel to London.",
        "Biz Londonga sayohat qilmoqchimiz."
      ]
    ]
  }
];
