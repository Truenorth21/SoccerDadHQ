import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RankingsView from "@/components/RankingsView";
import { seoCopy, seoMetadata } from "@/lib/seo";
import { hasRankings } from "@/lib/seoIndex";
import { stateBySlug } from "@/lib/states";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const params = await props.params;
  const state = stateBySlug(params.state);
  if (!state) return { title: "Page not found" };
  return seoMetadata(seoCopy.rankingsState(state), { index: await hasRankings(state) });
}

export default async function StateRankingsPage(props: { params: Promise<{ state: string }> }) {
  const params = await props.params;
  const state = stateBySlug(params.state);
  if (!state) notFound();
  return <RankingsView state={state} />;
}
