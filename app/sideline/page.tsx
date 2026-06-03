import type { Metadata } from "next";
import PollDeck from "@/components/PollDeck";
import NewsletterSignup from "@/components/NewsletterSignup";
import SoccerParentBingo from "@/components/SoccerParentBingo";

export const metadata: Metadata = {
  title: "Sideline Life — Polls for Soccer Parents",
  description:
    "Florida soccer parents weigh in: fun sideline polls mixed with the serious questions — what matters most, the real cost, what parents value. Vote, share, and see how the community answers.",
};

export default function SidelinePage() {
  return (
    <>
      <section className="bg-hero-grad text-white">
        <div className="container-page py-12 sm:py-16">
          <span className="chip bg-white/10 text-amber-300 ring-1 ring-white/20">🎉 For the parents</span>
          <h1 className="mt-4 font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl">
            Sideline Life
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-200">
            The 7 AM wake-ups and orange slices — plus the real questions: what matters most, what it costs,
            what parents value. A mix of fun and serious. Vote, share, and see how the community answers.
          </p>
        </div>
      </section>

      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <PollDeck />
          </div>

          <div className="space-y-8">
            <SoccerParentBingo />
            <div className="overflow-hidden rounded-2xl bg-navy p-6 text-white sm:p-8">
              <h2 className="font-heading text-2xl font-bold uppercase tracking-tight">Never miss the fun</h2>
              <p className="mt-1 text-slate-300">
                Get the weekly Sideline — a new fun poll, tryout alerts and the news that matters, in one email.
              </p>
              <div className="mt-4">
                <NewsletterSignup />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
