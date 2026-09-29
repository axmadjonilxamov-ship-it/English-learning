"use client";

/**
 * Qoidabuzarlik hisobi va bloklash.
 *
 * Holat brauzerda (localStorage) saqlanadi — shuning uchun tabni yopib qayta
 * ochsangiz ham blok davom etadi. Shu bilan birga serverga ham yuboriladi,
 * admin panelda ko'rinishi va boshqa qurilmalarda ham amal qilishi uchun.
 */

const DEVICE_KEY = "englishup:device";
const STATE_KEY = "englishup:enforcement";

/** Bitta qoidabuzarlik uchun qo'shiladigan blok vaqti. */
export const BLOCK_STEP_MS = 2 * 60 * 1000;

/** Shu chegaradan oshsa — butunlay bloklanadi. */
export const FOREVER_LIMIT = 20;

/** Testdan o'tish uchun kerakli minimal foiz. */
export const PASS_SCORE = 80;

export type Enforcement = {
  /** Qizil chiroqdan o'tishlar soni. */
  violations: number;
  /** Blok tugash vaqti (ms). 0 — blok yo'q. */
  blockedUntil: number;
  /** Butunlay bloklanganmi. */
  forever: boolean;
};

const EMPTY: Enforcement = { violations: 0, blockedUntil: 0, forever: false };

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Shu brauzerning doimiy identifikatori. */
export function deviceId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    // Maxfiy rejimda saqlab bo'lmaydi — sessiya davomida ishlaydigan id beramiz.
    return "temp";
  }
}

export function readEnforcement(): Enforcement {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function writeEnforcement(state: Enforcement) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // Saqlab bo'lmasa ham, joriy sahifada blok ishlayveradi.
  }
}

/** Ikki holatdan qattiqrog'ini tanlaydi (server va brauzerni birlashtirish uchun). */
export function mergeEnforcement(a: Enforcement, b: Enforcement): Enforcement {
  return {
    violations: Math.max(a.violations, b.violations),
    blockedUntil: Math.max(a.blockedUntil, b.blockedUntil),
    forever: a.forever || b.forever,
  };
}

export const isBlocked = (s: Enforcement) => s.forever || s.blockedUntil > Date.now();

/** Qolgan blok vaqtini "1:23" ko'rinishida qaytaradi. */
export function remainingLabel(until: number): string {
  const ms = Math.max(0, until - Date.now());
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Qizil chiroqdan o'tilganda chaqiriladi — hisobni oshiradi.
 * Blok hali qo'yilmaydi: avval foydalanuvchiga test beriladi.
 */
export function registerViolation(state: Enforcement): Enforcement {
  const violations = state.violations + 1;
  const next: Enforcement = {
    ...state,
    violations,
    forever: state.forever || violations > FOREVER_LIMIT,
  };
  writeEnforcement(next);
  return next;
}

/**
 * Test yakunlangach chaqiriladi.
 * O'tsa — blok yo'q. O'tmasa — har safar 2 daqiqa qo'shiladi.
 */
export function applyQuizResult(state: Enforcement, percent: number): Enforcement {
  if (percent >= PASS_SCORE) {
    writeEnforcement(state);
    return state;
  }
  const base = Math.max(Date.now(), state.blockedUntil);
  const next: Enforcement = { ...state, blockedUntil: base + BLOCK_STEP_MS };
  writeEnforcement(next);
  return next;
}

/**
 * Serverga yuboradi va serverdagi holat bilan birlashtiradi.
 * `log` berilsa, qoidabuzarlik admin panel uchun jurnalga yoziladi.
 */
export async function syncEnforcement(
  state: Enforcement,
  log?: { violation?: boolean; quizScore?: number },
): Promise<Enforcement> {
  try {
    const res = await fetch("/api/enforcement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: deviceId(),
        ...state,
        logViolation: log?.violation ?? false,
        quizScore: log?.quizScore,
      }),
    });
    if (!res.ok) return state;
    const server: Enforcement = await res.json();
    const merged = mergeEnforcement(state, server);
    writeEnforcement(merged);
    return merged;
  } catch {
    return state;
  }
}
