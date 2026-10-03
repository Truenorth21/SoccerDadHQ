import type { Metadata } from "next";
import ListingDirectory from "@/components/ListingDirectory";

export const metadata: Metadata = {
  alternates: { canonical: "/tournaments" },
  title: "Youth Soccer Tournaments & Showcases",
  description: "Showcases, cups and college-recruiting youth soccer tournaments — by region, format and level, with reviews.",
};

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return <ListingDirectory kind="tournament" searchParams={searchParams} />;
}
