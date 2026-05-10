"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SURAH_NAMES, getSurahMeta } from "../lib/surahMeta";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Preset popular comparisons
const PRESETS = [
  { label: "Fatiha vs Ikhlas",    a: 1,   b: 112, desc: "Opening vs Sincerity" },
  { label: "Baqarah vs Aal-Imran",a: 2,   b: 3,   desc: "Longest Medinan surahs" },
  { label: "Falaq vs Nas",         a: 113, b: 114, desc: "The two protectors" },
  { label: "Yasin vs Mulk",        a: 36,  b: 67,  desc: "Heart & Dominion" },
  { label: "Rahman vs Waqiah",     a: 55,  b: 56,  desc: "Blessings & Resurrection" },
  { label: "Duha vs Sharh",        a: 93,  b: 94,  desc: "Comfort pair" },
];

export default function CompareClient() {
  const [surahA, setSurahA]   = useState(1);
  const [surahB, setSurahB]   = useState(112);
  const [dataA, setDataA]     = useState(null);
  const [dataB, setDataB]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [compared, setCompared] = useState(false);

  async function fetchSurah(num) {
    const res  = await fetch(`${API_BASE}/api/surah/${num}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  }

  async function handleCompare(a = surahA, b = surahB) {
    if (a === b) { setError("Please select two different surahs."); return; }
    setLoading(true);
    setError(null);
    try {
      const [dA, dB] = await Promise.all([fetchSurah(a), fetchSurah(b)]);
      setDataA(dA);
      setDataB(dB);
      setCompared(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(preset) {
    setSurahA(preset.a);
    setSurahB(preset.b);
    handleCompare(preset.a, preset.b);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 500, color: "var(--color-text)", margin: "0 0 4px" }}>
          ⚖️ Surah Comparison
        </h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
          Compare two surahs side by side — themes, length, revelation type and key topics
        </p>
      </div>

      {/* Selector card */}
      <div style={{ padding: "20px", borderRadius: "16px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card-bg)", marginBottom: "20px" }}>

        {/* Surah selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
          <SurahSelector label="Surah A" value={surahA} onChange={setSurahA} color="#c4892e" />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "20px" }}>⚖️</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.1em" }}>VS</span>
          </div>

          <SurahSelector label="Surah B" value={surahB} onChange={setSurahB} color="#7c6fa0" />
        </div>

        {/* Error */}
        {error && (
          <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#ef4444", textAlign: "center" }}>
            ⚠️ {error}
          </p>
        )}

        {/* Compare button */}
        <button
          onClick={() => handleCompare()}
          disabled={loading}
          style={{
            width: "100%", padding: "13px", borderRadius: "12px", fontSize: "14px",
            fontWeight: 700, cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
            border: "none",
            background: "linear-gradient(135deg, #c4892e, #d4a44d)",
            color: "white", opacity: loading ? 0.7 : 1,
            boxShadow: "0 4px 16px rgba(196,137,46,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
        >
          {loading ? (
            <>
              <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Comparing…
            </>
          ) : "⚖️ Compare Surahs"}
        </button>

        {/* Preset buttons */}
        <div style={{ marginTop: "14px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-subtle)" }}>
            Popular Comparisons
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                style={{
                  padding: "5px 12px", borderRadius: "50px", fontSize: "11px", fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "transparent", color: "var(--color-text-muted)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#c4892e"; e.currentTarget.style.color = "#c4892e"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
                title={preset.desc}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {compared && dataA && dataB && !loading && (
        <ComparisonResults dataA={dataA} dataB={dataB} />
      )}
    </div>
  );
}

function SurahSelector({ label, value, onChange, color }) {
  return (
    <div>
      <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color }}>
        {label}
      </p>
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: "10px",
          fontSize: "13px", fontWeight: 600,
          border: `2px solid ${color}44`,
          backgroundColor: `${color}08`,
          color: "var(--color-text)", fontFamily: "inherit",
          outline: "none", cursor: "pointer",
        }}
      >
        {Array.from({ length: 114 }, (_, i) => i + 1).map(n => (
          <option key={n} value={n}>{n}. {SURAH_NAMES[n]}</option>
        ))}
      </select>
    </div>
  );
}

function ComparisonResults({ dataA, dataB }) {
  const metaA = getSurahMeta(dataA.number);
  const metaB = getSurahMeta(dataB.number);
  const maxAyahs = Math.max(dataA.numberOfAyahs, dataB.numberOfAyahs);

  // Shared themes
  const sharedThemes = metaA.themes.filter(t => metaB.themes.includes(t));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* ── Side by side header cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {[
          { data: dataA, meta: metaA, color: "#c4892e", label: "A" },
          { data: dataB, meta: metaB, color: "#7c6fa0", label: "B" },
        ].map(({ data, meta, color, label }) => (
          <div key={label} style={{
            padding: "20px", borderRadius: "16px",
            border: `2px solid ${color}33`,
            backgroundColor: `${color}06`,
          }}>
            {/* Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{
                width: "24px", height: "24px", borderRadius: "7px",
                backgroundColor: color, color: "white",
                fontSize: "11px", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {label}
              </span>
              <span style={{ fontSize: "11px", color, fontWeight: 700 }}>
                Surah {data.number}
              </span>
            </div>

            {/* Arabic name */}
            <p style={{ margin: "0 0 4px", fontFamily: "Amiri, serif", fontSize: "28px", color: "var(--color-text)", direction: "rtl", textAlign: "right" }}>
              {data.name}
            </p>

            {/* English name */}
            <p style={{ margin: "0 0 2px", fontSize: "18px", fontWeight: 700, color: "var(--color-text)" }}>
              {data.englishName}
            </p>
            <p style={{ margin: "0 0 14px", fontSize: "12px", color: "var(--color-text-muted)", fontStyle: "italic" }}>
              {data.englishNameTranslation}
            </p>

            {/* Key stats */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
              {[
                { label: "Ayahs",  value: data.numberOfAyahs },
                { label: "Type",   value: data.revelationType },
              ].map(s => (
                <span key={s.label} style={{
                  padding: "4px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: 700,
                  backgroundColor: `${color}15`, border: `1px solid ${color}44`,
                  color,
                }}>
                  {s.value} {s.label}
                </span>
              ))}
            </div>

            {/* Themes */}
            <div style={{ marginBottom: "10px" }}>
              <p style={{ margin: "0 0 5px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-subtle)" }}>
                Themes
              </p>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {meta.themes.map(t => (
                  <span key={t} style={{
                    padding: "3px 9px", borderRadius: "50px", fontSize: "11px", fontWeight: 600,
                    backgroundColor: sharedThemes.includes(t) ? `${color}20` : "var(--color-surface)",
                    border: `1px solid ${sharedThemes.includes(t) ? color + "55" : "var(--color-border)"}`,
                    color: sharedThemes.includes(t) ? color : "var(--color-text-muted)",
                  }}>
                    {sharedThemes.includes(t) ? "★ " : ""}{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Link */}
            <Link href={`/surah/${data.number}`} style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              fontSize: "12px", fontWeight: 600, color,
              textDecoration: "none", marginTop: "4px",
            }}>
              Read Surah →
            </Link>
          </div>
        ))}
      </div>

      {/* ── Shared themes banner ── */}
      {sharedThemes.length > 0 && (
        <div style={{
          padding: "14px 18px", borderRadius: "12px",
          border: "1px solid rgba(196,137,46,0.3)",
          backgroundColor: "rgba(196,137,46,0.06)",
          display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "16px" }}>🤝</span>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text)" }}>
            <strong style={{ color: "#c4892e" }}>Shared themes:</strong>{" "}
            {sharedThemes.join(", ")}
          </p>
        </div>
      )}

      {/* ── Stats comparison ── */}
      <ComparisonSection title="📊 At a Glance" icon="📊">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Ayah count bar comparison */}
          <div>
            <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Number of Ayahs
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { data: dataA, color: "#c4892e", label: "A" },
                { data: dataB, color: "#7c6fa0", label: "B" },
              ].map(({ data, color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "80px", fontSize: "12px", fontWeight: 600, color: "var(--color-text)", flexShrink: 0 }}>
                    {data.englishName}
                  </span>
                  <div style={{ flex: 1, height: "28px", backgroundColor: "rgba(0,0,0,0.05)", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(data.numberOfAyahs / maxAyahs) * 100}%`,
                      backgroundColor: color, borderRadius: "6px",
                      display: "flex", alignItems: "center", paddingLeft: "10px",
                      transition: "width 0.6s ease",
                    }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "white" }}>
                        {data.numberOfAyahs}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats table */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", backgroundColor: "var(--color-border)", borderRadius: "10px", overflow: "hidden" }}>
            {[
              ["", dataA.englishName, dataB.englishName],
              ["Number", `#${dataA.number}`, `#${dataB.number}`],
              ["Ayahs", dataA.numberOfAyahs, dataB.numberOfAyahs],
              ["Revelation", dataA.revelationType, dataB.revelationType],
              ["Longer?", dataA.numberOfAyahs > dataB.numberOfAyahs ? "✅ Yes" : dataA.numberOfAyahs === dataB.numberOfAyahs ? "Equal" : "No", dataB.numberOfAyahs > dataA.numberOfAyahs ? "✅ Yes" : dataB.numberOfAyahs === dataA.numberOfAyahs ? "Equal" : "No"],
            ].map((row, i) => (
              row.map((cell, j) => (
                <div key={`${i}-${j}`} style={{
                  padding: "10px 14px",
                  backgroundColor: i === 0 || j === 0 ? "rgba(196,137,46,0.07)" : "var(--color-card-bg)",
                  fontSize: i === 0 || j === 0 ? "11px" : "13px",
                  fontWeight: i === 0 || j === 0 ? 700 : 500,
                  color: j === 1 && i > 0 ? "#c4892e" : j === 2 && i > 0 ? "#7c6fa0" : "var(--color-text-muted)",
                  textAlign: j === 0 ? "left" : "center",
                }}>
                  {cell}
                </div>
              ))
            ))}
          </div>
        </div>
      </ComparisonSection>

      {/* ── Key Topics ── */}
      <ComparisonSection title="📌 Key Topics" icon="📌">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[
            { data: dataA, meta: metaA, color: "#c4892e" },
            { data: dataB, meta: metaB, color: "#7c6fa0" },
          ].map(({ data, meta, color }) => (
            <div key={data.number}>
              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {data.englishName}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {meta.topics.map((topic, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: color, flexShrink: 0, marginTop: "6px" }} />
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text)", lineHeight: 1.5 }}>
                      {topic}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ComparisonSection>

      {/* ── First Ayah Preview ── */}
      <ComparisonSection title="📖 Opening Ayah" icon="📖">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[
            { data: dataA, color: "#c4892e" },
            { data: dataB, color: "#7c6fa0" },
          ].map(({ data, color }) => (
            <div key={data.number} style={{
              padding: "16px", borderRadius: "12px",
              border: `1px solid ${color}33`,
              backgroundColor: `${color}05`,
            }}>
              <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {data.englishName} — Ayah 1
              </p>
              <p style={{
                margin: "0 0 10px", fontFamily: "Amiri, serif", fontSize: "22px",
                color: "var(--color-text)", direction: "rtl", textAlign: "right", lineHeight: 2,
              }}>
                {data.ayahs?.[0]?.arabic || ""}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-muted)", fontStyle: "italic", lineHeight: 1.6 }}>
                "{data.ayahs?.[0]?.sahih || ""}"
              </p>
            </div>
          ))}
        </div>
      </ComparisonSection>

      {/* ── Revelation context ── */}
      <ComparisonSection title="🕋 Revelation Context" icon="🕋">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { data: dataA, color: "#c4892e" },
            { data: dataB, color: "#7c6fa0" },
          ].map(({ data, color }) => (
            <div key={data.number} style={{
              padding: "16px", borderRadius: "12px",
              border: `1px solid ${color}33`,
              backgroundColor: `${color}05`,
            }}>
              <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700, color }}>
                {data.englishName}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <InfoRow label="Type" value={data.revelationType} color={color} />
                <InfoRow label="Location" value={data.revelationType === "Meccan" ? "Revealed in Makkah" : "Revealed in Madinah"} color={color} />
                <InfoRow label="Period" value={data.revelationType === "Meccan" ? "610–622 CE (Pre-Hijra)" : "622–632 CE (Post-Hijra)"} color={color} />
                <InfoRow label="Focus" value={data.revelationType === "Meccan" ? "Faith, Tawheed, Hereafter" : "Law, Community, Worship"} color={color} />
              </div>
            </div>
          ))}
        </div>
      </ComparisonSection>

      {/* ── Verdict ── */}
      <div style={{
        padding: "20px 24px", borderRadius: "16px",
        background: "linear-gradient(135deg, rgba(196,137,46,0.1), rgba(124,111,160,0.08))",
        border: "1px solid rgba(196,137,46,0.2)",
      }}>
        <p style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, color: "var(--color-text)" }}>
          🔍 Quick Verdict
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            <strong style={{ color: "#c4892e" }}>{dataA.englishName}</strong> has{" "}
            <strong>{dataA.numberOfAyahs} ayahs</strong> and was revealed in{" "}
            <strong>{dataA.revelationType === "Meccan" ? "Makkah" : "Madinah"}</strong>,
            focusing on <strong>{getSurahMeta(dataA.number).themes.slice(0, 2).join(" and ")}</strong>.
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            <strong style={{ color: "#7c6fa0" }}>{dataB.englishName}</strong> has{" "}
            <strong>{dataB.numberOfAyahs} ayahs</strong> and was revealed in{" "}
            <strong>{dataB.revelationType === "Meccan" ? "Makkah" : "Madinah"}</strong>,
            focusing on <strong>{getSurahMeta(dataB.number).themes.slice(0, 2).join(" and ")}</strong>.
          </p>
          {sharedThemes.length > 0 && (
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#c4892e", fontWeight: 600 }}>
              ★ Both share the theme of: {sharedThemes.join(", ")}
            </p>
          )}
          {dataA.revelationType === dataB.revelationType && (
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#5a9e8f", fontWeight: 600 }}>
              ✓ Both are {dataA.revelationType} surahs
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparisonSection({ title, children }) {
  return (
    <div style={{
      borderRadius: "16px", overflow: "hidden",
      border: "1px solid var(--color-border)",
      backgroundColor: "var(--color-card-bg)",
    }}>
      <div style={{
        padding: "13px 18px",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "rgba(196,137,46,0.04)",
      }}>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--color-text)" }}>
          {title}
        </p>
      </div>
      <div style={{ padding: "18px" }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-subtle)", width: "60px", flexShrink: 0, paddingTop: "1px" }}>
        {label}
      </span>
      <span style={{ fontSize: "12px", color: "var(--color-text)", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}