"use client";

import { createContext, useContext, useEffect, useState } from "react";

const NotesContext = createContext(null);

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("quran-notes");
      if (stored) setNotes(JSON.parse(stored));
    } catch {}
    setMounted(true);
  }, []);

  function save(updated) {
    try { localStorage.setItem("quran-notes", JSON.stringify(updated)); } catch {}
  }

  // ayahKey format: "surahNumber:ayahNumber" e.g. "2:255"
  function addNote(ayahKey, noteData) {
    setNotes((prev) => {
      const updated = {
        ...prev,
        [ayahKey]: { ...noteData, savedAt: Date.now(), updatedAt: Date.now() },
      };
      save(updated);
      return updated;
    });
  }

  function updateNote(ayahKey, text) {
    setNotes((prev) => {
      if (!prev[ayahKey]) return prev;
      const updated = {
        ...prev,
        [ayahKey]: { ...prev[ayahKey], text, updatedAt: Date.now() },
      };
      save(updated);
      return updated;
    });
  }

  function deleteNote(ayahKey) {
    setNotes((prev) => {
      const updated = { ...prev };
      delete updated[ayahKey];
      save(updated);
      return updated;
    });
  }

  function getNote(ayahKey) { return notes[ayahKey] || null; }
  function hasNote(ayahKey) { return !!notes[ayahKey]?.text?.trim(); }

  function clearAll() {
    setNotes({});
    try { localStorage.removeItem("quran-notes"); } catch {}
  }

  const count = Object.keys(notes).filter(k => notes[k]?.text?.trim()).length;

  return (
    <NotesContext.Provider value={{
      notes, addNote, updateNote, deleteNote,
      getNote, hasNote, clearAll, count, mounted,
    }}>
      {children}
    </NotesContext.Provider>
  );
}

export const useNotes = () => useContext(NotesContext);