"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { REGIONS, GENDERS, AGE_GROUPS } from "@/lib/regions";

export default function CoachFilters() {
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
      router.push(`/coaches?${next.toString()}`, { scroll: false });
    },
    [params, router]
  );

  return (
    <div className="card p-5">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 lg:mb-4 lg:pointer-events-none" aria-expanded={open}>
        <h2 className="font-heading text-lg font-bold uppercase text-navy">Filters</h2>
        <svg className={`ml-auto h-5 w-5 text-slate-400 transition-transform lg:hidden ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`${open ? "mt-4 block" : "hidden"} lg:block`}>
      <div className="space-y-4">
        <div>
          <label className="label">Search</label>
          <input
            className="input"
            placeholder="Coach, club, specialty…"
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
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-amber-50 px-3 py-2.5 ring-1 ring-amber-100">
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-brand-amber"
            checked={get("private") === "1"}
            onChange={(e) => update({ private: e.target.checked ? "1" : "" })}
          />
          <span className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-800">
            Private training only
          </span>
        </label>
      </div>
      </div>
    </div>
  );
}
