import type { Metadata } from "next";
import ListingDirectory from "@/components/ListingDirectory";

export const metadata: Metadata = {
  alternates: { canonical: "/facilities" },
  title: "Youth Soccer Facilities & Fields",
  description: "Soccer complexes, fields and indoor venues for youth soccer — by region, surface and type, with reviews.",
};

export default async function Page(
  props: { searchParams: Promise<Record<string, string | string[] | undefined>> }
) {
  const searchParams = await props.searchParams;
  return <ListingDirectory kind="facility" searchParams={searchParams} />;
}
