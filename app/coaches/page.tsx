import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import CoachFilters from "@/components/CoachFilters";
import CoachCard from "@/components/CoachCard";
import ActiveFilters from "@/components/ActiveFilters";
import AddListingCTA from "@/components/AddListingCTA";
import AdSlot from "@/components/AdSlot";
import { getCoaches, loadCoaches, type CoachFilters as Filters } from "@/lib/data";
import { regionName } from "@/lib/regions";
import { stateName } from "@/lib/states";

export const metadata: Metadata = {
  title: "Youth Soccer Coach Directory — All 50 States",
  description:
    "Find and review youth soccer coaches and private trainers nationwide. Filter by state, region, age group, gender and private-training availability.",
  alternates: { canonical: "/coaches" },
};

export default async function CoachesPage(
  props: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }
) {
  const searchParams = await props.searchParams;
  const filters: Filters = Object.fromEntries(
    Object.entries(searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v ?? ""])
  );
  const coaches = await getCoaches(filters);
  const hasRatings = (await loadCoaches()).some((c) => c.rating > 0);

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              {filters.region
                ? `${regionName(filters.region)} Coaches`
                : filters.state
                  ? `${stateName(filters.state)} Soccer Coaches`
                  : "Youth Soccer Coaches"}
            </h1>
            <p className="mt-1 text-slate-300">
              {coaches.length} coaches · directors, head coaches and private trainers, reviewed by parents
            </p>
          </div>
          <Link href="/submit?kind=coach" className="btn-amber shrink-0 whitespace-nowrap">+ Add a coach</Link>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="mb-6">
          <AdSlot placement="directory-sidebar" variant="leaderboard" seed={2} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Suspense fallback={<div className="card h-72 animate-pulse" />}>
              <CoachFilters hasRatings={hasRatings} />
            </Suspense>
            <div className="mt-6 hidden lg:block">
              <AdSlot placement="directory-sidebar" seed={9} />
            </div>
          </aside>
          <div>
            <Suspense fallback={null}>
              <ActiveFilters basePath="/coaches" />
            </Suspense>
            {coaches.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="font-heading text-xl font-bold text-navy">No coaches match your filters</p>
                <p className="mt-1 text-slate-500">Try clearing some filters.</p>
                <div className="mt-6 text-left">
                  <AddListingCTA kind="coach" />
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {coaches.map((coach) => (
                    <CoachCard key={coach.id} coach={coach} />
                  ))}
                </div>
                <AddListingCTA kind="coach" className="mt-8" />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
