/* ============================================================
   CALENDAR PAGE — calendar.js
   Vanilla JS, no frameworks.
   ============================================================ */

"use strict";

const STORAGE_KEY_AGENDA = "prd_agenda"; // { [dateStr]: AgendaItem[] }

/* ── Helpers ── */
function storageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function storageSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function $(id) {
  return document.getElementById(id);
}

/** Format Date as "YYYY-MM-DD" key */
function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

/** Format Date as "DD Month YYYY" Indonesian */
function formatMonthYear(date) {
  return date
    .toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());
}

/* ── State ── */
const today = new Date();
today.setHours(0, 0, 0, 0);

let viewDate = new Date(today.getFullYear(), today.getMonth(), 1); // 1st of displayed month
let selectedDate = new Date(today);
let agendaDB = storageGet(STORAGE_KEY_AGENDA, {});
let activeCat = "fokus";

/* ── CALENDAR GRID ── */

/**
 * Returns demo dot markers for a day (some seeded, some from real agenda).
 * dots: array of 'done'|'focus'|'achieve'
 */
function getDotsForDate(date) {
  const key = dateKey(date);
  const dots = [];

  // Real agenda items stored for this date
  const items = agendaDB[key] || [];
  items.forEach((item) => {
    if (item.cat === "fokus") dots.push("focus");
    else if (item.cat === "meeting") dots.push("done");
    else dots.push("achieve");
  });

  // Seed some visual dots for past days so the calendar looks alive
  if (date < today && dots.length === 0) {
    const d = date.getDate();
    if (d % 3 === 0) dots.push("done");
    if (d % 5 === 0) dots.push("focus");
    if (d % 7 === 0) dots.push("achieve");
  }

  return dots.slice(0, 3); // max 3 dots per cell
}

/** Build the dot icons used in the screenshot (tiny emoji-like) */
function getDotIcon(type) {
  const map = { done: "●", focus: "●", achieve: "✦" };
  return map[type] || "●";
}

function renderCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  $("cal-month-title").textContent = formatMonthYear(new Date(year, month, 1));

  const body = $("cal-grid-body");
  body.innerHTML = "";

  // First day of month (0=Sun)
  const firstDay = new Date(year, month, 1).getDay();
  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Days in previous month
  const daysInPrev = new Date(year, month, 0).getDate();

  // Total cells: always 6 rows × 7 cols = 42
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "cal-cell";
    cell.setAttribute("role", "gridcell");

    let cellDate;
    let isCurrentMonth = true;

    if (i < firstDay) {
      // Previous month overflow
      const day = daysInPrev - firstDay + i + 1;
      cellDate = new Date(year, month - 1, day);
      isCurrentMonth = false;
      cell.classList.add("cal-cell--other-month");
    } else if (i - firstDay < daysInMonth) {
      const day = i - firstDay + 1;
      cellDate = new Date(year, month, day);
    } else {
      // Next month overflow
      const day = i - firstDay - daysInMonth + 1;
      cellDate = new Date(year, month + 1, day);
      isCurrentMonth = false;
      cell.classList.add("cal-cell--other-month");
    }

    const isToday = cellDate.getTime() === today.getTime();
    const isSelected = cellDate.getTime() === selectedDate.getTime();

    if (isToday) cell.classList.add("cal-cell--today");
    if (isSelected) cell.classList.add("cal-cell--selected");

    // Date number
    const numEl = document.createElement("span");
    numEl.className = "cal-cell__num";
    numEl.textContent = cellDate.getDate();

    // "HARI INI" label
    if (isToday) {
      const todayTag = document.createElement("span");
      todayTag.className = "cal-cell__today-tag";
      todayTag.textContent = "HARI INI";
      cell.appendChild(numEl);
      cell.appendChild(todayTag);
    } else {
      cell.appendChild(numEl);
    }

    // Dots
    if (isCurrentMonth) {
      const dots = getDotsForDate(cellDate);
      if (dots.length > 0) {
        const dotRow = document.createElement("div");
        dotRow.className = "cal-cell__dots";
        dots.forEach((type) => {
          const d = document.createElement("span");
          d.className = `cal-cell__dot cal-cell__dot--${type}`;
          d.setAttribute("aria-hidden", "true");
          dotRow.appendChild(d);
        });
        cell.appendChild(dotRow);
      }
    }

    // Click to select
    const capDate = new Date(cellDate); // capture
    cell.addEventListener("click", () => {
      selectedDate = capDate;
      renderCalendar();
      renderAgenda();
    });

    cell.setAttribute(
      "aria-label",
      `${cellDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` +
        (isToday ? " — Hari ini" : ""),
    );
    cell.setAttribute("tabindex", isSelected ? "0" : "-1");

    body.appendChild(cell);
  }
}

/* ── AGENDA ── */

const AGENDA_ICONS = {
  fokus: {
    bg: "#d8f0e4",
    color: "#2d7a50",
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  },
  meeting: {
    bg: "#e0daf5",
    color: "#6d4c7d",
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  },
  lainnya: {
    bg: "#fce8e8",
    color: "#c86060",
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 3a3 3 0 0 1 0 6H6a3 3 0 0 0 0 6h12"/><circle cx="18" cy="6" r="1" fill="currentColor"/><circle cx="6" cy="18" r="1" fill="currentColor"/></svg>',
  },
};

function renderAgenda() {
  const key = dateKey(selectedDate);
  const items = agendaDB[key] || [];
  const list = $("agenda-list");
  list.innerHTML = "";

  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "cal-agenda-empty";
    empty.textContent = "Belum ada agenda. Tambahkan sekarang!";
    list.appendChild(empty);
    return;
  }

  items.forEach((item, idx) => {
    const iconInfo = AGENDA_ICONS[item.cat] || AGENDA_ICONS.lainnya;
    const li = document.createElement("li");
    li.className = "cal-agenda-item";

    li.innerHTML = `
      <div class="cal-agenda-item__icon" style="background:${iconInfo.bg};color:${iconInfo.color}">
        ${iconInfo.svg}
      </div>
      <div class="cal-agenda-item__body">
        <span class="cal-agenda-item__title">${escapeHtml(item.title)}</span>
        <span class="cal-agenda-item__time">${escapeHtml(item.start)} - ${escapeHtml(item.end)}</span>
      </div>
      <button class="cal-agenda-item__del" data-idx="${idx}" aria-label="Hapus agenda: ${escapeHtml(item.title)}">✕</button>
    `;

    li.querySelector(".cal-agenda-item__del").addEventListener("click", () => {
      agendaDB[key].splice(idx, 1);
      if (agendaDB[key].length === 0) delete agendaDB[key];
      storageSet(STORAGE_KEY_AGENDA, agendaDB);
      renderAgenda();
      renderCalendar(); // refresh dots
    });

    list.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── PRODUCTIVITY MINI-BAR-CHART ── */

function renderStatsChart() {
  const container = $("cal-stats-bars");
  container.innerHTML = "";

  // 7 bars for Mon–Sun of current week, seeded with plausible values
  const dayOfWeek = today.getDay(); // 0=Sun
  const colors = [
    "#b8e0c8",
    "#f0c0c8",
    "#d0c0e8",
    "#b8e0c8",
    "#f0c0c8",
    "#d0c0e8",
    "#b8e0c8",
  ];

  const heights = [55, 70, 45, 85, 60, 75, 40]; // % heights

  for (let i = 0; i < 7; i++) {
    const wrap = document.createElement("div");
    wrap.className = "cal-bar-chart__bar-wrap";

    const bar = document.createElement("div");
    bar.className = "cal-bar-chart__bar";
    bar.style.background = colors[i];
    bar.style.height = "0%";
    bar.style.borderRadius = "8px 8px 4px 4px";
    wrap.appendChild(bar);
    container.appendChild(wrap);

    // Animate in
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        bar.style.height = `${heights[i]}%`;
      }),
    );
  }
}

/* ── MODAL ── */

function openModal() {
  const overlay = $("agenda-modal-overlay");
  overlay.removeAttribute("aria-hidden");
  overlay.classList.add("modal-overlay--visible");
  $("agenda-title-input").focus();
}

function closeModal() {
  const overlay = $("agenda-modal-overlay");
  overlay.setAttribute("aria-hidden", "true");
  overlay.classList.remove("modal-overlay--visible");
  $("agenda-form").reset();
  // reset category
  activeCat = "fokus";
  document.querySelectorAll(".modal__cat").forEach((btn) => {
    const isActive = btn.dataset.cat === activeCat;
    btn.classList.toggle("modal__cat--active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function initModal() {
  // Open buttons
  $("agenda-add-btn").addEventListener("click", openModal);
  $("cal-fab").addEventListener("click", openModal);

  // Close
  $("modal-close").addEventListener("click", closeModal);
  $("agenda-modal-overlay").addEventListener("click", (e) => {
    if (e.target === $("agenda-modal-overlay")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Category toggle
  document.querySelectorAll(".modal__cat").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCat = btn.dataset.cat;
      document.querySelectorAll(".modal__cat").forEach((b) => {
        const active = b.dataset.cat === activeCat;
        b.classList.toggle("modal__cat--active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
    });
  });

  // Submit
  $("agenda-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("agenda-title-input").value.trim();
    const start = $("agenda-start-input").value;
    const end = $("agenda-end-input").value;
    if (!title || !start || !end) return;

    const key = dateKey(selectedDate);
    if (!agendaDB[key]) agendaDB[key] = [];
    agendaDB[key].push({ title, start, end, cat: activeCat });
    storageSet(STORAGE_KEY_AGENDA, agendaDB);

    closeModal();
    renderAgenda();
    renderCalendar();
  });
}

/* ── MONTH NAV ── */

function initMonthNav() {
  $("cal-prev").addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderCalendar();
  });
  $("cal-next").addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderCalendar();
  });
}

/* ── INIT ── */
document.addEventListener("DOMContentLoaded", () => {
  initMonthNav();
  initModal();
  renderCalendar();
  renderAgenda();
  renderStatsChart();
});
