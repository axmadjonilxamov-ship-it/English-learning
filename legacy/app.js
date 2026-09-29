// ================= Umumiy yordamchilar =================
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem("englishup:" + key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("englishup:" + key, JSON.stringify(value)); } catch {}
  },
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

const ALL = "Barchasi";
const categories = [ALL, ...Object.keys(WORDS)];
const wordsIn = (cat) => (cat === ALL ? Object.values(WORDS).flat() : WORDS[cat] || []);
const WORD_CAT = new Map(Object.entries(WORDS).flatMap(([cat, list]) => list.map((w) => [w.en, cat])));
const CAT_EMOJI = { Kundalik: "💬", Oila: "👪", Ovqat: "🍎", "Fe'llar": "🏃", Sifatlar: "✨" };

let known = new Set(store.get("known", []));

// ================= Progress =================
const Progress = {
  done: store.get("done", {}),
  isDone(id) { return !!this.done[id]; },
  mark(id) { this.done[id] = Date.now(); store.set("done", this.done); },
  of(level) {
    const done = level.lessons.filter((l) => this.isDone(l.id)).length;
    return { done, total: level.lessons.length };
  },
  current(level) {
    const i = level.lessons.findIndex((l) => !this.isDone(l.id));
    return i === -1 ? level.lessons.length - 1 : i;
  },
  currentLevelIndex() {
    const i = LEVELS.findIndex((lv) => this.of(lv).done < lv.lessons.length);
    return i === -1 ? LEVELS.length - 1 : i;
  },
  totals() {
    let done = 0, total = 0;
    LEVELS.forEach((lv) => { const p = this.of(lv); done += p.done; total += p.total; });
    return { done, total };
  },
};

// ================= Ovoz =================
let enVoice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  enVoice = vs.find((v) => /^en[-_]US/i.test(v.lang) && /Samantha|Google|Natural|Aria|Jenny/i.test(v.name))
    || vs.find((v) => /^en[-_](US|GB)/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || null;
}
if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text, rate = 0.95) {
  if (!("speechSynthesis" in window) || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  if (enVoice) u.voice = enVoice;
  u.rate = rate;
  speechSynthesis.speak(u);
}

// ================= Toast =================
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove("show"), 2000);
}

// ================= Kunlik seriya =================
function touchStreak() {
  const today = new Date().toDateString();
  const s = store.get("streak", { last: null, count: 0 });
  if (s.last !== today) {
    const yesterday = new Date(Date.now() - 864e5).toDateString();
    s.count = s.last === yesterday ? s.count + 1 : 1;
    s.last = today;
    store.set("streak", s);
  }
  $("topStreak").textContent = s.count;
}

// ================= Router =================
// Manzillar: #home, #path/beginner/1, #lesson/beginner/3, #cards/Oila, #quiz, #listen, #grammar/2
const HOOKS = {};
function go(view, ...args) {
  const h = [view, ...args].filter((a) => a !== undefined && a !== "").map(encodeURIComponent).join("/");
  if (location.hash.slice(1) === h) route();
  else location.hash = h;
}
function route() {
  const [view = "home", ...args] = location.hash.slice(1).split("/").map(decodeURIComponent);
  const el = $(view);
  const id = el && el.classList.contains("view") ? view : "home";
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === id));
  const navId = id === "path" || id === "lesson" ? "home" : id;
  document.querySelectorAll(".nav button").forEach((b) => b.classList.toggle("active", b.dataset.go === navId));
  document.body.dataset.view = id;
  window.scrollTo(0, 0);
  if (HOOKS[id]) HOOKS[id](...args);
}
window.addEventListener("hashchange", route);

document.addEventListener("click", (e) => {
  const act = e.target.closest("[data-act]");
  if (act) { e.preventDefault(); go(...act.dataset.act.split(":")); return; }
  const t = e.target.closest("[data-go]");
  if (t) { e.preventDefault(); go(t.dataset.go); }
});
document.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches("g[data-act], g[data-i]")) {
    e.preventDefault();
    e.target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
});

// ================= Mavzu (theme) =================
function syncThemeIcon() {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  $("themeBtn").querySelector("use").setAttribute("href", dark ? "#i-sun" : "#i-moon");
  return dark;
}
$("themeBtn").addEventListener("click", () => {
  const next = syncThemeIcon() ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  store.set("theme", next);
  syncThemeIcon();
});
syncThemeIcon();

// ================= Chips =================
function makeChips(el, items, onPick) {
  const chips = { value: items[0] };
  chips.set = (v, silent) => {
    chips.value = items.includes(v) ? v : items[0];
    el.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c.dataset.v === chips.value));
    if (!silent) onPick(chips.value);
  };
  el.innerHTML = items.map((c) => `<button class="chip" data-v="${esc(c)}">${CAT_EMOJI[c] ? CAT_EMOJI[c] + " " : ""}${esc(c)}</button>`).join("");
  el.addEventListener("click", (e) => { const c = e.target.closest(".chip"); if (c) chips.set(c.dataset.v); });
  chips.set(items[0], true);
  return chips;
}

// ================= Bosh sahifa =================
let cityReady = false;
function renderHome() {
  if (!cityReady) {
    City.render($("city"));
    cityReady = true;
    const wrap = $("cityWrap");
    if (wrap.scrollWidth > wrap.clientWidth) wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2;
  }
  City.update((lv) => Progress.of(lv), Progress.currentLevelIndex());
  renderDistrictList();
  renderStats();
  renderTopics();
}
HOOKS.home = renderHome;

function renderDistrictList() {
  $("districtList").innerHTML = LEVELS.map((lv) => {
    const p = Progress.of(lv), cur = Progress.current(lv), pct = Math.round((p.done / p.total) * 100);
    const mods = lv.modules.map((m, mi) => {
      const md = m.lessons.filter((l) => Progress.isDone(l.id)).length;
      return `<button class="lvl-mod" data-act="path:${lv.id}:${mi}"><span class="lvl-ic" style="background:${lv.palette[mi]}">${m.icon}</span><span>${esc(m.name)}</span><small>${md}/${m.lessons.length}</small></button>`;
    }).join("");
    return `<div class="lvl card" style="--c:${lv.palette[1]}">
      <div class="lvl-head">
        <span class="lvl-cefr">${lv.cefr}</span>
        <h3>${esc(lv.full || lv.name)}</h3>
        <button class="lvl-map" data-act="path:${lv.id}" aria-label="Kurs yo'li"><svg class="i sm"><use href="#i-map"/></svg></button>
      </div>
      <div class="lvl-prog"><div class="bar"><div style="width:${pct}%"></div></div><span>${p.done}/${p.total}</span></div>
      <div class="lvl-mods">${mods}</div>
      <button class="btn primary lvl-go" data-act="lesson:${lv.id}:${cur}">${p.done === 0 ? "Boshlash" : p.done === p.total ? "Takrorlash" : "Davom etish"} <svg class="i sm"><use href="#i-right"/></svg></button>
    </div>`;
  }).join("");
}

function renderStats() {
  const t = Progress.totals();
  const pct = Math.round((t.done / t.total) * 100);
  const streak = store.get("streak", { count: 0 }).count;
  const quiz = store.get("bestQuiz", 0) + "%";
  $("statLessons").textContent = `${t.done}/${t.total}`;
  $("statLearned").textContent = known.size;
  $("statStreak").textContent = streak;
  $("statLessons2").textContent = t.done;
  $("learnPct").textContent = pct + "%";
  $("learnRing").style.setProperty("--p", pct);
  $("statQuiz2").textContent = quiz;
  $("statLearned2").textContent = known.size;
  $("topStreak").textContent = streak;
}

function renderTopics() {
  $("topics").innerHTML = Object.entries(WORDS).map(([cat, list]) => {
    const k = list.filter((w) => known.has(w.en)).length;
    return `<button class="topic card" data-act="cards:${esc(cat)}">
      <div class="topic-top"><span class="topic-emoji">${CAT_EMOJI[cat] || "📚"}</span>
      <div><h3>${esc(cat)}</h3><small>${k} / ${list.length} so'z</small></div></div>
      <div class="bar"><div style="width:${(k / list.length) * 100}%"></div></div>
    </button>`;
  }).join("");
}

// City tooltip
(() => {
  const wrap = $("cityWrap"), tip = $("cityTip");
  wrap.addEventListener("mousemove", (e) => {
    const t = e.target.closest("[data-tip]");
    if (!t) { tip.classList.remove("show"); return; }
    const r = wrap.getBoundingClientRect();
    tip.textContent = t.dataset.tip;
    tip.style.left = e.clientX - r.left + wrap.scrollLeft + "px";
    tip.style.top = e.clientY - r.top + "px";
    tip.classList.add("show");
  });
  wrap.addEventListener("mouseleave", () => tip.classList.remove("show"));
})();

// ================= Lug'at kartochkalari =================
const cards = { list: [], i: 0 };
const cardChips = makeChips($("cardChips"), categories, loadCards);
function loadCards() {
  cards.list = shuffle(wordsIn(cardChips.value));
  cards.i = 0;
  showCard();
}
function showCard() {
  const w = cards.list[cards.i];
  const fc = $("flashcard");
  fc.classList.remove("flipped");
  fc.classList.toggle("known", known.has(w.en));
  $("cardTag").textContent = WORD_CAT.get(w.en);
  $("cardWord").textContent = w.en;
  $("cardTranscription").textContent = w.tr;
  $("cardTranslation").textContent = w.uz;
  $("cardExample").textContent = w.ex;
  $("cardCounter").textContent = `${cards.i + 1} / ${cards.list.length}`;
  $("cardBar").style.width = ((cards.i + 1) / cards.list.length) * 100 + "%";
}
function stepCard(d) {
  cards.i = (cards.i + d + cards.list.length) % cards.list.length;
  showCard();
}
$("flashcard").addEventListener("click", () => $("flashcard").classList.toggle("flipped"));
$("cardPrev").addEventListener("click", () => stepCard(-1));
$("cardNext").addEventListener("click", () => stepCard(1));
$("cardSpeak").addEventListener("click", () => speak(cards.list[cards.i].en));
$("cardKnow").addEventListener("click", () => {
  const w = cards.list[cards.i];
  if (!known.has(w.en)) toast(`✓ "${w.en}" o'rganildi`);
  known.add(w.en);
  store.set("known", [...known]);
  touchStreak();
  stepCard(1);
});
document.addEventListener("keydown", (e) => {
  if (!$("cards").classList.contains("active") || e.target.closest("button, input, select")) return;
  if (e.key === "ArrowRight") stepCard(1);
  if (e.key === "ArrowLeft") stepCard(-1);
  if (e.key === " ") { e.preventDefault(); $("flashcard").classList.toggle("flipped"); }
});
HOOKS.cards = (cat) => { if (cat) cardChips.set(cat); };
loadCards();

// ================= Test =================
const QUIZ_LEN = 10;
const quiz = { qs: [], i: 0, score: 0, pool: [], locked: false, timer: null };
const quizChips = makeChips($("quizChips"), categories, startQuiz);
function startQuiz() {
  clearTimeout(quiz.timer);
  quiz.pool = wordsIn(quizChips.value);
  quiz.qs = shuffle(quiz.pool).slice(0, QUIZ_LEN);
  quiz.i = 0;
  quiz.score = 0;
  showQuestion();
}
function showQuestion() {
  const total = quiz.qs.length;
  quiz.locked = false;
  $("quizBar").style.width = (quiz.i / total) * 100 + "%";
  $("quizStep").textContent = `Savol ${Math.min(quiz.i + 1, total)} / ${total}`;
  $("quizScore").textContent = `⭐ ${quiz.score}`;

  if (quiz.i >= total) {
    const pct = Math.round((quiz.score / total) * 100);
    if (pct > store.get("bestQuiz", 0)) store.set("bestQuiz", pct);
    touchStreak();
    const msg = pct >= 80 ? ["Ajoyib natija! 🎉", "Siz bu mavzuni juda yaxshi bilasiz."]
      : pct >= 50 ? ["Yaxshi! 👍", "Yana bir oz mashq qilsangiz, a'lo bo'ladi."]
      : ["Harakat qiling! 💪", "Avval kartochkalar bilan so'zlarni takrorlang."];
    $("quizBody").innerHTML = `<div class="result">
      <div class="ring" style="--p:${pct}"><span>${pct}%</span></div>
      <h3>${msg[0]}</h3><p>${quiz.score} / ${total} to'g'ri javob. ${msg[1]}</p>
      <button class="btn primary lg" id="quizAgain"><svg class="i"><use href="#i-refresh"/></svg> Yana bir marta</button></div>`;
    $("quizAgain").addEventListener("click", startQuiz);
    return;
  }

  const q = quiz.qs[quiz.i];
  const reverse = Math.random() < 0.5;
  const options = shuffle([q, ...shuffle(quiz.pool.filter((w) => w.en !== q.en)).slice(0, 3)]);
  $("quizBody").innerHTML = `
    <div class="quiz-dir muted">${reverse ? "Inglizcha tarjimasini tanlang" : "O'zbekcha tarjimasini tanlang"}</div>
    <div class="question">${esc(reverse ? q.uz : q.en)}</div>
    <div class="options">${options.map((o, k) => `<button class="option" data-ok="${o === q}"><span class="key">${k + 1}</span>${esc(reverse ? o.en : o.uz)}</button>`).join("")}</div>
    <div class="feedback" id="quizFeedback"></div>`;
  $("quizBody").querySelectorAll(".option").forEach((b) => b.addEventListener("click", () => answer(b, q, reverse)));
}
function answer(btn, q, reverse) {
  if (quiz.locked) return;
  quiz.locked = true;
  const ok = btn.dataset.ok === "true";
  document.querySelectorAll("#quizBody .option").forEach((b) => {
    b.disabled = true;
    if (b.dataset.ok === "true") b.classList.add("correct");
  });
  const fb = $("quizFeedback");
  if (ok) {
    quiz.score++;
    fb.textContent = "To'g'ri! ✓";
    fb.className = "feedback ok";
  } else {
    btn.classList.add("wrong");
    fb.textContent = `Noto'g'ri. To'g'ri javob: ${reverse ? q.en : q.uz}`;
    fb.className = "feedback bad";
  }
  $("quizScore").textContent = `⭐ ${quiz.score}`;
  speak(q.en);
  quiz.timer = setTimeout(() => { quiz.i++; showQuestion(); }, ok ? 900 : 1800);
}
document.addEventListener("keydown", (e) => {
  if (!$("quiz").classList.contains("active")) return;
  const n = parseInt(e.key, 10);
  const opts = document.querySelectorAll("#quizBody .option");
  if (n >= 1 && n <= opts.length) opts[n - 1].click();
});
$("quizRestart").addEventListener("click", startQuiz);
HOOKS.quiz = (cat) => { if (cat) quizChips.set(cat); };
startQuiz();

// ================= Tinglash =================
const listen = { word: null, right: 0, total: 0, hint: 0, locked: false };
const listenChips = makeChips($("listenChips"), categories, () => nextListen());
function nextListen() {
  const all = wordsIn(listenChips.value);
  let w;
  do { w = all[Math.floor(Math.random() * all.length)]; } while (all.length > 1 && w === listen.word);
  listen.word = w;
  listen.hint = 0;
  listen.locked = false;
  const input = $("listenInput");
  input.value = "";
  input.className = "";
  $("listenHint").textContent = "";
  $("listenFeedback").textContent = "";
  $("listenFeedback").className = "feedback";
  if ($("listen").classList.contains("active")) { input.focus(); speak(w.en); }
}
function checkListen() {
  if (listen.locked) return;
  const input = $("listenInput");
  const guess = input.value.trim().toLowerCase();
  if (!guess) { input.focus(); return; }
  listen.locked = true;
  listen.total++;
  const fb = $("listenFeedback");
  if (guess === listen.word.en.toLowerCase()) {
    listen.right++;
    fb.textContent = `To'g'ri! "${listen.word.en}" — ${listen.word.uz} ✓`;
    fb.className = "feedback ok";
    input.className = "ok";
    touchStreak();
  } else {
    fb.textContent = `To'g'ri javob: "${listen.word.en}" — ${listen.word.uz}`;
    fb.className = "feedback bad";
    input.className = "bad";
  }
  $("listenScore").textContent = `${listen.right} / ${listen.total}`;
  setTimeout(nextListen, 1800);
}
$("listenPlay").addEventListener("click", () => listen.word && speak(listen.word.en));
$("listenSlow").addEventListener("click", () => listen.word && speak(listen.word.en, 0.55));
$("listenCheck").addEventListener("click", checkListen);
$("listenSkip").addEventListener("click", nextListen);
$("listenHintBtn").addEventListener("click", () => {
  const w = listen.word.en;
  listen.hint = Math.min(listen.hint + 1, w.length);
  $("listenHint").textContent = w.split("").map((ch, i) => (i < listen.hint || ch === " " ? ch : "_")).join(" ");
});
$("listenInput").addEventListener("keydown", (e) => { if (e.key === "Enter") checkListen(); });
HOOKS.listen = (cat) => {
  if (cat) listenChips.set(cat);
  else if (!listen.word) nextListen();
  else setTimeout(() => speak(listen.word.en), 300);
};
nextListen();

// ================= Grammatika =================
$("grammarList").innerHTML = GRAMMAR.map((g, i) => `
  <details class="lesson card" ${i === 0 ? "open" : ""}>
    <summary><span class="num">${i + 1}</span><h3>${esc(g.title)}</h3><svg class="i chev"><use href="#i-right"/></svg></summary>
    <div class="body">
      <p>${esc(g.text)}</p>
      <div class="formula">${esc(g.formula)}</div>
      <div class="examples">${g.examples.map(([en, uz]) => `
        <div class="ex"><div><b>${esc(en)}</b><span>${esc(uz)}</span></div>
        <button data-say="${esc(en)}" aria-label="Tinglash"><svg class="i"><use href="#i-volume"/></svg></button></div>`).join("")}
      </div>
    </div>
  </details>`).join("");
$("grammarList").addEventListener("click", (e) => {
  const b = e.target.closest("[data-say]");
  if (b) speak(b.dataset.say);
});
HOOKS.grammar = (i) => {
  const all = document.querySelectorAll("#grammarList details");
  if (i !== undefined && all[i]) {
    all.forEach((d, k) => { d.open = k === +i; });
    setTimeout(() => all[i].scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }
};

// Barcha skriptlar yuklangach, joriy manzilni ochamiz
document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  route();
});
