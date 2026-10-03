import type { Metadata } from "next";
import ListingDirectory from "@/components/ListingDirectory";

export const metadata: Metadata = {
  alternates: { canonical: "/facilities" },
  title: "Youth Soccer Facilities & Fields",
  description: "Soccer complexes, fields and indoor venues for youth soccer — by region, surface and type, with reviews.",
};

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return <ListingDirectory kind="facility" searchParams={searchParams} />;
}
