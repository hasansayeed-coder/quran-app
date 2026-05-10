"use client";

import { useState } from "react";
import Link from "next/link";
import { useReadingProgress } from "../components/context/ReadingProgressContext";

const FILTERS = ["All", "Read", "Unread"];

export default function ProgressClient({ surahs }) {
  const { count, total, percentage, isRead, markRead, markUnread, clearAll, mounted } = useReadingProgress();
  const [filter, setFilter] = useState("All");
  const [showConfirm, setShowConfirm] = useState(false);

  if (!mounted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ height: "32px", width: "200px", borderRadius: "8px", backgroundColor: "var(--color-surface)", animation: "pulse 1.5s infinite" }} />
        <div style={{ height: "80px", borderRadius: "16px", backgroundColor: "var(--color-surface)", animation: "pulse 1.5s infinite" }} />
      </div>
    );
  }

  const filtered = surahs.filter(s => {
    if (filter === "Read")   return isRead(s.number);
    if (filter === "Unread") return !isRead(s.number);
    return true;
  });

  function handleClearAll() {
    if (showConfirm) {
      clearAll();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  }

  function handleMarkAll() {
    surahs.forEach(s => markRead(s.number));
  }

  const MILESTONES = [
    { at: 10,  icon: "🌱", label: "Getting Started",  desc: "Read 10 surahs" },
    { at: 25,  icon: "📖", label: "Quarter Way",       desc: "Read 25 surahs (Juz 1–7)" },
    { at: 57,  icon: "⭐", label: "Halfway There",     desc: "Read 57 surahs" },
    { at: 86,  icon: "🏆", label: "Almost There",      desc: "Read 86 surahs" },
    { at: 114, icon: "🎉", label: "Quran Complete",    desc: "Read all 114 surahs" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 500, color: "var(--color-text)", margin: "0 0 4px 0" }}>
              Reading Progress
            </h1>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
              Track your journey through the Noble Quran
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {count < 114 && (
              <button
                onClick={handleMarkAll}
                style={{
                  padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                  border: "1px solid rgba(196,137,46,0.4)",
                  backgroundColor: "rgba(196,137,46,0.08)", color: "#c4892e",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Mark all read
              </button>
            )}
            {count > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                  border: `1px solid ${showConfirm ? "rgba(239,68,68,0.4)" : "var(--color-border)"}`,
                  backgroundColor: showConfirm ? "rgba(239,68,68,0.08)" : "transparent",
                  color: showConfirm ? "#ef4444" : "var(--color-text-subtle)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {showConfirm ? "Confirm reset?" : "Reset all"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Big progress card */}
      <div style={{
        padding: "24px", borderRadius: "20px",
        border: "1px solid rgba(196,137,46,0.3)",
        backgroundColor: "rgba(196,137,46,0.04)",
        marginBottom: "28px",
      }}>
        {/* Stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, fontSize: "42px", fontWeight: 700, color: "#c4892e", lineHeight: 1 }}>
              {count}
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Surahs Read
            </p>
          </div>
          <div style={{ width: "1px", height: "48px", backgroundColor: "var(--color-border)" }} />
          <div>
            <p style={{ margin: 0, fontSize: "42px", fontWeight: 700, color: "var(--color-text)", lineHeight: 1 }}>
              {total - count}
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Remaining
            </p>
          </div>
          <div style={{ width: "1px", height: "48px", backgroundColor: "var(--color-border)" }} />
          <div>
            <p style={{ margin: 0, fontSize: "42px", fontWeight: 700, color: "var(--color-text)", lineHeight: 1 }}>
              {percentage}%
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Complete
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: "14px", borderRadius: "7px",
          backgroundColor: "rgba(196,137,46,0.12)",
          overflow: "hidden", marginBottom: "16px",
        }}>
          <div style={{
            height: "100%", width: `${percentage}%`,
            borderRadius: "7px",
            background: percentage === 100
              ? "linear-gradient(90deg, #16a34a, #4ade80)"
              : "linear-gradient(90deg, #c4892e, #e2b96a)",
            transition: "width 0.6s ease",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            }} />
          </div>
        </div>

        {/* Milestone row */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {MILESTONES.map(m => {
            const reached = count >= m.at;
            return (
              <div
                key={m.at}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px", borderRadius: "10px",
                  border: `1px solid ${reached ? "rgba(196,137,46,0.4)" : "var(--color-border)"}`,
                  backgroundColor: reached ? "rgba(196,137,46,0.1)" : "transparent",
                  opacity: reached ? 1 : 0.5,
                }}
              >
                <span style={{ fontSize: "14px" }}>{m.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: reached ? "#c4892e" : "var(--color-text-muted)" }}>
                    {m.label}
                  </p>
                  <p style={{ margin: 0, fontSize: "10px", color: "var(--color-text-subtle)" }}>
                    {m.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                border: "1px solid",
                borderColor: filter === f ? "#c4892e" : "var(--color-border)",
                backgroundColor: filter === f ? "#c4892e" : "transparent",
                color: filter === f ? "white" : "var(--color-text-muted)",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {f} {f === "Read" ? `(${count})` : f === "Unread" ? `(${total - count})` : `(${total})`}
            </button>
          ))}
        </div>
      </div>

      {/* Surah grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--color-text-subtle)" }}>
          <p style={{ fontSize: "32px", margin: "0 0 8px 0" }}>📖</p>
          <p style={{ fontSize: "14px" }}>
            {filter === "Read" ? "You haven't read any surahs yet." : "All surahs have been read!"}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {filtered.map(surah => (
            <SurahProgressCard
              key={surah.number}
              surah={surah}
              read={isRead(surah.number)}
              onToggle={() => isRead(surah.number) ? markUnread(surah.number) : markRead(surah.number)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SurahProgressCard({ surah, read, onToggle }) {
  return (
    <div style={{
      borderRadius: "12px",
      border: `1px solid ${read ? "rgba(34,197,94,0.3)" : "var(--color-border)"}`,
      backgroundColor: read ? "rgba(34,197,94,0.04)" : "var(--color-card-bg)",
      overflow: "hidden", transition: "all 0.2s ease",
    }}>
      {/* Top strip */}
      {read && (
        <div style={{ height: "3px", backgroundColor: "#16a34a", opacity: 0.6 }} />
      )}

      <div style={{ padding: "12px 14px" }}>
        {/* Number + Arabic */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{
            width: "28px", height: "28px", borderRadius: "7px",
            backgroundColor: read ? "rgba(34,197,94,0.12)" : "rgba(196,137,46,0.1)",
            border: `1px solid ${read ? "rgba(34,197,94,0.3)" : "rgba(196,137,46,0.25)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: 700, fontFamily: "monospace",
            color: read ? "#16a34a" : "#c4892e", flexShrink: 0,
          }}>
            {read ? "✓" : surah.number}
          </span>
          <span style={{ fontFamily: "Amiri, serif", fontSize: "16px", color: "var(--color-text)", direction: "rtl" }}>
            {surah.name}
          </span>
        </div>

        {/* English name */}
        <p style={{ margin: "0 0 2px 0", fontSize: "13px", fontWeight: 600, color: "var(--color-text)" }}>
          {surah.englishName}
        </p>
        <p style={{ margin: "0 0 10px 0", fontSize: "11px", color: "var(--color-text-muted)" }}>
          {surah.englishNameTranslation} · {surah.numberOfAyahs} ayahs
        </p>

        {/* Action row */}
        <div style={{ display: "flex", gap: "6px" }}>
          <Link
            href={`/surah/${surah.number}`}
            style={{
              flex: 1, textAlign: "center", padding: "6px 0",
              borderRadius: "7px", fontSize: "11px", fontWeight: 600,
              border: "1px solid rgba(196,137,46,0.35)",
              backgroundColor: "rgba(196,137,46,0.06)",
              color: "#c4892e", textDecoration: "none",
            }}
          >
            Read
          </Link>
          <button
            onClick={onToggle}
            style={{
              flex: 1, padding: "6px 0", borderRadius: "7px",
              fontSize: "11px", fontWeight: 600, cursor: "pointer",
              border: `1px solid ${read ? "rgba(34,197,94,0.35)" : "var(--color-border)"}`,
              backgroundColor: read ? "rgba(34,197,94,0.06)" : "transparent",
              color: read ? "#16a34a" : "var(--color-text-muted)",
              fontFamily: "inherit",
            }}
          >
            {read ? "Unmark" : "Mark read"}
          </button>
        </div>
      </div>
    </div>
  );
}