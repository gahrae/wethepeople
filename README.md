# We the People ★

A bite-sized, **adaptive** browser game for learning the 27 amendments to the
U.S. Constitution — the **exact text**, **which amendment applies** to real
situations, and the **history** behind them. Built for an adult who wants to
actually *know* this stuff, not cram it.

See [`DESIGN.md`](./DESIGN.md) for the full game design.

## ▶ Play it online

### **https://gahrae.github.io/wethepeople/**

Runs entirely in your browser — nothing to install. Your progress saves locally
on your device, it works offline once loaded, and it can be added to a phone
home screen.

## Run it locally

```bash
npm start          # serves on http://localhost:5173
# or: PORT=8080 npm start
```

No dependencies, no build step — a tiny Node static server (`server.js`) and a
vanilla ES-module front end. Progress saves to your browser's `localStorage`.

## What's in the box

- **All 27 amendments** with verbatim official text, plain summary, "why it
  exists," and 1–3 landmark cases each (71 situational scenarios).
- **Adaptive engine** — Leitner spaced repetition + a weakness-weighted lottery
  that quietly steers practice toward the amendments *you* struggle with.
- **Time-decay mastery** — knowledge you don't refresh fades on the board, so it
  always reflects what you *currently* know (not what you once crammed).
- **Three tracked skills** per amendment: 📜 Recall (exact words), 🔍 Recognition
  (spot the amendment), ⚖️ Application (how the right works in life).
- **Four modes** plus a **♻️ Review** queue: 🎯 Daily Practice · 📚 Learn ·
  🧭 Situational · 💀 Survival.
- **Visible progress** — a 27-tile "Constitution board" with mastery rings, a
  per-amendment skill breakdown, levels/XP, a day-streak, a daily goal, an
  activity heatmap, an accuracy trend chart, and unlockable achievements.
- **Keyboard play** — `1`–`4` to answer, `Enter`/`Space` to continue,
  `Ctrl+Enter` to grade typed answers.
- **Read-aloud** of the exact text (Web Speech API) and subtle sound cues.
- **Installable PWA** — works fully offline; add it to a phone home screen.
- **Settings** — round length, daily goal, sound, and read-aloud toggles.

## Project layout

App files live at the repo root (so GitHub Pages can serve them directly).

```
index.html             app shell
manifest.webmanifest   PWA manifest
sw.js                  service worker (offline cache)
icon.svg               app icon
css/styles.css
js/content.js          authored content for all 27 amendments  ← edit to add scenarios
js/store.js            localStorage persistence, settings, streak, mistakes
js/srs.js              Leitner + mastery + time-decay + selection lottery
js/questions.js        builds questions from content
js/achievements.js     badge definitions + unlock checks
js/audio.js            sound cues + read-aloud (Web Speech)
js/game.js             session & mode orchestration + no-repeat dedup
js/ui.js               views/rendering + keyboard
js/main.js             bootstrap + routing + SW registration
server.js              zero-dependency static server (local dev only)
scripts/audit-questions.mjs   `npm run audit` — flags too-easy questions
DESIGN.md              full design document
```

## Deploying (GitHub Pages)

It's already structured for a Pages project site. In the repo's
**Settings → Pages**, set *Source* to **Deploy from a branch**, branch **main**,
folder **/ (root)**. After it builds, it's live at
`https://<username>.github.io/wethepeople/`. The `.nojekyll` file tells Pages to
serve the files as-is. All asset paths are relative, so it works under that
subpath without changes.

## Adding content

Everything lives in `js/content.js`. To add a situation, drop another entry into
an amendment's `scenarios` array. Distractors should be *plausible-but-wrong*
(never naming an amendment), and each carries a `why` shown when it's picked:

```js
{
  id: "4g",
  prompt: "Police install a GPS tracker on a suspect's car without a warrant.",
  amendments: [4],
  how: [
    { t: "A search occurred; attaching a tracking device to a car requires a warrant.", correct: true },
    { t: "No search occurred, because the car drives on public roads exposed to everyone.", correct: false,
      why: "Jones held the attachment plus monitoring is a search, despite public roads." },
    { t: "No search occurred, since attaching a small device doesn't disturb the vehicle.", correct: false,
      why: "The trespass of attaching the device to your property is itself the search." },
  ],
  explain: "United States v. Jones (2012): attaching a GPS device to a vehicle is a search.",
}
```

Adding scenarios to a procedural amendment automatically unlocks its
**Application** skill in the mastery model. After editing, run **`npm run audit`**
to confirm no question gives its answer away by style.

> ✅ All 27 amendment texts are the **verbatim official transcripts** from the
> U.S. National Archives (archives.gov/founding-docs), verified June 2026.
> Editorial asterisks and the brackets marking later-superseded passages were
> removed, but the words are unchanged. The long multi-section amendments
> (e.g. 12, 14, 20, 25) store the most-litigated/most-taught sections; the full
> section-by-section text lives on the Archives pages linked above.
