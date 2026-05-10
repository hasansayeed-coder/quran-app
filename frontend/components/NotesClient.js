"use client";

import { useState } from "react";
import Link from "next/link";
import { useNotes } from "../components/context/NotesContext";

export default function NotesClient() {
  const { notes, deleteNote, clearAll, count, mounted } = useNotes();
  const [search, setSearch]       = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [editingKey, setEditingKey]     = useState(null);
  const [editText, setEditText]         = useState("");
  const { updateNote } = useNotes();

  if (!mounted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: "120px", borderRadius: "14px", backgroundColor: "var(--color-surface)", animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  const allNotes = Object.entries(notes)
    .filter(([, n]) => n?.text?.trim())
    .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0));

  const filtered = search.trim()
    ? allNotes.filter(([, n]) =>
        n.text.toLowerCase().includes(search.toLowerCase()) ||
        n.surahEnglishName?.toLowerCase().includes(search.toLowerCase())
      )
    : allNotes;

  function handleClearAll() {
    if (confirmClear) { clearAll(); setConfirmClear(false); }
    else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); }
  }

  function startEdit(key, currentText) {
    setEditingKey(key);
    setEditText(currentText);
  }

  function saveEdit(key) {
    if (editText.trim()) updateNote(key, editText.trim());
    setEditingKey(null);
  }

  function cancelEdit() { setEditingKey(null); setEditText(""); }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 500, color: "var(--color-text)", margin: "0 0 4px" }}>
            📝 My Notes
          </h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
            {count === 0 ? "No notes yet" : `${count} personal reflection${count !== 1 ? "s" : ""} saved`}
          </p>
        </div>

        {count > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
              border: `1px solid ${confirmClear ? "rgba(239,68,68,0.4)" : "var(--color-border)"}`,
              backgroundColor: confirmClear ? "rgba(239,68,68,0.08)" : "transparent",
              color: confirmClear ? "#ef4444" : "var(--color-text-subtle)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {confirmClear ? "Confirm clear all?" : "Clear all"}
          </button>
        )}
      </div>

      {/* Empty state */}
      {count === 0 && (
        <div style={{ textAlign: "center", padding: "64px 24px" }}>
          <p style={{ fontSize: "48px", margin: "0 0 12px" }}>📝</p>
          <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 8px" }}>
            No notes yet
          </p>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)", margin: "0 0 24px", maxWidth: "320px", marginLeft: "auto", marginRight: "auto" }}>
            Open any surah and click the <strong>Note</strong> button on an ayah to write your reflections
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "10px 20px", borderRadius: "10px",
              backgroundColor: "#7c6fa0", color: "white",
              textDecoration: "none", fontSize: "13px", fontWeight: 600,
            }}
          >
            Browse Surahs →
          </Link>
        </div>
      )}

      {/* Search */}
      {count > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 14px", borderRadius: "10px", marginBottom: "20px",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-card-bg)",
        }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2">
            <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/>
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your notes…"
            style={{
              flex: 1, background: "transparent", border: "none",
              outline: "none", fontSize: "13px", color: "var(--color-text)",
              fontFamily: "inherit",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-subtle)", fontSize: "16px" }}
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* No search results */}
      {count > 0 && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-subtle)" }}>
          <p style={{ fontSize: "28px", margin: "0 0 8px" }}>🔍</p>
          <p style={{ fontSize: "14px" }}>No notes match "{search}"</p>
        </div>
      )}

      {/* Notes list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {filtered.map(([key, note]) => (
          <NoteCard
            key={key}
            ayahKey={key}
            note={note}
            isEditing={editingKey === key}
            editText={editText}
            onEditTextChange={setEditText}
            onEdit={() => startEdit(key, note.text)}
            onSaveEdit={() => saveEdit(key)}
            onCancelEdit={cancelEdit}
            onDelete={() => deleteNote(key)}
            searchQuery={search}
          />
        ))}
      </div>
    </div>
  );
}

function highlight(text, query) {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ backgroundColor: "rgba(124,111,160,0.25)", color: "inherit", borderRadius: "2px", padding: "0 2px" }}>{part}</mark>
      : part
  );
}

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function NoteCard({ ayahKey, note, isEditing, editText, onEditTextChange, onEdit, onSaveEdit, onCancelEdit, onDelete, searchQuery }) {
  const [confirmDel, setConfirmDel] = useState(false);

  function handleDelete() {
    if (confirmDel) { onDelete(); }
    else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); }
  }

  return (
    <div style={{
      borderRadius: "14px",
      border: "1px solid rgba(124,111,160,0.2)",
      backgroundColor: "var(--color-card-bg)",
      overflow: "hidden",
      transition: "box-shadow 0.2s",
    }}>
      {/* Purple top strip */}
      <div style={{ height: "3px", backgroundColor: "#7c6fa0", opacity: 0.5 }} />

      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        backgroundColor: "rgba(124,111,160,0.05)",
        borderBottom: "1px solid rgba(124,111,160,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link
            href={`/surah/${note.surahNumber}#ayah-${note.ayahNumber}`}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "3px 10px", borderRadius: "50px",
              backgroundColor: "rgba(124,111,160,0.12)",
              border: "1px solid rgba(124,111,160,0.3)",
              fontSize: "12px", fontWeight: 600, color: "#7c6fa0",
              textDecoration: "none",
            }}
          >
            {note.surahEnglishName} {note.surahNumber}:{note.ayahNumber}
          </Link>
          <span style={{ fontSize: "11px", color: "var(--color-text-subtle)" }}>
            {formatDate(note.updatedAt || note.savedAt)}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "4px" }}>
          {!isEditing && (
            <button
              onClick={onEdit}
              title="Edit note"
              style={{
                padding: "5px 10px", borderRadius: "6px", fontSize: "11px",
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                border: "1px solid rgba(124,111,160,0.3)",
                backgroundColor: "transparent", color: "#7c6fa0",
              }}
            >
              ✏️ Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            style={{
              padding: "5px 10px", borderRadius: "6px", fontSize: "11px",
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${confirmDel ? "rgba(239,68,68,0.4)" : "var(--color-border)"}`,
              backgroundColor: confirmDel ? "rgba(239,68,68,0.08)" : "transparent",
              color: confirmDel ? "#ef4444" : "var(--color-text-subtle)",
            }}
          >
            {confirmDel ? "Confirm?" : "🗑"}
          </button>
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Arabic */}
        {note.arabic && (
          <p style={{
            direction: "rtl", textAlign: "right",
            fontFamily: "Amiri, serif", fontSize: "18px",
            color: "var(--color-text)", lineHeight: 2,
            margin: "0 0 10px", paddingBottom: "10px",
            borderBottom: "1px solid var(--color-border-faint)",
          }}>
            {note.arabic}
          </p>
        )}

        {/* Note text — edit or display */}
        {isEditing ? (
          <div>
            <textarea
              value={editText}
              onChange={e => onEditTextChange(e.target.value)}
              autoFocus
              rows={4}
              style={{
                width: "100%", padding: "10px 12px",
                borderRadius: "8px", resize: "vertical",
                border: "1.5px solid #7c6fa0",
                backgroundColor: "rgba(124,111,160,0.03)",
                color: "var(--color-text)", fontSize: "14px",
                lineHeight: 1.7, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box",
                minHeight: "100px",
              }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={onCancelEdit}
                style={{
                  padding: "6px 14px", borderRadius: "7px", fontSize: "12px",
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "transparent", color: "var(--color-text-muted)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={onSaveEdit}
                disabled={!editText.trim()}
                style={{
                  padding: "6px 16px", borderRadius: "7px", fontSize: "12px",
                  fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  border: "none", backgroundColor: "#7c6fa0", color: "white",
                  opacity: editText.trim() ? 1 : 0.5,
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p style={{
            margin: 0, fontSize: "14px", lineHeight: 1.8,
            color: "var(--color-text)", whiteSpace: "pre-wrap",
          }}>
            {highlight(note.text, searchQuery)}
          </p>
        )}
      </div>
    </div>
  );
}