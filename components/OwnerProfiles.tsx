"use client";

import { useState } from "react";
import Link from "next/link";

export interface OwnedRank {
  regionRank: number;
  regionTotal: number;
  rank: number; // statewide
  region: string; // display name
  votes: number;
  programLabel?: string;
  trend: "up" | "down" | "flat" | "new";
  delta: number; // positive = climbed since last month
}

export interface OwnedProfile {
  type: string;
  slug: string;
  name: string;
  href: string;
  profileUrl: string; // absolute, for sharing
  period: string; // e.g. "May 2026"
  plan: string;
  claimedUntil: string | null;
  daysLeft: number | null;
  views: number;
  reviews: number;
  rank: OwnedRank | null;
  messages: { id: string; from_name: string | null; from_email: string | null; body: string; created_at: string; read: boolean }[];
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
      <p className="font-heading text-2xl font-bold text-navy">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function ExpiryBadge({ days, until }: { days: number | null; until: string | null }) {
  if (days === null) return <span className="text-xs text-slate-400">No expiry set</span>;
  const fmt = until ? new Date(`${until}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "";
  if (days < 0) return <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-red-100">Expired {fmt}</span>;
  const tone = days <= 30 ? "bg-amber-50 text-amber-700 ring-amber-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${tone}`}>Expires in {days} day{days === 1 ? "" : "s"} · {fmt}</span>;
}

const TREND_META: Record<OwnedRank["trend"], { icon: string; tone: string; label: (d: number) => string }> = {
  up: { icon: "▲", tone: "text-emerald-600", label: (d) => `Up ${d} since last month` },
  down: { icon: "▼", tone: "text-red-500", label: (d) => `Down ${Math.abs(d)} since last month` },
  flat: { icon: "→", tone: "text-slate-400", label: () => "No change since last month" },
  new: { icon: "★", tone: "text-brand-sky", label: () => "New this month" },
};

function RankBlock({ p }: { p: OwnedProfile }) {
  const [copied, setCopied] = useState(false);
  const r = p.rank;
  const ranked = !!r && r.votes > 0;

  const shareText = ranked
    ? `${p.name} is #${r!.regionRank} among ${r!.region} ${p.type === "coach" ? "coaches" : p.type + "s"} on SoccerDadHQ this ${p.period}. Help us climb — recommend us: ${p.profileUrl}`
    : `Help put ${p.name} on the ${p.period} SoccerDadHQ community rankings — recommend us in 10 seconds: ${p.profileUrl}`;

  async function rally() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${p.name} · SoccerDadHQ Rankings`, text: shareText, url: p.profileUrl });
        return;
      } catch {
        /* cancelled */
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

  const t = ranked ? TREND_META[r!.trend] : null;

  return (
    <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {ranked ? (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-amber font-heading text-lg font-extrabold text-navy">
              #{r!.regionRank}
            </span>
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-lg">📊</span>
          )}
          <div className="leading-tight">
            {ranked ? (
              <>
                <p className="text-sm font-semibold text-navy">
                  {r!.region}{r!.programLabel ? ` · ${r!.programLabel}` : ""} · #{r!.regionRank} of {r!.regionTotal}
                </p>
                <p className={`text-xs font-semibold ${t!.tone}`}>
                  {t!.icon} {t!.label(r!.delta)} · #{r!.rank} in FL · {r!.votes} rec{r!.votes === 1 ? "" : "s"}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-navy">Not yet ranked · {p.period}</p>
                <p className="text-xs text-slate-500">One recommendation puts you on the board.</p>
              </>
            )}
          </div>
        </div>
      </div>
      <button onClick={rally} className="btn-primary mt-3 w-full text-sm">
        {copied ? "Copied — paste it anywhere ✓" : "📣 Rally votes — share your link"}
      </button>
    </div>
  );
}

function ProfileCard({ p }: { p: OwnedProfile }) {
  const [msgs, setMsgs] = useState(p.messages);
  const [open, setOpen] = useState(false);
  const unread = msgs.filter((m) => !m.read).length;

  function openMsg(id: string) {
    setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
    fetch("/api/profile-messages/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => {});
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link href={p.href} className="font-heading text-lg font-bold text-navy hover:text-brand-sky">{p.name}</Link>
          <p className="text-xs uppercase tracking-wide text-slate-400">{p.type}{p.plan === "featured" ? " · Featured" : " · Claimed"}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <ExpiryBadge days={p.daysLeft} until={p.claimedUntil} />
          <Link href={`/dashboard/manage/${p.type}/${p.slug}`} className="text-sm font-semibold text-brand-blue hover:underline">
            ✏️ Manage profile →
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Views · 30d" value={p.views} />
        <Stat label="Reviews" value={p.reviews} />
        <Stat label="Messages" value={msgs.length} />
      </div>

      <RankBlock p={p} />

      {msgs.length > 0 && (
        <div className="mt-4">
          <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-sm font-semibold text-brand-blue">
            <span>Messages from families {unread > 0 && <span className="ml-1 rounded-full bg-brand-sky px-1.5 text-xs text-white">{unread} new</span>}</span>
            <span>{open ? "▲" : "▼"}</span>
          </button>
          {open && (
            <ul className="mt-2 space-y-2">
              {msgs.map((m) => (
                <li key={m.id} className={`rounded-lg p-3 text-sm ring-1 ${m.read ? "bg-white ring-slate-100" : "bg-sky-50/50 ring-brand-sky/30"}`} onMouseEnter={() => !m.read && openMsg(m.id)}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-navy">{m.from_name || "A family"}{m.from_email ? <a href={`mailto:${m.from_email}`} className="ml-1 font-normal text-brand-blue hover:underline">{m.from_email}</a> : ""}</span>
                    <span className="shrink-0 text-xs text-slate-400">{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-slate-700">{m.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function OwnerProfiles({ profiles }: { profiles: OwnedProfile[] }) {
  if (profiles.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-3 font-heading text-2xl font-bold text-navy">Your claimed profiles</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {profiles.map((p) => (
          <ProfileCard key={`${p.type}:${p.slug}`} p={p} />
        ))}
      </div>
    </section>
  );
}
