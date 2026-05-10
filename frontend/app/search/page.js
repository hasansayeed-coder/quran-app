export const metadata = {
  title: "Search Ayahs — Al-Quran",
  description: "Search the Holy Quran by translation text",
};

import SearchClient from "@/components/SearchClient";

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium text-[#1a1814] mb-1">
          Search the Quran
        </h1>
        <p className="text-sm text-[#7a7460]">
          Search by keyword in English translations
        </p>
      </div>
      <SearchClient />
    </div>
  );
}