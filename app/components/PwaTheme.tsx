"use client";

import { useEffect } from "react";

const STORAGE_THEME = "pilates_theme";
const STORAGE_FONT = "pilates_font_scale";

export function PwaTheme() {
  useEffect(() => {
    const apply = () => {
      const t = localStorage.getItem(STORAGE_THEME) || "system";
      const root = document.documentElement;
      if (t === "system") {
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", dark ? "dark" : "light");
      } else {
        root.setAttribute("data-theme", t);
      }
      const scale = parseFloat(localStorage.getItem(STORAGE_FONT) || "1") || 1;
      root.style.setProperty("--pilates-font-scale", String(Math.min(1.35, Math.max(0.9, scale))));
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    window.addEventListener("storage", apply);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) {
      document.body.style.backgroundColor = "var(--pilates-bg, #e8e0cb)";
    }
  }, []);

  return null;
}

export function setPilatesTheme(mode: "system" | "light" | "dark") {
  localStorage.setItem(STORAGE_THEME, mode);
  const root = document.documentElement;
  if (mode === "system") {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", dark ? "dark" : "light");
  } else {
    root.setAttribute("data-theme", mode);
  }
}

export function setPilatesFontScale(scale: number) {
  const s = Math.min(1.35, Math.max(0.9, scale));
  localStorage.setItem(STORAGE_FONT, String(s));
  document.documentElement.style.setProperty("--pilates-font-scale", String(s));
}
