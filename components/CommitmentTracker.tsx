"use client";

import { useMemo, useState } from "react";
import CommitmentCard from "./CommitmentCard";
import { REGIONS, COMMITMENT_TYPES, GRAD_YEARS } from "@/lib/regions";
import type { Commitment } from "@/lib/types";

export default function CommitmentTracker({ data }: { data: Commitment[] }) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [gender, setGender] = useState("");
  const [year, setYear] = useState("");
  const [dest, setDest] = useState("");

  const filtered = useMemo(() => {
    return data.filter((c) => {
      if (q) {
        const s = q.toLowerCase();
        if (
          !c.player_name.toLowerCase().includes(s) &&
          !c.destination.toLowerCase().includes(s) &&
          !(c.club_name ?? "").toLowerCase().includes(s) &&
          !(c.school_name ?? "").toLowerCase().includes(s)
        )
          return false;
      }
      if (region && c.region !== region) return false;
      if (gender && c.gender !== gender) return false;
      if (year && String(c.grad_year) !== year) return false;
      if (dest && c.dest_type !== dest) return false;
      return true;
    });
  }, [data, q, region, gender, year, dest]);

  const counts = useMemo(
    () => ({
      College: data.filter((c) => c.dest_type === "College").length,
      Pro: data.filter((c) => c.dest_type === "Pro").length,
      "National Team": data.filter((c) => c.dest_type === "National Team").length,
    }),
    [data]
  );

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-3">
        {COMMITMENT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setDest(dest === t ? "" : t)}
            className={`card p-4 text-center transition-colors ${dest === t ? "ring-2 ring-brand-sky" : ""}`}
          >
            <div className="font-heading text-2xl font-bold text-brand-blue">{counts[t]}</div>
            <div className="text-xs uppercase tracking-wide text-slate-500">{t}</div>
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Player, college, club or school…"
          className="input max-w-xs"
        />
        <select className="input max-w-[200px]" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">All regions</option>
          {REGIONS.map((r) => (
            <option key={r.key} value={r.key}>{r.name}</option>
          ))}
        </select>
        <select className="input max-w-[130px]" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Boys & Girls</option>
          <option value="Boys">Boys</option>
          <option value="Girls">Girls</option>
        </select>
        <select className="input max-w-[150px]" value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">All grad years</option>
          {GRAD_YEARS.map((y) => (
            <option key={y} value={y}>Class of {y}</option>
          ))}
        </select>
        <span className="ml-auto self-center text-sm text-slate-500">{filtered.length} commitments</span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-100">
          No commitments match these filters.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CommitmentCard key={c.id} commitment={c} />
          ))}
        </div>
      )}
    </div>
  );
}
