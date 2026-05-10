export const metadata = {
  title: "Bookmarks — Al-Quran",
  description: "Your saved ayahs from the Holy Quran",
};

import BookmarksClient from "@/components/BookmarksClient";

export default function BookmarksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <BookmarksClient />
    </div>
  );
}