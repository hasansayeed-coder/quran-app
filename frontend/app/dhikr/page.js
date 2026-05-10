export const metadata = {
  title: "Daily Dhikr Counter — Al-Quran",
  description: "Count your daily dhikr — SubhanAllah, Alhamdulillah, AllahuAkbar with streak tracking",
};

import DhikrClient from "../../components/Dhikrclient";

export default function DhikrPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <DhikrClient />
    </div>
  );
}