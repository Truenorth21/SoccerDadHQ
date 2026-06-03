import type { Metadata } from "next";
import NewsFeed from "@/components/NewsFeed";
import AdSlot from "@/components/AdSlot";
import { getNews } from "@/lib/news";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Florida Youth Soccer News",
  description:
    "The latest ECNL, MLS NEXT, Girls Academy, recruiting and tournament news for Florida youth soccer, aggregated from SoccerWire, TopDrawerSoccer and more.",
};

export default async function NewsPage() {
  const news = await getNews();

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Soccer News
          </h1>
          <p className="mt-1 max-w-2xl text-slate-300">
            ECNL, MLS NEXT, Girls Academy, recruiting and tournaments — aggregated from across the
            web and linked back to the original source.
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="mb-6">
          <AdSlot placement="news-infeed" variant="leaderboard" seed={2} />
        </div>
        <NewsFeed items={news} />
        <p className="mt-8 text-center text-xs text-slate-400">
          Headlines are aggregated from public RSS feeds (SoccerWire, TopDrawerSoccer, MLSsoccer.com,
          U.S. Soccer and others). All articles link to and remain the property of their original
          publishers.
        </p>
      </div>
    </>
  );
}
