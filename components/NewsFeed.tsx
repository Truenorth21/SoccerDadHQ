"use client";

import { Fragment, useMemo, useState } from "react";
import { NEWS_CATEGORIES } from "@/lib/news";
import { REGIONS, regionName } from "@/lib/regions";
import { timeAgo } from "@/lib/utils";
import type { NewsItem } from "@/lib/types";
import AdSlot from "./AdSlot";
import CompactShare from "./CompactShare";
import { GradientPanel } from "./Crest";

// Hex colors for the image fallback gradient, by category.
const CAT_HEX: Record<string, string> = {
  ECNL: "#1a4fa0",
  "MLS NEXT": "#1d7a4d",
  "Girls Academy": "#9b2d2d",
  "Girls Soccer": "#9b2d2d",
  "Boys Soccer": "#2a7de1",
  "High School": "#5a2d82",
  Recruiting: "#e8a020",
  Tournaments: "#5a2d82",
  "Parent Life": "#0d7a6f",
  Opinion: "#142844",
};

function NewsImage({ item, className }: { item: NewsItem; className: string }) {
  if (item.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.image} alt="" loading="lazy" className={`${className} object-cover`} />;
  }
  return <GradientPanel seed={item.id} color={CAT_HEX[item.category] ?? "#1a4fa0"} className={className} label={item.category} />;
}

const CAT_COLOR: Record<string, string> = {
  ECNL: "bg-blue-50 text-brand-blue ring-blue-100",
  "MLS NEXT": "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "Girls Academy": "bg-pink-50 text-pink-700 ring-pink-100",
  "Girls Soccer": "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
  "Boys Soccer": "bg-sky-50 text-brand-sky ring-sky-100",
  "High School": "bg-indigo-50 text-indigo-700 ring-indigo-100",
  Recruiting: "bg-amber-50 text-amber-700 ring-amber-100",
  Tournaments: "bg-violet-50 text-violet-700 ring-violet-100",
  "Parent Life": "bg-teal-50 text-teal-700 ring-teal-100",
  Opinion: "bg-slate-100 text-slate-700 ring-slate-200",
};

function Tag({ cat }: { cat: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${CAT_COLOR[cat] ?? "bg-slate-100 text-slate-700 ring-slate-200"}`}>
      {cat}
    </span>
  );
}

export default function NewsFeed({ items }: { items: NewsItem[] }) {
  const [cat, setCat] = useState<string>("All");
  const [region, setRegion] = useState<string>("");

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const catOk = cat === "All" || i.category === cat;
      const regionOk = !region || i.region === region;
      return catOk && regionOk;
    });
  }, [items, cat, region]);

  // Distinct publishers present, for the "where this comes from" strip.
  const sources = useMemo(
    () => Array.from(new Set(items.map((i) => i.source))).sort(),
    [items]
  );

  // Newest story age, for the recency notice.
  const newest = items[0]?.published;
  const regionTagged = items.filter((i) => i.region).length;

  return (
    <div>
      {/* Recency + sourcing notice */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>
            <strong className="text-navy">{items.length} stories from the past week</strong>
            {newest && <> · freshest {timeAgo(newest)} · auto-refreshed every 30 min</>}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wide">Sources:</span>
          {sources.map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
        </div>
      </div>

      {/* Region filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="font-heading text-sm font-semibold uppercase tracking-wide text-slate-500">
          Region
        </label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="input max-w-[260px]"
        >
          <option value="">All of Florida + national</option>
          {REGIONS.map((r) => (
            <option key={r.key} value={r.key}>{r.name}</option>
          ))}
        </select>
        {region && (
          <span className="text-xs text-slate-500">
            Showing stories that mention {regionName(region)}.
            <button onClick={() => setRegion("")} className="ml-1 font-semibold text-brand-sky hover:underline">
              Clear
            </button>
          </span>
        )}
        {!region && (
          <span className="text-xs text-slate-400">{regionTagged} stories tagged to a Florida region</span>
        )}
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {NEWS_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3.5 py-1.5 font-heading text-sm font-semibold uppercase tracking-wide transition-colors ${
              cat === c ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-slate-200 hover:ring-slate-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-slate-500 ring-1 ring-slate-100">
          {region ? (
            <>
              No <strong>{cat === "All" ? "" : `${cat} `}</strong>stories mention {regionName(region)} right now.
              National coverage isn't always region-specific — try clearing the region filter.
            </>
          ) : (
            "No stories in this category right now."
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, idx) => (
            <Fragment key={item.id}>
              {idx > 0 && idx % 6 === 0 && (
                <AdSlot placement="news-infeed" variant="infeed" seed={idx} />
              )}
            <div className="card card-hover group relative flex flex-col overflow-hidden">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.title}
                className="absolute inset-0 z-[1]"
              />
              <NewsImage item={item} className="aspect-[16/9] w-full" />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag cat={item.category} />
                    {item.region && (
                      <span className="inline-flex rounded-full bg-navy/5 px-2 py-0.5 text-xs font-semibold text-navy ring-1 ring-navy/10">
                        📍 {regionName(item.region)}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(item.published)}</span>
                </div>
                <h3 className="font-heading text-lg font-bold leading-snug text-navy group-hover:text-brand-sky">
                  {item.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{item.excerpt}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs font-semibold text-slate-500">via {item.source}</span>
                  <span className="relative z-[2]">
                    <CompactShare url={item.link} title={item.title} />
                  </span>
                </div>
              </div>
            </div>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
