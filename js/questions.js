// Turns content + a (amendment, skill) target into a concrete question object.
import { AMENDMENTS, BY_N } from "./content.js";
import { getSettings } from "./store.js";

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sample = (arr, k) => shuffle(arr).slice(0, k);
const uniq = (arr) => [...new Set(arr)];

// --- family-based distractors for "which amendment?" questions ---
// Wrong options are drawn from the same thematic family, so confusions are
// real (15 vs 19 vs 24 vs 26; 4 vs 5 vs 6) instead of trivially distant.
const FAMILY = {};
[1, 2, 3, 9, 10].forEach((n) => (FAMILY[n] = "liberties"));
[4, 5, 6, 7, 8].forEach((n) => (FAMILY[n] = "criminal"));
[13, 14, 15, 19, 24, 26].forEach((n) => (FAMILY[n] = "rights-voting"));
[11, 12, 16, 17, 18, 20, 21, 22, 23, 25, 27].forEach((n) => (FAMILY[n] = "structure"));

function familyDistractors(n, k) {
  const fam = FAMILY[n];
  let picks = sample(
    AMENDMENTS.filter((a) => a.n !== n && FAMILY[a.n] === fam).map((a) => a.n),
    k
  );
  if (picks.length < k) {
    const fill = AMENDMENTS.filter((a) => a.n !== n && !picks.includes(a.n)).map((a) => a.n);
    picks = picks.concat(sample(fill, k - picks.length));
  }
  return picks;
}

// --- near-miss paraphrases for cloze, so the exact wording is what's tested ---
const SYN = {
  speech: ["expression"], press: ["media", "newspapers"], religion: ["faith", "worship"],
  establishment: ["endorsement", "founding"], exercise: ["practice"], people: ["citizens", "public"],
  peaceably: ["peacefully"], assemble: ["gather"], grievances: ["complaints"],
  militia: ["armed force"], security: ["safety", "defense"], keep: ["hold", "own"],
  bear: ["carry", "possess"], arms: ["weapons", "firearms"], infringed: ["restricted", "abridged"],
  soldier: ["serviceman"], quartered: ["housed", "lodged"], consent: ["permission"], owner: ["occupant"],
  secure: ["safe", "protected"], persons: ["bodies"], houses: ["homes"], papers: ["documents", "records"],
  effects: ["belongings", "possessions"], unreasonable: ["unwarranted", "unjustified"],
  searches: ["inspections"], seizures: ["confiscations"], warrants: ["orders"],
  probable: ["reasonable", "sufficient"], cause: ["grounds", "suspicion"], oath: ["pledge"],
  affirmation: ["sworn statement"], indictment: ["charge"], jeopardy: ["peril"],
  compelled: ["forced", "required"], deprived: ["denied", "stripped"], liberty: ["freedom"],
  property: ["possessions"], process: ["procedure"], compensation: ["payment"],
  accused: ["defendant"], speedy: ["prompt", "swift"], impartial: ["unbiased", "neutral"],
  jury: ["panel"], informed: ["notified", "told"], accusation: ["charge"], confronted: ["faced"],
  witnesses: ["accusers"], compulsory: ["mandatory"], counsel: ["a lawyer"], defence: ["defense"],
  controversy: ["dispute"], excessive: ["disproportionate", "unreasonable"], bail: ["bond"],
  fines: ["penalties"], cruel: ["barbaric", "inhumane"], unusual: ["uncommon"],
  punishments: ["penalties"], enumeration: ["listing"], construed: ["interpreted"], deny: ["reject"],
  disparage: ["dismiss"], retained: ["kept", "held"], powers: ["authorities"],
  delegated: ["granted", "assigned"], prohibited: ["forbidden", "barred"], reserved: ["left", "kept"],
  slavery: ["bondage"], servitude: ["bondage"], convicted: ["found guilty"], enforce: ["carry out"],
  legislation: ["laws"], naturalized: ["lawfully admitted"], jurisdiction: ["authority"],
  citizens: ["nationals"], privileges: ["protections"], immunities: ["safeguards"], equal: ["fair"],
  protection: ["safeguard"], laws: ["statutes"], race: ["ancestry"], color: ["complexion"],
  vote: ["ballot"], denied: ["refused"], abridged: ["curtailed", "limited"], sex: ["gender"],
  taxes: ["levies"], incomes: ["earnings"], apportionment: ["allocation"], senators: ["legislators"],
  elected: ["chosen"], manufacture: ["production"], transportation: ["transport"],
  intoxicating: ["alcoholic"], liquors: ["spirits"], repealed: ["abolished", "revoked"],
  varying: ["changing", "altering"], intervened: ["passed", "occurred"], removal: ["dismissal"],
  resignation: ["stepping down"], vacancy: ["opening"], confirmation: ["approval"],
  electors: ["delegates"], inhabitant: ["resident"],
};

function matchCase(orig, repl) {
  return /^[A-Z]/.test(orig) ? repl.charAt(0).toUpperCase() + repl.slice(1) : repl;
}

function nearMisses(phrase) {
  const out = new Set();
  const tokens = phrase.split(/(\s+)/); // keep whitespace tokens
  for (let i = 0; i < tokens.length; i++) {
    const lw = tokens[i].toLowerCase().replace(/[^a-z]/g, "");
    const syns = SYN[lw];
    if (!syns) continue;
    for (const s of syns) {
      const copy = tokens.slice();
      copy[i] = matchCase(tokens[i], s);
      const v = copy.join("");
      if (v.toLowerCase() !== phrase.toLowerCase()) out.add(v);
    }
  }
  const m = phrase.match(/^(.+?) and (.+)$/i);
  if (m && !phrase.includes(",")) out.add(`${m[2]} and ${m[1]}`);
  return [...out];
}

const ORD = [
  "", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth",
  "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth", "Fourteenth", "Fifteenth",
  "Sixteenth", "Seventeenth", "Eighteenth", "Nineteenth", "Twentieth", "Twenty-first",
  "Twenty-second", "Twenty-third", "Twenty-fourth", "Twenty-fifth", "Twenty-sixth",
  "Twenty-seventh",
];
export const amendmentLabel = (n) => `${ORD[n]} Amendment`;

// ---- builders ----------------------------------------------------------

// Blank the phrase within just its sentence/clause window, so long
// multi-section amendments don't dump their whole text into one question.
function clozeWindow(text, phrase) {
  const at = text.indexOf(phrase);
  if (at < 0) return text.replace(phrase, "  ______  ");
  const stops = [". ", "; ", ": "];
  let start = 0;
  let end = text.length;
  for (const s of stops) {
    const b = text.lastIndexOf(s, at - 1);
    if (b >= 0) start = Math.max(start, b + s.length);
    const f = text.indexOf(s, at + phrase.length);
    if (f >= 0) end = Math.min(end, f + 1);
  }
  let seg = text.slice(start, end).trim();
  if (start > 0) seg = "…" + seg;
  if (end < text.length) seg = seg + "…";
  return seg.replace(phrase, "  ______  ");
}

function cloze(a) {
  const phrase = pick(a.keyPhrases);
  const promptText =
    a.text.length <= 240 ? a.text.replace(phrase, "  ______  ") : clozeWindow(a.text, phrase);
  // Prefer near-miss paraphrases (tests exact wording); fall back to other
  // amendments' phrases only if we can't generate enough near-misses.
  const opts = [phrase];
  const add = (cand) => {
    if (opts.length < 4 && cand && !opts.some((o) => o.toLowerCase() === cand.toLowerCase())) opts.push(cand);
  };
  shuffle(nearMisses(phrase)).forEach(add);
  if (opts.length < 4) {
    const pool = uniq(AMENDMENTS.filter((x) => x.n !== a.n).flatMap((x) => x.keyPhrases));
    shuffle(pool).forEach(add);
  }
  const choices = shuffle(opts);
  return {
    type: "cloze",
    n: a.n,
    skill: "recall",
    title: `Fill the blank — ${a.short}`,
    prompt: promptText,
    choices,
    answer: choices.indexOf(phrase),
    whyByChoice: choices.map((c) => (c === phrase ? "" : `“${c}” is a close paraphrase — the exact wording is “${phrase}”.`)),
    explain: `The exact wording is “…${phrase}…”.`,
  };
}

// Rationale shown when the player picks a wrong amendment in a "which amendment"
// question — names what they actually picked.
function amdWhy(optN) {
  const o = BY_N[optN];
  return `That's the ${o.short} — ${o.summary}`;
}

function typeText(a) {
  return {
    type: "type",
    n: a.n,
    skill: "recall",
    title: `From memory — ${a.short}`,
    prompt: `Type the text of the ${a.short} as closely as you can. (Spelling-forgiving; punctuation and case don't matter.)`,
    answerText: a.text,
    explain: a.text,
  };
}

function identify(a) {
  const snippet = a.text.length > 240 ? a.text.slice(0, 230).trim() + "…" : a.text;
  const opts = shuffle([a.n, ...familyDistractors(a.n, 3)]);
  return {
    type: "identify",
    n: a.n,
    skill: "recognition",
    title: "Which amendment is this?",
    prompt: `“${snippet}”`,
    choices: opts.map(amendmentLabel),
    answer: opts.indexOf(a.n),
    whyByChoice: opts.map((nn) => (nn === a.n ? "" : amdWhy(nn))),
    explain: `That's the ${a.short} — ${a.title}.`,
  };
}

function scenarioWhich(a) {
  const sc = pick(a.scenarios);
  const correctN = sc.amendments[0];
  const opts = shuffle([correctN, ...familyDistractors(correctN, 3)]);
  return {
    type: "scenario-which",
    n: a.n,
    skill: "recognition",
    title: "Which amendment applies?",
    prompt: sc.prompt,
    choices: opts.map(amendmentLabel),
    answer: opts.indexOf(correctN),
    whyByChoice: opts.map((nn) => (nn === correctN ? "" : amdWhy(nn))),
    explain: sc.explain,
  };
}

// Reverse recognition for focused drills: the amendment is known, so asking
// "which amendment is this?" is trivial. Instead show several real situations
// and ask which one THIS amendment governs — testing knowledge of its scope.
// Distractor scenarios come from sibling amendments and never overlap with `a`.
function appliesWhich(a) {
  const mine = pick(a.scenarios);
  const picks = [];
  const used = new Set([a.n]);
  const take = (n) => {
    const oa = BY_N[n];
    if (!oa) return;
    const ok = oa.scenarios.filter((s) => !s.amendments.includes(a.n));
    if (ok.length) picks.push(pick(ok));
  };
  familyDistractors(a.n, 3).forEach((n) => {
    if (picks.length < 3 && !used.has(n)) { used.add(n); take(n); }
  });
  // backfill if any sibling lacked a usable scenario
  for (const cand of shuffle(AMENDMENTS)) {
    if (picks.length >= 3) break;
    if (used.has(cand.n) || !cand.scenarios.length) continue;
    used.add(cand.n);
    take(cand.n);
  }
  const items = shuffle([
    { sc: mine, mine: true },
    ...picks.slice(0, 3).map((sc) => ({ sc, mine: false })),
  ]);
  return {
    type: "applies",
    n: a.n,
    skill: "recognition",
    title: `Which situation does the ${a.short} govern?`,
    prompt: "Pick the scenario this amendment applies to.",
    choices: items.map((it) => it.sc.prompt),
    answer: items.findIndex((it) => it.mine),
    whyByChoice: items.map((it) => (it.mine ? "" : `That situation is governed by the ${BY_N[it.sc.amendments[0]].short}, not this one.`)),
    explain: mine.explain,
  };
}

// "Which clause applies?" — intra-amendment recognition for the multi-clause
// amendments (1, 5, 6, 14). Requires `a.clauses` and clause-tagged scenarios.
function whichClause(a) {
  const sc = pick(a.scenarios.filter((s) => s.clause));
  const others = sample(a.clauses.filter((c) => c !== sc.clause), 3);
  const choices = shuffle([sc.clause, ...others]);
  return {
    type: "which-clause",
    n: a.n,
    skill: "recognition",
    title: `Which clause of the ${a.short} applies?`,
    prompt: sc.prompt,
    choices,
    answer: choices.indexOf(sc.clause),
    whyByChoice: choices.map((c) => (c === sc.clause ? "" : `This situation turns on the ${sc.clause} clause, not ${c}.`)),
    explain: sc.explain,
  };
}

function scenarioHow(a) {
  const sc = pick(a.scenarios.filter((s) => s.how && s.how.length));
  const opts = shuffle(sc.how);
  return {
    type: "scenario-how",
    n: a.n,
    skill: "application",
    title: "How does the right apply here?",
    prompt: sc.prompt,
    choices: opts.map((o) => o.t),
    answer: opts.findIndex((o) => o.correct),
    whyByChoice: opts.map((o) => (o.correct ? "" : o.why || "")),
    explain: sc.explain,
  };
}

// ---- dispatch ----------------------------------------------------------

export function buildQuestion(n, skill, opts = {}) {
  const a = BY_N[n];
  if (skill === "recall") {
    const allowType = getSettings().typeText;
    return allowType && Math.random() < 0.22 && a.text.length <= 300 ? typeText(a) : cloze(a);
  }
  if (skill === "recognition") {
    // Multi-clause amendments can ask which *clause* is in play.
    const clauseReady = a.clauses && a.scenarios.some((s) => s.clause);
    if (clauseReady && Math.random() < 0.4) return whichClause(a);
    // In a focused drill the amendment is known, so "which amendment is this?"
    // gives itself away — ask which situation the amendment governs instead.
    if (opts.focus && a.scenarios.length) return appliesWhich(a);
    return a.scenarios.length && Math.random() < 0.5 ? scenarioWhich(a) : identify(a);
  }
  return scenarioHow(a);
}

// Force a situational (story-based) question for the given skill.
export function buildScenarioQuestion(n, skill) {
  const a = BY_N[n];
  return skill === "application" ? scenarioHow(a) : scenarioWhich(a);
}

// Fuzzy grade for type-the-text. Returns 0..1 similarity.
export function textSimilarity(input, target) {
  const norm = (s) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const a = norm(input);
  const b = norm(target);
  if (!a) return 0;
  if (a === b) return 1;
  const d = levenshtein(a, b);
  return Math.max(0, 1 - d / Math.max(a.length, b.length));
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => i);
  for (let j = 1; j <= n; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= m; i++) {
      const tmp = dp[i];
      dp[i] = Math.min(
        dp[i] + 1,
        dp[i - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = tmp;
    }
  }
  return dp[m];
}
