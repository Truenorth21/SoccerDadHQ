"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { US_STATES, stateByCode } from "@/lib/states";
import { REGION_MAP, regionsForState } from "@/lib/regions";

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [region, setRegion] = useState("");
  const regions = regionsForState(state);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const st = stateByCode(state);
    // A bare state / region pick lands on its SEO page; a text search goes to the filterable directory.
    if (st && !q) {
      const r = region ? REGION_MAP[region] : undefined;
      router.push(r ? `/clubs/${st.slug}/${r.slug}` : `/clubs/${st.slug}`);
      return;
    }
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (state) params.set("state", state);
    if (region) params.set("region", region);
    router.push(`/clubs${params.toString() ? `?${params}` : ""}`);
  }

  const selectClass =
    "rounded-xl border-0 bg-slate-50 px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-brand-sky/40";

  return (
    <form
      onSubmit={submit}
      className="flex w-full flex-col gap-2 rounded-2xl bg-white p-2 shadow-card-hover sm:flex-row sm:flex-wrap lg:flex-nowrap"
    >
      <select
        value={state}
        onChange={(e) => {
          setState(e.target.value);
          setRegion("");
        }}
        className={`${selectClass} font-semibold sm:w-48`}
        aria-label="Your state"
      >
        <option value="">Pick your state</option>
        {US_STATES.map((s) => (
          <option key={s.code} value={s.code}>{s.name}</option>
        ))}
      </select>
      {regions.length > 0 && (
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className={`${selectClass} sm:w-48`}
          aria-label="Region"
        >
          <option value="">All regions</option>
          {regions.map((r) => (
            <option key={r.key} value={r.key}>{r.name}</option>
          ))}
        </select>
      )}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Club name, city or league…"
        className="min-w-0 flex-1 rounded-xl border-0 px-4 py-3 text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-sky/40"
      />
      <button type="submit" className="btn-amber px-6 py-3">
        Search
      </button>
    </form>
  );
}
