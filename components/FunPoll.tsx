"use client";

import { useEffect, useState } from "react";
import { FUN_POLLS, pollOfTheDayIndex } from "@/lib/funPolls";
import { SITE_URL } from "@/lib/utils";

const STORE = "sdhq:funvotes";

export default function FunPoll() {
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  // Load votes + start on the poll of the day (client-only to avoid hydration mismatch).
  useEffect(() => {
    try {
      setVotes(JSON.parse(localStorage.getItem(STORE) || "{}"));
    } catch {
      /* ignore */
    }
    setIndex(pollOfTheDayIndex());
    setReady(true);
  }, []);

  const poll = FUN_POLLS[index];
  const myVote = votes[poll.id];
  const voted = myVote !== undefined;

  const total = poll.options.reduce((a, o) => a + o.base, 0) + (voted ? 1 : 0);

  function vote(i: number) {
    if (voted) return;
    const next = { ...votes, [poll.id]: i };
    setVotes(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const votedCount = Object.keys(votes).length;
  const [shared, setShared] = useState(false);

  async function share() {
    const url = `${SITE_URL}/sideline`;
    const text = voted
      ? `I'm a "${poll.options[myVote].label}" soccer parent — ${poll.question} ⚽ What about you?`
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
      <div className="flex items-center justify-between bg-hero-grad px-5 py-3 text-white">
        <span className="font-heading text-sm font-bold uppercase tracking-wide text-amber-300">🎉 Sideline Life</span>
        <span className="text-xs text-white/70">Poll {index + 1} of {FUN_POLLS.length}</span>
      </div>

      <div className="p-5">
        <h3 className="font-heading text-xl font-bold text-navy">
          <span className="mr-1.5">{poll.emoji}</span>
          {poll.question}
        </h3>

        <div className="mt-4 space-y-2.5">
          {poll.options.map((o, i) => {
            const count = o.base + (myVote === i ? 1 : 0);
            const pct = Math.round((count / total) * 100);
            return (
              <button
                key={i}
                onClick={() => vote(i)}
                disabled={voted}
                className={`relative w-full overflow-hidden rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  myVote === i ? "border-brand-sky" : "border-slate-200 hover:border-slate-300"
                } ${voted ? "cursor-default" : ""}`}
              >
                {voted && <span className="absolute inset-y-0 left-0 bg-sky-50" style={{ width: `${pct}%` }} aria-hidden />}
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
              onClick={share}
              className="font-heading text-sm font-semibold uppercase tracking-wide text-slate-500 hover:text-brand-blue"
            >
              {shared ? "Copied ✓" : "Share"}
            </button>
            <button
              onClick={() => setIndex((index + 1) % FUN_POLLS.length)}
              className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-sky hover:text-brand-blue"
            >
              {voted ? "Next poll →" : "Skip →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
