# We the People — Game Design

> A bite-sized, adaptive browser game for adults to *actually* learn the
> amendments to the U.S. Constitution: the exact text, which amendment applies
> to real situations, and the history behind them.

---

## 1. Design pillars

1. **Adaptive, not linear.** The game watches where you struggle and quietly
   bends practice toward those amendments. You never grind what you already own.
2. **Three kinds of knowing.** Memorizing words ≠ recognizing a violation ≠
   knowing how a right applies. We track and train each separately.
3. **Bite-sized loops.** A round is 7 questions / ~2 minutes. "One more round"
   is always one tap away. Nothing is ever a 45-minute slog.
4. **Earned context.** History, "why this exists," and landmark court cases
   appear as *sidebars* — rewards woven into play, not a textbook up front.
5. **Visible mastery.** You can see your understanding light up the Constitution,
   amendment by amendment, skill by skill.

---

## 2. The three skills (the heart of the model)

Every amendment is tracked across three independent skills, each a 0–100 score:

| Skill | What it means | How it's trained |
|------|----------------|------------------|
| 📜 **Recall** | You know the *exact words* | Cloze (fill the blank), type-the-text |
| 🔍 **Recognition** | You can *spot which amendment* is in play | "Which amendment?" from text or scenario |
| ⚖️ **Application** | You understand *how the right works* in life | Situational "what happens / which clause" |

An amendment's **overall mastery** = weighted average (Recall 30%, Recognition
30%, Application 40% — application is the hardest and most valuable). Mastery
tiers drive the visuals:

```
0–24   Locked    (dim)        25–49  Bronze
50–74  Silver                 75–89  Gold
90–100 Mastered  (glowing)
```

---

## 3. Adaptive engine (spaced repetition + struggle weighting)

Each `(amendment, skill)` pair is a flashcard in a **Leitner box** system
(boxes 0–5) layered with a continuous mastery score.

**On answer:**
- ✅ correct → `box+1` (max 5), `mastery += (100-mastery)*0.30`, next-due pushed out
  along the interval ladder `[~now, 1d, 3d, 7d, 16d, 35d]`.
- ❌ wrong → `box→0`, `mastery *= 0.55`, due again *this session* (lapse queue)
  and within a day.

**Question selection** is a weighted lottery (softmax) over all
`(amendment, skill)` cards. A card's weight rises with:
- **Overdue-ness** (past its due date → big boost),
- **Weakness** (low mastery → boost; this is the "ask me what I struggle with"),
- and falls with **recency** (just saw it → suppressed, avoids repetition).

Because it's a *lottery* not a sort, sessions stay varied and never feel like
being drilled on the same card five times.

The **lapse queue** re-inserts a missed item ~3 questions later in the same
session — the single most effective trick for fixing a fresh mistake.

---

## 4. Question types

| Type | Skill | Example |
|------|-------|---------|
| **Cloze** | Recall | "…the right of the people to keep and bear ____" |
| **Type-the-text** | Recall | Reproduce a clause; fuzzy-matched (case/punctuation-insensitive) |
| **Identify** | Recognition | Show exact text → "Which amendment is this?" |
| **Scenario → which** | Recognition | A story → pick the amendment(s) in play |
| **Scenario → how** | Application | A story → pick the correct legal consequence/clause |

Distractors are *thematically near* (e.g. confusing the 5th and 6th, or 1st and
9th) so wrong answers teach the real boundaries.

---

## 5. Game modes

- **🎯 Daily / Practice (default loop).** Pure adaptive spaced repetition. The
  engine picks what's due and what's weak. Best for steady progress.
- **📚 Learn.** Slower, generous. Every answer expands into context; sidebars
  appear often; wrong answers cost nothing. New amendments are introduced here
  first. This is where you *meet* an amendment before being tested hard.
- **🧭 Situational.** Only scenario questions. "This happened — which right, and
  what's the outcome?" The real-life muscle.
- **💀 Survival.** Adaptive question stream; play until your **first wrong
  answer**. Banks a high score and a streak. Tense, replayable, bite-sized.

All modes feed the same mastery model, so every minute counts toward progress.

---

## 6. Sidebars (the "earned context")

A sidebar is a short card: **Why it exists**, a **history** beat, and **1–3
landmark cases** (name + one-line holding). They surface:
- always, after answers, in **Learn** mode;
- occasionally (~1 in 5) after a correct answer elsewhere — a small reward;
- always available on an amendment's **detail page**.

Cases are kept to a sentence ("*Tinker v. Des Moines* (1969) — students don't
shed free-speech rights at the schoolhouse gate") so they're memorable, not
homework.

---

## 7. Progress & motivation

- **The Constitution board.** 27 tiles; each shows a tri-arc ring (one arc per
  skill) and a tier color. Your knowledge literally lights up the document.
- **Amendment detail.** Exact text, per-skill bars, sidebar, "Practice this one."
- **Top bar.** Level + XP ladder, day-streak flame, overall mastery %.
- **XP & levels.** Correct answers grant XP scaled by difficulty and by how
  weak the card was (rewarding work on hard stuff). Level = `floor(sqrt(xp/40))`.
- **Streak.** Consecutive days played; lights the flame.
- **Survival high score.** A single number to beat.

---

## 8. Data model

**Content** (`js/content.js`, authored seed): per amendment —
`n, title, short, year, group, text, keyPhrases[], summary, why, cases[],
scenarios[]`. Scenarios: `{ id, prompt, amendments[], how[{t,correct}], explain }`.

**Progress** (`localStorage`): per `(amendment, skill)` →
`{ mastery, box, due, seen, lastSeen, correct, wrong }`; global →
`{ xp, streakDays, lastPlayed, survivalBest, totalAnswered }`. Plus a rolling
log for the trend sparkline.

Everything is local and offline. No accounts, no server state — just you.

---

## 9. Architecture

Zero-dependency Node static server (`server.js`) serving a vanilla
ES-module SPA:

App files sit at the repo root so GitHub Pages can serve them directly:

```
index.html      app shell
css/styles.css
js/content.js   authored content (all 27)
js/store.js     localStorage persistence + defaults
js/srs.js       Leitner + mastery + selection lottery
js/questions.js builds question objects from content
js/game.js      session & mode orchestration
js/ui.js        views/rendering (board, detail, session, stats)
js/main.js      bootstrap + routing
server.js       tiny http file server for local dev (no npm deps)
```

Run locally with `npm start` → open `http://localhost:5173`. Online at
`https://gahrae.github.io/wethepeople/`.

---

## 10. Roadmap (post-seed)

- Type-the-whole-amendment "performance" mode with a word-diff.
- Audio read-aloud of exact text (Web Speech API).
- Export/import progress JSON (backup, or move between machines).
- Authoring UI to add scenarios without editing code.
- "Boss round": a mixed exam over your weakest five amendments.
