"use client";

import Link from "next/link";
import { useCompare } from "@/lib/compare";

export default function CompareTray() {
  const { items, clear, toggle } = useCompare();
  if (items.length === 0) return null;

  const type = items[0].type;
  const href = `/compare?type=${type}&slugs=${items.map((i) => i.slug).join(",")}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-700 bg-navy/95 backdrop-blur">
      <div className="container-page flex items-center gap-3 py-3">
        <span className="hidden font-heading text-sm font-bold uppercase tracking-wide text-white sm:block">
          Compare {type}s
        </span>
        <div className="flex flex-1 flex-wrap gap-2">
          {items.map((i) => (
            <span key={i.slug} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-sm text-white">
              {i.name}
              <button onClick={() => toggle(i)} className="text-white/60 hover:text-white" aria-label={`Remove ${i.name}`}>✕</button>
            </span>
          ))}
        </div>
        <button onClick={clear} className="text-xs font-semibold text-slate-300 hover:text-white">Clear</button>
        <Link
          href={href}
          className={`btn-amber text-sm ${items.length < 2 ? "pointer-events-none opacity-50" : ""}`}
          aria-disabled={items.length < 2}
        >
          Compare {items.length}
        </Link>
      </div>
    </div>
  );
}
