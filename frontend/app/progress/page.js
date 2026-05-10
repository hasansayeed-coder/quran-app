export const metadata = {
  title: "Reading Progress — Al-Quran",
  description: "Track your Quran reading journey",
};

import { getSurahs } from "@/lib/api";
import ProgressClient from "../../components/ProgressClient";

export default async function ProgressPage() {
  let surahs = [];
  try {
    surahs = await getSurahs();
  } catch {}

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <ProgressClient surahs={surahs} />
    </div>
  );
}