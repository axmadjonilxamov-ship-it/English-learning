// ================= Kurs yo'li (egri yo'l bo'ylab darslar) =================
const PathView = (() => {
  const S = 330;          // bekatlar orasidagi masofa
  const X0 = 240;         // birinchi bekat
  const YT = 245, YB = 405, HGT = 650;
  const CHECK = (w) => `<path d="M${-0.38 * w} 0 l${0.24 * w} ${0.26 * w} l${0.5 * w} ${-0.52 * w}" fill="none" stroke="currentColor" stroke-width="${w > 40 ? 8 : 7}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let level = null, selected = 0, lengths = [], road = null, carAnim = 0;

  function open(levelId, moduleIdx) {
    level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    const cur = Progress.current(level);
    selected = cur;
    if (moduleIdx !== undefined && moduleIdx !== "") {
      const firstOfModule = level.lessons.findIndex((l) => l.module === +moduleIdx);
      const undoneInModule = level.lessons.findIndex((l) => l.module === +moduleIdx && !Progress.isDone(l.id));
      selected = undoneInModule !== -1 ? undoneInModule : Math.max(firstOfModule, 0);
    }
    renderTabs();
    renderHeader();
    renderRoad(cur);
    renderPanel();
  }

  function renderTabs() {
    $("levelTabs").innerHTML = LEVELS.map((lv) => {
      const p = Progress.of(lv);
      return `<button class="chip ${lv === level ? "active" : ""}" data-act="path:${lv.id}">${esc(lv.name)} <small>${p.done}/${p.total}</small></button>`;
    }).join("");
  }

  function renderHeader() {
    const p = Progress.of(level);
    $("pathLevel").textContent = (level.full || level.name).toUpperCase();
    $("pathCount").textContent = `${p.done}/${p.total}`;
    $("pathSegs").innerHTML = level.modules.map((m) => {
      const d = m.lessons.filter((l) => Progress.isDone(l.id)).length;
      return `<div class="seg" style="flex:${m.lessons.length}" title="${esc(m.name)}"><div style="width:${(d / m.lessons.length) * 100}%"></div></div>`;
    }).join("");
  }

  function renderRoad(cur) {
    const n = level.lessons.length;
    const pts = level.lessons.map((_, i) => ({ x: X0 + i * S, y: i % 2 ? YB : YT }));
    const start = { x: X0 - S, y: YB };
    const end = { x: X0 + n * S, y: n % 2 ? YB : YT };
    const all = [start, ...pts, end];
    let d = `M ${start.x} ${start.y}`;
    for (let i = 1; i < all.length; i++) {
      const a = all[i - 1], b = all[i];
      d += ` C ${a.x + S / 2} ${a.y}, ${b.x - S / 2} ${b.y}, ${b.x} ${b.y}`;
    }
    const width = X0 + (n - 1) * S + 380;

    // Fon bezaklari: xira harflar va qushlar
    const glyphs = ["A1", "B2", "abc", "?", "!", "Aa", "&", "-ing", "-ed", "the", "C1", "is", "was"];
    let deco = "";
    for (let i = 0; i < n * 3; i++) {
      const x = 40 + Math.random() * (width - 80), y = 60 + Math.random() * (HGT - 120);
      if (y > YT - 60 && y < YB + 60) continue;
      deco += `<text class="deco" x="${x | 0}" y="${y | 0}" font-size="${16 + Math.random() * 12 | 0}">${glyphs[i % glyphs.length]}</text>`;
    }
    for (let i = 0; i < n; i++) {
      const x = Math.random() * width, y = 120 + Math.random() * (HGT - 240);
      deco += `<path class="bird" d="M${x | 0} ${y | 0} q5 -5 10 0 q5 -5 10 0" style="animation-delay:-${(Math.random() * 8).toFixed(1)}s"/>`;
    }

    // Modul boshidagi ko'rsatkich (belgi)
    let signs = "";
    level.modules.forEach((m, mi) => {
      const i = level.lessons.findIndex((l) => l.module === mi);
      const p = pts[i], top = i % 2 === 0;
      const sx = p.x - 150, sy = top ? p.y - 70 : p.y + 42;
      const tw = m.name.length * 8.4 + 24;
      signs += `<g class="sign">
        <line x1="${sx}" y1="${top ? sy + 28 : sy}" x2="${sx}" y2="${top ? sy + 52 : sy - 22}" stroke="#64748b" stroke-width="3"/>
        <rect x="${sx - tw / 2}" y="${top ? sy : sy}" width="${tw}" height="28" rx="6" fill="#1d4ed8"/>
        <text x="${sx}" y="${sy + 19}" text-anchor="middle">${esc(m.name)}</text></g>`;
    });

    // Bekatlar
    const nodes = level.lessons.map((l, i) => {
      const p = pts[i], top = i % 2 === 0, by = top ? p.y - 150 : p.y + 150;
      const done = Progress.isDone(l.id), isCur = i === cur;
      const state = isCur ? "current" : done ? "done" : "todo";
      let badge;
      if (isCur) {
        badge = `<circle r="58" fill="rgba(255,255,255,.07)"/><circle r="50" fill="#fff"/>` +
          (done ? `<g color="#16a34a">${CHECK(46)}</g>` : `<path d="M-10 -16 L18 0 L-10 16 Z" fill="#2563eb"/>`);
      } else if (done) {
        badge = `<circle r="42" fill="#22c55e"/><g color="#fff">${CHECK(40)}</g>`;
      } else {
        badge = `<circle r="42" fill="#141a28" stroke="#2c3a58" stroke-width="3"/><text y="10" font-size="26" text-anchor="middle" opacity=".85">${level.modules[l.module].icon}</text>`;
      }
      const tx = p.x + (isCur ? 70 : 58);
      return `<g class="node ${state}" data-i="${i}" tabindex="0" role="button" aria-label="${i + 1}. ${esc(l.title)}">
        <line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${by}" stroke="#2f5fb3" stroke-width="5"/>
        <circle cx="${p.x}" cy="${p.y}" r="11" fill="#fff" stroke="#2f5fb3" stroke-width="6"/>
        <g class="badge" transform="translate(${p.x} ${by})">
          <circle class="sel-ring" r="${isCur ? 66 : 52}" fill="none" stroke="#60a5fa" stroke-width="3" stroke-dasharray="7 7"/>
          ${badge}
          <circle cx="${isCur ? 36 : 30}" cy="${isCur ? 36 : 32}" r="14" fill="#1e3a8a" stroke="#0b0f19" stroke-width="3"/>
          <text x="${isCur ? 36 : 30}" y="${isCur ? 41 : 37}" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">${i + 1}</text>
        </g>
        <text class="node-title ${isCur ? "big" : ""}" x="${tx}" y="${by - 2}">${esc(l.title)}</text>
        <text class="node-min" x="${tx}" y="${by + 22}">${l.min} daqiqa</text>
      </g>`;
    }).join("");

    $("pathCanvas").innerHTML = `
<svg class="path-svg" width="${width}" height="${HGT}" viewBox="0 0 ${width} ${HGT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pbeam" x1="0" x2="1"><stop offset="0" stop-color="#fde68a" stop-opacity=".55"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></linearGradient>
  </defs>
  ${deco}
  <path d="${d}" fill="none" stroke="#05080c" stroke-width="124" opacity=".7"/>
  <path d="${d}" fill="none" stroke="#2f5fb3" stroke-width="106"/>
  <path d="${d}" fill="none" stroke="#1d212b" stroke-width="94"/>
  <path d="${d}" fill="none" stroke="#3a64b8" stroke-width="4" stroke-dasharray="30 26" opacity=".9"/>
  <path id="roadPath" d="${d}" fill="none" stroke="none"/>
  ${signs}
  ${nodes}
  <g id="pathCar">
    <polygon points="22,-9 100,-36 100,36 22,9" fill="url(#pbeam)"/>
    <rect x="-24" y="-13" width="48" height="26" rx="9" fill="#f8fafc"/>
    <rect x="-24" y="-3" width="48" height="6" fill="#2563eb"/>
    <rect x="0" y="-11" width="12" height="22" rx="3" fill="#1e293b"/>
    <rect x="-19" y="-10" width="8" height="20" rx="2" fill="#334155" opacity=".75"/>
    <circle cx="21" cy="-8" r="2.2" fill="#fff7cc"/><circle cx="21" cy="8" r="2.2" fill="#fff7cc"/>
    <rect x="-25" y="-11" width="2.5" height="5" rx="1" fill="#ef4444"/><rect x="-25" y="6" width="2.5" height="5" rx="1" fill="#ef4444"/>
  </g>
</svg>`;

    road = $("roadPath");
    const L = road.getTotalLength();
    lengths = [];
    let l = 0;
    pts.forEach((p) => { while (l < L && road.getPointAtLength(l).x < p.x) l += 2; lengths.push(l); });

    const target = Math.max(lengths[cur] - 70, 10);
    const from = cur > 0 ? lengths[cur - 1] + 40 : 0;
    animateCar(from, target);
    scrollToNode(selected, false);
    highlightSelected();
  }

  function placeCar(l) {
    const p = road.getPointAtLength(l), q = road.getPointAtLength(l + 1);
    const a = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
    $("pathCar").setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${a.toFixed(1)})`);
  }
  function animateCar(from, to) {
    cancelAnimationFrame(carAnim);
    const t0 = performance.now(), dur = 1500;
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const tick = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      placeCar(from + (to - from) * ease(t));
      if (t < 1) carAnim = requestAnimationFrame(tick);
    };
    placeCar(from);
    carAnim = requestAnimationFrame(tick);
  }

  function scrollToNode(i, smooth) {
    const sc = $("pathScroll");
    const x = X0 + i * S - sc.clientWidth * 0.35;
    sc.scrollTo({ left: Math.max(0, x), behavior: smooth ? "smooth" : "auto" });
  }

  function highlightSelected() {
    document.querySelectorAll("#pathCanvas .node").forEach((n) => n.classList.toggle("selected", +n.dataset.i === selected));
  }

  function renderPanel() {
    const l = level.lessons[selected];
    const done = Progress.isDone(l.id);
    $("pathPanel").innerHTML = `
      <div class="lesson-card ${done ? "done" : ""}">
        <div class="lc-badge">${done ? `<svg class="i"><use href="#i-check"/></svg>` : selected + 1}</div>
        <div class="lc-text"><b>${esc(l.title)}</b><span>${esc(level.modules[l.module].name)} · ${l.min} daqiqa · ${l.tasks.length} ta mashq</span></div>
        <button class="lc-open" data-act="lesson:${level.id}:${selected}">
          <svg class="i sm"><use href="#i-book"/></svg> ${done ? "Qayta ochish" : "Darsni ochish"} <svg class="i sm"><use href="#i-right"/></svg>
        </button>
      </div>`;
  }

  // Bekatni tanlash; tanlangan bekatni qayta bossangiz — dars ochiladi
  $("pathCanvas").addEventListener("click", (e) => {
    if (dragMoved) return;
    const node = e.target.closest(".node");
    if (!node) return;
    const i = +node.dataset.i;
    if (i === selected) { go("lesson", level.id, i); return; }
    selected = i;
    highlightSelected();
    renderPanel();
  });

  // Sichqoncha bilan sudrab va g'ildirak bilan gorizontal aylantirish
  let dragMoved = false;
  (() => {
    const sc = $("pathScroll");
    let startX = 0, startLeft = 0, down = false;
    sc.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; dragMoved = false; startX = e.clientX; startLeft = sc.scrollLeft;
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) { dragMoved = true; sc.classList.add("dragging"); }
      sc.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", () => {
      down = false;
      sc.classList.remove("dragging");
      setTimeout(() => { dragMoved = false; }, 0);
    });
    sc.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && sc.scrollWidth > sc.clientWidth) {
        e.preventDefault();
        sc.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  })();

  return { open };
})();
HOOKS.path = PathView.open;

// ================= Dars ichi =================
const LessonView = (() => {
  let level, lesson, step = 0, solved = false, st = {};

  function open(levelId, idx) {
    level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    lesson = level.lessons[+idx] || level.lessons[0];
    step = 0;
    $("lessonDone").classList.remove("show");
    const mod = level.modules[lesson.module];
    $("railLevel").textContent = level.name;
    $("railNum").textContent = lesson.index + 1;
    $("lsTag").textContent = `${level.cefr} · ${mod.name}`;
    $("lsTitle").textContent = lesson.title;
    $("lsText").textContent = lesson.text;
    $("ruleIcon").textContent = lesson.rule.icon;
    $("ruleName").textContent = lesson.rule.name;
    $("ruleEn").innerHTML = `<b>${esc(lesson.rule.en)}</b> · ${esc(lesson.en)}`;
    $("ruleDesc").textContent = lesson.rule.desc;
    $("winTitle").textContent = `${level.id}-${lesson.index + 1}.lesson — English Learning Center`;
    renderStep();
  }

  const task = () => lesson.tasks[step];

  function renderRail() {
    $("railDots").innerHTML = lesson.tasks.map((_, i) =>
      `<i class="${i < step || (i === step && solved) ? "done" : i === step ? "cur" : ""}"></i>`).join("");
  }

  function sentenceOf(t) {
    if (t.t === "choose") return t.q.replace("___", t.a).replace(/\(.*?\)/g, "").replace(/\s—.*$/, "");
    if (t.t === "build") return t.s;
    if (t.t === "listen") return t.w;
    return t.pairs.map((p) => p[0]).join(", ");
  }

  function renderStep() {
    solved = false;
    st = {};
    const t = task();
    $("nextBtn").disabled = true;
    $("nextBtn").classList.remove("pulse");
    $("nextBtn").innerHTML = step === lesson.tasks.length - 1 ? "Yakunlash ✓" : `Keyingi <svg class="i sm"><use href="#i-right"/></svg>`;
    $("statusInfo").textContent = `Qadam ${step + 1} / ${lesson.tasks.length}`;
    $("statusMsg").textContent = "";
    $("statusMsg").className = "status-msg";
    renderRail();

    const taskText = {
      choose: `Gapdagi <mark>bo'sh joyni</mark> to'g'ri so'z bilan to'ldiring.`,
      build: `So'zlarni bosib, <mark>to'g'ri gap</mark> tuzing.`,
      match: `Inglizcha so'zlarni <mark>tarjimasi bilan</mark> juftlang.`,
      listen: `So'zni <mark>tinglang</mark> va inglizcha yozing.`,
    }[t.t];
    $("taskText").innerHTML = taskText;

    const speakGroup = `<div class="rb-group"><div class="rb-items">
        <button class="rb-btn" data-say="1"><span class="rb-ic">🔊</span>Tinglash</button>
        <button class="rb-btn" data-say="slow"><span class="rb-ic">🐢</span>Sekin</button>
      </div><div class="rb-label">Talaffuz</div></div>`;
    const title = `<div class="paper-title">${esc(lesson.en)}</div>`;

    if (t.t === "choose") {
      const [a, b] = t.q.split("___");
      $("ribbon").innerHTML = `<div class="rb-group" id="rbMain"><div class="rb-items">
          ${shuffle(t.opts).map((o) => `<button class="rb-opt" data-v="${esc(o)}">${esc(o)}</button>`).join("")}
        </div><div class="rb-label">Variantlar</div></div>${speakGroup}`;
      $("paper").innerHTML = `${title}<p class="paper-line" id="target">${esc(a)}<span class="blank" id="blank"></span>${esc(b || "")}</p>
        <p class="paper-uz">${esc(t.uz)}</p>`;
    } else if (t.t === "build") {
      st.tiles = shuffle(t.s.split(" ").map((w, k) => ({ w, k })));
      st.placed = [];
      $("ribbon").innerHTML = `<div class="rb-group" id="rbMain"><div class="rb-items wrap">
          ${st.tiles.map((x, i) => `<button class="rb-opt tile" data-t="${i}">${esc(x.w)}</button>`).join("")}
        </div><div class="rb-label">So'zlar</div></div>
        <div class="rb-group"><div class="rb-items"><button class="rb-btn" id="rbClear"><span class="rb-ic">↺</span>Tozalash</button></div><div class="rb-label">Tahrir</div></div>${speakGroup}`;
      $("paper").innerHTML = `${title}<p class="paper-uz big">“${esc(t.uz)}”</p><div class="build-line" id="target"></div>`;
      renderBuild();
    } else if (t.t === "match") {
      st.matched = 0;
      $("ribbon").innerHTML = `<div class="rb-group" id="rbMain"><div class="rb-items"><div class="rb-counter"><b id="mCount">0/${t.pairs.length}</b><span>juftlik</span></div></div><div class="rb-label">Natija</div></div>${speakGroup}`;
      $("paper").innerHTML = `${title}<div class="match" id="target">
          <div class="mcol">${shuffle(t.pairs).map((p) => `<button class="mbtn" data-side="en" data-v="${esc(p[0])}">${esc(p[0])}</button>`).join("")}</div>
          <div class="mcol">${shuffle(t.pairs).map((p) => `<button class="mbtn" data-side="uz" data-v="${esc(p[1])}">${esc(p[1])}</button>`).join("")}</div>
        </div>`;
    } else if (t.t === "listen") {
      st.hint = 0;
      $("ribbon").innerHTML = `<div class="rb-group" id="rbMain"><div class="rb-items">
          <button class="rb-btn big" data-say="1"><span class="rb-ic">🔊</span>Tinglash</button>
          <button class="rb-btn" data-say="slow"><span class="rb-ic">🐢</span>Sekin</button>
          <button class="rb-btn" id="rbCheck"><span class="rb-ic">✔️</span>Tekshirish</button>
        </div><div class="rb-label">Talaffuz</div></div>`;
      $("paper").innerHTML = `${title}<p class="paper-uz">Eshitgan so'zingizni yozing va Enter bosing</p>
        <input class="paper-input" id="target" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="…" />
        <p class="paper-uz" id="lHint"></p>`;
      const input = $("target");
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.stopPropagation(); solved ? next() : checkListenTask(); } });
      setTimeout(() => { speak(t.w, 0.85); input.focus(); }, 350);
    }
  }

  function renderBuild() {
    const line = $("target");
    line.innerHTML = st.placed.length
      ? st.placed.map((ti, i) => `<span class="bw" data-p="${i}">${esc(st.tiles[ti].w)}</span>`).join("")
      : `<span class="ph">So'zlarni yuqoridagi paneldan tanlang…</span>`;
    document.querySelectorAll("#ribbon .tile").forEach((b) => b.classList.toggle("used", st.placed.includes(+b.dataset.t)));
  }

  function checkBuild() {
    const t = task();
    if (st.placed.length < st.tiles.length) return;
    const got = st.placed.map((ti) => st.tiles[ti].w).join(" ");
    const line = $("target");
    if (got === t.s) {
      line.insertAdjacentHTML("beforeend", `<span class="punct">${t.end || "."}</span>`);
      line.classList.add("ok");
      success();
    } else {
      line.classList.remove("bad"); void line.offsetWidth; line.classList.add("bad");
      fail("Tartib noto'g'ri — so'zni bosib, qaytaring");
    }
  }

  function checkListenTask() {
    const t = task(), input = $("target");
    const guess = input.value.trim().toLowerCase();
    if (!guess) return;
    if (guess === t.w.toLowerCase()) {
      input.classList.add("ok");
      input.readOnly = true;
      $("lHint").innerHTML = `<b>${esc(t.w)}</b> — ${esc(t.uz)}`;
      success();
    } else {
      input.classList.remove("bad"); void input.offsetWidth; input.classList.add("bad");
      fail("Yana tinglab ko'ring");
    }
  }

  function success() {
    solved = true;
    renderRail();
    $("nextBtn").disabled = false;
    $("nextBtn").classList.add("pulse");
    $("statusMsg").textContent = "To'g'ri! ✓";
    $("statusMsg").className = "status-msg ok";
    const t = task();
    if (t.t !== "listen") speak(sentenceOf(t));
  }
  function fail(msg) {
    $("statusMsg").textContent = msg;
    $("statusMsg").className = "status-msg bad";
  }

  function next() {
    if (!solved) return;
    if (step < lesson.tasks.length - 1) { step++; renderStep(); return; }
    finish();
  }

  function finish() {
    Progress.mark(lesson.id);
    touchStreak();
    const nextLesson = level.lessons[lesson.index + 1];
    const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
    $("doneText").textContent = `"${lesson.title}" — ${lesson.tasks.length} ta mashq bajarildi.`;
    $("doneNext").dataset.act = nextLesson
      ? `lesson:${level.id}:${nextLesson.index}`
      : nextLevel ? `path:${nextLevel.id}` : `path:${level.id}`;
    $("doneNext").innerHTML = nextLesson ? "Keyingi dars →" : nextLevel ? `${esc(nextLevel.name)} darajasi →` : "Kurs yo'li →";
    $("doneBack").dataset.act = `path:${level.id}`;
    $("lessonDone").classList.add("show");
  }

  function spot(el) {
    if (!el) return;
    el.classList.remove("spot"); void el.getBoundingClientRect(); el.classList.add("spot");
    clearTimeout(el._spot);
    el._spot = setTimeout(() => el.classList.remove("spot"), 2600);
  }

  function help() {
    const t = task();
    if (solved) return;
    if (t.t === "choose") {
      spot(document.querySelector(`#ribbon .rb-opt[data-v="${CSS.escape(t.a)}"]`));
    } else if (t.t === "build") {
      const words = t.s.split(" ");
      let k = 0;
      while (k < st.placed.length && st.tiles[st.placed[k]].w === words[k]) k++;
      if (k < st.placed.length) { st.placed = st.placed.slice(0, k); renderBuild(); fail("Xato joydan keyingi so'zlar olib tashlandi"); return; }
      const ti = st.tiles.findIndex((x, i) => x.w === words[k] && !st.placed.includes(i));
      st.placed.push(ti);
      renderBuild();
      if (st.placed.length === st.tiles.length) checkBuild();
    } else if (t.t === "match") {
      const pair = t.pairs.find((p) => !document.querySelector(`.mbtn.matched[data-v="${CSS.escape(p[0])}"]`));
      if (pair) {
        spot(document.querySelector(`.mbtn[data-side="en"][data-v="${CSS.escape(pair[0])}"]`));
        spot(document.querySelector(`.mbtn[data-side="uz"][data-v="${CSS.escape(pair[1])}"]`));
      }
    } else if (t.t === "listen") {
      st.hint = Math.min(st.hint + 1, t.w.length);
      $("lHint").textContent = t.w.split("").map((c, i) => (i < st.hint ? c : "_")).join(" ");
    }
  }

  // ---------- Hodisalar ----------
  $("ribbon").addEventListener("click", (e) => {
    const t = task();
    const say = e.target.closest("[data-say]");
    if (say) { speak(sentenceOf(t), say.dataset.say === "slow" ? 0.6 : 0.95); return; }
    if (solved) return;
    if (e.target.closest("#rbCheck")) { checkListenTask(); return; }
    if (e.target.closest("#rbClear")) { st.placed = []; renderBuild(); $("target").classList.remove("bad"); return; }

    const opt = e.target.closest(".rb-opt");
    if (!opt) return;
    if (t.t === "choose") {
      if (opt.dataset.v === t.a) {
        $("blank").textContent = t.a;
        $("blank").classList.add("filled");
        opt.classList.add("correct");
        document.querySelectorAll("#ribbon .rb-opt").forEach((b) => { b.disabled = true; });
        success();
      } else {
        opt.classList.remove("wrong"); void opt.offsetWidth; opt.classList.add("wrong");
        fail(`"${opt.dataset.v}" to'g'ri emas — qoidani qayta o'qing`);
      }
    } else if (t.t === "build" && !opt.classList.contains("used")) {
      st.placed.push(+opt.dataset.t);
      renderBuild();
      checkBuild();
    }
  });

  $("paper").addEventListener("click", (e) => {
    const t = task();
    if (solved) return;
    if (t.t === "build") {
      const bw = e.target.closest(".bw");
      if (bw) { st.placed.splice(+bw.dataset.p, 1); renderBuild(); $("target").classList.remove("bad"); }
    } else if (t.t === "match") {
      const b = e.target.closest(".mbtn");
      if (!b || b.classList.contains("matched")) return;
      document.querySelectorAll(`.mbtn[data-side="${b.dataset.side}"]`).forEach((x) => x.classList.remove("sel"));
      b.classList.add("sel");
      const en = document.querySelector('.mbtn.sel[data-side="en"]');
      const uz = document.querySelector('.mbtn.sel[data-side="uz"]');
      if (!en || !uz) { if (b.dataset.side === "en") speak(b.dataset.v); return; }
      const ok = t.pairs.some((p) => p[0] === en.dataset.v && p[1] === uz.dataset.v);
      [en, uz].forEach((x) => x.classList.remove("sel"));
      if (ok) {
        [en, uz].forEach((x) => { x.classList.add("matched"); x.disabled = true; });
        st.matched++;
        $("mCount").textContent = `${st.matched}/${t.pairs.length}`;
        speak(en.dataset.v);
        if (st.matched === t.pairs.length) success();
      } else {
        [en, uz].forEach((x) => { x.classList.remove("wrong"); void x.offsetWidth; x.classList.add("wrong"); });
        fail("Bu juftlik noto'g'ri");
      }
    }
  });

  $("ruleShow").addEventListener("click", () => spot($("rbMain")));
  $("taskWhere").addEventListener("click", () => spot($("target")));
  $("helpBtn").addEventListener("click", help);
  $("nextBtn").addEventListener("click", next);
  $("statusSpeak").addEventListener("click", () => speak(sentenceOf(task())));
  $("lessonBack").addEventListener("click", () => go("path", level.id));
  document.addEventListener("keydown", (e) => {
    if (!$("lesson").classList.contains("active") || e.target.matches("input")) return;
    if (e.key === "Enter" && solved && !$("lessonDone").classList.contains("show")) { e.preventDefault(); next(); }
    const n = parseInt(e.key, 10);
    const opts = document.querySelectorAll("#ribbon .rb-opt:not(.used)");
    if (task() && task().t === "choose" && n >= 1 && n <= opts.length) opts[n - 1].click();
  });

  return { open };
})();
HOOKS.lesson = LessonView.open;
