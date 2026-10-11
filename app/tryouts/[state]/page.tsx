import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TryoutsView from "@/components/TryoutsView";
import { seoCopy, seoMetadata } from "@/lib/seo";
import { hasTryouts } from "@/lib/seoIndex";
import { US_STATES, stateBySlug } from "@/lib/states";

export const revalidate = 1800;

export async function generateStaticParams() {
  return US_STATES.map((s) => ({ state: s.slug }));
}

export async function generateMetadata(props: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const params = await props.params;
  const state = stateBySlug(params.state);
  if (!state) return { title: "Page not found" };
  return seoMetadata(seoCopy.tryoutsState(state), { index: await hasTryouts(state) });
}

export default async function StateTryoutsPage(props: { params: Promise<{ state: string }> }) {
  const params = await props.params;
  const state = stateBySlug(params.state);
  if (!state) notFound();
  return <TryoutsView state={state} />;
}
