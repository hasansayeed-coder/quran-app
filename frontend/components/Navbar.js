"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "../components/context/SettingsContext";
import { useBookmarks } from "../components/context/BookmarksContext";

export default function Navbar() {
  const pathname = usePathname();
  const { settings, update } = useSettings();
  const { bookmarks, mounted } = useBookmarks();

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      borderBottom: "1px solid rgba(226,194,127,0.4)",
      backgroundColor: "rgba(253,248,240,0.92)",
      backdropFilter: "blur(8px)",
    }}>
      <nav style={{
        maxWidth: "1152px", margin: "0 auto",
        padding: "0 24px", height: "56px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: "flex", alignItems: "center",
          gap: "12px", textDecoration: "none",
        }}>
          <span style={{ fontSize: "20px", color: "#c4892e" }}>☽</span>
          <span style={{
            fontSize: "18px", fontWeight: 500,
            letterSpacing: "0.05em", color: "#1a1814",
          }}>
            Al-Quran
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          <NavLink href="/" active={pathname === "/"}>Surahs</NavLink>
          <NavLink href="/search" active={pathname === "/search"}>Search</NavLink>
          <NavLink href="/compare" active={pathname === "/compare"}>Compare</NavLink>

          {/* Bookmarks */}
          <Link
            href="/bookmarks"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "8px",
              textDecoration: "none", fontSize: "14px", fontWeight: 500,
              backgroundColor: pathname === "/bookmarks" ? "#c4892e" : "transparent",
              color: pathname === "/bookmarks" ? "#fdf8f0" : "#7a7460",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16"
              fill={pathname === "/bookmarks" ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="1.75">
              <path d="M3 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1z"/>
            </svg>
            Bookmarks
            {mounted && bookmarks.length > 0 && (
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                minWidth: "18px", height: "18px", padding: "0 4px",
                borderRadius: "50px", fontSize: "10px", fontWeight: 700,
                backgroundColor: pathname === "/bookmarks" ? "rgba(255,255,255,0.3)" : "#c4892e",
                color: "white",
              }}>
                {bookmarks.length}
              </span>
            )}
          </Link>

          {/* Progress */}
          <Link
            href="/progress"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "8px",
              textDecoration: "none", fontSize: "14px", fontWeight: 500,
              backgroundColor: pathname === "/progress" ? "#c4892e" : "transparent",
              color: pathname === "/progress" ? "#fdf8f0" : "#7a7460",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            Progress
          </Link>

          <Link
            href="/prayer-times"
            style={{
              padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
              textDecoration: "none",
              backgroundColor: pathname === "/prayer-times" ? "#c4892e" : "transparent",
              color: pathname === "/prayer-times" ? "#ffffff" : "#7a7460",
            }}
          >
            🕌 Prayer Times
          </Link>

          <NavLink href="/dhikr" active={pathname === "/dhikr"}>
            🤲 Dhikr
          </NavLink>

          <Link
            href="/stats"
            style={{
              padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
              textDecoration: "none",
              backgroundColor: pathname === "/stats" ? "#c4892e" : "transparent",
              color: pathname === "/stats" ? "#ffffff" : "#7a7460",
            }}
          >
            📊 Stats
          </Link>

          {/* Notes */}
          <Link
            href="/notes"
            style={{
              padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
              textDecoration: "none", display: "flex", alignItems: "center", gap: "6px",
              backgroundColor: pathname === "/notes" ? "#7c6fa0" : "transparent",
              color: pathname === "/notes" ? "#ffffff" : "#7a7460",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Notes
          </Link>

          {/* Dark mode toggle */}
          <button
            onClick={() => update("darkMode", !settings.darkMode)}
            aria-label="Toggle dark mode"
            style={{
              padding: "8px", borderRadius: "8px", border: "none",
              backgroundColor: "transparent", cursor: "pointer",
              color: "#7a7460", display: "flex", alignItems: "center",
            }}
          >
            {settings.darkMode ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Settings toggle */}
          <button
            onClick={() => update("sidebarOpen", true)}
            aria-label="Open settings"
            style={{
              padding: "8px", borderRadius: "8px", border: "none",
              backgroundColor: "transparent", cursor: "pointer",
              color: "#7a7460", display: "flex", alignItems: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>

        </div>
      </nav>
    </header>
  );
}

function NavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      style={{
        padding: "6px 12px", borderRadius: "8px",
        textDecoration: "none", fontSize: "14px", fontWeight: 500,
        backgroundColor: active ? "#c4892e" : "transparent",
        color: active ? "#fdf8f0" : "#7a7460",
      }}
    >
      {children}
    </Link>
  );
}