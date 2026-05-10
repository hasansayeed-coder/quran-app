"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSettings } from "../components/context/SettingsContext";
import CopyAyahButton from "../components/CopyAyahButton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function highlight(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i}>{part}</mark>
    ) : (
      part
    )
  );
}

export default function SearchClient() {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setResults(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/search?q=${encodeURIComponent(q)}&translation=both`
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setResults(json.data);
    } catch (e) {
      setError(e.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  }

  function handleSubmit(e) {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    doSearch(query);
  }

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative mb-8">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#e2c27f] bg-white/80 focus-within:border-[#c4892e] transition-colors shadow-sm">
          <svg
            className="flex-shrink-0 text-[#c4892e]"
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="M15 15l3 3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="Search for a word or phrase… e.g. mercy, guidance, prayer"
            className="flex-1 bg-transparent outline-none text-[#1a1814] placeholder-[#b4ae97] text-sm"
            autoFocus
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-[#c4892e]/30 border-t-[#c4892e] rounded-full animate-spin flex-shrink-0" />
          )}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Results count */}
      {results !== null && (
        <p className="text-sm text-[#7a7460] mb-4">
          {results.length === 0
            ? `No results found for "${query}"`
            : `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`}
        </p>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="space-y-3">
          {results.map((r, i) => (
            <SearchResult
              key={`${r.numberInQuran}-${i}`}
              result={r}
              query={query}
              translationFontSize={settings.translationFontSize}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!query && !results && (
        <div className="text-center py-16 text-[#b4ae97]">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">Type at least 2 characters to search</p>
        </div>
      )}
    </div>
  );
}

function SearchResult({ result, query, translationFontSize }) {
  // Build minimal ayah payload for CopyAyahButton
  const ayahPayload = {
    surahNumber:      result.surahNumber,
    surahEnglishName: result.surahEnglishName,
    number:           result.ayahNumber,
    numberInQuran:    result.numberInQuran,
    arabic:           "",           // not available in search results
    sahih:            result.edition !== "en.pickthall" ? result.text : "",
    pickthall:        result.edition === "en.pickthall" ? result.text : "",
  };

  const translationMode = result.edition === "en.pickthall" ? "pickthall" : "sahih";

  return (
    <div className="ayah-card rounded-xl border border-[#e2c27f]/30 bg-white/60 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e2c27f]/15">
        <Link
          href={`/surah/${result.surahNumber}#ayah-${result.ayahNumber}`}
          className="flex items-center gap-2 group"
        >
          <span className="px-2 py-0.5 rounded-md bg-[#f7edd8] border border-[#e2c27f]/50 text-xs font-medium text-[#c4892e] group-hover:bg-[#c4892e]/15 transition-colors">
            {result.surahEnglishName}
          </span>
          <span className="text-xs text-[#7a7460]">Ayah {result.ayahNumber}</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#b4ae97] hidden sm:inline">
            {result.edition === "en.pickthall" ? "Pickthall" : "Sahih International"}
          </span>
          <CopyAyahButton ayah={ayahPayload} translation={translationMode} />
        </div>
      </div>

      {/* Text with highlight */}
      <Link
        href={`/surah/${result.surahNumber}#ayah-${result.ayahNumber}`}
        className="block px-4 py-3 hover:bg-[#f7edd8]/30 transition-colors"
      >
        <p className="text-[#3d3932] leading-relaxed" style={{ fontSize: `${translationFontSize}px` }}>
          {highlight(result.text, query)}
        </p>
      </Link>
    </div>
  );
}