"use client";

let cached: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (cached) return cached;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = speechSynthesis.getVoices();
  cached =
    voices.find((v) => /^en[-_]US/i.test(v.lang) && /Samantha|Google|Natural|Aria|Jenny/i.test(v.name)) ??
    voices.find((v) => /^en[-_](US|GB)/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang)) ??
    null;
  return cached;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  // Ovozlar ro'yxati kech yuklanadi — o'zgarganda keshni tozalaymiz.
  speechSynthesis.addEventListener("voiceschanged", () => {
    cached = null;
    pickVoice();
  });
}

/** Inglizcha matnni ovoz chiqarib o'qiydi. Brauzer qo'llab-quvvatlamasa, jimgina o'tkazib yuboradi. */
export function speak(text: string, rate = 0.95): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  speechSynthesis.speak(utterance);
}
