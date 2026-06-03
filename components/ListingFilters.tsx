"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { REGIONS } from "@/lib/regions";
import { KIND_CONFIG, type ListingKind } from "@/lib/listings";

export default function ListingFilters({ kind }: { kind: ListingKind }) {
  const router = useRouter();
  const params = useSearchParams();
  const cfg = KIND_CONFIG[kind];
  const get = (k: string) => params.get(k) ?? "";

  const update = useCallback(
    (changes: Record<string, string>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      router.push(`${cfg.path}?${next.toString()}`, { scroll: false });
    },
    [params, router, cfg.path]
  );

  return (
    <div className="card p-5">
      <h2 className="mb-4 font-heading text-lg font-bold uppercase text-navy">Filters</h2>
      <div className="space-y-4">
        <div>
          <label className="label">Search</label>
          <input
            className="input"
            placeholder={`Search ${cfg.plural.toLowerCase()}…`}
            defaultValue={get("q")}
            onKeyDown={(e) => {
              if (e.key === "Enter") update({ q: (e.target as HTMLInputElement).value });
            }}
            onBlur={(e) => update({ q: e.target.value })}
          />
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
        {cfg.facets.map((f) => (
          <div key={f.key}>
            <label className="label">{f.label}</label>
            <select
              className="input"
              value={cfg.facets.length && get("facet") && f.options.includes(get("facet")) ? get("facet") : ""}
              onChange={(e) => update({ facet: e.target.value })}
            >
              <option value="">All</option>
              {f.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}
        <div>
          <label className="label">Sort by</label>
          <select className="input" value={get("sort")} onChange={(e) => update({ sort: e.target.value })}>
            <option value="name">Name (A–Z)</option>
            <option value="rating">Highest rated</option>
            <option value="reviews">Most reviewed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
