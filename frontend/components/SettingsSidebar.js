"use client";

import { useSettings } from "../components/context/SettingsContext";

const FONTS = [
  { id: "amiri",        label: "Amiri",       sample: "بِسْمِ ٱللَّهِ" },
  { id: "scheherazade", label: "Scheherazade", sample: "بِسْمِ ٱللَّهِ" },
  { id: "noto",         label: "Noto Naskh",  sample: "بِسْمِ ٱللَّهِ" },
  { id: "lateef",       label: "Lateef",      sample: "بِسْمِ ٱللَّهِ" },
];

const FONT_FAMILIES = {
  amiri:        "Amiri, serif",
  scheherazade: "'Scheherazade New', serif",
  noto:         "'Noto Naskh Arabic', serif",
  lateef:       "Lateef, serif",
};

export default function SettingsSidebar() {
  const { settings, update, mounted } = useSettings();

  // Don't render until mounted — prevents flash on load
  if (!mounted) return null;

  const isOpen = settings.sidebarOpen;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => update("sidebarOpen", false)}
        />
      )}

      {/* Sidebar panel — fully inline styles to avoid Tailwind conflicts */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "320px",
          zIndex: 50,
          backgroundColor: "#1a1814",
          color: "#f7edd8",
          boxShadow: "-4px 0 32px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          // Key fix: translate off-screen when closed
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          visibility: isOpen ? "visible" : "hidden",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #3d3932",
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "14px", fontWeight: 500,
            letterSpacing: "0.15em", textTransform: "uppercase",
            color: "#d4a44d",
          }}>
            Settings
          </h2>
          <button
            onClick={() => update("sidebarOpen", false)}
            aria-label="Close settings"
            style={{
              padding: "6px", borderRadius: "6px",
              background: "none", border: "none",
              cursor: "pointer", color: "#7a7460",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#f7edd8"}
            onMouseLeave={e => e.currentTarget.style.color = "#7a7460"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* ── Appearance / Dark Mode ── */}
          <section>
            <p style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#7a7460" }}>
              Appearance
            </p>
            <button
              onClick={() => update("darkMode", !settings.darkMode)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "12px",
                borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
                border: `1px solid ${settings.darkMode ? "#c4892e" : "#3d3932"}`,
                backgroundColor: settings.darkMode ? "rgba(196,137,46,0.1)" : "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {settings.darkMode ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a44d" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b4ae97" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                )}
                <span style={{ fontSize: "13px", color: "#b4ae97" }}>
                  {settings.darkMode ? "Dark Mode" : "Light Mode"}
                </span>
              </div>
              <TogglePill on={settings.darkMode} />
            </button>
          </section>

          {/* ── Arabic Font ── */}
          <section>
            <p style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#7a7460" }}>
              Arabic Font
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {FONTS.map(font => (
                <button
                  key={font.id}
                  onClick={() => update("arabicFont", font.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "space-between", padding: "10px 12px",
                    borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
                    border: `1px solid ${settings.arabicFont === font.id ? "#c4892e" : "#3d3932"}`,
                    backgroundColor: settings.arabicFont === font.id ? "rgba(196,137,46,0.1)" : "transparent",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#b4ae97" }}>{font.label}</span>
                  <span style={{ fontFamily: FONT_FAMILIES[font.id], fontSize: "18px", color: "#f7edd8" }}>
                    {font.sample}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Arabic Font Size ── */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#7a7460" }}>
                Arabic Size
              </p>
              <span style={{ fontSize: "13px", color: "#d4a44d", fontFamily: "monospace" }}>
                {settings.arabicFontSize}px
              </span>
            </div>
            <input
              type="range" min="20" max="48" step="2"
              value={settings.arabicFontSize}
              onChange={e => update("arabicFontSize", Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#625d4d", marginTop: "4px" }}>
              <span>Small</span><span>Large</span>
            </div>
          </section>

          {/* ── Translation Font Size ── */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#7a7460" }}>
                Translation Size
              </p>
              <span style={{ fontSize: "13px", color: "#d4a44d", fontFamily: "monospace" }}>
                {settings.translationFontSize}px
              </span>
            </div>
            <input
              type="range" min="12" max="24" step="1"
              value={settings.translationFontSize}
              onChange={e => update("translationFontSize", Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#625d4d", marginTop: "4px" }}>
              <span>Small</span><span>Large</span>
            </div>
          </section>

          {/* ── Translation ── */}
          <section>
            <p style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#7a7460" }}>
              Translation
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { id: "sahih",     label: "Sahih International" },
                { id: "pickthall", label: "Pickthall" },
                { id: "both",      label: "Show Both" },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => update("translation", t.id)}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 12px",
                    borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
                    fontSize: "13px",
                    border: `1px solid ${settings.translation === t.id ? "#c4892e" : "#3d3932"}`,
                    backgroundColor: settings.translation === t.id ? "rgba(196,137,46,0.1)" : "transparent",
                    color: settings.translation === t.id ? "#d4a44d" : "#b4ae97",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          {/* ── Transliteration ── */}
          <section>
            <p style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#7a7460" }}>
              Transliteration
            </p>
            <button
              onClick={() => update("showTransliteration", !settings.showTransliteration)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "12px",
                borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
                border: `1px solid ${settings.showTransliteration ? "#c4892e" : "#3d3932"}`,
                backgroundColor: settings.showTransliteration ? "rgba(196,137,46,0.1)" : "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "16px" }}>🔤</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#b4ae97" }}>
                    Show Transliteration
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#625d4d" }}>
                    Romanized Arabic pronunciation
                  </p>
                </div>
              </div>
              <TogglePill on={settings.showTransliteration} />
            </button>
          </section>

        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 20px",
          borderTop: "1px solid #3d3932",
          textAlign: "center",
          fontSize: "10px", color: "#4e493d",
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          Settings saved automatically
        </div>
      </aside>
    </>
  );
}

// Reusable toggle pill component
function TogglePill({ on }) {
  return (
    <div style={{
      width: "40px", height: "22px", borderRadius: "11px",
      backgroundColor: on ? "#c4892e" : "#3d3932",
      position: "relative", flexShrink: 0,
      transition: "background-color 0.3s",
    }}>
      <span style={{
        position: "absolute", top: "2px",
        left: on ? "20px" : "2px",
        width: "18px", height: "18px",
        borderRadius: "50%", backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        transition: "left 0.3s",
      }} />
    </div>
  );
}