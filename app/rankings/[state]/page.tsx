import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RankingsView from "@/components/RankingsView";
import { seoCopy, seoMetadata } from "@/lib/seo";
import { stateBySlug } from "@/lib/states";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const state = stateBySlug(params.state);
  if (!state) return { title: "Page not found" };
  return seoMetadata(seoCopy.rankingsState(state));
}

export default function StateRankingsPage({ params }: { params: { state: string } }) {
  const state = stateBySlug(params.state);
  if (!state) notFound();
  return <RankingsView state={state} />;
}
