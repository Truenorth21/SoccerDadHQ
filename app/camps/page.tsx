import type { Metadata } from "next";
import ListingDirectory from "@/components/ListingDirectory";

export const metadata: Metadata = {
  alternates: { canonical: "/camps" },
  title: "Youth Soccer Camps",
  description: "Day, residential and ID camps for youth soccer players — by region, type and focus, with reviews.",
};

export default async function Page(
  props: { searchParams: Promise<Record<string, string | string[] | undefined>> }
) {
  const searchParams = await props.searchParams;
  return <ListingDirectory kind="camp" searchParams={searchParams} />;
}
