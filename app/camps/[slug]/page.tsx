import type { Metadata } from "next";
import ListingProfile from "@/components/ListingProfile";
import { LISTINGS, getListingBySlug } from "@/lib/listings";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

export function generateStaticParams() {
  return LISTINGS.filter((l) => l.kind === "camp").map((l) => ({ slug: l.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const l = getListingBySlug("camp", params.slug);
  if (!l) return { title: "Not found" };
  return {
    title: `${l.name} — Soccer Camp`,
    description: `${l.name} in ${l.city}, FL. ${l.rating.toFixed(1)}★ from ${l.review_count} reviews.`,
    alternates: { canonical: `${SITE_URL}/camps/${l.slug}` },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ListingProfile kind="camp" slug={params.slug} />;
}
