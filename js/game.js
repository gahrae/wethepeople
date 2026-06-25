// Session orchestration across the four game modes.
import { pickCard, applyResult, levelInfo } from "./srs.js";
import { buildQuestion, buildScenarioQuestion } from "./questions.js";
import { markPlayedToday, getState, save, getCard, trainableSkills, getSettings, recordMistake } from "./store.js";
import { checkAchievements } from "./achievements.js";
import { BY_N } from "./content.js";

export const MODES = {
  practice: {
    label: "Daily Practice",
    icon: "🎯",
    blurb: "Adaptive spaced repetition. The engine picks what's due and what's weak.",
    roundLen: 7,
  },
  learn: {
    label: "Learn",
    icon: "📚",
    blurb: "Gentle and generous. Context after every answer, frequent sidebars, no penalty.",
    roundLen: 7,
  },
  situational: {
    label: "Situational",
    icon: "🧭",
    blurb: "Real-life stories only. Which right is in play — and what happens?",
    roundLen: 7,
  },
  survival: {
    label: "Survival",
    icon: "💀",
    blurb: "Adaptive stream. One wrong answer ends the run. Beat your high score.",
    roundLen: Infinity,
  },
};

let session = null;
export const getSession = () => session;

export function startSession(mode, focusN = null, opts = {}) {
  markPlayedToday();
  const len = mode === "survival" ? Infinity : getSettings().roundLength || 7;
  session = {
    mode,
    focusN, // when set, drill this one amendment
    reviewOnly: !!opts.reviewOnly, // only draw cards that are due for review
    pool: mode === "mistakes" ? getState().global.mistakes.map((m) => ({ n: m.n, skill: m.skill })) : null,
    recentKeys: [],
    asked: new Set(), // signatures of every question shown this round (no repeats)
    askedCards: new Set(), // card keys already used (spreads coverage)
    lastSig: null,
    lapse: [], // {n, skill} to resurface after a miss
    sinceLapse: 0,
    answered: 0,
    correct: 0,
    streak: 0, // survival streak
    alive: true,
    exhausted: false,
    roundLen: len,
  };
  checkAchievements(); // streak/day-based badges can unlock just by showing up
  return session;
}

// Choose a skill for a focused amendment, biased toward its weakest skill.
function focusSkill(n) {
  const sks = trainableSkills(BY_N[n]);
  const weights = sks.map((sk) => ({ sk, w: 1 + (100 - getCard(n, sk).mastery) / 100 * 3 }));
  let r = Math.random() * weights.reduce((s, x) => s + x.w, 0);
  for (const x of weights) {
    r -= x.w;
    if (r <= 0) return x.sk;
  }
  return sks[0];
}

// A signature identifying the *exact* question (so two different cloze blanks or
// scenarios about one amendment count as distinct, but the same one repeated
// does not). Used to guarantee a question never repeats within a test set.
function qsig(q) {
  switch (q.type) {
    case "cloze": return `cz:${q.n}:${q.choices[q.answer]}`; // the blanked phrase
    case "type": return `ty:${q.n}`;
    case "identify": return `id:${q.n}`;
    case "scenario-which": return `sw:${q.prompt}`;
    case "scenario-how": return `sh:${q.prompt}`;
    case "applies": return `ap:${q.n}:${q.choices[q.answer]}`; // the correct scenario
    case "which-clause": return `wc:${q.prompt}`;
    default: return `${q.type}:${q.n}`;
  }
}

// Build with a builder, retrying until the result is one we haven't shown this
// round. Returns null if no fresh question can be produced (no reset).
function tryFresh(builder, recordCard) {
  for (let i = 0; i < 32; i++) {
    const q = builder();
    if (!q) return null;
    const sig = qsig(q);
    if (!session.asked.has(sig)) {
      session.asked.add(sig);
      session.lastSig = sig;
      if (recordCard) session.askedCards.add(`${q.n}:${q.skill}`);
      return tag(q);
    }
  }
  return null;
}

// Like tryFresh, but if the distinct-question pool is exhausted (long Survival
// run, or a tiny focused amendment), soft-reset the seen-set so play continues
// while still avoiding an immediate back-to-back repeat.
function emit(builder, recordCard) {
  const fresh = tryFresh(builder, recordCard);
  if (fresh) return fresh;
  session.askedCards = new Set();
  for (let i = 0; i < 10; i++) {
    const q = builder();
    if (!q) return null;
    const sig = qsig(q);
    if (sig !== session.lastSig) {
      session.asked = new Set([sig]);
      session.lastSig = sig;
      if (recordCard) session.askedCards = new Set([`${q.n}:${q.skill}`]);
      return tag(q);
    }
  }
  const q = builder();
  if (!q) return null;
  session.asked = new Set([qsig(q)]);
  session.lastSig = qsig(q);
  return tag(q);
}

export function nextQuestion() {
  if (!session) return null;

  // Resurface a lapsed item — but only as a *different* question about that card,
  // never a byte-identical repeat. If we can't vary it, drop the lapse.
  if (session.lapse.length && session.sinceLapse >= 2) {
    const item = session.lapse[0];
    const q = tryFresh(() => buildQuestion(item.n, item.skill, { focus: !!session.focusN }), false);
    if (q) {
      session.lapse.shift();
      session.sinceLapse = 0;
      return q;
    }
    session.lapse.shift(); // no fresh variant available → don't repeat; pick normally
  }
  session.sinceLapse++;

  if (session.mode === "mistakes") {
    return emit(() => {
      const fresh = session.pool.filter((c) => !session.askedCards.has(`${c.n}:${c.skill}`));
      const from = fresh.length ? fresh : session.pool;
      if (!from.length) return null;
      const c = from[Math.floor(Math.random() * from.length)];
      return buildQuestion(c.n, c.skill);
    }, true);
  }

  if (session.focusN) {
    return emit(() => buildQuestion(session.focusN, focusSkill(session.focusN), { focus: true }), false);
  }

  if (session.reviewOnly) {
    if (!pickCard({ dueOnly: true })) {
      session.exhausted = true;
      return null; // no more due cards → round ends
    }
    return emit(() => {
      const ex = new Set([...session.recentKeys, ...session.askedCards]);
      const c = pickCard({ excludeKeys: ex, dueOnly: true }) || pickCard({ dueOnly: true });
      return c ? buildQuestion(c.n, c.skill) : null;
    }, true);
  }

  const situational = session.mode === "situational";
  return emit(() => {
    const ex = new Set([...session.recentKeys, ...session.askedCards]);
    const c = situational
      ? pickCard({ excludeKeys: ex, scenarioOnly: true }) || pickCard({ scenarioOnly: true })
      : pickCard({ excludeKeys: ex }) || pickCard({});
    if (!c) return null;
    return situational ? buildScenarioQuestion(c.n, c.skill) : buildQuestion(c.n, c.skill);
  }, true);
}

function tag(q) {
  q.key = `${q.n}:${q.skill}`;
  return q;
}

// Grade an answered question.
// Returns { correct, xp, gameOver, leveledUp, newAchievements }.
export function submit(q, correct) {
  const lvlBefore = levelInfo().level;
  const xp = applyResult(q.n, q.skill, correct);
  recordMistake(q, correct); // add on a miss, clear on a make
  session.answered++;
  if (correct) {
    session.correct++;
    session.streak++;
  } else {
    session.lapse.push({ n: q.n, skill: q.skill });
  }
  // recency window
  session.recentKeys.push(q.key);
  if (session.recentKeys.length > 4) session.recentKeys.shift();

  let gameOver = false;
  if (session.mode === "survival" && !correct) {
    session.alive = false;
    gameOver = true;
    const g = getState().global;
    if (session.streak > g.survivalBest) g.survivalBest = session.streak;
    save();
  }

  // A round counts as "perfect" the moment its last answer lands clean.
  const willComplete = gameOver || (session.mode !== "survival" && session.answered >= session.roundLen);
  const perfectRound =
    session.mode !== "survival" && willComplete && session.correct === session.answered && session.answered > 0;
  const newAchievements = checkAchievements({ perfectRound });
  const leveledUp = levelInfo().level > lvlBefore;
  return { correct, xp, gameOver, leveledUp, newAchievements };
}

// Whether the current round is complete (non-survival modes, or review exhausted).
export function roundComplete() {
  if (!session) return false;
  if (session.reviewOnly && session.exhausted) return true;
  return session.answered >= session.roundLen;
}
