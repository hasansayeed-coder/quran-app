"use client";

import { useState } from "react";

export default function CopyAyahButton({ ayah, translation = "sahih" }) {
  const [copied, setCopied]     = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const ref = ayah.surahEnglishName
    ? `— ${ayah.surahEnglishName} ${ayah.surahNumber}:${ayah.number}`
    : `— Surah ${ayah.surahNumber}:${ayah.number}`;

  const options = [
    {
      id: "arabic",
      label: "Arabic only",
      getText: () => `${ayah.arabic}\n${ref}`,
    },
    {
      id: "translation",
      label: "Translation only",
      getText: () => {
        if (translation === "pickthall") return `"${ayah.pickthall}"\n${ref}`;
        if (translation === "both") return `"${ayah.sahih}"\n\n"${ayah.pickthall}"\n${ref}`;
        return `"${ayah.sahih}"\n${ref}`;
      },
    },
    {
      id: "both",
      label: "Arabic + Translation",
      getText: () => {
        const trans = translation === "pickthall" ? ayah.pickthall
          : translation === "both" ? `${ayah.sahih}\n\n${ayah.pickthall}`
          : ayah.sahih;
        return `${ayah.arabic}\n\n"${trans}"\n${ref}`;
      },
    },
  ];

  async function handleCopy(getText) {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setMenuOpen(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function handleSingleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (menuOpen) { setMenuOpen(false); return; }
    await handleCopy(options[2].getText);
  }

  function handleContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(p => !p);
  }

  return (
    <div style={{ position: "relative" }}>
      {menuOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 10 }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      <button
        onClick={handleSingleClick}
        onContextMenu={handleContextMenu}
        aria-label="Copy ayah"
        title="Click to copy · Right-click for options"
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "7px 12px", borderRadius: "8px",
          border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "transparent"}`,
          backgroundColor: copied ? "rgba(34,197,94,0.1)" : "transparent",
          cursor: "pointer",
          color: copied ? "#4ade80" : "var(--color-text-muted)",
          fontSize: "12px", fontWeight: 500,
          transition: "all 0.15s ease",
          fontFamily: "inherit",
        }}
        onMouseEnter={e => {
          if (!copied) {
            e.currentTarget.style.backgroundColor = "var(--color-surface)";
            e.currentTarget.style.color = "var(--color-gold)";
            e.currentTarget.style.borderColor = "rgba(196,137,46,0.4)";
          }
        }}
        onMouseLeave={e => {
          if (!copied) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--color-text-muted)";
            e.currentTarget.style.borderColor = "transparent";
          }
        }}
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 8l4 4 8-8"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="5" y="5" width="8" height="9" rx="1"/>
            <path d="M3 3h7a1 1 0 0 1 1 1v1H4a1 1 0 0 0-1 1v8H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h1z" fill="currentColor" stroke="none"/>
          </svg>
        )}
        <span>{copied ? "Copied!" : "Copy"}</span>
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", right: 0,
          width: "180px",
          backgroundColor: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          overflow: "hidden", zIndex: 20,
        }}>
          <p style={{
            padding: "8px 12px", fontSize: "10px",
            textTransform: "uppercase", letterSpacing: "0.1em",
            color: "var(--color-text-subtle)", margin: 0,
            borderBottom: "1px solid var(--color-border)",
          }}>
            Copy as…
          </p>
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={e => { e.stopPropagation(); handleCopy(opt.getText); }}
              style={{
                width: "100%", textAlign: "left", padding: "10px 12px",
                fontSize: "12px", color: "var(--color-text)",
                background: "none", border: "none", cursor: "pointer",
                display: "block", fontFamily: "inherit",
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--color-surface)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}