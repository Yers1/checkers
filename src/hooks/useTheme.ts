"use client";

import { useEffect, useState } from "react";
import { loadTheme, saveTheme, type Theme } from "@/lib/storage";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const t = loadTheme();
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    saveTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggle };
}
