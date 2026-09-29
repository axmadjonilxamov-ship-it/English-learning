/**
 * Shaharchaning statik qismi: yo'llar, kvartallar, mashinalar, metro va chiroqlar.
 *
 * Bu markup hech qachon o'zgarmaydi va bosilmaydi, shuning uchun uni React elementlari
 * o'rniga bitta SVG satri qilib chizamiz — minglab tugundan iborat daraxt tuzilmaydi.
 * Tasodifiy sonlar urug'langan (seeded), shuning uchun server va brauzer bir xil natija
 * beradi va hydration xatosi chiqmaydi.
 */

const ROAD = 38; // yo'l kengligi
export const ROAD_W = ROAD;
const BLOCK_W = 160; // kvartal kengligi
const COLS = 8;
const ROWS = [118, 118, 300, 118, 118];

export const CITY_W = ROAD * (COLS + 1) + BLOCK_W * COLS;
export const CITY_H = ROAD * (ROWS.length + 1) + ROWS.reduce((a, b) => a + b, 0);

/** Markaziy qatorda 6 ta tuman — har biri bitta daraja. */
export const DISTRICT_ROW = 2;
export const DISTRICT_H = ROWS[DISTRICT_ROW];
export const DISTRICT_W = BLOCK_W;

export const colX = (c: number) => ROAD + c * (BLOCK_W + ROAD);
export const rowY = (r: number) => ROAD + ROWS.slice(0, r).reduce((a, b) => a + b, 0) + r * ROAD;

/** i-tuman (0..5) joylashgan to'rtburchak. */
export function districtBox(i: number) {
  return { x: colX(i + 1), y: rowY(DISTRICT_ROW), w: DISTRICT_W, h: DISTRICT_H };
}

type Kind = "city" | "pond" | "fountain" | "containers" | "district";

const LAYOUT: Kind[][] = [
  ["city", "pond", "city", "city", "containers", "city", "city", "city"],
  ["city", "city", "city", "city", "city", "city", "fountain", "city"],
  ["fountain", "district", "district", "district", "district", "district", "district", "pond"],
  ["city", "fountain", "city", "city", "city", "pond", "city", "city"],
  ["city", "containers", "city", "pond", "city", "city", "city", "fountain"],
];

// ---------- Urug'langan tasodif ----------
let seed = 11;
const rnd = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const between = (a: number, b: number) => a + rnd() * (b - a);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
const f = (n: number) => Math.round(n * 10) / 10;

const BUILDING = ["#353e39", "#313a35", "#3a443e", "#2e3632", "#38413c"] as const;
const CARS = ["#e5e7eb", "#ef4444", "#3b82f6", "#f59e0b", "#a855f7", "#10b981", "#94a3b8", "#f43f5e"] as const;
const AWNINGS = [
  ["#f97316", "#facc15"],
  ["#ec4899", "#fbcfe8"],
  ["#22c55e", "#bbf7d0"],
  ["#38bdf8", "#e0f2fe"],
  ["#a855f7", "#f5d0fe"],
] as const;

// ---------- Mayda elementlar ----------
const tree = (x: number, y: number, r: number) =>
  `<circle cx="${f(x + 2)}" cy="${f(y + 2)}" r="${f(r)}" fill="#000" opacity=".3"/>` +
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#2a7a45"/>` +
  `<circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.3)}" r="${f(r * 0.45)}" fill="#3a9a5c"/>`;

function building(x: number, y: number, w: number, h: number) {
  let s = `<rect x="${f(x + 5)}" y="${f(y + 5)}" width="${f(w)}" height="${f(h)}" rx="3" fill="#000" opacity=".35"/>`;
  s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="3" fill="${pick(BUILDING)}"/>`;
  s += `<rect x="${f(x + 3)}" y="${f(y + 3)}" width="${f(w - 6)}" height="${f(h - 6)}" rx="2" fill="none" stroke="rgba(255,255,255,.05)"/>`;
  if (w > 26)
    s += `<rect x="${f(x + between(5, w - 16))}" y="${f(y + between(5, h - 14))}" width="9" height="7" rx="1" fill="#4a544e"/>`;
  return s;
}

function shop(x: number, y: number, w: number, h: number) {
  const [a, b] = pick(AWNINGS);
  let s = building(x, y, w, h - 7);
  for (let i = 0, sx = x; sx < x + w - 1; i++, sx += 5) {
    s += `<rect x="${f(sx)}" y="${f(y + h - 7)}" width="${f(Math.min(5, x + w - sx))}" height="6" fill="${i % 2 ? b : a}" opacity=".85"/>`;
  }
  return s;
}

function parking(x: number, y: number, w: number, h: number) {
  let s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="3" fill="#2a303d" stroke="#3a4255"/>`;
  for (let sx = x + 5; sx < x + w - 4; sx += 10) {
    s += `<line x1="${f(sx)}" y1="${f(y + h * 0.38)}" x2="${f(sx)}" y2="${f(y + h - 3)}" stroke="rgba(255,255,255,.3)"/>`;
    if (sx + 10 < x + w - 2 && rnd() < 0.45) {
      s += `<rect x="${f(sx + 2)}" y="${f(y + h * 0.46)}" width="6" height="${f(Math.min(13, h * 0.45))}" rx="1.5" fill="${pick(CARS)}"/>`;
    }
  }
  s += `<rect x="${f(x + 3)}" y="${f(y + 3)}" width="12" height="12" rx="2" fill="#2563eb"/>`;
  s += `<text x="${f(x + 9)}" y="${f(y + 12.5)}" font-size="9" font-weight="800" fill="#fff" text-anchor="middle">P</text>`;
  return s;
}

function cityBlock(x: number, y: number, w: number, h: number) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#212824"/>`;
  const half = h / 2;
  const strips: [number, number, boolean][] = [
    [y + 6, half - 9, false],
    [y + half + 3, half - 9, true],
  ];
  for (const [yy, hh, bottom] of strips) {
    let cx = x + 6;
    const end = x + w - 6;
    while (cx < end - 14) {
      const kind = pick(bottom ? ["b", "b", "shop", "park", "tree"] : ["b", "b", "b", "park", "tree"]);
      let iw =
        kind === "b" ? between(30, 58) : kind === "shop" ? between(40, 56) : kind === "park" ? between(48, 60) : between(16, 26);
      iw = Math.min(iw, end - cx);
      if (iw < 14) break;
      if (kind === "b") s += building(cx, yy, iw, hh);
      else if (kind === "shop") s += shop(cx, yy, iw, hh);
      else if (kind === "park" && iw > 30) s += parking(cx, yy, iw, hh);
      else for (let k = 0; k < 2; k++) s += tree(cx + between(5, iw - 5), yy + between(8, hh - 8), between(4.5, 7));
      cx += iw + 5;
    }
  }
  return s;
}

const grass = (x: number, y: number, w: number, h: number) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#grass)" stroke="#2f6b40" stroke-width="2"/>`;

function scatterTrees(x: number, y: number, w: number, h: number, n: number, avoid?: (x: number, y: number) => boolean) {
  let s = "";
  for (let i = 0, tries = 0; i < n && tries < n * 10; tries++) {
    const tx = between(x + 10, x + w - 10);
    const ty = between(y + 10, y + h - 10);
    if (avoid?.(tx, ty)) continue;
    s += tree(tx, ty, between(4.5, 8));
    i++;
  }
  return s;
}

function pondBlock(x: number, y: number, w: number, h: number) {
  const cx = x + w / 2,
    cy = y + h / 2,
    rx = w * 0.3,
    ry = Math.min(h * 0.26, 70);
  let s = grass(x, y, w, h);
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${f(rx + 7)}" ry="${f(ry + 7)}" fill="#35684a"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#water)"/>`;
  s += `<ellipse cx="${f(cx - rx * 0.3)}" cy="${f(cy - ry * 0.3)}" rx="${f(rx * 0.25)}" ry="2" fill="#fff" opacity=".25"/>`;
  s += scatterTrees(x, y, w, h, Math.round((w * h) / 1100), (tx, ty) => ((tx - cx) / (rx + 16)) ** 2 + ((ty - cy) / (ry + 16)) ** 2 < 1);
  return s;
}

function fountainBlock(x: number, y: number, w: number, h: number) {
  const cx = x + w / 2,
    cy = y + h / 2;
  let s = grass(x, y, w, h);
  s += `<rect x="${x + 6}" y="${f(cy - 5)}" width="${w - 12}" height="10" rx="5" fill="#2b3a30"/>`;
  s += `<rect x="${f(cx - 5)}" y="${y + 6}" width="10" height="${h - 12}" rx="5" fill="#2b3a30"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="20" fill="#2b3a30"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="13" fill="url(#water)"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="4" fill="#bdf4ff"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="8" fill="none" stroke="#bdf4ff" stroke-width="1.5"><animate attributeName="r" values="5;13" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="2.4s" repeatCount="indefinite"/></circle>`;
  s += scatterTrees(x, y, w, h, Math.round((w * h) / 1000), (tx, ty) => Math.abs(tx - cx) < 14 || Math.abs(ty - cy) < 14);
  return s;
}

function containerBlock(x: number, y: number, w: number, h: number) {
  const colors = ["#4ade80", "#60a5fa", "#f472b6", "#a78bfa", "#fbbf24", "#2dd4bf", "#fb923c", "#38bdf8"] as const;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#252b28"/>`;
  const cw = (w - 30) / 4,
    ch = (h - 24) / 2;
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 4; c++) {
      const cx = x + 6 + c * (cw + 6),
        cy = y + 8 + r * (ch + 8),
        col = pick(colors);
      s += `<rect x="${f(cx + 3)}" y="${f(cy + 3)}" width="${f(cw)}" height="${f(ch)}" fill="#000" opacity=".35"/>`;
      s += `<rect x="${f(cx)}" y="${f(cy)}" width="${f(cw)}" height="${f(ch)}" rx="1.5" fill="${col}" opacity=".75"/>`;
      for (let lx = cx + 4; lx < cx + cw - 2; lx += 4)
        s += `<line x1="${f(lx)}" y1="${f(cy + 2)}" x2="${f(lx)}" y2="${f(cy + ch - 2)}" stroke="#000" opacity=".2"/>`;
    }
  return s;
}

// ---------- Yo'llar, transport, chiroqlar ----------
function roads() {
  let s = "";
  const hRoads: number[] = [];
  const vRoads: number[] = [];
  for (let j = 0; j <= ROWS.length; j++) hRoads.push(j === 0 ? 0 : rowY(j - 1) + ROWS[j - 1]);
  for (let i = 0; i <= COLS; i++) vRoads.push(i * (BLOCK_W + ROAD));

  for (const y of hRoads)
    s += `<line x1="0" y1="${y + ROAD / 2}" x2="${CITY_W}" y2="${y + ROAD / 2}" stroke="#5a625c" stroke-width="1.5" stroke-dasharray="12 12" opacity=".6"/>`;
  for (const x of vRoads)
    s += `<line x1="${x + ROAD / 2}" y1="0" x2="${x + ROAD / 2}" y2="${CITY_H}" stroke="#5a625c" stroke-width="1.5" stroke-dasharray="12 12" opacity=".6"/>`;

  const zebra = (x: number, y: number, w: number, h: number, alongX: boolean) => {
    let z = "";
    if (alongX) for (let k = x; k < x + w; k += 6) z += `<rect x="${k}" y="${y}" width="3" height="${h}" fill="#d6dbd6" opacity=".3"/>`;
    else for (let k = y; k < y + h; k += 6) z += `<rect x="${x}" y="${k}" width="${w}" height="3" fill="#d6dbd6" opacity=".3"/>`;
    return z;
  };
  for (const vx of vRoads)
    for (const hy of hRoads) {
      if (vx > 0) s += zebra(vx - 11, hy + 5, 8, ROAD - 10, false);
      if (vx + ROAD < CITY_W) s += zebra(vx + ROAD + 3, hy + 5, 8, ROAD - 10, false);
      if (hy > 0) s += zebra(vx + 5, hy - 11, ROAD - 10, 8, true);
      if (hy + ROAD < CITY_H) s += zebra(vx + 5, hy + ROAD + 3, ROAD - 10, 8, true);
    }
  return { s, hRoads, vRoads };
}

const car = (color: string) =>
  `<rect x="-9" y="-4.5" width="18" height="9" rx="2.5" fill="${color}"/>` +
  `<rect x="-1" y="-3.5" width="5" height="7" rx="1.5" fill="#0b0f14" opacity=".55"/>` +
  `<rect x="-7" y="-3.5" width="4" height="7" rx="1" fill="#0b0f14" opacity=".35"/>` +
  `<polygon points="9,-4 34,-10 34,10 9,4" fill="url(#beam)"/>` +
  `<circle cx="8.6" cy="-3" r="1.1" fill="#fff6c9"/><circle cx="8.6" cy="3" r="1.1" fill="#fff6c9"/>` +
  `<rect x="-9.5" y="-4" width="1.5" height="2" fill="#ef4444"/><rect x="-9.5" y="2" width="1.5" height="2" fill="#ef4444"/>`;

function traffic(hRoads: number[], vRoads: number[]) {
  let s = "";
  const drive = (d: string, len: number) => {
    const speed = between(55, 95);
    const dur = len / speed;
    return `<g><animateMotion dur="${f(dur)}s" begin="-${f(between(0, dur))}s" repeatCount="indefinite" rotate="auto" path="${d}"/>${car(pick(CARS))}</g>`;
  };
  hRoads.forEach((y, j) => {
    if (j === 0 || j === hRoads.length - 1) return;
    const c = y + ROAD / 2;
    s += drive(`M -40 ${c + 8} H ${CITY_W + 40}`, CITY_W + 80);
    s += drive(`M ${CITY_W + 40} ${c - 8} H -40`, CITY_W + 80);
    if (rnd() < 0.6) s += drive(`M -40 ${c + 8} H ${CITY_W + 40}`, CITY_W + 80);
  });
  vRoads.forEach((x, i) => {
    if (i === 0 || i === vRoads.length - 1 || rnd() < 0.3) return;
    const c = x + ROAD / 2;
    s += drive(rnd() < 0.5 ? `M ${c - 8} -40 V ${CITY_H + 40}` : `M ${c + 8} ${CITY_H + 40} V -40`, CITY_H + 80);
  });
  return s;
}

function lamps() {
  let s = "";
  for (let r = 0; r < ROWS.length; r++)
    for (let c = 0; c < COLS; c++) {
      const x = colX(c),
        y = rowY(r),
        w = BLOCK_W,
        h = ROWS[r];
      const pts: [number, number][] = [
        [x - 4, y - 4],
        [x + w + 4, y - 4],
        [x - 4, y + h + 4],
        [x + w + 4, y + h + 4],
        [x + w / 2, y - 4],
        [x + w / 2, y + h + 4],
      ];
      if (h > 200) pts.push([x - 4, y + h / 2], [x + w + 4, y + h / 2]);
      for (const [lx, ly] of pts) s += `<circle cx="${lx}" cy="${ly}" r="22" fill="url(#lamp)"/><circle cx="${lx}" cy="${ly}" r="1.8" fill="#fff4c8"/>`;
    }
  return s;
}

/** Metro chizig'i — bekatlar joyi ham shu yerda hisoblanadi. */
function metro() {
  const y1 = rowY(1) + 30;
  const y2 = rowY(2) + ROWS[2] + ROAD / 2;
  const y3 = rowY(3) + 40;
  const d = `M -80 ${y1} C 260 ${y1 + 20}, 420 ${y2 - 30}, 720 ${y2} S 1180 ${y3 + 30}, ${CITY_W + 80} ${rowY(2) + 60}`;
  // Bekatlar: yo'lni taxminan teng bo'lib, uch nuqtani qo'lda joylashtiramiz
  // (getPointAtLength faqat brauzerda ishlaydi, shuning uchun qat'iy qiymatlar).
  const stations: [number, number][] = [
    [352, y1 + 34],
    [720, y2 - 6],
    [1180, y3 + 26],
  ];
  const marks = stations
    .map(
      ([x, y]) =>
        `<g transform="translate(${f(x)} ${f(y)})"><circle r="10" fill="#fff" stroke="#2563eb" stroke-width="2.5"/><text y="4" font-size="11" font-weight="800" fill="#2563eb" text-anchor="middle">M</text></g>`,
    )
    .join("");
  return `<g pointer-events="none">
    <path d="${d}" fill="none" stroke="#9aa6a0" stroke-width="3" stroke-dasharray="8 9" opacity=".35"/>
    <g><animateMotion dur="34s" repeatCount="indefinite" rotate="auto" path="${d}"/>
      <rect x="-34" y="-7" width="68" height="14" rx="5" fill="#8f9b96" opacity=".85"/>
      <rect x="-30" y="-4" width="60" height="8" rx="3" fill="#cfd8d4" opacity=".5"/>
      <polygon points="34,-6 70,-16 70,16 34,6" fill="url(#beam)"/>
    </g>${marks}</g>`;
}

export const CITY_DEFS = `
  <radialGradient id="lamp"><stop offset="0" stop-color="#ffe7a3" stop-opacity=".55"/><stop offset=".35" stop-color="#ffd166" stop-opacity=".18"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>
  <linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="#fff3c4" stop-opacity=".55"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></linearGradient>
  <linearGradient id="water" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2bb3c0"/><stop offset="1" stop-color="#1b7f93"/></linearGradient>
  <pattern id="grass" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="16" height="16" fill="#1e4a2b"/><rect width="8" height="16" fill="#22532f"/></pattern>`;

let cache: { below: string; above: string } | null = null;

/** Tumanlar ostida va ustida chiziladigan markup (bir marta hisoblanadi). */
export function scenery() {
  if (cache) return cache;
  seed = 11;
  const { s: roadSvg, hRoads, vRoads } = roads();
  let blocks = "";
  LAYOUT.forEach((row, r) =>
    row.forEach((kind, c) => {
      if (kind === "district") return;
      const x = colX(c),
        y = rowY(r),
        w = BLOCK_W,
        h = ROWS[r];
      if (kind === "pond") blocks += pondBlock(x, y, w, h);
      else if (kind === "fountain") blocks += fountainBlock(x, y, w, h);
      else if (kind === "containers") blocks += containerBlock(x, y, w, h);
      else blocks += cityBlock(x, y, w, h);
    }),
  );
  cache = {
    below: roadSvg + blocks + traffic(hRoads, vRoads),
    above: metro() + `<g style="mix-blend-mode:screen" pointer-events="none">${lamps()}</g>`,
  };
  return cache;
}
