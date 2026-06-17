import type { Metadata } from "next";
import RankingsBoard from "@/components/RankingsBoard";
import AdSlot from "@/components/AdSlot";
import { getRankings } from "@/lib/rankings";
import { getLatestSnapshotRanks } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { RankingItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Florida Youth Soccer Community Rankings",
  description:
    "Community-voted rankings of the best Florida youth soccer clubs, coaches, training centers, facilities, tournaments and camps. Vote monthly and see who's trending.",
};

export const dynamic = "force-dynamic";

const monthName = new Date().toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function RankingsPage() {
  // Live rankings from the real directory + this month's real votes (ordered votes → rating → name).
  const rankings = await getRankings();
  // Last month's final standings → real trend arrows.
  const { ranks: prevRanks, hasSnapshot } = await getLatestSnapshotRanks();

  const data: Record<string, RankingItem[]> = Object.fromEntries(
    Object.entries(rankings).map(([cat, items]) => [
      cat,
      items.map((it) => {
        if (!hasSnapshot) return it; // no history yet → no trend arrow
        const prev = prevRanks[it.id];
        let trend: RankingItem["trend"];
        if (prev === undefined) trend = "new";
        else if (it.rank < prev) trend = "up";
        else if (it.rank > prev) trend = "down";
        else trend = "flat";
        return { ...it, trend };
      }),
    ])
  );

  const supabase = createClient();
  const authed = supabase ? Boolean((await supabase.auth.getUser()).data.user) : false;

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Community Rankings
          </h1>
          <p className="mt-1 max-w-2xl text-slate-300">
            Ranked by community votes. Vote for your favorites — the board resets on the 1st of
            every month. Until votes come in, programs are listed by their parent-review rating.
            Current period: <strong className="text-brand-amber">{monthName}</strong>.
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="mb-6">
          <AdSlot placement="rankings-sidebar" variant="leaderboard" seed={2} />
        </div>
        <RankingsBoard data={data} authed={authed} supabaseConfigured={isSupabaseConfigured} period={monthName} />

        {/* Methodology */}
        <section className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <h2 className="mb-2 font-heading text-xl font-bold uppercase text-navy">How rankings work</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><span className="text-brand-sky">①</span> Each entry is ranked by the number of community votes it receives in the current month.</li>
              <li className="flex gap-2"><span className="text-brand-sky">②</span> Before votes come in, entries are ordered by their parent-review rating — so the board is never empty or arbitrary.</li>
              <li className="flex gap-2"><span className="text-brand-sky">③</span> Registered users get one vote per entry, per category, per month to keep things fair.</li>
              <li className="flex gap-2"><span className="text-brand-sky">④</span> Trend arrows compare an entry's current position to last month's final standing. Votes reset on the 1st.</li>
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="mb-2 font-heading text-xl font-bold uppercase text-navy">A few ground rules</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><span className="text-brand-amber">•</span> Rankings reflect <strong>community sentiment</strong>, not on-field results or league standings.</li>
              <li className="flex gap-2"><span className="text-brand-amber">•</span> They're a starting point for your research — always pair them with reviews and a club visit.</li>
              <li className="flex gap-2"><span className="text-brand-amber">•</span> Suspicious voting patterns are filtered to protect the integrity of the board.</li>
              <li className="flex gap-2"><span className="text-brand-amber">•</span> Filter by region and league to see who leads in your specific corner of Florida.</li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
