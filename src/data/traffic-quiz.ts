/**
 * Qizil chiroqdan o'tgan foydalanuvchiga beriladigan test.
 * Savollar yo'l harakati va jarimalar mavzusidagi inglizcha so'zlarga asoslangan —
 * jazo ham, dars ham bo'lsin.
 *
 * Har safar shu ro'yxatdan 10 tasi tasodifiy tanlanadi, shuning uchun
 * savollar hech qachon bir xil bo'lmaydi. Yangi savol qo'shish — ro'yxatga
 * yana bitta element qo'shish.
 */
export type TrafficQuestion = {
  q: string;
  /** Savolning o'zbekcha izohi. */
  uz: string;
  options: string[];
  answer: string;
};

export const TRAFFIC_QUIZ: TrafficQuestion[] = [
  // ---------- Svetafor va belgilar ----------
  {
    q: "A red traffic light means you must ___.",
    uz: "Qizil chiroq nimani anglatadi?",
    options: ["stop", "speed up", "turn left", "park"],
    answer: "stop",
  },
  {
    q: "A green light means you can ___.",
    uz: "Yashil chiroq nimani anglatadi?",
    options: ["go", "stop", "reverse", "wait"],
    answer: "go",
  },
  {
    q: "An amber (yellow) light means you should ___.",
    uz: "Sariq chiroq nimani anglatadi?",
    options: ["get ready to stop", "drive faster", "turn around", "park"],
    answer: "get ready to stop",
  },
  {
    q: "The sign said the speed ___ was 60 km/h.",
    uz: "Belgida tezlik ___ 60 km/soat deb yozilgan edi.",
    options: ["limit", "line", "level", "light"],
    answer: "limit",
  },
  {
    q: "A round sign with a red border usually gives an ___.",
    uz: "Qizil chegarali dumaloq belgi odatda nima beradi?",
    options: ["order", "idea", "offer", "answer"],
    answer: "order",
  },
  {
    q: "People walk across the road at a ___ crossing.",
    uz: "Piyodalar yo'lni qayerdan kesib o'tadi?",
    options: ["pedestrian", "railway", "border", "river"],
    answer: "pedestrian",
  },
  {
    q: "You must give ___ to cars already on the roundabout.",
    uz: "Aylanma yo'ldagi mashinalarga nima qilish kerak?",
    options: ["way", "road", "place", "path"],
    answer: "way",
  },
  {
    q: "At a zebra crossing, drivers must let pedestrians ___.",
    uz: "Zebrada haydovchi piyodalarga nima qilishi kerak?",
    options: ["cross", "wait", "hurry", "stand"],
    answer: "cross",
  },

  // ---------- Jarima va politsiya ----------
  {
    q: "Money you pay for breaking a traffic rule is called a ___.",
    uz: "Qoidabuzarlik uchun to'lanadigan pul qanday ataladi?",
    options: ["fine", "ticket office", "salary", "fare"],
    answer: "fine",
  },
  {
    q: "The police officer asked to see my driving ___.",
    uz: "Politsiyachi nimani ko'rsatishni so'radi?",
    options: ["licence", "passport photo", "receipt", "menu"],
    answer: "licence",
  },
  {
    q: "If you ignore a red light, the police may ___ you.",
    uz: "Qizil chiroqni e'tiborsiz qoldirsangiz, politsiya nima qiladi?",
    options: ["stop", "thank", "invite", "greet"],
    answer: "stop",
  },
  {
    q: "He was fined because he ___ the red light.",
    uz: "U jarima oldi, chunki qizil chiroqdan ___.",
    options: ["ran", "runs", "running", "run"],
    answer: "ran",
  },
  {
    q: "The driver had to ___ a fine of 200,000 soum.",
    uz: "Haydovchi 200 000 so'm jarima ___ to'g'ri keldi.",
    options: ["pay", "buy", "make", "take"],
    answer: "pay",
  },
  {
    q: "Drinking alcohol and driving is against the ___.",
    uz: "Ichib mashina haydash nimaga zid?",
    options: ["law", "weather", "map", "road"],
    answer: "law",
  },
  {
    q: "The police car turned on its ___ and siren.",
    uz: "Politsiya mashinasi ___ va sirenasini yoqdi.",
    options: ["lights", "wheels", "doors", "seats"],
    answer: "lights",
  },
  {
    q: "If you break the rules many times, you can ___ your licence.",
    uz: "Qoidani ko'p marta buzsangiz, guvohnomangizni ___ mumkin.",
    options: ["lose", "win", "find", "buy"],
    answer: "lose",
  },
  {
    q: "A driver who causes an accident may go to ___.",
    uz: "Avariyaga sabab bo'lgan haydovchi qayerga tushishi mumkin?",
    options: ["court", "school", "hotel", "market"],
    answer: "court",
  },
  {
    q: "The officer wrote a ___ for illegal parking.",
    uz: "Xodim noto'g'ri to'xtash uchun ___ yozdi.",
    options: ["ticket", "letter", "story", "song"],
    answer: "ticket",
  },

  // ---------- Tezlik va xavfsizlik ----------
  {
    q: "Driving faster than allowed is called ___.",
    uz: "Ruxsat etilgandan tez haydash qanday ataladi?",
    options: ["speeding", "parking", "crossing", "waiting"],
    answer: "speeding",
  },
  {
    q: "You must always wear a seat ___ in a car.",
    uz: "Mashinada doim nima taqish kerak?",
    options: ["belt", "hat", "glove", "ring"],
    answer: "belt",
  },
  {
    q: "Please ___ down — there are children near the school.",
    uz: "Iltimos, tezlikni ___ — maktab yonida bolalar bor.",
    options: ["slow", "put", "break", "turn"],
    answer: "slow",
  },
  {
    q: "Motorcyclists must wear a ___ for safety.",
    uz: "Mototsiklchilar xavfsizlik uchun nima kiyishi kerak?",
    options: ["helmet", "scarf", "jacket only", "cap"],
    answer: "helmet",
  },
  {
    q: "Using a mobile phone while driving is very ___.",
    uz: "Haydash paytida telefon ishlatish juda ___.",
    options: ["dangerous", "useful", "cheap", "quiet"],
    answer: "dangerous",
  },
  {
    q: "Keep a safe ___ between your car and the one in front.",
    uz: "Oldingi mashina bilan xavfsiz ___ saqlang.",
    options: ["distance", "speed", "sound", "colour"],
    answer: "distance",
  },
  {
    q: "In the rain you should drive more ___.",
    uz: "Yomg'irda qanday haydash kerak?",
    options: ["carefully", "careful", "care", "carefull"],
    answer: "carefully",
  },
  {
    q: "The car in front braked suddenly and I almost ___ into it.",
    uz: "Oldingi mashina to'satdan tormozladi va men unga ___ edim.",
    options: ["crashed", "crash", "crashing", "crashes"],
    answer: "crashed",
  },
  {
    q: "Children must sit in a special child ___ in the car.",
    uz: "Bolalar mashinada maxsus bolalar ___ o'tirishi kerak.",
    options: ["seat", "chair", "bench", "sofa"],
    answer: "seat",
  },
  {
    q: "Always check your ___ before changing lanes.",
    uz: "Qatorni almashtirishdan oldin doim ___ qarang.",
    options: ["mirrors", "windows", "lights", "tyres"],
    answer: "mirrors",
  },

  // ---------- Yo'l va transport so'zlari ----------
  {
    q: "A place where you leave your car is a car ___.",
    uz: "Mashinani qoldiradigan joy qanday ataladi?",
    options: ["park", "station", "stop", "garage sale"],
    answer: "park",
  },
  {
    q: "Cars stop and wait in a traffic ___ during rush hour.",
    uz: "Tirbandlikda mashinalar ___ da kutib turadi.",
    options: ["jam", "line", "queue up", "block"],
    answer: "jam",
  },
  {
    q: "You need ___ in the car before a long journey.",
    uz: "Uzoq safardan oldin mashinaga nima kerak?",
    options: ["fuel", "food", "music", "maps only"],
    answer: "fuel",
  },
  {
    q: "Turn on your ___ before you turn right.",
    uz: "O'ngga burilishdan oldin nimani yoqasiz?",
    options: ["indicator", "radio", "heater", "wiper"],
    answer: "indicator",
  },
  {
    q: "The road was closed, so we had to take a ___.",
    uz: "Yo'l yopiq edi, shuning uchun biz ___ olishga majbur bo'ldik.",
    options: ["detour", "return", "delay", "corner"],
    answer: "detour",
  },
  {
    q: "He pressed the ___ to stop the car.",
    uz: "U mashinani to'xtatish uchun ___ bosdi.",
    options: ["brake", "break", "wheel", "horn"],
    answer: "brake",
  },
  {
    q: "Do not ___ your horn late at night.",
    uz: "Kechqurun kech ___ chalmang.",
    options: ["sound", "sing", "play", "ring"],
    answer: "sound",
  },
  {
    q: "A person walking on the street is a ___.",
    uz: "Ko'chada yuradigan odam qanday ataladi?",
    options: ["pedestrian", "passenger", "driver", "pilot"],
    answer: "pedestrian",
  },
  {
    q: "People who travel in the car with the driver are ___.",
    uz: "Haydovchi bilan birga ketayotganlar kim?",
    options: ["passengers", "pedestrians", "drivers", "workers"],
    answer: "passengers",
  },

  // ---------- Grammatika bilan birga ----------
  {
    q: "You ___ drive without a licence.",
    uz: "Guvohnomasiz haydash mumkin emas.",
    options: ["mustn't", "don't have to", "should", "can"],
    answer: "mustn't",
  },
  {
    q: "If you drive too fast, you ___ a fine.",
    uz: "Juda tez haydasangiz, jarima ___.",
    options: ["will get", "get will", "are getting", "got"],
    answer: "will get",
  },
  {
    q: "The speed limit ___ by the police every day.",
    uz: "Tezlik chegarasi har kuni politsiya tomonidan ___.",
    options: ["is checked", "checks", "is checking", "check"],
    answer: "is checked",
  },
  {
    q: "He told me ___ to drive so fast.",
    uz: "U menga bunchalik tez haydamaslikni aytdi.",
    options: ["not", "no", "don't", "never to not"],
    answer: "not",
  },
  {
    q: "If I ___ seen the red light, I would have stopped.",
    uz: "Qizil chiroqni ko'rganimda, to'xtagan bo'lardim.",
    options: ["had", "have", "would", "did"],
    answer: "had",
  },
  {
    q: "Since 2020 the city ___ many new traffic cameras.",
    uz: "2020-yildan beri shahar ko'p yangi kamera ___.",
    options: ["has installed", "installs", "installing", "install"],
    answer: "has installed",
  },
];
