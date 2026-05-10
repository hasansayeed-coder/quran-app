export const metadata = {
  title: "Prayer Times — Al-Quran",
  description: "Daily prayer times based on your location",
};

import PrayerTimesClient from "@/components/PrayerTimesClient";

export default function PrayerTimesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <PrayerTimesClient />
    </div>
  );
}