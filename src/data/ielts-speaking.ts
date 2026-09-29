/**
 * IELTS Speaking topshiriqlari.
 *
 * Imtihon uch qismdan iborat:
 *   Part 1 — tanishuv savollari (4–5 daqiqa, har javob ~30 soniya);
 *   Part 2 — kartochka bo'yicha monolog (1 daqiqa tayyorgarlik + 2 daqiqa gapirish);
 *   Part 3 — chuqurroq munozara (4–5 daqiqa, har javob ~45 soniya).
 *
 * Savollar ingliz tilida — imtihonda ham shunday bo'ladi. Izohlar esa
 * saytning uchala tilida.
 */

export type Trilingual = { uz: string; ru: string; en: string };

/** Part 1 — bitta mavzu va unga tegishli qisqa savollar. */
export type Part1Set = {
  id: string;
  /** Mavzu nomi — kartochka tepasida ko'rinadi. */
  topic: Trilingual;
  questions: string[];
};

/** Part 2 — kartochka (cue card). */
export type Part2Card = {
  id: string;
  /** Asosiy topshiriq: "Describe a …". */
  prompt: string;
  /** "You should say:" ostidagi punktlar. */
  bullets: string[];
  /** Imtihonchi oxirida so'raydigan qo'shimcha savol. */
  followUp: string;
};

/** Part 3 — kartochka mavzusiga bog'liq munozara savollari. */
export type Part3Set = {
  id: string;
  theme: Trilingual;
  questions: string[];
};

/** Har bir qism uchun vaqt cheklovlari (soniyada). */
export const PART1_SECONDS = 30;
export const PART2_PREP_SECONDS = 60;
export const PART2_SPEAK_SECONDS = 120;
export const PART3_SECONDS = 45;

/** Yozib olinadigan eng uzun audio — server ham shu chegarani tekshiradi. */
export const MAX_RECORDING_SECONDS = 180;

// ---------------------------------------------------------------- Part 1

export const PART1_SETS: Part1Set[] = [
  {
    id: "p1-hometown",
    topic: { uz: "Tug'ilgan shahar", ru: "Родной город", en: "Hometown" },
    questions: [
      "Where is your hometown?",
      "What do you like most about your hometown?",
      "Has your hometown changed much in recent years?",
      "Would you like to live there in the future? Why?",
    ],
  },
  {
    id: "p1-work-study",
    topic: { uz: "Ish va o'qish", ru: "Работа и учёба", en: "Work and study" },
    questions: [
      "Do you work or are you a student?",
      "Why did you choose that subject or job?",
      "What is the most difficult part of your work or studies?",
      "What would you like to do in five years' time?",
    ],
  },
  {
    id: "p1-free-time",
    topic: { uz: "Bo'sh vaqt", ru: "Свободное время", en: "Free time" },
    questions: [
      "What do you usually do in your free time?",
      "Do you prefer spending free time alone or with other people?",
      "Has the way you spend your free time changed since you were a child?",
      "Do you think people today have enough free time?",
    ],
  },
  {
    id: "p1-food",
    topic: { uz: "Ovqat", ru: "Еда", en: "Food" },
    questions: [
      "What kind of food do you enjoy most?",
      "Do you prefer eating at home or eating out?",
      "Who usually cooks in your family?",
      "Have your eating habits changed in the last few years?",
    ],
  },
  {
    id: "p1-technology",
    topic: { uz: "Texnologiya", ru: "Технологии", en: "Technology" },
    questions: [
      "How often do you use your phone during the day?",
      "Which app or website do you find most useful?",
      "Do you think people spend too much time online?",
      "How did you learn to use computers?",
    ],
  },
  {
    id: "p1-weather",
    topic: { uz: "Ob-havo", ru: "Погода", en: "Weather" },
    questions: [
      "What is the weather like in your country?",
      "Which season do you like best, and why?",
      "Does the weather affect the way you feel?",
      "Do you check the weather forecast before going out?",
    ],
  },
  {
    id: "p1-travel",
    topic: { uz: "Sayohat", ru: "Путешествия", en: "Travel" },
    questions: [
      "Do you like travelling?",
      "How do you usually travel — by car, by train or by plane?",
      "Which place in your country would you recommend to a visitor?",
      "Do you prefer short trips or long holidays?",
    ],
  },
  {
    id: "p1-music",
    topic: { uz: "Musiqa", ru: "Музыка", en: "Music" },
    questions: [
      "What kind of music do you listen to?",
      "When do you usually listen to music?",
      "Have you ever learned to play a musical instrument?",
      "Is traditional music popular among young people in your country?",
    ],
  },
  {
    id: "p1-friends",
    topic: { uz: "Do'stlar", ru: "Друзья", en: "Friends" },
    questions: [
      "Do you have a large group of friends?",
      "How did you meet your closest friend?",
      "What makes someone a good friend?",
      "Is it easy to make new friends where you live?",
    ],
  },
  {
    id: "p1-reading",
    topic: { uz: "O'qish (kitob)", ru: "Чтение", en: "Reading" },
    questions: [
      "Do you enjoy reading books?",
      "What was the last book you read?",
      "Do you prefer paper books or reading on a screen?",
      "Were you read to when you were a child?",
    ],
  },
  {
    id: "p1-shopping",
    topic: { uz: "Xarid", ru: "Покупки", en: "Shopping" },
    questions: [
      "Do you enjoy shopping?",
      "Do you prefer shopping online or in a shop?",
      "How often do you buy clothes?",
      "Do you think people buy more than they need?",
    ],
  },
  {
    id: "p1-sport",
    topic: { uz: "Sport", ru: "Спорт", en: "Sport" },
    questions: [
      "Do you play any sports?",
      "Did you do much sport at school?",
      "Do you prefer watching sport or taking part in it?",
      "Why do you think some people dislike exercise?",
    ],
  },
];

// ---------------------------------------------------------------- Part 2

export const PART2_CARDS: Part2Card[] = [
  {
    id: "p2-teacher",
    prompt: "Describe a teacher who has influenced you.",
    bullets: [
      "who this teacher was",
      "what subject they taught",
      "how they taught their lessons",
      "and explain why this teacher influenced you.",
    ],
    followUp: "Do you still keep in touch with this teacher?",
  },
  {
    id: "p2-journey",
    prompt: "Describe a journey you remember well.",
    bullets: [
      "where you went",
      "who you travelled with",
      "what you did there",
      "and explain why you remember this journey.",
    ],
    followUp: "Would you like to make the same journey again?",
  },
  {
    id: "p2-skill",
    prompt: "Describe a skill you would like to learn.",
    bullets: [
      "what the skill is",
      "how you would learn it",
      "how long it might take",
      "and explain why you want to learn it.",
    ],
    followUp: "Is it easier to learn new skills as an adult or as a child?",
  },
  {
    id: "p2-gift",
    prompt: "Describe a gift you gave to someone.",
    bullets: [
      "what the gift was",
      "who you gave it to",
      "why you chose it",
      "and explain how that person reacted.",
    ],
    followUp: "Do people in your country give gifts often?",
  },
  {
    id: "p2-book",
    prompt: "Describe a book or a film that made an impression on you.",
    bullets: [
      "what it was about",
      "when you read or watched it",
      "who recommended it to you",
      "and explain why it made an impression on you.",
    ],
    followUp: "Would you recommend it to a friend?",
  },
  {
    id: "p2-place",
    prompt: "Describe a quiet place you like to go to.",
    bullets: [
      "where this place is",
      "how often you go there",
      "what you do there",
      "and explain why you find it relaxing.",
    ],
    followUp: "Is it easy to find quiet places in big cities?",
  },
  {
    id: "p2-decision",
    prompt: "Describe an important decision you once made.",
    bullets: [
      "what the decision was",
      "when you made it",
      "who helped you decide",
      "and explain how it changed your life.",
    ],
    followUp: "Do you usually make decisions quickly?",
  },
  {
    id: "p2-website",
    prompt: "Describe a website or an app you use often.",
    bullets: [
      "what it is",
      "how you found out about it",
      "how often you use it",
      "and explain why it is useful to you.",
    ],
    followUp: "Do you think you spend too much time on it?",
  },
  {
    id: "p2-celebration",
    prompt: "Describe a celebration or a festival in your country.",
    bullets: [
      "what the celebration is",
      "when it takes place",
      "what people usually do",
      "and explain why it is important to people.",
    ],
    followUp: "Have such celebrations changed over the years?",
  },
  {
    id: "p2-person",
    prompt: "Describe an older person you admire.",
    bullets: [
      "who this person is",
      "how you know them",
      "what kind of person they are",
      "and explain why you admire them.",
    ],
    followUp: "What can young people learn from older generations?",
  },
  {
    id: "p2-goal",
    prompt: "Describe a goal you achieved after working hard.",
    bullets: [
      "what the goal was",
      "how long you worked for it",
      "what difficulties you faced",
      "and explain how you felt when you achieved it.",
    ],
    followUp: "Do you set yourself goals regularly?",
  },
  {
    id: "p2-change",
    prompt: "Describe a change you would like to see in your city.",
    bullets: [
      "what the change is",
      "who it would affect",
      "how difficult it would be to make",
      "and explain why you think it is necessary.",
    ],
    followUp: "Who should be responsible for such changes?",
  },
];

// ---------------------------------------------------------------- Part 3

export const PART3_SETS: Part3Set[] = [
  {
    id: "p3-education",
    theme: { uz: "Ta'lim", ru: "Образование", en: "Education" },
    questions: [
      "How has the role of teachers changed in recent years?",
      "Should schools focus more on practical skills than on exams?",
      "Do you think online education will replace traditional schools?",
    ],
  },
  {
    id: "p3-technology",
    theme: { uz: "Texnologiya va jamiyat", ru: "Технологии и общество", en: "Technology and society" },
    questions: [
      "In what ways has technology changed the way people communicate?",
      "Are there any disadvantages to being connected all the time?",
      "How might artificial intelligence affect employment in the future?",
    ],
  },
  {
    id: "p3-environment",
    theme: { uz: "Atrof-muhit", ru: "Окружающая среда", en: "The environment" },
    questions: [
      "Who should take most responsibility for protecting the environment?",
      "Are people in your country becoming more aware of environmental problems?",
      "What could governments do to reduce pollution in large cities?",
    ],
  },
  {
    id: "p3-work",
    theme: { uz: "Ish olami", ru: "Мир труда", en: "The world of work" },
    questions: [
      "Why do many people change careers during their lives?",
      "Is job security more important than a high salary?",
      "How will working from home affect the design of cities?",
    ],
  },
  {
    id: "p3-culture",
    theme: { uz: "Madaniyat va an'analar", ru: "Культура и традиции", en: "Culture and traditions" },
    questions: [
      "Why is it important for a country to preserve its traditions?",
      "Do young people in your country value traditional culture?",
      "How does globalisation affect local cultures?",
    ],
  },
  {
    id: "p3-media",
    theme: { uz: "Ommaviy axborot", ru: "СМИ", en: "The media" },
    questions: [
      "Where do most people in your country get their news?",
      "How can readers tell whether a news story is reliable?",
      "Should the media be controlled by the government?",
    ],
  },
  {
    id: "p3-cities",
    theme: { uz: "Shaharlar", ru: "Города", en: "Cities" },
    questions: [
      "Why do so many people move from the countryside to cities?",
      "What makes a city a good place to live?",
      "How can cities cope with a growing population?",
    ],
  },
  {
    id: "p3-health",
    theme: { uz: "Sog'liq", ru: "Здоровье", en: "Health" },
    questions: [
      "Why do some people find it hard to live a healthy lifestyle?",
      "Should healthcare be free for everyone?",
      "How can schools encourage children to be more active?",
    ],
  },
  {
    id: "p3-family",
    theme: { uz: "Oila", ru: "Семья", en: "Family" },
    questions: [
      "How have family roles changed in the last fifty years?",
      "Is it better for children to grow up with grandparents nearby?",
      "What responsibilities do adults have towards their elderly parents?",
    ],
  },
  {
    id: "p3-money",
    theme: { uz: "Pul va iste'mol", ru: "Деньги и потребление", en: "Money and consumption" },
    questions: [
      "Do you think people today spend money more carefully than in the past?",
      "Should children be taught about money at school?",
      "Does advertising make people buy things they do not need?",
    ],
  },
  {
    id: "p3-travel",
    theme: { uz: "Sayohat va turizm", ru: "Путешествия и туризм", en: "Travel and tourism" },
    questions: [
      "What are the benefits of travelling to other countries?",
      "Can tourism harm the places people visit?",
      "Will people travel more or less in the future?",
    ],
  },
  {
    id: "p3-language",
    theme: { uz: "Til", ru: "Язык", en: "Language" },
    questions: [
      "Why do so many people want to learn English?",
      "Is it a problem if smaller languages disappear?",
      "What is the best age to start learning a foreign language?",
    ],
  },
];
