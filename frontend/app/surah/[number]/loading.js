export default function SurahLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-40 bg-[#e2c27f]/20 rounded mb-6" />

      {/* Surah header skeleton */}
      <div className="text-center py-8 rounded-2xl border border-[#e2c27f]/20 bg-[#f7edd8]/30 mb-8 space-y-3">
        <div className="h-3 w-48 bg-[#e2c27f]/20 rounded mx-auto" />
        <div className="h-8 w-56 bg-[#e2c27f]/30 rounded-lg mx-auto" />
        <div className="h-4 w-36 bg-[#e2c27f]/20 rounded mx-auto" />
        <div className="h-10 w-64 bg-[#e2c27f]/20 rounded-lg mx-auto mt-2" />
      </div>

      {/* Ayah cards */}
      <div className="space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#e2c27f]/20 bg-white/40 overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-[#e2c27f]/10 bg-[#f7edd8]/20">
              <div className="h-3 w-24 bg-[#e2c27f]/20 rounded" />
            </div>
            <div className="px-5 py-5 space-y-3">
              <div className="h-8 bg-[#e2c27f]/10 rounded w-full" />
              <div className="h-8 bg-[#e2c27f]/10 rounded w-4/5 ml-auto" />
              <div className="pt-3 border-t border-[#e2c27f]/10 space-y-2">
                <div className="h-3 bg-[#e2c27f]/10 rounded w-full" />
                <div className="h-3 bg-[#e2c27f]/10 rounded w-5/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}