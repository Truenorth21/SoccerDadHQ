import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClubCard from "@/components/ClubCard";
import CoachCard from "@/components/CoachCard";
import AddListingCTA from "@/components/AddListingCTA";
import AdSlot from "@/components/AdSlot";
import { getClubs, getCoaches } from "@/lib/data";
import { regionsForState, type Region } from "@/lib/regions";
import { seoCopy } from "@/lib/seo";
import type { UsState } from "@/lib/states";
import { SITE_URL } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 *  Programmatic SEO landing pages for a state (or a region within it):
 *  /clubs/[state], /clubs/[state]/[region] and /coaches/[state].
 *  The full filterable directory stays at /clubs and /coaches; these
 *  pages are the indexable, linkable entry points for each place.
 * ------------------------------------------------------------------ */

function Hero({ title, subtitle, cta }: { title: string; subtitle: string; cta: { href: string; label: string } }) {
  return (
    <section className="border-b border-slate-200 bg-navy py-10 text-white">
      <div className="container-page flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-slate-300">{subtitle}</p>
        </div>
        <Link href={cta.href} className="btn-amber shrink-0 whitespace-nowrap">{cta.label}</Link>
      </div>
    </section>
  );
}

/** Links to the same state's other SEO pages — keeps the page cluster crawlable. */
export function StateCrossLinks({ state, current }: { state: UsState; current: "clubs" | "coaches" | "rankings" | "tryouts" }) {
  const links = [
    { key: "clubs", href: `/clubs/${state.slug}`, label: `${state.name} clubs` },
    { key: "coaches", href: `/coaches/${state.slug}`, label: `${state.name} coaches` },
    { key: "rankings", href: `/rankings/${state.slug}`, label: `${state.name} rankings` },
    { key: "tryouts", href: `/tryouts/${state.slug}`, label: `${state.name} tryouts` },
  ].filter((l) => l.key !== current);
  return (
    <nav aria-label={`More ${state.name} youth soccer`} className="mt-12 flex flex-wrap gap-2">
      {links.map((l) => (
        <Link key={l.key} href={l.href} className="chip-sky hover:underline">
          {l.label} →
        </Link>
      ))}
    </nav>
  );
}

function RegionChips({ state, active }: { state: UsState; active?: Region }) {
  const regions = regionsForState(state.code);
  if (!regions.length) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Regions:</span>
      <Link
        href={`/clubs/${state.slug}`}
        className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${!active ? "bg-brand-sky text-white ring-brand-sky" : "bg-white text-navy ring-slate-200 hover:ring-brand-sky"}`}
      >
        All {state.name}
      </Link>
      {regions.map((r) => (
        <Link
          key={r.key}
          href={`/clubs/${state.slug}/${r.slug}`}
          className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${active?.key === r.key ? "bg-brand-sky text-white ring-brand-sky" : "bg-white text-navy ring-slate-200 hover:ring-brand-sky"}`}
        >
          {r.name}
        </Link>
      ))}
    </div>
  );
}

export async function StateClubsLanding({ state, region }: { state: UsState; region?: Region }) {
  const clubs = await getClubs({ state: state.code, region: region?.key });
  const copy = region ? seoCopy.clubsRegion(state, region) : seoCopy.clubsState(state);
  const place = region ? `${region.name}, ${state.name}` : state.name;
  const directoryHref = `/clubs?state=${state.code}${region ? `&region=${region.key}` : ""}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy.title,
    url: `${SITE_URL}${copy.path}`,
    numberOfItems: clubs.length,
    itemListElement: clubs.slice(0, 50).map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/clubs/${c.slug}`,
      name: c.name,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { label: "Clubs", href: "/clubs" },
          { label: state.name, href: `/clubs/${state.slug}` },
          ...(region ? [{ label: region.name }] : []),
        ]}
      />
      <Hero
        title={copy.title}
        subtitle={`${clubs.length} club${clubs.length === 1 ? "" : "s"} listed in ${place}${region ? ` · ${region.description}` : ""}`}
        cta={{ href: "/submit?kind=club", label: "+ Add a club" }}
      />
      <div className="container-page py-8">
        <RegionChips state={state} active={region} />
        <div className="mb-6">
          <AdSlot placement="directory-sidebar" variant="leaderboard" seed={2} />
        </div>
        {clubs.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-heading text-xl font-bold text-navy">No {place} clubs listed yet</p>
            <p className="mt-1 text-slate-500">
              We&rsquo;re building out {state.name} now. Know a club that belongs here? Add it and we&rsquo;ll review it.
            </p>
            <div className="mt-6 text-left">
              <AddListingCTA kind="club" />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <Link href={directoryHref} className="link-arrow">Filter by league, age group &amp; ZIP →</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
            <AddListingCTA kind="club" className="mt-8" />
          </>
        )}
        <StateCrossLinks state={state} current="clubs" />
      </div>
    </>
  );
}

export async function StateCoachesLanding({ state }: { state: UsState }) {
  const coaches = await getCoaches({ state: state.code });
  const copy = seoCopy.coachesState(state);

  return (
    <>
      <Breadcrumbs items={[{ label: "Coaches", href: "/coaches" }, { label: state.name }]} />
      <Hero
        title={copy.title}
        subtitle={`${coaches.length} coach${coaches.length === 1 ? "" : "es"} in ${state.name} · directors, head coaches and private trainers, reviewed by parents`}
        cta={{ href: "/submit?kind=coach", label: "+ Add a coach" }}
      />
      <div className="container-page py-8">
        <div className="mb-6">
          <AdSlot placement="directory-sidebar" variant="leaderboard" seed={2} />
        </div>
        {coaches.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-heading text-xl font-bold text-navy">No {state.name} coaches listed yet</p>
            <p className="mt-1 text-slate-500">Know a great coach or trainer in {state.name}? Add them and we&rsquo;ll review it.</p>
            <div className="mt-6 text-left">
              <AddListingCTA kind="coach" />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <Link href={`/coaches?state=${state.code}`} className="link-arrow">Filter by region, age group &amp; private training →</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
            <AddListingCTA kind="coach" className="mt-8" />
          </>
        )}
        <StateCrossLinks state={state} current="coaches" />
      </div>
    </>
  );
}
