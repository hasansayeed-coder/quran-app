"use client";

import { useReadingProgress } from "../components/context/ReadingProgressContext";

export default function MarkAsReadButton({ surahNumber }) {
  const { isRead, markRead, markUnread, mounted } = useReadingProgress();

  if (!mounted) return null;

  const read = isRead(surahNumber);

  function handleClick() {
    if (read) markUnread(surahNumber);
    else markRead(surahNumber);
  }

  return (
    <button
      onClick={handleClick}
      style={{
        display: "flex", alignItems: "center", gap: "7px",
        padding: "9px 18px", borderRadius: "10px",
        border: `1.5px solid ${read ? "rgba(34,197,94,0.5)" : "rgba(196,137,46,0.4)"}`,
        backgroundColor: read ? "rgba(34,197,94,0.08)" : "rgba(196,137,46,0.08)",
        color: read ? "#16a34a" : "#c4892e",
        cursor: "pointer", fontSize: "13px", fontWeight: 600,
        fontFamily: "inherit", transition: "all 0.2s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.opacity = "0.8";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      {read ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Surah Read ✓
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Mark as Read
        </>
      )}
    </button>
  );
}