import { Suspense } from "react";
import type { Metadata } from "next";
import SchoolFilters from "@/components/SchoolFilters";
import SchoolCard from "@/components/SchoolCard";
import ActiveFilters from "@/components/ActiveFilters";
import AdSlot from "@/components/AdSlot";
import { getSchools, type SchoolFilters as Filters } from "@/lib/data";
import { regionName } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Florida High School Soccer Directory",
  description:
    "Browse Florida high school soccer programs (FHSAA) by region, class, public/private and boys/girls. Read reviews, see state-title history and find the right school program.",
};

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters: Filters = Object.fromEntries(
    Object.entries(searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v ?? ""])
  );
  const schools = await getSchools(filters);
  const heading = filters.region ? `${regionName(filters.region)} High Schools` : "Florida High School Soccer";

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">{heading}</h1>
          <p className="mt-1 text-slate-300">
            {schools.length} program{schools.length === 1 ? "" : "s"} · FHSAA high school soccer across the state
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
              <SchoolFilters />
            </Suspense>
            <div className="mt-6 hidden lg:block">
              <AdSlot placement="directory-sidebar" seed={7} />
            </div>
          </aside>
          <div>
            <Suspense fallback={null}>
              <ActiveFilters basePath="/schools" />
            </Suspense>
            {schools.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="font-heading text-xl font-bold text-navy">No schools match your filters</p>
                <p className="mt-1 text-slate-500">Try clearing some filters.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {schools.map((s) => (
                  <SchoolCard key={s.id} school={s} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
