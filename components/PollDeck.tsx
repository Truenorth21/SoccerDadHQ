"use client";

import { useEffect, useState } from "react";
import { POLLS, pollOfTheDayIndex } from "@/lib/funPolls";
import { SITE_URL } from "@/lib/utils";

const STORE = "sdhq:pollvotes";

/** The unified Sideline poll deck — fun polls and serious "insight" polls mixed
 *  together. Navigate Back/Next, vote, and share. Votes persist anonymously so
 *  aggregate results become real data (newsletter, social, editorial). */
export default function PollDeck() {
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, Record<number, number>>>({});
  const [ready, setReady] = useState(false);
  const [shared, setShared] = useState(false);

  // Load my prior votes + start on the poll of the day (client-only to avoid hydration mismatch).
  useEffect(() => {
    try {
      setVotes(JSON.parse(localStorage.getItem(STORE) || "{}"));
    } catch {
      /* ignore */
    }
    setIndex(pollOfTheDayIndex());
    setReady(true);
    // Pull live tallies so result bars reflect real community votes when available.
    fetch("/api/poll-vote")
      .then((r) => r.json())
      .then((d) => setResults(d.results || {}))
      .catch(() => {});
  }, []);

  const poll = POLLS[index];
  const myVote = votes[poll.id];
  const voted = myVote !== undefined;
  const insight = poll.kind === "insight";

  const live = results[poll.id] || {};
  const countFor = (i: number) => poll.options[i].base + (live[i] || 0) + (myVote === i ? 1 : 0);
  const total = poll.options.reduce((a, _o, i) => a + countFor(i), 0);

  function vote(i: number) {
    if (voted) return;
    const next = { ...votes, [poll.id]: i };
    setVotes(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    // Fire-and-forget: record the vote for aggregate data.
    fetch("/api/poll-vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId: poll.id, optionIndex: i }),
    }).catch(() => {});
  }

  const go = (delta: number) => {
    setIndex((index + delta + POLLS.length) % POLLS.length);
    setShared(false);
  };

  const votedCount = Object.keys(votes).length;

  async function share() {
    const url = `${SITE_URL}/sideline`;
    const text = voted
      ? insight
        ? `My take: ${poll.question} → "${poll.options[myVote].label}". What's yours?`
        : `I'm a "${poll.options[myVote].label}" soccer parent — ${poll.question} ⚽ What about you?`
      : `${poll.question} ⚽ Vote on SoccerDadHQ:`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "SoccerDadHQ · Sideline Life", text, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    navigator.clipboard?.writeText(`${text} ${url}`).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    });
  }

  return (
    <div className="card overflow-hidden">
      <div className={`flex items-center justify-between px-5 py-3 text-white ${insight ? "bg-navy" : "bg-hero-grad"}`}>
        <span className="font-heading text-sm font-bold uppercase tracking-wide text-amber-300">
          {insight ? "📊 Parent Pulse" : "🎉 Sideline Life"}
        </span>
        <span className="text-xs text-white/70">
          Poll {index + 1} of {POLLS.length}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-heading text-xl font-bold text-navy">
          <span className="mr-1.5">{poll.emoji}</span>
          {poll.question}
        </h3>
        {insight && (
          <p className="mt-1 text-xs text-slate-400">Anonymous · results help shape our reporting on Florida soccer families.</p>
        )}

        <div className="mt-4 space-y-2.5">
          {poll.options.map((o, i) => {
            const pct = total > 0 ? Math.round((countFor(i) / total) * 100) : 0;
            return (
              <button
                key={i}
                onClick={() => vote(i)}
                disabled={voted}
                className={`relative w-full overflow-hidden rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  myVote === i ? "border-brand-sky" : "border-slate-200 hover:border-slate-300"
                } ${voted ? "cursor-default" : ""}`}
              >
                {voted && (
                  <span
                    className={`absolute inset-y-0 left-0 ${insight ? "bg-amber-50" : "bg-sky-50"}`}
                    style={{ width: `${pct}%` }}
                    aria-hidden
                  />
                )}
                <span className="relative flex items-center justify-between gap-2">
                  <span className="font-medium text-navy">
                    {myVote === i && <span className="mr-1 text-brand-sky">✓</span>}
                    {o.label}
                  </span>
                  {voted && <span className="font-heading font-bold text-brand-blue">{pct}%</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {ready && voted ? `${total.toLocaleString()} votes · ${votedCount} answered` : "Tap an answer to vote"}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => go(-1)}
              className="font-heading text-sm font-semibold uppercase tracking-wide text-slate-500 hover:text-brand-blue"
            >
              ← Back
            </button>
            <button
              onClick={share}
              className="font-heading text-sm font-semibold uppercase tracking-wide text-slate-500 hover:text-brand-blue"
            >
              {shared ? "Copied ✓" : "Share"}
            </button>
            <button
              onClick={() => go(1)}
              className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-sky hover:text-brand-blue"
            >
              {voted ? "Next →" : "Skip →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
