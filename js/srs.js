// The adaptive core: Leitner boxes + continuous mastery + a weighted-lottery
// question selector that leans toward weak and overdue cards.
import { SKILL_META, getCard, getState, save, trainableSkills } from "./store.js";
import { AMENDMENTS, BY_N } from "./content.js";

const HOUR = 3600e3;
const DAY = 24 * HOUR;
const INTERVALS = [4 * HOUR, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];

// Time-based decay: once a card passes its due date, its effective mastery
// fades (one scheduled interval overdue ≈ one half-life). This keeps the board
// honest — knowledge you haven't refreshed in months stops looking "mastered."
function decayed(card, now) {
  if (!card || card.mastery <= 0 || !card.due || !card.lastSeen) return card ? card.mastery : 0;
  if (now <= card.due) return card.mastery;
  const interval = Math.max(card.due - card.lastSeen, 3600e3);
  const halfLives = (now - card.due) / interval;
  return card.mastery * Math.pow(0.5, halfLives);
}

export function currentMastery(n, skill, now = Date.now()) {
  return decayed(getCard(n, skill), now);
}

export function isDue(card, now = Date.now()) {
  return !!(card && card.seen > 0 && card.due && now >= card.due);
}

export function dueCards(now = Date.now()) {
  const out = [];
  for (const a of AMENDMENTS) {
    for (const sk of trainableSkills(a)) {
      if (isDue(getCard(a.n, sk), now)) out.push({ n: a.n, skill: sk });
    }
  }
  return out;
}
export function dueCount() {
  return dueCards().length;
}

export function overallMastery(n) {
  const a = BY_N[n];
  const sks = trainableSkills(a);
  const now = Date.now();
  let sum = 0;
  let w = 0;
  for (const sk of sks) {
    const wt = SKILL_META[sk].weight;
    sum += decayed(getCard(n, sk), now) * wt;
    w += wt;
  }
  return w ? sum / w : 0;
}

export const TIERS = ["locked", "bronze", "silver", "gold", "mastered"];
export function tier(m) {
  if (m >= 90) return "mastered";
  if (m >= 75) return "gold";
  if (m >= 50) return "silver";
  if (m >= 25) return "bronze";
  return "locked";
}

// Apply a graded answer to a card. Returns the XP awarded.
export function applyResult(n, skill, correct) {
  const card = getCard(n, skill);
  const now = Date.now();
  // Bank any time-decay into the stored value before grading, so a long-stale
  // card doesn't behave as if it were still fresh.
  const masteryBefore = decayed(card, now);
  card.mastery = masteryBefore;
  card.seen++;
  card.lastSeen = now;

  const g = getState().global;
  g.totalAnswered++;
  let xp = 0;
  if (correct) {
    card.correct++;
    g.totalCorrect++;
    card.mastery = Math.min(100, card.mastery + (100 - card.mastery) * 0.3);
    card.box = Math.min(5, card.box + 1);
    // Reward harder work: weaker cards (before this answer) pay more XP.
    xp = Math.round(6 + ((100 - masteryBefore) / 100) * 14);
    g.xp += xp;
  } else {
    card.wrong++;
    card.mastery = Math.max(0, card.mastery * 0.55);
    card.box = 0;
  }
  card.due = now + INTERVALS[card.box];

  getState().history.push({ t: now, correct, n, skill });
  if (getState().history.length > 800) getState().history.shift();
  save();
  return xp;
}

// XP → level. Gentle curve; later levels cost more.
export function levelInfo() {
  const xp = getState().global.xp;
  const level = Math.floor(Math.sqrt(xp / 40)) + 1;
  const curBase = 40 * (level - 1) ** 2;
  const nextBase = 40 * level ** 2;
  const into = xp - curBase;
  const span = nextBase - curBase;
  return { level, xp, into, span, pct: Math.round((into / span) * 100) };
}

function weightedPick(cands) {
  if (!cands.length) return null;
  const total = cands.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * total;
  for (const c of cands) {
    r -= c.weight;
    if (r <= 0) return c;
  }
  return cands[cands.length - 1];
}

// Pick the next (amendment, skill) card.
// opts.excludeKeys: Set of "n:skill" to avoid (recency within a session)
// opts.scenarioOnly: restrict to amendments with scenarios & skills that use them
export function pickCard({ excludeKeys = new Set(), scenarioOnly = false, dueOnly = false } = {}) {
  const now = Date.now();
  const cands = [];
  for (const a of AMENDMENTS) {
    let sks = trainableSkills(a);
    if (scenarioOnly) {
      if (!a.scenarios || !a.scenarios.length) continue;
      sks = sks.filter((s) => s === "recognition" || s === "application");
    }
    for (const sk of sks) {
      const key = `${a.n}:${sk}`;
      if (excludeKeys.has(key)) continue;
      const card = getCard(a.n, sk);
      if (dueOnly && !isDue(card, now)) continue;
      let w = 1;
      w += ((100 - decayed(card, now)) / 100) * 3; // weakness → "ask me what I struggle with"
      if (card.due && now >= card.due) w += 3; // overdue
      if (card.seen === 0) w += 1.5; // pull new cards into rotation
      if (card.lastSeen && now - card.lastSeen < 60e3) w *= 0.2; // just saw it
      cands.push({ key, n: a.n, skill: sk, weight: Math.max(0.05, w) });
    }
  }
  return weightedPick(cands);
}
