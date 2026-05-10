"use client";

import { useState, useEffect, useRef } from "react";
import { useNotes } from "../components/context/NotesContext";

export default function NoteButton({ ayah }) {
  const { getNote, addNote, updateNote, deleteNote, hasNote, mounted } = useNotes();
  const [open, setOpen]           = useState(false);
  const [text, setText]           = useState("");
  const [saved, setSaved]         = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const textareaRef = useRef(null);

  const ayahKey      = `${ayah.surahNumber}:${ayah.number}`;
  const existingNote = mounted ? getNote(ayahKey) : null;
  const noteExists   = mounted ? hasNote(ayahKey) : false;

  // Load text when modal opens
  useEffect(() => {
    if (open) {
      setText(existingNote?.text || "");
      setSaved(false);
      setConfirmDel(false);
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open]);

  function handleSave() {
    if (!text.trim()) return;
    const noteData = {
      text:             text.trim(),
      surahNumber:      ayah.surahNumber,
      surahEnglishName: ayah.surahEnglishName,
      surahName:        ayah.surahName,
      ayahNumber:       ayah.number,
      numberInQuran:    ayah.numberInQuran,
      arabic:           ayah.arabic,
      sahih:            ayah.sahih,
    };
    if (existingNote) updateNote(ayahKey, text.trim());
    else              addNote(ayahKey, noteData);
    setSaved(true);
    setTimeout(() => { setSaved(false); setOpen(false); }, 900);
  }

  function handleDelete() {
    if (confirmDel) {
      deleteNote(ayahKey);
      setOpen(false);
    } else {
      setConfirmDel(true);
      setTimeout(() => setConfirmDel(false), 3000);
    }
  }

  if (!mounted) return null;

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(true)}
        title={noteExists ? "Edit note" : "Add note"}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "7px 12px", borderRadius: "8px",
          border: `1px solid ${noteExists ? "rgba(124,111,160,0.5)" : "transparent"}`,
          backgroundColor: noteExists ? "rgba(124,111,160,0.1)" : "transparent",
          color: noteExists ? "#7c6fa0" : "var(--color-text-muted)",
          cursor: "pointer", fontSize: "12px", fontWeight: 500,
          fontFamily: "inherit", transition: "all 0.15s",
        }}
        onMouseEnter={e => {
          if (!noteExists) {
            e.currentTarget.style.backgroundColor = "rgba(124,111,160,0.08)";
            e.currentTarget.style.color = "#7c6fa0";
            e.currentTarget.style.borderColor = "rgba(124,111,160,0.35)";
          }
        }}
        onMouseLeave={e => {
          if (!noteExists) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--color-text-muted)";
            e.currentTarget.style.borderColor = "transparent";
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24"
          fill={noteExists ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        <span>{noteExists ? "Note ✓" : "Note"}</span>
      </button>

      {/* ── Modal ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9990,
              backgroundColor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(3px)",
            }}
          />

          {/* Panel */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "fixed", zIndex: 9999,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(560px, 92vw)",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
              border: "1px solid rgba(124,111,160,0.3)",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, rgba(124,111,160,0.1), rgba(124,111,160,0.04))",
              borderBottom: "1px solid rgba(124,111,160,0.15)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#7c6fa0" }}>
                  📝 Personal Note
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#7a7460" }}>
                  {ayah.surahEnglishName} · Ayah {ayah.number}
                  {existingNote?.updatedAt && (
                    <span style={{ marginLeft: "8px", color: "#b4ae97" }}>
                      · Last edited {formatDate(existingNote.updatedAt)}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: "28px", height: "28px", borderRadius: "7px",
                  border: "none", backgroundColor: "rgba(0,0,0,0.05)",
                  cursor: "pointer", fontSize: "16px", color: "#7a7460",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            {/* Arabic preview */}
            <div style={{
              padding: "14px 20px",
              backgroundColor: "rgba(196,137,46,0.04)",
              borderBottom: "1px solid rgba(196,137,46,0.12)",
            }}>
              <p style={{
                margin: 0, direction: "rtl", textAlign: "right",
                fontFamily: "Amiri, serif", fontSize: "22px",
                color: "#1a1814", lineHeight: 2,
              }}>
                {ayah.arabic}
              </p>
              {ayah.sahih && (
                <p style={{
                  margin: "8px 0 0", fontSize: "12px", color: "#7a7460",
                  fontStyle: "italic", lineHeight: 1.6,
                }}>
                  "{ayah.sahih}"
                </p>
              )}
            </div>

            {/* Textarea */}
            <div style={{ padding: "16px 20px 12px" }}>
              <label style={{
                display: "block", fontSize: "10px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.12em",
                color: "#7a7460", marginBottom: "8px",
              }}>
                Your reflection
              </label>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write your thoughts, reflections, or reminders about this ayah…"
                rows={5}
                style={{
                  width: "100%", padding: "12px 14px",
                  borderRadius: "10px", resize: "vertical",
                  border: "1.5px solid rgba(124,111,160,0.25)",
                  backgroundColor: "rgba(124,111,160,0.02)",
                  color: "#1a1814", fontSize: "14px",
                  lineHeight: 1.7, fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box",
                  minHeight: "130px", transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#7c6fa0"}
                onBlur={e => e.target.style.borderColor = "rgba(124,111,160,0.25)"}
              />
              <p style={{
                margin: "5px 0 0", fontSize: "10px",
                color: "#b4ae97", textAlign: "right",
              }}>
                {text.length} characters
              </p>
            </div>

            {/* Footer */}
            <div style={{
              padding: "10px 20px 16px",
              display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: "8px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
            }}>
              {noteExists ? (
                <button
                  onClick={handleDelete}
                  style={{
                    padding: "8px 14px", borderRadius: "8px", fontSize: "12px",
                    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    border: `1px solid ${confirmDel ? "rgba(239,68,68,0.5)" : "#e5e7eb"}`,
                    backgroundColor: confirmDel ? "rgba(239,68,68,0.08)" : "transparent",
                    color: confirmDel ? "#ef4444" : "#9ca3af",
                  }}
                >
                  {confirmDel ? "Confirm delete?" : "🗑 Delete"}
                </button>
              ) : <span />}

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    padding: "8px 16px", borderRadius: "8px", fontSize: "12px",
                    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    border: "1px solid #e5e7eb", backgroundColor: "transparent",
                    color: "#7a7460",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!text.trim() || saved}
                  style={{
                    padding: "8px 20px", borderRadius: "8px", fontSize: "12px",
                    fontWeight: 700, cursor: text.trim() ? "pointer" : "not-allowed",
                    fontFamily: "inherit", border: "none",
                    backgroundColor: saved ? "#16a34a" : "#7c6fa0",
                    color: "white", opacity: !text.trim() ? 0.5 : 1,
                    transition: "background-color 0.2s",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  {saved ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M2 8l4 4 8-8"/>
                      </svg>
                      Saved!
                    </>
                  ) : existingNote ? "Update" : "Save note"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}