const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const AUDIO_CDN = "https://cdn.islamic.network/quran/audio";
const AUDIO_BITRATE = 128;


// ─── Quran API base (alquran.cloud) ───────────────────────────────────────────
const BASE = "https://api.alquran.cloud/v1";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Upstream error: ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.status || "API error");
  return json.data;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/surahs — all 114 surahs metadata
app.get("/api/surahs", async (req, res) => {
  try {
    const data = await fetchJSON(`${BASE}/surah`);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/surah/:number — all ayahs of a surah with both translations
app.get("/api/surah/:number", async (req, res) => {
  const { number } = req.params;
  const n = parseInt(number);
  if (isNaN(n) || n < 1 || n > 114) {
    return res.status(400).json({ success: false, error: "Invalid surah number (1-114)" });
  }
  try {
    const [arabic, sahih, pickthall] = await Promise.all([
      fetchJSON(`${BASE}/surah/${n}/ar.alafasy`),
      fetchJSON(`${BASE}/surah/${n}/en.sahih`),
      fetchJSON(`${BASE}/surah/${n}/en.pickthall`),
    ]);

    const ayahs = arabic.ayahs.map((ayah, i) => ({
      number: ayah.numberInSurah,
      numberInQuran: ayah.number,
      arabic: ayah.text,
      sahih: sahih.ayahs[i]?.text || "",
      pickthall: pickthall.ayahs[i]?.text || "",
      juz: ayah.juz,
      page: ayah.page,
    }));

    res.json({
      success: true,
      data: {
        number: arabic.number,
        name: arabic.name,
        englishName: arabic.englishName,
        englishNameTranslation: arabic.englishNameTranslation,
        revelationType: arabic.revelationType,
        numberOfAyahs: arabic.numberOfAyahs,
        ayahs,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/search?q=...&translation=sahih|pickthall|both
app.get("/api/search", async (req, res) => {
  const { q, translation = "sahih" } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ success: false, error: "Query must be at least 2 characters" });
  }

  try {
    const edition =
      translation === "pickthall"
        ? "en.pickthall"
        : translation === "both"
        ? "en.sahih"
        : "en.sahih";

    const data = await fetchJSON(
      `${BASE}/search/${encodeURIComponent(q.trim())}/all/${edition}`
    );

    // If both translations requested, also fetch pickthall matches for same ayahs
    let results = data.matches || [];

    if (translation === "both") {
      const pickData = await fetchJSON(
        `${BASE}/search/${encodeURIComponent(q.trim())}/all/en.pickthall`
      );
      const pickMatches = pickData.matches || [];

      // Merge: combine by ayah number, avoid duplicates
      const seen = new Set(results.map((m) => m.number));
      for (const m of pickMatches) {
        if (!seen.has(m.number)) {
          results.push(m);
          seen.add(m.number);
        }
      }
    }

    const formatted = results.slice(0, 50).map((m) => ({
      surahNumber: m.surah.number,
      surahName: m.surah.name,
      surahEnglishName: m.surah.englishName,
      ayahNumber: m.numberInSurah,
      numberInQuran: m.number,
      text: m.text,
      edition: m.edition?.identifier || edition,
    }));

    res.json({ success: true, count: formatted.length, query: q, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Tafsir (spa5k/tafsir_api via jsDelivr CDN) ──────────────────────────────
const TAFSIR_CDN = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir";

// GET /api/tafsir/editions
app.get("/api/tafsir/editions", async (req, res) => {
  try {
    const data = await fetchJSON(`${TAFSIR_CDN}/editions.json`);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tafsir/:edition/:surah/:ayah
app.get("/api/tafsir/:edition/:surah/:ayah", async (req, res) => {
  const { edition, surah, ayah } = req.params;
  const s = parseInt(surah);
  const a = parseInt(ayah);

  if (isNaN(s) || s < 1 || s > 114)
    return res.status(400).json({ success: false, error: "Invalid surah number" });
  if (isNaN(a) || a < 1)
    return res.status(400).json({ success: false, error: "Invalid ayah number" });

  try {
    const url = `${TAFSIR_CDN}/${edition}/${s}/${a}.json`;
    const data = await fetchJSON(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: `Tafsir not found: ${err.message}` });
  }
});

// GET /api/audio/reciters
app.get("/api/audio/reciters", (req, res) => {
  const reciters = [
    { id: "ar.alafasy",            name: "Mishary Rashid Alafasy",    style: "Murattal" },
    { id: "ar.abdurrahmaansudais", name: "Abdul Rahman Al-Sudais",    style: "Murattal" },
    { id: "ar.ahmedajamy",         name: "Ahmed Al-Ajamy",            style: "Murattal" },
    { id: "ar.husary",             name: "Mahmoud Khalil Al-Husary",  style: "Murattal" },
    { id: "ar.minshawi",           name: "Mohamed Al-Minshawi",       style: "Murattal" },
    { id: "ar.muhammadayyoub",     name: "Muhammad Ayyoub",           style: "Murattal" },
    { id: "ar.shaatree",           name: "Abu Bakr Al-Shatri",        style: "Murattal" },
  ];
  res.json({ success: true, data: reciters });
});

// GET /api/audio/url/:reciter/:ayahNumber
app.get("/api/audio/url/:reciter/:ayahNumber", (req, res) => {
  const { reciter, ayahNumber } = req.params;
  const n = parseInt(ayahNumber);
  if (isNaN(n) || n < 1 || n > 6236)
    return res.status(400).json({ success: false, error: "Invalid ayah number (1-6236)" });

  const url = `${AUDIO_CDN}/${AUDIO_BITRATE}/${reciter}/${n}.mp3`;
  res.json({ success: true, data: { url, reciter, ayahNumber: n } });
});

// ─── Transliteration route ────────────────────────────────────────────────────
// Full transliteration dataset from risan/quran-json (Tanzil.net source)
const TRANS_URL = "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_transliteration.json";
 
// In-memory cache so we only fetch the full file once per server session
let transCache = null;
 
async function getTransliterationData() {
  if (transCache) return transCache;
  const res = await fetch(TRANS_URL);
  if (!res.ok) throw new Error(`Failed to fetch transliteration data: ${res.status}`);
  transCache = await res.json(); // array of 114 surah objects
  return transCache;
}

// GET /api/words/:surah/:ayah
app.get("/api/words/:surah/:ayah", async (req, res) => {
  const { surah, ayah } = req.params;
  try {
    const url = `https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?words=true&word_fields=text_uthmani,transliteration,translation`;
    const response = await fetch(url);
    const json = await response.json();

    if (!json.verse) throw new Error("Verse not found");

    const words = json.verse.words
      .filter(w => w.char_type_name === "word")
      .map(w => ({
        position:       w.position,
        arabic:         w.text_uthmani,
        transliteration: w.transliteration?.text || "",
        meaning:        w.translation?.text || "",
        grammar:        w.word_type || w.char_type_name || "",
      }));

    res.json({ success: true, data: words });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
 
// GET /api/transliteration/:surah
app.get("/api/transliteration/:surah", async (req, res) => {
  const { surah } = req.params;
  const n = parseInt(surah);
  if (isNaN(n) || n < 1 || n > 114)
    return res.status(400).json({ success: false, error: "Invalid surah number" });
 
  try {
    const allData = await getTransliterationData();
 
    // Array is 0-indexed, surah numbers are 1-indexed
    const surahData = allData[n - 1];
    if (!surahData) throw new Error("Surah not found");
 
    const ayahs = surahData.verses.map((v, i) => ({
      number: i + 1,
      transliteration: v.transliteration || "",
    }));
 
    res.json({ success: true, data: ayahs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🕌 Quran API running on port ${PORT}`);
});