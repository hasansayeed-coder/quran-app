"use client";

import { useBookmarks } from "../components/context/BookmarksContext";

export default function BookmarkButton({ ayah }) {
  const { isBookmarked, addBookmark, removeBookmark, mounted } = useBookmarks();

  if (!mounted) return null;

  const bookmarked = isBookmarked(ayah.numberInQuran);

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarked) removeBookmark(ayah.numberInQuran);
    else addBookmark(ayah);
  }

  return (
    <button
      onClick={toggle}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this ayah"}
      title={bookmarked ? "Remove bookmark" : "Bookmark this ayah"}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "6px", padding: "7px 12px", borderRadius: "8px",
        border: `1px solid ${bookmarked ? "rgba(196,137,46,0.5)" : "transparent"}`,
        backgroundColor: bookmarked ? "rgba(196,137,46,0.15)" : "transparent",
        cursor: "pointer",
        color: bookmarked ? "var(--color-gold)" : "var(--color-text-muted)",
        fontSize: "12px", fontWeight: 500,
        transition: "all 0.15s ease",
        fontFamily: "inherit",
      }}
      onMouseEnter={e => {
        if (!bookmarked) {
          e.currentTarget.style.backgroundColor = "var(--color-surface)";
          e.currentTarget.style.color = "var(--color-gold)";
          e.currentTarget.style.borderColor = "rgba(196,137,46,0.4)";
        } else {
          e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
          e.currentTarget.style.color = "#f87171";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = bookmarked ? "rgba(196,137,46,0.15)" : "transparent";
        e.currentTarget.style.color = bookmarked ? "var(--color-gold)" : "var(--color-text-muted)";
        e.currentTarget.style.borderColor = bookmarked ? "rgba(196,137,46,0.5)" : "transparent";
      }}
    >
      <svg
        width="16" height="16" viewBox="0 0 16 16"
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor" strokeWidth="1.75"
      >
        <path d="M3 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1z"/>
      </svg>
      <span>{bookmarked ? "Saved" : "Save"}</span>
    </button>
  );
}