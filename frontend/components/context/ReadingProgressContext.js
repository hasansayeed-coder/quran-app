"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ReadingProgressContext = createContext(null);

export function ReadingProgressProvider({ children }) {
  const [readSurahs, setReadSurahs] = useState(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("quran-reading-progress");
      if (stored) setReadSurahs(new Set(JSON.parse(stored)));
    } catch {}
    setMounted(true);
  }, []);

  function save(updated) {
    try {
      localStorage.setItem("quran-reading-progress", JSON.stringify([...updated]));
    } catch {}
  }

  function markRead(surahNumber) {
    setReadSurahs((prev) => {
      const next = new Set(prev);
      next.add(Number(surahNumber));
      save(next);
      return next;
    });
  }

  function markUnread(surahNumber) {
    setReadSurahs((prev) => {
      const next = new Set(prev);
      next.delete(Number(surahNumber));
      save(next);
      return next;
    });
  }

  function isRead(surahNumber) {
    return readSurahs.has(Number(surahNumber));
  }

  function clearAll() {
    setReadSurahs(new Set());
    try { localStorage.removeItem("quran-reading-progress"); } catch {}
  }

  const count      = readSurahs.size;
  const total      = 114;
  const percentage = Math.round((count / total) * 100);

  return (
    <ReadingProgressContext.Provider
      value={{ readSurahs, markRead, markUnread, isRead, clearAll, count, total, percentage, mounted }}
    >
      {children}
    </ReadingProgressContext.Provider>
  );
}

export const useReadingProgress = () => useContext(ReadingProgressContext);