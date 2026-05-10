import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
      {/* Arabic calligraphy-style 404 */}
      <p
        className="text-6xl text-[#c4892e]/30 mb-6 select-none"
        style={{ fontFamily: "Amiri, serif" }}
      >
        ٤٠٤
      </p>

      <h1 className="font-display text-3xl font-medium text-[#1a1814] mb-2">
        Page Not Found
      </h1>
      <p className="text-[#7a7460] text-sm mb-2">
        The page you are looking for does not exist.
      </p>
      <p
        className="text-xl text-[#c4892e] mb-8"
        style={{ fontFamily: "Amiri, serif" }}
      >
        وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ
      </p>
      <p className="text-xs text-[#b4ae97] mb-10 italic">
        "And whoever relies upon Allah — then He is sufficient for him." (65:3)
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c4892e] text-[#fdf8f0] text-sm font-medium hover:bg-[#a86d22] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 3L5 8l5 5" />
        </svg>
        Back to Surahs
      </Link>
    </div>
  );
}