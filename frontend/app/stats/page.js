export const metadata = {
  title: "Quran Statistics — Al-Quran",
  description: "Fascinating facts, numbers and insights about the Holy Quran",
};

import StatsClient from "../../components/StatsClient";

export default function StatsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <StatsClient />
    </div>
  );
}