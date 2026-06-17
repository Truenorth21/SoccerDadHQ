import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import ClubCard from "@/components/ClubCard";
import SchoolCard from "@/components/SchoolCard";
import PollDeck from "@/components/PollDeck";
import NewsletterSignup from "@/components/NewsletterSignup";
import AdSlot from "@/components/AdSlot";
import HomeNews from "@/components/HomeNews";
import { getFeaturedClubs, getActiveTryouts, getFeaturedSchools, getRecentCommitments, getLatestSnapshotRanksPublic, loadClubs, loadSchools, loadCoaches } from "@/lib/data";
import TryoutTicker from "@/components/TryoutTicker";
import SidelineToday from "@/components/SidelineToday";
import { getNews } from "@/lib/news";
import { getRankings } from "@/lib/rankings";
import { REGIONS } from "@/lib/regions";
import type { RankingItem } from "@/lib/types";

export const revalidate = 1800;

export default async function HomePage() {
  const featured = await getFeaturedClubs(6);
  const featuredSchools = await getFeaturedSchools(3);
  // Real, live counts (seed + imported) so the hero stats match the directories.
  const [clubCount, schoolCount, coachCount] = await Promise.all([
    loadClubs().then((a) => a.length),
    loadSchools().then((a) => a.length),
    loadCoaches().then((a) => a.length),
  ]);
  const tryouts = await getActiveTryouts(12);
  const news = (await getNews()).slice(0, 7);
  const rankings = await getRankings();
  // Real trend vs. last month's final standings → powers the "Movers" rail.
  const { ranks: prevRanks, hasSnapshot } = await getLatestSnapshotRanksPublic();
  const rankedClubs = rankings.clubs.map((c) => {
    if (!hasSnapshot) return c;
    const prev = prevRanks[c.id];
    const trend: RankingItem["trend"] =
      prev === undefined ? "new" : c.rank < prev ? "up" : c.rank > prev ? "down" : "flat";
    return { ...c, trend };
  });
  const topClubs = rankedClubs.slice(0, 5);

  // Data for the "Sideline Today" daily snapshot rail.
  const hubTryouts = await getActiveTryouts(60);
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
                { n: `${clubCount}`, l: "Clubs listed" },
                { n: `${schoolCount}`, l: "High schools" },
                { n: `${coachCount}`, l: "Coaches profiled" },
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

      <div className="container-page py-14">
        {/* TODAY ZONE — daily-refresh hook: dated "Sideline Today" rail beside the news */}
        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="section-title">Today on SoccerDadHQ</h2>
            <Link href="/news" className="link-arrow">All news →</Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <SidelineToday tryouts={hubTryouts} commits={hubCommits} movers={rankedClubs} regions={hubRegions} />
            </div>
            <div className="lg:col-span-2">
              <HomeNews items={news} />
            </div>
          </div>
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
                    <span className="font-heading text-sm font-bold text-brand-amber">
                      {c.votes > 0 ? `${c.votes} 👍` : c.rating ? `${c.rating.toFixed(1)}★` : "—"}
                    </span>
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
              <h2 className="section-title">Club Spotlight</h2>
              <p className="text-sm text-slate-500">Editorial picks from across the state</p>
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

        {/* EXPLORE ALSO — surfaces the secondary directories (SEO + discovery) */}
        <section className="mt-16">
          <h2 className="section-title mb-5">Explore More</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/training-centers", label: "Training Centers", blurb: "Private & small-group skills academies", icon: "⚽" },
              { href: "/facilities", label: "Facilities", blurb: "Fields, complexes & indoor arenas", icon: "🏟️" },
              { href: "/tournaments", label: "Tournaments", blurb: "Showcases, cups & college events", icon: "🏆" },
              { href: "/camps", label: "Camps", blurb: "Day, residential & ID camps", icon: "🏕️" },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="card card-hover group flex items-start gap-3 p-4">
                <span className="text-2xl" aria-hidden>{c.icon}</span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-navy group-hover:text-brand-sky">{c.label}</h3>
                  <p className="text-xs text-slate-500">{c.blurb}</p>
                </div>
              </Link>
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
