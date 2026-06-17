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
    default: "SoccerDadHQ — Florida Youth Soccer Clubs, Coaches, Reviews & Rankings",
    template: "%s | SoccerDadHQ",
  },
  description:
    "The home base for Florida youth soccer parents. Browse club and coach directories, read and write reviews, follow community rankings, and get the latest ECNL, MLS NEXT and Girls Academy news.",
  keywords: [
    "Florida youth soccer",
    "ECNL Florida",
    "MLS NEXT",
    "Girls Academy",
    "soccer club reviews",
    "soccer coach reviews",
    "youth soccer tryouts Florida",
  ],
  openGraph: {
    type: "website",
    siteName: "SoccerDadHQ",
    title: "SoccerDadHQ — Florida Youth Soccer HQ",
    description:
      "Club & coach directories, reviews, rankings and news for Florida youth soccer families.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "SoccerDadHQ — Florida Youth Soccer HQ",
    description:
      "Club & coach directories, reviews, rankings and news for Florida youth soccer families.",
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
