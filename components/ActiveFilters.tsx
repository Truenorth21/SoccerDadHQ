"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { regionName } from "@/lib/regions";

const LABELS: Record<string, (v: string) => string> = {
  q: (v) => `“${v}”`,
  region: (v) => regionName(v),
  league: (v) => v,
  gender: (v) => v,
  age: (v) => v,
  zip: (v) => `ZIP ${v}`,
  radius: (v) => `${v} mi`,
  tryouts: () => "Tryouts open",
  type: (v) => v,
  cls: (v) => v,
  private: () => "Private training",
};

export default function ActiveFilters({ basePath }: { basePath: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const entries = Array.from(params.entries()).filter(([k, v]) => v && LABELS[k]);
  if (entries.length === 0) return null;

  function remove(key: string) {
    const next = new URLSearchParams(params.toString());
    next.delete(key);
    if (key === "zip") next.delete("radius"); // radius is meaningless without a ZIP
    router.push(next.toString() ? `${basePath}?${next}` : basePath, { scroll: false });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Active:</span>
      {entries.map(([k, v]) => (
        <button
          key={k}
          onClick={() => remove(k)}
          className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-brand-blue ring-1 ring-sky-100 hover:bg-sky-100"
          aria-label={`Remove filter ${LABELS[k](v)}`}
        >
          {LABELS[k](v)}
          <span aria-hidden className="text-sm leading-none">×</span>
        </button>
      ))}
      <button onClick={() => router.push(basePath)} className="text-xs font-semibold text-slate-500 hover:text-brand-sky">
        Clear all
      </button>
    </div>
  );
}
