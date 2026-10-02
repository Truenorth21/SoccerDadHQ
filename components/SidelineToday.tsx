"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { POLLS, pollOfTheDayIndex, tallyPoll, POLL_REVEAL_THRESHOLD } from "@/lib/funPolls";
import { formatDate } from "@/lib/utils";
import type { Tryout, Commitment, RankingItem } from "@/lib/types";
import { US_STATES, stateByCode } from "@/lib/states";
import { regionState } from "@/lib/regions";

const STATE_STORE = "sdhq:state";
const POLL_STORE = "sdhq:pollvotes";

/** "The Sideline Today" — a dated, daily-changing, state-aware snapshot beside
 *  Latest News: the votable Poll of the Day, tryout deadlines, new commitments,
 *  top clubs, and an inline newsletter signup. The reason to check in daily. */
export default function SidelineToday({
  tryouts,
  commits,
  movers,
}: {
  tryouts: Tryout[];
  commits: Commitment[];
  movers: RankingItem[];
}) {
  const [today, setToday] = useState("");
  const [state, setState] = useState("");
  const [pollIdx, setPollIdx] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, Record<number, number>>>({});
  const [email, setEmail] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [subMsg, setSubMsg] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    setPollIdx(pollOfTheDayIndex());
    try {
      setState(localStorage.getItem(STATE_STORE) || "");
    } catch {
      /* ignore */
    }
    try {
      setVotes(JSON.parse(localStorage.getItem(POLL_STORE) || "{}"));
    } catch {
      /* ignore */
    }
    fetch("/api/poll-vote")
      .then((r) => r.json())
      .then((d) => setResults(d.results || {}))
      .catch(() => {});
  }, []);

  function chooseState(s: string) {
    setState(s);
    try {
      localStorage.setItem(STATE_STORE, s);
    } catch {
      /* ignore */
    }
  }

  const label = stateByCode(state)?.name ?? "your state";
  // Items carry a state when they know it; older ones (commitments) fall back to their region's state.
  const itemState = (a: { region: string; state?: string }) => a.state || regionState(a.region) || "FL";
  const inRegion = <T extends { region: string; state?: string }>(arr: T[]) => (state ? arr.filter((a) => itemState(a) === state) : arr);
  const now = Date.now();
  const nextTryouts = inRegion(tryouts)
    .filter((t) => +new Date(t.date) > now)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 3);
  const freshCommits = inRegion(commits).slice(0, 3);
  const topMovers = inRegion(movers).slice(0, 3);

  // Poll of the day
  const poll = POLLS[pollIdx];
  const myVote = votes[poll.id];
  const voted = myVote !== undefined;
  const live = results[poll.id] || {};
  const tally = tallyPoll(poll, live, myVote);
  const showResults = voted && tally.revealed;

  function vote(i: number) {
    if (voted) return;
    const next = { ...votes, [poll.id]: i };
    setVotes(next);
    try {
      localStorage.setItem(POLL_STORE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    fetch("/api/poll-vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId: poll.id, optionIndex: i }),
    }).catch(() => {});
  }

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, state, age_confirmed: ageConfirmed }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not subscribe.");
      setSubStatus("done");
      setSubMsg(d.message || "You're in!");
    } catch (err: any) {
      setSubStatus("error");
      setSubMsg(err.message ?? "Something went wrong.");
    }
  }

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="mb-1.5 font-heading text-xs font-bold uppercase tracking-wide text-slate-400">{children}</p>
  );

  return (
    <aside className="card flex h-full flex-col gap-5 p-5">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-brand-sky">⚡ The Sideline Today</p>
          <p className="text-xs text-slate-500">{today || "Your daily youth soccer snapshot"}</p>
        </div>
      </div>

      {/* State filter */}
      <label className="block">
        <span className="font-heading text-xs font-bold uppercase tracking-wide text-slate-400">Showing</span>
        <select
          value={state}
          onChange={(e) => chooseState(e.target.value)}
          className="input mt-1 py-2 text-sm"
          aria-label="Filter by state"
        >
          <option value="">All states</option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
      </label>

      {/* Poll of the day — full question + votable options */}
      <div>
        <SectionLabel>📊 Poll of the Day</SectionLabel>
        <p className="text-sm font-semibold leading-snug text-navy">
          {poll.emoji} {poll.question}
        </p>
        <div className="mt-2 space-y-1.5">
          {poll.options.map((o, i) => {
            const pct = tally.options[i].pct;
            return (
              <button
                key={i}
                onClick={() => vote(i)}
                disabled={voted}
                className={`relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  myVote === i ? "border-brand-sky" : "border-slate-200 hover:border-slate-300"
                } ${voted ? "cursor-default" : ""}`}
              >
                {showResults && <span className="absolute inset-y-0 left-0 bg-sky-50" style={{ width: `${pct}%` }} aria-hidden />}
                <span className="relative flex items-center justify-between gap-2">
                  <span className="font-medium text-navy">
                    {myVote === i && <span className="mr-1 text-brand-sky">✓</span>}
                    {o.label}
                  </span>
                  {showResults && <span className="font-heading font-bold text-brand-blue">{pct}%</span>}
                </span>
              </button>
            );
          })}
        </div>
        {voted && !tally.revealed && (
          <p className="mt-1.5 text-xs text-slate-400">
            Thanks! {tally.realTotal} {tally.realTotal === 1 ? "vote" : "votes"} so far — results show once {POLL_REVEAL_THRESHOLD} parents weigh in.
          </p>
        )}
        <Link href="/polls" className="mt-1.5 inline-block text-xs font-semibold text-brand-blue hover:underline">
          {showResults ? `${tally.realTotal.toLocaleString()} votes · all polls →` : "See all polls →"}
        </Link>
      </div>

      {/* Tryout deadlines */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <SectionLabel>⏰ Tryout deadlines</SectionLabel>
          <Link href={`/tryouts${stateByCode(state) ? `/${stateByCode(state)!.slug}` : ""}`} className="text-xs font-semibold text-brand-blue hover:underline">All →</Link>
        </div>
        {nextTryouts.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming tryouts in {label} right now.</p>
        ) : (
          <ul className="space-y-1.5">
            {nextTryouts.map((t) => (
              <li key={t.id} className="text-sm leading-snug">
                <Link href={`/clubs/${t.club_slug}`} className="font-semibold text-navy hover:text-brand-sky">{t.club_name}</Link>
                <span className="text-slate-500"> — {formatDate(t.date)} · {t.city}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* New commitments */}
      {freshCommits.length > 0 && (
        <div>
          <SectionLabel>🎓 New commitments</SectionLabel>
          <ul className="space-y-1.5">
            {freshCommits.map((c) => (
              <li key={c.id} className="text-sm leading-snug">
                <span className="font-semibold text-navy">{c.player_name}</span>
                <span className="text-slate-500"> → {c.destination}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top clubs */}
      {topMovers.length > 0 && (
        <div>
          <SectionLabel>📈 Community top clubs</SectionLabel>
          <ol className="space-y-1">
            {topMovers.map((m, i) => (
              <li key={m.id} className="flex items-center gap-2 text-sm">
                <span className="font-heading text-xs font-bold text-slate-400">{i + 1}</span>
                <Link href={m.href ?? "/rankings"} className="truncate font-semibold text-navy hover:text-brand-sky">{m.name}</Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Inline newsletter signup — fills the rail + captures the email */}
      <div className="mt-auto rounded-xl bg-navy p-4">
        {subStatus === "done" ? (
          <p className="text-sm font-semibold text-emerald-300">✓ {subMsg}</p>
        ) : (
          <form onSubmit={subscribe} className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-300">📬 Get The Sideline for {label}</p>
            <p className="text-xs text-slate-300">Tryout alerts, commitments &amp; the week&apos;s best reads — one email a week, free.</p>
            {!state && (
              <select
                required
                value={state}
                onChange={(e) => chooseState(e.target.value)}
                className="w-full rounded-md border-0 px-3 py-2 text-sm text-navy"
                aria-label="Your state"
              >
                <option value="">Your state…</option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            )}
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="min-w-0 flex-1 rounded-md border-0 px-3 py-2 text-sm text-navy placeholder:text-slate-400"
              />
              <button type="submit" disabled={subStatus === "loading"} className="btn-amber whitespace-nowrap px-3 py-2 text-sm">
                {subStatus === "loading" ? "…" : "Sign up"}
              </button>
            </div>
            <label className="flex items-start gap-2 text-[11px] text-slate-400">
              <input type="checkbox" required checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-0.5" />
              <span>I&apos;m 13+ and agree to the <a href="/privacy" className="underline">Privacy Policy</a>.</span>
            </label>
            {subStatus === "error" && <p className="text-xs text-red-300">{subMsg}</p>}
          </form>
        )}
      </div>
    </aside>
  );
}
