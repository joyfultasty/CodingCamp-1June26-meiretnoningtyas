/* ============================================================
   theme.js — Shared settings applier
   Load this on EVERY page (first script, before body content)
   so theme/font/dark-mode are applied before paint.
   ============================================================ */

(function () {
  "use strict";

  const STORAGE_KEY = "prd_settings";

  const DEFAULTS = {
    theme: "pastel-dreamland",
    brightness: 100,
    darkMode: false,
    font: "Plus Jakarta Sans",
    animSmooth: true,
  };

  const THEME_VARS = {
    "pastel-dreamland": {
      "--color-primary": "#6d4c7d",
      "--color-primary-hover": "#5a3d68",
      "--color-pink": "#e8a4a4",
      "--color-pink-btn": "#e8a4a4",
      "--color-pink-btn-hover": "#d98f8f",
      "--color-green": "#2d6a4f",
      "--color-green-btn": "#2d6a4f",
      "--color-mauve-dark": "#4a2c3f",
      "--color-bg": "#f5f5f0",
      "--preview-accent": "#e8a4a4",
    },
    "minty-fresh": {
      "--color-primary": "#2d7a50",
      "--color-primary-hover": "#245940",
      "--color-pink": "#a8d8b8",
      "--color-pink-btn": "#6ec99a",
      "--color-pink-btn-hover": "#4db880",
      "--color-green": "#1a5c38",
      "--color-green-btn": "#1a5c38",
      "--color-mauve-dark": "#1a4030",
      "--color-bg": "#f0f8f4",
      "--preview-accent": "#6ec99a",
    },
    "lavender-sky": {
      "--color-primary": "#7a5c9a",
      "--color-primary-hover": "#624880",
      "--color-pink": "#c8b8e8",
      "--color-pink-btn": "#a888c8",
      "--color-pink-btn-hover": "#9070b8",
      "--color-green": "#5c5a9a",
      "--color-green-btn": "#5c5a9a",
      "--color-mauve-dark": "#3a2860",
      "--color-bg": "#f4f0fa",
      "--preview-accent": "#a888c8",
    },
    "lemon-sorbet": {
      "--color-primary": "#8a7020",
      "--color-primary-hover": "#6a5418",
      "--color-pink": "#f0e0a0",
      "--color-pink-btn": "#e0c860",
      "--color-pink-btn-hover": "#c8b040",
      "--color-green": "#5a6820",
      "--color-green-btn": "#5a6820",
      "--color-mauve-dark": "#4a4010",
      "--color-bg": "#fafaf0",
      "--preview-accent": "#e0c860",
    },
    "cloudy-blue": {
      "--color-primary": "#3a5888",
      "--color-primary-hover": "#2c4470",
      "--color-pink": "#b8cce8",
      "--color-pink-btn": "#88aad8",
      "--color-pink-btn-hover": "#6890c8",
      "--color-green": "#3a6880",
      "--color-green-btn": "#3a6880",
      "--color-mauve-dark": "#1e3858",
      "--color-bg": "#f0f4fa",
      "--preview-accent": "#88aad8",
    },
  };

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function saveSettings(s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  /**
   * Apply all visual settings to the current document.
   * Called on page load and whenever settings change.
   */
  function applySettings(s) {
    const root = document.documentElement;

    // 1. Theme CSS variables
    const vars = THEME_VARS[s.theme] || THEME_VARS["pastel-dreamland"];
    Object.entries(vars).forEach(([k, v]) => {
      if (k !== "--preview-accent") root.style.setProperty(k, v);
    });

    // 2. Dark mode
    document.body.classList.toggle("dark-mode", !!s.darkMode);

    // 3. Brightness
    root.style.filter =
      s.brightness < 100 ? `brightness(${s.brightness / 100})` : "";

    // 4. Font
    document.body.style.fontFamily = `'${s.font}', 'Segoe UI', system-ui, sans-serif`;

    // 5. Animation speed
    root.style.setProperty("--transition", s.animSmooth ? "0.2s ease" : "0s");

    // 6. Sync dark mode toggle in navbar (if present)
    const dmBtn = document.getElementById("navbar-darkmode-btn");
    if (dmBtn) {
      dmBtn.setAttribute("aria-pressed", s.darkMode ? "true" : "false");
      dmBtn.title = s.darkMode ? "Mode terang" : "Mode gelap";
      // swap icon
      const sunIcon = dmBtn.querySelector(".icon-sun");
      const moonIcon = dmBtn.querySelector(".icon-moon");
      if (sunIcon) sunIcon.style.display = s.darkMode ? "block" : "none";
      if (moonIcon) moonIcon.style.display = s.darkMode ? "none" : "block";
    }
  }

  // ── Expose to window so settings.js and the toggle can call it ──
  window.__theme = {
    load: loadSettings,
    save: saveSettings,
    apply: applySettings,
    vars: THEME_VARS,
  };

  // Apply immediately on every page load (no flash)
  const s = loadSettings();
  // Body may not exist yet if script is in <head>, so defer body-class to DOMContentLoaded
  if (document.body) {
    applySettings(s);
  } else {
    document.addEventListener("DOMContentLoaded", () => applySettings(s));
  }

  // Wire up the navbar dark-mode toggle after DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    const dmBtn = document.getElementById("navbar-darkmode-btn");
    if (!dmBtn) return;
    dmBtn.addEventListener("click", () => {
      const current = window.__theme.load();
      current.darkMode = !current.darkMode;
      window.__theme.save(current);
      window.__theme.apply(current);
    });
  });
})();
