/* ============================================================
   SETTINGS PAGE — settings.js
   Saves preferences and delegates all apply logic to theme.js
   ============================================================ */

"use strict";

/* theme.js is loaded first and exposes window.__theme */
function loadS() {
  return window.__theme.load();
}
function saveS(s) {
  window.__theme.save(s);
  window.__theme.apply(s);
}
function $(id) {
  return document.getElementById(id);
}

/* ── Toast ── */
let toastTimeout = null;
function showToast(msg) {
  const toast = $("sett-toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.removeAttribute("aria-hidden");
  toast.classList.add("sett-toast--visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("sett-toast--visible");
    toast.setAttribute("aria-hidden", "true");
  }, 2200);
}

/* ── Sidebar navigation ── */
function initSidebarNav() {
  document.querySelectorAll(".sett-nav__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      document.querySelectorAll(".sett-nav__item").forEach((b) => {
        b.classList.toggle("sett-nav__item--active", b === btn);
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      document.querySelectorAll(".sett-panel").forEach((panel) => {
        const isTarget = panel.id === `panel-${section}`;
        panel.classList.toggle("sett-panel--active", isTarget);
        panel.hidden = !isTarget;
      });
    });
  });
}

/* ── Theme palette ── */
function initThemePalette() {
  const s = loadS();
  const swatches = document.querySelectorAll(".theme-swatch");

  // Mark saved active swatch and preview circle on load
  swatches.forEach((sw) => {
    const isActive = sw.dataset.theme === s.theme;
    sw.classList.toggle("theme-swatch--active", isActive);
    sw.setAttribute("aria-pressed", isActive ? "true" : "false");
    const existingTag = sw.querySelector(".theme-swatch__tag");
    if (existingTag) existingTag.remove();
    if (isActive) {
      const tag = document.createElement("span");
      tag.className = "theme-swatch__tag";
      tag.textContent = "AKTIF";
      sw.appendChild(tag);
    }
  });
  updatePreviewCircle(s.theme);

  swatches.forEach((sw) => {
    sw.addEventListener("click", () => {
      const key = sw.dataset.theme;
      const current = loadS();
      current.theme = key;
      saveS(current);
      updatePreviewCircle(key);

      swatches.forEach((s2) => {
        const isActive = s2.dataset.theme === key;
        s2.classList.toggle("theme-swatch--active", isActive);
        s2.setAttribute("aria-pressed", isActive ? "true" : "false");
        const tag = s2.querySelector(".theme-swatch__tag");
        if (tag) tag.remove();
        if (isActive) {
          const newTag = document.createElement("span");
          newTag.className = "theme-swatch__tag";
          newTag.textContent = "AKTIF";
          s2.appendChild(newTag);
        }
      });
      showToast("Tema berhasil diubah ✨");
    });
  });
}

function updatePreviewCircle(themeKey) {
  const circle = $("preview-circle");
  if (!circle) return;
  const vars = window.__theme.vars[themeKey];
  if (vars) circle.style.background = vars["--preview-accent"] || "#e8a4a4";
}

/* ── Brightness slider ── */
function initBrightness() {
  const slider = $("brightness-slider");
  const label = $("brightness-value");
  if (!slider) return;

  const s = loadS();
  slider.value = s.brightness;
  label.textContent = `${s.brightness}%`;
  updateSliderTrack(slider);

  slider.addEventListener("input", () => {
    const val = Number(slider.value);
    label.textContent = `${val}%`;
    slider.setAttribute("aria-valuenow", val);
    updateSliderTrack(slider);
    const current = loadS();
    current.brightness = val;
    saveS(current);
  });
}

function updateSliderTrack(slider) {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const val = Number(slider.value);
  const pct = ((val - min) / (max - min)) * 100;
  slider.style.setProperty("--slider-pct", `${pct}%`);
}

/* ── Dark mode toggle (in settings card) ── */
function initDarkMode() {
  const toggle = $("dark-mode-toggle");
  if (!toggle) return;
  toggle.checked = loadS().darkMode;
  syncToggleTrack(toggle);
  toggle.addEventListener("change", () => {
    const current = loadS();
    current.darkMode = toggle.checked;
    saveS(current);
    syncToggleTrack(toggle);
    showToast(
      current.darkMode ? "Mode gelap aktif 🌙" : "Mode terang aktif ☀️",
    );
  });
}

/* ── Font picker ── */
function initFontPicker() {
  const s = loadS();
  document.querySelectorAll(".font-btn").forEach((btn) => {
    const isActive = btn.dataset.font === s.font;
    btn.classList.toggle("font-btn--active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");

    btn.addEventListener("click", () => {
      const font = btn.dataset.font;
      const current = loadS();
      current.font = font;
      saveS(current);
      document.querySelectorAll(".font-btn").forEach((b) => {
        b.classList.toggle("font-btn--active", b === btn);
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      showToast("Gaya huruf diperbarui ✅");
    });
  });
}

/* ── Visual effects ── */
function initEffects() {
  const s = loadS();

  const animToggle = $("anim-toggle");
  const particleToggle = $("particle-toggle");

  if (animToggle) {
    animToggle.checked = s.animSmooth;
    syncToggleTrack(animToggle);
    animToggle.addEventListener("change", () => {
      const current = loadS();
      current.animSmooth = animToggle.checked;
      saveS(current);
      syncToggleTrack(animToggle);
      showToast(
        current.animSmooth ? "Animasi halus aktif" : "Animasi dimatikan",
      );
    });
  }

  if (particleToggle) {
    particleToggle.checked = s.particles || false;
    syncToggleTrack(particleToggle);
    particleToggle.addEventListener("change", () => {
      const current = loadS();
      current.particles = particleToggle.checked;
      saveS(current);
      syncToggleTrack(particleToggle);
      showToast(
        current.particles
          ? "Partikel kilauan aktif ✨"
          : "Partikel kilauan dimatikan",
      );
    });
  }
}

/* ── Notifications ── */
function initNotifications() {
  const s = loadS();
  const pairs = [
    ["notif-timer", "notifTimer"],
    ["notif-daily", "notifDaily"],
    ["notif-achieve", "notifAchieve"],
  ];
  pairs.forEach(([id, key]) => {
    const el = $(id);
    if (!el) return;
    el.checked = s[key] !== undefined ? s[key] : true;
    syncToggleTrack(el);
    el.addEventListener("change", () => {
      const current = loadS();
      current[key] = el.checked;
      saveS(current);
      syncToggleTrack(el);
      showToast("Preferensi notifikasi disimpan");
    });
  });
}

/* ── Profile ── */
function initProfile() {
  const btn = $("save-profile");
  if (!btn) return;
  btn.addEventListener("click", () => showToast("Profil berhasil disimpan ✅"));
}

/* ── Account ── */
function initAccount() {
  const btn = $("clear-data-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (
      confirm(
        "Yakin ingin menghapus semua data? Tindakan ini tidak bisa dibatalkan.",
      )
    ) {
      localStorage.clear();
      showToast("Semua data telah dihapus 🗑️");
      setTimeout(() => location.reload(), 1500);
    }
  });
}

/* ── Toggle track sync helper ── */
function syncToggleTrack(checkbox) {
  const track = checkbox.nextElementSibling;
  if (track) track.classList.toggle("sett-toggle__track--on", checkbox.checked);
}

/* ── Init all toggles tracks from initial state ── */
function initToggleTracks() {
  document
    .querySelectorAll('.sett-toggle input[type="checkbox"]')
    .forEach((cb) => {
      syncToggleTrack(cb);
      cb.addEventListener("change", () => syncToggleTrack(cb));
    });
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  initSidebarNav();
  initThemePalette();
  initBrightness();
  initDarkMode();
  initFontPicker();
  initEffects();
  initNotifications();
  initProfile();
  initAccount();
  initToggleTracks();
});
