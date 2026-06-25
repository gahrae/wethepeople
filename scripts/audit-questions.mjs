// Question-quality audit / regression check.
//   node scripts/audit-questions.mjs        → report + exit 1 if any giveaway
//   node scripts/audit-questions.mjs --quiet → summary only
// Flags situational ("how") questions whose answer is guessable by style:
// the correct option naming an amendment, every distractor being a cheap
// joke/wrong-amendment dodge, or the correct option being far the longest.
import { AMENDMENTS } from "../js/content.js";

const quiet = process.argv.includes("--quiet");
const ORD = ["", "First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eighth","Ninth","Tenth","Eleventh","Twelfth","Thirteenth","Fourteenth","Fifteenth","Sixteenth","Seventeenth","Eighteenth","Nineteenth","Twentieth","Twenty-first","Twenty-second","Twenty-third","Twenty-fourth","Twenty-fifth","Twenty-sixth","Twenty-seventh"];
const amd = new RegExp("\\b(" + ORD.slice(1).join("|") + ") Amendment\\b", "i");
const clause = /\b(Clause|Establishment|Free Exercise|Due Process|Equal Protection|Takings|Confrontation|Double Jeopardy|Grand Jury|Compulsory Process)\b/;
// "Cheap" = obviously non-serious wrong answers: flippant openers or absolutist
// dismissals. Neutral verdict words (Allowed/Permissible/Barred/Correct) are NOT
// cheap — plausible distractors legitimately start that way.
const cheap = /^(Fine|No problem|Perfectly fine|Totally fine|Irrelevant|Impossible|Sure)\b|\b(unlimited|any number|as many|no constitutional limit|with no limit|anything at all|never required|whatever (they|the government))\b/i;

const problems = [];
let nHow = 0;
for (const a of AMENDMENTS) {
  for (const s of a.scenarios || []) {
    if (s.how && s.how.length) {
      nHow++;
      const c = s.how.find((h) => h.correct);
      const w = s.how.filter((h) => !h.correct);
      const lens = s.how.map((h) => h.t.length);
      const tells = [];
      if (amd.test(c.t) || clause.test(c.t)) tells.push("correct names an amendment/clause");
      if (w.length && w.every((x) => cheap.test(x.t) || amd.test(x.t))) tells.push("all distractors are cheap (joke/wrong-amendment)");
      if (c.t.length > Math.max(...lens.filter((l) => l !== c.t.length), 0) * 1.6) tells.push("correct option is far the longest");
      if (tells.length) problems.push({ id: s.id, n: a.n, kind: "how", tells, opts: s.how });
    }
    if (amd.test(s.prompt)) problems.push({ id: s.id, n: a.n, kind: "prompt", tells: ["prompt names the amendment"], prompt: s.prompt });
  }
}

if (!quiet) {
  for (const p of problems) {
    console.log(`⚠️  [${p.id}] A${p.n} (${p.kind}) — ${p.tells.join("; ")}`);
    if (p.opts) p.opts.forEach((o) => console.log(`     ${o.correct ? "✓" : "✗"} ${o.t}`));
    if (p.prompt) console.log(`     prompt: ${p.prompt}`);
  }
  console.log("");
}
console.log(`Audited ${nHow} situational questions. Giveaways flagged: ${problems.length}.`);
if (problems.length) {
  console.log("FAIL — tighten the flagged option-sets/prompts above.");
  process.exit(1);
}
console.log("PASS — no obvious giveaways.");
