"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Dhikr definitions ──────────────────────────────────────────────────────────
const DHIKRS = [
  {
    id: "subhanallah",
    arabic:       "سُبْحَانَ اللَّهِ",
    transliteration: "SubhanAllah",
    meaning:      "Glory be to Allah",
    defaultGoal:  33,
    color:        "#5a9e8f",
    lightBg:      "rgba(90,158,143,0.08)",
    border:       "rgba(90,158,143,0.3)",
    virtue:       "Fills half the scales of good deeds",
  },
  {
    id: "alhamdulillah",
    arabic:       "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    meaning:      "All praise is due to Allah",
    defaultGoal:  33,
    color:        "#c4892e",
    lightBg:      "rgba(196,137,46,0.08)",
    border:       "rgba(196,137,46,0.3)",
    virtue:       "Fills the scales of good deeds",
  },
  {
    id: "allahuakbar",
    arabic:       "اللَّهُ أَكْبَرُ",
    transliteration: "AllahuAkbar",
    meaning:      "Allah is the Greatest",
    defaultGoal:  34,
    color:        "#7c6fa0",
    lightBg:      "rgba(124,111,160,0.08)",
    border:       "rgba(124,111,160,0.3)",
    virtue:       "Fills what is between the heaven and the earth",
  },
  {
    id: "lailahaillallah",
    arabic:       "لَا إِلَهَ إِلَّا اللَّهُ",
    transliteration: "La ilaha illallah",
    meaning:      "There is no god but Allah",
    defaultGoal:  100,
    color:        "#b06060",
    lightBg:      "rgba(176,96,96,0.08)",
    border:       "rgba(176,96,96,0.3)",
    virtue:       "Best of dhikr — said to be the key to Paradise",
  },
  {
    id: "astaghfirullah",
    arabic:       "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    meaning:      "I seek forgiveness from Allah",
    defaultGoal:  100,
    color:        "#6b7db3",
    lightBg:      "rgba(107,125,179,0.08)",
    border:       "rgba(107,125,179,0.3)",
    virtue:       "Removes sins and opens the door to rizq",
  },
  {
    id: "salawat",
    arabic:       "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ",
    transliteration: "Sallallahu Alayhi Wasallam",
    meaning:      "Peace and blessings upon the Prophet ﷺ",
    defaultGoal:  10,
    color:        "#c4892e",
    lightBg:      "rgba(196,137,46,0.08)",
    border:       "rgba(196,137,46,0.3)",
    virtue:       "10 blessings from Allah for each salawat",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadStorage() {
  try {
    const raw = localStorage.getItem("quran-dhikr");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveStorage(data) {
  try { localStorage.setItem("quran-dhikr", JSON.stringify(data)); } catch {}
}

function calcStreak(history) {
  // history: { "YYYY-M-D": true } — days where all goals were completed
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    if (history[key]) streak++;
    else if (i > 0) break; // allow today to be incomplete
  }
  return streak;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DhikrClient() {
  const [mounted,     setMounted]     = useState(false);
  const [counts,      setCounts]      = useState({});     // { id: number } — today's counts
  const [goals,       setGoals]       = useState({});     // { id: number }
  const [history,     setHistory]     = useState({});     // { "date": { id: count } }
  const [completedDays, setCompletedDays] = useState({}); // { "date": true }
  const [activeId,    setActiveId]    = useState(DHIKRS[0].id);
  const [pulse,       setPulse]       = useState(false);
  const [editGoal,    setEditGoal]    = useState(null);   // id being edited
  const [tempGoal,    setTempGoal]    = useState("");
  const [vibrate,     setVibrate]     = useState(true);
  const tapRef = useRef(null);

  // ── Load from localStorage ──
  useEffect(() => {
    const stored = loadStorage();
    const today  = todayKey();

    if (stored) {
      const todayCounts = stored.history?.[today] || {};
      setCounts(todayCounts);
      setGoals(stored.goals || {});
      setHistory(stored.history || {});
      setCompletedDays(stored.completedDays || {});
    } else {
      // First time — set default goals
      const defaultGoals = {};
      DHIKRS.forEach(d => { defaultGoals[d.id] = d.defaultGoal; });
      setGoals(defaultGoals);
    }
    setMounted(true);
  }, []);

  // ── Save whenever state changes ──
  const persist = useCallback((newCounts, newGoals, newHistory, newCompletedDays) => {
    saveStorage({ goals: newGoals, history: newHistory, completedDays: newCompletedDays });
  }, []);

  // ── Count ──
  function handleCount() {
    const today = todayKey();
    const dhikr = DHIKRS.find(d => d.id === activeId);
    const goal  = goals[activeId] || dhikr.defaultGoal;

    setCounts(prev => {
      const newCounts = { ...prev, [activeId]: (prev[activeId] || 0) + 1 };

      // Update history
      const newHistory = { ...history };
      if (!newHistory[today]) newHistory[today] = {};
      newHistory[today] = { ...newHistory[today], [activeId]: newCounts[activeId] };

      // Check if ALL goals completed today
      const allDone = DHIKRS.every(d => (newCounts[d.id] || 0) >= (goals[d.id] || d.defaultGoal));
      const newCompletedDays = { ...completedDays };
      if (allDone) newCompletedDays[today] = true;

      setHistory(newHistory);
      setCompletedDays(newCompletedDays);
      persist(newCounts, goals, newHistory, newCompletedDays);

      return newCounts;
    });

    // Pulse animation
    setPulse(true);
    setTimeout(() => setPulse(false), 150);

    // Vibrate on mobile
    if (vibrate && navigator.vibrate) navigator.vibrate(30);
  }

  // ── Long press to subtract ──
  function handleLongPress() {
    const today = todayKey();
    setCounts(prev => {
      const cur = prev[activeId] || 0;
      if (cur === 0) return prev;
      const newCounts = { ...prev, [activeId]: cur - 1 };
      const newHistory = { ...history };
      if (!newHistory[today]) newHistory[today] = {};
      newHistory[today] = { ...newHistory[today], [activeId]: newCounts[activeId] };
      setHistory(newHistory);
      persist(newCounts, goals, newHistory, completedDays);
      return newCounts;
    });
  }

  function handleMouseDown() {
    tapRef.current = setTimeout(handleLongPress, 600);
  }

  function handleMouseUp() {
    clearTimeout(tapRef.current);
  }

  // ── Reset today ──
  function resetToday() {
    const today = todayKey();
    setCounts({});
    const newHistory = { ...history };
    newHistory[today] = {};
    setHistory(newHistory);
    persist({}, goals, newHistory, completedDays);
  }

  // ── Update goal ──
  function saveGoal(id) {
    const val = parseInt(tempGoal);
    if (!isNaN(val) && val > 0) {
      const newGoals = { ...goals, [id]: val };
      setGoals(newGoals);
      persist(counts, newGoals, history, completedDays);
    }
    setEditGoal(null);
  }

  if (!mounted) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
      <div style={{ width: "24px", height: "24px", border: "2px solid rgba(196,137,46,0.2)", borderTopColor: "#c4892e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  const activeDhikr = DHIKRS.find(d => d.id === activeId);
  const count       = counts[activeId] || 0;
  const goal        = goals[activeId]  || activeDhikr.defaultGoal;
  const pct         = Math.min(100, Math.round((count / goal) * 100));
  const completed   = count >= goal;
  const streak      = calcStreak(completedDays);
  const today       = todayKey();
  const todayDone   = completedDays[today];

  // Total today across all dhikrs
  const totalToday = DHIKRS.reduce((sum, d) => sum + (counts[d.id] || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 500, color: "var(--color-text)", margin: "0 0 4px" }}>
            📿 Daily Dhikr
          </h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
            Remembrance of Allah — track your daily count and build a streak
          </p>
        </div>

        {/* Streak badge */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "10px 16px", borderRadius: "14px",
          border: `1px solid ${streak > 0 ? "rgba(196,137,46,0.4)" : "var(--color-border)"}`,
          backgroundColor: streak > 0 ? "rgba(196,137,46,0.08)" : "var(--color-card-bg)",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "24px" }}>{streak > 0 ? "🔥" : "💤"}</span>
          <span style={{ fontSize: "20px", fontWeight: 800, color: streak > 0 ? "#c4892e" : "var(--color-text-muted)", fontFamily: "monospace", lineHeight: 1 }}>
            {streak}
          </span>
          <span style={{ fontSize: "10px", color: "var(--color-text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            day streak
          </span>
        </div>
      </div>

      {/* Today summary bar */}
      {totalToday > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
          borderRadius: "12px", marginBottom: "20px",
          border: `1px solid ${todayDone ? "rgba(90,158,143,0.4)" : "rgba(196,137,46,0.2)"}`,
          backgroundColor: todayDone ? "rgba(90,158,143,0.06)" : "rgba(196,137,46,0.04)",
        }}>
          <span style={{ fontSize: "18px" }}>{todayDone ? "✅" : "📿"}</span>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text)" }}>
            {todayDone
              ? <><strong style={{ color: "#5a9e8f" }}>All goals completed today!</strong> MashaAllah 🎉</>
              : <><strong style={{ color: "#c4892e" }}>{totalToday}</strong> total remembrances today</>
            }
          </p>
        </div>
      )}

      {/* ── Dhikr selector tabs ── */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {DHIKRS.map(d => {
          const c    = counts[d.id] || 0;
          const g    = goals[d.id]  || d.defaultGoal;
          const done = c >= g;
          return (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              style={{
                padding: "8px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                border: `1.5px solid ${activeId === d.id ? d.color : done ? d.color + "55" : "var(--color-border)"}`,
                backgroundColor: activeId === d.id ? d.lightBg : done ? d.lightBg : "transparent",
                color: activeId === d.id ? d.color : done ? d.color : "var(--color-text-muted)",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              {done && <span>✓</span>}
              {d.transliteration}
              <span style={{ fontSize: "10px", opacity: 0.7 }}>{c}/{g}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main counter card ── */}
      <div style={{
        borderRadius: "24px", overflow: "hidden",
        border: `2px solid ${activeDhikr.border}`,
        backgroundColor: "var(--color-card-bg)",
        marginBottom: "16px",
      }}>
        {/* Colored top strip */}
        <div style={{ height: "4px", backgroundColor: activeDhikr.color, opacity: 0.7 }} />

        {/* Card body */}
        <div style={{ padding: "28px 24px", textAlign: "center" }}>
          {/* Arabic dhikr text */}
          <p style={{
            fontFamily: "Amiri, serif", fontSize: "36px", lineHeight: 1.8,
            color: "var(--color-text)", margin: "0 0 4px", direction: "rtl",
          }}>
            {activeDhikr.arabic}
          </p>
          <p style={{ margin: "0 0 2px", fontSize: "15px", fontWeight: 700, color: activeDhikr.color }}>
            {activeDhikr.transliteration}
          </p>
          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--color-text-muted)", fontStyle: "italic" }}>
            {activeDhikr.meaning}
          </p>

          {/* Virtue */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", borderRadius: "50px", marginBottom: "28px",
            backgroundColor: activeDhikr.lightBg,
            border: `1px solid ${activeDhikr.border}`,
          }}>
            <span style={{ fontSize: "12px" }}>✨</span>
            <p style={{ margin: 0, fontSize: "11px", color: activeDhikr.color, fontWeight: 600 }}>
              {activeDhikr.virtue}
            </p>
          </div>

          {/* ── Big count display ── */}
          <div style={{
            fontSize: "80px", fontWeight: 900, fontFamily: "monospace",
            color: completed ? activeDhikr.color : "var(--color-text)",
            lineHeight: 1, marginBottom: "16px",
            transition: "color 0.3s",
            transform: pulse ? "scale(1.08)" : "scale(1)",
            transitionProperty: "transform, color",
            transitionDuration: "0.15s",
          }}>
            {count}
          </div>

          {/* Goal display */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
              Goal:
            </span>
            {editGoal === activeId ? (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  type="number"
                  value={tempGoal}
                  onChange={e => setTempGoal(e.target.value)}
                  autoFocus
                  onKeyDown={e => { if (e.key === "Enter") saveGoal(activeId); if (e.key === "Escape") setEditGoal(null); }}
                  style={{
                    width: "70px", padding: "4px 8px", borderRadius: "7px",
                    border: `1.5px solid ${activeDhikr.color}`,
                    backgroundColor: "transparent", color: "var(--color-text)",
                    fontSize: "14px", fontWeight: 700, fontFamily: "monospace",
                    outline: "none", textAlign: "center",
                  }}
                />
                <button onClick={() => saveGoal(activeId)} style={{ padding: "4px 10px", borderRadius: "7px", fontSize: "12px", fontWeight: 700, cursor: "pointer", border: "none", backgroundColor: activeDhikr.color, color: "white", fontFamily: "inherit" }}>✓</button>
                <button onClick={() => setEditGoal(null)} style={{ padding: "4px 10px", borderRadius: "7px", fontSize: "12px", fontWeight: 700, cursor: "pointer", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-muted)", fontFamily: "inherit" }}>✕</button>
              </div>
            ) : (
              <button
                onClick={() => { setEditGoal(activeId); setTempGoal(String(goal)); }}
                style={{
                  fontSize: "14px", fontWeight: 800, color: activeDhikr.color,
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "monospace",
                  textDecoration: "underline dotted",
                }}
                title="Click to change goal"
              >
                {goal}
              </button>
            )}
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
              ({pct}%)
            </span>
          </div>

          {/* Progress ring */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
            <div style={{ position: "relative", width: "100px", height: "100px" }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke={`${activeDhikr.color}20`} strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={activeDhikr.color} strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 263.9} 263.9`}
                  transform="rotate(-90 50 50)"
                  style={{ transition: "stroke-dasharray 0.4s ease" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column",
              }}>
                <span style={{ fontSize: "22px", fontWeight: 900, color: activeDhikr.color, lineHeight: 1 }}>
                  {pct}%
                </span>
                {completed && <span style={{ fontSize: "16px" }}>✅</span>}
              </div>
            </div>
          </div>

          {/* ── TAP BUTTON ── */}
          <button
            onClick={handleCount}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            style={{
              width: "180px", height: "180px", borderRadius: "50%",
              border: `3px solid ${activeDhikr.color}`,
              backgroundColor: completed ? activeDhikr.color : activeDhikr.lightBg,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "4px",
              boxShadow: `0 8px 32px ${activeDhikr.color}44`,
              transform: pulse ? "scale(0.96)" : "scale(1)",
              transition: "transform 0.15s, background-color 0.3s, box-shadow 0.3s",
              WebkitTapHighlightColor: "transparent",
              userSelect: "none",
            }}
          >
            <span style={{ fontSize: "36px", lineHeight: 1 }}>📿</span>
            <span style={{
              fontSize: "15px", fontWeight: 800,
              color: completed ? "white" : activeDhikr.color,
            }}>
              {completed ? "Completed! 🎉" : "TAP"}
            </span>
            <span style={{ fontSize: "11px", color: completed ? "rgba(255,255,255,0.7)" : activeDhikr.color + "99" }}>
              hold to undo
            </span>
          </button>

          <p style={{ marginTop: "16px", fontSize: "11px", color: "var(--color-text-subtle)" }}>
            {goal - count > 0 ? `${goal - count} more to reach your goal` : "Goal reached! Keep going 🌟"}
          </p>
        </div>
      </div>

      {/* ── Settings row ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          onClick={resetToday}
          style={{
            padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            border: "1px solid var(--color-border)",
            backgroundColor: "transparent", color: "var(--color-text-muted)",
          }}
        >
          🔄 Reset Today
        </button>
        <button
          onClick={() => setVibrate(p => !p)}
          style={{
            padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            border: `1px solid ${vibrate ? "rgba(90,158,143,0.4)" : "var(--color-border)"}`,
            backgroundColor: vibrate ? "rgba(90,158,143,0.08)" : "transparent",
            color: vibrate ? "#5a9e8f" : "var(--color-text-muted)",
          }}
        >
          {vibrate ? "📳 Vibrate On" : "🔕 Vibrate Off"}
        </button>
      </div>

      {/* ── Today's full summary ── */}
      <div style={{
        borderRadius: "16px", overflow: "hidden",
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-card-bg)",
        marginBottom: "20px",
      }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(196,137,46,0.04)" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--color-text)" }}>
            📊 Today's Progress
          </p>
        </div>
        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {DHIKRS.map(d => {
            const c   = counts[d.id] || 0;
            const g   = goals[d.id]  || d.defaultGoal;
            const p   = Math.min(100, Math.round((c / g) * 100));
            const done = c >= g;
            return (
              <div key={d.id} style={{ cursor: "pointer" }} onClick={() => setActiveId(d.id)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: done ? d.color : "var(--color-text)" }}>
                      {done ? "✅ " : ""}{d.transliteration}
                    </span>
                    <span style={{ fontFamily: "Amiri, serif", fontSize: "14px", color: d.color }}>
                      {d.arabic}
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: d.color, fontFamily: "monospace" }}>
                    {c} / {g}
                  </span>
                </div>
                <div style={{ height: "6px", borderRadius: "3px", backgroundColor: `${d.color}18`, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${p}%`, backgroundColor: d.color,
                    borderRadius: "3px", transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Streak calendar (last 14 days) ── */}
      <div style={{
        borderRadius: "16px", overflow: "hidden",
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-card-bg)",
      }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(196,137,46,0.04)" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--color-text)" }}>
            🔥 Streak Calendar — Last 14 Days
          </p>
        </div>
        <div style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {Array.from({ length: 14 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (13 - i));
              const key  = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
              const done = completedDays[key];
              const isToday = key === todayKey();
              const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
              const dayNum   = d.getDate();
              return (
                <div key={key} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                  flex: "1", minWidth: "36px",
                }}>
                  <span style={{ fontSize: "9px", fontWeight: 600, color: "var(--color-text-subtle)", textTransform: "uppercase" }}>
                    {dayLabel}
                  </span>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: isToday ? "2px solid #c4892e" : "1px solid var(--color-border)",
                    backgroundColor: done ? "#c4892e" : "var(--color-surface)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: done ? "14px" : "11px",
                    color: done ? "white" : "var(--color-text-subtle)",
                    fontWeight: 700,
                  }}>
                    {done ? "✓" : dayNum}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Streak stats */}
          <div style={{ display: "flex", gap: "16px", marginTop: "14px", flexWrap: "wrap" }}>
            {[
              { label: "Current Streak",  value: `${streak} days`,              icon: "🔥" },
              { label: "Days Completed",  value: Object.keys(completedDays).length, icon: "✅" },
              { label: "Today's Total",   value: `${totalToday} remembrances`,  icon: "📿" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>{s.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "var(--color-text)" }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: "10px", color: "var(--color-text-subtle)" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}