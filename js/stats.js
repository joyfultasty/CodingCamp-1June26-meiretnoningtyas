/* ============================================================
   STATS PAGE — stats.js
   Reads saved data from localStorage and renders the stats UI.
   ============================================================ */

"use strict";

const STORAGE_KEY_TODOS = "prd_todos";
const STORAGE_KEY_FOCUS_MINS = "prd_focus_minutes"; // total accumulated minutes

/* ── Helpers ── */
function storageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function $(id) {
  return document.getElementById(id);
}

/* ── Stat: completed todos ── */
function getCompletedCount() {
  const todos = storageGet(STORAGE_KEY_TODOS, []);
  return todos.filter((t) => t.completed).length;
}

/* ── Stat: total focus minutes ── */
function getTotalFocusMinutes() {
  return storageGet(STORAGE_KEY_FOCUS_MINS, 0);
}

function formatFocusTime(totalMins) {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}j ${m}m`;
}

/* ── Bar chart: generate fake-but-plausible weekly data ──
   In a real app this would come from a daily log in localStorage.
   We seed it from a deterministic function so it looks consistent.     */
function getWeeklyData() {
  const base = storageGet(STORAGE_KEY_TODOS, []).length;
  // Use a simple seed based on current week number for consistency
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const seed = (n) => ((week * 31 + n * 17) % 8) + 1; // 1-8 sessions

  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0 … Sun=6
  return Array.from({ length: 7 }, (_, i) => ({
    sessions: i <= todayIdx ? seed(i) + Math.min(base, 3) : 0,
    isToday: i === todayIdx,
  }));
}

/* ── Render bar chart ── */
function renderBarChart() {
  const data = getWeeklyData();
  const maxSess = Math.max(...data.map((d) => d.sessions), 1);
  const container = $("bar-chart-bars");
  if (!container) return;

  container.innerHTML = "";
  data.forEach(({ sessions, isToday }) => {
    const wrap = document.createElement("div");
    wrap.className = "bar-chart__bar-wrap";

    const bar = document.createElement("div");
    const pct = sessions > 0 ? Math.round((sessions / maxSess) * 100) : 4;
    bar.className =
      "bar-chart__bar" +
      (isToday
        ? " bar-chart__bar--today"
        : sessions > 0
          ? " bar-chart__bar--has-data"
          : "");
    bar.style.height = "0%"; // start at 0 for animation
    bar.setAttribute("aria-label", `${sessions} sesi`);

    wrap.appendChild(bar);
    container.appendChild(wrap);

    // Animate in after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.height = `${pct}%`;
      });
    });
  });
}

/* ── Render stat numbers ── */
function renderStats() {
  const completedCount = getCompletedCount();
  const focusMins = getTotalFocusMinutes();

  const taskEl = $("stat-tasks-done");
  if (taskEl) taskEl.textContent = `${completedCount} Tugas`;

  const timeEl = $("stat-focus-time");
  if (timeEl) timeEl.textContent = formatFocusTime(focusMins);

  // Streak: stored or default display
  const streakEl = $("stat-streak");
  const streak = storageGet("prd_streak", 0);
  if (streakEl) streakEl.textContent = `${streak} Hari`;
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderBarChart();
});
