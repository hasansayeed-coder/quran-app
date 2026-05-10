export const metadata = {
  title: "Memorization Mode — Al-Quran",
  description: "Practice Hifz with word-by-word reveal and ayah memorization",
};

import MemorizeClient from "../../components/MemorizeClient";

export default function MemorizePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <MemorizeClient />
    </div>
  );
}