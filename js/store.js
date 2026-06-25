// Local persistence (localStorage). Single player, offline, no accounts.
import { AMENDMENTS } from "./content.js";

const KEY = "wtp.progress.v1";

export const SKILLS = ["recall", "recognition", "application"];
export const SKILL_META = {
  recall: { label: "Recall", icon: "📜", weight: 0.30, blurb: "Exact words" },
  recognition: { label: "Recognition", icon: "🔍", weight: 0.30, blurb: "Spot the amendment" },
  application: { label: "Application", icon: "⚖️", weight: 0.40, blurb: "How it applies" },
};

// Application is only trainable where we have authored situational scenarios.
export function trainableSkills(a) {
  const sks = ["recall", "recognition"];
  if (a.scenarios && a.scenarios.some((s) => s.how && s.how.length)) sks.push("application");
  return sks;
}

function defaultCard() {
  return { mastery: 0, box: 0, due: 0, seen: 0, lastSeen: 0, correct: 0, wrong: 0 };
}

function defaultState() {
  const cards = {};
  for (const a of AMENDMENTS) {
    for (const sk of trainableSkills(a)) cards[`${a.n}:${sk}`] = defaultCard();
  }
  return {
    cards,
    global: {
      xp: 0,
      streakDays: 0,
      lastPlayed: null, // YYYY-MM-DD
      survivalBest: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      achievements: [], // unlocked achievement ids
      mistakes: [], // outstanding missed cards: {n, skill, title, prompt, t}
      settings: { roundLength: 7, dailyGoal: 20, sound: true, speech: true, voiceURI: "", typeText: true },
    },
    history: [], // rolling log: {t, correct, n, skill}
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    const dSettings = base.global.settings;
    base.global = { ...base.global, ...(parsed.global || {}) };
    base.global.settings = { ...dSettings, ...((parsed.global || {}).settings || {}) };
    base.global.achievements = (parsed.global || {}).achievements || [];
    base.global.mistakes = (parsed.global || {}).mistakes || [];
    base.cards = { ...base.cards, ...(parsed.cards || {}) };
    base.history = Array.isArray(parsed.history) ? parsed.history : [];
    return base;
  } catch {
    return defaultState();
  }
}

let state = load();

export function getState() {
  return state;
}
export function getCard(n, skill) {
  return state.cards[`${n}:${skill}`];
}
export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked — game still works in-memory this session */
  }
}
export function resetAll() {
  state = defaultState();
  save();
}

export function getSettings() {
  return state.global.settings;
}
export function saveSettings(patch) {
  Object.assign(state.global.settings, patch);
  save();
}

// Replace the whole state (used by progress import). Returns true on success.
export function importState(obj) {
  if (!obj || typeof obj !== "object" || !obj.cards) return false;
  const base = defaultState();
  base.global = { ...base.global, ...(obj.global || {}) };
  base.global.settings = { ...base.global.settings, ...((obj.global || {}).settings || {}) };
  base.global.achievements = (obj.global || {}).achievements || [];
  base.cards = { ...base.cards, ...obj.cards };
  base.history = Array.isArray(obj.history) ? obj.history : [];
  state = base;
  save();
  return true;
}

// Track outstanding mistakes by card. A wrong answer adds/updates the card;
// a correct answer for that card clears it (the list is "what's left to fix").
export function recordMistake(q, correct) {
  const m = getState().global.mistakes;
  const i = m.findIndex((x) => x.n === q.n && x.skill === q.skill);
  if (!correct) {
    const entry = { n: q.n, skill: q.skill, title: q.title, prompt: q.prompt || "", t: Date.now() };
    if (i >= 0) m[i] = entry;
    else m.push(entry);
    if (m.length > 80) m.shift();
  } else if (i >= 0) {
    m.splice(i, 1);
  }
  save();
}

const dayKey = (t) => new Date(t).toISOString().slice(0, 10);

// How many questions answered today (local date), from the history log.
export function answersToday() {
  const today = dayKey(Date.now());
  return state.history.filter((h) => dayKey(h.t) === today).length;
}

// Update the day-streak. Call once when a session starts.
export function markPlayedToday() {
  const today = new Date().toISOString().slice(0, 10);
  const g = state.global;
  if (g.lastPlayed === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  g.streakDays = g.lastPlayed === yesterday ? g.streakDays + 1 : 1;
  g.lastPlayed = today;
  save();
}
