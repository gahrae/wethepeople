// Tiny WebAudio cues + Web Speech read-aloud. Both respect user settings.
import { getSettings } from "./store.js";

let ctx = null;
function tone(freq, dur = 0.12, type = "sine", when = 0) {
  if (!getSettings().sound) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur);
  } catch {
    /* audio unavailable — ignore */
  }
}

export function sndCorrect() {
  tone(660, 0.09);
  tone(880, 0.13, "sine", 0.09);
}
export function sndWrong() {
  tone(180, 0.2, "square");
}
export function sndLevel() {
  tone(523, 0.1);
  tone(659, 0.1, "sine", 0.1);
  tone(784, 0.18, "sine", 0.2);
}

// --- voice selection: prefer the most natural-sounding English voice ---
let voices = [];
const voiceCbs = [];
function loadVoices() {
  try {
    voices = window.speechSynthesis.getVoices() || [];
  } catch {
    voices = [];
  }
  if (voices.length) voiceCbs.forEach((cb) => { try { cb(); } catch { /* ignore */ } });
}
if (speechSupported()) {
  loadVoices();
  try {
    window.speechSynthesis.onvoiceschanged = loadVoices; // voices arrive async in some browsers
  } catch {
    /* ignore */
  }
}

// Register a callback for when voices become available (fires immediately if
// they're already loaded). Used by the Settings page to populate its dropdown.
export function onVoices(cb) {
  voiceCbs.push(cb);
  if (voices.length) cb();
}

// English voices first, then the rest — for the Settings dropdown.
export function listVoices() {
  if (!voices.length) loadVoices();
  const isEn = (v) => /^en(-|_|$)/i.test(v.lang);
  return [...voices.filter(isEn), ...voices.filter((v) => !isEn(v))];
}

function voiceByURI(uri) {
  return uri ? voices.find((v) => v.voiceURI === uri) : null;
}
function chosenVoice() {
  return voiceByURI(getSettings().voiceURI) || bestVoice();
}

function bestVoice() {
  if (!voices.length) loadVoices();
  const en = voices.filter((v) => /^en(-|_|$)/i.test(v.lang));
  const pool = en.length ? en : voices;
  // Named, higher-quality voices first; "Natural"/"Google"/"Premium" tend to be best.
  const prefer = [
    /natural/i, /neural/i, /premium/i, /enhanced/i,
    /google (us|uk) english/i, /\bgoogle\b/i,
    /samantha/i, /\baria\b/i, /\bjenny\b/i, /\bguy\b/i, /daniel/i, /\bkaren\b/i, /serena/i, /\balex\b/i,
  ];
  for (const re of prefer) {
    const v = pool.find((v) => re.test(v.name));
    if (v) return v;
  }
  return pool.find((v) => /en[-_]US/i.test(v.lang)) || pool[0] || null;
}

// Speak text. Options:
//   onstart, onend — let the UI reflect playback state
//   voiceURI — speak with a specific voice (used by the Settings sampler)
//   force — bypass the speech on/off setting (used by the Settings sampler)
// Returns true if speech actually started.
export function speak(text, { onstart, onend, voiceURI, force } = {}) {
  if ((!force && !getSettings().speech) || !speechSupported()) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voiceByURI(voiceURI) || chosenVoice();
    if (v) {
      u.voice = v;
      u.lang = v.lang;
    } else {
      u.lang = "en-US";
    }
    u.rate = 0.92;
    u.pitch = 1.0;
    if (onstart) u.onstart = () => onstart();
    if (onend) {
      u.onend = () => onend();
      u.onerror = () => onend();
    }
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}
export function stopSpeak() {
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}
export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
