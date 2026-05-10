"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";   
import { useAudio } from "@/components/AudioPlayer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Modes
const MODES = [
  { id: "hidden",   label: "Full Hide",    icon: "🙈", desc: "Hide entire ayah, reveal all at once" },
  { id: "word",     label: "Word by Word", icon: "📝", desc: "Reveal one word at a time" },
  { id: "blanks",   label: "Fill Blanks",  icon: "✏️", desc: "Random words are hidden" },
];

// Difficulty for blanks mode
const DIFFICULTIES = [
  { id: "easy",   label: "Easy",   pct: 0.25, color: "#5a9e8f" },
  { id: "medium", label: "Medium", pct: 0.50, color: "#c4892e" },
  { id: "hard",   label: "Hard",   pct: 0.75, color: "#b06060" },
];

export default function MemorizeClient() {
  // ── Selection state ──
  const [surahNumber, setSurahNumber] = useState(1);
  const [surahData, setSurahData]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  // ── Session state ──
  const [mode, setMode]               = useState("word");
  const [difficulty, setDifficulty]   = useState("medium");
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  // ── Ayah reveal state ──
  const [revealedWords, setRevealedWords]   = useState(new Set());
  const [fullyRevealed, setFullyRevealed]   = useState(false);
  const [hiddenIndices, setHiddenIndices]   = useState(new Set()); // for blanks mode
  const [showTranslation, setShowTranslation] = useState(false);
  const [score, setScore]                   = useState({ correct: 0, revealed: 0, total: 0 });

  const { loadAyah, togglePlay, currentAyah, playing } = useAudio();

  // ── Fetch surah ──
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res  = await fetch(`${API_BASE}/api/surah/${surahNumber}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        setSurahData(json.data);
        // eslint-disable-next-line react-hooks/immutability
        resetAyah(0, json.data, mode, difficulty);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [surahNumber]);

  // ── Reset for a new ayah ──
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const resetAyah = useCallback((idx, data, m, diff) => {
    const ayah = data?.ayahs?.[idx];
    if (!ayah) return;

    setRevealedWords(new Set());
    setFullyRevealed(false);
    setShowTranslation(false);

    if (m === "blanks") {
      const words  = ayah.arabic.split(" ");
      const count  = Math.max(1, Math.floor(words.length * DIFFICULTIES.find(d => d.id === diff).pct));
      const pool   = Array.from({ length: words.length }, (_, i) => i);
      const hidden = new Set();
      while (hidden.size < count) hidden.add(pool[Math.floor(Math.random() * pool.length)]);
      setHiddenIndices(hidden);
    } else {
      setHiddenIndices(new Set());
    }
  }, []);

  function startSession() {
    setSessionStarted(true);
    setCurrentAyahIdx(0);
    setScore({ correct: 0, revealed: 0, total: surahData?.ayahs?.length || 0 });
    resetAyah(0, surahData, mode, difficulty);
  }

  // ── Word reveal ──
  function revealWord(idx) {
    setRevealedWords(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }

  function revealAll() {
    if (!surahData) return;
    const words = surahData.ayahs[currentAyahIdx].arabic.split(" ");
    setRevealedWords(new Set(words.map((_, i) => i)));
    setFullyRevealed(true);
    setScore(s => ({ ...s, revealed: s.revealed + 1 }));
  }

  function markCorrect() {
    setFullyRevealed(true);
    setScore(s => ({ ...s, correct: s.correct + 1, revealed: s.revealed + 1 }));
    setRevealedWords(new Set(
      surahData.ayahs[currentAyahIdx].arabic.split(" ").map((_, i) => i)
    ));
  }

  // ── Navigate ayahs ──
  function nextAyah() {
    const next = currentAyahIdx + 1;
    if (next >= surahData.ayahs.length) {
      setSessionStarted(false);
      return;
    }
    setCurrentAyahIdx(next);
    resetAyah(next, surahData, mode, difficulty);
  }

  function prevAyah() {
    const prev = currentAyahIdx - 1;
    if (prev < 0) return;
    setCurrentAyahIdx(prev);
    resetAyah(prev, surahData, mode, difficulty);
  }

  function handlePlay() {
    if (!surahData) return;
    const ayah = surahData.ayahs[currentAyahIdx];
    const payload = {
      numberInQuran:    ayah.numberInQuran,
      surahNumber:      surahData.number,
      surahEnglishName: surahData.englishName,
      surahName:        surahData.name,
      number:           ayah.number,
      arabic:           ayah.arabic,
    };
    const list = surahData.ayahs.map(a => ({
      numberInQuran:    a.numberInQuran,
      surahNumber:      surahData.number,
      surahName:        surahData.name,
      surahEnglishName: surahData.englishName,
      number:           a.number,
      arabic:           a.arabic,
    }));
    if (currentAyah?.numberInQuran === payload.numberInQuran) togglePlay();
    else loadAyah(payload, list, true);
  }

  const ayah       = surahData?.ayahs?.[currentAyahIdx];
  const words      = ayah?.arabic?.split(" ") || [];
  const allRevealed = words.length > 0 && revealedWords.size === words.length;
  const progress   = surahData ? Math.round(((currentAyahIdx + (fullyRevealed ? 1 : 0)) / surahData.ayahs.length) * 100) : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 500, color: "var(--color-text)", margin: "0 0 4px" }}>
          🧠 Memorization Mode
        </h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
          Practice Hifz with guided reveal and word-by-word memorization
        </p>
      </div>

      {/* ── SETUP SCREEN ── */}
      {!sessionStarted && (
        <div>
          {/* Surah selector */}
          <div style={{ marginBottom: "20px", padding: "20px", borderRadius: "16px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card-bg)" }}>
            <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-muted)" }}>
              Select Surah
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <select
                value={surahNumber}
                onChange={e => { setSurahNumber(Number(e.target.value)); setSessionStarted(false); }}
                style={{
                  flex: 1, minWidth: "200px", padding: "10px 14px",
                  borderRadius: "10px", fontSize: "13px", fontWeight: 500,
                  border: "1.5px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)", fontFamily: "inherit",
                  outline: "none", cursor: "pointer",
                }}
              >
                {Array.from({ length: 114 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>
                    {n}. {getSurahName(n)}
                  </option>
                ))}
              </select>

              {surahData && (
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                  <span style={{ fontFamily: "Amiri, serif", fontSize: "18px", color: "#c4892e", marginRight: "8px" }}>
                    {surahData.name}
                  </span>
                  {surahData.numberOfAyahs} ayahs · {surahData.revelationType}
                </div>
              )}
            </div>
          </div>

          {/* Mode selector */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-muted)" }}>
              Practice Mode
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  style={{
                    padding: "16px 12px", borderRadius: "12px", textAlign: "center",
                    border: `2px solid ${mode === m.id ? "#c4892e" : "var(--color-border)"}`,
                    backgroundColor: mode === m.id ? "rgba(196,137,46,0.08)" : "var(--color-card-bg)",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  <p style={{ margin: "0 0 6px", fontSize: "24px" }}>{m.icon}</p>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: mode === m.id ? "#c4892e" : "var(--color-text)" }}>
                    {m.label}
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                    {m.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty (blanks mode only) */}
          {mode === "blanks" && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-muted)" }}>
                Difficulty
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    style={{
                      padding: "8px 20px", borderRadius: "50px", fontSize: "12px", fontWeight: 700,
                      border: `1.5px solid ${difficulty === d.id ? d.color : "var(--color-border)"}`,
                      backgroundColor: difficulty === d.id ? `${d.color}18` : "transparent",
                      color: difficulty === d.id ? d.color : "var(--color-text-muted)",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {d.label} ({Math.round(d.pct * 100)}% hidden)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          <button
            onClick={startSession}
            disabled={!surahData || loading}
            style={{
              width: "100%", padding: "16px", borderRadius: "14px", fontSize: "15px",
              fontWeight: 700, cursor: surahData ? "pointer" : "not-allowed",
              fontFamily: "inherit", border: "none",
              background: surahData ? "linear-gradient(135deg, #c4892e, #d4a44d)" : "var(--color-surface)",
              color: surahData ? "white" : "var(--color-text-muted)",
              opacity: loading ? 0.7 : 1,
              boxShadow: surahData ? "0 4px 20px rgba(196,137,46,0.3)" : "none",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            {loading ? (
              <>
                <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Loading surah…
              </>
            ) : (
              <>🧠 Start Memorization Session</>
            )}
          </button>

          {/* Session stats if already done some */}
          {score.total > 0 && (
            <div style={{ marginTop: "16px", padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)" }}>
                Last session: <strong style={{ color: "#c4892e" }}>{score.correct}</strong> of <strong>{score.total}</strong> ayahs recalled correctly
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── PRACTICE SCREEN ── */}
      {sessionStarted && surahData && ayah && (
        <div>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => setSessionStarted(false)}
                style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-muted)" }}
              >
                ← Back
              </button>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)" }}>
                {surahData.englishName}
                <span style={{ fontFamily: "Amiri, serif", fontSize: "16px", color: "#c4892e", marginLeft: "8px" }}>{surahData.name}</span>
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Mode badge */}
              <span style={{ padding: "3px 10px", borderRadius: "50px", fontSize: "10px", fontWeight: 700, backgroundColor: "rgba(196,137,46,0.12)", color: "#c4892e" }}>
                {MODES.find(m => m.id === mode)?.icon} {MODES.find(m => m.id === mode)?.label}
              </span>
              {/* Ayah counter */}
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)" }}>
                {currentAyahIdx + 1} / {surahData.ayahs.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: "6px", borderRadius: "3px", backgroundColor: "rgba(196,137,46,0.12)", marginBottom: "20px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #c4892e, #d4a44d)", borderRadius: "3px", transition: "width 0.4s ease" }} />
          </div>

          {/* Score bar */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            {[
              { label: "Recalled",  value: score.correct,            color: "#5a9e8f" },
              { label: "Revealed",  value: score.revealed - score.correct, color: "#b06060" },
              { label: "Remaining", value: score.total - score.revealed,   color: "#7c6fa0" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: s.color }} />
                <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                  <strong style={{ color: s.color }}>{s.value}</strong> {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── Ayah card ── */}
          <div style={{ borderRadius: "20px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card-bg)", overflow: "hidden", marginBottom: "16px" }}>

            {/* Card header */}
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(196,137,46,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#c4892e" }}>
                Ayah {ayah.number} · Juz {ayah.juz} · Page {ayah.page}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                {/* Listen button */}
                <button
                  onClick={handlePlay}
                  style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: "1px solid rgba(196,137,46,0.3)", backgroundColor: "rgba(196,137,46,0.08)", color: "#c4892e" }}
                >
                  {playing && currentAyah?.numberInQuran === ayah.numberInQuran ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  )}
                  Listen
                </button>
                {/* Show translation toggle */}
                <button
                  onClick={() => setShowTranslation(p => !p)}
                  style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${showTranslation ? "rgba(124,111,160,0.4)" : "var(--color-border)"}`, backgroundColor: showTranslation ? "rgba(124,111,160,0.1)" : "transparent", color: showTranslation ? "#7c6fa0" : "var(--color-text-muted)" }}
                >
                  {showTranslation ? "Hide" : "Show"} Translation
                </button>
              </div>
            </div>

            {/* Translation (collapsible) */}
            {showTranslation && (
              <div style={{ padding: "12px 18px", backgroundColor: "rgba(124,111,160,0.04)", borderBottom: "1px solid rgba(124,111,160,0.1)" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)", fontStyle: "italic", lineHeight: 1.7 }}>
                  "{ayah.sahih}"
                </p>
              </div>
            )}

            {/* Arabic text area */}
            <div style={{ padding: "28px 24px", minHeight: "140px", direction: "rtl", textAlign: "right" }}>

              {/* ── HIDDEN MODE ── */}
              {mode === "hidden" && !fullyRevealed && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", padding: "20px 0" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", direction: "rtl" }}>
                    {words.map((_, i) => (
                      <div
                        key={i}
                        style={{
                          height: "32px",
                          width: `${Math.max(40, Math.random() * 60 + 40)}px`,
                          borderRadius: "6px",
                          backgroundColor: "rgba(196,137,46,0.15)",
                          border: "1px solid rgba(196,137,46,0.2)",
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-subtle)", fontStyle: "italic" }}>
                    Arabic text hidden — try to recall this ayah
                  </p>
                </div>
              )}

              {/* ── WORD BY WORD MODE ── */}
              {mode === "word" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", direction: "rtl", justifyContent: "flex-end" }}>
                  {words.map((word, i) => (
                    <button
                      key={i}
                      onClick={() => !revealedWords.has(i) && revealWord(i)}
                      style={{
                        padding: "6px 12px", borderRadius: "8px", cursor: revealedWords.has(i) ? "default" : "pointer",
                        fontFamily: "Amiri, serif", fontSize: "26px", lineHeight: 1.8, direction: "rtl",
                        border: `1.5px solid ${revealedWords.has(i) ? "rgba(196,137,46,0.3)" : "rgba(196,137,46,0.2)"}`,
                        backgroundColor: revealedWords.has(i) ? "rgba(196,137,46,0.06)" : "rgba(196,137,46,0.15)",
                        color: revealedWords.has(i) ? "var(--color-text)" : "transparent",
                        textShadow: revealedWords.has(i) ? "none" : "0 0 12px rgba(196,137,46,0.6)",
                        transition: "all 0.3s ease",
                        position: "relative",
                        minWidth: "48px",
                      }}
                      title={revealedWords.has(i) ? word : "Click to reveal this word"}
                    >
                      {word}
                      {!revealedWords.has(i) && (
                        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#c4892e" }}>
                          ?
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* ── BLANKS MODE ── */}
              {mode === "blanks" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", direction: "rtl", justifyContent: "flex-end" }}>
                  {words.map((word, i) => {
                    const isHidden  = hiddenIndices.has(i) && !revealedWords.has(i);
                    const isRevealed = hiddenIndices.has(i) && revealedWords.has(i);
                    return (
                      <span
                        key={i}
                        onClick={() => isHidden && revealWord(i)}
                        style={{
                          fontFamily: "Amiri, serif", fontSize: "26px", lineHeight: 1.8,
                          cursor: isHidden ? "pointer" : "default",
                          padding: "4px 8px", borderRadius: "6px",
                          backgroundColor: isHidden
                            ? "rgba(196,137,46,0.15)"
                            : isRevealed
                            ? "rgba(90,158,143,0.1)"
                            : "transparent",
                          border: isHidden
                            ? "1.5px dashed rgba(196,137,46,0.4)"
                            : isRevealed
                            ? "1px solid rgba(90,158,143,0.3)"
                            : "none",
                          color: isHidden ? "transparent" : "var(--color-text)",
                          textShadow: isHidden ? "0 0 10px rgba(196,137,46,0.5)" : "none",
                          transition: "all 0.3s",
                          position: "relative",
                        }}
                        title={isHidden ? "Click to reveal" : ""}
                      >
                        {word}
                        {isHidden && (
                          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#c4892e" }}>
                            ___
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Fully revealed state */}
              {(mode === "hidden" && fullyRevealed) && (
                <p style={{ fontFamily: "Amiri, serif", fontSize: "30px", lineHeight: 2.2, color: "var(--color-text)", direction: "rtl", textAlign: "right", margin: 0 }}>
                  {ayah.arabic}
                </p>
              )}
            </div>

            {/* Word progress for word mode */}
            {mode === "word" && (
              <div style={{ padding: "10px 18px", borderTop: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-text-subtle)" }}>
                    {revealedWords.size} of {words.length} words revealed
                  </span>
                  <div style={{ width: "120px", height: "4px", borderRadius: "2px", backgroundColor: "rgba(196,137,46,0.1)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(revealedWords.size / words.length) * 100}%`, backgroundColor: "#c4892e", borderRadius: "2px", transition: "width 0.3s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Action buttons ── */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

            {/* Hidden mode actions */}
            {mode === "hidden" && !fullyRevealed && (
              <>
                <button
                  onClick={markCorrect}
                  style={{ flex: 1, padding: "12px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", backgroundColor: "#5a9e8f", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  ✅ I recalled it!
                </button>
                <button
                  onClick={revealAll}
                  style={{ flex: 1, padding: "12px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", backgroundColor: "#c4892e", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  👁 Reveal ayah
                </button>
              </>
            )}

            {/* Word mode actions */}
            {mode === "word" && !allRevealed && (
              <>
                <button
                  onClick={() => {
                    const next = words.findIndex((_, i) => !revealedWords.has(i));
                    if (next !== -1) revealWord(next);
                  }}
                  style={{ flex: 1, padding: "12px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", backgroundColor: "#c4892e", color: "white" }}
                >
                  Reveal Next Word →
                </button>
                <button
                  onClick={revealAll}
                  style={{ padding: "12px 18px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-muted)" }}
                >
                  Reveal All
                </button>
              </>
            )}

            {/* Blanks mode actions */}
            {mode === "blanks" && hiddenIndices.size > 0 && revealedWords.size < hiddenIndices.size && (
              <button
                onClick={() => {
                  const next = [...hiddenIndices].find(i => !revealedWords.has(i));
                  if (next !== undefined) revealWord(next);
                }}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", backgroundColor: "#c4892e", color: "white" }}
              >
                Reveal a Word →
              </button>
            )}

            {/* Next ayah — shown when current is fully revealed or all words shown */}
            {(fullyRevealed || allRevealed || (mode === "blanks" && revealedWords.size >= hiddenIndices.size && hiddenIndices.size > 0)) && (
              <button
                onClick={nextAyah}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: "linear-gradient(135deg, #c4892e, #d4a44d)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 4px 16px rgba(196,137,46,0.3)" }}
              >
                {currentAyahIdx + 1 >= surahData.ayahs.length ? "🎉 Finish Session" : "Next Ayah →"}
              </button>
            )}
          </div>

          {/* Prev/Next navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
            <button
              onClick={prevAyah}
              disabled={currentAyahIdx === 0}
              style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: currentAyahIdx === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-muted)", opacity: currentAyahIdx === 0 ? 0.4 : 1 }}
            >
              ← Prev Ayah
            </button>
            <button
              onClick={() => resetAyah(currentAyahIdx, surahData, mode, difficulty)}
              style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-muted)" }}
            >
              🔄 Reset
            </button>
          </div>
        </div>
      )}

      {/* ── SESSION COMPLETE ── */}
      {!sessionStarted && score.total > 0 && score.revealed > 0 && (
        <div style={{ marginTop: "20px", padding: "28px", borderRadius: "20px", border: "1px solid rgba(196,137,46,0.3)", backgroundColor: "rgba(196,137,46,0.05)", textAlign: "center" }}>
          <p style={{ fontSize: "40px", margin: "0 0 12px" }}>🎉</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 500, color: "var(--color-text)", margin: "0 0 8px" }}>
            Session Complete!
          </h2>
          <p style={{ fontSize: "15px", color: "var(--color-text-muted)", margin: "0 0 20px" }}>
            You recalled <strong style={{ color: "#c4892e", fontSize: "20px" }}>{score.correct}</strong> out of <strong>{score.total}</strong> ayahs from memory
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => { setScore({ correct: 0, revealed: 0, total: 0 }); }}
              style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-muted)" }}
            >
              Try Again
            </button>
            <button
              onClick={startSession}
              style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", backgroundColor: "#c4892e", color: "white" }}
            >
              New Session →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Surah names lookup (first 30 + key ones)
function getSurahName(n) {
  const names = {
    1:"Al-Fatihah",2:"Al-Baqarah",3:"Aal-Imran",4:"An-Nisa",5:"Al-Maidah",
    6:"Al-Anam",7:"Al-Araf",8:"Al-Anfal",9:"At-Tawbah",10:"Yunus",
    11:"Hud",12:"Yusuf",13:"Ar-Rad",14:"Ibrahim",15:"Al-Hijr",
    16:"An-Nahl",17:"Al-Isra",18:"Al-Kahf",19:"Maryam",20:"Ta-Ha",
    21:"Al-Anbiya",22:"Al-Hajj",23:"Al-Muminun",24:"An-Nur",25:"Al-Furqan",
    26:"Ash-Shuara",27:"An-Naml",28:"Al-Qasas",29:"Al-Ankabut",30:"Ar-Rum",
    31:"Luqman",32:"As-Sajdah",33:"Al-Ahzab",34:"Saba",35:"Fatir",
    36:"Ya-Sin",37:"As-Saffat",38:"Sad",39:"Az-Zumar",40:"Ghafir",
    41:"Fussilat",42:"Ash-Shura",43:"Az-Zukhruf",44:"Ad-Dukhan",45:"Al-Jathiyah",
    46:"Al-Ahqaf",47:"Muhammad",48:"Al-Fath",49:"Al-Hujurat",50:"Qaf",
    51:"Adh-Dhariyat",52:"At-Tur",53:"An-Najm",54:"Al-Qamar",55:"Ar-Rahman",
    56:"Al-Waqiah",57:"Al-Hadid",58:"Al-Mujadila",59:"Al-Hashr",60:"Al-Mumtahanah",
    61:"As-Saf",62:"Al-Jumuah",63:"Al-Munafiqun",64:"At-Taghabun",65:"At-Talaq",
    66:"At-Tahrim",67:"Al-Mulk",68:"Al-Qalam",69:"Al-Haqqah",70:"Al-Maarij",
    71:"Nuh",72:"Al-Jinn",73:"Al-Muzzammil",74:"Al-Muddaththir",75:"Al-Qiyamah",
    76:"Al-Insan",77:"Al-Mursalat",78:"An-Naba",79:"An-Naziat",80:"Abasa",
    81:"At-Takwir",82:"Al-Infitar",83:"Al-Mutaffifin",84:"Al-Inshiqaq",85:"Al-Buruj",
    86:"At-Tariq",87:"Al-Ala",88:"Al-Ghashiyah",89:"Al-Fajr",90:"Al-Balad",
    91:"Ash-Shams",92:"Al-Layl",93:"Ad-Duha",94:"Ash-Sharh",95:"At-Tin",
    96:"Al-Alaq",97:"Al-Qadr",98:"Al-Bayyinah",99:"Az-Zalzalah",100:"Al-Adiyat",
    101:"Al-Qariah",102:"At-Takathur",103:"Al-Asr",104:"Al-Humazah",105:"Al-Fil",
    106:"Quraysh",107:"Al-Maun",108:"Al-Kawthar",109:"Al-Kafirun",110:"An-Nasr",
    111:"Al-Masad",112:"Al-Ikhlas",113:"Al-Falaq",114:"An-Nas",
  };
  return names[n] || `Surah ${n}`;
}