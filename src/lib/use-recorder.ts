"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Mikrofondan ovoz yozib olish va yozayotganda jonli matn ko'rsatish.
 *
 * Ovoz `MediaRecorder` bilan yoziladi (odatda webm/opus) — shu fayl serverga
 * yuboriladi. Ekrandagi jonli matn esa brauzerning `SpeechRecognition`
 * xizmatidan olinadi: u faqat ko'rsatish uchun, chunki hamma brauzerda
 * ishlamaydi va aniqligi past. Rasmiy transkripsiya serverda qilinadi.
 */

export type RecorderStatus = "idle" | "starting" | "recording" | "ready";

/** Xatolik turi — matni sahifada tarjima qilinadi. */
export type RecorderError = "unsupported" | "denied" | "empty" | "failed";

export type Recorded = { blob: Blob; url: string; seconds: number };

// ---------------------------------------------------------------- SpeechRecognition
// TypeScript ning standart turlarida bu interfeys yo'q (brauzerlarda
// prefiksli), shuning uchun kerakli qismini o'zimiz e'lon qilamiz.

type RecognitionAlternative = { transcript: string };
type RecognitionResult = { isFinal: boolean; 0: RecognitionAlternative; length: number };
type RecognitionEvent = {
  resultIndex: number;
  results: { length: number; [index: number]: RecognitionResult };
};

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Brauzer qo'llab-quvvatlaydigan birinchi audio formatni tanlaydi. */
function pickMimeType(): string | undefined {
  const wanted = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const type of wanted) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
  }
  return undefined;
}

export function useRecorder(maxSeconds?: number) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<RecorderError | null>(null);
  const [recorded, setRecorded] = useState<Recorded | null>(null);
  /** Jonli matn — faqat ko'rsatish uchun. */
  const [live, setLive] = useState("");
  /** Brauzerda jonli matn ishlaydimi (yozish boshlanganda aniqlanadi). */
  const [liveSupported, setLiveSupported] = useState(true);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<Recognition | null>(null);
  /** Tanib olish o'z-o'zidan to'xtaganda qayta ishga tushirish kerakmi. */
  const wantRecognitionRef = useRef(false);
  const secondsRef = useRef(0);
  /** Oxirgi yozuvning `blob:` manzili — yangisi paydo bo'lganda bo'shatiladi. */
  const urlRef = useRef<string | null>(null);

  /** Eski yozuv egallagan xotirani bo'shatadi. */
  const releaseUrl = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);

  /** Barcha resurslarni yopadi. */
  const teardown = useCallback(() => {
    wantRecognitionRef.current = false;
    try {
      recognitionRef.current?.abort();
    } catch {
      // Ba'zi brauzerlarda ikki marta to'xtatilsa xato beradi — muhim emas.
    }
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      // `onstop` ichida blob yig'iladi va holat "ready" ga o'tadi.
      recorder.stop();
    } else {
      setStatus("idle");
    }
    teardown();
  }, [teardown]);

  /** Vaqt tugaganda to'xtatish uchun — eskirgan closure'dan qochamiz. */
  const stopRef = useRef(stop);
  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  const start = useCallback(async () => {
    setError(null);
    setLive("");

    const media = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    if (!media?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("unsupported");
      return;
    }

    setStatus("starting");

    let stream: MediaStream;
    try {
      stream = await media.getUserMedia({ audio: true });
    } catch {
      setError("denied");
      setStatus("idle");
      return;
    }

    // Oldingi yozuvni tozalaymiz.
    releaseUrl();
    setRecorded(null);

    streamRef.current = stream;
    chunksRef.current = [];
    secondsRef.current = 0;
    setSeconds(0);

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch {
      teardown();
      setError("failed");
      setStatus("idle");
      return;
    }

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      chunksRef.current = [];
      if (blob.size === 0) {
        setError("empty");
        setStatus("idle");
        return;
      }
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setRecorded({ blob, url, seconds: secondsRef.current });
      setStatus("ready");
    };
    recorder.onerror = () => {
      setError("failed");
      setStatus("idle");
    };

    recorderRef.current = recorder;
    // Har soniyada bo'lak berib borsin — uzun yozuvda xotira kam bo'ladi.
    recorder.start(1000);
    setStatus("recording");

    // Jonli matn (ixtiyoriy).
    const Ctor = recognitionCtor();
    setLiveSupported(Boolean(Ctor));
    if (Ctor) {
      const recognition = new Ctor();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) text += `${event.results[i][0].transcript} `;
        setLive(text.trim());
      };
      recognition.onerror = () => {
        // Xato bo'lsa `onend` ham chaqiriladi — qayta ishga tushirish o'sha yerda.
      };
      recognition.onend = () => {
        // Jimlikdan keyin xizmat o'zi to'xtaydi — yozish davom etayotgan
        // bo'lsa, darhol qaytadan ishga tushiramiz.
        if (!wantRecognitionRef.current) return;
        try {
          recognition.start();
        } catch {
          // Juda tez qayta ishga tushirilsa xato beradi — jonli matnsiz davom etamiz.
        }
      };
      wantRecognitionRef.current = true;
      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {
        setLiveSupported(false);
      }
    }
  }, [releaseUrl, teardown]);

  /** Yozuvni o'chirib, boshidan boshlashga tayyorlaydi. */
  const reset = useCallback(() => {
    releaseUrl();
    setRecorded(null);
    setSeconds(0);
    secondsRef.current = 0;
    setLive("");
    setError(null);
    setStatus("idle");
  }, [releaseUrl]);

  // Taymer
  useEffect(() => {
    if (status !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  // Yozuv tugaganda davomiyligini bilish uchun soniyani ref'da ham saqlaymiz.
  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  // Vaqt cheklovi
  useEffect(() => {
    if (status === "recording" && maxSeconds && seconds >= maxSeconds) stopRef.current();
  }, [status, seconds, maxSeconds]);

  // Sahifadan chiqilganda mikrofon o'chsin va xotira bo'shasin.
  useEffect(
    () => () => {
      teardown();
      releaseUrl();
    },
    [releaseUrl, teardown],
  );

  return { status, seconds, error, recorded, live, liveSupported, start, stop, reset };
}
