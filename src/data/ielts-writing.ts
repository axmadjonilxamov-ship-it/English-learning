/** IELTS Writing topshiriqlari. */

export type ChartKind = "bar" | "line";

export type Task1Prompt = {
  id: string;
  /** Qisqa nom — ro'yxatda ko'rinadi. */
  title: string;
  /** Topshiriq matni (IELTS uslubida). */
  prompt: string;
  chart: {
    kind: ChartKind;
    /** O'lchov birligi, masalan "%" yoki "million". */
    unit: string;
    /** Gorizontal o'q — yillar yoki toifalar. */
    categories: string[];
    series: { label: string; color: string; values: number[] }[];
  };
};

export type Task2Prompt = {
  id: string;
  /** Savol turi — IELTS da to'rt xil bo'ladi. */
  type: "Opinion" | "Discussion" | "Problem & Solution" | "Advantages & Disadvantages" | "Two-part";
  prompt: string;
  /** Savolni to'g'ri tushunish uchun izoh — uchta tilda. */
  hint: { uz: string; ru: string; en: string };
};

export const TASK1_MIN_WORDS = 150;
export const TASK2_MIN_WORDS = 250;
export const TASK1_MINUTES = 20;
export const TASK2_MINUTES = 40;

export const TASK1_PROMPTS: Task1Prompt[] = [
  {
    id: "t1-internet",
    title: "Internetdan foydalanish",
    prompt:
      "The chart below shows the percentage of people using the internet in three countries between 2000 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chart: {
      kind: "line",
      unit: "%",
      categories: ["2000", "2005", "2010", "2015", "2020"],
      series: [
        { label: "Uzbekistan", color: "#2563eb", values: [1, 8, 20, 43, 76] },
        { label: "Turkey", color: "#dc2626", values: [4, 16, 40, 58, 81] },
        { label: "Germany", color: "#16a34a", values: [30, 55, 78, 88, 92] },
      ],
    },
  },
  {
    id: "t1-transport",
    title: "Transport turlari",
    prompt:
      "The bar chart below shows how people in one city travelled to work in 2010 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chart: {
      kind: "bar",
      unit: "%",
      categories: ["Car", "Bus", "Metro", "Bicycle", "On foot"],
      series: [
        { label: "2010", color: "#64748b", values: [46, 24, 12, 6, 12] },
        { label: "2020", color: "#2563eb", values: [33, 19, 24, 15, 9] },
      ],
    },
  },
  {
    id: "t1-energy",
    title: "Energiya manbalari",
    prompt:
      "The chart below shows the sources of electricity in one country in 2005 and 2025.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chart: {
      kind: "bar",
      unit: "%",
      categories: ["Gas", "Coal", "Hydro", "Solar", "Wind"],
      series: [
        { label: "2005", color: "#a16207", values: [58, 22, 17, 1, 2] },
        { label: "2025", color: "#16a34a", values: [39, 8, 19, 18, 16] },
      ],
    },
  },
  {
    id: "t1-tourists",
    title: "Sayyohlar soni",
    prompt:
      "The line graph below shows the number of visitors to three cities in Uzbekistan from 2018 to 2024.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chart: {
      kind: "line",
      unit: "ming",
      categories: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
      series: [
        { label: "Samarkand", color: "#7c3aed", values: [420, 510, 90, 240, 480, 690, 820] },
        { label: "Bukhara", color: "#ea580c", values: [310, 360, 60, 180, 350, 470, 560] },
        { label: "Khiva", color: "#0891b2", values: [180, 220, 40, 110, 210, 300, 370] },
      ],
    },
  },
  {
    id: "t1-study",
    title: "Talabalar tanlovi",
    prompt:
      "The bar chart below shows the subjects chosen by university students in one country in 2015 and 2025.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chart: {
      kind: "bar",
      unit: "%",
      categories: ["Medicine", "IT", "Economics", "Law", "Education"],
      series: [
        { label: "2015", color: "#64748b", values: [18, 11, 27, 22, 22] },
        { label: "2025", color: "#2563eb", values: [16, 34, 21, 15, 14] },
      ],
    },
  },
];

export const TASK2_PROMPTS: Task2Prompt[] = [
  {
    id: "t2-online",
    type: "Discussion",
    prompt:
      "Some people believe that online learning is as effective as studying in a classroom, while others disagree.\n\nDiscuss both views and give your own opinion.",
    hint: {
      uz: "Ikkala fikrni ham muhokama qiling va o'z fikringizni bildiring.",
      ru: "Обсудите обе точки зрения и выскажите своё мнение.",
      en: "Discuss both views and give your own opinion.",
    },
  },
  {
    id: "t2-english",
    type: "Opinion",
    prompt:
      "Children should start learning a foreign language at primary school rather than at secondary school.\n\nTo what extent do you agree or disagree?",
    hint: {
      uz: "Qay darajada rozisiz yoki rozi emassiz? Fikringiz butun esseda bir xil bo'lsin.",
      ru: "Насколько вы согласны? Позиция должна быть единой во всём эссе.",
      en: "To what extent do you agree? Keep one position throughout.",
    },
  },
  {
    id: "t2-traffic",
    type: "Problem & Solution",
    prompt:
      "Traffic congestion is becoming a serious problem in many large cities.\n\nWhat are the causes of this problem and what measures could be taken to solve it?",
    hint: {
      uz: "Sabablarini va yechimlarini yozing — ikkalasiga ham alohida xatboshi ajrating.",
      ru: "Опишите причины и решения — по отдельному абзацу на каждое.",
      en: "Write the causes and the solutions — a paragraph for each.",
    },
  },
  {
    id: "t2-remote",
    type: "Advantages & Disadvantages",
    prompt:
      "More and more people are working from home instead of going to an office.\n\nDo the advantages of this trend outweigh the disadvantages?",
    hint: {
      uz: "Afzallik va kamchiliklarni yozing, keyin qaysi biri ustunligini aniq ayting.",
      ru: "Опишите плюсы и минусы, затем ясно скажите, что перевешивает.",
      en: "Give advantages and disadvantages, then say clearly which outweighs.",
    },
  },
  {
    id: "t2-technology",
    type: "Two-part",
    prompt:
      "Many people now spend several hours a day looking at a screen.\n\nWhy is this happening? What effects does it have on society?",
    hint: {
      uz: "Ikkala savolga ham javob bering — sabab va oqibat.",
      ru: "Ответьте на оба вопроса — причина и последствия.",
      en: "Answer both questions — the cause and the effects.",
    },
  },
  {
    id: "t2-museums",
    type: "Discussion",
    prompt:
      "Some people think governments should spend money on museums and historical buildings, while others believe this money is better spent on modern housing.\n\nDiscuss both views and give your own opinion.",
    hint: {
      uz: "Ikkala tomonni ham ko'rib chiqing, keyin o'z pozitsiyangizni ayting.",
      ru: "Рассмотрите обе стороны, затем изложите свою позицию.",
      en: "Consider both sides, then state your own position.",
    },
  },
  {
    id: "t2-exams",
    type: "Opinion",
    prompt:
      "Formal examinations are not the best way to measure a student's ability.\n\nTo what extent do you agree or disagree?",
    hint: {
      uz: "Fikringizni asoslang va misollar keltiring.",
      ru: "Обоснуйте мнение и приведите примеры.",
      en: "Support your opinion and give examples.",
    },
  },
  {
    id: "t2-environment",
    type: "Problem & Solution",
    prompt:
      "Air pollution in cities is damaging people's health.\n\nWhat problems does this cause and what can governments and individuals do about it?",
    hint: {
      uz: "Muammolarni va yechimlarni alohida xatboshilarda yozing.",
      ru: "Опишите проблемы и решения в отдельных абзацах.",
      en: "Write the problems and the solutions in separate paragraphs.",
    },
  },
  {
    id: "t2-youth",
    type: "Two-part",
    prompt:
      "Many young people move from villages to big cities.\n\nWhy do they do this? Is this a positive or a negative development?",
    hint: {
      uz: "Sababini ayting va bu ijobiy yoki salbiy ekanini baholang.",
      ru: "Назовите причину и оцените, положительно это или отрицательно.",
      en: "Give the reason and judge whether it is positive or negative.",
    },
  },
  {
    id: "t2-advertising",
    type: "Opinion",
    prompt:
      "Advertising has too much influence on what people choose to buy.\n\nTo what extent do you agree or disagree?",
    hint: {
      uz: "Aniq pozitsiya tuting va uni misollar bilan qo'llab-quvvatlang.",
      ru: "Займите чёткую позицию и подкрепите её примерами.",
      en: "Take a clear position and back it up with examples.",
    },
  },
];
