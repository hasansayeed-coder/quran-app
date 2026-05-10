export default function Footer() {
  return (
    <footer className="border-t border-[#e2c27f]/30 bg-[#f7edd8]/40 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="font-display text-sm text-[#1a1814]">Al-Quran</p>
          <p className="text-xs text-[#7a7460] mt-0.5">
            Arabic text & translations via{" "}
            <a
              href="https://alquran.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#c4892e] transition-colors"
            >
              alquran.cloud
            </a>
          </p>
        </div>

        <div className="flex items-center gap-1 text-[#e2c27f]">
          <span className="h-px w-8 bg-[#e2c27f]/60 block" />
          <span className="text-[#c4892e] text-base px-2">☽</span>
          <span className="h-px w-8 bg-[#e2c27f]/60 block" />
        </div>

        <p className="text-xs text-[#7a7460] text-center sm:text-right">
          Translations: Sahih International & Pickthall
          <br />
        </p>
      </div>
    </footer>
  );
}