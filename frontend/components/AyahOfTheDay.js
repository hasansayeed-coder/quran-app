"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSettings } from "../components/context/SettingsContext";
import { useBookmarks } from "../components/context/BookmarksContext";
import { useAudio } from "@/components/AudioPlayer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const TOTAL_AYAHS = 6236;

const SURAH_LENGTHS = [
  7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,
  59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,
  52,52,44,28,28,20,56,40,31,50,45,26,29,19,36,25,43,30,95,35,23,35,35,38,
  29,18,15,15,10,13,25,22,17,24,34,45,17,11,16,16,13,14,12,7,19,10,14,21,
];

function globalToSurahAyah(globalNum) {
  let remaining = globalNum;
  for (let i = 0; i < SURAH_LENGTHS.length; i++) {
    if (remaining <= SURAH_LENGTHS[i]) {
      return { surah: i + 1, ayah: remaining };
    }
    remaining -= SURAH_LENGTHS[i];
  }
  return { surah: 114, ayah: SURAH_LENGTHS[113] };
}

function getTodaysSeed() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${now.getMonth()}${now.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return (hash % TOTAL_AYAHS) + 1;
}

function getTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default function AyahOfTheDay() {
  const { settings, mounted } = useSettings();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { loadAyah, togglePlay, currentAyah, playing } = useAudio();

  const [ayahData, setAyahData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [copied, setCopied]     = useState(false);

  const arabicFont = {
    amiri:        "Amiri, serif",
    scheherazade: "'Scheherazade New', serif",
    noto:         "'Noto Naskh Arabic', serif",
    lateef:       "Lateef, serif",
  }[settings.arabicFont] || "Amiri, serif";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const globalNum = getTodaysSeed();
        const { surah, ayah } = globalToSurahAyah(globalNum);
        const res = await fetch(`${API_BASE}/api/surah/${surah}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        const surahData = json.data;
        const ayahObj = surahData.ayahs[ayah - 1];
        setAyahData({
          numberInQuran:    globalNum,
          surahNumber:      surah,
          surahName:        surahData.name,
          surahEnglishName: surahData.englishName,
          surahTranslation: surahData.englishNameTranslation,
          number:           ayah,
          arabic:           ayahObj.arabic,
          sahih:            ayahObj.sahih,
          pickthall:        ayahObj.pickthall,
          juz:              ayahObj.juz,
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <AyahOfTheDaySkeleton />;
  if (error)   return null;

  const bookmarked  = mounted && ayahData ? isBookmarked(ayahData.numberInQuran) : false;
  const isPlaying   = currentAyah?.numberInQuran === ayahData?.numberInQuran && playing;
  const translation = mounted ? settings.translation : "sahih";
  const tSize       = mounted ? settings.translationFontSize : 16;

  function handleBookmark() {
    if (!ayahData) return;
    if (bookmarked) removeBookmark(ayahData.numberInQuran);
    else addBookmark(ayahData);
  }

  function handlePlay() {
    if (!ayahData) return;
    if (currentAyah?.numberInQuran === ayahData.numberInQuran) togglePlay();
    else loadAyah(ayahData, [ayahData], true);
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

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#c4892e]">✦</span>
          <h2 className="font-display text-lg font-medium text-[#1a1814]">
            Ayah of the Day
          </h2>
        </div>
        <span className="h-px flex-1 bg-[#e2c27f]/40" />
        <span className="text-xs text-[#b4ae97] hidden sm:inline">
          {getTodayLabel()}
        </span>
      </div>

      <div className="relative rounded-2xl border border-[#e2c27f]/50 bg-gradient-to-br from-[#fdf8f0] to-[#f7edd8]/60 overflow-hidden shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-[#c4892e]/30 via-[#c4892e] to-[#c4892e]/30" />

        <div className="px-5 sm:px-8 py-6">
          {/* Surah badge */}
          <div className="flex items-center justify-between mb-5">
            <Link href={`/surah/${ayahData.surahNumber}#ayah-${ayahData.number}`} className="flex items-center gap-2 group">
              <span className="px-2.5 py-1 rounded-lg bg-[#c4892e]/10 border border-[#c4892e]/30 text-xs font-medium text-[#c4892e] group-hover:bg-[#c4892e]/20 transition-colors">
                {ayahData.surahEnglishName} {ayahData.surahNumber}:{ayahData.number}
              </span>
              <span className="text-xs text-[#b4ae97] group-hover:text-[#c4892e] transition-colors hidden sm:inline">
                {ayahData.surahTranslation} · Juz {ayahData.juz}
              </span>
            </Link>
            <span className="text-[10px] text-[#b4ae97] sm:hidden">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>

          {/* Arabic */}
          <p
            className="arabic-text text-right text-[#1a1814] mb-6 leading-loose"
            style={{ fontFamily: arabicFont, fontSize: `${mounted ? settings.arabicFontSize + 4 : 32}px` }}
            dir="rtl"
          >
            {ayahData.arabic}
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px flex-1 bg-[#e2c27f]/40" />
            <span className="text-[#c4892e]/40 text-sm">❧</span>
            <span className="h-px flex-1 bg-[#e2c27f]/40" />
          </div>

          {/* Translations */}
          <div className="space-y-3 mb-6">
            {(translation === "sahih" || translation === "both") && (
              <div>
                {translation === "both" && (
                  <p className="text-[10px] uppercase tracking-widest text-[#b4ae97] mb-1">Sahih International</p>
                )}
                <p className="text-[#3d3932] leading-relaxed italic" style={{ fontSize: `${tSize}px` }}>
                  "{ayahData.sahih}"
                </p>
              </div>
            )}
            {(translation === "pickthall" || translation === "both") && (
              <div>
                {translation === "both" && (
                  <p className="text-[10px] uppercase tracking-widest text-[#b4ae97] mb-1 mt-3">Pickthall</p>
                )}
                <p className="text-[#3d3932] leading-relaxed italic" style={{ fontSize: `${tSize}px` }}>
                  "{ayahData.pickthall}"
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePlay}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isPlaying
                  ? "bg-[#c4892e]/15 text-[#c4892e] border-[#c4892e]/40"
                  : "text-[#7a7460] border-[#e2c27f]/50 hover:border-[#c4892e]/50 hover:text-[#c4892e] hover:bg-[#c4892e]/5"
              }`}
            >
              {isPlaying ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
              {isPlaying ? "Pause" : "Listen"}
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                bookmarked
                  ? "bg-[#c4892e]/15 text-[#c4892e] border-[#c4892e]/40 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                  : "text-[#7a7460] border-[#e2c27f]/50 hover:border-[#c4892e]/50 hover:text-[#c4892e] hover:bg-[#c4892e]/5"
              }`}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75">
                <path d="M3 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1z"/>
              </svg>
              {bookmarked ? "Saved" : "Bookmark"}
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border text-[#7a7460] border-[#e2c27f]/50 hover:border-[#c4892e]/50 hover:text-[#c4892e] hover:bg-[#c4892e]/5 transition-all"
            >
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8l4 4 8-8"/></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="4" y="4" width="9" height="10" rx="1"/><path d="M3 3h7v1H3zM3 3v10h1V3z" fill="currentColor" stroke="none"/></svg>
                  Copy
                </>
              )}
            </button>

            <Link
              href={`/surah/${ayahData.surahNumber}#ayah-${ayahData.number}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border text-[#7a7460] border-[#e2c27f]/50 hover:border-[#c4892e]/50 hover:text-[#c4892e] hover:bg-[#c4892e]/5 transition-all ml-auto"
            >
              Read Surah
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3l5 5-5 5"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AyahOfTheDaySkeleton() {
  return (
    <section className="mb-10 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-36 bg-[#e2c27f]/30 rounded" />
        <span className="h-px flex-1 bg-[#e2c27f]/20" />
      </div>
      <div className="rounded-2xl border border-[#e2c27f]/30 bg-[#f7edd8]/30 overflow-hidden">
        <div className="h-1 w-full bg-[#e2c27f]/20" />
        <div className="px-8 py-6 space-y-4">
          <div className="h-4 w-32 bg-[#e2c27f]/20 rounded" />
          <div className="h-10 w-full bg-[#e2c27f]/20 rounded" />
          <div className="h-10 w-4/5 ml-auto bg-[#e2c27f]/15 rounded" />
          <div className="h-px w-full bg-[#e2c27f]/20" />
          <div className="h-4 w-full bg-[#e2c27f]/15 rounded" />
          <div className="h-4 w-3/4 bg-[#e2c27f]/10 rounded" />
          <div className="flex gap-2 pt-2">
            {[60, 72, 56, 80].map((w, i) => (
              <div key={i} className="h-7 bg-[#e2c27f]/15 rounded-lg" style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}