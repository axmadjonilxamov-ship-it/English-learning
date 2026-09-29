import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { SpeakingError } from "./errors";
import { pronunciationAssessor, toHalfBand } from "./pronunciation";
import { transcribe } from "./transcribe";
import type {
  SpeakingEvaluation,
  SpeakingMistake,
  SpeakingPart,
  SpeakingScores,
} from "./types";

/**
 * IELTS Speaking javobini baholash.
 *
 * Ikki qadam:
 *   1. audio → matn (`transcribe.ts`, hozircha OpenAI Whisper);
 *   2. matn → ball va izohlar (Claude, IELTS ekspertizasi uslubida).
 *
 * Talaffuz bahosi alohida ajratilgan (`pronunciation.ts`): hozir u faqat
 * transkripsiya asosida chamalanadi, kelajakda Speechace yoki Azure
 * Pronunciation Assessment ulansa, shu modulning o'zini almashtirish kifoya.
 *
 * API kalitlari faqat shu yerda — `process.env` dan o'qiladi va javobga
 * hech qachon qo'shilmaydi.
 */

const MODEL = "claude-opus-5";

/** Har bir qism imtihonda nimani tekshiradi — Claude shuni hisobga oladi. */
const PART_BRIEF: Record<SpeakingPart, string> = {
  part1:
    "Part 1 (Introduction and interview). Short personal questions. A good answer is two to four sentences: a direct answer plus a reason or an example. Very short one-word answers and memorised speeches are both weaknesses.",
  part2:
    "Part 2 (Individual long turn / cue card). The candidate speaks alone for up to two minutes after one minute of preparation. A good answer covers every bullet point, is organised, and keeps going without long pauses.",
  part3:
    "Part 3 (Two-way discussion). Abstract questions linked to the Part 2 topic. A good answer develops an idea, gives reasons and examples, speculates and compares, and uses more formal, precise language than Part 1.",
};

const SYSTEM_PROMPT = `You are a certified IELTS Speaking examiner. You mark strictly against the official IELTS Speaking band descriptors (public version) and you never inflate a band to be kind.

MARKING RULES
- Mark four criteria separately: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation.
- Use the official descriptors. Whole bands and half bands only: 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9. Never use any other value.
- The overall band is the average of the four criteria, rounded to the nearest half band (an average ending in .25 rounds down, .75 rounds up).
- Judge only what the candidate actually produced. Do not reward intentions, and do not punish an answer for being short if it fully answers the question; do punish an answer that is too short to demonstrate range.
- If the answer is off-topic, mark Fluency and Coherence down accordingly and say so.
- If the transcript is very short (under about 20 words) or mostly unintelligible, do not award above band 4 and explain why.

PRONUNCIATION — IMPORTANT
You receive a written transcript, not audio. You cannot hear the candidate. Estimate pronunciation only from indirect written evidence: fillers ("uh", "um"), false starts, repetitions, self-corrections, chopped phrasing, and words the transcriber clearly misheard. Stay close to the middle of the range (5.5–7) unless the evidence is strong, and never claim to have heard the candidate.

THE TRANSCRIPT
The transcript is verbatim and deliberately keeps fillers, repetitions and false starts. Treat them as evidence of fluency, not as transcription noise.

LANGUAGE OF YOUR REPLY
- "strengths", every "explanation", and every text you write about the candidate must be in UZBEK (latin alphabet, the everyday Uzbek used in Uzbekistan). Write simply and concretely — the candidate is a learner.
- "original", "correction", "improved_answer" and the English part of "vocabulary_suggestions" must be in ENGLISH.
- Each "vocabulary_suggestions" item is an English word or phrase followed by a short Uzbek gloss in brackets, for example: "a tight-knit community (juda inoq jamoa)".

CONTENT RULES
- "strengths": 2 to 4 items, each naming something the candidate actually did, with a quoted word or phrase from the transcript where possible.
- "mistakes": 2 to 6 of the most important errors. "original" must be copied from the transcript word for word. Do not list transcription artefacts as grammar mistakes.
- "vocabulary_suggestions": 3 to 6 items that fit this exact question and would raise the Lexical Resource band.
- "improved_answer": a model answer to the same question at roughly band 7.5–8, in natural spoken English, first person, and of a length that suits the part (Part 1: 2–4 sentences; Part 2: about 200–260 words; Part 3: 4–7 sentences). It must be sayable aloud, not written prose.`;

/**
 * Structured outputs — javob doimo shu shaklda keladi.
 *
 * Ballar `enum` bilan cheklangan: shunda model IELTS shkalasidan tashqaridagi
 * qiymatni (masalan 6.3) umuman qaytara olmaydi. Ro'yxatlarning uzunligi va
 * matn tili esa tizim ko'rsatmasida aytilgan — sxemaga faqat eng keng
 * qo'llab-quvvatlanadigan konstruksiyalarni qo'yamiz.
 */
const BAND_VALUES = [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];
const BAND_SCHEMA = { type: "number", enum: BAND_VALUES };

const OUTPUT_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["scores", "feedback", "improved_answer"],
  properties: {
    scores: {
      type: "object",
      additionalProperties: false,
      required: [
        "fluency_coherence",
        "lexical_resource",
        "grammar",
        "pronunciation_estimate",
        "overall",
      ],
      properties: {
        fluency_coherence: BAND_SCHEMA,
        lexical_resource: BAND_SCHEMA,
        grammar: BAND_SCHEMA,
        pronunciation_estimate: BAND_SCHEMA,
        overall: BAND_SCHEMA,
      },
    },
    feedback: {
      type: "object",
      additionalProperties: false,
      required: ["strengths", "mistakes", "vocabulary_suggestions"],
      properties: {
        strengths: { type: "array", items: { type: "string" } },
        mistakes: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["original", "correction", "explanation"],
            properties: {
              original: { type: "string" },
              correction: { type: "string" },
              explanation: { type: "string" },
            },
          },
        },
        vocabulary_suggestions: { type: "array", items: { type: "string" } },
      },
    },
    improved_answer: { type: "string" },
  },
};

/** Claude qaytaradigan qism (transkripsiyani biz o'zimiz qo'shamiz). */
type ModelOutput = {
  scores: SpeakingScores;
  feedback: {
    strengths: string[];
    mistakes: SpeakingMistake[];
    vocabulary_suggestions: string[];
  };
  improved_answer: string;
};

function client(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new SpeakingError(
      "Baholash xizmati sozlanmagan. Administratorga murojaat qiling.",
      503,
    );
  }
  return new Anthropic({ apiKey });
}

/** Claude javobidagi matn bloklarini bir joyga yig'adi. */
function textOf(content: { type: string; text?: string }[]): string {
  return content
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text as string)
    .join("")
    .trim();
}

/** Ballarni IELTS shkalasiga (0–9, yarim ballik qadam) majburan keltiradi. */
function normaliseScores(scores: SpeakingScores): SpeakingScores {
  const four = [
    toHalfBand(scores.fluency_coherence),
    toHalfBand(scores.lexical_resource),
    toHalfBand(scores.grammar),
    toHalfBand(scores.pronunciation_estimate),
  ];
  const average = four.reduce((sum, band) => sum + band, 0) / four.length;
  return {
    fluency_coherence: four[0],
    lexical_resource: four[1],
    grammar: four[2],
    pronunciation_estimate: four[3],
    // Umumiy ballni o'zimiz qayta hisoblaymiz — u har doim to'rttasining
    // o'rtachasi bo'lishi kerak.
    overall: toHalfBand(average),
  };
}

/** Transkripsiyani Claude ga yuborib, mezonlar bo'yicha baho oladi. */
async function score(
  transcript: string,
  part: SpeakingPart,
  question: string,
): Promise<ModelOutput> {
  const prompt = [
    `EXAM PART: ${PART_BRIEF[part]}`,
    "",
    "QUESTION THE CANDIDATE WAS ASKED:",
    question,
    "",
    "VERBATIM TRANSCRIPT OF THE CANDIDATE'S SPOKEN ANSWER:",
    "<transcript>",
    transcript,
    "</transcript>",
    "",
    "Mark this answer now. Follow every rule in your instructions.",
  ].join("\n");

  let response;
  try {
    response = await client().beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      // Baholash xizmatdan bosh tortilsa, so'rov boshqa modelda davom etadi.
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (cause) {
    if (cause instanceof Anthropic.AuthenticationError) {
      throw new SpeakingError("Baholash xizmati kaliti noto'g'ri.", 503, cause);
    }
    if (cause instanceof Anthropic.RateLimitError) {
      throw new SpeakingError("Xizmat hozir band. Bir daqiqadan keyin qayta urining.", 429, cause);
    }
    if (cause instanceof Anthropic.APIError) {
      console.error("Claude xatosi:", cause.status, cause.message);
      throw new SpeakingError("Javobni baholab bo'lmadi. Qayta urinib ko'ring.", 502, cause);
    }
    throw new SpeakingError("Baholash xizmatiga ulanib bo'lmadi.", 502, cause);
  }

  if (response.stop_reason === "refusal") {
    throw new SpeakingError(
      "Bu javobni baholab bo'lmadi. Boshqa savolni sinab ko'ring.",
      422,
    );
  }

  const raw = textOf(response.content);
  let parsed: ModelOutput;
  try {
    parsed = JSON.parse(raw) as ModelOutput;
  } catch (cause) {
    console.error("Claude javobini o'qib bo'lmadi:", raw.slice(0, 500));
    throw new SpeakingError("Baho natijasini o'qib bo'lmadi. Qayta urinib ko'ring.", 502, cause);
  }

  if (!parsed?.scores || !parsed?.feedback || typeof parsed.improved_answer !== "string") {
    throw new SpeakingError("Baho natijasi to'liq emas. Qayta urinib ko'ring.", 502);
  }
  return parsed;
}

export type EvaluateInput = {
  audio: File;
  part: SpeakingPart;
  question: string;
};

/** Audio → transkripsiya → IELTS bahosi. */
export async function evaluateSpeaking({
  audio,
  part,
  question,
}: EvaluateInput): Promise<SpeakingEvaluation> {
  const transcript = await transcribe(audio);

  // Juda qisqa yozuvni baholashdan ma'no yo'q — foydalanuvchiga darhol aytamiz.
  const words = transcript.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w));
  if (words.length < 5) {
    throw new SpeakingError(
      "Yozuvda yetarli nutq yo'q. Savolga kamida bir necha gap bilan javob bering.",
      422,
    );
  }

  const model = await score(transcript, part, question);
  const scores = normaliseScores(model.scores);

  // Talaffuz xizmati ulangan bo'lsa, uning bahosi chamalangan ballni almashtiradi.
  let pronunciationSource: SpeakingEvaluation["pronunciation_source"] = "transcript";
  if (pronunciationAssessor) {
    try {
      const result = await pronunciationAssessor(audio, transcript);
      scores.pronunciation_estimate = toHalfBand(result.band);
      pronunciationSource = "audio";
      const four = [
        scores.fluency_coherence,
        scores.lexical_resource,
        scores.grammar,
        scores.pronunciation_estimate,
      ];
      scores.overall = toHalfBand(four.reduce((sum, band) => sum + band, 0) / four.length);
    } catch (cause) {
      // Talaffuz xizmati ishlamasa, chamalangan ball bilan davom etamiz.
      console.error("Talaffuz xizmati xatosi:", cause);
    }
  }

  return {
    transcript,
    scores,
    feedback: {
      strengths: model.feedback.strengths ?? [],
      mistakes: model.feedback.mistakes ?? [],
      vocabulary_suggestions: model.feedback.vocabulary_suggestions ?? [],
    },
    improved_answer: model.improved_answer,
    pronunciation_source: pronunciationSource,
  };
}
