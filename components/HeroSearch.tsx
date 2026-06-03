"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { REGIONS } from "@/lib/regions";

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (region) params.set("region", region);
    router.push(`/clubs${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full flex-col gap-2 rounded-2xl bg-white p-2 shadow-card-hover sm:flex-row"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search clubs by name, city or league…"
        className="flex-1 rounded-xl border-0 px-4 py-3 text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-sky/40"
      />
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="rounded-xl border-0 bg-slate-50 px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-brand-sky/40 sm:w-56"
        aria-label="Region"
      >
        <option value="">All regions</option>
        {REGIONS.map((r) => (
          <option key={r.key} value={r.key}>{r.name}</option>
        ))}
      </select>
      <button type="submit" className="btn-amber px-6 py-3">
        Search
      </button>
    </form>
  );
}
