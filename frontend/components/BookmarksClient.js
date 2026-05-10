"use client";

import { useState } from "react";
import Link from "next/link";
import { useBookmarks } from "../components/context/BookmarksContext";
import { useSettings } from "../components/context/SettingsContext";
import TafsirPanel from "@/components/TafsirPanel";
import CopyAyahButton from "@/components/CopyAyahButton";
import ShareAyahButton from "../components/ShareayahButton";


export default function BookmarksClient() {
  const { bookmarks, removeBookmark, clearAll, mounted } = useBookmarks();
  const { settings } = useSettings();
  const [confirmClear, setConfirmClear] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const arabicFont =
    {
      amiri: "Amiri, serif",
      scheherazade: "'Scheherazade New', serif",
      noto: "'Noto Naskh Arabic', serif",
      lateef: "Lateef, serif",
    }[settings.arabicFont] || "Amiri, serif";

  function handleRemove(id) {
    setRemovingId(id);
    setTimeout(() => {
      removeBookmark(id);
      setRemovingId(null);
    }, 250);
  }

  function handleClearAll() {
    if (confirmClear) {
      clearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  }

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-[#e2c27f]/20 rounded-lg" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-[#f7edd8]/40 border border-[#e2c27f]/20" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-[#1a1814] mb-1">
            Bookmarks
          </h1>
          <p className="text-sm text-[#7a7460]">
            {bookmarks.length === 0
              ? "No saved ayahs yet"
              : `${bookmarks.length} saved ayah${bookmarks.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {bookmarks.length > 0 && (
          <button
            onClick={handleClearAll}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              confirmClear
                ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                : "text-[#7a7460] border-[#e2c27f]/50 hover:border-red-300 hover:text-red-500"
            }`}
          >
            {confirmClear ? "Tap again to confirm" : "Clear all"}
          </button>
        )}
      </div>

      {/* Empty state */}
      {bookmarks.length === 0 && (
        <div className="text-center py-20">
          <div
            className="text-6xl mb-4 text-[#c4892e]/20 select-none"
            style={{ fontFamily: "Amiri, serif" }}
          >
             bookmark
          </div>
          <svg
            className="mx-auto mb-4 text-[#e2c27f]"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
          >
            <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-[#7a7460] text-sm mb-1">No bookmarks yet</p>
          <p className="text-[#b4ae97] text-xs mb-6">
            Tap the bookmark icon on any ayah to save it here
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c4892e] text-[#fdf8f0] text-sm font-medium hover:bg-[#a86d22] transition-colors"
          >
            Browse Surahs
          </Link>
        </div>
      )}

      {/* Bookmark cards */}
      {bookmarks.length > 0 && (
        <div className="space-y-4">
          {bookmarks.map((ayah) => (
            <BookmarkCard
              key={ayah.numberInQuran}
              ayah={ayah}
              arabicFont={arabicFont}
              arabicFontSize={settings.arabicFontSize}
              translationFontSize={settings.translationFontSize}
              translationMode={settings.translation}
              onRemove={() => handleRemove(ayah.numberInQuran)}
              removing={removingId === ayah.numberInQuran}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkCard({
  ayah,
  arabicFont,
  arabicFontSize,
  translationFontSize,
  translationMode,
  onRemove,
  removing,
}) {
  const savedDate = ayah.savedAt
    ? new Date(ayah.savedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={`ayah-card rounded-xl border border-[#e2c27f]/30 bg-white/60 overflow-hidden transition-all duration-250 ${
        removing ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#e2c27f]/20 bg-[#f7edd8]/40">
        <div className="flex items-center gap-2 min-w-0">
          {/* Surah badge */}
          <Link
            href={`/surah/${ayah.surahNumber}#ayah-${ayah.number}`}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#c4892e]/10 border border-[#c4892e]/30 hover:bg-[#c4892e]/20 transition-colors"
          >
            <span className="text-xs font-medium text-[#c4892e] truncate">
              {ayah.surahEnglishName}
            </span>
            <span className="text-xs text-[#c4892e]/70">:{ayah.number}</span>
          </Link>
          <span className="text-xs text-[#7a7460] hidden sm:inline">
            Juz {ayah.juz}
          </span>
          {savedDate && (
            <span className="text-xs text-[#b4ae97] hidden md:inline">
              · Saved {savedDate}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Copy button */}
          <CopyAyahButton ayah={ayah} translation={translationMode} />

           {/* Share as image */}
          <ShareAyahButton ayah={ayah} />

          {/* Go to surah link */}
          <Link
            href={`/surah/${ayah.surahNumber}#ayah-${ayah.number}`}
            className="flex items-center gap-1 text-xs text-[#7a7460] hover:text-[#c4892e] transition-colors"
            title="Go to ayah"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </Link>

          {/* Remove button */}
          <button
            onClick={onRemove}
            title="Remove bookmark"
            className="p-1 rounded-md text-[#b4ae97] hover:text-red-400 hover:bg-red-50 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
      </div>

      {/* Card body */}
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
      {/* Tafsir expandable panel */}
      <TafsirPanel ayah={ayah} />
    </div>
  );
}

function toArabicNumber(n) {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}