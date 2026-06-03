import type { Metadata } from "next";
import ListingDirectory from "@/components/ListingDirectory";

export const metadata: Metadata = {
  title: "Florida Youth Soccer Tournaments",
  description: "Showcases, cups and college-recruiting tournaments across Florida — by region, format and level, with reviews.",
};

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return <ListingDirectory kind="tournament" searchParams={searchParams} />;
}
