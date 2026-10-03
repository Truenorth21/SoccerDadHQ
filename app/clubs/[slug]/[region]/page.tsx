import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StateClubsLanding } from "@/components/StateLanding";
import { ALL_REGIONS, regionBySlug } from "@/lib/regions";
import { seoCopy, seoMetadata } from "@/lib/seo";
import { hasClubs } from "@/lib/seoIndex";
import { stateByCode, stateBySlug } from "@/lib/states";

export const revalidate = 3600;

// /clubs/[state]/[region] — one page per predefined region (e.g. /clubs/texas/dfw).
// The parent [slug] segment is shared with club profiles, so the param keeps that name.
export async function generateStaticParams() {
  return ALL_REGIONS.map((r) => ({ slug: stateByCode(r.state)!.slug, region: r.slug }));
}

function resolve(params: { slug: string; region: string }) {
  const state = stateBySlug(params.slug);
  const region = state ? regionBySlug(state.code, params.region) : undefined;
  return state && region ? { state, region } : null;
}

export async function generateMetadata({ params }: { params: { slug: string; region: string } }): Promise<Metadata> {
  const found = resolve(params);
  if (!found) return { title: "Page not found" };
  return seoMetadata(seoCopy.clubsRegion(found.state, found.region), { index: await hasClubs(found.state, found.region) });
}

export default async function RegionClubsPage({ params }: { params: { slug: string; region: string } }) {
  const found = resolve(params);
  if (!found) notFound();
  return <StateClubsLanding state={found.state} region={found.region} />;
}
