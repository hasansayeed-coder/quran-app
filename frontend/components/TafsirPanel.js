"use client";

import { useState, useCallback } from "react";

const CDN = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir";

// Correct slugs verified from editions.json
export const TAFSIR_EDITIONS = [
  {
    id: "en-tafisr-ibn-kathir",
    label: "Ibn Kathir",
    fullName: "Tafsir Ibn Kathir (Abridged)",
    description: "Classic tafsir by Hafiz Ibn Kathir — most widely trusted English edition",
  },
  {
    id: "en-tafsir-maarif-ul-quran",
    label: "Maarif-ul-Quran",
    fullName: "Maarif-ul-Quran — Mufti Muhammad Shafi",
    description: "Comprehensive modern tafsir by Mufti Muhammad Shafi Usmani",
  },
  {
    id: "ar-tafsir-ibn-kathir",
    label: "ابن كثير (عربي)",
    fullName: "تفسير ابن كثير",
    description: "Arabic original of Tafsir Ibn Kathir",
  },
  {
    id: "ar-tafseer-al-saddi",
    label: "السعدي (عربي)",
    fullName: "تفسير السعدي",
    description: "Arabic tafsir by Sheikh Abdur-Rahman ibn Nasir as-Sa'di",
  },
  {
    id: "ar-tafsir-al-baghawi",
    label: "البغوي (عربي)",
    fullName: "تفسير البغوي",
    description: "Classical Arabic tafsir by Imam Al-Baghawi",
  },
];

export default function TafsirPanel({ ayah }) {
  const [open, setOpen] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState(TAFSIR_EDITIONS[0].id);
  const [cache, setCache] = useState({}); // { "editionId:surahNum:ayahNum": text }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentText, setCurrentText] = useState(null);

  const fetchTafsir = useCallback(async (editionId) => {
    const cacheKey = `${editionId}:${ayah.surahNumber}:${ayah.number}`;

    // Return from cache if available
    if (cache[cacheKey] !== undefined) {
      setCurrentText(cache[cacheKey]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentText(null);

    try {
      // Fetch entire surah tafsir then extract the specific ayah
      const url = `${CDN}/${editionId}/${ayah.surahNumber}/${ayah.number}.json`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // The API returns { verse: N, chapter: N, text: "..." }
      const text = json?.text || json?.tafsir || json?.translation || null;

      if (!text) throw new Error("No tafsir text found");

      setCache(prev => ({ ...prev, [cacheKey]: text }));
      setCurrentText(text);
    } catch (e) {
      setError(e.message);
      setCache(prev => ({ ...prev, [cacheKey]: null }));
    } finally {
      setLoading(false);
    }
  }, [ayah, cache]);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next) fetchTafsir(selectedEdition);
  }

  function handleEditionChange(editionId) {
    setSelectedEdition(editionId);
    fetchTafsir(editionId);
  }

  function sanitize(text) {
    if (!text) return "";
    return text
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&quot;/g, '"')
      .trim();
  }

  const currentEditionMeta = TAFSIR_EDITIONS.find(e => e.id === selectedEdition);

  return (
    <div className="border-t border-[#e2c27f]/20 mt-4">
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-3 text-left group hover:bg-[#f7edd8]/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="text-[#c4892e] flex-shrink-0" width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M12 2H6a2 2 0 0 0-2 2v16l6-3 6 3V4a2 2 0 0 0-2-2z"/>
            <path d="M8 7h4M8 11h3"/>
          </svg>
          <span className="text-xs font-medium text-[#7a7460] group-hover:text-[#c4892e] transition-colors uppercase tracking-wider">
            Tafsir (Commentary)
          </span>
          {open && currentEditionMeta && (
            <span className="text-[10px] text-[#b4ae97] hidden sm:inline">
              — {currentEditionMeta.label}
            </span>
          )}
        </div>
        <svg
          className={`text-[#b4ae97] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          width="14" height="14" viewBox="0 0 16 16"
          fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="px-5 pb-5">
          {/* Edition tabs */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {TAFSIR_EDITIONS.map(edition => (
              <button
                key={edition.id}
                onClick={() => handleEditionChange(edition.id)}
                title={edition.fullName}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedEdition === edition.id
                    ? "bg-[#c4892e] text-[#fdf8f0]"
                    : "bg-[#f7edd8] text-[#7a7460] hover:bg-[#e2c27f]/40 hover:text-[#1a1814] border border-[#e2c27f]/40"
                }`}
              >
                {edition.label}
              </button>
            ))}
          </div>

          {/* Source attribution */}
          {currentEditionMeta && !loading && !error && currentText && (
            <p className="text-[10px] text-[#b4ae97] mb-3 italic">
              {currentEditionMeta.fullName} — {currentEditionMeta.description}
            </p>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2.5 py-4">
              <div className="w-4 h-4 border-2 border-[#e2c27f] border-t-[#c4892e] rounded-full animate-spin flex-shrink-0"/>
              <span className="text-sm text-[#7a7460]">Loading tafsir…</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <svg className="flex-shrink-0 text-amber-500 mt-0.5" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="8" r="6"/>
                <path d="M8 5v3M8 11v.5"/>
              </svg>
              <div>
                <p className="text-xs font-medium text-amber-700">Tafsir unavailable</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  This ayah may not have an entry in this edition. Try another source.
                </p>
              </div>
            </div>
          )}

          {/* Tafsir text */}
          {currentText && !loading && !error && (
            <div>
              {sanitize(currentText)
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} className="text-sm text-[#3d3932] leading-relaxed mb-3 last:mb-0">
                    {para.trim()}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}