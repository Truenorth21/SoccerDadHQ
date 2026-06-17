"use client";

import { useEffect, useState } from "react";
import { POLLS, tallyPoll, POLL_REVEAL_THRESHOLD, type Poll } from "@/lib/funPolls";

const STORE = "sdhq:pollvotes";

/** Full poll archive — every Sideline poll with live community results.
 *  Leads with "This Month's Polls" (the ones featured so far this month) for
 *  freshness, then the full archive below for depth + SEO. */
export default function PollsHub({ thisMonthIds }: { thisMonthIds: string[] }) {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, Record<number, number>>>({});

  useEffect(() => {
    try {
      setVotes(JSON.parse(localStorage.getItem(STORE) || "{}"));
    } catch {
      /* ignore */
    }
    fetch("/api/poll-vote")
      .then((r) => r.json())
      .then((d) => setResults(d.results || {}))
      .catch(() => {});
  }, []);

  function vote(pollId: string, optIdx: number) {
    if (votes[pollId] !== undefined) return;
    const next = { ...votes, [pollId]: optIdx };
    setVotes(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    fetch("/api/poll-vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId, optionIndex: optIdx }),
    }).catch(() => {});
  }

  const monthSet = new Set(thisMonthIds);
  // Preserve "most recent first" order for this month; everything else is the archive.
  const thisMonth = thisMonthIds.map((id) => POLLS.find((p) => p.id === id)).filter(Boolean) as Poll[];
  const archive = POLLS.filter((p) => !monthSet.has(p.id));

  function Card({ poll }: { poll: Poll }) {
    const myVote = votes[poll.id];
    const voted = myVote !== undefined;
    const insight = poll.kind === "insight";
    const live = results[poll.id] || {};
    const tally = tallyPoll(poll, live, myVote);
    const showResults = voted && tally.revealed;
    return (
      <div className="card flex flex-col p-5">
        <span className={`self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${insight ? "bg-navy text-amber-300" : "bg-sky-100 text-brand-blue"}`}>
          {insight ? "📊 The Real Talk" : "🎉 Sideline Life"}
        </span>
        <h3 className="mt-2 font-heading text-lg font-bold text-navy">
          <span className="mr-1.5">{poll.emoji}</span>
          {poll.question}
        </h3>
        <div className="mt-3 space-y-2">
          {poll.options.map((o, i) => {
            const pct = tally.options[i].pct;
            return (
              <button
                key={i}
                onClick={() => vote(poll.id, i)}
                disabled={voted}
                className={`relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  myVote === i ? "border-brand-sky" : "border-slate-200 hover:border-slate-300"
                } ${voted ? "cursor-default" : ""}`}
              >
                {showResults && (
                  <span className={`absolute inset-y-0 left-0 ${insight ? "bg-amber-50" : "bg-sky-50"}`} style={{ width: `${pct}%` }} aria-hidden />
                )}
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
        <p className="mt-3 text-xs text-slate-400">
          {!voted
            ? "Tap an answer to vote"
            : tally.revealed
              ? `${tally.realTotal.toLocaleString()} votes`
              : `Thanks! ${tally.realTotal} ${tally.realTotal === 1 ? "vote" : "votes"} so far — results show once ${POLL_REVEAL_THRESHOLD} parents weigh in`}
        </p>
      </div>
    );
  }

  return (
    <>
      <section>
        <h2 className="section-title">Parent Pulse</h2>
        <p className="mb-5 text-sm text-slate-500">This Month’s Polls — a new question featured every day.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          {thisMonth.map((p) => (
            <Card key={p.id} poll={p} />
          ))}
        </div>
      </section>

      {archive.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title">The Archive</h2>
          <p className="mb-5 text-sm text-slate-500">Every poll we’ve asked — vote anytime and see how families answered.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {archive.map((p) => (
              <Card key={p.id} poll={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
