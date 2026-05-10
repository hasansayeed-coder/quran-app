"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSettings } from "../components/context/SettingsContext";
import { useBookmarks } from "../components/context/BookmarksContext";
import { useAudio } from "@/components/AudioPlayer";
import { MOODS, MOOD_AYAHS } from "@/lib/moodAyahs";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getRandomAyahForMood(moodId) {
  const ayahs = MOOD_AYAHS[moodId];
  if (!ayahs || ayahs.length === 0) return null;
  return ayahs[Math.floor(Math.random() * ayahs.length)];
}

export default function MoodAyah() {
  const { settings, mounted } = useSettings();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { loadAyah, togglePlay, currentAyah, playing } = useAudio();

  const [selectedMood, setSelectedMood] = useState(null);
  const [ayahData, setAyahData]         = useState(null);
  const [moodMeta, setMoodMeta]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [copied, setCopied]             = useState(false);
  const [collapsed, setCollapsed]       = useState(false);

  // Restore last mood from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("quran-mood");
      if (stored) {
        const { moodId } = JSON.parse(stored);
        if (moodId) fetchMoodAyah(moodId);
      }
    } catch {}
  }, []);

  async function fetchMoodAyah(moodId) {
    const mood = MOODS.find(m => m.id === moodId);
    if (!mood) return;

    setSelectedMood(moodId);
    setMoodMeta(mood);
    setLoading(true);
    setError(null);
    setAyahData(null);
    setCollapsed(false);

    // Save mood preference
    try {
      localStorage.setItem("quran-mood", JSON.stringify({ moodId }));
    } catch {}

    const pick = getRandomAyahForMood(moodId);
    if (!pick) { setLoading(false); return; }

    try {
      const res = await fetch(`${API_BASE}/api/surah/${pick.surah}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const surahData = json.data;
      const ayahObj   = surahData.ayahs[pick.ayah - 1];

      setAyahData({
        numberInQuran:    ayahObj.numberInQuran,
        surahNumber:      pick.surah,
        surahName:        surahData.name,
        surahEnglishName: surahData.englishName,
        number:           pick.ayah,
        arabic:           ayahObj.arabic,
        sahih:            ayahObj.sahih,
        pickthall:        ayahObj.pickthall,
        juz:              ayahObj.juz,
        theme:            pick.theme,
      });
    } catch (e) {
      setError("Could not load ayah. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleRefresh() {
    if (selectedMood) fetchMoodAyah(selectedMood);
  }

  async function handleCopy() {
    if (!ayahData) return;
    const text = `${ayahData.arabic}\n\n"${ayahData.sahih}"\n— ${ayahData.surahEnglishName} ${ayahData.surahNumber}:${ayahData.number}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function handlePlay() {
    if (!ayahData) return;
    if (currentAyah?.numberInQuran === ayahData.numberInQuran) togglePlay();
    else loadAyah(ayahData, [ayahData], true);
  }

  function handleBookmark() {
    if (!ayahData) return;
    if (isBookmarked(ayahData.numberInQuran)) removeBookmark(ayahData.numberInQuran);
    else addBookmark(ayahData);
  }

  const bookmarked = mounted && ayahData ? isBookmarked(ayahData.numberInQuran) : false;
  const isPlaying  = currentAyah?.numberInQuran === ayahData?.numberInQuran && playing;
  const translation = mounted ? settings.translation : "sahih";
  const arabicFont  = {
    amiri:        "Amiri, serif",
    scheherazade: "'Scheherazade New', serif",
    noto:         "'Noto Naskh Arabic', serif",
    lateef:       "Lateef, serif",
  }[settings.arabicFont] || "Amiri, serif";

  return (
    <section style={{ marginBottom: "32px" }}>

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <span style={{ color: "#c4892e" }}>✦</span>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: 500, color: "var(--color-text)", marginTop: 10 }}>
          How are you feeling?
        </h2>
        <span style={{ flex: 1, height: "1px", backgroundColor: "rgba(226,194,127,0.3)" }} />
        <span style={{ fontSize: "11px", color: "var(--color-text-subtle)" }}>
          Get a personalised ayah
        </span>
      </div>

      {/* Mood selector pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        {MOODS.map(mood => (
          <button
            key={mood.id}
            onClick={() => fetchMoodAyah(mood.id)}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 16px", borderRadius: "50px",
              border: `1.5px solid ${selectedMood === mood.id ? mood.color : "var(--color-border)"}`,
              backgroundColor: selectedMood === mood.id ? mood.lightBg : "transparent",
              cursor: "pointer", fontSize: "13px", fontWeight: 500,
              color: selectedMood === mood.id ? mood.color : "var(--color-text-muted)",
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => {
              if (selectedMood !== mood.id) {
                e.currentTarget.style.borderColor = mood.color;
                e.currentTarget.style.backgroundColor = mood.lightBg;
                e.currentTarget.style.color = mood.color;
              }
            }}
            onMouseLeave={e => {
              if (selectedMood !== mood.id) {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--color-text-muted)";
              }
            }}
          >
            <span style={{ fontSize: "16px" }}>{mood.emoji}</span>
            {mood.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          padding: "32px", borderRadius: "16px",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-card-bg)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
        }}>
          <div style={{
            width: "20px", height: "20px",
            border: "2px solid var(--color-border)",
            borderTopColor: "#c4892e", borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <span style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
            Finding the perfect ayah for you…
          </span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{
          padding: "16px", borderRadius: "12px",
          border: "1px solid rgba(176,96,96,0.3)",
          backgroundColor: "rgba(176,96,96,0.08)",
          fontSize: "13px", color: "#b06060",
        }}>
          {error}
        </div>
      )}

      {/* Ayah card */}
      {ayahData && !loading && moodMeta && (
        <div style={{
          borderRadius: "16px",
          border: `1px solid ${moodMeta.border}`,
          backgroundColor: "var(--color-card-bg)",
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}>
          {/* Card top strip */}
          <div style={{ height: "3px", backgroundColor: moodMeta.color, opacity: 0.7 }} />

          {/* Card header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: `1px solid var(--color-border-faint)`,
            backgroundColor: moodMeta.lightBg,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Mood badge */}
              <span style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "4px 10px", borderRadius: "50px",
                border: `1px solid ${moodMeta.border}`,
                fontSize: "12px", fontWeight: 600, color: moodMeta.color,
              }}>
                {moodMeta.emoji} {moodMeta.label}
              </span>
              <span style={{ fontSize: "12px", color: "var(--color-text-subtle)", fontStyle: "italic" }}>
                {ayahData.theme}
              </span>
            </div>

            {/* Surah reference */}
            <Link
              href={`/surah/${ayahData.surahNumber}#ayah-${ayahData.number}`}
              style={{
                fontSize: "12px", color: moodMeta.color,
                textDecoration: "none", fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {ayahData.surahEnglishName} {ayahData.surahNumber}:{ayahData.number} →
            </Link>
          </div>

          {/* Arabic text */}
          <div style={{ padding: "24px 24px 16px 24px" }}>
            <p
              style={{
                fontFamily: arabicFont,
                fontSize: `${mounted ? settings.arabicFontSize + 2 : 30}px`,
                color: "var(--color-text)",
                direction: "rtl", textAlign: "right",
                lineHeight: 2.2, margin: "0 0 20px 0",
              }}
            >
              {ayahData.arabic}
            </p>

            {/* Divider */}
            <div style={{ height: "1px", backgroundColor: "var(--color-border-faint)", marginBottom: "16px" }} />

            {/* Translation */}
            <div style={{ marginBottom: "20px" }}>
              {(translation === "sahih" || translation === "both") && (
                <div style={{ marginBottom: translation === "both" ? "12px" : 0 }}>
                  {translation === "both" && (
                    <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-subtle)", margin: "0 0 4px 0" }}>
                      Sahih International
                    </p>
                  )}
                  <p style={{
                    fontSize: `${mounted ? settings.translationFontSize : 16}px`,
                    color: "var(--color-text)", lineHeight: 1.8,
                    fontStyle: "italic", margin: 0,
                  }}>
                    "{ayahData.sahih}"
                  </p>
                </div>
              )}
              {(translation === "pickthall" || translation === "both") && (
                <div style={{ marginTop: translation === "both" ? "12px" : 0 }}>
                  {translation === "both" && (
                    <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-subtle)", margin: "0 0 4px 0" }}>
                      Pickthall
                    </p>
                  )}
                  <p style={{
                    fontSize: `${mounted ? settings.translationFontSize : 16}px`,
                    color: "var(--color-text)", lineHeight: 1.8,
                    fontStyle: "italic", margin: 0,
                  }}>
                    "{ayahData.pickthall}"
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>

              {/* Refresh — get another ayah for same mood */}
              <button
                onClick={handleRefresh}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "8px",
                  backgroundColor: moodMeta.lightBg,
                  border: `1px solid ${moodMeta.border}`,
                  color: moodMeta.color, cursor: "pointer",
                  fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 1l4 4-4 4"/>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  <path d="M7 23l-4-4 4-4"/>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
                Another Ayah
              </button>

              {/* Play */}
              <button
                onClick={handlePlay}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "8px",
                  backgroundColor: isPlaying ? "rgba(196,137,46,0.12)" : "transparent",
                  border: `1px solid ${isPlaying ? "rgba(196,137,46,0.4)" : "var(--color-border)"}`,
                  color: isPlaying ? "#c4892e" : "var(--color-text-muted)",
                  cursor: "pointer", fontSize: "12px", fontWeight: 500, fontFamily: "inherit",
                }}
              >
                {isPlaying ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
                {isPlaying ? "Pause" : "Listen"}
              </button>

              {/* Bookmark */}
              <button
                onClick={handleBookmark}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "8px",
                  backgroundColor: bookmarked ? "rgba(196,137,46,0.12)" : "transparent",
                  border: `1px solid ${bookmarked ? "rgba(196,137,46,0.4)" : "var(--color-border)"}`,
                  color: bookmarked ? "#c4892e" : "var(--color-text-muted)",
                  cursor: "pointer", fontSize: "12px", fontWeight: 500, fontFamily: "inherit",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16"
                  fill={bookmarked ? "currentColor" : "none"}
                  stroke="currentColor" strokeWidth="1.75">
                  <path d="M3 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1z"/>
                </svg>
                {bookmarked ? "Saved" : "Save"}
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "8px",
                  backgroundColor: copied ? "rgba(34,197,94,0.08)" : "transparent",
                  border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "var(--color-border)"}`,
                  color: copied ? "#16a34a" : "var(--color-text-muted)",
                  cursor: "pointer", fontSize: "12px", fontWeight: 500, fontFamily: "inherit",
                }}
              >
                {copied ? (
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 8l4 4 8-8"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <rect x="5" y="5" width="8" height="9" rx="1"/>
                    <path d="M3 3h7a1 1 0 0 1 1 1v1H4a1 1 0 0 0-1 1v8H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h1z" fill="currentColor" stroke="none"/>
                  </svg>
                )}
                {copied ? "Copied!" : "Copy"}
              </button>

              {/* Read full surah */}
              <Link
                href={`/surah/${ayahData.surahNumber}#ayah-${ayahData.number}`}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "8px",
                  backgroundColor: "transparent",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-muted)",
                  fontSize: "12px", fontWeight: 500,
                  textDecoration: "none", marginLeft: "auto",
                }}
              >
                Read Surah
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 3l5 5-5 5"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Empty state — no mood selected yet */}
      {!selectedMood && !loading && (
        <div style={{
          padding: "24px",
          borderRadius: "14px",
          border: "1px dashed var(--color-border)",
          textAlign: "center",
          color: "var(--color-text-subtle)",
        }}>
          <p style={{ fontSize: "28px", margin: "0 0 8px 0" }}>🤲</p>
          <p style={{ fontSize: "13px", margin: 0 }}>
            Select how you're feeling and receive a personalised ayah from the Quran
          </p>
        </div>
      )}
    </section>
  );
}