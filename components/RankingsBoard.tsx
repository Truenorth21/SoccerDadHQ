"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Crest from "./Crest";
import { RANKING_CATEGORIES, REGIONS, LEAGUES, TEAM_LEVELS, FHSAA_CLASSES, regionName } from "@/lib/regions";
import type { RankingItem } from "@/lib/types";

const TOP_DEFAULT = 10;

function Trend({ trend }: { trend: RankingItem["trend"] }) {
  if (trend === "new")
    return (
      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
        New
      </span>
    );
  const map = {
    up: { c: "text-emerald-600", d: "M5 15l5-6 5 6" },
    down: { c: "text-red-500", d: "M5 9l5 6 5-6" },
    flat: { c: "text-slate-300", d: "M5 12h10" },
  } as const;
  const t = map[trend];
  return (
    <svg className={`h-4 w-4 ${t.c}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 20 20" aria-label={trend}>
      <path strokeLinecap="round" strokeLinejoin="round" d={t.d} />
    </svg>
  );
}

function VoteButton({ item, canVote }: { item: RankingItem; canVote: boolean }) {
  const router = useRouter();
  const [votes, setVotes] = useState(item.votes);
  const [voted, setVoted] = useState(false);

  async function vote() {
    if (voted) return;
    if (!canVote) {
      router.push("/login?next=/rankings");
      return;
    }
    setVoted(true);
    setVotes((v) => v + 1);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.id, item_name: item.name }),
      });
      if (!res.ok) {
        // Revert on rejection (already voted this month, session expired, etc.)
        setVotes((v) => v - 1);
        const data = await res.json().catch(() => ({}));
        if (data.code === "auth_required") router.push("/login?next=/rankings");
      }
    } catch {
      setVotes((v) => v - 1);
      setVoted(false);
    }
  }

  return (
    <button
      onClick={vote}
      disabled={voted}
      title={canVote ? `Vote for ${item.name}` : "Log in to vote"}
      className={`flex shrink-0 flex-col items-center rounded-lg px-3 py-1.5 transition-colors ${
        voted ? "bg-brand-sky text-white" : "bg-slate-100 text-navy hover:bg-brand-sky/10"
      }`}
      aria-label={canVote ? `Vote for ${item.name}` : `Log in to vote for ${item.name}`}
    >
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 3l7 9h-4v5H7v-5H3l7-9z" />
      </svg>
      <span className="font-heading text-sm font-bold leading-none">{votes}</span>
    </button>
  );
}

function Row({ item, canVote }: { item: RankingItem; canVote: boolean }) {
  const top3 = item.rank <= 3;
  const inner = (
    <>
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg font-heading text-base font-bold ${
          top3 ? "bg-brand-amber text-navy" : "bg-navy text-white"
        }`}
      >
        {item.rank}
      </span>
      <Crest name={item.name} color={item.color ?? "#1a4fa0"} size="sm" rounded="full" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-base font-bold text-navy">{item.name}</p>
        <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
      </div>
      <Trend trend={item.trend} />
    </>
  );
  return (
    <li className="flex items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-card">
      {item.href ? (
        <Link href={item.href} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
          {inner}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{inner}</div>
      )}
      <VoteButton item={item} canVote={canVote} />
    </li>
  );
}

function PodiumCard({
  item,
  place,
}: {
  item: RankingItem;
  place: 1 | 2 | 3;
}) {
  const cfg = {
    1: { h: "h-36", ring: "ring-brand-amber", grad: "from-amber-300 to-brand-amber", medal: "🥇", crest: "lg" as const, order: "order-2" },
    2: { h: "h-28", ring: "ring-slate-300", grad: "from-slate-200 to-slate-400", medal: "🥈", crest: "md" as const, order: "order-1" },
    3: { h: "h-24", ring: "ring-amber-700/40", grad: "from-orange-200 to-amber-700/60", medal: "🥉", crest: "md" as const, order: "order-3" },
  }[place];

  const card = (
    <>
      <div className="flex flex-col items-center">
        <span className="text-2xl">{cfg.medal}</span>
        <div className={`mt-1 rounded-full bg-white p-1 shadow-md ring-2 ${cfg.ring}`}>
          <Crest name={item.name} color={item.color ?? "#1a4fa0"} size={cfg.crest} rounded="full" />
        </div>
        <p className="mt-2 line-clamp-2 px-1 text-center font-heading text-sm font-bold leading-tight text-navy">
          {item.name}
        </p>
        <p className="line-clamp-1 px-1 text-center text-[11px] text-slate-500">{item.subtitle}</p>
      </div>
      <div className={`mt-2 flex w-full ${cfg.h} flex-col items-center justify-end rounded-t-xl bg-gradient-to-b ${cfg.grad} pb-2`}>
        <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-navy shadow-sm">
          {item.votes} votes
        </span>
      </div>
    </>
  );

  return (
    <div className={`flex flex-col items-center ${cfg.order}`}>
      {item.href ? (
        <Link href={item.href} className="flex w-full flex-col items-center hover:opacity-90">
          {card}
        </Link>
      ) : (
        card
      )}
    </div>
  );
}

export default function RankingsBoard({
  data,
  authed = false,
  supabaseConfigured = false,
}: {
  data: Record<string, RankingItem[]>;
  authed?: boolean;
  supabaseConfigured?: boolean;
}) {
  const [tab, setTab] = useState("clubs");
  const [region, setRegion] = useState("");
  const [league, setLeague] = useState("");
  const [gender, setGender] = useState("");
  const [level, setLevel] = useState("Varsity");
  const [cls, setCls] = useState("");
  const [showAll, setShowAll] = useState(false);

  // In demo mode (no Supabase) voting stays open; with Supabase, login is required.
  const canVote = !supabaseConfigured || authed;

  const isSchools = tab === "schools";

  const items = useMemo(() => {
    let list = [...(data[tab] ?? [])];
    if (region) list = list.filter((i) => i.region === region);
    if (league) list = list.filter((i) => i.league === league);
    if (isSchools && gender) list = list.filter((i) => i.gender === gender);
    if (isSchools && level) list = list.filter((i) => i.level === level);
    if (isSchools && cls) list = list.filter((i) => i.cls === cls);
    return list
      .sort((a, b) => b.votes - a.votes)
      .map((i, idx) => ({ ...i, rank: idx + 1 }));
  }, [data, tab, region, league, gender, level, cls, isSchools]);

  const showLeague = tab === "clubs";
  const podium = items.slice(0, 3);
  const rest = items.slice(3);
  const visibleRest = showAll ? rest : rest.slice(0, TOP_DEFAULT - 3);

  function changeTab(key: string) {
    setTab(key);
    setShowAll(false);
    if (key !== "clubs") setLeague("");
    if (key !== "schools") {
      setGender("");
      setLevel("Varsity");
      setCls("");
    }
  }

  return (
    <div>
      {/* Login prompt when voting requires an account */}
      {supabaseConfigured && !authed && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-navy px-4 py-3 text-sm text-white">
          <span>🗳️ Voting is one vote per person, per item, per month. Log in to cast yours.</span>
          <Link href="/login?next=/rankings" className="btn-amber px-4 py-1.5 text-sm">
            Log in to vote
          </Link>
        </div>
      )}

      {/* Category tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {RANKING_CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => changeTab(c.key)}
            className={`rounded-full px-4 py-2 font-heading text-sm font-semibold uppercase tracking-wide transition-colors ${
              tab === c.key
                ? "bg-brand-sky text-white shadow-sm"
                : "bg-white text-navy ring-1 ring-slate-200 hover:ring-brand-sky"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select className="input max-w-[220px]" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">All regions</option>
          {REGIONS.map((r) => (
            <option key={r.key} value={r.key}>{r.name}</option>
          ))}
        </select>
        {showLeague && (
          <select className="input max-w-[220px]" value={league} onChange={(e) => setLeague(e.target.value)}>
            <option value="">All leagues</option>
            {LEAGUES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        )}
        {isSchools && (
          <>
            <select className="input max-w-[160px]" value={gender} onChange={(e) => setGender(e.target.value)} aria-label="Team">
              <option value="">Boys &amp; Girls</option>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
            </select>
            <select className="input max-w-[180px]" value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
              <option value="">All levels</option>
              {TEAM_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <select className="input max-w-[170px]" value={cls} onChange={(e) => setCls(e.target.value)} aria-label="Division">
              <option value="">All divisions</option>
              {FHSAA_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </>
        )}
        <span className="ml-auto self-center text-sm text-slate-500">
          {items.length} ranked
        </span>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-100">
          No entries match these filters yet.
        </p>
      ) : (
        <>
          {/* Podium */}
          {podium.length === 3 && (
            <div className="mb-8 rounded-2xl bg-gradient-to-b from-navy to-navy-700 p-5 sm:p-7">
              <div className="mx-auto grid max-w-xl grid-cols-3 items-end gap-3 sm:gap-5">
                <PodiumCard item={podium[1]} place={2} />
                <PodiumCard item={podium[0]} place={1} />
                <PodiumCard item={podium[2]} place={3} />
              </div>
            </div>
          )}

          {/* Ranked list */}
          <ol className="space-y-2">
            {visibleRest.map((item) => (
              <Row key={item.id} item={item} canVote={canVote} />
            ))}
          </ol>

          {/* Show more / less toggle */}
          {rest.length > TOP_DEFAULT - 3 && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setShowAll((s) => !s)}
                className="btn-outline"
              >
                {showAll ? "Show less ↑" : `Show all ${items.length} →`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
