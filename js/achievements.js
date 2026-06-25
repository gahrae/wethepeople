// Badge definitions + unlock checking. Each badge has a `test(global, ctx)`
// predicate; ctx carries transient facts like "this round was perfect."
import { getState, save } from "./store.js";
import { AMENDMENTS } from "./content.js";
import { overallMastery } from "./srs.js";

const BILL_OF_RIGHTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const ACHIEVEMENTS = [
  { id: "first", icon: "🌱", name: "First Steps", desc: "Answer your first question.", test: (g) => g.totalAnswered >= 1 },
  { id: "perfect", icon: "🎯", name: "Flawless", desc: "Finish a round with a perfect score.", test: (g, c) => !!c.perfectRound },
  { id: "century", icon: "💯", name: "Centurion", desc: "Answer 100 questions.", test: (g) => g.totalAnswered >= 100 },
  { id: "streak7", icon: "🔥", name: "Habit Formed", desc: "Reach a 7-day streak.", test: (g) => g.streakDays >= 7 },
  { id: "surv10", icon: "💀", name: "Survivor", desc: "Survival streak of 10.", test: (g) => g.survivalBest >= 10 },
  { id: "surv20", icon: "☠️", name: "Iron Will", desc: "Survival streak of 20.", test: (g) => g.survivalBest >= 20 },
  { id: "bor", icon: "📜", name: "Bill of Rights", desc: "Master amendments 1–10.", test: () => BILL_OF_RIGHTS.every((n) => overallMastery(n) >= 90) },
  { id: "silver27", icon: "🥈", name: "Full House", desc: "Get all 27 amendments to Silver or better.", test: () => AMENDMENTS.every((a) => overallMastery(a.n) >= 50) },
  { id: "scholar", icon: "🎓", name: "Scholar", desc: "Answer 1,000 questions.", test: (g) => g.totalAnswered >= 1000 },
  { id: "master27", icon: "🏛️", name: "Constitutional Scholar", desc: "Master all 27 amendments.", test: () => AMENDMENTS.every((a) => overallMastery(a.n) >= 90) },
];

export const byId = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

// Returns an array of newly-unlocked achievement objects (for toasts).
export function checkAchievements(ctx = {}) {
  const g = getState().global;
  if (!Array.isArray(g.achievements)) g.achievements = [];
  const newly = [];
  for (const a of ACHIEVEMENTS) {
    if (g.achievements.includes(a.id)) continue;
    let ok = false;
    try {
      ok = a.test(g, ctx);
    } catch {
      ok = false;
    }
    if (ok) {
      g.achievements.push(a.id);
      newly.push(a);
    }
  }
  if (newly.length) save();
  return newly;
}
