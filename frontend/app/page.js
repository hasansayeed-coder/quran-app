import { getSurahs } from "../lib/api";
import AyahOfTheDay from "@/components/AyahOfTheDay";
import JuzNavigator from "@/components/JuzNavigator";
import MoodAyah from "@/components/MoodAyah";
import ReadingProgressBar from "../components/ReadingProgressBar";

export const revalidate = 86400;

export default async function HomePage() {
  let surahs = [];
  let error = null;

  try {
    surahs = await getSurahs();
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <p className="font-amiri text-4xl sm:text-5xl text-[#c4892e] mb-3" style={{ fontFamily: "Amiri, serif" }}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <p className="text-[#7a7460] text-sm font-body italic">
          In the name of Allah, the Most Gracious, the Most Merciful
        </p>
        <div className="flex items-center justify-center mt-4 text-[#e2c27f]">
          <span className="h-px w-16 bg-[#e2c27f]/60 block" />
          <span className="mx-3 text-[#c4892e]">✦</span>
          <span className="h-px w-16 bg-[#e2c27f]/60 block" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#1a1814] mt-4">
          The Noble Quran
        </h1>
        <p className="text-[#7a7460] mt-1 text-sm">
          114 Surahs · Arabic text with English translations
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          Could not connect to API: {error}. Make sure the backend is running.
        </div>
      )}

      {/* Reading Progress */}
      <ReadingProgressBar />

      {/* Ayah of the Day */}
      <AyahOfTheDay />

      {/* Mood-based Ayah */}
      <MoodAyah />

      {/* Surah Grid with Juz Navigation */}
      {surahs.length > 0 && <JuzNavigator surahs={surahs} />}

      {/* Placeholder skeleton if loading */}
      {!error && surahs.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-[#f7edd8]/60 animate-pulse border border-[#e2c27f]/20"
            />
          ))}
        </div>
      )}
    </div>
  );
}