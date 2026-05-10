"use client";

import { useState, useRef, useEffect } from "react";
import { useSettings } from "../components/context/SettingsContext";

const THEMES = [
  { id: "parchment", label: "Parchment", bg: ["#fdf8f0", "#f0e6cc"], text: "#1a1814", arabic: "#1a1814", accent: "#c4892e" },
  { id: "night",     label: "Night",     bg: ["#0f0e0c", "#1a1814"], text: "#f0e8d8", arabic: "#f0e8d8", accent: "#d4a44d" },
  { id: "emerald",   label: "Emerald",   bg: ["#0a1f0a", "#0d2b0d"], text: "#e8f5e8", arabic: "#e8f5e8", accent: "#4ade80" },
  { id: "royal",     label: "Royal",     bg: ["#0f0a1e", "#1a0f35"], text: "#e8e0f8", arabic: "#e8e0f8", accent: "#a78bfa" },
  { id: "rose",      label: "Rose",      bg: ["#1a0a0a", "#2d0f0f"], text: "#fce8e8", arabic: "#fce8e8", accent: "#f87171" },
];

export default function ShareAyahButton({ ayah }) {
  const { settings } = useSettings();
  const [open, setOpen]           = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pos, setPos]             = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  function handleOpen(e) {
    e.preventDefault();
    e.stopPropagation();

    if (open) { setOpen(false); return; }

    // Calculate where to show the panel
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({
        top:  r.bottom + 8,
        left: Math.max(8, Math.min(r.left, window.innerWidth - 248)),
      });
    }
    setOpen(true);
  }

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    window.addEventListener("scroll", close, { passive: true });
    return () => {
      document.removeEventListener("click", close);
      window.removeEventListener("scroll", close);
    };
  }, [open]);

  async function handleGenerate(e, theme) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    setGenerating(true);

    try {
      const W = 1080, H = 1080;
      const canvas = document.createElement("canvas");
      canvas.width  = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      // Background
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, theme.bg[0]);
      grad.addColorStop(1, theme.bg[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Corner brackets
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.5;
      const s = 40, m = 55;
      [
        [m, m + s, m, m, m + s, m],
        [W - m - s, m, W - m, m, W - m, m + s],
        [m, H - m - s, m, H - m, m + s, H - m],
        [W - m - s, H - m, W - m, H - m, W - m, H - m - s],
      ].forEach(([x1, y1, x2, y2, x3, y3]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // Top / bottom border lines
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.moveTo(70, 70);     ctx.lineTo(W - 70, 70);     ctx.stroke();
      ctx.beginPath(); ctx.moveTo(70, H - 70); ctx.lineTo(W - 70, H - 70); ctx.stroke();
      ctx.globalAlpha = 1;

      // Bismillah
      ctx.font = "32px serif";
      ctx.fillStyle = theme.accent;
      ctx.textAlign = "center";
      ctx.globalAlpha = 0.6;
      ctx.fillText("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", W / 2, 128);
      ctx.globalAlpha = 1;

      // Surah badge
      const badge = `${ayah.surahEnglishName}  ·  Ayah ${ayah.number}`;
      ctx.font = "bold 22px sans-serif";
      const bw = ctx.measureText(badge).width + 52;
      const bx = (W - bw) / 2;
      // badge background
      ctx.beginPath();
      ctx.roundRect(bx, 148, bw, 42, 21);
      ctx.fillStyle = theme.accent + "28";
      ctx.fill();
      ctx.strokeStyle = theme.accent + "70";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = theme.accent;
      ctx.fillText(badge, W / 2, 175);

      // Divider
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.22;
      ctx.beginPath(); ctx.moveTo(180, 212); ctx.lineTo(W - 180, 212); ctx.stroke();
      ctx.globalAlpha = 1;

      // Arabic text
      ctx.direction = "rtl";
      const arabicLines = wrap(ctx, ayah.arabic, W - 140, "bold 46px serif");
      ctx.font = "bold 46px serif";
      ctx.fillStyle = theme.arabic;
      ctx.textAlign = "center";
      let ay = 295;
      for (const line of arabicLines) {
        ctx.fillText(line, W / 2, ay);
        ay += 68;
      }
      ctx.direction = "ltr";

      // Ornamental divider
      const dy = ay + 20;
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(180, dy); ctx.lineTo(W / 2 - 26, dy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W / 2 + 26, dy); ctx.lineTo(W - 180, dy); ctx.stroke();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = theme.accent;
      ctx.font = "20px serif";
      ctx.fillText("❧", W / 2, dy + 8);
      ctx.globalAlpha = 1;

      // Translation
      const trans = settings?.translation === "pickthall" ? ayah.pickthall : ayah.sahih;
      const transLines = wrap(ctx, `"${trans}"`, W - 180, "italic 29px serif");
      ctx.font = "italic 29px serif";
      ctx.fillStyle = theme.text;
      ctx.globalAlpha = 0.88;
      let ty = dy + 52;
      for (const line of transLines) {
        ctx.fillText(line, W / 2, ty);
        ty += 44;
      }
      ctx.globalAlpha = 1;

      // Watermark
      ctx.font = "500 20px sans-serif";
      ctx.fillStyle = theme.accent;
      ctx.globalAlpha = 0.4;
      ctx.fillText("☽  Al-Quran", W / 2, H - 82);
      ctx.globalAlpha = 1;

      // Download
      const a = document.createElement("a");
      a.download = `ayah-${ayah.surahNumber}-${ayah.number}-${theme.id}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();

    } catch (err) {
      console.error("Canvas error:", err);
      alert("Image generation failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  }

  function wrap(ctx, text, maxW, font) {
    ctx.font = font;
    const words = text.split(" ");
    const lines = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  return (
    <>
      {/* Main button */}
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={generating}
        title="Share as image"
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "7px 12px", borderRadius: "8px",
          border: `1px solid ${open ? "rgba(196,137,46,0.5)" : "transparent"}`,
          backgroundColor: open ? "rgba(196,137,46,0.1)" : "transparent",
          color: open ? "#c4892e" : "var(--color-text-muted)",
          cursor: generating ? "wait" : "pointer",
          fontSize: "12px", fontWeight: 500, fontFamily: "inherit",
          opacity: generating ? 0.6 : 1,
        }}
        onMouseEnter={e => {
          if (!open && !generating) {
            e.currentTarget.style.backgroundColor = "rgba(247,237,216,0.6)";
            e.currentTarget.style.color = "#c4892e";
            e.currentTarget.style.borderColor = "rgba(196,137,46,0.35)";
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--color-text-muted)";
            e.currentTarget.style.borderColor = "transparent";
          }
        }}
      >
        {generating ? (
          <div style={{
            width: "14px", height: "14px",
            border: "2px solid rgba(196,137,46,0.3)",
            borderTopColor: "#c4892e", borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        )}
        <span>{generating ? "Generating…" : "Share"}</span>
      </button>

      {/* Panel — fixed to viewport, escapes overflow:hidden completely */}
      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "fixed",
            top:  pos.top  + "px",
            left: pos.left + "px",
            width: "240px",
            zIndex: 99999,
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 12px 48px rgba(0,0,0,0.3), 0 0 0 1px rgba(196,137,46,0.3)",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "10px 14px",
            background: "linear-gradient(135deg, #fdf8f0, #f7edd8)",
            borderBottom: "1px solid rgba(226,194,127,0.4)",
          }}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#c4892e", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              🖼 Choose card style
            </p>
          </div>

          {/* Theme options */}
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={(e) => handleGenerate(e, theme)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "11px 14px", border: "none", cursor: "pointer",
                backgroundColor: "#ffffff", textAlign: "left", fontFamily: "inherit",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fdf8f0"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#ffffff"}
            >
              {/* Swatch */}
              <div style={{
                width: "38px", height: "38px", borderRadius: "9px", flexShrink: 0,
                background: `linear-gradient(135deg, ${theme.bg[0]}, ${theme.bg[1]})`,
                border: `2.5px solid ${theme.accent}`,
                boxShadow: `0 2px 8px ${theme.accent}55`,
              }} />
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#1a1814" }}>
                  {theme.label}
                </p>
                <p style={{ margin: "1px 0 0", fontSize: "10px", color: "#7a7460" }}>
                  Download 1080×1080 PNG
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}