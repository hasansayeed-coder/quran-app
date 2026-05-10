"use client";

import { useSettings } from "../components/context/SettingsContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import BookmarkButton from "../components/BookmarkButton";
import TafsirPanel from "../components/TafsirPanel";
import PlayAyahButton from "../components/PlayAyahButton";
import CopyAyahButton from "../components/CopyAyahButton";
import MarkAsReadButton from "../components/MarkAsReadButton";
import ShareAyahButton from "../components/ShareayahButton";
import NoteButton from "../components/NoteButton";
import WordByWord from "../components/WordByWord";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SurahView({ surah }) {
  const { settings, mounted } = useSettings();
  const [transliterations, setTransliterations] = useState({});
  const [transLoading, setTransLoading] = useState(false);

  const showTrans = mounted && settings.showTransliteration;

  useEffect(() => {
    if (!showTrans) return;
    if (Object.keys(transliterations).length > 0) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTransLoading(true);
    fetch(`${API_BASE}/api/transliteration/${surah.number}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          const map = {};
          json.data.forEach(a => { map[a.number] = a.transliteration; });
          setTransliterations(map);
        }
      })
      .catch(() => {})
      .finally(() => setTransLoading(false));
  }, [showTrans, surah.number]);

  const arabicFont =
    {
      amiri: "Amiri, serif",
      scheherazade: "'Scheherazade New', serif",
      noto: "'Noto Naskh Arabic', serif",
      lateef: "Lateef, serif",
    }[settings.arabicFont] || "Amiri, serif";

  return (
    <div>
      {/* Surah header */}
      <div className="text-center mb-10 py-8 rounded-2xl border border-[#e2c27f]/40 bg-[#f7edd8]/50">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-xs font-medium uppercase tracking-widest text-[#7a7460]">
            Surah {surah.number}
          </span>
          <span className="w-1 h-1 rounded-full bg-[#e2c27f]" />
          <span className="text-xs font-medium uppercase tracking-widest text-[#7a7460]">
            {surah.revelationType}
          </span>
          <span className="w-1 h-1 rounded-full bg-[#e2c27f]" />
          <span className="text-xs font-medium uppercase tracking-widest text-[#7a7460]">
            {surah.numberOfAyahs} Ayahs
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#1a1814] mb-1">
          {surah.englishName}
        </h1>
        <p className="text-[#7a7460] text-sm italic mb-4">{surah.englishNameTranslation}</p>

        <p
          className="text-3xl sm:text-4xl text-[#1a1814] mt-3"
          style={{ fontFamily: arabicFont, direction: "rtl" }}
        >
          {surah.name}
        </p>

        {surah.number !== 1 && surah.number !== 9 && (
          <p
            className="text-2xl sm:text-3xl text-[#c4892e] mt-4"
            style={{ fontFamily: arabicFont, direction: "rtl" }}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
        )}
      </div>

      {/* Prev / Next navigation + Mark as Read */}
      <div className="flex items-center justify-between mb-8">
        {surah.number > 1 ? (
          <Link
            href={`/surah/${surah.number - 1}`}
            className="flex items-center gap-1.5 text-sm text-[#7a7460] hover:text-[#c4892e] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 3L5 8l5 5" />
            </svg>
            Previous
          </Link>
        ) : <span />}

        <MarkAsReadButton surahNumber={surah.number} />

        {surah.number < 114 ? (
          <Link
            href={`/surah/${surah.number + 1}`}
            className="flex items-center gap-1.5 text-sm text-[#7a7460] hover:text-[#c4892e] transition-colors"
          >
            Next
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </Link>
        ) : <span />}
      </div>

      {/* Ayahs */}
      <div className="space-y-4">
        {surah.ayahs.map((ayah) => (
          <AyahCard
            key={ayah.number}
            ayah={ayah}
            surah={surah}
            ayahList={surah.ayahs}
            arabicFont={arabicFont}
            arabicFontSize={mounted ? settings.arabicFontSize : 28}
            translationFontSize={mounted ? settings.translationFontSize : 16}
            translationMode={mounted ? settings.translation : "sahih"}
            showTransliteration={showTrans}
            transLoading={transLoading}
            transliteration={transliterations[ayah.number] || ""}
          />
        ))}
      </div>
    </div>
  );
}

function AyahCard({
  ayah, surah, ayahList, arabicFont,
  arabicFontSize, translationFontSize, translationMode,
  showTransliteration, transLoading, transliteration,
}) {
  const ayahPayload = {
    numberInQuran:    ayah.numberInQuran,
    surahNumber:      surah.number,
    surahName:        surah.name,
    surahEnglishName: surah.englishName,
    number:           ayah.number,
    arabic:           ayah.arabic,
    sahih:            ayah.sahih,
    pickthall:        ayah.pickthall,
    juz:              ayah.juz,
    page:             ayah.page,
  };

  const audioList = ayahList.map(a => ({
    numberInQuran:    a.numberInQuran,
    surahNumber:      surah.number,
    surahName:        surah.name,
    surahEnglishName: surah.englishName,
    number:           a.number,
    arabic:           a.arabic,
  }));

  return (
    <div id={`ayah-${ayah.number}`} className="ayah-card rounded-xl border border-[#e2c27f]/30 bg-white/60 overflow-hidden">

      {/* Ayah number bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#e2c27f]/20 bg-[#f7edd8]/40">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#c4892e] text-[#fdf8f0] text-xs flex items-center justify-center font-mono">
            {ayah.number}
          </span>
          <span className="text-xs text-[#7a7460]">
            Juz {ayah.juz} · Page {ayah.page}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <PlayAyahButton ayah={ayahPayload} ayahList={audioList} />
          <CopyAyahButton ayah={ayahPayload} translation={translationMode} />
          <ShareAyahButton ayah={ayahPayload} />
          <NoteButton ayah={ayahPayload} />
          <BookmarkButton ayah={ayahPayload} />
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Arabic */}
        <p
          className="arabic-text text-right text-[#1a1814] mb-5 leading-loose"
          style={{ fontFamily: arabicFont, fontSize: `${arabicFontSize}px` }}
          dir="rtl"
        >
          {ayah.arabic}
          <span className="text-[#c4892e] ml-2 text-base" style={{ fontFamily: "Amiri, serif" }}>
            ﴿{toArabicNumber(ayah.number)}﴾
          </span>
        </p>

        {/* Transliteration */}
        {showTransliteration && (
          <div style={{
            marginBottom: "16px", padding: "10px 14px",
            borderRadius: "8px",
            backgroundColor: "rgba(196,137,46,0.05)",
            border: "1px solid rgba(196,137,46,0.15)",
          }}>
            <p style={{
              margin: "0 0 4px 0", fontSize: "10px", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em",
              color: "var(--color-text-subtle)",
            }}>
              🔤 Transliteration
            </p>
            {transLoading && !transliteration ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "12px", height: "12px",
                  border: "2px solid rgba(196,137,46,0.2)",
                  borderTopColor: "#c4892e", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                <span style={{ fontSize: "12px", color: "var(--color-text-subtle)", fontStyle: "italic" }}>
                  Loading…
                </span>
              </div>
            ) : (
              <p style={{
                margin: 0, fontSize: "14px", lineHeight: 1.8,
                color: "var(--color-text-muted)",
                fontStyle: "italic", letterSpacing: "0.01em",
              }}>
                {transliteration || "—"}
              </p>
            )}
          </div>
        )}

        {/* Translations */}
        <div className="space-y-3 border-t border-[#e2c27f]/20 pt-4">
          {(translationMode === "sahih" || translationMode === "both") && (
            <div>
              {translationMode === "both" && (
                <p className="text-[10px] uppercase tracking-widest text-[#7a7460] mb-1">
                  Sahih International
                </p>
              )}
              <p className="text-[#3d3932] leading-relaxed" style={{ fontSize: `${translationFontSize}px` }}>
                {ayah.sahih}
              </p>
            </div>
          )}
          {(translationMode === "pickthall" || translationMode === "both") && (
            <div>
              {translationMode === "both" && (
                <p className="text-[10px] uppercase tracking-widest text-[#7a7460] mb-1 mt-3">
                  Pickthall
                </p>
              )}
              <p className="text-[#3d3932] leading-relaxed" style={{ fontSize: `${translationFontSize}px` }}>
                {ayah.pickthall}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Word by Word panel */}
      <WordByWord
        surahNumber={surah.number}
        ayahNumber={ayah.number}
        arabicFont={arabicFont}
      />

      {/* Tafsir panel */}
      <TafsirPanel ayah={ayahPayload} />

    </div>
  );
}

function toArabicNumber(n) {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}