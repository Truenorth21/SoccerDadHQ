import type { Metadata } from "next";
import ListingDirectory from "@/components/ListingDirectory";

export const metadata: Metadata = {
  alternates: { canonical: "/tournaments" },
  title: "Youth Soccer Tournaments & Showcases",
  description: "Showcases, cups and college-recruiting youth soccer tournaments — by region, format and level, with reviews.",
};

export default async function Page(
  props: { searchParams: Promise<Record<string, string | string[] | undefined>> }
) {
  const searchParams = await props.searchParams;
  return <ListingDirectory kind="tournament" searchParams={searchParams} />;
}
