"use client";

import { useState } from "react";

const QUESTION = "What matters most when choosing a club?";
const OPTIONS = [
  { key: "coaching", label: "Coaching quality", base: 41 },
  { key: "development", label: "Player development pathway", base: 27 },
  { key: "cost", label: "Cost & value", base: 18 },
  { key: "location", label: "Location & travel", base: 14 },
];

export default function ParentPoll() {
  const [voted, setVoted] = useState<string | null>(null);

  const total = OPTIONS.reduce((a, o) => a + o.base, 0) + (voted ? 1 : 0);

  return (
    <div className="card p-6">
      <span className="chip-amber mb-3">Parent Poll</span>
      <h3 className="font-heading text-xl font-bold text-navy">{QUESTION}</h3>
      <div className="mt-4 space-y-2.5">
        {OPTIONS.map((o) => {
          const count = o.base + (voted === o.key ? 1 : 0);
          const pct = Math.round((count / total) * 100);
          return (
            <button
              key={o.key}
              onClick={() => !voted && setVoted(o.key)}
              disabled={!!voted}
              className={`relative w-full overflow-hidden rounded-lg border px-3 py-2.5 text-left transition-colors ${
                voted === o.key ? "border-brand-sky" : "border-slate-200 hover:border-slate-300"
              } ${voted ? "cursor-default" : ""}`}
            >
              {voted && (
                <span
                  className="absolute inset-y-0 left-0 bg-sky-50"
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
              )}
              <span className="relative flex items-center justify-between">
                <span className="font-medium text-navy">{o.label}</span>
                {voted && <span className="font-heading font-bold text-brand-blue">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        {voted ? `${total.toLocaleString()} votes · thanks for voting!` : `${total.toLocaleString()} votes · tap to vote`}
      </p>
    </div>
  );
}
