"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Tryout, Commitment, RankingItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const STORE = "sdhq:region";

interface RegionOpt {
  key: string;
  name: string;
}

export default function DailyHub({
  tryouts,
  commits,
  movers,
  regions,
}: {
  tryouts: Tryout[];
  commits: Commitment[];
  movers: RankingItem[];
  regions: RegionOpt[];
}) {
  const [region, setRegion] = useState("");
  const [, setReady] = useState(false);

  // Region is remembered locally so the hub feels personalized on return visits.
  useEffect(() => {
    try {
      setRegion(localStorage.getItem(STORE) || "");
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function choose(r: string) {
    setRegion(r);
    try {
      localStorage.setItem(STORE, r);
    } catch {
      /* ignore */
    }
  }

  const label = region ? regions.find((x) => x.key === region)?.name ?? "your area" : "Florida";
  const inRegion = <T extends { region: string }>(arr: T[]) => (region ? arr.filter((a) => a.region === region) : arr);

  const myTryouts = inRegion(tryouts).slice(0, 4);
  const myCommits = inRegion(commits).slice(0, 4);
  const myMovers = inRegion(movers)
    .filter((m) => m.trend === "up" || m.trend === "new")
    .slice(0, 5);

  // Tryout-alert signup = region-tagged newsletter subscribe.
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, region: region || null }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not subscribe.");
      setStatus("done");
      setMsg(d.message);
    } catch (err: any) {
      setStatus("error");
      setMsg(err.message ?? "Something went wrong.");
    }
  }

  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="container-page py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-navy">
              ⚡ Your Sideline Today
            </h2>
            <p className="text-sm text-slate-500">Tryouts, commitments and movers — tuned to your corner of Florida.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="font-heading font-semibold uppercase tracking-wide text-slate-500">Region</span>
            <select value={region} onChange={(e) => choose(e.target.value)} className="input max-w-[220px] py-2">
              <option value="">All of Florida</option>
              {regions.map((r) => (
                <option key={r.key} value={r.key}>{r.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* TRYOUTS NEAR YOU + alerts */}
          <div className="card flex flex-col p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold uppercase text-navy">⚽ Tryouts near you</h3>
              <Link href={`/clubs${region ? `?region=${region}` : ""}`} className="link-arrow text-xs">All →</Link>
            </div>
            {myTryouts.length === 0 ? (
              <p className="flex-1 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                No upcoming tryouts listed in {label} right now. Set an alert and we'll email you the moment one drops.
              </p>
            ) : (
              <ul className="flex-1 space-y-3">
                {myTryouts.map((t) => (
                  <li key={t.id} className="border-b border-slate-100 pb-2.5 last:border-0">
                    <Link href={`/clubs/${t.club_slug}`} className="font-heading font-bold leading-tight text-navy hover:text-brand-sky">
                      {t.club_name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {t.age_groups} · {t.gender} · <span className="font-semibold text-brand-amber">{formatDate(t.date)}</span> · {t.city}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {/* Tryout alerts */}
            <div className="mt-4 rounded-lg bg-navy p-3">
              {status === "done" ? (
                <p className="text-sm font-semibold text-emerald-300">✓ {msg}</p>
              ) : (
                <form onSubmit={subscribe} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                    🔔 Get tryout alerts for {label}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="min-w-0 flex-1 rounded-md border-0 px-3 py-2 text-sm text-navy placeholder:text-slate-400"
                    />
                    <button type="submit" disabled={status === "loading"} className="btn-amber whitespace-nowrap px-3 py-2 text-sm">
                      {status === "loading" ? "…" : "Notify me"}
                    </button>
                  </div>
                  {status === "error" && <p className="text-xs text-red-300">{msg}</p>}
                </form>
              )}
            </div>
          </div>

          {/* RECENT COMMITMENTS */}
          <div className="card flex flex-col p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold uppercase text-navy">🎓 Recent commitments</h3>
              <Link href="/commitments" className="link-arrow text-xs">All →</Link>
            </div>
            {myCommits.length === 0 ? (
              <p className="flex-1 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                No commitments posted in {label} yet.
              </p>
            ) : (
              <ul className="flex-1 space-y-3">
                {myCommits.map((c) => (
                  <li key={c.id} className="border-b border-slate-100 pb-2.5 last:border-0">
                    <p className="font-heading font-bold leading-tight text-navy">
                      {c.player_name} <span className="font-normal text-slate-400">→</span>{" "}
                      <span className="text-emerald-700">{c.destination}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.position} · Class of {c.grad_year}{c.club_name ? ` · ${c.club_name}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* RANKINGS MOVERS */}
          <div className="card flex flex-col p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold uppercase text-navy">📈 Movers this week</h3>
              <Link href="/rankings" className="link-arrow text-xs">Rankings →</Link>
            </div>
            {myMovers.length === 0 ? (
              <p className="flex-1 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                No ranking movement in {label} this week.
              </p>
            ) : (
              <ul className="flex-1 space-y-3">
                {myMovers.map((m) => (
                  <li key={m.id}>
                    <Link href={m.href ?? "/rankings"} className="flex items-center gap-2 hover:opacity-80">
                      <span className="font-heading text-sm font-bold text-emerald-600">{m.trend === "new" ? "NEW" : "▲"}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-heading font-bold leading-tight text-navy">{m.name}</span>
                        <span className="block truncate text-xs text-slate-500">{m.subtitle}</span>
                      </span>
                      <span className="font-heading text-sm font-bold text-brand-amber">
                        {m.votes > 0 ? `${m.votes} 👍` : m.rating ? `${m.rating.toFixed(1)}★` : "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
