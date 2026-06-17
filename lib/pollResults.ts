import { POLLS, INSIGHT_POLLS, FUN_POLLS, insightOfTheWeekIndex, pollOfTheWeekIndex, POLL_REVEAL_THRESHOLD, type Poll } from "./funPolls";
import { publicClient } from "./supabase/public";

export interface OptionResult {
  label: string;
  votes: number;
  pct: number;
}

export interface PollResult {
  poll: Poll;
  total: number; // total counted (real, or base+real when blended)
  realTotal: number; // real (Supabase) votes only — what the admin cares about
  revealed: boolean; // realTotal >= POLL_REVEAL_THRESHOLD (safe to show percentages)
  options: OptionResult[];
  topIndex: number;
}

// Loose shape so callers can pass either the service client or the public one
// without fighting the Postgrest builder's exact return types.
/* eslint-disable @typescript-eslint/no-explicit-any */
type SupaLike = { from: (table: string) => any } | null;

/** Pulls vote tallies from the poll_results view → { [pollId]: { [optionIndex]: votes } }. */
async function fetchTallies(client?: SupaLike): Promise<Record<string, Record<number, number>>> {
  const supabase = client ?? publicClient();
  if (!supabase) return {};
  const { data, error } = await supabase.from("poll_results").select("poll_id, option_index, votes");
  if (error || !data) return {};
  const map: Record<string, Record<number, number>> = {};
  for (const r of data as { poll_id: string; option_index: number; votes: number }[]) {
    (map[r.poll_id] ||= {})[r.option_index] = r.votes;
  }
  return map;
}

/** Combine a poll's seeded base with live votes (or just live, when includeBase=false). */
function blend(poll: Poll, live: Record<number, number>, includeBase: boolean): PollResult {
  const realTotal = poll.options.reduce((a, _o, i) => a + (live[i] || 0), 0);
  const counts = poll.options.map((o, i) => (includeBase ? o.base : 0) + (live[i] || 0));
  const total = counts.reduce((a, c) => a + c, 0);
  let topIndex = 0;
  counts.forEach((c, i) => {
    if (c > counts[topIndex]) topIndex = i;
  });
  const options = poll.options.map((o, i) => ({
    label: o.label,
    votes: counts[i],
    pct: total > 0 ? Math.round((counts[i] / total) * 100) : 0,
  }));
  return { poll, total, realTotal, revealed: realTotal >= POLL_REVEAL_THRESHOLD, options, topIndex };
}

/** Insight poll of the week, blended (seed + real) — credible numbers for the
 *  public newsletter even at low real volume. */
export async function getInsightOfTheWeek(client?: SupaLike): Promise<PollResult> {
  const poll = INSIGHT_POLLS[insightOfTheWeekIndex()];
  const tallies = await fetchTallies(client);
  return blend(poll, tallies[poll.id] || {}, false);
}

/** Fun poll of the week, blended (seed + real) — gives the newsletter's Sideline
 *  Life section credible result bars instead of a bare option list. */
export async function getFunPollOfTheWeek(client?: SupaLike): Promise<PollResult> {
  const poll = FUN_POLLS[pollOfTheWeekIndex()];
  const tallies = await fetchTallies(client);
  return blend(poll, tallies[poll.id] || {}, false);
}

/** Real-vote results for every poll (no seed) — for the admin Poll Pulse panel. */
export async function getRealPollResults(client?: SupaLike): Promise<PollResult[]> {
  const tallies = await fetchTallies(client);
  return POLLS.map((p) => blend(p, tallies[p.id] || {}, false));
}
