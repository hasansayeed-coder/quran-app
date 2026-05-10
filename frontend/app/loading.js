export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      {/* Hero skeleton */}
      <div className="text-center mb-12 space-y-3">
        <div className="h-10 w-72 bg-[#e2c27f]/30 rounded-lg mx-auto" />
        <div className="h-4 w-48 bg-[#e2c27f]/20 rounded mx-auto" />
        <div className="h-8 w-56 bg-[#e2c27f]/20 rounded-lg mx-auto mt-4" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-[#f7edd8]/60 border border-[#e2c27f]/20"
          />
        ))}
      </div>
    </div>
  );
}