import type { Metadata } from "next";
import ListingDirectory from "@/components/ListingDirectory";

export const metadata: Metadata = {
  title: "Youth Soccer Camps",
  description: "Day, residential and ID camps for youth soccer players — by region, type and focus, with reviews.",
};

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return <ListingDirectory kind="camp" searchParams={searchParams} />;
}
