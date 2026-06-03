import { Suspense } from "react";
import type { Metadata } from "next";
import ClubFilters from "@/components/ClubFilters";
import ClubCard from "@/components/ClubCard";
import ActiveFilters from "@/components/ActiveFilters";
import AdSlot from "@/components/AdSlot";
import { getClubs, type ClubFilters as Filters } from "@/lib/data";
import { regionName } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Florida Youth Soccer Club Directory",
  description:
    "Search and compare youth soccer clubs across Florida by region, league, age group, gender and location. Read parent reviews and find open tryouts.",
};

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters: Filters = Object.fromEntries(
    Object.entries(searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v ?? ""])
  );
  const clubs = await getClubs(filters);

  const heading = filters.region
    ? `${regionName(filters.region)} Clubs`
    : "Florida Youth Soccer Clubs";

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">{heading}</h1>
          <p className="mt-1 text-slate-300">
            {clubs.length} club{clubs.length === 1 ? "" : "s"} · search, filter and compare programs across the state
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="mb-6">
          <AdSlot placement="directory-sidebar" variant="leaderboard" seed={2} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Suspense fallback={<div className="card h-96 animate-pulse" />}>
              <ClubFilters />
            </Suspense>
            <div className="mt-6 hidden lg:block">
              <AdSlot placement="directory-sidebar" seed={5} />
            </div>
          </aside>

          <div>
            <Suspense fallback={null}>
              <ActiveFilters basePath="/clubs" />
            </Suspense>
            {clubs.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="font-heading text-xl font-bold text-navy">No clubs match your filters</p>
                <p className="mt-1 text-slate-500">Try widening your search radius or clearing some filters.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {clubs.map((club) => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
