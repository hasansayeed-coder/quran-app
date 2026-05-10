import { getSurah, getSurahs } from "@/lib/api";
import SurahView from "@/components/SurahView";
import Link from "next/link";

export async function generateStaticParams() {
  try {
    const surahs = await getSurahs();
    return surahs.map((s) => ({ number: String(s.number) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { number } = await params;
  try {
    const surah = await getSurah(number);
    return {
      title: `${surah.englishName} (${surah.name}) — Al-Quran`,
      description: `Read Surah ${surah.englishName}, ${surah.englishNameTranslation} — ${surah.numberOfAyahs} ayahs`,
    };
  } catch {
    return { title: "Surah — Al-Quran" };
  }
}

export default async function SurahPage({ params }) {
  const { number } = await params;
  let surah = null;
  let error = null;

  try {
    surah = await getSurah(number);
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#7a7460] mb-6">
        <Link href="/" className="hover:text-[#c4892e] transition-colors">
          All Surahs
        </Link>
        <span> › </span>
        <span className="text-[#1a1814]">{surah?.englishName || `Surah ${number}`}</span>
      </nav>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          Failed to load surah: {error}
        </div>
      )}

      {surah && <SurahView surah={surah} />}
    </div>
  );
}