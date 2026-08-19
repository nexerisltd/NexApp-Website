import type { Metadata, Viewport } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Toaster from "@/components/Toaster";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { FavoritesProvider } from "@/lib/favorites-context";

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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NexApp",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e17",
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
        className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-bg text-text min-h-screen`}
        suppressHydrationWarning
      >
        <FavoritesProvider>
          <Navbar />
          <div className="flex">
            <Sidebar />
            <div className="flex min-h-[calc(100vh-65px)] flex-1 flex-col">
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
          <Toaster />
          <ServiceWorkerRegister />
        </FavoritesProvider>
      </body>
    </html>
  );
}
