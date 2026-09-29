"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEnforcement } from "@/components/EnforcementProvider";

/** Tezlik: SVG birligi / soniya. */
const SPEED = 320;
const SPEED_TURBO = 820;

/** Svetafor sikli. */
const GREEN_MS = 4200;
const RED_MS = 3000;
const CYCLE = GREEN_MS + RED_MS;

/** Mashina chiroqdan shuncha oldin to'xtaydi. */
const STOP_GAP = 26;

/** Politsiya quvish vaqti. */
const CHASE_MS = 8000;

export type Point = { x: number; y: number };
export type Placed = Point & { angle: number };
export type CityLight = Placed & { red: boolean };

/**
 * Marshrut — "G" shaklida: avval gorizontal, keyin vertikal.
 * Masofa bo'yicha nuqta va yo'nalishni qaytaradi.
 */
export function pointOnRoute(start: Point, target: Point, d: number): Placed {
  const dx = target.x - start.x;
  const dy = target.y - start.y;
  const hLen = Math.abs(dx);
  const vLen = Math.abs(dy);

  if (d <= hLen) {
    return { x: start.x + Math.sign(dx) * d, y: start.y, angle: dx >= 0 ? 0 : 180 };
  }
  const rest = Math.min(d - hLen, vLen);
  return { x: target.x, y: start.y + Math.sign(dy) * rest, angle: dy >= 0 ? 90 : -90 };
}

export const routeLength = (start: Point, target: Point) =>
  Math.abs(target.x - start.x) + Math.abs(target.y - start.y);

/**
 * Shaharchadagi qizil mashina.
 *
 * Foydalanuvchi binoni tanlaganda mashina oq marshrut bo'ylab o'sha binoga
 * yuradi. **Shift** — turbo. Yo'ldagi svetafor qizil bo'lsa mashina o'zi
 * to'xtaydi; Shift bosib turilsa o'tib ketadi va bu qoidabuzarlik hisoblanadi —
 * politsiya quvadi va yo'l qoidalari bo'yicha test ochiladi.
 */
export function useCityDrive(start: Point, target: Point | null, onArrive: () => void) {
  const { redLight, blocked, busy } = useEnforcement();

  const [dist, setDist] = useState(0);
  const [reds, setReds] = useState<boolean[]>([]);
  const [turbo, setTurbo] = useState(false);
  const [chasing, setChasing] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [arrived, setArrived] = useState(false);

  const distRef = useRef(0);
  const shiftRef = useRef(false);
  const passedRef = useRef<Set<number>>(new Set());
  const chaseUntil = useRef(0);
  const arrivedRef = useRef(false);
  const onArriveRef = useRef(onArrive);

  // Eng so'nggi callback'ni saqlaymiz — animatsiya siklini qayta ishga tushirmasdan.
  useEffect(() => {
    onArriveRef.current = onArrive;
  }, [onArrive]);

  // Svetaforlar marshrutning 35% va 70% joyida.
  const total = target ? routeLength(start, target) : 0;
  const lightDists = total > 260 ? [total * 0.35, total * 0.7] : total > 140 ? [total * 0.5] : [];

  // Yangi marshrut tanlansa, mashina boshidan yo'lga chiqadi.
  const routeKey = target ? `${target.x},${target.y}` : "";
  useEffect(() => {
    distRef.current = 0;
    passedRef.current = new Set();
    arrivedRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDist(0);
    setArrived(false);
    setChasing(false);
    setStopped(false);
  }, [routeKey]);

  const reset = useCallback(() => {
    distRef.current = 0;
    passedRef.current = new Set();
    arrivedRef.current = false;
    setDist(0);
    setArrived(false);
  }, []);

  // Shift tugmasi — turbo
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Shift") shiftRef.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Shift") shiftRef.current = false;
    };
    const blur = () => {
      shiftRef.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  useEffect(() => {
    if (!target) return;
    const passed = passedRef.current;
    const lights = lightDists;
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const nextReds = lights.map((_, i) => ((now + i * 1500) % CYCLE) > GREEN_MS);
      setReds((prev) =>
        prev.length === nextReds.length && prev.every((v, i) => v === nextReds[i]) ? prev : nextReds,
      );

      const shift = shiftRef.current;
      setTurbo(shift && !blocked && !busy && !arrivedRef.current);

      if (!blocked && !busy && !arrivedRef.current) {
        let d = distRef.current + (shift ? SPEED_TURBO : SPEED) * dt;
        let halted = false;

        for (let i = 0; i < lights.length; i++) {
          if (!nextReds[i] || passed.has(i)) continue;
          const stopLine = lights[i] - STOP_GAP;
          if (d >= stopLine && distRef.current < lights[i]) {
            if (shift) {
              // Qizil chiroqdan o'tib ketildi.
              passed.add(i);
              chaseUntil.current = now + CHASE_MS;
              setChasing(true);
              redLight();
            } else {
              d = Math.min(d, stopLine);
              halted = true;
            }
            break;
          }
        }

        nextReds.forEach((red, i) => {
          if (!red) passed.delete(i);
        });

        if (d >= total) {
          d = total;
          arrivedRef.current = true;
          setArrived(true);
          onArriveRef.current();
        }

        distRef.current = d;
        setDist(d);
        setStopped(halted);
      }

      if (chaseUntil.current && now > chaseUntil.current) {
        chaseUntil.current = 0;
        setChasing(false);
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, total, blocked, busy, redLight, routeKey]);

  const car: Placed = target ? pointOnRoute(start, target, dist) : { ...start, angle: 0 };
  const police: Placed | null = chasing && target ? pointOnRoute(start, target, Math.max(0, dist - 58)) : null;
  const trafficLights: CityLight[] = target
    ? lightDists.map((d, i) => ({ ...pointOnRoute(start, target, d), red: reds[i] ?? false }))
    : [];

  return { car, police, trafficLights, turbo, stopped, chasing, arrived, reset, driving: !!target && !arrived };
}
