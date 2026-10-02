import type { Metadata } from "next";
import { Suspense } from "react";
import { Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompareTray from "@/components/CompareTray";
import Analytics from "@/components/Analytics";
import Track from "@/components/Track";
import AdsProvider from "@/components/AdsProvider";
import { getAdsConfig } from "@/lib/adsServer";
import { getAdPlacementsMap } from "@/lib/adPlacements";
import { SITE_URL } from "@/lib/utils";

// Roboto for both headings and body — clean, non-condensed, easy on the eyes
// (matches SoccerWire). Drives both --font-barlow (headings) and --font-dmsans (body).
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SoccerDadHQ — Youth Soccer News, Tryouts & Club Discovery",
    template: "%s | SoccerDadHQ",
  },
  description:
    "The home base for youth soccer parents in all 50 states. Find clubs and tryouts near you, read and write club and coach reviews, follow community rankings, and get the latest ECNL, MLS NEXT and Girls Academy news.",
  keywords: [
    "youth soccer",
    "youth soccer clubs near me",
    "youth soccer tryouts",
    "ECNL",
    "MLS NEXT",
    "Girls Academy",
    "soccer club reviews",
    "soccer coach reviews",
    "youth soccer rankings",
  ],
  openGraph: {
    type: "website",
    siteName: "SoccerDadHQ",
    title: "SoccerDadHQ — Youth Soccer News, Tryouts & Club Discovery",
    description:
      "Club & coach directories, tryouts, reviews, rankings and news for youth soccer families nationwide.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "SoccerDadHQ — Youth Soccer News, Tryouts & Club Discovery",
    description:
      "Club & coach directories, tryouts, reviews, rankings and news for youth soccer families nationwide.",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [adsConfig, adPlacements] = await Promise.all([getAdsConfig(), getAdPlacementsMap()]);
  return (
    <html lang="en" className={roboto.variable}>
      <head>
        {/* Google AdSense loader — site-wide. */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9830230292354443"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <AdsProvider config={adsConfig} placements={adPlacements}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CompareTray />
        </AdsProvider>
        <Analytics />
        <Suspense fallback={null}>
          <Track />
        </Suspense>
      </body>
    </html>
  );
}
