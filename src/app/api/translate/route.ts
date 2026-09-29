import { NextResponse } from "next/server";
import { lookup, type DictionaryEntry } from "@/lib/dictionary";

export type TranslateResponse = {
  text: string;
  /** Tarjima qayerdan olindi: saytning o'z lug'atidan yoki tarjima xizmatidan. */
  from: "dictionary" | "service";
  /** Lug'atdan topilgan qo'shimcha ma'lumot (transkripsiya, misol). */
  entries: DictionaryEntry[];
  direction: "en-uz" | "uz-en";
};

const MAX_LENGTH = 500;

/** MyMemory javobidagi HTML belgilarini oddiy matnga qaytaradi. */
function decode(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function POST(request: Request) {
  let body: { text?: string; direction?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const text = String(body.text ?? "").trim();
  const direction: "en-uz" | "uz-en" = body.direction === "uz-en" ? "uz-en" : "en-uz";

  if (!text) return NextResponse.json({ error: "Matn kiriting" }, { status: 400 });
  if (text.length > MAX_LENGTH) {
    return NextResponse.json({ error: `Matn juda uzun (${MAX_LENGTH} belgigacha)` }, { status: 400 });
  }

  // 1. Avval saytning o'z lug'ati: darhol javob beradi va misol gap ham qo'shadi.
  const entries = lookup(text);
  if (entries.length) {
    const wanted = direction === "en-uz" ? "uz" : "en";
    return NextResponse.json({
      text: entries[0][wanted],
      from: "dictionary",
      entries,
      direction,
    } satisfies TranslateResponse);
  }

  // 2. Topilmasa — bepul tarjima xizmati (kalit talab qilmaydi).
  const pair = direction === "en-uz" ? "en|uz" : "uz|en";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      // Bir xil matn qayta so'ralsa, keshdan olinadi.
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(String(res.status));

    const data = await res.json();
    const translated = decode(String(data?.responseData?.translatedText ?? "")).trim();
    if (!translated || data?.responseStatus !== 200) throw new Error("bo'sh javob");

    return NextResponse.json({
      text: translated,
      from: "service",
      entries: [],
      direction,
    } satisfies TranslateResponse);
  } catch {
    return NextResponse.json(
      { error: "Tarjima xizmatiga ulanib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring." },
      { status: 502 },
    );
  }
}
