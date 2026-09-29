// Bosh sahifadagi tungi shaharcha (SVG). Markaziy qatordagi tumanlar — LEVELS dagi darajalar,
// har bir tumandagi 3 ta bino — o'sha darajaning modullari.
const City = (() => {
  const R = 38;          // yo'l kengligi
  const BW = 160;        // kvartal kengligi
  const COLS = 8;
  const ROWS = [118, 118, 300, 118, 118];
  const W = R * (COLS + 1) + BW * COLS;
  const H = R * (ROWS.length + 1) + ROWS.reduce((a, b) => a + b, 0);
  const colX = (c) => R + c * (BW + R);
  const rowY = (r) => R + ROWS.slice(0, r).reduce((a, b) => a + b, 0) + r * R;

  const LAYOUT = [
    ["city", "pond", "city", "city", "containers", "city", "city", "city"],
    ["city", "city", "city", "city", "city", "city", "fountain", "city"],
    ["fountain", "D", "D", "D", "D", "D", "D", "pond"],
    ["city", "fountain", "city", "city", "city", "pond", "city", "city"],
    ["city", "containers", "city", "pond", "city", "city", "city", "fountain"],
  ];

  // Har safar bir xil ko'rinishi uchun deterministik tasodif
  let seed = 11;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const between = (a, b) => a + rnd() * (b - a);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const f = (n) => Math.round(n * 10) / 10;

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    const mix = (c) => Math.round(c + (t - c) * p);
    return `rgb(${mix(n >> 16)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
  }

  const BUILDING = ["#353e39", "#313a35", "#3a443e", "#2e3632", "#38413c"];
  const CARS = ["#e5e7eb", "#ef4444", "#3b82f6", "#f59e0b", "#a855f7", "#10b981", "#94a3b8", "#f43f5e"];
  const AWNINGS = [["#f97316", "#facc15"], ["#ec4899", "#fbcfe8"], ["#22c55e", "#bbf7d0"], ["#38bdf8", "#e0f2fe"], ["#a855f7", "#f5d0fe"]];

  // ---------- Kichik elementlar ----------
  const tree = (x, y, r) =>
    `<circle cx="${f(x + 2)}" cy="${f(y + 2)}" r="${f(r)}" fill="#000" opacity=".3"/>` +
    `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#2a7a45"/>` +
    `<circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.3)}" r="${f(r * 0.45)}" fill="#3a9a5c"/>`;

  function building(x, y, w, h) {
    let s = `<rect x="${f(x + 5)}" y="${f(y + 5)}" width="${f(w)}" height="${f(h)}" rx="3" fill="#000" opacity=".35"/>`;
    s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="3" fill="${pick(BUILDING)}"/>`;
    s += `<rect x="${f(x + 3)}" y="${f(y + 3)}" width="${f(w - 6)}" height="${f(h - 6)}" rx="2" fill="none" stroke="rgba(255,255,255,.05)"/>`;
    if (w > 26) s += `<rect x="${f(x + between(5, w - 16))}" y="${f(y + between(5, h - 14))}" width="9" height="7" rx="1" fill="#4a544e"/>`;
    return s;
  }

  function shop(x, y, w, h) {
    const [a, b] = pick(AWNINGS);
    let s = building(x, y, w, h - 7);
    for (let i = 0, sx = x; sx < x + w - 1; i++, sx += 5) {
      s += `<rect x="${f(sx)}" y="${f(y + h - 7)}" width="${f(Math.min(5, x + w - sx))}" height="6" fill="${i % 2 ? b : a}" opacity=".85"/>`;
    }
    return s;
  }

  function parking(x, y, w, h) {
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

  // ---------- Kvartallar ----------
  function cityBlock(x, y, w, h) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#212824"/>`;
    const half = h / 2;
    [[y + 6, half - 9, false], [y + half + 3, half - 9, true]].forEach(([yy, hh, bottom]) => {
      let cx = x + 6;
      const end = x + w - 6;
      while (cx < end - 14) {
        const kind = pick(bottom ? ["b", "b", "shop", "park", "tree"] : ["b", "b", "b", "park", "tree"]);
        let iw = kind === "b" ? between(30, 58) : kind === "shop" ? between(40, 56) : kind === "park" ? between(48, 60) : between(16, 26);
        iw = Math.min(iw, end - cx);
        if (iw < 14) break;
        if (kind === "b") s += building(cx, yy, iw, hh);
        else if (kind === "shop") s += shop(cx, yy, iw, hh);
        else if (kind === "park" && iw > 30) s += parking(cx, yy, iw, hh);
        else for (let k = 0; k < 2; k++) s += tree(cx + between(5, iw - 5), yy + between(8, hh - 8), between(4.5, 7));
        cx += iw + 5;
      }
    });
    return s;
  }

  const grass = (x, y, w, h) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#grass)" stroke="#2f6b40" stroke-width="2"/>`;

  function scatterTrees(x, y, w, h, n, avoid) {
    let s = "";
    for (let i = 0, tries = 0; i < n && tries < n * 10; tries++) {
      const tx = between(x + 10, x + w - 10), ty = between(y + 10, y + h - 10);
      if (avoid && avoid(tx, ty)) continue;
      s += tree(tx, ty, between(4.5, 8));
      i++;
    }
    return s;
  }

  function pondBlock(x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2, rx = w * 0.3, ry = Math.min(h * 0.26, 70);
    let s = grass(x, y, w, h);
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${f(rx + 7)}" ry="${f(ry + 7)}" fill="#35684a"/>`;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#water)"/>`;
    s += `<ellipse cx="${f(cx - rx * 0.3)}" cy="${f(cy - ry * 0.3)}" rx="${f(rx * 0.25)}" ry="2" fill="#fff" opacity=".25"/>`;
    s += scatterTrees(x, y, w, h, Math.round(w * h / 1100), (tx, ty) => ((tx - cx) / (rx + 16)) ** 2 + ((ty - cy) / (ry + 16)) ** 2 < 1);
    return s;
  }

  function fountainBlock(x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2;
    let s = grass(x, y, w, h);
    s += `<rect x="${x + 6}" y="${f(cy - 5)}" width="${w - 12}" height="10" rx="5" fill="#2b3a30"/>`;
    s += `<rect x="${f(cx - 5)}" y="${y + 6}" width="10" height="${h - 12}" rx="5" fill="#2b3a30"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="20" fill="#2b3a30"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="13" fill="url(#water)"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="4" fill="#bdf4ff"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="8" fill="none" stroke="#bdf4ff" stroke-width="1.5"><animate attributeName="r" values="5;13" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="2.4s" repeatCount="indefinite"/></circle>`;
    s += scatterTrees(x, y, w, h, Math.round(w * h / 1000), (tx, ty) => Math.abs(tx - cx) < 14 || Math.abs(ty - cy) < 14);
    return s;
  }

  function containerBlock(x, y, w, h) {
    const colors = ["#4ade80", "#60a5fa", "#f472b6", "#a78bfa", "#fbbf24", "#2dd4bf", "#fb923c", "#38bdf8"];
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#252b28"/>`;
    const cw = (w - 30) / 4, ch = (h - 24) / 2;
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
      const cx = x + 6 + c * (cw + 6), cy = y + 8 + r * (ch + 8), col = pick(colors);
      s += `<rect x="${f(cx + 3)}" y="${f(cy + 3)}" width="${f(cw)}" height="${f(ch)}" fill="#000" opacity=".35"/>`;
      s += `<rect x="${f(cx)}" y="${f(cy)}" width="${f(cw)}" height="${f(ch)}" rx="1.5" fill="${col}" opacity=".75"/>`;
      for (let lx = cx + 4; lx < cx + cw - 2; lx += 4) s += `<line x1="${f(lx)}" y1="${f(cy + 2)}" x2="${f(lx)}" y2="${f(cy + ch - 2)}" stroke="#000" opacity=".2"/>`;
    }
    return s;
  }

  // ---------- Tuman (daraja) ----------
  function tower(tx, ty, tw, th, color, icon, label, main, act, tip) {
    const cx = tx + tw / 2;
    let s = `<g class="tower" data-act="${act}" data-tip="${tip}" tabindex="0" role="button" aria-label="${tip}">`;
    for (let k = 3; k >= 1; k--) {
      s += `<rect x="${f(tx - k * 3.5)}" y="${f(ty + k * 3.5)}" width="${tw}" height="${th}" rx="6" fill="${shade(color, -0.35 - k * 0.08)}" stroke="${shade(color, -0.15)}" stroke-width=".8"/>`;
    }
    s += `<rect class="tw-front" x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="6" fill="${color}"/>`;
    s += `<rect x="${tx + 3}" y="${ty + 3}" width="${tw - 6}" height="${th - 6}" rx="4" fill="${shade(color, -0.62)}"/>`;
    if (main) {
      s += `<circle cx="${cx}" cy="${ty + 22}" r="9" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.5"/>`;
      s += `<text x="${cx}" y="${ty + 25.5}" font-size="9" font-weight="800" fill="rgba(255,255,255,.85)" text-anchor="middle">H</text>`;
    } else {
      s += `<rect x="${tx + 8}" y="${ty + 12}" width="${f(tw * 0.3)}" height="4" rx="2" fill="${shade(color, 0.25)}" opacity=".7"/>`;
      s += `<rect x="${f(tx + tw - 8 - tw * 0.18)}" y="${ty + 12}" width="${f(tw * 0.18)}" height="4" rx="2" fill="${shade(color, 0.25)}" opacity=".45"/>`;
    }
    const size = main ? 28 : 24, cy = ty + th * 0.46;
    s += `<rect x="${f(cx - size / 2)}" y="${f(cy - size / 2)}" width="${size}" height="${size}" rx="7" fill="${shade(color, 0.12)}"/>`;
    s += `<text x="${cx}" y="${f(cy + (main ? 5 : 4.5))}" font-size="${main ? 14 : 12}" text-anchor="middle">${icon}</text>`;
    const fs = Math.min(main ? 11 : 9.5, (tw - 4) / (label.length * 0.56));
    s += `<text x="${cx}" y="${f(cy + size / 2 + 15)}" font-size="${f(fs)}" font-weight="700" fill="${shade(color, 0.6)}" text-anchor="middle">${label}</text>`;
    if (main) {
      s += `<rect x="${f(cx - 8)}" y="${ty + th - 20}" width="16" height="12" rx="2" fill="${shade(color, -0.15)}"/>`;
    } else {
      s += `<rect x="${f(cx - tw * 0.28)}" y="${ty + th - 18}" width="${f(tw * 0.56)}" height="9" rx="2" fill="${shade(color, -0.3)}"/>`;
      for (let i = 1; i < 5; i++) {
        const lx = cx - tw * 0.28 + (tw * 0.56 * i) / 5;
        s += `<line x1="${f(lx)}" y1="${ty + th - 16}" x2="${f(lx)}" y2="${ty + th - 11}" stroke="${shade(color, 0.3)}" opacity=".6"/>`;
      }
    }
    return s + "</g>";
  }

  function district(level, x, y, w, h) {
    const p = level.palette;
    let s = `<g class="district" data-level="${level.id}">`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#1c2621" stroke="#2c3a31"/>`;
    // Binolar: chap, markaziy (baland), o'ng
    const spec = [
      { m: 0, tx: x + 14, tw: 42, ty: y + 28, th: 148 },
      { m: 1, tx: x + 61, tw: 48, ty: y + 14, th: 164, main: true },
      { m: 2, tx: x + 114, tw: 42, ty: y + 28, th: 148 },
    ];
    spec.forEach((t) => {
      const mod = level.modules[t.m];
      s += tower(t.tx, t.ty, t.tw, t.th, p[t.m], mod.icon, mod.short, t.main,
        `path:${level.id}:${t.m}`, `${level.name} · ${mod.name}`);
    });
    // Piyoda yo'lka va maydon
    s += `<rect x="${x + w / 2 - 8}" y="${y + 184}" width="16" height="12" fill="#2a3a30"/>`;
    const px = x + 8, py = y + 196, pw = w - 16, ph = 94;
    s += `<g class="plaza" data-act="path:${level.id}" data-tip="${level.full || level.name} · ${level.cefr}" tabindex="0" role="button" aria-label="${level.full || level.name}">`;
    s += `<rect class="plaza-bg" x="${px}" y="${py}" width="${pw}" height="${ph}" rx="10" fill="#1b3a25" stroke="#3f8f52" stroke-width="2"/>`;
    s += `<rect x="${px + 5}" y="${py + 5}" width="${pw - 10}" height="${ph - 10}" rx="7" fill="none" stroke="#2e6b3d" opacity=".6"/>`;
    [[px + 12, py + 12, p[0]], [px + pw - 34, py + 12, p[1]], [px + 12, py + ph - 18, p[2]], [px + pw - 34, py + ph - 18, p[0]]].forEach(([bx, by, c]) => {
      s += `<rect x="${bx}" y="${by}" width="22" height="6" rx="3" fill="${shade(c, 0.35)}" opacity=".8"/>`;
    });
    const fs = Math.min(24, (pw - 16) / (level.name.length * 0.58));
    s += `<text x="${x + w / 2}" y="${py + 50}" font-size="${f(fs)}" font-weight="800" fill="#fff" text-anchor="middle">${level.name}</text>`;
    s += `<line x1="${x + w / 2 - 36}" y1="${py + 60}" x2="${x + w / 2 + 36}" y2="${py + 60}" stroke="#3f8f52" stroke-width="2"/>`;
    s += `<text id="dsub-${level.id}" x="${x + w / 2}" y="${py + 76}" font-size="10" font-weight="700" fill="#9fd0ab" text-anchor="middle">${level.cefr}</text>`;
    s += "</g></g>";
    return s;
  }

  // ---------- Yo'llar ----------
  function roads() {
    let s = "";
    const hRoads = [], vRoads = [];
    for (let j = 0; j <= ROWS.length; j++) hRoads.push(j === 0 ? 0 : rowY(j - 1) + ROWS[j - 1]);
    for (let i = 0; i <= COLS; i++) vRoads.push(i * (BW + R));
    hRoads.forEach((y) => { s += `<line x1="0" y1="${y + R / 2}" x2="${W}" y2="${y + R / 2}" stroke="#5a625c" stroke-width="1.5" stroke-dasharray="12 12" opacity=".6"/>`; });
    vRoads.forEach((x) => { s += `<line x1="${x + R / 2}" y1="0" x2="${x + R / 2}" y2="${H}" stroke="#5a625c" stroke-width="1.5" stroke-dasharray="12 12" opacity=".6"/>`; });
    // Piyodalar o'tish joylari
    const zebra = (x, y, w, h, alongX) => {
      let z = "";
      if (alongX) for (let k = x; k < x + w; k += 6) z += `<rect x="${k}" y="${y}" width="3" height="${h}" fill="#d6dbd6" opacity=".3"/>`;
      else for (let k = y; k < y + h; k += 6) z += `<rect x="${x}" y="${k}" width="${w}" height="3" fill="#d6dbd6" opacity=".3"/>`;
      return z;
    };
    vRoads.forEach((vx) => hRoads.forEach((hy) => {
      if (vx > 0) s += zebra(vx - 11, hy + 5, 8, R - 10, false);
      if (vx + R < W) s += zebra(vx + R + 3, hy + 5, 8, R - 10, false);
      if (hy > 0) s += zebra(vx + 5, hy - 11, R - 10, 8, true);
      if (hy + R < H) s += zebra(vx + 5, hy + R + 3, R - 10, 8, true);
    }));
    return { s, hRoads, vRoads };
  }

  function car(color) {
    return `<rect x="-9" y="-4.5" width="18" height="9" rx="2.5" fill="${color}"/>` +
      `<rect x="-1" y="-3.5" width="5" height="7" rx="1.5" fill="#0b0f14" opacity=".55"/>` +
      `<rect x="-7" y="-3.5" width="4" height="7" rx="1" fill="#0b0f14" opacity=".35"/>` +
      `<polygon points="9,-4 34,-10 34,10 9,4" fill="url(#beam)"/>` +
      `<circle cx="8.6" cy="-3" r="1.1" fill="#fff6c9"/><circle cx="8.6" cy="3" r="1.1" fill="#fff6c9"/>` +
      `<rect x="-9.5" y="-4" width="1.5" height="2" fill="#ef4444"/><rect x="-9.5" y="2" width="1.5" height="2" fill="#ef4444"/>`;
  }

  function traffic(hRoads, vRoads) {
    let s = "";
    const drive = (d, len) => {
      const speed = between(55, 95), dur = len / speed;
      return `<g><animateMotion dur="${f(dur)}s" begin="-${f(between(0, dur))}s" repeatCount="indefinite" rotate="auto" path="${d}"/>${car(pick(CARS))}</g>`;
    };
    hRoads.forEach((y, j) => {
      if (j === 0 || j === hRoads.length - 1) return;
      const c = y + R / 2;
      s += drive(`M -40 ${c + 8} H ${W + 40}`, W + 80);
      s += drive(`M ${W + 40} ${c - 8} H -40`, W + 80);
      if (rnd() < 0.6) s += drive(`M -40 ${c + 8} H ${W + 40}`, W + 80);
    });
    vRoads.forEach((x, i) => {
      if (i === 0 || i === vRoads.length - 1 || rnd() < 0.3) return;
      const c = x + R / 2;
      s += drive(rnd() < 0.5 ? `M ${c - 8} -40 V ${H + 40}` : `M ${c + 8} ${H + 40} V -40`, H + 80);
    });
    return s;
  }

  function lamps() {
    let s = "";
    for (let r = 0; r < ROWS.length; r++) for (let c = 0; c < COLS; c++) {
      const x = colX(c), y = rowY(r), w = BW, h = ROWS[r];
      const pts = [[x - 4, y - 4], [x + w + 4, y - 4], [x - 4, y + h + 4], [x + w + 4, y + h + 4], [x + w / 2, y - 4], [x + w / 2, y + h + 4]];
      if (h > 200) pts.push([x - 4, y + h / 2], [x + w + 4, y + h / 2]);
      pts.forEach(([lx, ly]) => {
        s += `<circle cx="${lx}" cy="${ly}" r="22" fill="url(#lamp)"/><circle cx="${lx}" cy="${ly}" r="1.8" fill="#fff4c8"/>`;
      });
    }
    return s;
  }

  function metro() {
    const y1 = rowY(1) + 30, y2 = rowY(2) + ROWS[2] + R / 2, y3 = rowY(3) + 40;
    const d = `M -80 ${y1} C 260 ${y1 + 20}, 420 ${y2 - 30}, 720 ${y2} S 1180 ${y3 + 30}, ${W + 80} ${rowY(2) + 60}`;
    return {
      d,
      svg: `<g class="metro" pointer-events="none">
        <path id="metroPath" d="${d}" fill="none" stroke="#9aa6a0" stroke-width="3" stroke-dasharray="8 9" opacity=".35"/>
        <g><animateMotion dur="34s" repeatCount="indefinite" rotate="auto" path="${d}"/>
          <rect x="-34" y="-7" width="68" height="14" rx="5" fill="#8f9b96" opacity=".85"/>
          <rect x="-30" y="-4" width="60" height="8" rx="3" fill="#cfd8d4" opacity=".5"/>
          <polygon points="34,-6 70,-16 70,16 34,6" fill="url(#beam)"/>
        </g>
        <g id="metroStations"></g>
      </g>`,
    };
  }

  // ---------- Asosiy chizish ----------
  function render(container) {
    seed = 11;
    const { s: roadSvg, hRoads, vRoads } = roads();
    let blocks = "", districts = "";
    let d = 0;
    LAYOUT.forEach((row, r) => row.forEach((type, c) => {
      const x = colX(c), y = rowY(r), w = BW, h = ROWS[r];
      if (type === "D") districts += district(LEVELS[d++], x, y, w, h);
      else if (type === "pond") blocks += pondBlock(x, y, w, h);
      else if (type === "fountain") blocks += fountainBlock(x, y, w, h);
      else if (type === "containers") blocks += containerBlock(x, y, w, h);
      else blocks += cityBlock(x, y, w, h);
    }));
    const m = metro();

    container.innerHTML = `
<svg class="city-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ingliz tili shaharchasi xaritasi">
  <defs>
    <radialGradient id="lamp"><stop offset="0" stop-color="#ffe7a3" stop-opacity=".55"/><stop offset=".35" stop-color="#ffd166" stop-opacity=".18"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>
    <linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="#fff3c4" stop-opacity=".55"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2bb3c0"/><stop offset="1" stop-color="#1b7f93"/></linearGradient>
    <pattern id="grass" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="16" height="16" fill="#1e4a2b"/><rect width="8" height="16" fill="#22532f"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#181d1b"/>
  ${roadSvg}
  ${blocks}
  ${traffic(hRoads, vRoads)}
  ${districts}
  ${m.svg}
  <g pointer-events="none" style="mix-blend-mode:screen">${lamps()}</g>
  <g id="youMarker" pointer-events="none">
    <circle r="10" fill="none" stroke="#22c55e" stroke-width="2"><animate attributeName="r" values="8;26" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite"/></circle>
    <circle r="16" fill="rgba(34,197,94,.15)" stroke="#22c55e" stroke-width="1.5"/>
    <circle r="7" fill="#22c55e" stroke="#fff" stroke-width="2"/>
  </g>
</svg>`;

    // Metro bekatlari
    const path = container.querySelector("#metroPath");
    const len = path.getTotalLength();
    container.querySelector("#metroStations").innerHTML = [0.2, 0.5, 0.78].map((t) => {
      const p = path.getPointAtLength(len * t);
      return `<g transform="translate(${f(p.x)} ${f(p.y)})"><circle r="10" fill="#fff" stroke="#2563eb" stroke-width="2.5"/><text y="4" font-size="11" font-weight="800" fill="#2563eb" text-anchor="middle">M</text></g>`;
    }).join("");
  }

  // Tumanlar yozuvlari va "Siz shu yerdasiz" belgisi
  function update(progressOf, currentLevelIndex) {
    LEVELS.forEach((lv) => {
      const el = document.getElementById(`dsub-${lv.id}`);
      if (el) {
        const p = progressOf(lv);
        el.textContent = `${lv.cefr} · ${p.done}/${p.total} dars`;
      }
    });
    const marker = document.getElementById("youMarker");
    if (marker) {
      const c = currentLevelIndex + 1;
      marker.setAttribute("transform", `translate(${colX(c) + BW / 2} ${rowY(2) + ROWS[2] + R / 2})`);
    }
  }

  return { render, update, W, H };
})();
