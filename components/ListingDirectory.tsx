import { Suspense } from "react";
import ListingFilters from "./ListingFilters";
import ListingCard from "./ListingCard";
import AdSlot from "./AdSlot";
import { getListings, KIND_CONFIG, type ListingKind } from "@/lib/listings";

export default function ListingDirectory({
  kind,
  searchParams,
}: {
  kind: ListingKind;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const cfg = KIND_CONFIG[kind];
  const filters = Object.fromEntries(
    Object.entries(searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v ?? ""])
  );
  const listings = getListings(kind, filters);

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Florida {cfg.plural}</h1>
          <p className="mt-1 text-slate-300">
            {listings.length} {listings.length === 1 ? cfg.label.toLowerCase() : cfg.plural.toLowerCase()} · {cfg.blurb}
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="mb-6">
          <AdSlot placement="directory-sidebar" variant="leaderboard" seed={3} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Suspense fallback={<div className="card h-72 animate-pulse" />}>
              <ListingFilters kind={kind} />
            </Suspense>
            <div className="mt-6 hidden lg:block">
              <AdSlot placement="directory-sidebar" seed={11} />
            </div>
          </aside>
          <div>
            {listings.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="font-heading text-xl font-bold text-navy">No {cfg.plural.toLowerCase()} match your filters</p>
                <p className="mt-1 text-slate-500">Try clearing some filters.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
