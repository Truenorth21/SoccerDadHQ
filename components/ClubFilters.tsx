"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { REGIONS, LEAGUES, GENDERS, AGE_GROUPS } from "@/lib/regions";

export default function ClubFilters({ hasRatings = false }: { hasRatings?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const get = (k: string) => params.get(k) ?? "";

  const update = useCallback(
    (changes: Record<string, string>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(changes).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      router.push(`/clubs?${next.toString()}`, { scroll: false });
    },
    [params, router]
  );

  const activeCount = ["region", "league", "gender", "age", "zip", "tryouts", "rating"].filter((k) =>
    params.get(k)
  ).length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between lg:mb-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 lg:pointer-events-none"
          aria-expanded={open}
        >
          <h2 className="font-heading text-lg font-bold uppercase text-navy">Filters</h2>
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-sky px-2 py-0.5 text-xs font-bold text-white">{activeCount}</span>
          )}
          <svg className={`h-5 w-5 text-slate-400 transition-transform lg:hidden ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {activeCount > 0 && (
          <button
            onClick={() => router.push("/clubs")}
            className="text-xs font-semibold text-brand-sky hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className={`${open ? "mt-4 block" : "hidden"} lg:block`}>

      <div className="space-y-4">
        <div>
          <label className="label">Search</label>
          <input
            className="input"
            placeholder="Name, city, league…"
            defaultValue={get("q")}
            onKeyDown={(e) => {
              if (e.key === "Enter") update({ q: (e.target as HTMLInputElement).value });
            }}
            onBlur={(e) => update({ q: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">ZIP</label>
            <input
              className="input"
              placeholder="33327"
              maxLength={5}
              defaultValue={get("zip")}
              onBlur={(e) => update({ zip: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Radius</label>
            <select className="input" value={get("radius")} onChange={(e) => update({ radius: e.target.value })}>
              <option value="">Any</option>
              <option value="10">10 mi</option>
              <option value="25">25 mi</option>
              <option value="50">50 mi</option>
              <option value="100">100 mi</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Region</label>
          <select className="input" value={get("region")} onChange={(e) => update({ region: e.target.value })}>
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r.key} value={r.key}>{r.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">League</label>
          <select className="input" value={get("league")} onChange={(e) => update({ league: e.target.value })}>
            <option value="">All leagues</option>
            {LEAGUES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Gender</label>
            <select className="input" value={get("gender")} onChange={(e) => update({ gender: e.target.value })}>
              <option value="">All</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Age group</label>
            <select className="input" value={get("age")} onChange={(e) => update({ age: e.target.value })}>
              <option value="">All</option>
              {AGE_GROUPS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-brand-sky"
            checked={get("tryouts") === "1"}
            onChange={(e) => update({ tryouts: e.target.checked ? "1" : "" })}
          />
          <span className="font-heading text-sm font-semibold uppercase tracking-wide text-navy">
            Tryouts open only
          </span>
        </label>

        {/* Rating filter + rating-based sorts only appear once programs have real
            parent reviews — until then there's nothing to filter/sort by. */}
        {hasRatings && (
          <div>
            <label className="label">Minimum rating</label>
            <select className="input" value={get("rating")} onChange={(e) => update({ rating: e.target.value })}>
              <option value="">Any rating</option>
              <option value="4.5">4.5+ ★</option>
              <option value="4">4.0+ ★</option>
              <option value="3.5">3.5+ ★</option>
              <option value="3">3.0+ ★</option>
            </select>
          </div>
        )}

        <div>
          <label className="label">Sort by</label>
          <select className="input" value={get("sort")} onChange={(e) => update({ sort: e.target.value })}>
            <option value="name">Name (A–Z)</option>
            {hasRatings && <option value="rating">Highest rated</option>}
            {hasRatings && <option value="reviews">Most reviewed</option>}
            <option value="distance">Nearest (needs ZIP)</option>
          </select>
        </div>
      </div>
      </div>
    </div>
  );
}
