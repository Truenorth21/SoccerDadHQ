import type { Metadata } from "next";
import Link from "next/link";
import CommitmentTracker from "@/components/CommitmentTracker";
import AdSlot from "@/components/AdSlot";
import ShareButtons from "@/components/ShareButtons";
import { getCommitments } from "@/lib/data";

export const metadata: Metadata = {
  title: "Florida Soccer Commitment Tracker — College, Pro & National Team",
  description:
    "Track college, pro and national-team commitments from Florida youth soccer clubs and high schools. See where players are going and which programs produce them.",
};

export default function CommitmentsPage() {
  const commitments = getCommitments();

  return (
    <>
      <section className="bg-hero-grad text-white">
        <div className="container-page py-12 sm:py-16">
          <span className="chip bg-white/10 text-amber-300 ring-1 ring-white/20">⚽ Where Florida players go</span>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl">
            Commitment Tracker
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-200">
            College, pro and national-team commitments announced by Florida clubs and high schools — the
            track record that shows which programs develop players to the next level.
          </p>
          <div className="mt-5">
            <ShareButtons path="/commitments" title="Florida Soccer Commitment Tracker — SoccerDadHQ" />
          </div>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="mb-6">
          <AdSlot placement="rankings-sidebar" variant="leaderboard" seed={6} />
        </div>
        <CommitmentTracker data={commitments} />

        <div className="mt-12 rounded-2xl bg-navy p-8 text-center text-white sm:p-10">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-tight">Is your club or school placing players?</h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-300">
            Announcing commitments is a Claim &amp; Featured profile benefit — showcase your college, pro and
            national-team placements right on your profile and in this tracker.
          </p>
          <Link href="/advertise#tiers" className="btn-amber mt-5">See profile plans</Link>
        </div>
      </div>
    </>
  );
}
