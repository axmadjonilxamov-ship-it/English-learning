"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { useLang } from "@/lib/i18n";

type Skill = {
  name: string;
  href: string | null;
  icon: IconName;
  minutes: { uz: string; ru: string; en: string };
  desc: { uz: string; ru: string; en: string };
  gradient: string;
};

const SKILLS: Skill[] = [
  {
    name: "Writing",
    href: "/ielts/writing",
    icon: "book",
    minutes: { uz: "60 daqiqa · 2 ta topshiriq", ru: "60 минут · 2 задания", en: "60 minutes · 2 tasks" },
    desc: {
      uz: "Task 1 va Task 2. Yozganingiz to'rtta rasmiy mezon bo'yicha tahlil qilinadi.",
      ru: "Task 1 и Task 2. Ваш текст разбирается по четырём официальным критериям.",
      en: "Task 1 and Task 2. Your writing is analysed against the four official criteria.",
    },
    gradient: "from-brand-700 to-brand-500",
  },
  {
    name: "Listening",
    href: null,
    icon: "listen",
    minutes: { uz: "30 daqiqa · 40 savol", ru: "30 минут · 40 вопросов", en: "30 minutes · 40 questions" },
    desc: {
      uz: "To'rt qism: suhbat, monolog, munozara va ma'ruza.",
      ru: "Четыре части: диалог, монолог, обсуждение и лекция.",
      en: "Four parts: conversation, monologue, discussion and lecture.",
    },
    gradient: "from-cyan-600 to-sky-500",
  },
  {
    name: "Reading",
    href: null,
    icon: "cards",
    minutes: { uz: "60 daqiqa · 40 savol", ru: "60 минут · 40 вопросов", en: "60 minutes · 40 questions" },
    desc: {
      uz: "Uchta akademik matn: True/False/Not Given, sarlavha moslashtirish va boshqalar.",
      ru: "Три академических текста: True/False/Not Given, подбор заголовков и другое.",
      en: "Three academic passages: True/False/Not Given, matching headings and more.",
    },
    gradient: "from-rose-600 to-orange-500",
  },
  {
    name: "Speaking",
    href: "/ielts/speaking",
    icon: "mic",
    minutes: { uz: "11–14 daqiqa · 3 qism", ru: "11–14 минут · 3 части", en: "11–14 minutes · 3 parts" },
    desc: {
      uz: "Tanishuv savollari, kartochka bo'yicha monolog va munozara. Javobingiz ovozdan matnga aylantirilib baholanadi.",
      ru: "Вопросы о себе, монолог по карточке и обсуждение. Ваш ответ переводится из речи в текст и оценивается.",
      en: "Personal questions, a cue-card monologue and a discussion. Your answer is turned into text and marked.",
    },
    gradient: "from-violet-600 to-fuchsia-500",
  },
];

/** IELTS Writing ning to'rtta rasmiy mezoni. */
const CRITERIA = [
  {
    title: "Task Achievement / Response",
    desc: {
      uz: "Topshiriqning barcha qismlariga javob berish, aniq pozitsiya, yetarli hajm.",
      ru: "Ответ на все части задания, чёткая позиция, достаточный объём.",
      en: "Answering every part of the task, a clear position and enough words.",
    },
  },
  {
    title: "Coherence and Cohesion",
    desc: {
      uz: "Mantiqiy tuzilma, xatboshilar, bog'lovchilar va ishora so'zlari.",
      ru: "Логичная структура, абзацы, связки и слова-отсылки.",
      en: "Logical structure, paragraphs, linking words and referencing.",
    },
  },
  {
    title: "Lexical Resource",
    desc: {
      uz: "Keng va aniq lug'at, tabiiy birikmalar, parafraz, to'g'ri imlo.",
      ru: "Богатая и точная лексика, естественные сочетания, парафраз, орфография.",
      en: "A wide, precise vocabulary, natural collocations, paraphrase and spelling.",
    },
  },
  {
    title: "Grammatical Range and Accuracy",
    desc: {
      uz: "Sodda va murakkab gaplar aralashmasi: ergash gap, shart gap, passive.",
      ru: "Смесь простых и сложных предложений: придаточные, условные, пассив.",
      en: "A mix of simple and complex sentences: relative clauses, conditionals, passives.",
    },
  },
];

export default function IeltsPage() {
  const { t, lang } = useLang();
  return (
    <div className="anim-enter">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3.5 py-1.5 text-sm font-bold text-brand-600 dark:text-brand-400">
          {t("ielts.badge")}
        </span>
        <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-extrabold leading-tight tracking-[-0.03em]">
          {t("ielts.title1")}{" "}
          <span className="bg-gradient-to-r from-brand-700 via-brand-500 to-accent-500 bg-clip-text text-transparent">
            {t("ielts.titleAccent")}
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-ink-muted">
          {t("ielts.lead")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SKILLS.map((skill) => {
          const card = (
            <>
              <div className="flex items-start gap-4">
                <div className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${skill.gradient} text-white`}>
                  <Icon name={skill.icon} className="size-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold">{skill.name}</h2>
                    {!skill.href && (
                      <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-ink-muted">
                        soon…
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-ink-muted">{skill.minutes[lang]}</p>
                </div>
              </div>
              <p className="mt-3 text-ink-muted">{skill.desc[lang]}</p>
              {skill.href ? (
                <span className="mt-4 inline-flex items-center gap-1.5 font-bold text-brand-600 dark:text-brand-400">
                  {t("common.start")} <Icon name="right" className="size-4" />
                </span>
              ) : (
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                  <Icon name="lock" className="size-4" /> {t("ielts.soon")}
                </span>
              )}
            </>
          );

          return skill.href ? (
            <Link
              key={skill.name}
              href={skill.href}
              className="card p-6 transition hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-lg"
            >
              {card}
            </Link>
          ) : (
            <div key={skill.name} className="card cursor-not-allowed p-6 opacity-60" aria-disabled="true">
              {card}
            </div>
          );
        })}
      </div>

      <div className="card mt-8 p-6">
        <h3 className="text-lg font-extrabold">{t("ielts.howGraded")}</h3>
        <p className="mt-1.5 text-sm text-ink-muted">
          {t("ielts.howGradedLead")}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CRITERIA.map((c) => (
            <div key={c.title} className="rounded-xl bg-surface-2 p-4">
              <b className="block text-sm">{c.title}</b>
              <span className="text-sm text-ink-muted">{c.desc[lang]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
