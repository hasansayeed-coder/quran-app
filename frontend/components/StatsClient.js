"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ── Static Quran data ──────────────────────────────────────────────────────────

const TOTAL_FACTS = [
  { label: "Total Surahs",        value: "114",     icon: "📖", color: "#c4892e" },
  { label: "Total Ayahs",         value: "6,236",   icon: "✍️", color: "#7c6fa0" },
  { label: "Total Words",         value: "77,430",  icon: "🔤", color: "#5a9e8f" },
  { label: "Total Letters",       value: "321,180", icon: "🔡", color: "#b06060" },
  { label: "Meccan Surahs",       value: "86",      icon: "🕋", color: "#c4892e" },
  { label: "Medinan Surahs",      value: "28",      icon: "🕌", color: "#5a9e8f" },
  { label: "Total Juz",           value: "30",      icon: "📚", color: "#7c6fa0" },
  { label: "Total Pages",         value: "604",     icon: "📄", color: "#6b7db3" },
  { label: "Prostration Verses",  value: "15",      icon: "🤲", color: "#b06060" },
  { label: "Years of Revelation", value: "23",      icon: "📅", color: "#5a9e8f" },
];

const MENTIONED_NAMES = [
  { name: "Musa (Moses)",    arabic: "موسى",    count: 136, color: "#c4892e" },
  { name: "Ibrahim",         arabic: "إبراهيم", count: 69,  color: "#7c6fa0" },
  { name: "Isa (Jesus)",     arabic: "عيسى",    count: 25,  color: "#5a9e8f" },
  { name: "Adam",            arabic: "آدم",     count: 25,  color: "#b06060" },
  { name: "Nuh (Noah)",      arabic: "نوح",     count: 43,  color: "#6b7db3" },
  { name: "Yusuf (Joseph)",  arabic: "يوسف",    count: 27,  color: "#c4892e" },
  { name: "Dawud (David)",   arabic: "داود",    count: 16,  color: "#7c6fa0" },
  { name: "Sulayman",        arabic: "سليمان",  count: 17,  color: "#5a9e8f" },
  { name: "Muhammad ﷺ",     arabic: "محمد",    count: 4,   color: "#b06060" },
  { name: "Maryam (Mary)",   arabic: "مريم",    count: 34,  color: "#6b7db3" },
];

const REVELATION_ORDER = [
  { number: 96, name: "Al-Alaq",      english: "The Clot",         order: 1,   type: "Meccan" },
  { number: 68, name: "Al-Qalam",     english: "The Pen",           order: 2,   type: "Meccan" },
  { number: 73, name: "Al-Muzzammil", english: "The Enshrouded One",order: 3,   type: "Meccan" },
  { number: 74, name: "Al-Muddaththir",english:"The Cloaked One",   order: 4,   type: "Meccan" },
  { number: 1,  name: "Al-Fatihah",   english: "The Opening",       order: 5,   type: "Meccan" },
  { number: 111,name: "Al-Masad",     english: "The Palm Fiber",    order: 6,   type: "Meccan" },
  { number: 81, name: "At-Takwir",    english: "The Overthrowing",  order: 7,   type: "Meccan" },
  { number: 87, name: "Al-Ala",       english: "The Most High",     order: 8,   type: "Meccan" },
  { number: 92, name: "Al-Layl",      english: "The Night",         order: 9,   type: "Meccan" },
  { number: 89, name: "Al-Fajr",      english: "The Dawn",          order: 10,  type: "Meccan" },
  // Medinan ones revealed later
  { number: 2,  name: "Al-Baqarah",   english: "The Cow",           order: 87,  type: "Medinan" },
  { number: 3,  name: "Aal-Imran",    english: "The Family of Imran",order: 89, type: "Medinan" },
  { number: 4,  name: "An-Nisa",      english: "The Women",         order: 92,  type: "Medinan" },
  { number: 5,  name: "Al-Ma'idah",   english: "The Table Spread",  order: 112, type: "Medinan" },
  { number: 9,  name: "At-Tawbah",    english: "The Repentance",    order: 113, type: "Medinan" },
];

const LONGEST_SURAHS = [
  { number: 2,   name: "Al-Baqarah",   ayahs: 286, words: 6144 },
  { number: 26,  name: "Ash-Shu'ara",  ayahs: 227, words: 1320 },
  { number: 7,   name: "Al-A'raf",     ayahs: 206, words: 3325 },
  { number: 4,   name: "An-Nisa",      ayahs: 176, words: 3763 },
  { number: 3,   name: "Aal-Imran",    ayahs: 200, words: 3503 },
  { number: 6,   name: "Al-An'am",     ayahs: 165, words: 3055 },
  { number: 37,  name: "As-Saffat",    ayahs: 182, words: 866  },
  { number: 11,  name: "Hud",          ayahs: 123, words: 1948 },
];

const SHORTEST_SURAHS = [
  { number: 108, name: "Al-Kawthar",  ayahs: 3, words: 10 },
  { number: 103, name: "Al-Asr",      ayahs: 3, words: 14 },
  { number: 112, name: "Al-Ikhlas",   ayahs: 4, words: 15 },
  { number: 111, name: "Al-Masad",    ayahs: 5, words: 23 },
  { number: 114, name: "An-Nas",      ayahs: 6, words: 20 },
  { number: 113, name: "Al-Falaq",    ayahs: 5, words: 23 },
  { number: 110, name: "An-Nasr",     ayahs: 3, words: 19 },
  { number: 107, name: "Al-Ma'un",    ayahs: 7, words: 25 },
];

const FUN_FACTS = [
  { icon: "🌟", fact: "The word 'Allah' appears 2,699 times in the Quran" },
  { icon: "⚖️", fact: "The words 'Dunya' (this world) and 'Akhirah' (hereafter) each appear exactly 115 times" },
  { icon: "🌙", fact: "Surah Al-Baqarah is the longest surah with 286 ayahs" },
  { icon: "✨", fact: "Surah Al-Kawthar is the shortest surah with only 3 ayahs and 10 words" },
  { icon: "📿", fact: "The middle surah of the Quran is Surah Al-Kahf (18)" },
  { icon: "🔤", fact: "The Quran begins with 'B' (Bismillah) and ends with 'N' (Nas)" },
  { icon: "👁", fact: "The word 'Bashar' (human) and 'Mala'ikah' (angels) each appear 88 times" },
  { icon: "💧", fact: "The word 'Rain' appears 32 times, equal to the number of times 'Rivers' appears" },
  { icon: "🕌", fact: "Only one surah is named after a woman — Surah Maryam (Chapter 19)" },
  { icon: "📖", fact: "The Quran was revealed over 23 years — 13 years in Makkah and 10 in Madinah" },
  { icon: "🔢", fact: "The number 19 has special mathematical significance in the Quran's structure" },
  { icon: "🌍", fact: "Surah Yusuf (12) is the only surah that tells one complete story from beginning to end" },
];

// ── Bar chart component ────────────────────────────────────────────────────────
function BarChart({ data, maxValue, color, showLabel = true }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {data.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {showLabel && (
            <div style={{ width: "130px", flexShrink: 0, textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "var(--color-text)", lineHeight: 1.3 }}>
                {item.name}
              </p>
              {item.arabic && (
                <p style={{ margin: 0, fontSize: "13px", color: "#c4892e", fontFamily: "Amiri, serif" }}>
                  {item.arabic}
                </p>
              )}
            </div>
          )}
          <div style={{ flex: 1, height: "28px", backgroundColor: "rgba(196,137,46,0.08)", borderRadius: "6px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(item.count / maxValue) * 100}%`,
                backgroundColor: item.color || color || "#c4892e",
                borderRadius: "6px",
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                paddingRight: "8px",
                transition: "width 0.8s ease",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>
                {item.count}×
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Donut chart component ──────────────────────────────────────────────────────
function DonutChart({ meccan, medinan }) {
  const total = meccan + medinan;
  const meccanPct = (meccan / total) * 100;
  const medianPct = (medinan / total) * 100;

  // SVG donut
  const r = 60, cx = 75, cy = 75;
  const circ = 2 * Math.PI * r;
  const meccanDash = (meccan / total) * circ;
  const medianDash = (medinan / total) * circ;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(196,137,46,0.1)" strokeWidth="22" />
        {/* Meccan arc */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="#c4892e" strokeWidth="22"
          strokeDasharray={`${meccanDash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* Medinan arc */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="#5a9e8f" strokeWidth="22"
          strokeDasharray={`${medianDash} ${circ}`}
          strokeDashoffset={-meccanDash}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--color-text, #1a1814)">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="var(--color-text-muted, #7a7460)">
          SURAHS
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: "#c4892e", flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--color-text)" }}>
              Meccan — {meccan}
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-muted)" }}>
              {meccanPct.toFixed(1)}% of all surahs
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: "#5a9e8f", flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--color-text)" }}>
              Medinan — {medinan}
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-muted)" }}>
              {medianPct.toFixed(1)}% of all surahs
            </p>
          </div>
        </div>
        <div style={{ marginTop: "4px", padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(196,137,46,0.06)", border: "1px solid rgba(196,137,46,0.15)" }}>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            <strong style={{ color: "#c4892e" }}>Meccan</strong> surahs focus on faith, theology & the Hereafter.<br/>
            <strong style={{ color: "#5a9e8f" }}>Medinan</strong> surahs focus on law, community & society.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div style={{
      borderRadius: "18px", overflow: "hidden",
      border: "1px solid var(--color-border)",
      backgroundColor: "var(--color-card-bg)",
      marginBottom: "24px",
    }}>
      <div style={{
        padding: "16px 20px",
        background: "linear-gradient(135deg, rgba(196,137,46,0.08), rgba(196,137,46,0.02))",
        borderBottom: "1px solid var(--color-border)",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <span style={{ fontSize: "20px" }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--color-text)" }}>
          {title}
        </h2>
      </div>
      <div style={{ padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function StatsClient() {
  const [activeTab, setActiveTab] = useState("overview");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const t = setTimeout(() => setAnimating(false), 100);
    return () => clearTimeout(t);
  }, [activeTab]);

  const TABS = [
    { id: "overview",   label: "Overview",    icon: "📊" },
    { id: "breakdown",  label: "Breakdown",   icon: "🥧" },
    { id: "names",      label: "Names",       icon: "🔤" },
    { id: "revelation", label: "Revelation",  icon: "📜" },
    { id: "facts",      label: "Fun Facts",   icon: "✨" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "36px", fontWeight: 500, color: "var(--color-text)", margin: "0 0 6px" }}>
          📊 Quran Statistics
        </h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
          Numbers, patterns and fascinating insights about the Noble Quran
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", border: "1px solid",
              borderColor: activeTab === tab.id ? "#c4892e" : "var(--color-border)",
              backgroundColor: activeTab === tab.id ? "#c4892e" : "transparent",
              color: activeTab === tab.id ? "white" : "var(--color-text-muted)",
              display: "flex", alignItems: "center", gap: "6px",
              transition: "all 0.2s",
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div>
          {/* Big number grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
            {TOTAL_FACTS.map((fact, i) => (
              <div
                key={i}
                style={{
                  padding: "18px 16px", borderRadius: "14px", textAlign: "center",
                  border: `1px solid ${fact.color}33`,
                  backgroundColor: `${fact.color}08`,
                  transition: "transform 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <p style={{ margin: "0 0 6px", fontSize: "28px" }}>{fact.icon}</p>
                <p style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800, color: fact.color, fontFamily: "monospace" }}>
                  {fact.value}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, lineHeight: 1.3 }}>
                  {fact.label}
                </p>
              </div>
            ))}
          </div>

          {/* Longest & Shortest */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Section title="Longest Surahs" icon="📏">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {LONGEST_SURAHS.map((s, i) => (
                  <Link
                    key={i}
                    href={`/surah/${s.number}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 10px", borderRadius: "8px", textDecoration: "none",
                      backgroundColor: i === 0 ? "rgba(196,137,46,0.08)" : "transparent",
                      border: i === 0 ? "1px solid rgba(196,137,46,0.2)" : "1px solid transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(196,137,46,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = i === 0 ? "rgba(196,137,46,0.08)" : "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        width: "22px", height: "22px", borderRadius: "6px",
                        backgroundColor: "rgba(196,137,46,0.15)", color: "#c4892e",
                        fontSize: "10px", fontWeight: 800, fontFamily: "monospace",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {i + 1}
                      </span>
                      <div>
                        <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "var(--color-text)" }}>{s.name}</p>
                        <p style={{ margin: 0, fontSize: "10px", color: "var(--color-text-subtle)" }}>{s.words} words</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#c4892e" }}>{s.ayahs} ayahs</span>
                  </Link>
                ))}
              </div>
            </Section>

            <Section title="Shortest Surahs" icon="🔍">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {SHORTEST_SURAHS.map((s, i) => (
                  <Link
                    key={i}
                    href={`/surah/${s.number}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 10px", borderRadius: "8px", textDecoration: "none",
                      backgroundColor: i === 0 ? "rgba(90,158,143,0.08)" : "transparent",
                      border: i === 0 ? "1px solid rgba(90,158,143,0.2)" : "1px solid transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(90,158,143,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = i === 0 ? "rgba(90,158,143,0.08)" : "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        width: "22px", height: "22px", borderRadius: "6px",
                        backgroundColor: "rgba(90,158,143,0.15)", color: "#5a9e8f",
                        fontSize: "10px", fontWeight: 800, fontFamily: "monospace",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {i + 1}
                      </span>
                      <div>
                        <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "var(--color-text)" }}>{s.name}</p>
                        <p style={{ margin: 0, fontSize: "10px", color: "var(--color-text-subtle)" }}>{s.words} words</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#5a9e8f" }}>{s.ayahs} ayahs</span>
                  </Link>
                ))}
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* ── BREAKDOWN TAB ── */}
      {activeTab === "breakdown" && (
        <div>
          <Section title="Meccan vs Medinan Surahs" icon="🥧">
            <DonutChart meccan={86} medinan={28} />
          </Section>

          <Section title="Ayah Distribution by Juz" icon="📊">
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { juz: 1,  ayahs: 148 }, { juz: 2,  ayahs: 111 }, { juz: 3,  ayahs: 126 },
                { juz: 4,  ayahs: 128 }, { juz: 5,  ayahs: 124 }, { juz: 6,  ayahs: 110 },
                { juz: 7,  ayahs: 149 }, { juz: 8,  ayahs: 142 }, { juz: 9,  ayahs: 159 },
                { juz: 10, ayahs: 127 }, { juz: 11, ayahs: 148 }, { juz: 12, ayahs: 170 },
                { juz: 13, ayahs: 154 }, { juz: 14, ayahs: 227 }, { juz: 15, ayahs: 185 },
                { juz: 16, ayahs: 286 }, { juz: 17, ayahs: 190 }, { juz: 18, ayahs: 202 },
                { juz: 19, ayahs: 175 }, { juz: 20, ayahs: 164 }, { juz: 21, ayahs: 175 },
                { juz: 22, ayahs: 224 }, { juz: 23, ayahs: 170 }, { juz: 24, ayahs: 185 },
                { juz: 25, ayahs: 226 }, { juz: 26, ayahs: 227 }, { juz: 27, ayahs: 286 },
                { juz: 28, ayahs: 137 }, { juz: 29, ayahs: 431 }, { juz: 30, ayahs: 564 },
              ].map(j => (
                <div key={j.juz} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "38px", fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textAlign: "right", flexShrink: 0 }}>
                    Juz {j.juz}
                  </span>
                  <div style={{ flex: 1, height: "20px", backgroundColor: "rgba(196,137,46,0.08)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(j.ayahs / 564) * 100}%`,
                      background: `linear-gradient(90deg, #c4892e, #d4a44d)`,
                      borderRadius: "4px",
                      display: "flex", alignItems: "center", paddingLeft: "6px",
                    }}>
                      {j.ayahs > 100 && (
                        <span style={{ fontSize: "9px", fontWeight: 700, color: "white" }}>{j.ayahs}</span>
                      )}
                    </div>
                  </div>
                  <span style={{ width: "32px", fontSize: "11px", color: "var(--color-text-muted)", flexShrink: 0 }}>
                    {j.ayahs > 100 ? "" : j.ayahs}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ── NAMES TAB ── */}
      {activeTab === "names" && (
        <div>
          <Section title="Most Mentioned Prophets & Names" icon="🔤">
            <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--color-text-muted)" }}>
              Number of times each name appears in the Quran
            </p>
            <BarChart data={MENTIONED_NAMES} maxValue={136} />
          </Section>

          <Section title="Most Frequently Used Words" icon="🔤">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
              {[
                { word: "Allah",      arabic: "الله",      count: "2,699", color: "#c4892e" },
                { word: "Rabb (Lord)",arabic: "رب",         count: "950",   color: "#7c6fa0" },
                { word: "Rahman",     arabic: "رحمن",       count: "57",    color: "#5a9e8f" },
                { word: "Raheem",     arabic: "رحيم",       count: "115",   color: "#b06060" },
                { word: "Iman (Faith)",arabic: "إيمان",     count: "45",    color: "#6b7db3" },
                { word: "Islam",      arabic: "إسلام",      count: "8",     color: "#c4892e" },
                { word: "Quran",      arabic: "القرآن",     count: "70",    color: "#7c6fa0" },
                { word: "Salah (Prayer)",arabic: "صلاة",    count: "67",    color: "#5a9e8f" },
                { word: "Zakat",      arabic: "زكاة",       count: "32",    color: "#b06060" },
                { word: "Jannah (Paradise)",arabic: "جنة",  count: "147",   color: "#6b7db3" },
                { word: "Naar (Fire)",arabic: "نار",        count: "126",   color: "#c4892e" },
                { word: "Haq (Truth)",arabic: "حق",         count: "227",   color: "#7c6fa0" },
              ].map((w, i) => (
                <div key={i} style={{
                  padding: "12px 14px", borderRadius: "10px",
                  border: `1px solid ${w.color}33`,
                  backgroundColor: `${w.color}06`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "var(--color-text)" }}>{w.word}</p>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: w.color }}>{w.count}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "16px", fontFamily: "Amiri, serif", color: w.color, direction: "rtl", textAlign: "right" }}>
                    {w.arabic}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ── REVELATION TAB ── */}
      {activeTab === "revelation" && (
        <div>
          <Section title="Order of Revelation" icon="📜">
            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              The Quran was not revealed in the order it appears in the Mushaf. The first revelation was
              <strong style={{ color: "#c4892e" }}> Surah Al-Alaq (96)</strong> and the last was
              <strong style={{ color: "#5a9e8f" }}> Surah Al-Ma'idah (5)</strong> or
              <strong style={{ color: "#5a9e8f" }}> Surah At-Tawbah (9)</strong>.
            </p>

            {/* Timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {REVELATION_ORDER.map((s, i) => (
                <Link
                  key={i}
                  href={`/surah/${s.number}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 14px", borderRadius: "10px", textDecoration: "none",
                    border: `1px solid ${s.type === "Meccan" ? "rgba(196,137,46,0.2)" : "rgba(90,158,143,0.2)"}`,
                    backgroundColor: s.type === "Meccan" ? "rgba(196,137,46,0.04)" : "rgba(90,158,143,0.04)",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}
                >
                  <span style={{
                    width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                    backgroundColor: s.type === "Meccan" ? "rgba(196,137,46,0.15)" : "rgba(90,158,143,0.15)",
                    color: s.type === "Meccan" ? "#c4892e" : "#5a9e8f",
                    fontSize: "12px", fontWeight: 800, fontFamily: "monospace",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    #{s.order}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--color-text)" }}>
                        {s.name}
                      </p>
                      <span style={{
                        padding: "1px 8px", borderRadius: "50px", fontSize: "9px", fontWeight: 700,
                        backgroundColor: s.type === "Meccan" ? "rgba(196,137,46,0.15)" : "rgba(90,158,143,0.15)",
                        color: s.type === "Meccan" ? "#c4892e" : "#5a9e8f",
                      }}>
                        {s.type}
                      </span>
                    </div>
                    <p style={{ margin: "1px 0 0", fontSize: "11px", color: "var(--color-text-muted)" }}>
                      {s.english} · Surah {s.number}
                    </p>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2">
                    <path d="M6 3l5 5-5 5"/>
                  </svg>
                </Link>
              ))}
            </div>

            {/* Revelation period */}
            <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { period: "Meccan Period", years: "610–622 CE", duration: "13 years", color: "#c4892e", focus: "Tawheed, faith, the Hereafter, stories of Prophets" },
                { period: "Medinan Period", years: "622–632 CE", duration: "10 years", color: "#5a9e8f", focus: "Law, worship, community, social justice, family" },
              ].map((p, i) => (
                <div key={i} style={{
                  padding: "14px 16px", borderRadius: "12px",
                  border: `1px solid ${p.color}33`,
                  backgroundColor: `${p.color}06`,
                }}>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: p.color }}>{p.period}</p>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", color: "var(--color-text-muted)" }}>{p.years} · {p.duration}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-subtle)", lineHeight: 1.5 }}>
                    Focus: {p.focus}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ── FUN FACTS TAB ── */}
      {activeTab === "facts" && (
        <div>
          <Section title="Fascinating Facts About the Quran" icon="✨">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {FUN_FACTS.map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 18px", borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    display: "flex", gap: "12px", alignItems: "flex-start",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(196,137,46,0.1)";
                    e.currentTarget.style.borderColor = "rgba(196,137,46,0.3)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }}
                >
                  <span style={{ fontSize: "24px", flexShrink: 0 }}>{f.icon}</span>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text)", lineHeight: 1.7 }}>
                    {f.fact}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Numerical miracles */}
          <Section title="Numerical Patterns" icon="🔢">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
              {[
                { a: "Dunya (World)", countA: 115, b: "Akhirah (Hereafter)", countB: 115, color: "#c4892e" },
                { a: "Angels",        countA: 88,  b: "Shayateen (Devils)",  countB: 88,  color: "#7c6fa0" },
                { a: "Life",          countA: 145, b: "Death",               countB: 145, color: "#5a9e8f" },
                { a: "Benefit",       countA: 50,  b: "Corruption",          countB: 50,  color: "#b06060" },
                { a: "People",        countA: 50,  b: "Prophets",            countB: 50,  color: "#6b7db3" },
                { a: "Month",         countA: 12,  b: "Months in a year",    countB: 12,  color: "#c4892e" },
                { a: "Day",           countA: 365, b: "Days in a year",      countB: 365, color: "#7c6fa0" },
              ].map((pair, i) => (
                <div key={i} style={{
                  padding: "12px 14px", borderRadius: "10px",
                  border: `1px solid ${pair.color}33`,
                  backgroundColor: `${pair.color}06`,
                  textAlign: "center",
                }}>
                  <p style={{ margin: "0 0 6px", fontSize: "11px", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Equal occurrences
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "var(--color-text)" }}>{pair.a}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 800, color: pair.color }}>{pair.countA}×</p>
                    </div>
                    <span style={{ fontSize: "18px", color: "var(--color-text-subtle)" }}>=</span>
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "var(--color-text)" }}>{pair.b}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 800, color: pair.color }}>{pair.countB}×</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}