import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import ClubCard from "@/components/ClubCard";
import SchoolCard from "@/components/SchoolCard";
import PollDeck from "@/components/PollDeck";
import NewsletterSignup from "@/components/NewsletterSignup";
import AdSlot from "@/components/AdSlot";
import HomeNews from "@/components/HomeNews";
import { getFeaturedClubs, getActiveTryouts, getFeaturedSchools, getRecentCommitments } from "@/lib/data";
import TryoutTicker from "@/components/TryoutTicker";
import DailyHub from "@/components/DailyHub";
import { getNews } from "@/lib/news";
import { RANKED_CLUBS } from "@/lib/rankings";
import { REGIONS } from "@/lib/regions";
import { CLUBS, COACHES } from "@/lib/seed";
import { SCHOOLS } from "@/lib/schools";

export const revalidate = 1800;

export default async function HomePage() {
  const featured = await getFeaturedClubs(6);
  const featuredSchools = getFeaturedSchools(3);
  const tryouts = getActiveTryouts(12);
  const news = (await getNews()).slice(0, 6);
  const topClubs = RANKED_CLUBS.slice(0, 5);

  // Region-filterable datasets for the daily hub (filtered client-side).
  const hubTryouts = getActiveTryouts(60);
  const hubCommits = getRecentCommitments(40);
  const hubRegions = REGIONS.map((r) => ({ key: r.key, name: r.name }));

  return (
    <>
      {/* TRYOUT ALERTS TICKER — sits directly below the nav; hidden when no upcoming tryouts */}
      <TryoutTicker tryouts={tryouts} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-grad text-white">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_80%_-10%,#fff_0,transparent_40%)]" />
        <div className="container-page relative grid items-center gap-10 py-12 sm:py-14 lg:grid-cols-[1fr_340px]">
          <div>
            <h1 className="font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-6xl">
              Find the right club.<br />
              <span className="text-brand-amber">Know the coach.</span> Skip the guesswork.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-200">
              Directories, real parent reviews, community rankings and the news that matters —
              for every Florida youth soccer family, from Miami to the Panhandle.
            </p>
            <div className="mt-6 max-w-2xl">
              <HeroSearch />
            </div>
            <div className="mt-6 flex flex-wrap gap-8">
              {[
                { n: `${CLUBS.length}`, l: "Clubs listed" },
                { n: `${SCHOOLS.length}`, l: "High schools" },
                { n: `${COACHES.length}`, l: "Coaches profiled" },
                { n: `${REGIONS.length}`, l: "Regions covered" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-heading text-3xl font-bold text-brand-amber">{s.n}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-300">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero sponsor unit — premium above-the-fold placement */}
          <div className="hidden lg:block">
            <AdSlot placement="home-banner" variant="sidebar" seed={4} />
          </div>
        </div>
      </section>

      {/* DAILY HUB — region-aware dashboard: tryouts (+alerts), commitments, movers */}
      <DailyHub tryouts={hubTryouts} commits={hubCommits} movers={RANKED_CLUBS} regions={hubRegions} />

      <div className="container-page py-14">
        {/* LATEST NEWS — featured + cards */}
        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="section-title">Latest News</h2>
            <Link href="/news" className="link-arrow">View all →</Link>
          </div>
          <HomeNews items={news} />
        </section>

        {/* TOP CLUBS + PARENT POLL */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold uppercase text-navy">Top Clubs</h3>
              <Link href="/rankings" className="link-arrow text-xs">Rankings →</Link>
            </div>
            <ol className="space-y-3">
              {topClubs.map((c) => (
                <li key={c.id}>
                  <Link href={c.href ?? "#"} className="flex items-center gap-3 hover:opacity-80">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-navy font-heading text-xs font-bold text-white">
                      {c.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading font-bold leading-tight text-navy">{c.name}</p>
                      <p className="truncate text-xs text-slate-500">{c.subtitle}</p>
                    </div>
                    <span className="font-heading text-sm font-bold text-brand-amber">{c.votes}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <PollDeck />
        </div>

        {/* SPONSOR BANNER */}
        <section className="mt-16">
          <AdSlot placement="home-banner" variant="banner" seed={3} />
        </section>

        {/* FEATURED CLUBS */}
        <section className="mt-16">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="section-title">Featured Clubs</h2>
              <p className="text-sm text-slate-500">Top-rated programs across the state</p>
            </div>
            <Link href="/clubs" className="link-arrow">All clubs →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </section>

        {/* FEATURED SCHOOLS */}
        <section className="mt-16">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="section-title">High School Soccer</h2>
              <p className="text-sm text-slate-500">Top FHSAA programs across Florida</p>
            </div>
            <Link href="/schools" className="link-arrow">All schools →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSchools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        </section>

        {/* REGIONS */}
        <section className="mt-16">
          <h2 className="section-title mb-5">Browse by Region</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REGIONS.map((r) => (
              <Link
                key={r.key}
                href={`/clubs?region=${r.key}`}
                className="card card-hover group flex items-center justify-between p-4"
              >
                <div>
                  <h3 className="font-heading text-lg font-bold text-navy group-hover:text-brand-sky">{r.name}</h3>
                  <p className="text-xs text-slate-500">{r.description}</p>
                </div>
                <svg className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-brand-sky" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* NEWSLETTER CTA */}
        <section className="mt-16 overflow-hidden rounded-2xl bg-hero-grad p-8 text-white sm:p-12">
          <div className="max-w-2xl">
            <span className="chip bg-white/10 text-amber-300 ring-1 ring-white/20">📬 The Newsletter</span>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight">
              SoccerDadHQ: The Sideline
            </h2>
            <p className="mt-2 text-slate-200">
              Tryout alerts, ranking shifts, recruiting news and the best reads — one email a week,
              tailored to your region. Free, always.
            </p>
            <div className="mt-6">
              <NewsletterSignup />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
