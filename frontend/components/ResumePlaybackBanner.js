"use client";

import { useState, useEffect } from "react";
import { useAudio, RECITERS } from "@/components/AudioPlayer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ResumePlaybackBanner() {
  const [progress, setProgress] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loadAyah, changeReciter } = useAudio();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("quran-listening-progress");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only show if saved within last 30 days
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.savedAt < thirtyDays) {
          setProgress(parsed);
        }
      }
    } catch {}
  }, []);

  async function handleResume() {
    if (!progress) return;
    setLoading(true);

    try {
      // Fetch the surah to get full ayah list
      const res = await fetch(`${API_BASE}/api/surah/${progress.surahNumber}`);
      const json = await res.json();
      if (!json.success) throw new Error("Failed");

      const surahData = json.data;
      const ayahObj = surahData.ayahs[progress.ayahNumber - 1];

      const ayahPayload = {
        numberInQuran:    progress.numberInQuran,
        surahNumber:      progress.surahNumber,
        surahEnglishName: progress.surahEnglishName,
        surahName:        surahData.name,
        number:           progress.ayahNumber,
        arabic:           ayahObj.arabic,
      };

      const audioList = surahData.ayahs.map(a => ({
        numberInQuran:    a.numberInQuran,
        surahNumber:      surahData.number,
        surahName:        surahData.name,
        surahEnglishName: surahData.englishName,
        number:           a.number,
        arabic:           a.arabic,
      }));

      // Restore the reciter
      const savedReciter = RECITERS.find(r => r.id === progress.reciterId);
      if (savedReciter) changeReciter(savedReciter);

      // Load and play
      loadAyah(ayahPayload, audioList, true);
      setDismissed(true);
    } catch {
      setLoading(false);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    try {
      localStorage.removeItem("quran-listening-progress");
    } catch {}
  }

  function formatDate(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 2) return "just now";
    if (mins < 60) return `${mins} minutes ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  if (!progress || dismissed) return null;

  return (
    <div style={{
      marginBottom: "20px",
      padding: "14px 18px",
      borderRadius: "14px",
      border: "1px solid rgba(196,137,46,0.35)",
      backgroundColor: "rgba(196,137,46,0.07)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      flexWrap: "wrap",
    }}>
      {/* Left — info */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        {/* Icon */}
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          backgroundColor: "rgba(196,137,46,0.15)",
          border: "1px solid rgba(196,137,46,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4892e" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>

        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--color-text)" }}>
            Resume Listening
          </p>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--color-text-muted)" }}>
            {progress.surahEnglishName} · Ayah {progress.ayahNumber}
            <span style={{ margin: "0 6px", color: "var(--color-text-subtle)" }}>·</span>
            {progress.reciterName}
            <span style={{ margin: "0 6px", color: "var(--color-text-subtle)" }}>·</span>
            {formatDate(progress.savedAt)}
          </p>
        </div>
      </div>

      {/* Right — buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={handleResume}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "8px",
            backgroundColor: "#c4892e", color: "white",
            border: "none", cursor: loading ? "wait" : "pointer",
            fontSize: "12px", fontWeight: 600,
            opacity: loading ? 0.7 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {loading ? (
            <div style={{
              width: "12px", height: "12px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "white",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
          {loading ? "Loading…" : "Resume"}
        </button>

        <button
          onClick={handleDismiss}
          style={{
            padding: "8px 12px", borderRadius: "8px",
            backgroundColor: "transparent",
            border: "1px solid var(--color-border)",
            cursor: "pointer", fontSize: "12px",
            color: "var(--color-text-muted)",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}