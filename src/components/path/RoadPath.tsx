"use client";

import { useEffect, useMemo, useRef } from "react";
import { useProgress } from "@/lib/progress";
import { useT } from "@/lib/i18n";
import type { Level } from "@/types";

const SPACING = 330; // bekatlar orasidagi masofa
const START_X = 240;
const Y_TOP = 245;
const Y_BOTTOM = 405;
const HEIGHT = 650;

type Point = { x: number; y: number };

/** Urug'langan tasodif — server va brauzerda bir xil bezak chiqishi uchun. */
function makeRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Har bir dars o'z rangiga ega — yo'l bo'ylab rang almashib boradi. */
const SEGMENT_COLORS = [
  "#22c55e", // yashil
  "#eab308", // sariq
  "#38bdf8", // moviy
  "#a855f7", // binafsha
  "#f97316", // to'q sariq
  "#14b8a6", // firuza
  "#ec4899", // pushti
  "#84cc16", // limon
];

const CheckMark = ({ w, color }: { w: number; color: string }) => (
  <path
    d={`M${-0.38 * w} 0 l${0.24 * w} ${0.26 * w} l${0.5 * w} ${-0.52 * w}`}
    fill="none"
    stroke={color}
    strokeWidth={w > 40 ? 8 : 7}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

export function RoadPath({
  level,
  selected,
  onSelect,
  onOpen,
}: {
  level: Level;
  selected: number;
  onSelect: (index: number) => void;
  onOpen: (index: number) => void;
}) {
  const { isLessonDone, currentLesson } = useProgress();
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const current = currentLesson(level);

  const n = level.lessons.length;
  const width = START_X + (n - 1) * SPACING + 380;

  const { d, points, pieces } = useMemo(() => {
    const pts: Point[] = level.lessons.map((_, i) => ({
      x: START_X + i * SPACING,
      y: i % 2 ? Y_BOTTOM : Y_TOP,
    }));
    const all: Point[] = [
      { x: START_X - SPACING, y: Y_BOTTOM },
      ...pts,
      { x: START_X + n * SPACING, y: n % 2 ? Y_BOTTOM : Y_TOP },
    ];
    let path = `M ${all[0].x} ${all[0].y}`;
    for (let i = 1; i < all.length; i++) {
      const a = all[i - 1];
      const b = all[i];
      path += ` C ${a.x + SPACING / 2} ${a.y}, ${b.x - SPACING / 2} ${b.y}, ${b.x} ${b.y}`;
    }
    // Yo'lni bo'laklarga ajratamiz: har bir bo'lak bitta darsga tegishli.
    const parts: string[] = [];
    for (let i = 1; i < all.length; i++) {
      const a = all[i - 1];
      const b = all[i];
      parts.push(`M ${a.x} ${a.y} C ${a.x + SPACING / 2} ${a.y}, ${b.x - SPACING / 2} ${b.y}, ${b.x} ${b.y}`);
    }
    return { d: path, points: pts, pieces: parts };
  }, [level, n]);

  // Fon bezaklari: xira grammatik belgilar va qushlar
  const decor = useMemo(() => {
    const rnd = makeRandom(level.id.length * 977 + n);
    const glyphs = ["A1", "B2", "abc", "?", "!", "Aa", "-ing", "-ed", "the", "C1", "is", "was"];
    const texts: { x: number; y: number; size: number; text: string }[] = [];
    const birds: { x: number; y: number; delay: number }[] = [];
    for (let i = 0; i < n * 3; i++) {
      const x = 40 + rnd() * (width - 80);
      const y = 60 + rnd() * (HEIGHT - 120);
      if (y > Y_TOP - 60 && y < Y_BOTTOM + 60) continue;
      texts.push({ x: Math.round(x), y: Math.round(y), size: Math.round(16 + rnd() * 12), text: glyphs[i % glyphs.length] });
    }
    for (let i = 0; i < n; i++) {
      birds.push({ x: Math.round(rnd() * width), y: Math.round(120 + rnd() * (HEIGHT - 240)), delay: Number((rnd() * 8).toFixed(1)) });
    }
    return { texts, birds };
  }, [level.id, n, width]);

  // Tanlangan bekatni ko'rinadigan joyga suramiz.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = Math.max(0, START_X + selected * SPACING - el.clientWidth * 0.35);
    el.scrollTo({ left: target, behavior: "smooth" });
  }, [selected]);

  // Sichqoncha bilan sudrab va g'ildirak bilan gorizontal surish.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    const startX = e.clientX;
    const startLeft = el.scrollLeft;
    dragged.current = false;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 5) dragged.current = true;
      el.scrollLeft = startLeft - dx;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setTimeout(() => (dragged.current = false), 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      className="scroll-thin cursor-grab select-none overflow-x-auto overflow-y-hidden active:cursor-grabbing"
    >
      <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} className="block font-sans">
        {decor.texts.map((t, i) => (
          <text key={i} x={t.x} y={t.y} fontSize={t.size} fontWeight={700} fill="#94a3b8" opacity={0.08} fontFamily="ui-monospace, monospace">
            {t.text}
          </text>
        ))}
        {decor.birds.map((b, i) => (
          <path
            key={i}
            d={`M${b.x} ${b.y} q5 -5 10 0 q5 -5 10 0`}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth={1.6}
            opacity={0.45}
          />
        ))}

        {/* Yo'l asosi */}
        <path d={d} fill="none" stroke="#05080c" strokeWidth={124} opacity={0.7} />
        <path d={d} fill="none" stroke="#1d212b" strokeWidth={106} />

        {/* Har bir dars — o'z rangidagi bo'lak. Tugatilganlari to'q, oldindagilari xira. */}
        {pieces.map((piece, i) => {
          // i-bo'lak (i-1)-darsdan i-darsgacha boradi; birinchi bo'lak boshlanish yo'li.
          const lessonIndex = Math.min(i, n - 1);
          const lesson = level.lessons[lessonIndex];
          const reached = isLessonDone(lesson.id) || lessonIndex <= current;
          return (
            <g key={i}>
              <path
                d={piece}
                fill="none"
                stroke={SEGMENT_COLORS[lessonIndex % SEGMENT_COLORS.length]}
                strokeWidth={106}
                opacity={reached ? 0.32 : 0.08}
              />
              <path
                d={piece}
                fill="none"
                stroke={SEGMENT_COLORS[lessonIndex % SEGMENT_COLORS.length]}
                strokeWidth={6}
                strokeDasharray="30 26"
                opacity={reached ? 1 : 0.3}
              />
            </g>
          );
        })}

        {/* Modul boshidagi ko'rsatkichlar */}
        {level.modules.map((mod, mi) => {
          const i = level.lessons.findIndex((l) => l.module === mi);
          if (i < 0) return null;
          const p = points[i];
          const top = i % 2 === 0;
          const sx = p.x - 150;
          const sy = top ? p.y - 70 : p.y + 42;
          const tw = mod.name.length * 8.4 + 24;
          return (
            <g key={mod.name}>
              <line x1={sx} y1={top ? sy + 28 : sy} x2={sx} y2={top ? sy + 52 : sy - 22} stroke="#64748b" strokeWidth={3} />
              <rect x={sx - tw / 2} y={sy} width={tw} height={28} rx={6} fill="#1d4ed8" />
              <text x={sx} y={sy + 19} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={700} fontFamily="ui-monospace, monospace">
                {mod.name}
              </text>
            </g>
          );
        })}

        {/* Bekatlar */}
        {level.lessons.map((lesson, i) => {
          const p = points[i];
          const top = i % 2 === 0;
          const badgeY = top ? p.y - 150 : p.y + 150;
          const done = isLessonDone(lesson.id);
          const isCurrent = i === current;
          const isSelected = i === selected;
          const textX = p.x + (isCurrent ? 70 : 58);

          return (
            <g
              key={lesson.id}
              role="button"
              tabIndex={0}
              aria-label={`${i + 1}. ${lesson.title}`}
              onClick={() => {
                if (dragged.current) return;
                if (i === selected) onOpen(i);
                else onSelect(i);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen(i);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <line x1={p.x} y1={p.y} x2={p.x} y2={badgeY} stroke="#2f5fb3" strokeWidth={5} />
              <circle cx={p.x} cy={p.y} r={11} fill="#fff" stroke="#2f5fb3" strokeWidth={6} />

              <g transform={`translate(${p.x} ${badgeY})`} className="transition hover:brightness-110">
                <circle
                  r={isCurrent ? 66 : 52}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  strokeDasharray="7 7"
                  className={isSelected ? "anim-dash opacity-100" : "opacity-0"}
                />
                {isCurrent ? (
                  <>
                    <circle r={58} fill="rgba(255,255,255,.07)" />
                    <circle r={50} fill="#fff" />
                    {done ? <CheckMark w={46} color="#16a34a" /> : <path d="M-10 -16 L18 0 L-10 16 Z" fill="#2563eb" />}
                  </>
                ) : done ? (
                  <>
                    <circle r={42} fill="#22c55e" />
                    <CheckMark w={40} color="#fff" />
                  </>
                ) : (
                  <>
                    <circle r={42} fill="#141a28" stroke="#2c3a58" strokeWidth={3} />
                    <text y={10} fontSize={26} textAnchor="middle" opacity={0.85}>
                      {level.modules[lesson.module].icon}
                    </text>
                  </>
                )}
                <circle cx={isCurrent ? 36 : 30} cy={isCurrent ? 36 : 32} r={14} fill="#1e3a8a" stroke="#0b0f19" strokeWidth={3} />
                <text x={isCurrent ? 36 : 30} y={isCurrent ? 41 : 37} fontSize={14} fontWeight={800} fill="#fff" textAnchor="middle">
                  {i + 1}
                </text>
              </g>

              <text x={textX} y={badgeY - 2} fontSize={isCurrent ? 23 : 19} fontWeight={700} fill={done || isCurrent ? "#fff" : "#cbd5e1"}>
                {lesson.title}
              </text>
              <text x={textX} y={badgeY + 22} fontSize={15} fill="#8b95a7">
                {lesson.min} {t("common.minutes")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
