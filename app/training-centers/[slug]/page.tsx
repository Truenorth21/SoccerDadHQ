import type { Metadata } from "next";
import ListingProfile from "@/components/ListingProfile";
import { loadListings, getListingBySlug } from "@/lib/listings";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await loadListings()).filter((l) => l.kind === "training-center").map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const l = await getListingBySlug("training-center", params.slug);
  if (!l) return { title: "Not found" };
  return {
    title: `${l.name} — Training Center`,
    description: `${l.name} in ${l.city}, FL.${l.review_count > 0 ? ` ${l.rating.toFixed(1)}★ from ${l.review_count} reviews.` : ""}`,
    alternates: { canonical: `${SITE_URL}/training-centers/${l.slug}` },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ListingProfile kind="training-center" slug={params.slug} />;
}
