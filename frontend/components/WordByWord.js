"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const GRAMMAR_COLORS = {
  verb:        { bg: "rgba(90,158,143,0.1)",  border: "rgba(90,158,143,0.3)",  color: "#5a9e8f" },
  noun:        { bg: "rgba(107,125,179,0.1)", border: "rgba(107,125,179,0.3)", color: "#6b7db3" },
  particle:    { bg: "rgba(196,137,46,0.1)",  border: "rgba(196,137,46,0.3)",  color: "#c4892e" },
  pronoun:     { bg: "rgba(176,96,96,0.1)",   border: "rgba(176,96,96,0.3)",   color: "#b06060" },
  adjective:   { bg: "rgba(124,111,160,0.1)", border: "rgba(124,111,160,0.3)", color: "#7c6fa0" },
  default:     { bg: "rgba(196,137,46,0.06)", border: "rgba(196,137,46,0.2)",  color: "#7a7460" },
};

function getGrammarStyle(grammar) {
  if (!grammar) return GRAMMAR_COLORS.default;
  const g = grammar.toLowerCase();
  if (g.includes("verb"))     return GRAMMAR_COLORS.verb;
  if (g.includes("noun") || g.includes("name")) return GRAMMAR_COLORS.noun;
  if (g.includes("particle") || g.includes("prep")) return GRAMMAR_COLORS.particle;
  if (g.includes("pronoun"))  return GRAMMAR_COLORS.pronoun;
  if (g.includes("adj"))      return GRAMMAR_COLORS.adjective;
  return GRAMMAR_COLORS.default;
}

export default function WordByWord({ surahNumber, ayahNumber, arabicFont }) {
  const [open, setOpen]       = useState(false);
  const [words, setWords]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [highlight, setHighlight] = useState(null); // highlighted word index

  useEffect(() => {
    if (!open || words) return;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res  = await fetch(`${API_BASE}/api/words/${surahNumber}/${ayahNumber}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load");
        setWords(json.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [open, surahNumber, ayahNumber]);

  return (
    <div style={{ borderTop: "1px solid rgba(226,194,127,0.2)", marginTop: "4px" }}>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "10px 20px",
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#c4892e" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h7"/>
          </svg>
          <span style={{
            fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "#7a7460",
          }}>
            Word by Word
          </span>
          {words && (
            <span style={{
              fontSize: "10px", padding: "1px 7px", borderRadius: "50px",
              backgroundColor: "rgba(196,137,46,0.12)",
              border: "1px solid rgba(196,137,46,0.3)",
              color: "#c4892e", fontWeight: 600,
            }}>
              {words.length} words
            </span>
          )}
        </div>
        <svg
          width="13" height="13" viewBox="0 0 16 16"
          fill="none" stroke="#b4ae97" strokeWidth="2"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div style={{ padding: "4px 20px 20px" }}>

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "20px 0" }}>
              <div style={{
                width: "16px", height: "16px", borderRadius: "50%",
                border: "2px solid rgba(196,137,46,0.2)",
                borderTopColor: "#c4892e",
                animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                Loading word analysis…
              </span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{
              padding: "12px 14px", borderRadius: "10px", marginBottom: "12px",
              backgroundColor: "rgba(176,96,96,0.08)",
              border: "1px solid rgba(176,96,96,0.25)",
              fontSize: "12px", color: "#b06060",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span>⚠️</span>
              <span>Word data unavailable for this ayah. Try another.</span>
            </div>
          )}

          {/* Grammar legend */}
          {words && !loading && (
            <>
              <div style={{
                display: "flex", flexWrap: "wrap", gap: "6px",
                marginBottom: "16px", paddingBottom: "12px",
                borderBottom: "1px solid rgba(226,194,127,0.15)",
              }}>
                {Object.entries(GRAMMAR_COLORS).filter(([k]) => k !== "default").map(([type, style]) => (
                  <span key={type} style={{
                    fontSize: "9px", fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    padding: "2px 8px", borderRadius: "50px",
                    backgroundColor: style.bg,
                    border: `1px solid ${style.border}`,
                    color: style.color,
                  }}>
                    {type}
                  </span>
                ))}
                <span style={{ fontSize: "10px", color: "#b4ae97", marginLeft: "4px", alignSelf: "center" }}>
                  — hover a word for details
                </span>
              </div>

              {/* Word grid — RTL direction */}
              <div style={{
                display: "flex", flexWrap: "wrap", gap: "8px",
                direction: "rtl", justifyContent: "flex-start",
              }}>
                {words.map((word, i) => {
                  const gStyle   = getGrammarStyle(word.grammar);
                  const isHovered = highlight === i;

                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setHighlight(i)}
                      onMouseLeave={() => setHighlight(null)}
                      style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", gap: "4px",
                        padding: "10px 12px", borderRadius: "12px",
                        border: `1.5px solid ${isHovered ? gStyle.border : "rgba(226,194,127,0.25)"}`,
                        backgroundColor: isHovered ? gStyle.bg : "rgba(253,248,240,0.6)",
                        cursor: "default", transition: "all 0.15s ease",
                        minWidth: "60px", direction: "rtl",
                        boxShadow: isHovered ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
                      }}
                    >
                      {/* Arabic word */}
                      <span style={{
                        fontFamily: arabicFont || "Amiri, serif",
                        fontSize: "22px",
                        color: isHovered ? gStyle.color : "#1a1814",
                        lineHeight: 1.4,
                        transition: "color 0.15s",
                      }}>
                        {word.arabic}
                      </span>

                      {/* Divider */}
                      <span style={{
                        width: "100%", height: "1px",
                        backgroundColor: isHovered ? gStyle.border : "rgba(226,194,127,0.2)",
                      }} />

                      {/* Transliteration */}
                      {word.transliteration && (
                        <span style={{
                          fontSize: "10px", color: "#7a7460",
                          fontStyle: "italic", direction: "ltr",
                          textAlign: "center", maxWidth: "80px",
                        }}>
                          {word.transliteration}
                        </span>
                      )}

                      {/* English meaning */}
                      <span style={{
                        fontSize: "11px", fontWeight: 600,
                        color: isHovered ? gStyle.color : "#3d3932",
                        direction: "ltr", textAlign: "center",
                        maxWidth: "90px", lineHeight: 1.3,
                      }}>
                        {word.meaning}
                      </span>

                      {/* Grammar tag */}
                      {word.grammar && (
                        <span style={{
                          fontSize: "9px", fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: "0.06em",
                          padding: "1px 6px", borderRadius: "50px",
                          backgroundColor: gStyle.bg,
                          border: `1px solid ${gStyle.border}`,
                          color: gStyle.color, direction: "ltr",
                          opacity: isHovered ? 1 : 0.7,
                          transition: "opacity 0.15s",
                        }}>
                          {word.grammar}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Word count footer */}
              <p style={{
                marginTop: "14px", fontSize: "10px",
                color: "#b4ae97", textAlign: "center",
              }}>
                {words.length} words · Surah {surahNumber}, Ayah {ayahNumber} · via quran.com
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}