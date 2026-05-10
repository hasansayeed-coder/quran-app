"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SurahError({ error, reset }) {
  useEffect(() => {
    console.error("Surah page error:", error);
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
      <p className="text-5xl mb-4">📖</p>
      <h2 className="font-display text-2xl font-medium text-[#1a1814] mb-2">
        Could not load this Surah
      </h2>
      <p className="text-sm text-[#7a7460] mb-8 max-w-sm mx-auto">
        {error?.message || "Something went wrong. The API may be unavailable."}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-[#c4892e] text-[#fdf8f0] text-sm font-medium hover:bg-[#a86d22] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-[#e2c27f] text-[#7a7460] text-sm hover:border-[#c4892e] hover:text-[#1a1814] transition-colors"
        >
          Back to Surahs
        </Link>
      </div>
    </div>
  );
}