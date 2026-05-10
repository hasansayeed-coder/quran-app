export const metadata = {
  title: "Compare Surahs — Al-Quran",
  description: "Compare two surahs side by side — themes, lengths, revelation type and key topics",
};

import CompareClient from "@/components/CompareClient";

export default function ComparePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <CompareClient />
    </div>
  );
}