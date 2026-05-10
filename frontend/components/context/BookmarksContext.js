"use client";

import { createContext, useContext, useEffect, useState } from "react";

const BookmarksContext = createContext(null);

export function BookmarksProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("quran-bookmarks");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setBookmarks(JSON.parse(stored));
    } catch {}
    setMounted(true);
  }, []);

  function save(updated) {
    setBookmarks(updated);
    try {
      localStorage.setItem("quran-bookmarks", JSON.stringify(updated));
    } catch {}
  }

  function addBookmark(ayah) {
    // ayah shape: { numberInQuran, surahNumber, surahName, surahEnglishName, number, arabic, sahih, pickthall, juz, page }
    setBookmarks((prev) => {
      if (prev.find((b) => b.numberInQuran === ayah.numberInQuran)) return prev;
      const updated = [{ ...ayah, savedAt: Date.now() }, ...prev];
      try { localStorage.setItem("quran-bookmarks", JSON.stringify(updated)); } catch {}
      return updated;
    });
  }

  function removeBookmark(numberInQuran) {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.numberInQuran !== numberInQuran);
      try { localStorage.setItem("quran-bookmarks", JSON.stringify(updated)); } catch {}
      return updated;
    });
  }

  function isBookmarked(numberInQuran) {
    return bookmarks.some((b) => b.numberInQuran === numberInQuran);
  }

  function clearAll() {
    save([]);
  }

  return (
    <BookmarksContext.Provider
      value={{ bookmarks, addBookmark, removeBookmark, isBookmarked, clearAll, mounted }}
    >
      {children}
    </BookmarksContext.Provider>
  );
} 

export const useBookmarks = () => useContext(BookmarksContext);     