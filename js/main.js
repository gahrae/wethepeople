// Bootstrap + global click routing (event delegation).
import { showHome, showDetail, showStats, showSettings, showMistakes, startMode, startReview, startMistakes, initUI } from "./ui.js";

function route(target) {
  if (target === "home") showHome();
  else if (target === "stats") showStats();
  else if (target === "settings") showSettings();
  else if (target === "mistakes") showMistakes();
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-nav],[data-detail],[data-mode],[data-practice],[data-review],[data-mistakes]");
  if (!t) return;
  if (t.dataset.nav) route(t.dataset.nav);
  else if (t.dataset.review) startReview();
  else if (t.dataset.mistakes) startMistakes();
  else if (t.dataset.detail) showDetail(Number(t.dataset.detail));
  else if (t.dataset.practice) startMode("practice", Number(t.dataset.practice)); // focused drill
  else if (t.dataset.mode) startMode(t.dataset.mode);
});

initUI();
showHome();

// Progressive Web App: install + offline support.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* SW optional — app works without it */
    });
  });
}
