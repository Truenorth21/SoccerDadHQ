import type { Metadata } from "next";
import ListingDirectory from "@/components/ListingDirectory";

export const metadata: Metadata = {
  title: "Florida Soccer Facilities & Fields",
  description: "Soccer complexes, fields and indoor venues across Florida — by region, surface and type, with reviews.",
};

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return <ListingDirectory kind="facility" searchParams={searchParams} />;
}
