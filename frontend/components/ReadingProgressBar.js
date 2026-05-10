"use client"

import { useState } from "react";
import Link from "next/link";
import { useReadingProgress } from "../components/context/ReadingProgressContext";

export default function ReadingProgressBar() {
  const { count, total, percentage, mounted, clearAll } = useReadingProgress();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!mounted || count === 0) return null;

  function handleClear() {
    if (showConfirm) {
      clearAll();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  }

  const MILESTONES = [
    { at: 10,  label: "10%" },
    { at: 25,  label: "Quarter" },
    { at: 50,  label: "Half" },
    { at: 75,  label: "¾ Done" },
    { at: 114, label: "Complete 🎉" },
  ];

  return (
    <div style={{
      marginBottom: "24px", padding: "16px 20px",
      borderRadius: "16px",
      border: "1px solid rgba(196,137,46,0.3)",
      backgroundColor: "rgba(196,137,46,0.05)",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "9px",
            backgroundColor: "rgba(196,137,46,0.12)",
            border: "1px solid rgba(196,137,46,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4892e" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--color-text)" }}>
              Reading Progress
            </p>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--color-text-muted)" }}>
              {count} of {total} surahs read · {percentage}% complete
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/progress" style={{
            fontSize: "12px", color: "#c4892e", textDecoration: "none",
            fontWeight: 600, display: "flex", alignItems: "center", gap: "4px",
          }}>
            View all
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3l5 5-5 5"/>
            </svg>
          </Link>
          <button
            onClick={handleClear}
            style={{
              padding: "5px 10px", borderRadius: "6px", fontSize: "11px",
              border: `1px solid ${showConfirm ? "rgba(239,68,68,0.4)" : "var(--color-border)"}`,
              backgroundColor: showConfirm ? "rgba(239,68,68,0.08)" : "transparent",
              color: showConfirm ? "#ef4444" : "var(--color-text-subtle)",
              cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
            }}
          >
            {showConfirm ? "Confirm?" : "Reset"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: "10px", borderRadius: "5px",
        backgroundColor: "rgba(196,137,46,0.12)",
        overflow: "hidden", marginBottom: "10px",
      }}>
        <div style={{
          height: "100%", width: `${percentage}%`, borderRadius: "5px",
          background: "linear-gradient(90deg, #c4892e, #e2b96a)",
          transition: "width 0.6s ease",
          position: "relative",
        }}>
          {/* Shimmer */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
          }} />
        </div>
      </div>

      {/* Milestone badges */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {MILESTONES.map(m => {
          const reached = count >= m.at;
          return (
            <span key={m.at} style={{
              padding: "2px 9px", borderRadius: "50px", fontSize: "10px", fontWeight: 600,
              backgroundColor: reached ? "rgba(196,137,46,0.15)" : "transparent",
              border: `1px solid ${reached ? "rgba(196,137,46,0.4)" : "var(--color-border)"}`,
              color: reached ? "#c4892e" : "var(--color-text-subtle)",
            }}>
              {m.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}