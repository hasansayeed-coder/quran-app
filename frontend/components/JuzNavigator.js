"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const JUZ_START = [
  { juz: 1,  surah: 1,  ayah: 1 },
  { juz: 2,  surah: 2,  ayah: 142 },
  { juz: 3,  surah: 2,  ayah: 253 },
  { juz: 4,  surah: 3,  ayah: 92 },
  { juz: 5,  surah: 4,  ayah: 24 },
  { juz: 6,  surah: 4,  ayah: 148 },
  { juz: 7,  surah: 5,  ayah: 82 },
  { juz: 8,  surah: 6,  ayah: 111 },
  { juz: 9,  surah: 7,  ayah: 88 },
  { juz: 10, surah: 8,  ayah: 41 },
  { juz: 11, surah: 9,  ayah: 93 },
  { juz: 12, surah: 11, ayah: 6 },
  { juz: 13, surah: 12, ayah: 53 },
  { juz: 14, surah: 15, ayah: 1 },
  { juz: 15, surah: 17, ayah: 1 },
  { juz: 16, surah: 18, ayah: 75 },
  { juz: 17, surah: 21, ayah: 1 },
  { juz: 18, surah: 23, ayah: 1 },
  { juz: 19, surah: 25, ayah: 21 },
  { juz: 20, surah: 27, ayah: 56 },
  { juz: 21, surah: 29, ayah: 46 },
  { juz: 22, surah: 33, ayah: 31 },
  { juz: 23, surah: 36, ayah: 28 },
  { juz: 24, surah: 39, ayah: 32 },
  { juz: 25, surah: 41, ayah: 47 },
  { juz: 26, surah: 46, ayah: 1 },
  { juz: 27, surah: 51, ayah: 31 },
  { juz: 28, surah: 58, ayah: 1 },
  { juz: 29, surah: 67, ayah: 1 },
  { juz: 30, surah: 78, ayah: 1 },
];

const JUZ_ARABIC = [
  "الم","سَيَقُولُ","تِلْكَ","لَنْ تَنَالُوا","وَالْمُحْصَنَاتُ",
  "لَا يُحِبُّ","وَإِذَا سَمِعُوا","وَلَوْ أَنَّنَا","قَالَ الْمَلَأُ",
  "وَاعْلَمُوا","يَعْتَذِرُونَ","وَمَا مِنْ دَابَّةٍ","وَمَا أُبَرِّئُ",
  "رُبَمَا","سُبْحَانَ","قَالَ أَلَمْ","اقْتَرَبَ","قَدْ أَفْلَحَ",
  "وَقَالَ الَّذِينَ","أَمَّنْ خَلَقَ","اتْلُ مَا أُوحِيَ","وَمَنْ يَقْنُتْ",
  "وَمَا لِيَ","فَمَنْ أَظْلَمُ","إِلَيْهِ يُرَدُّ","حم","قَالَ فَمَا خَطْبُكُمْ",
  "قَدْ سَمِعَ","تَبَارَكَ","عَمَّ",
];

function getSurahJuz(surahNumber) {
  let juz = 1;
  for (let i = 0; i < JUZ_START.length; i++) {
    if (JUZ_START[i].surah <= surahNumber) juz = JUZ_START[i].juz;
    else break;
  }
  return juz;
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "12px",
};

export default function JuzNavigator({ surahs }) {
  const [activeJuz, setActiveJuz] = useState(null);
  const [search, setSearch]       = useState("");
  const tabsRef      = useRef(null);
  const activeTabRef = useRef(null);

  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth", block: "nearest", inline: "center",
      });
    }
  }, [activeJuz]);

  const searchFiltered = search.trim()
    ? surahs.filter(s =>
        s.englishName.toLowerCase().includes(search.toLowerCase()) ||
        s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
        s.name.includes(search) ||
        String(s.number) === search.trim()
      )
    : surahs;

  const filtered = activeJuz
    ? searchFiltered.filter(s => getSurahJuz(s.number) === activeJuz)
    : searchFiltered;

  const grouped = {};
  filtered.forEach(s => {
    const j = getSurahJuz(s.number);
    if (!grouped[j]) grouped[j] = [];
    grouped[j].push(s);
  });
  const groupedEntries = Object.entries(grouped).map(([juz, list]) => ({
    juz: Number(juz), list,
  }));

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#c4892e" }}>✦</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: 500, color: "#1a1814", margin: 0 }}>
            {activeJuz ? `Juz ${activeJuz}` : "All Surahs"}
          </h2>
          {activeJuz && (
            <span style={{ fontFamily: "Amiri, serif", fontSize: "14px", color: "rgba(196,137,46,0.6)" }}>
              {JUZ_ARABIC[activeJuz - 1]}
            </span>
          )}
        </div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(226,194,127,0.5)", backgroundColor: "rgba(255,255,255,0.6)" }}>
          <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="#b4ae97" strokeWidth="2">
            <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/>
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter surahs…"
            style={{ background: "transparent", outline: "none", border: "none", fontSize: "12px", color: "#1a1814", width: "140px" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#b4ae97", padding: 0 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l10 10M13 3L3 13"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Juz tabs */}
      <div
        ref={tabsRef}
        style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "24px", scrollbarWidth: "none" }}
      >
        <button
          ref={activeJuz === null ? activeTabRef : null}
          onClick={() => setActiveJuz(null)}
          style={{
            flexShrink: 0, padding: "6px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            border: "1px solid", cursor: "pointer",
            backgroundColor: activeJuz === null ? "#c4892e" : "transparent",
            color: activeJuz === null ? "white" : "#7a7460",
            borderColor: activeJuz === null ? "#c4892e" : "rgba(226,194,127,0.5)",
          }}
        >
          All
        </button>
        {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
          <button
            key={juz}
            ref={activeJuz === juz ? activeTabRef : null}
            onClick={() => setActiveJuz(juz === activeJuz ? null : juz)}
            style={{
              flexShrink: 0, width: "40px", height: "32px", borderRadius: "8px",
              fontSize: "12px", fontWeight: 600, border: "1px solid", cursor: "pointer",
              backgroundColor: activeJuz === juz ? "#c4892e" : "transparent",
              color: activeJuz === juz ? "white" : "#7a7460",
              borderColor: activeJuz === juz ? "#c4892e" : "rgba(226,194,127,0.5)",
            }}
          >
            {juz}
          </button>
        ))}
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#b4ae97" }}>
          <p style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</p>
          <p style={{ fontSize: "14px" }}>No surahs match "{search}"</p>
          <button onClick={() => setSearch("")} style={{ marginTop: "12px", fontSize: "12px", color: "#c4892e", background: "none", border: "none", cursor: "pointer" }}>
            Clear filter
          </button>
        </div>
      )}

      {/* Flat grid — single Juz or search */}
      {(activeJuz || search) && filtered.length > 0 && (
        <div style={gridStyle}>
          {filtered.map(surah => (
            <SurahCard key={surah.number} surah={surah} />
          ))}
        </div>
      )}

      {/* Grouped view — All Surahs */}
      {!activeJuz && !search && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {groupedEntries.map(({ juz, list }) => (
            <div key={juz}>

              {/* Juz divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <button
                  onClick={() => setActiveJuz(juz)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                >
                  <span style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    backgroundColor: "rgba(196,137,46,0.1)",
                    border: "1px solid rgba(196,137,46,0.3)",
                    color: "#c4892e", fontSize: "12px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {juz}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#7a7460", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Juz {juz}
                  </span>
                </button>
                <span style={{ fontFamily: "Amiri, serif", fontSize: "14px", color: "rgba(196,137,46,0.5)" }}>
                  {JUZ_ARABIC[juz - 1]}
                </span>
                <span style={{ flex: 1, height: "1px", backgroundColor: "rgba(226,194,127,0.3)" }} />
                <span style={{ fontSize: "10px", color: "#b4ae97", fontWeight: 500, flexShrink: 0 }}>
                  {list.length} surah{list.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* 3-column card grid */}
              <div style={gridStyle}>
                {list.map(surah => (
                  <SurahCard key={surah.number} surah={surah} />
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SurahCard({ surah }) {
  return (
    <Link
      href={`/surah/${surah.number}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid rgba(226,194,127,0.35)",
          backgroundColor: "rgba(255,255,255,0.55)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
          e.currentTarget.style.borderColor = "rgba(196,137,46,0.5)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,137,46,0.1)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.55)";
          e.currentTarget.style.borderColor = "rgba(226,194,127,0.35)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Top row — number badge + Arabic name */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            width: "32px", height: "32px", borderRadius: "8px",
            backgroundColor: "rgba(247,237,216,0.9)",
            border: "1px solid rgba(226,194,127,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "monospace", fontSize: "12px", fontWeight: 700,
            color: "#c4892e", flexShrink: 0,
          }}>
            {surah.number}
          </span>
          <span style={{
            fontFamily: "Amiri, serif",
            fontSize: "20px",
            color: "#1a1814",
            direction: "rtl",
            lineHeight: 1.6,
          }}>
            {surah.name}
          </span>
        </div>

        {/* English name */}
        <div>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1a1814" }}>
            {surah.englishName}
          </p>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#7a7460" }}>
            {surah.englishNameTranslation}
          </p>
        </div>

        {/* Footer — ayah count + revelation type */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <span style={{
            fontSize: "11px", color: "#b4ae97",
            backgroundColor: "rgba(226,194,127,0.15)",
            padding: "2px 8px", borderRadius: "4px",
          }}>
            {surah.numberOfAyahs} ayahs
          </span>
          <span style={{ fontSize: "11px", color: "#b4ae97" }}>
            {surah.revelationType}
          </span>
        </div>
      </div>
    </Link>
  );
}