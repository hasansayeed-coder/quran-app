export const metadata = {
  title: "My Notes — Al-Quran",
  description: "Your personal reflections on Quran ayahs",
};

import NotesClient from "@/components/NotesClient";

export default function NotesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <NotesClient />
    </div>
  );
}