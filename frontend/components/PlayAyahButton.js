"use client";

import { useAudio } from "../components/AudioPlayer";

export default function PlayAyahButton({ ayah, ayahList }) {
  const { loadAyah, togglePlay, currentAyah, playing, loading } = useAudio();

  const isThisAyah = currentAyah?.numberInQuran === ayah.numberInQuran;
  const isPlaying  = isThisAyah && playing;
  const isLoading  = isThisAyah && loading;

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isThisAyah) togglePlay();
    else loadAyah(ayah, ayahList, true);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isPlaying ? "Pause" : "Play this ayah"}
      title={isPlaying ? "Pause" : "Play this ayah"}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "6px", padding: "7px 12px", borderRadius: "8px",
        border: `1px solid ${isThisAyah ? "rgba(196,137,46,0.5)" : "transparent"}`,
        backgroundColor: isThisAyah ? "rgba(196,137,46,0.15)" : "transparent",
        cursor: "pointer",
        color: isThisAyah ? "var(--color-gold)" : "var(--color-text-muted)",
        fontSize: "12px", fontWeight: 500,
        transition: "all 0.15s ease",
        fontFamily: "inherit",
      }}
      onMouseEnter={e => {
        if (!isThisAyah) {
          e.currentTarget.style.backgroundColor = "var(--color-surface)";
          e.currentTarget.style.color = "var(--color-gold)";
          e.currentTarget.style.borderColor = "rgba(196,137,46,0.4)";
        }
      }}
      onMouseLeave={e => {
        if (!isThisAyah) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--color-text-muted)";
          e.currentTarget.style.borderColor = "transparent";
        }
      }}
    >
      {isLoading ? (
        <div style={{
          width: "16px", height: "16px",
          border: "2px solid rgba(196,137,46,0.3)",
          borderTopColor: "#c4892e",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
      ) : isPlaying ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6zm8-14v14h4V5z"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      )}
      <span>{isPlaying ? "Pause" : "Play"}</span>
    </button>
  );
}