import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SampleDataBanner from "@/components/SampleDataBanner";
import CompareTray from "@/components/CompareTray";
import Analytics from "@/components/Analytics";
import AdsProvider from "@/components/AdsProvider";
import { getAdsConfig } from "@/lib/adsServer";
import { SITE_URL } from "@/lib/utils";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dmsans",
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
  const adsConfig = await getAdsConfig();
  return (
    <html lang="en" className={`${barlow.variable} ${dmSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <AdsProvider config={adsConfig}>
          <SampleDataBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CompareTray />
        </AdsProvider>
        <Analytics />
      </body>
    </html>
  );
}
