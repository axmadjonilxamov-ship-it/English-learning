"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LEVELS } from "@/data";
import { useProgress } from "@/lib/progress";
import { CITY_DEFS, CITY_H, CITY_W, DISTRICT_H, ROAD_W, districtBox, rowY, scenery } from "@/lib/city-scenery";
import { useCityDrive } from "./useCityDrive";
import { useT } from "@/lib/i18n";
import type { Level } from "@/types";

/** Rangni ochadi (amt > 0) yoki qoraytiradi (amt < 0). */
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const target = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const mix = (c: number) => Math.round(c + (target - c) * p);
  return `rgb(${mix(n >> 16)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
}

/** Xarita ustidagi izoh belgilari — yorug' va qorong'i mavzuda ham o'qiladi. */
const CHIP =
  "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/85 px-3 py-1.5 text-xs font-semibold text-ink backdrop-blur dark:border-white/10 dark:bg-black/70 dark:text-gray-200";

/** Bosilgan binoga chiziladigan marshrut. */
type Route = { x: number; y: number; label: string; href: string };

type TowerProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  icon: string;
  label: string;
  main?: boolean;
  title: string;
  onOpen: () => void;
};

/** Tumandagi bitta bino — bosilganda o'sha modulning kurs yo'li ochiladi. */
function Tower({ x, y, w, h, color, icon, label, main, title, onOpen }: TowerProps) {
  const cx = x + w / 2;
  const size = main ? 28 : 24;
  const iconY = y + h * 0.46;
  const fontSize = Math.min(main ? 11 : 9.5, (w - 4) / (label.length * 0.56));

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="origin-bottom cursor-pointer transition duration-200 [transform-box:fill-box] hover:brightness-125 focus-visible:brightness-125"
      style={{ transitionProperty: "transform, filter" }}
    >
      <title>{title}</title>
      {[3, 2, 1].map((k) => (
        <rect
          key={k}
          x={x - k * 3.5}
          y={y + k * 3.5}
          width={w}
          height={h}
          rx={6}
          fill={shade(color, -0.35 - k * 0.08)}
          stroke={shade(color, -0.15)}
          strokeWidth={0.8}
        />
      ))}
      <rect x={x} y={y} width={w} height={h} rx={6} fill={color} />
      <rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx={4} fill={shade(color, -0.62)} />

      {main ? (
        <>
          <circle cx={cx} cy={y + 22} r={9} fill="none" stroke="rgba(255,255,255,.75)" strokeWidth={1.5} />
          <text x={cx} y={y + 25.5} fontSize={9} fontWeight={800} fill="rgba(255,255,255,.85)" textAnchor="middle">
            H
          </text>
        </>
      ) : (
        <>
          <rect x={x + 8} y={y + 12} width={w * 0.3} height={4} rx={2} fill={shade(color, 0.25)} opacity={0.7} />
          <rect x={x + w - 8 - w * 0.18} y={y + 12} width={w * 0.18} height={4} rx={2} fill={shade(color, 0.25)} opacity={0.45} />
        </>
      )}

      <rect x={cx - size / 2} y={iconY - size / 2} width={size} height={size} rx={7} fill={shade(color, 0.12)} />
      <text x={cx} y={iconY + (main ? 5 : 4.5)} fontSize={main ? 14 : 12} textAnchor="middle">
        {icon}
      </text>
      <text x={cx} y={iconY + size / 2 + 15} fontSize={fontSize} fontWeight={700} fill={shade(color, 0.6)} textAnchor="middle">
        {label}
      </text>

      {main ? (
        <rect x={cx - 8} y={y + h - 20} width={16} height={12} rx={2} fill={shade(color, -0.15)} />
      ) : (
        <>
          <rect x={cx - w * 0.28} y={y + h - 18} width={w * 0.56} height={9} rx={2} fill={shade(color, -0.3)} />
          {[1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={cx - w * 0.28 + (w * 0.56 * i) / 5}
              y1={y + h - 16}
              x2={cx - w * 0.28 + (w * 0.56 * i) / 5}
              y2={y + h - 11}
              stroke={shade(color, 0.3)}
              opacity={0.6}
            />
          ))}
        </>
      )}
    </g>
  );
}

function District({
  level,
  index,
  onOpen,
}: {
  level: Level;
  index: number;
  onOpen: (target: { x: number; y: number; label: string; href: string }) => void;
}) {
  const { levelProgress } = useProgress();
  const t = useT();
  const { x, y, w, h } = districtBox(index);
  const progress = levelProgress(level);

  const px = x + 8;
  const py = y + 196;
  const pw = w - 16;
  const ph = 94;
  const plazaFont = Math.min(24, (pw - 16) / (level.name.length * 0.58));

  const towers = [
    { m: 0, tx: x + 14, tw: 42, ty: y + 28, th: 148, main: false },
    { m: 1, tx: x + 61, tw: 48, ty: y + 14, th: 164, main: true },
    { m: 2, tx: x + 114, tw: 42, ty: y + 28, th: 148, main: false },
  ];

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} className="c-district" />

      {towers.map((t) => {
        const mod = level.modules[t.m];
        return (
          <Tower
            key={t.m}
            x={t.tx}
            y={t.ty}
            w={t.tw}
            h={t.th}
            color={level.palette[t.m]}
            icon={mod.icon}
            label={mod.short}
            main={t.main}
            title={`${level.name} · ${mod.name}`}
            onOpen={() =>
              onOpen({
                x: t.tx + t.tw / 2,
                y: t.ty + t.th,
                label: `${level.name} · ${mod.name}`,
                href: `/path/${level.id}?m=${t.m}`,
              })
            }
          />
        );
      })}

      <rect x={x + w / 2 - 8} y={y + 184} width={16} height={12} className="c-path" />

      <g
        role="button"
        tabIndex={0}
        aria-label={level.full ?? level.name}
        onClick={() => onOpen({ x: x + w / 2, y: py, label: level.full ?? level.name, href: `/path/${level.id}` })}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen({ x: x + w / 2, y: py, label: level.full ?? level.name, href: `/path/${level.id}` });
          }
        }}
        className="group cursor-pointer"
      >
        <title>{`${level.full ?? level.name} · ${level.cefr}`}</title>
        <rect
          x={px}
          y={py}
          width={pw}
          height={ph}
          rx={10}
          strokeWidth={2}
          className="fill-[var(--city-plaza)] stroke-[var(--city-plaza-edge)] transition group-hover:fill-[var(--city-plaza-hover)] group-hover:stroke-[#6ee7a0] group-focus-visible:stroke-[#6ee7a0]"
        />
        <rect
          x={px + 5}
          y={py + 5}
          width={pw - 10}
          height={ph - 10}
          rx={7}
          fill="none"
          className="stroke-[var(--city-plaza-inner)]"
          opacity={0.6}
        />
        {[
          [px + 12, py + 12, level.palette[0]],
          [px + pw - 34, py + 12, level.palette[1]],
          [px + 12, py + ph - 18, level.palette[2]],
          [px + pw - 34, py + ph - 18, level.palette[0]],
        ].map(([bx, by, c], i) => (
          <rect key={i} x={bx as number} y={by as number} width={22} height={6} rx={3} fill={shade(c as string, 0.35)} opacity={0.8} />
        ))}
        <text x={x + w / 2} y={py + 50} fontSize={plazaFont} fontWeight={800} fill="#fff" textAnchor="middle">
          {level.name}
        </text>
        <line
          x1={x + w / 2 - 36}
          y1={py + 60}
          x2={x + w / 2 + 36}
          y2={py + 60}
          className="stroke-[var(--city-plaza-edge)]"
          strokeWidth={2}
        />
        <text x={x + w / 2} y={py + 76} fontSize={10} fontWeight={700} className="fill-[var(--city-plaza-sub)]" textAnchor="middle">
          {level.cefr} · {progress.done}/{progress.total} {t("common.lessons")}
        </text>
      </g>
    </g>
  );
}

export function CityMap() {
  const router = useRouter();
  const { currentLevelIndex, ready } = useProgress();
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [parts] = useState(() => scenery());
  const [route, setRoute] = useState<Route | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  const youIndex = ready ? currentLevelIndex() : 0;
  const you = districtBox(youIndex);
  // "Siz shu yerdasiz" belgisi tumanlar ostidagi yo'lda turadi.
  const start = { x: you.x + you.w / 2, y: rowY(2) + DISTRICT_H + ROAD_W / 2 };

  // Mashina binoga yetib borgach kurs yo'li ochiladi.
  const arrive = useCallback(() => {
    if (route) router.push(route.href);
  }, [route, router]);

  const drive = useCityDrive(start, route, arrive);

  /** Binoga bosilganda marshrut chiziladi va qizil mashina yo'lga chiqadi. */
  const openWithRoute = (target: Route) => {
    // O'sha binoga qayta bosilsa — kutmasdan darhol o'tamiz.
    if (route?.href === target.href) {
      router.push(target.href);
      return;
    }
    setRoute(target);
    drive.reset();
    // Sahifani oldindan yuklaymiz — yetib borganda bir zumda ochiladi.
    router.prefetch(target.href);
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="scroll-thin overflow-x-auto overflow-y-hidden rounded-[1.6rem] border border-line bg-[var(--city-bg)] shadow-[0_30px_60px_-30px_rgba(15,23,20,.35)] dark:shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)]"
      >
        <svg
          viewBox={`0 0 ${CITY_W} ${CITY_H}`}
          className="block h-auto w-full min-w-[1000px] font-sans"
          role="img"
          aria-label={t("city.mapLabel")}
        >
          <defs dangerouslySetInnerHTML={{ __html: CITY_DEFS }} />
          <rect width={CITY_W} height={CITY_H} className="c-bg" />

          <g dangerouslySetInnerHTML={{ __html: parts.below }} />

          {LEVELS.map((level, i) => (
            <District key={level.id} level={level} index={i} onOpen={openWithRoute} />
          ))}

          <g dangerouslySetInnerHTML={{ __html: parts.above }} />

          {/* Bosilgan binoga oq marshrut — ko'chalar bo'ylab burilib boradi */}
          {route && (
            <g pointerEvents="none">
              <path
                d={`M ${start.x} ${start.y} H ${route.x} V ${route.y}`}
                fill="none"
                stroke="rgba(0,0,0,.55)"
                strokeWidth={11}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={`M ${start.x} ${start.y} H ${route.x} V ${route.y}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="route-line"
              />
              {/* Manzil belgisi */}
              <g transform={`translate(${route.x} ${route.y - 6})`} className="route-pin">
                <path
                  d="M0 0 C -9 -13, -14 -18, -14 -26 A 14 14 0 1 1 14 -26 C 14 -18, 9 -13, 0 0 Z"
                  fill="#ffffff"
                  stroke="rgba(0,0,0,.35)"
                  strokeWidth={1.5}
                />
                <circle cx={0} cy={-26} r={6} fill="#dc2626" />
              </g>
              <circle cx={start.x} cy={start.y} r={7} fill="#ffffff" stroke="#22c55e" strokeWidth={3} />
            </g>
          )}

          {/* Svetaforlar */}
          {drive.trafficLights.map((light, i) => (
            <g key={i} transform={`translate(${light.x.toFixed(1)} ${(light.y - 46).toFixed(1)})`} pointerEvents="none">
              <line x1={0} y1={10} x2={0} y2={40} stroke="#475569" strokeWidth={4} />
              <rect x={-9} y={-22} width={18} height={36} rx={5} fill="#0f172a" stroke="#334155" strokeWidth={1.5} />
              <circle cx={0} cy={-13} r={5} fill={light.red ? "#ef4444" : "#4b1113"}>
                {light.red && <animate attributeName="opacity" values="1;.5;1" dur="1s" repeatCount="indefinite" />}
              </circle>
              <circle cx={0} cy={-1} r={5} fill="#3f3413" />
              <circle cx={0} cy={11} r={5} fill={light.red ? "#123a1c" : "#22c55e"} />
            </g>
          ))}

          {/* Politsiya — qizil chiroqdan o'tilganda orqadan quvadi */}
          {drive.police && (
            <g
              transform={`translate(${drive.police.x.toFixed(1)} ${drive.police.y.toFixed(1)}) rotate(${drive.police.angle})`}
              pointerEvents="none"
            >
              <rect x={-17} y={-9} width={34} height={18} rx={6} fill="#1e3a8a" />
              <rect x={-17} y={-2} width={34} height={4} fill="#f8fafc" />
              <rect x={1} y={-7.5} width={8} height={15} rx={2} fill="#0f172a" />
              <rect x={-5} y={-13} width={4} height={4} rx={1} fill="#ef4444">
                <animate attributeName="opacity" values="1;0;1" dur=".45s" repeatCount="indefinite" />
              </rect>
              <rect x={1} y={-13} width={4} height={4} rx={1} fill="#3b82f6">
                <animate attributeName="opacity" values="0;1;0" dur=".45s" repeatCount="indefinite" />
              </rect>
            </g>
          )}

          {/* Qizil mashina — bino tanlanmagan bo'lsa, belgi yonida turadi */}
          {(() => {
            const car = route ? drive.car : { x: start.x - 52, y: start.y, angle: 0 };
            return (
            <g
              transform={`translate(${car.x.toFixed(1)} ${car.y.toFixed(1)}) rotate(${car.angle})`}
              pointerEvents="none"
            >
              {/* Turbo alangasi — Shift bosilganda */}
              {drive.turbo && (
                <g>
                  <polygon points="-18,-5 -44,0 -18,5" fill="#fb923c" opacity={0.9}>
                    <animate attributeName="points" values="-18,-5 -44,0 -18,5; -18,-4 -58,0 -18,4; -18,-5 -44,0 -18,5" dur=".16s" repeatCount="indefinite" />
                  </polygon>
                  <polygon points="-18,-3 -34,0 -18,3" fill="#fde68a">
                    <animate attributeName="points" values="-18,-3 -34,0 -18,3; -18,-2 -44,0 -18,2; -18,-3 -34,0 -18,3" dur=".12s" repeatCount="indefinite" />
                  </polygon>
                </g>
              )}
              {/* Fara nuri — kunduzi o'chadi (`c-beam`, globals.css) */}
              <polygon points="17,-7 78,-28 78,28 17,7" fill="url(#beam)" className="c-beam" />
              <rect x={-18} y={-10} width={36} height={20} rx={7} fill="#dc2626" />
              <rect x={-18} y={-2.5} width={36} height={5} fill="#7f1d1d" opacity={0.6} />
              <rect x={0} y={-8} width={9} height={16} rx={2.5} fill="#1e293b" />
              <rect x={-14} y={-7.5} width={6} height={15} rx={2} fill="#334155" opacity={0.8} />
              <circle cx={16} cy={-6} r={1.8} fill="#fff7cc" className="c-beam" />
              <circle cx={16} cy={6} r={1.8} fill="#fff7cc" className="c-beam" />
              <rect x={-19} y={-8} width={2} height={4} rx={1} fill={drive.stopped ? "#fca5a5" : "#ef4444"} />
              <rect x={-19} y={4} width={2} height={4} rx={1} fill={drive.stopped ? "#fca5a5" : "#ef4444"} />
            </g>
            );
          })()}

          {/* "Siz shu yerdasiz" belgisi */}
          <g transform={`translate(${start.x} ${start.y})`} pointerEvents="none">
            <circle r={10} fill="none" stroke="#22c55e" strokeWidth={2}>
              <animate attributeName="r" values="8;26" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r={16} fill="rgba(34,197,94,.15)" stroke="#22c55e" strokeWidth={1.5} />
            <circle r={7} fill="#22c55e" stroke="#fff" strokeWidth={2} />
          </g>
        </svg>
      </div>

      {/* Yo'l holati — bosilsa darhol o'tadi */}
      {route && (
        <button
          type="button"
          onClick={() => router.push(route.href)}
          className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-sm font-bold text-ink backdrop-blur transition hover:bg-white dark:border-white/15 dark:bg-black/85 dark:text-white dark:hover:bg-black"
        >
          {drive.chasing ? (
            <span className="text-blue-600 dark:text-blue-300">{t("city.chasing")}</span>
          ) : drive.stopped ? (
            <span className="text-red-600 dark:text-red-400">{t("city.stopped")}</span>
          ) : drive.arrived ? (
            <span className="text-green-600 dark:text-green-400">{t("city.arrived")}</span>
          ) : (
            <>
              {route.label} {t("city.driving")}{" "}
              <span className="text-amber-600 dark:text-amber-400">{drive.turbo ? "⚡ TURBO" : `Shift — ${t("city.turboHint")}`}</span>
            </>
          )}
        </button>
      )}

      <div className="pointer-events-none absolute bottom-3.5 left-4 flex flex-wrap gap-2">
        <span className={CHIP}>
          <i className="size-3.5 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,.25)]" /> {t("city.youAreHere")}
        </span>
        <span className={CHIP}>
          <i className="size-3.5 rounded-sm bg-red-600" /> {t("city.clickHint")}
        </span>
        <span className={CHIP}>
          <kbd className="rounded border border-black/15 bg-black/5 px-1.5 py-0.5 dark:border-white/20 dark:bg-white/10">
            Shift
          </kbd>{" "}
          {t("city.turboHint")} · <span className="text-amber-600 dark:text-amber-400">{t("city.redWarning")}</span>
        </span>
      </div>
    </div>
  );
}
