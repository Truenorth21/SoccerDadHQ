import type { Metadata } from "next";
import PollsHub from "@/components/PollsHub";
import { POLLS } from "@/lib/funPolls";

export const metadata: Metadata = {
  title: "Florida Soccer Parent Polls & Results — Parent Pulse",
  description:
    "Vote in every SoccerDadHQ poll and see how Florida youth soccer families answered — from sideline life to the serious questions about club costs, coaching and the recruiting grind.",
};

// Per-request so "this month so far" is always current (the poll-of-the-day rotates daily).
export const dynamic = "force-dynamic";

/** The polls featured as poll-of-the-day from the 1st of this month through today,
 *  most-recent first, de-duplicated. Mirrors pollOfTheDayIndex()'s UTC-day math. */
function pollIdsThisMonth(): string[] {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const today = now.getUTCDate();
  const ids: string[] = [];
  const seen = new Set<string>();
  for (let day = today; day >= 1; day--) {
    const dayNum = Math.floor(Date.UTC(y, m, day) / 86400000);
    const idx = ((dayNum % POLLS.length) + POLLS.length) % POLLS.length;
    const id = POLLS[idx].id;
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

export default function PollsPage() {
  const thisMonthIds = pollIdsThisMonth();
  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Polls &amp; Results</h1>
          <p className="mt-1 max-w-2xl text-slate-300">
            How Florida soccer families really answer — the fun ones and the ones that matter. A new poll is
            featured on the homepage each day; vote here anytime and watch the results.
          </p>
        </div>
      </section>
      <div className="container-page py-8">
        <PollsHub thisMonthIds={thisMonthIds} />
      </div>
    </>
  );
}
