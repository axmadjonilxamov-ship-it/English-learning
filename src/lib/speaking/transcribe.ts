import "server-only";

import { SpeakingError } from "./errors";

/**
 * Audioni matnga aylantirish (speech-to-text).
 *
 * Interfeys atayin kichik: kelajakda Whisper o'rniga boshqa xizmat qo'yilsa,
 * faqat shu funksiyani almashtirish kifoya qiladi.
 */
export type Transcriber = (audio: File) => Promise<string>;

const WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions";
const WHISPER_MODEL = "whisper-1";

/**
 * OpenAI Whisper orqali so'zma-so'z transkripsiya.
 *
 * `prompt` — modelni "tozalab yozishdan" qaytaradi: IELTS tahlili uchun
 * duduqlanish, "uh", "um" va takrorlar ham kerak, chunki ular ravonlik
 * bahosiga ta'sir qiladi.
 *
 * Kalit faqat serverda o'qiladi (`process.env`) va hech qachon javobga
 * qo'shilmaydi.
 */
export const whisperTranscriber: Transcriber = async (audio) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new SpeakingError(
      "Nutqni tanish xizmati sozlanmagan. Administratorga murojaat qiling.",
      503,
    );
  }

  const form = new FormData();
  form.append("file", audio, audio.name || "answer.webm");
  form.append("model", WHISPER_MODEL);
  form.append("language", "en");
  form.append("response_format", "text");
  form.append("temperature", "0");
  form.append(
    "prompt",
    "Transcribe exactly what the speaker says, word for word. Keep every filler such as uh, um, er, hmm, and keep false starts and repeated words. Do not correct grammar and do not tidy the sentences.",
  );

  let res: Response;
  try {
    res = await fetch(WHISPER_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
      signal: AbortSignal.timeout(120_000),
    });
  } catch (cause) {
    throw new SpeakingError(
      "Nutqni tanish xizmatiga ulanib bo'lmadi. Internetni tekshirib, qayta urining.",
      502,
      cause,
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`Whisper xatosi (${res.status}):`, detail.slice(0, 500));
    if (res.status === 401) {
      throw new SpeakingError("Nutqni tanish xizmati kaliti noto'g'ri.", 503);
    }
    // Mablag' tugashi ham 429 bilan keladi, lekin kutib turishning foydasi yo'q —
    // hisobga to'lov qo'shilmaguncha har safar shu javob qaytaveradi.
    if (res.status === 429 && /insufficient_quota|credit/i.test(detail)) {
      throw new SpeakingError(
        "Nutqni tanish xizmatida mablag' tugagan. Administrator OpenAI hisobiga to'lov qo'shishi kerak.",
        503,
      );
    }
    if (res.status === 429) {
      throw new SpeakingError("Xizmat hozir band. Bir daqiqadan keyin qayta urining.", 429);
    }
    throw new SpeakingError("Audioni matnga aylantirib bo'lmadi. Qayta urinib ko'ring.", 502);
  }

  const text = (await res.text()).trim();
  if (!text) {
    throw new SpeakingError(
      "Yozuvda nutq topilmadi. Mikrofonga yaqinroq va balandroq gapiring.",
      422,
    );
  }
  return text;
};

/** Hozirgi transkripsiya xizmati. */
export const transcribe: Transcriber = whisperTranscriber;
