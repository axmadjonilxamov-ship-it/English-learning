"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ro'yxatdan tasodifiy element tanlaydi — sahifa har ochilganda boshqasi.
 *
 * Birinchi render serverdagi bilan bir xil bo'lishi shart, aks holda React
 * hydration xatosini beradi. Shuning uchun ro'yxatning birinchi elementidan
 * boshlanadi va sahifa brauzerda yuklangach tasodifiysiga almashtiriladi.
 *
 * `memoryKey` berilsa, oxirgi ko'rilgan element eslab qolinadi va keyingi
 * safar chetlab o'tiladi — shunda ketma-ket ikki marta bir xil mavzu
 * chiqmaydi.
 *
 * `items` modul darajasidagi o'zgarmas ro'yxat bo'lishi kerak — shunda tanlov
 * faqat bir marta, sahifa ochilganda amalga oshadi.
 */
export function useRandomItem<T extends { id: string }>(items: readonly T[], memoryKey?: string) {
  const [item, setItem] = useState<T>(items[0]);
  /**
   * Tanlov bir martagina bo'lishi kerak. React ishlab chiqish rejimida
   * (StrictMode) effektlarni ikki marta ishga tushiradi; shu belgisiz ikkinchi
   * yurishda "oxirgi ko'rilgan" qiymat sifatida endigina yozilgani o'qilib,
   * avvalgi mavzu qaytadan chiqib qolishi mumkin edi.
   */
  const chosen = useRef(false);

  useEffect(() => {
    if (chosen.current) return;
    chosen.current = true;

    let last: string | null = null;
    try {
      if (memoryKey) last = localStorage.getItem(memoryKey);
    } catch {
      // localStorage yopiq bo'lsa, shunchaki takror chiqishi mumkin.
    }
    const pool = items.filter((i) => i.id !== last);
    const from = pool.length ? pool : items;
    setItem(from[Math.floor(Math.random() * from.length)]);
  }, [items, memoryKey]);

  // Ko'rilgan mavzuni eslab qolamiz — "Boshqasi" bosilganda ham.
  useEffect(() => {
    try {
      if (memoryKey) localStorage.setItem(memoryKey, item.id);
    } catch {
      // Saqlanmasa ham sahifa ishlayveradi.
    }
  }, [item, memoryKey]);

  return [item, setItem] as const;
}
