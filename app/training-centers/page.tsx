import type { Metadata } from "next";
import ListingDirectory from "@/components/ListingDirectory";

export const metadata: Metadata = {
  title: "Youth Soccer Training Centers",
  description: "Private and small-group youth soccer training academies — by region, focus and format, with reviews.",
};

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return <ListingDirectory kind="training-center" searchParams={searchParams} />;
}
