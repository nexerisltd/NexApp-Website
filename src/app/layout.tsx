import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Toaster from "@/components/Toaster";

const sora = Sora({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "NexApp — Your app store, everywhere",
  description:
    "NexApp is a web-based app store from NexAuras, with mobile and desktop apps on the way. Discover, publish and download apps in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // Runs before paint so the page never flashes the wrong theme.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var stored = localStorage.getItem('nexapp-theme');
              var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
              document.documentElement.setAttribute('data-theme', theme);
            }catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-bg text-text min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
