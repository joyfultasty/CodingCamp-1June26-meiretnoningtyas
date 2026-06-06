/* ============================================================
   PERSONAL PRODUCTIVITY DASHBOARD — MochiFocus
   app.js — Vanilla JavaScript, no frameworks
   ============================================================ */

"use strict";

/* ============================================================
   CONSTANTS
   ============================================================ */
const STORAGE_KEY_TODOS = "prd_todos";
const STORAGE_KEY_LINKS = "prd_links";
const STORAGE_KEY_DURATION = "prd_timer_duration";
const TIMER_DEFAULT = 25 * 60; // 25 minutes in seconds
const RING_RADIUS = 95; // must match SVG r attribute
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 596.9

// Mutable timer max — changes when user edits the minutes field
let timerMax = TIMER_DEFAULT;

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/**
 * Get an element by ID.
 * @param {string} id
 * @returns {HTMLElement}
 */
function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el;
}

/**
 * Generate a simple unique numeric ID.
 * @returns {number}
 */
function generateId() {
  return Date.now();
}

/**
 * Read and parse JSON from localStorage, returning fallback on error.
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
function storageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Stringify and save a value to localStorage.
 * @param {string} key
 * @param {*} value
 */
function storageSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ============================================================
   1. GREETING & CLOCK (Indonesian)
   ============================================================ */

/**
 * Returns an Indonesian greeting based on the current hour.
 * @param {number} hour - 0-23
 * @returns {string}
 */
function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return "Selamat Pagi ✨";
  if (hour >= 12 && hour < 17) return "Selamat Siang 🌤️";
  if (hour >= 17 && hour < 21) return "Selamat Sore 🌇";
  return "Selamat Malam 🌙";
}

/**
 * Formats a Date into Indonesian date string.
 * e.g. "Sabtu, 6 Juni 2026"
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a Date into HH.MM.SS AM/PM (Indonesian style uses dot separator).
 * @param {Date} date
 * @returns {string}
 */
function formatTime(date) {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  const hh = (h % 12 || 12).toString().padStart(2, "0");
  const ampm = h < 12 ? "AM" : "PM";
  return `${hh}.${m}.${s} ${ampm}`;
}

/** Updates the greeting, date, and time in the DOM. */
function updateClock() {
  const now = new Date();
  const hour = now.getHours();

  $("greeting").textContent = getGreeting(hour);
  $("current-date").textContent = formatDate(now);
  $("current-time").textContent = formatTime(now);
}

/** Starts the clock, updating every second. */
function initClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

/* ============================================================
   2. FOCUS TIMER
   ============================================================ */

const timerState = {
  timeLeft: TIMER_DEFAULT,
  isRunning: false,
  intervalId: null,
};

/**
 * Formats seconds into MM:SS string.
 * @param {number} seconds
 * @returns {string}
 */
function formatTimerDisplay(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Updates the SVG ring stroke-dashoffset to reflect progress.
 * Full ring = 0 offset, empty ring = CIRCUMFERENCE offset.
 */
function updateRing() {
  const ring = $("timer-ring");
  const fraction = timerState.timeLeft / timerMax; // 1 → 0
  const offset = CIRCUMFERENCE * (1 - fraction);
  ring.style.strokeDashoffset = offset;
  ring.style.strokeDasharray = CIRCUMFERENCE;

  const pulseGroup = $("timer-pulse-group");
  const rotation = (1 - fraction) * 360;
  pulseGroup.style.setProperty("--timer-rotation", `${rotation}deg`);
}

/** Renders the current timer value to the display and ring. */
function renderTimer() {
  $("timer-display").textContent = formatTimerDisplay(timerState.timeLeft);
  updateRing();
}

/** Syncs button disabled states and ring/pulse animation classes. */
function updateTimerUI() {
  $("timer-start").disabled = timerState.isRunning;
  $("timer-pause").disabled = !timerState.isRunning;

  const minsInput = $("timer-minutes-input");
  if (minsInput) {
    minsInput.disabled = timerState.isRunning;
    const minsField = minsInput.closest(".timer__mins-field");
    if (minsField) {
      if (timerState.isRunning) {
        minsField.classList.add("timer__mins-field--disabled");
      } else {
        minsField.classList.remove("timer__mins-field--disabled");
      }
    }
  }

  const ring = $("timer-ring");
  const pulse = $("timer-pulse");

  if (timerState.isRunning) {
    ring.classList.add("timer__progress--running");
    pulse.classList.add("timer__pulse--active");
  } else {
    ring.classList.remove("timer__progress--running");
    pulse.classList.remove("timer__pulse--active");
  }
}

/** Starts the countdown. Prevents duplicate intervals. */
function startTimer() {
  if (timerState.isRunning) return;

  timerState.isRunning = true;
  updateTimerUI();

  timerState.intervalId = setInterval(() => {
    if (timerState.timeLeft <= 0) {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
      timerState.isRunning = false;
      timerState.timeLeft = 0;
      renderTimer();
      updateTimerUI();
      return;
    }
    timerState.timeLeft -= 1;
    renderTimer();
  }, 1000);
}

/** Pauses the countdown, preserving remaining time. */
function pauseTimer() {
  if (!timerState.isRunning) return;

  clearInterval(timerState.intervalId);
  timerState.intervalId = null;
  timerState.isRunning = false;
  updateTimerUI();
}

/** Resets the timer to the currently set duration. */
function resetTimer() {
  clearInterval(timerState.intervalId);
  timerState.intervalId = null;
  timerState.isRunning = false;
  timerState.timeLeft = timerMax;
  renderTimer();
  updateTimerUI();
}

/** Wires up timer button event listeners. */
function initTimer() {
  // Set initial dasharray so CSS transition works from the start
  const ring = $("timer-ring");
  ring.style.strokeDasharray = CIRCUMFERENCE;
  ring.style.strokeDashoffset = 0;

  // Load saved duration if any
  const savedMins = storageGet(STORAGE_KEY_DURATION, 25);
  timerMax = savedMins * 60;

  // Sync timeLeft with timerMax on init
  timerState.timeLeft = timerMax;

  renderTimer();
  updateTimerUI();

  $("timer-start").addEventListener("click", startTimer);
  $("timer-pause").addEventListener("click", pauseTimer);
  $("timer-reset").addEventListener("click", resetTimer);

  // Minutes input field
  const minsInput = $("timer-minutes-input");
  if (minsInput) {
    minsInput.value = Math.floor(timerMax / 60);

    minsInput.addEventListener("change", () => {
      // Only allow changes when timer is not running
      if (timerState.isRunning) {
        minsInput.value = Math.floor(timerMax / 60);
        return;
      }
      let mins = parseInt(minsInput.value, 10);
      if (isNaN(mins) || mins < 1) mins = 1;
      if (mins > 120) mins = 120;
      minsInput.value = mins;
      timerMax = mins * 60;
      storageSet(STORAGE_KEY_DURATION, mins);
      timerState.timeLeft = timerMax;
      renderTimer();
      updateTimerUI();
    });
  }
}

/* ============================================================
   3. TO-DO LIST
   ============================================================ */

/** @typedef {{ id: number, text: string, completed: boolean }} TodoItem */

/** @type {TodoItem[]} */
let todos = [];

/** Loads todos from localStorage into memory. */
function loadTodos() {
  todos = storageGet(STORAGE_KEY_TODOS, []);
}

/** Persists the current todos array to localStorage. */
function saveTodos() {
  storageSet(STORAGE_KEY_TODOS, todos);
}

/** Updates the task count badge. */
function updateTodoBadge() {
  const badge = $("todo-count");
  const total = todos.length;
  badge.textContent = `${total} TUGAS`;
}

/**
 * Adds a new todo item.
 * @param {string} text
 */
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  // Check for duplicate task (case-insensitive)
  const isDuplicate = todos.some(
    (t) => t.text.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  if (isDuplicate) {
    alert("Tugas ini sudah ada dalam daftar!");
    return;
  }

  todos.push({ id: generateId(), text: trimmed, completed: false });
  saveTodos();
  renderTodos();
}

/**
 * Toggles the completed state of a todo.
 * @param {number} id
 */
function toggleTodo(id) {
  const item = todos.find((t) => t.id === id);
  if (item) {
    item.completed = !item.completed;
    saveTodos();
    renderTodos();
  }
}

/**
 * Deletes a todo by ID.
 * @param {number} id
 */
function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
}

/**
 * Updates the text of a todo.
 * @param {number} id
 * @param {string} newText
 */
function updateTodoText(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return;

  // Check for duplicate task (case-insensitive, ignoring current task ID)
  const isDuplicate = todos.some(
    (t) => t.id !== id && t.text.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  if (isDuplicate) {
    alert("Tugas ini sudah ada dalam daftar!");
    return;
  }

  const item = todos.find((t) => t.id === id);
  if (item) {
    item.text = trimmed;
    saveTodos();
    renderTodos();
  }
}

/**
 * Puts a todo row into inline-edit mode.
 * @param {number} id
 * @param {HTMLElement} itemEl
 * @param {string} currentText
 */
function enterEditMode(id, itemEl, currentText) {
  const textEl = itemEl.querySelector(".todo__text");
  const editBtn = itemEl.querySelector(".btn--icon");

  const input = document.createElement("input");
  input.type = "text";
  input.className = "todo__edit-input";
  input.value = currentText;
  input.setAttribute("aria-label", "Edit tugas");

  textEl.replaceWith(input);
  input.focus();
  input.select();

  if (editBtn) editBtn.textContent = "💾";

  function commitEdit() {
    const newText = input.value.trim();
    if (newText && newText !== currentText) {
      updateTodoText(id, newText);
    } else {
      renderTodos();
    }
  }

  input.addEventListener("blur", commitEdit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    }
    if (e.key === "Escape") {
      renderTodos();
    }
  });
}

/**
 * Builds the DOM for a single todo item.
 * @param {TodoItem} item
 * @returns {HTMLLIElement}
 */
function createTodoElement(item) {
  const li = document.createElement("li");
  li.className = "todo__item";
  li.dataset.id = item.id;

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo__checkbox";
  checkbox.checked = item.completed;
  checkbox.setAttribute(
    "aria-label",
    `Tandai "${item.text}" sebagai ${item.completed ? "belum selesai" : "selesai"}`,
  );
  checkbox.addEventListener("change", () => toggleTodo(item.id));

  // Text
  const span = document.createElement("span");
  span.className = "todo__text" + (item.completed ? " todo__text--done" : "");
  span.textContent = item.text;

  // Actions
  const actions = document.createElement("div");
  actions.className = "todo__actions";

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn--icon";
  editBtn.textContent = "✏️";
  editBtn.setAttribute("aria-label", `Edit tugas: ${item.text}`);
  editBtn.addEventListener("click", () =>
    enterEditMode(item.id, li, item.text),
  );

  const delBtn = document.createElement("button");
  delBtn.className = "btn btn--danger";
  delBtn.textContent = "✕";
  delBtn.setAttribute("aria-label", `Hapus tugas: ${item.text}`);
  delBtn.addEventListener("click", () => deleteTodo(item.id));

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(actions);

  return li;
}

/** Re-renders the full todo list from the in-memory array. */
function renderTodos() {
  const list = $("todo-list");
  list.innerHTML = "";

  updateTodoBadge();

  if (todos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "todo__empty";

    const icon = document.createElement("div");
    icon.className = "todo__empty-icon";
    icon.textContent = "🤖";

    const msg = document.createElement("span");
    msg.textContent = "Belum ada tugas. Ayo mulai berkarya!";

    empty.appendChild(icon);
    empty.appendChild(msg);
    list.appendChild(empty);
    return;
  }

  todos.forEach((item) => list.appendChild(createTodoElement(item)));
}

/** Wires up the todo form submit listener. */
function initTodos() {
  loadTodos();
  renderTodos();

  $("todo-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("todo-input");
    addTodo(input.value);
    input.value = "";
    input.focus();
  });
}

/* ============================================================
   4. QUICK LINKS
   ============================================================ */

/** @typedef {{ id: number, title: string, url: string }} LinkItem */

/** @type {LinkItem[]} */
let quickLinks = [];

/** Loads links from localStorage into memory. */
function loadLinks() {
  quickLinks = storageGet(STORAGE_KEY_LINKS, []);
}

/** Persists the current links array to localStorage. */
function saveLinks() {
  storageSet(STORAGE_KEY_LINKS, quickLinks);
}

/**
 * Ensures a URL has a protocol prefix.
 * @param {string} url
 * @returns {string}
 */
function normalizeUrl(url) {
  const trimmed = url.trim();
  if (trimmed && !/^https?:\/\//i.test(trimmed)) {
    return "https://" + trimmed;
  }
  return trimmed;
}

/**
 * Returns a Google favicon URL for a given site URL.
 * @param {string} url
 * @returns {string}
 */
function getFaviconUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return "";
  }
}

/**
 * Adds a new quick link.
 * @param {string} title
 * @param {string} url
 */
function addLink(title, url) {
  const trimmedTitle = title.trim();
  const normalizedUrl = normalizeUrl(url);

  if (!trimmedTitle || !normalizedUrl) return;

  quickLinks.push({
    id: generateId(),
    title: trimmedTitle,
    url: normalizedUrl,
  });
  saveLinks();
  renderLinks();
}

/**
 * Deletes a quick link by ID.
 * @param {number} id
 */
function deleteLink(id) {
  quickLinks = quickLinks.filter((l) => l.id !== id);
  saveLinks();
  renderLinks();
}

/**
 * Builds the DOM card for a single link.
 * @param {LinkItem} link
 * @returns {HTMLDivElement}
 */
function createLinkElement(link) {
  const wrapper = document.createElement("div");
  wrapper.className = "link__wrapper";

  const anchor = document.createElement("a");
  anchor.className = "link__card";
  anchor.href = link.url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.setAttribute("aria-label", `Buka ${link.title} di tab baru`);

  const faviconUrl = getFaviconUrl(link.url);
  if (faviconUrl) {
    const img = document.createElement("img");
    img.className = "link__favicon";
    img.src = faviconUrl;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.onerror = () => img.remove();
    anchor.appendChild(img);
  }

  const titleEl = document.createElement("span");
  titleEl.className = "link__title";
  titleEl.textContent = link.title;
  anchor.appendChild(titleEl);

  const delBtn = document.createElement("button");
  delBtn.className = "link__delete";
  delBtn.textContent = "✕";
  delBtn.setAttribute("aria-label", `Hapus tautan: ${link.title}`);
  delBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteLink(link.id);
  });

  anchor.appendChild(delBtn);
  wrapper.appendChild(anchor);

  return wrapper;
}

/** Re-renders the full links grid from the in-memory array. */
function renderLinks() {
  const grid = $("links-grid");
  grid.innerHTML = "";

  if (quickLinks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "links__empty";

    const icon = document.createElement("div");
    icon.className = "links__empty-icon";
    // chain-link broken SVG as text fallback
    icon.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`;

    const msg = document.createElement("span");
    msg.textContent = "Belum ada tautan yang disimpan.";

    empty.appendChild(icon);
    empty.appendChild(msg);
    grid.appendChild(empty);
    return;
  }

  quickLinks.forEach((link) => grid.appendChild(createLinkElement(link)));
}

/** Wires up the links form submit listener. */
function initLinks() {
  loadLinks();
  renderLinks();

  $("links-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const titleInput = $("link-title-input");
    const urlInput = $("link-url-input");

    addLink(titleInput.value, urlInput.value);

    titleInput.value = "";
    urlInput.value = "";
    titleInput.focus();
  });
}

/* ============================================================
   5. INITIALISE APPLICATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initTimer();
  initTodos();
  initLinks();
});
