// hooks/useTheme.js — with localStorage persistence
import { useState, useEffect } from "react";

export function useTheme() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("rpi-theme") === "dark"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try { localStorage.setItem("rpi-theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  const toggle = () => setDark(d => !d);
  return { dark, toggle };
}