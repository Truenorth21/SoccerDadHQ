import type { Metadata } from "next";
import ListingDirectory from "@/components/ListingDirectory";

export const metadata: Metadata = {
  title: "Florida Youth Soccer Camps",
  description: "Day, residential and ID camps across Florida — by region, type and focus, with reviews.",
};

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return <ListingDirectory kind="camp" searchParams={searchParams} />;
}
