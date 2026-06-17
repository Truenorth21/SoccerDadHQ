"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Profile rank badge + one-tap "rally votes" share. Shows the entity's current
 * community standing (only when it has real recommendations behind it) and gives
 * the owner/fans a prebuilt message + link to campaign for votes — the loop that
 * actually drives ranking participation. Honest: an unranked entity shows a
 * "be the first" state rather than a meaningless number.
 */
export default function RankBadgeShare({
  name,
  profileUrl,
  period,
  categoryLabel,
  regionName,
  rank,
  regionRank,
  regionTotal,
  votes,
  programLabel,
}: {
  name: string;
  profileUrl: string;
  period: string;
  categoryLabel: string;
  regionName: string;
  rank: number;
  regionRank: number;
  regionTotal: number;
  votes: number;
  programLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const ranked = votes > 0;
  const cat = categoryLabel.toLowerCase();

  const shareText = ranked
    ? `${name} is ranked #${regionRank} among ${regionName} ${cat} on SoccerDadHQ this ${period}${
        programLabel ? ` (${programLabel})` : ""
      }. Help them climb — recommend them in 10 seconds: ${profileUrl}`
    : `Help put ${name} on the ${period} SoccerDadHQ community rankings — it takes 10 seconds to recommend them: ${profileUrl}`;

  async function rally() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${name} · SoccerDadHQ Rankings`, text: shareText, url: profileUrl });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard?.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 bg-navy px-5 py-3 text-white">
        {ranked ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-amber font-heading text-xl font-extrabold text-navy">
            #{regionRank}
          </span>
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">📊</span>
        )}
        <div className="leading-tight">
          {ranked ? (
            <>
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-amber-300">
                {regionName} {categoryLabel}
              </p>
              <p className="text-xs text-white/70">
                {programLabel ? `${programLabel} · ` : ""}#{regionRank} of {regionTotal} · {period}
              </p>
            </>
          ) : (
            <>
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-amber-300">Community Rankings</p>
              <p className="text-xs text-white/70">Not yet ranked · {period}</p>
            </>
          )}
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm text-slate-600">
          {ranked ? (
            <>
              <span className="font-semibold text-navy">{name}</span> sits <span className="font-semibold text-navy">#{regionRank}</span> in{" "}
              {regionName} and <span className="font-semibold text-navy">#{rank}</span> in Florida, on{" "}
              <span className="font-semibold text-navy">{votes}</span> real recommendation{votes === 1 ? "" : "s"} this month.
              Rankings reset monthly — rally your community to climb.
            </>
          ) : (
            <>
              <span className="font-semibold text-navy">{name}</span> hasn&rsquo;t been recommended yet this month. One vote puts them on
              the board — share the link with your families to get started.
            </>
          )}
        </p>

        <button onClick={rally} className="btn-primary mt-3 w-full">
          {copied ? "Copied — paste it anywhere ✓" : "📣 Rally votes — share the link"}
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">
          <Link href="/rankings" className="font-semibold text-brand-blue hover:underline">
            See the full rankings →
          </Link>
        </p>
      </div>
    </div>
  );
}
