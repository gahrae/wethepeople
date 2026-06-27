// All rendering + event wiring. Renders into #app; lightweight router.
import { AMENDMENTS, BY_N } from "./content.js";
import {
  SKILL_META,
  getCard,
  getState,
  trainableSkills,
  resetAll,
  getSettings,
  saveSettings,
  answersToday,
} from "./store.js";
import { overallMastery, tier, levelInfo, dueCount } from "./srs.js";
import { amendmentLabel, textSimilarity } from "./questions.js";
import { MODES, startSession, nextQuestion, submit, roundComplete, getSession } from "./game.js";
import { ACHIEVEMENTS, byId } from "./achievements.js";
import { speak, stopSpeak, speechSupported, sndCorrect, sndWrong, sndLevel, listVoices, onVoices } from "./audio.js";

const app = () => document.getElementById("app");
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let curQ = null;
let keyHandler = null; // active keyboard handler for the current view

// ---- init / global keyboard --------------------------------------------

export function initUI() {
  if (!document.getElementById("toasts")) {
    const t = document.createElement("div");
    t.id = "toasts";
    document.body.appendChild(t);
  }
  document.addEventListener("keydown", (e) => {
    if (keyHandler) keyHandler(e);
  });
}
const setKeys = (fn) => {
  keyHandler = fn;
};

// Turn a speak button into a play/stop toggle that reflects playback state.
function wireSpeakButton(btn, text) {
  if (!btn) return;
  const idle = btn.innerHTML;
  const reset = () => {
    btn.classList.remove("speaking");
    btn.innerHTML = idle;
  };
  btn.addEventListener("click", () => {
    if (btn.classList.contains("speaking")) {
      stopSpeak();
      reset();
      return;
    }
    const started = speak(text, { onend: reset });
    if (started) {
      btn.classList.add("speaking");
      btn.innerHTML = "⏹ Stop";
    }
  });
}

export function toast(icon, title, sub = "") {
  const box = document.getElementById("toasts");
  if (!box) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span class="toast-ico">${icon}</span><span><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</span>`;
  box.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 400);
  }, 3200);
}

// ---- shared bits -------------------------------------------------------

function topBar() {
  const g = getState().global;
  const lvl = levelInfo();
  const avg = Math.round(AMENDMENTS.reduce((s, a) => s + overallMastery(a.n), 0) / AMENDMENTS.length);
  return `
  <header class="topbar">
    <button class="brand" data-nav="home">★ We&nbsp;the&nbsp;People</button>
    <div class="meters">
      <div class="meter" title="Overall mastery across all 27 amendments">
        <span class="meter-num">${avg}%</span><span class="meter-lbl">mastery</span>
      </div>
      <div class="meter flame ${g.streakDays ? "on" : ""}" title="Day streak">
        <span class="meter-num">🔥 ${g.streakDays}</span><span class="meter-lbl">streak</span>
      </div>
      <div class="meter level" title="Level ${lvl.level} — ${lvl.into}/${lvl.span} XP">
        <span class="meter-num">Lv ${lvl.level}</span>
        <span class="xpbar"><i style="width:${lvl.pct}%"></i></span>
      </div>
      <button class="link" data-nav="stats">Stats</button>
      <button class="link" data-nav="settings">⚙</button>
    </div>
  </header>`;
}

function ring(n) {
  const m = Math.round(overallMastery(n));
  return `<div class="ring tier-${tier(m)}" style="--p:${m}"><span>${n}</span></div>`;
}

// ---- home / board ------------------------------------------------------

export function showHome() {
  stopSpeak();
  setKeys(null);
  const due = dueCount();
  const goal = getSettings().dailyGoal || 0;
  const today = answersToday();
  const goalPct = goal ? Math.min(100, Math.round((today / goal) * 100)) : 0;

  const dueBanner = due
    ? `<button class="due-banner" data-review="1">
         <span class="due-n">${due}</span>
         <span><b>${due === 1 ? "card" : "cards"} due for review</b><small>Spaced-repetition picks — clear them to lock in what's fading.</small></span>
         <span class="due-go">Review →</span>
       </button>`
    : `<div class="due-banner calm"><span class="due-ico">✓</span><span><b>All caught up on reviews</b><small>Nothing due right now. Practice freely or learn something new.</small></span></div>`;

  const goalBar = goal
    ? `<div class="goal">
         <span class="goal-lbl">Today's goal</span>
         <span class="bar"><i class="${today >= goal ? "tier-mastered" : "tier-gold"}" style="width:${goalPct}%"></i></span>
         <span class="goal-num">${today}/${goal}${today >= goal ? " ✓" : ""}</span>
       </div>`
    : "";
  const mistakeN = getState().global.mistakes.length;
  const mistakeLink = mistakeN
    ? `<button class="secondary-link" data-nav="mistakes">🩹 Review ${mistakeN} mistake${mistakeN > 1 ? "s" : ""} →</button>`
    : "";

  const modeCards = Object.entries(MODES)
    .map(
      ([k, m]) => `
      <button class="mode-card" data-mode="${k}">
        <span class="mode-ico">${m.icon}</span>
        <span class="mode-name">${m.label}</span>
        <span class="mode-blurb">${m.blurb}</span>
      </button>`
    )
    .join("");

  const groups = ["Bill of Rights", "Reconstruction Amendments", "Later Amendments"];
  const board = groups
    .map((grp) => {
      const tiles = AMENDMENTS.filter((a) => a.group === grp)
        .map(
          (a) => `
        <button class="tile" data-detail="${a.n}" title="${esc(a.short)}: ${esc(a.title)}">
          ${ring(a.n)}
          <span class="tile-title">${esc(a.title)}</span>
        </button>`
        )
        .join("");
      return `<div class="board-group"><h3>${grp}</h3><div class="board">${tiles}</div></div>`;
    })
    .join("");

  app().innerHTML = `
    ${topBar()}
    <main class="wrap">
      <section class="hero">
        <h1>Know your rights.</h1>
        <p>Bite-sized, adaptive drills on the 27 amendments — the exact words, which one applies, and the history behind them.</p>
      </section>
      ${dueBanner}
      ${goalBar}
      ${mistakeLink}
      <section class="modes">${modeCards}</section>
      <h2 class="section-h">Your Constitution</h2>
      <p class="muted">Each ring fills as you master an amendment — and fades if you let it go stale. The game steers practice toward your weak spots.</p>
      ${board}
    </main>`;
}

export function startReview() {
  startSession("practice", null, { reviewOnly: true });
  renderSessionShell();
  loadNext();
}

export function startMistakes() {
  if (!getState().global.mistakes.length) return showMistakes();
  startSession("mistakes");
  renderSessionShell();
  loadNext();
}

export function showMistakes() {
  stopSpeak();
  setKeys(null);
  const m = getState().global.mistakes.slice().reverse(); // most-recent first
  const list = m.length
    ? m
        .map(
          (x) => `
        <li class="mistake">
          <button class="link" data-detail="${x.n}">${esc(BY_N[x.n].short)}</button>
          <span class="mskill">${SKILL_META[x.skill].icon} ${SKILL_META[x.skill].label}</span>
          <span class="mprompt">${esc((x.prompt || x.title || "").slice(0, 110))}${(x.prompt || "").length > 110 ? "…" : ""}</span>
        </li>`
        )
        .join("")
    : `<p class="muted">No outstanding mistakes — nice. Anything you miss will collect here until you get it right.</p>`;
  app().innerHTML = `
    ${topBar()}
    <main class="wrap detail">
      <button class="link back" data-nav="home">← Back</button>
      <h1>Review your mistakes <small class="muted">${m.length}</small></h1>
      <p class="muted">Cards you've missed and not yet redeemed. Answer one correctly and it clears itself.</p>
      ${m.length ? `<button class="primary big" data-mistakes="1">Practice these (${m.length})</button>` : ""}
      <ul class="weakest mistakes-list">${list}</ul>
    </main>`;
}

// ---- amendment detail --------------------------------------------------

export function showDetail(n) {
  stopSpeak();
  setKeys(null);
  const a = BY_N[n];
  const bars = trainableSkills(a)
    .map((sk) => {
      const c = getCard(n, sk);
      const m = Math.round(c.mastery);
      const meta = SKILL_META[sk];
      return `
      <div class="skill-row">
        <span class="skill-lbl">${meta.icon} ${meta.label}<small>${meta.blurb}</small></span>
        <span class="bar"><i class="tier-${tier(m)}" style="width:${m}%"></i></span>
        <span class="skill-pct">${m}%</span>
      </div>`;
    })
    .join("");

  const cases = (a.cases || [])
    .map((c) => `<li><b>${esc(c.name)}</b> (${c.year}) — ${esc(c.holding)}</li>`)
    .join("");

  const speakBtn = speechSupported()
    ? `<button class="speak-btn" data-speak="${n}" title="Read the text aloud">🔊 Hear it</button>`
    : "";

  app().innerHTML = `
    ${topBar()}
    <main class="wrap detail">
      <button class="link back" data-nav="home">← Back</button>
      <div class="detail-head">
        ${ring(n)}
        <div>
          <h1>${esc(a.short)}</h1>
          <p class="muted">${esc(a.title)} · ratified ${a.year} · ${esc(a.group)}</p>
        </div>
      </div>
      <blockquote class="amendment-text">${esc(a.text)}</blockquote>
      ${speakBtn}
      <div class="skills">${bars}</div>
      <div class="sidebar-card">
        <h3>Why it exists</h3>
        <p>${esc(a.why)}</p>
        ${cases ? `<h3>Landmark cases</h3><ul class="cases">${cases}</ul>` : ""}
      </div>
      <button class="primary big" data-practice="${n}">Practice this amendment</button>
    </main>`;
  wireSpeakButton(document.querySelector("[data-speak]"), a.text);
}

// ---- session -----------------------------------------------------------

export function startMode(mode, focusN = null) {
  startSession(mode, focusN);
  renderSessionShell();
  loadNext();
}

function sessionProgress() {
  const s = getSession();
  if (s.reviewOnly) {
    return `<span class="pill">♻️ Review</span> <span class="pill ghost">Answered ${s.answered}</span>`;
  }
  if (s.mode === "mistakes") {
    return `<span class="pill">🩹 Mistakes</span> <span class="pill ghost">Question ${Math.min(s.answered + 1, s.roundLen)}/${s.roundLen}</span>`;
  }
  if (s.mode === "survival") {
    const best = getState().global.survivalBest;
    return `<span class="pill">💀 Survival</span> <span class="pill streak">Streak ${s.streak}</span> <span class="pill ghost">Best ${best}</span>`;
  }
  return `<span class="pill">${MODES[s.mode].icon} ${MODES[s.mode].label}</span> <span class="pill ghost">Question ${Math.min(
    s.answered + 1,
    s.roundLen
  )}/${s.roundLen}</span>`;
}

function renderSessionShell() {
  app().innerHTML = `
    ${topBar()}
    <main class="wrap session">
      <div class="session-bar">${sessionProgress()}<button class="link" data-nav="home">Quit</button></div>
      <div id="q-area"></div>
    </main>`;
}

function loadNext() {
  curQ = nextQuestion();
  document.querySelector(".session-bar").innerHTML =
    sessionProgress() + `<button class="link" data-nav="home">Quit</button>`;
  if (!curQ) {
    if (getSession().reviewOnly) return showSummary();
    document.getElementById("q-area").innerHTML = `<p>No questions available.</p>`;
    return;
  }
  renderQuestion(curQ);
}

function renderQuestion(q) {
  const area = document.getElementById("q-area");
  const skillTag = `<span class="qskill">${SKILL_META[q.skill].icon} ${SKILL_META[q.skill].label}</span>`;

  if (q.type === "type") {
    area.innerHTML = `
      <div class="qcard">
        <div class="qhead">${skillTag}<h2>${esc(q.title)}</h2></div>
        <p class="qprompt">${esc(q.prompt)}</p>
        <textarea id="type-input" rows="4" placeholder="Type the amendment text…  (Ctrl+Enter to check)"></textarea>
        <button class="primary" id="grade-btn">Check my answer</button>
        <div id="feedback"></div>
      </div>`;
    const grade = () => {
      const val = document.getElementById("type-input").value;
      const sim = textSimilarity(val, q.answerText);
      showFeedback(q, sim >= 0.85, { simPct: Math.round(sim * 100) });
    };
    document.getElementById("grade-btn").addEventListener("click", grade);
    const ti = document.getElementById("type-input");
    ti.focus();
    setKeys((e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        grade();
      }
    });
    return;
  }

  const choices = q.choices
    .map(
      (c, i) =>
        `<button class="choice" data-choice="${i}"><kbd>${i + 1}</kbd><span>${esc(c)}</span></button>`
    )
    .join("");
  area.innerHTML = `
    <div class="qcard">
      <div class="qhead">${skillTag}<h2>${esc(q.title)}</h2></div>
      <p class="qprompt">${esc(q.prompt)}</p>
      <div class="choices">${choices}</div>
      <div id="feedback"></div>
    </div>`;

  const select = (i) => showFeedback(q, i === q.answer, { picked: i });
  area.querySelectorAll(".choice").forEach((btn) =>
    btn.addEventListener("click", () => select(Number(btn.dataset.choice)))
  );
  setKeys((e) => {
    const i = Number(e.key) - 1;
    if (i >= 0 && i < q.choices.length) {
      e.preventDefault();
      select(i);
    }
  });
}

function maybeSidebar(q, correct) {
  const s = getSession();
  const show = s.mode === "learn" || (correct && Math.random() < 0.22);
  if (!show) return "";
  const a = BY_N[q.n];
  const oneCase = a.cases && a.cases.length ? a.cases[0] : null;
  return `
    <div class="sidebar-card inline">
      <span class="sidebar-tag">Sidebar · ${esc(a.short)}</span>
      <p>${esc(a.why)}</p>
      ${oneCase ? `<p class="case"><b>${esc(oneCase.name)}</b> (${oneCase.year}) — ${esc(oneCase.holding)}</p>` : ""}
    </div>`;
}

function showFeedback(q, correct, extra = {}) {
  const res = submit(q, correct);
  if (correct) sndCorrect();
  else sndWrong();
  if (res.leveledUp) {
    sndLevel();
    toast("⭐", `Level ${levelInfo().level}!`, "Keep it going.");
  }
  (res.newAchievements || []).forEach((a) => toast(a.icon, `Unlocked: ${a.name}`, a.desc));

  document.querySelectorAll(".choice").forEach((btn) => {
    btn.disabled = true;
    const i = Number(btn.dataset.choice);
    if (i === q.answer) btn.classList.add("right");
    if (i === extra.picked && i !== q.answer) btn.classList.add("wrong");
  });
  const gb = document.getElementById("grade-btn");
  if (gb) gb.disabled = true;
  const ti = document.getElementById("type-input");
  if (ti) ti.disabled = true;

  const verdict = correct
    ? `<span class="verdict ok">✓ Correct${res.xp ? ` &nbsp;+${res.xp} XP` : ""}</span>`
    : `<span class="verdict no">✗ Not quite</span>`;
  const simNote =
    extra.simPct != null
      ? `<p class="muted">Match: ${extra.simPct}%. The exact text:</p><blockquote class="amendment-text small">${esc(q.answerText)}</blockquote>`
      : "";
  const whyWrong =
    !correct && q.whyByChoice && extra.picked != null && q.whyByChoice[extra.picked]
      ? `<p class="why-wrong"><b>Your answer —</b> ${esc(q.whyByChoice[extra.picked])}</p>`
      : "";
  const hearBtn = speechSupported()
    ? `<button class="speak-btn small" id="hear-text">🔊 Hear the exact text</button>`
    : "";
  const nextLabel = res.gameOver ? "See results →" : roundComplete() ? "Round complete →" : "Continue →";

  document.getElementById("feedback").innerHTML = `
    <div class="feedback ${correct ? "ok" : "no"}">
      ${verdict}
      ${simNote}
      ${whyWrong}
      <p class="explain">${esc(q.explain)}</p>
      ${q.caseRef ? `<p class="case-ref"><span class="case-tag">Key case</span> <b>${esc(q.caseRef.name)}</b> (${q.caseRef.year}) — ${esc(q.caseRef.holding)}</p>` : ""}
      <p class="explain ref"><button class="link" data-detail="${q.n}">Open ${esc(BY_N[q.n].short)} ↗</button> ${hearBtn}</p>
      ${maybeSidebar(q, correct)}
      <button class="primary" id="cont">${nextLabel}</button>
    </div>`;

  wireSpeakButton(document.getElementById("hear-text"), BY_N[q.n].text);

  const cont = document.getElementById("cont");
  cont.focus();
  const advance = () => {
    stopSpeak();
    if (res.gameOver) return showGameOver();
    if (roundComplete()) return showSummary();
    renderSessionShell();
    loadNext();
  };
  cont.addEventListener("click", advance);
  setKeys((e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
      e.preventDefault();
      advance();
    }
  });
}

function showSummary() {
  setKeys(null);
  const s = getSession();
  const acc = Math.round((s.correct / Math.max(1, s.answered)) * 100);
  const title = s.reviewOnly ? "Reviews cleared ♻️" : "Round complete 🎉";
  const sub = s.reviewOnly
    ? "You refreshed everything that was fading. Come back when more comes due."
    : "Nice work — every answer nudged your mastery and scheduled your next review.";
  document.getElementById("q-area").innerHTML = `
    <div class="qcard center">
      <h2>${title}</h2>
      <p class="big-stat">${s.correct}/${s.answered} correct · ${acc}%</p>
      <p class="muted">${esc(sub)}</p>
      <div class="row">
        <button class="primary" data-mode="${s.mode}">One more round</button>
        <button class="link" data-nav="home">Home</button>
      </div>
    </div>`;
}

function showGameOver() {
  setKeys(null);
  const s = getSession();
  const best = getState().global.survivalBest;
  const isRecord = s.streak >= best && s.streak > 0;
  document.getElementById("q-area").innerHTML = `
    <div class="qcard center">
      <h2>💀 Run over</h2>
      <p class="big-stat">Streak: ${s.streak}</p>
      <p class="muted">${isRecord ? "🏆 New personal best!" : `Best: ${best}`}</p>
      <div class="row">
        <button class="primary" data-mode="survival">Try again</button>
        <button class="link" data-nav="home">Home</button>
      </div>
    </div>`;
}

// ---- stats: heatmap + trend + tiers + achievements + weakest ------------

function activityByDay(days = 84) {
  const map = new Map();
  for (const h of getState().history) {
    const k = new Date(h.t).toISOString().slice(0, 10);
    map.set(k, (map.get(k) || 0) + 1);
  }
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({ n: map.get(d.toISOString().slice(0, 10)) || 0, dow: d.getDay() });
  }
  return out;
}

function heatmapHTML() {
  const days = activityByDay(84);
  const level = (n) => (n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 10 ? 3 : 4);
  const pad = days[0].dow; // align first column to the right weekday row
  const cells = [];
  for (let i = 0; i < pad; i++) cells.push(`<span class="hm hpad"></span>`);
  for (const d of days) cells.push(`<span class="hm l${level(d.n)}" title="${d.n} answered"></span>`);
  return `<div class="heatmap">${cells.join("")}</div>
    <div class="hm-legend"><span>less</span><span class="hm l0"></span><span class="hm l1"></span><span class="hm l2"></span><span class="hm l3"></span><span class="hm l4"></span><span>more</span></div>`;
}

function trendHTML() {
  const h = getState().history;
  if (h.length < 5) return `<p class="muted">Answer a few more questions to see your accuracy trend.</p>`;
  const W = Math.min(10, h.length);
  const pts = [];
  for (let i = W - 1; i < h.length; i++) {
    let c = 0;
    for (let j = i - W + 1; j <= i; j++) if (h[j].correct) c++;
    pts.push(c / W);
  }
  const N = pts.length;
  const coords = pts.map((p, i) => `${(i / Math.max(1, N - 1)) * 100},${(1 - p) * 30}`).join(" ");
  const last = Math.round(pts[pts.length - 1] * 100);
  return `
    <svg class="trend" viewBox="0 0 100 30" preserveAspectRatio="none" aria-label="accuracy trend">
      <line x1="0" y1="15" x2="100" y2="15" class="trend-mid" />
      <polyline points="${coords}" />
    </svg>
    <p class="muted">Rolling accuracy over your last ${N} answers — currently <b>${last}%</b> (10-question window).</p>`;
}

export function showStats() {
  stopSpeak();
  setKeys(null);
  const g = getState().global;
  const acc = g.totalAnswered ? Math.round((g.totalCorrect / g.totalAnswered) * 100) : 0;
  const ranked = AMENDMENTS.map((a) => ({ a, m: overallMastery(a.n) })).sort((x, y) => x.m - y.m);
  const weakest = ranked
    .slice(0, 5)
    .map(
      (r) =>
        `<li><button class="link" data-detail="${r.a.n}">${esc(r.a.short)}</button> <span class="bar mini"><i class="tier-${tier(r.m)}" style="width:${Math.round(r.m)}%"></i></span> ${Math.round(r.m)}%</li>`
    )
    .join("");
  const tierCounts = { mastered: 0, gold: 0, silver: 0, bronze: 0, locked: 0 };
  AMENDMENTS.forEach((a) => tierCounts[tier(overallMastery(a.n))]++);

  const unlocked = new Set(g.achievements || []);
  const badges = ACHIEVEMENTS.map(
    (a) =>
      `<div class="badge ${unlocked.has(a.id) ? "on" : "off"}" title="${esc(a.desc)}">
         <span class="badge-ico">${a.icon}</span>
         <span class="badge-name">${esc(a.name)}</span>
         <span class="badge-desc">${esc(a.desc)}</span>
       </div>`
  ).join("");

  app().innerHTML = `
    ${topBar()}
    <main class="wrap detail">
      <button class="link back" data-nav="home">← Back</button>
      <h1>Your progress</h1>
      <div class="stat-grid">
        <div class="stat"><b>${g.totalAnswered}</b><span>answered</span></div>
        <div class="stat"><b>${acc}%</b><span>accuracy</span></div>
        <div class="stat"><b>${g.survivalBest}</b><span>survival best</span></div>
        <div class="stat"><b>${g.streakDays}</b><span>day streak</span></div>
      </div>

      <h3>Activity — last 12 weeks</h3>
      ${heatmapHTML()}

      <h3>Accuracy trend</h3>
      ${trendHTML()}

      <h3>Tier breakdown</h3>
      <div class="tier-bar">
        ${["mastered", "gold", "silver", "bronze", "locked"]
          .map((t) => `<span class="tchip tier-${t}">${t} ${tierCounts[t]}</span>`)
          .join("")}
      </div>

      <h3>Achievements <small class="muted">${unlocked.size}/${ACHIEVEMENTS.length}</small></h3>
      <div class="badges">${badges}</div>

      <h3>Focus next — your weakest five</h3>
      <ul class="weakest">${weakest}</ul>

      ${g.mistakes.length ? `<p><button class="link" data-nav="mistakes">🩹 Review your ${g.mistakes.length} outstanding mistake${g.mistakes.length > 1 ? "s" : ""} →</button></p>` : ""}

      <button class="link danger" id="reset">Reset all progress</button>
    </main>`;
  document.getElementById("reset").addEventListener("click", () => {
    if (confirm("Erase all progress and start over?")) {
      resetAll();
      showHome();
    }
  });
}

// ---- settings ----------------------------------------------------------

export function showSettings() {
  stopSpeak();
  setKeys(null);
  const s = getSettings();
  const roundOpts = [5, 7, 10, 15]
    .map((v) => `<option value="${v}" ${s.roundLength === v ? "selected" : ""}>${v} questions</option>`)
    .join("");
  app().innerHTML = `
    ${topBar()}
    <main class="wrap detail settings">
      <button class="link back" data-nav="home">← Back</button>
      <h1>Settings</h1>

      <div class="set-row">
        <label for="set-round"><b>Round length</b><small>Questions per round in Practice, Learn & Situational.</small></label>
        <select id="set-round">${roundOpts}</select>
      </div>

      <div class="set-row">
        <label for="set-goal"><b>Daily goal</b><small>Questions per day, shown on the home screen.</small></label>
        <input id="set-goal" type="number" min="0" max="500" value="${s.dailyGoal}" />
      </div>

      <div class="set-row">
        <label for="set-type"><b>Type-the-text questions</b><small>Occasionally ask you to type an amendment's full text from memory. Off = multiple-choice recall only.</small></label>
        <input id="set-type" type="checkbox" class="switch" ${s.typeText ? "checked" : ""} />
      </div>

      <div class="set-row">
        <label for="set-sound"><b>Sound effects</b><small>Subtle cues for correct, wrong, and level-up.</small></label>
        <input id="set-sound" type="checkbox" class="switch" ${s.sound ? "checked" : ""} />
      </div>

      <div class="set-row">
        <label for="set-speech"><b>Read-aloud</b><small>Enable the 🔊 buttons that speak the exact text.${speechSupported() ? "" : " (Not supported in this browser.)"}</small></label>
        <input id="set-speech" type="checkbox" class="switch" ${s.speech ? "checked" : ""} ${speechSupported() ? "" : "disabled"} />
      </div>

      ${speechSupported() ? `
      <div class="set-row">
        <label for="set-voice"><b>Voice</b><small>Quality varies a lot by browser — Chrome &amp; Edge sound best, Firefox is rough. Pick one and sample it.</small></label>
        <div class="voice-controls">
          <select id="set-voice"><option value="">Auto (recommended)</option></select>
          <button class="speak-btn small" id="voice-sample">▶ Sample</button>
        </div>
      </div>` : ""}

      <p class="muted">Changes save automatically.</p>
    </main>`;

  const round = document.getElementById("set-round");
  round.addEventListener("change", () => saveSettings({ roundLength: Number(round.value) }));
  const goal = document.getElementById("set-goal");
  goal.addEventListener("change", () =>
    saveSettings({ dailyGoal: Math.max(0, Math.min(500, Number(goal.value) || 0)) })
  );
  const typeT = document.getElementById("set-type");
  typeT.addEventListener("change", () => saveSettings({ typeText: typeT.checked }));
  const sound = document.getElementById("set-sound");
  sound.addEventListener("change", () => saveSettings({ sound: sound.checked }));
  const speech = document.getElementById("set-speech");
  speech.addEventListener("change", () => saveSettings({ speech: speech.checked }));

  // Voice picker + sampler
  const voiceSel = document.getElementById("set-voice");
  if (voiceSel) {
    const fillVoices = () => {
      const cur = getSettings().voiceURI || "";
      voiceSel.innerHTML =
        `<option value="">Auto (recommended)</option>` +
        listVoices()
          .map(
            (v) =>
              `<option value="${esc(v.voiceURI)}" ${v.voiceURI === cur ? "selected" : ""}>${esc(v.name)} (${esc(v.lang)})${v.default ? " — default" : ""}</option>`
          )
          .join("");
    };
    fillVoices();
    onVoices(fillVoices); // repopulate when voices arrive async (Chrome)
    voiceSel.addEventListener("change", () => saveSettings({ voiceURI: voiceSel.value }));

    const sampleBtn = document.getElementById("voice-sample");
    const SAMPLE =
      "Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof.";
    const resetSample = () => {
      sampleBtn.classList.remove("speaking");
      sampleBtn.innerHTML = "▶ Sample";
    };
    sampleBtn.addEventListener("click", () => {
      if (sampleBtn.classList.contains("speaking")) {
        stopSpeak();
        resetSample();
        return;
      }
      const started = speak(SAMPLE, { voiceURI: voiceSel.value || undefined, force: true, onend: resetSample });
      if (started) {
        sampleBtn.classList.add("speaking");
        sampleBtn.innerHTML = "⏹ Stop";
      }
    });
  }
}
