"use client";

import { createContext, useContext, useEffect, useState } from "react";

const DEFAULTS = {
  arabicFont: "amiri",
  arabicFontSize: 28,
  translationFontSize: 16,
  translation: "sahih",
  sidebarOpen: false,
  darkMode: false,
  showTransliteration: false,
};

const SettingsContext = createContext(DEFAULTS);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("quran-settings");
      if (stored) setSettings({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch {}
    setMounted(true);
  }, []);

  // Keep <html> class in sync with darkMode setting
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode, mounted]);

  function update(key, value) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem("quran-settings", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  return (
    <SettingsContext.Provider value={{ settings, update, mounted }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);