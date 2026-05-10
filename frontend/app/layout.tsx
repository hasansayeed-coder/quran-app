import "./globals.css";
import { SettingsProvider } from "@/components/context/SettingsContext";
import {BookmarksProvider } from "@/components/context/BookmarksContext";
import { AudioProvider } from "@/components/AudioPlayer";
import Navbar from "../components/Navbar.js"
import Footer from "../components/Footer.js" ;
import SettingsSidebar from '../components/SettingsSidebar'
import { ReadingProgressProvider } from "../components/context/ReadingProgressContext"; 
import { NotesProvider } from "../components/context/NotesContext";



export const metadata = {
  title: "Al-Quran — The Noble Quran",
  description: "Read and explore the Holy Quran with Arabic text and English translations",
  icons: { icon: "/favicon.ico" },
};

const AUDIO_CDN = "https://cdn.islamic.network/quran/audio";
const AUDIO_BITRATE = 128;


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider>
          <BookmarksProvider>
              <ReadingProgressProvider>
                <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <NotesProvider>
                    <AudioProvider>
                    <SettingsSidebar />
                      {children}
                    </AudioProvider>
                  </NotesProvider>
                  
                  </main>
                  <Footer />
                </div>
              </ReadingProgressProvider>
          </BookmarksProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
 