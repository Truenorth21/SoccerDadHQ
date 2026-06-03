"use client";

import { useCompare, type CompareItem } from "@/lib/compare";

export default function CompareButton({ item }: { item: CompareItem }) {
  const { has, toggle, atMax } = useCompare();
  const active = has(item.type, item.slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      aria-pressed={active}
      title={active ? "Remove from compare" : atMax ? "Compare list full (max 4)" : "Add to compare"}
      className={`grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors ${
        active ? "text-brand-sky" : "text-slate-400 hover:text-brand-sky"
      }`}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    </button>
  );
}
