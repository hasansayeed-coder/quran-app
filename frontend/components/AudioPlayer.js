"use client";

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ─── Audio Context ─────────────────────────────────────────────────────────────
const AudioContext = createContext(null);

export const RECITERS = [
  { id: "ar.alafasy",            name: "Mishary Alafasy",       short: "Alafasy" },
  { id: "ar.abdurrahmaansudais", name: "Abdul Rahman Al-Sudais",short: "Sudais" },
  { id: "ar.ahmedajamy",         name: "Ahmed Al-Ajamy",        short: "Ajamy" },
  { id: "ar.husary",             name: "Mahmoud Al-Husary",     short: "Husary" },
  { id: "ar.minshawi",           name: "Mohamed Al-Minshawi",   short: "Minshawi" },
  { id: "ar.muhammadayyoub",     name: "Muhammad Ayyoub",       short: "Ayyoub" },
  { id: "ar.shaatree",           name: "Abu Bakr Al-Shatri",    short: "Shatri" },
];

const CDN = "https://cdn.islamic.network/quran/audio/128";

function getAudioUrl(reciterId, ayahNumberInQuran) {
  return `${CDN}/${reciterId}/${ayahNumberInQuran}.mp3`;
}

export function AudioProvider({ children }) {
  const [currentAyah, setCurrentAyah]   = useState(null); // { numberInQuran, number, surahNumber, surahName, surahEnglishName, arabic, ayahs }
  const [ayahList, setAyahList]         = useState([]);    // full surah ayah list for prev/next
  const [reciter, setReciter]           = useState(RECITERS[0]);
  const [playing, setPlaying]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [progress, setProgress]         = useState(0);     // 0-100
  const [duration, setDuration]         = useState(0);
  const [currentTime, setCurrentTime]   = useState(0);
  const [visible, setVisible]           = useState(false);
  const [autoPlay, setAutoPlay]         = useState(true);

  const audioRef = useRef(null);

  // Init audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    });
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("playing",  () => { setPlaying(true);  setLoading(false); });
    audio.addEventListener("pause",    () => setPlaying(false));
    audio.addEventListener("waiting",  () => setLoading(true));
    audio.addEventListener("canplay",  () => setLoading(false));
    audio.addEventListener("ended",    () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    });

    return () => { audio.pause(); audio.src = ""; };
  }, []);

  // Auto-advance to next ayah on end (if autoPlay)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      if (autoPlay) playNext();
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [autoPlay, currentAyah, ayahList, reciter]);

  const loadAyah = useCallback((ayah, list = [], shouldPlay = true) => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentAyah(ayah);
    if (list.length) setAyahList(list);
    setVisible(true);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setLoading(true);

    // ✅ Save listening progress to localStorage
    try {
      localStorage.setItem("quran-listening-progress", JSON.stringify({
        surahNumber:      ayah.surahNumber,
        surahEnglishName: ayah.surahEnglishName,
        ayahNumber:       ayah.number,
        numberInQuran:    ayah.numberInQuran,
        reciterId:        reciter.id,
        reciterName:      reciter.name,
        savedAt:          Date.now(),
      }));
    } catch {}

    audio.pause();
    audio.src = getAudioUrl(reciter.id, ayah.numberInQuran);
    audio.load();
    if (shouldPlay) audio.play().catch(() => setLoading(false));
  }, [reciter]);

  // Re-load when reciter changes while something is active
  const changeReciter = useCallback((newReciter) => {
    setReciter(newReciter);
    const audio = audioRef.current;
    if (!audio || !currentAyah) return;
    const wasPlaying = !audio.paused;
    const savedTime  = audio.currentTime;
    audio.src = getAudioUrl(newReciter.id, currentAyah.numberInQuran);
    audio.load();
    audio.currentTime = 0;
    if (wasPlaying) audio.play().catch(() => {});
  }, [currentAyah]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, []);

  const seek = useCallback((pct) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (pct / 100) * audio.duration;
  }, []);

  const playNext = useCallback(() => {
    if (!currentAyah || !ayahList.length) return;
    const idx = ayahList.findIndex(a => a.numberInQuran === currentAyah.numberInQuran);
    if (idx !== -1 && idx < ayahList.length - 1) {
      loadAyah(ayahList[idx + 1], ayahList, true);
    }
  }, [currentAyah, ayahList, loadAyah]);

  const playPrev = useCallback(() => {
    if (!currentAyah || !ayahList.length) return;
    const audio = audioRef.current;
    // If more than 3s in, restart current ayah
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const idx = ayahList.findIndex(a => a.numberInQuran === currentAyah.numberInQuran);
    if (idx > 0) loadAyah(ayahList[idx - 1], ayahList, true);
  }, [currentAyah, ayahList, loadAyah]);

  const close = useCallback(() => {
    audioRef.current?.pause();
    setVisible(false);
    setPlaying(false);
  }, []);

  return (
    <AudioContext.Provider value={{
      currentAyah, ayahList, reciter, playing, loading,
      progress, duration, currentTime, visible, autoPlay,
      loadAyah, togglePlay, playNext, playPrev,
      changeReciter, seek, close, setAutoPlay,
    }}>
      {children}
      <AudioPlayerBar />
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);

// ─── Sticky bottom player bar ──────────────────────────────────────────────────
function AudioPlayerBar() {
  const {
    currentAyah, reciter, playing, loading, progress, duration, currentTime,
    visible, autoPlay, togglePlay, playNext, playPrev,
    changeReciter, seek, close, setAutoPlay, ayahList,
  } = useAudio();

  const [showReciters, setShowReciters] = useState(false);

  if (!visible || !currentAyah) return null;

  const currentIdx = ayahList.findIndex(a => a.numberInQuran === currentAyah.numberInQuran);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < ayahList.length - 1;

  function fmt(s) {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <>
      {/* Reciter dropdown backdrop */}
      {showReciters && (
        <div className="fixed inset-0 z-40" onClick={() => setShowReciters(false)} />
      )}

      {/* Player bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1814] border-t border-[#3d3932] shadow-2xl">
        {/* Progress bar (click to seek) */}
        <div
          className="h-1 bg-[#3d3932] cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - rect.left) / rect.width) * 100);
          }}
        >
          <div
            className="h-full bg-[#c4892e] transition-all group-hover:bg-[#d4a44d] relative"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#d4a44d] rounded-full -mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center gap-3">
          {/* Ayah info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#f7edd8] truncate leading-tight">
              {currentAyah.surahEnglishName}
              <span className="text-[#c4892e] mx-1">·</span>
              Ayah {currentAyah.number}
            </p>
            <p className="text-[10px] text-[#7a7460] truncate mt-0.5">
              {reciter.short}
              {duration > 0 && (
                <span className="ml-1.5 text-[#625d4d]">
                  {fmt(currentTime)} / {fmt(duration)}
                </span>
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Prev */}
            <button
              onClick={playPrev}
              disabled={!hasPrev}
              className="p-1.5 rounded-md text-[#7a7460] hover:text-[#f7edd8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous ayah"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
              </svg>
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-[#c4892e] hover:bg-[#d4a44d] flex items-center justify-center transition-colors flex-shrink-0"
              title={playing ? "Pause" : "Play"}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : playing ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M6 19h4V5H6zm8-14v14h4V5z"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Next */}
            <button
              onClick={playNext}
              disabled={!hasNext}
              className="p-1.5 rounded-md text-[#7a7460] hover:text-[#f7edd8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next ayah"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zm2.5-6 8.5 6V6l-8.5 6zM16 6h2v12h-2z" />
              </svg>
            </button>

            {/* Auto-play toggle */}
            <button
              onClick={() => setAutoPlay(p => !p)}
              title={autoPlay ? "Auto-play on" : "Auto-play off"}
              className={`p-1.5 rounded-md transition-colors hidden sm:flex ${
                autoPlay ? "text-[#c4892e]" : "text-[#4e493d] hover:text-[#7a7460]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </button>

            {/* Reciter picker */}
            <div className="relative">
              <button
                onClick={() => setShowReciters(p => !p)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[#7a7460] hover:text-[#f7edd8] hover:bg-[#3d3932] transition-colors"
                title="Change reciter"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
                </svg>
                <span className="text-[10px] hidden sm:inline">{reciter.short}</span>
              </button>

              {showReciters && (
                <div className="absolute bottom-full right-0 mb-2 w-52 bg-[#1a1814] border border-[#3d3932] rounded-xl shadow-2xl overflow-hidden z-50">
                  <p className="px-3 py-2 text-[10px] uppercase tracking-widest text-[#4e493d] border-b border-[#3d3932]">
                    Select Reciter
                  </p>
                  {RECITERS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { changeReciter(r); setShowReciters(false); }}
                      className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between ${
                        reciter.id === r.id
                          ? "bg-[#c4892e]/15 text-[#d4a44d]"
                          : "text-[#b4ae97] hover:bg-[#3d3932] hover:text-[#f7edd8]"
                      }`}
                    >
                      <span>{r.name}</span>
                      {reciter.id === r.id && (
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Close */}
            <button
              onClick={close}
              className="p-1.5 rounded-md text-[#4e493d] hover:text-[#7a7460] transition-colors"
              title="Close player"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l10 10M13 3L3 13"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}