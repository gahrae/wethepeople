// Bootstrap + global click routing (event delegation).
import { showHome, showDetail, showStats, showSettings, showMistakes, showCases, showCase, startMode, startReview, startMistakes, initUI } from "./ui.js";

function route(target) {
  if (target === "home") showHome();
  else if (target === "stats") showStats();
  else if (target === "settings") showSettings();
  else if (target === "mistakes") showMistakes();
  else if (target === "cases") showCases();
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-nav],[data-detail],[data-case],[data-mode],[data-practice],[data-review],[data-mistakes]");
  if (!t) return;
  if (t.dataset.nav) route(t.dataset.nav);
  else if (t.dataset.review) startReview();
  else if (t.dataset.mistakes) startMistakes();
  else if (t.dataset.case) showCase(t.dataset.case);
  else if (t.dataset.detail) showDetail(Number(t.dataset.detail));
  else if (t.dataset.practice) startMode("practice", Number(t.dataset.practice)); // focused drill
  else if (t.dataset.mode) startMode(t.dataset.mode);
  else return;
  // New view rendered: scroll back to the top so it isn't shown mid-page
  // (e.g. tapping an amendment tile near the bottom of the home page).
  window.scrollTo(0, 0);
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
