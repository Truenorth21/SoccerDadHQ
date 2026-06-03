import type { Metadata } from "next";
import ListingDirectory from "@/components/ListingDirectory";

export const metadata: Metadata = {
  title: "Florida Soccer Training Centers",
  description: "Private and small-group soccer training academies across Florida — by region, focus and format, with reviews.",
};

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return <ListingDirectory kind="training-center" searchParams={searchParams} />;
}
