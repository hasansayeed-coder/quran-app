const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getSurahs() {
  const res = await fetch(`${API_BASE}/api/surahs`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Failed to fetch surahs");
  const json = await res.json();
  return json.data;
}

export async function getSurah(number) {
  const res = await fetch(`${API_BASE}/api/surah/${number}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Failed to fetch surah ${number}`);
  const json = await res.json();
  return json.data;
}

export async function searchAyahs(q, translation = "both") {
  const res = await fetch(
    `${API_BASE}/api/search?q=${encodeURIComponent(q)}&translation=${translation}`
  );
  if (!res.ok) throw new Error("Search failed");
  const json = await res.json();
  return json.data;
}