import type { Metadata } from "next";
import ListingDirectory from "@/components/ListingDirectory";

export const metadata: Metadata = {
  alternates: { canonical: "/training-centers" },
  title: "Youth Soccer Training Centers",
  description: "Private and small-group youth soccer training academies — by region, focus and format, with reviews.",
};

export default async function Page(
  props: { searchParams: Promise<Record<string, string | string[] | undefined>> }
) {
  const searchParams = await props.searchParams;
  return <ListingDirectory kind="training-center" searchParams={searchParams} />;
}
