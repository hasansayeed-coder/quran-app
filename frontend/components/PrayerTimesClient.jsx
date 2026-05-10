"use client";

import { useState, useEffect, useCallback } from "react";

const PRAYERS = [
  { key: "Fajr",    label: "Fajr",    arabic: "الفجر",   icon: "🌙", desc: "Pre-dawn prayer" },
  { key: "Sunrise", label: "Sunrise", arabic: "الشروق",  icon: "🌅", desc: "Sun rises", isEvent: true },
  { key: "Dhuhr",   label: "Dhuhr",   arabic: "الظهر",   icon: "☀️", desc: "Midday prayer" },
  { key: "Asr",     label: "Asr",     arabic: "العصر",   icon: "🌤", desc: "Afternoon prayer" },
  { key: "Maghrib", label: "Maghrib", arabic: "المغرب",  icon: "🌇", desc: "Sunset prayer" },
  { key: "Isha",    label: "Isha",    arabic: "العشاء",  icon: "🌙", desc: "Night prayer" },
];

const METHODS = [
  { id: 2,  label: "ISNA (North America)" },
  { id: 1,  label: "Muslim World League" },
  { id: 3,  label: "Egyptian Authority" },
  { id: 4,  label: "Umm Al-Qura (Makkah)" },
  { id: 5,  label: "University of Islamic Sciences, Karachi" },
  { id: 16, label: "Diyanet (Turkey)" },
  { id: 8,  label: "Gulf Region" },
  { id: 15, label: "Kuwait" },
];

function to12Hour(time24) {
  if (!time24) return "—";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function toMinutes(time24) {
  if (!time24) return 0;
  const [h, m] = time24.split(":").map(Number);
  return h * 60 + m;
}

function getNextPrayer(times) {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  for (const p of PRAYERS) {
    if (p.isEvent) continue;
    const pMins = toMinutes(times[p.key]);
    if (pMins > currentMins) return { ...p, time: times[p.key], minsLeft: pMins - currentMins };
  }
  const fajrMins = toMinutes(times["Fajr"]);
  const minsLeft = (24 * 60 - currentMins) + fajrMins;
  return { ...PRAYERS[0], time: times["Fajr"], minsLeft };
}

function formatCountdown(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} minutes`;
}

export default function PrayerTimesClient() {
  const [mounted, setMounted]       = useState(false);
  const [times, setTimes]           = useState(null);
  const [meta, setMeta]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [method, setMethod]         = useState(2);
  const [cityInput, setCityInput]   = useState("");
  const [cityQuery, setCityQuery]   = useState("");
  const [useGeo, setUseGeo]         = useState(false);
  const [now, setNow]               = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState(null);

  // ── All hooks first, before any early return ──

  const fetchByCoords = useCallback(async (lat, lon, meth) => {
    setLoading(true); setError(null);
    try {
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=${meth}`;
      const res  = await fetch(url);
      const json = await res.json();
      if (json.code !== 200) throw new Error(json.status || "API error");
      setTimes(json.data.timings);
      setMeta({
        city:    json.data.meta.timezone || "Your Location",
        country: "",
        date:    json.data.date.readable,
        hijri:   `${json.data.date.hijri.day} ${json.data.date.hijri.month.en} ${json.data.date.hijri.year} AH`,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByCity = useCallback(async (city, meth) => {
    setLoading(true); setError(null);
    try {
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=&method=${meth}`;
      const res  = await fetch(url);
      const json = await res.json();
      if (json.code !== 200) throw new Error("City not found. Try another name.");
      setTimes(json.data.timings);
      setMeta({
        city:    json.data.meta.timezone || city,
        country: "",
        date:    json.data.date.readable,
        hijri:   `${json.data.date.hijri.day} ${json.data.date.hijri.month.en} ${json.data.date.hijri.year} AH`,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mount guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tick clock every minute
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Update next prayer when times or clock changes
  useEffect(() => {
    if (times) setNextPrayer(getNextPrayer(times));
  }, [times, now]);

  // Auto-detect location on mount
  useEffect(() => {
    if (!mounted) return;
    if (navigator.geolocation) {
      setUseGeo(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude, method),
        ()    => { setUseGeo(false); setError("Location access denied. Please search by city below."); }
      );
    } else {
      setError("Geolocation not supported. Please search by city.");
    }
  }, [mounted]);

  // ── Early return AFTER all hooks ──
  if (!mounted) return null;

  function handleCitySearch(e) {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setCityQuery(cityInput.trim());
    fetchByCity(cityInput.trim(), method);
  }

  function handleMethodChange(newMethod) {
    setMethod(newMethod);
    if (useGeo) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude, newMethod),
        ()  => {}
      );
    } else if (cityQuery) {
      fetchByCity(cityQuery, newMethod);
    }
  }

  const currentMins = now.getHours() * 60 + now.getMinutes();
  const timeString  = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateString  = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  function isCurrentPrayer(pKey) {
    if (!times) return false;
    const prayerKeys = PRAYERS.filter(p => !p.isEvent).map(p => p.key);
    const idx = prayerKeys.indexOf(pKey);
    if (idx === -1) return false;
    const start = toMinutes(times[pKey]);
    const nextKey = prayerKeys[idx + 1];
    const end = nextKey ? toMinutes(times[nextKey]) : 24 * 60;
    return currentMins >= start && currentMins < end;
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 500, color: "var(--color-text)", margin: "0 0 4px" }}>
          🕌 Prayer Times
        </h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
          Daily salah times based on your location
        </p>
      </div>

      {/* City search */}
      <form onSubmit={handleCitySearch} style={{ marginBottom: "20px" }}>
        <div style={{
          display: "flex", gap: "8px", padding: "10px 14px",
          borderRadius: "12px", border: "1.5px solid var(--color-border)",
          backgroundColor: "var(--color-card-bg)", alignItems: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            placeholder="Search by city… e.g. Dhaka, London, Dubai"
            style={{
              flex: 1, background: "transparent", border: "none",
              outline: "none", fontSize: "13px", color: "var(--color-text)",
              fontFamily: "inherit",
            }}
          />
          <button type="submit" style={{
            padding: "6px 14px", borderRadius: "8px", fontSize: "12px",
            fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            border: "none", backgroundColor: "#c4892e", color: "white",
          }}>
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setUseGeo(true);
              navigator.geolocation.getCurrentPosition(
                pos => { setCityInput(""); fetchByCoords(pos.coords.latitude, pos.coords.longitude, method); },
                ()  => setError("Location access denied.")
              );
            }}
            title="Use my location"
            style={{
              padding: "6px 10px", borderRadius: "8px", fontSize: "12px",
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              border: "1px solid var(--color-border)",
              backgroundColor: "transparent", color: "var(--color-text-muted)",
            }}
          >
            📍
          </button>
        </div>
      </form>

      {/* Calculation method */}
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-muted)", margin: "0 0 8px" }}>
          Calculation Method
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {METHODS.map(m => (
            <button key={m.id} onClick={() => handleMethodChange(m.id)} style={{
              padding: "5px 12px", borderRadius: "50px", fontSize: "11px", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${method === m.id ? "#c4892e" : "var(--color-border)"}`,
              backgroundColor: method === m.id ? "#c4892e" : "transparent",
              color: method === m.id ? "white" : "var(--color-text-muted)",
            }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "14px 16px", borderRadius: "12px", marginBottom: "20px",
          border: "1px solid rgba(239,68,68,0.3)",
          backgroundColor: "rgba(239,68,68,0.06)",
          fontSize: "13px", color: "#ef4444",
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "32px", justifyContent: "center" }}>
          <div style={{
            width: "20px", height: "20px",
            border: "2px solid rgba(196,137,46,0.2)",
            borderTopColor: "#c4892e", borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <span style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>Fetching prayer times…</span>
        </div>
      )}

      {/* Main content */}
      {times && !loading && (
        <>
          {/* Location + date header */}
          <div style={{
            padding: "18px 20px", borderRadius: "16px", marginBottom: "20px",
            background: "linear-gradient(135deg, rgba(196,137,46,0.1), rgba(196,137,46,0.04))",
            border: "1px solid rgba(196,137,46,0.25)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
          }}>
            <div>
              <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--color-text)" }}>
                📍 {meta?.city}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--color-text-muted)" }}>{meta?.date}</p>
              {meta?.hijri && (
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#c4892e", fontFamily: "Amiri, serif" }}>
                  {meta.hijri}
                </p>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: "var(--color-text)", fontFamily: "monospace" }}>
                {timeString}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--color-text-muted)" }}>{dateString}</p>
            </div>
          </div>

          {/* Next prayer countdown */}
          {nextPrayer && (
            <div style={{
              padding: "16px 20px", borderRadius: "14px", marginBottom: "20px",
              background: "linear-gradient(135deg, rgba(124,111,160,0.12), rgba(124,111,160,0.06))",
              border: "1px solid rgba(124,111,160,0.3)",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "28px" }}>{nextPrayer.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#7c6fa0" }}>
                    Next Prayer
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 700, color: "var(--color-text)" }}>
                    {nextPrayer.label}
                    <span style={{ fontFamily: "Amiri, serif", fontSize: "18px", marginLeft: "10px", color: "#c4892e" }}>
                      {nextPrayer.arabic}
                    </span>
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--color-text-muted)" }}>
                    at {to12Hour(nextPrayer.time)}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "11px", color: "#7c6fa0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>In</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#7c6fa0" }}>
                  {formatCountdown(nextPrayer.minsLeft)}
                </p>
              </div>
            </div>
          )}

          {/* Prayer times list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {PRAYERS.map(prayer => {
              const time      = times[prayer.key];
              const isCurrent = !prayer.isEvent && isCurrentPrayer(prayer.key);
              const isNext    = nextPrayer?.key === prayer.key;
              const passed    = !prayer.isEvent && toMinutes(time) < currentMins && !isCurrent;

              return (
                <div key={prayer.key} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 20px", borderRadius: "14px",
                  border: `1.5px solid ${isCurrent ? "rgba(196,137,46,0.5)" : isNext ? "rgba(124,111,160,0.4)" : "var(--color-border)"}`,
                  backgroundColor: isCurrent ? "rgba(196,137,46,0.08)" : isNext ? "rgba(124,111,160,0.06)" : "var(--color-card-bg)",
                  opacity: passed ? 0.5 : 1,
                  transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span style={{ fontSize: "22px", width: "28px", textAlign: "center" }}>{prayer.icon}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--color-text)" }}>{prayer.label}</p>
                        <span style={{ fontFamily: "Amiri, serif", fontSize: "16px", color: "#c4892e" }}>{prayer.arabic}</span>
                        {isCurrent && (
                          <span style={{ padding: "1px 8px", borderRadius: "50px", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", backgroundColor: "#c4892e", color: "white" }}>
                            Current
                          </span>
                        )}
                        {isNext && !isCurrent && (
                          <span style={{ padding: "1px 8px", borderRadius: "50px", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", backgroundColor: "rgba(124,111,160,0.2)", color: "#7c6fa0" }}>
                            Next
                          </span>
                        )}
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--color-text-subtle)" }}>{prayer.desc}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, fontFamily: "monospace", color: isCurrent ? "#c4892e" : isNext ? "#7c6fa0" : "var(--color-text)" }}>
                      {to12Hour(time)}
                    </p>
                    {passed && <p style={{ margin: "1px 0 0", fontSize: "10px", color: "var(--color-text-subtle)" }}>Passed</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <p style={{ marginTop: "20px", fontSize: "11px", color: "var(--color-text-subtle)", textAlign: "center" }}>
            Times provided by{" "}
            <a href="https://aladhan.com" target="_blank" rel="noopener noreferrer" style={{ color: "#c4892e" }}>AlAdhan.com</a>
            {" "}· {METHODS.find(m => m.id === method)?.label}
          </p>
        </>
      )}

      {/* Initial empty state */}
      {!times && !loading && !error && (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--color-text-subtle)" }}>
          <p style={{ fontSize: "48px", margin: "0 0 12px" }}>🕌</p>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 8px" }}>Getting your location…</p>
          <p style={{ fontSize: "13px", margin: 0 }}>Or search by city name above</p>
        </div>
      )}
    </div>
  );
}