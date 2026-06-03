import { Suspense } from "react";
import type { Metadata } from "next";
import CoachFilters from "@/components/CoachFilters";
import CoachCard from "@/components/CoachCard";
import ActiveFilters from "@/components/ActiveFilters";
import AdSlot from "@/components/AdSlot";
import { getCoaches, type CoachFilters as Filters } from "@/lib/data";

export const metadata: Metadata = {
  title: "Florida Youth Soccer Coach Directory",
  description:
    "Find and review youth soccer coaches and private trainers across Florida. Filter by region, age group, gender and private-training availability.",
};

export default async function CoachesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters: Filters = Object.fromEntries(
    Object.entries(searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v ?? ""])
  );
  const coaches = await getCoaches(filters);

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Florida Soccer Coaches
          </h1>
          <p className="mt-1 text-slate-300">
            {coaches.length} coaches · directors, head coaches and private trainers, reviewed by parents
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="mb-6">
          <AdSlot placement="directory-sidebar" variant="leaderboard" seed={2} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Suspense fallback={<div className="card h-72 animate-pulse" />}>
              <CoachFilters />
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
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {coaches.map((coach) => (
                  <CoachCard key={coach.id} coach={coach} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
