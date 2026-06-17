import { loadListings, KIND_CONFIG, type ListingKind } from "./listings";
import { loadClubs, loadSchools, loadCoaches, getVoteTalliesPublic } from "./data";
import type { RankingItem, School } from "./types";

/* Community rankings are built from the live directory (DB + seed) and ordered by
 * REAL community votes for the current month. With no/few votes, the tiebreaker is
 * the program's parent-review rating — so the board is never empty or arbitrary,
 * and real votes take over the moment they come in. No fake/seeded vote counts. */

// School programs are split into team rankings (e.g. "Boys Varsity"); bigger/private
// schools also field a feeder middle-school team.
function schoolLevels(s: School): string[] {
  return s.type === "Private" || s.enrollment > 2000 ? ["Varsity", "JV", "Middle School"] : ["Varsity", "JV"];
}

// votes desc → rating desc → name (stable, deterministic, fair at 0 votes).
function orderByVotes(a: RankingItem, b: RankingItem): number {
  return b.votes - a.votes || (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name);
}

function ranked(items: RankingItem[]): RankingItem[] {
  return [...items].sort(orderByVotes).map((it, i) => ({ ...it, rank: i + 1 }));
}

/** All category rankings, live from the DB+seed directory with real monthly votes.
 *  Pass `talliesOverride` to rank against fresh (uncached) vote counts — e.g. right
 *  after a vote, so the voter sees their impact immediately. */
export async function getRankings(talliesOverride?: Record<string, number>): Promise<Record<string, RankingItem[]>> {
  const [clubs, schools, coaches, listings, tallies] = await Promise.all([
    loadClubs(),
    loadSchools(),
    loadCoaches(),
    loadListings(),
    talliesOverride ?? getVoteTalliesPublic(),
  ]);
  const v = (id: string) => tallies[id] ?? 0;

  const clubItems = ranked(
    clubs.map((c) => ({
      id: c.id,
      rank: 0,
      name: c.name,
      subtitle: `${c.city}, FL${c.leagues[0] ? ` • ${c.leagues[0]}` : ""}`,
      region: c.region,
      league: c.leagues[0],
      href: `/clubs/${c.slug}`,
      color: c.logo_color,
      votes: v(c.id),
      rating: c.rating,
      trend: "flat" as const,
    }))
  );

  const coachItems = ranked(
    coaches.map((c) => ({
      id: c.id,
      rank: 0,
      name: c.name,
      subtitle: `${c.title}${c.club_name ? ` • ${c.club_name}` : ""}`,
      region: c.region,
      href: `/coaches/${c.slug}`,
      color: c.photo_color,
      votes: v(c.id),
      rating: c.rating,
      trend: "flat" as const,
    }))
  );

  const schoolRaw: RankingItem[] = [];
  for (const s of schools) {
    for (const gender of s.programs) {
      for (const level of schoolLevels(s)) {
        const id = `${s.id}-${gender.toLowerCase()}-${level.toLowerCase().replace(/\s+/g, "-")}`;
        schoolRaw.push({
          id,
          rank: 0,
          name: s.name,
          subtitle: `${gender} ${level} • ${s.mascot}${s.fhsaa_class ? ` • ${s.fhsaa_class}` : ""} • ${s.city}, FL`,
          region: s.region,
          href: `/schools/${s.slug}`,
          color: s.logo_color,
          gender,
          level,
          cls: s.fhsaa_class,
          votes: v(id),
          rating: s.rating,
          trend: "flat" as const,
        });
      }
    }
  }
  const schoolItems = ranked(schoolRaw);

  const listingItems = (kind: ListingKind) =>
    ranked(
      listings.filter((l) => l.kind === kind).map((l) => ({
        id: l.id,
        rank: 0,
        name: l.name,
        subtitle: `${l.tags.join(" · ")} • ${l.city}, FL`,
        region: l.region,
        href: `${KIND_CONFIG[kind].path}/${l.slug}`,
        color: l.color,
        votes: v(l.id),
        rating: l.rating,
        trend: "flat" as const,
      }))
    );

  return {
    clubs: clubItems,
    schools: schoolItems,
    coaches: coachItems,
    "training-centers": listingItems("training-center"),
    facilities: listingItems("facility"),
    tournaments: listingItems("tournament"),
    camps: listingItems("camp"),
  };
}

export interface RankInfo {
  itemId: string; // the ranked item id (for schools, the chosen team's id)
  rank: number; // statewide rank within the category
  regionRank: number; // rank within the entity's own region
  regionTotal: number; // how many ranked entities share that region
  region: string;
  votes: number; // real recommendations behind it (0 = not yet ranked)
  programLabel?: string; // for schools: which team (e.g. "Boys Varsity")
}

/**
 * Find one entity's standing in a category. For schools (which split into team
 * rankings) pass `prefix: true` to match the school id across its programs and
 * return its best-ranked team. Returns null if the entity isn't in the category.
 */
export async function getRankFor(
  category: string,
  id: string,
  opts?: { prefix?: boolean; tallies?: Record<string, number> }
): Promise<RankInfo | null> {
  const all = await getRankings(opts?.tallies);
  const list = all[category];
  if (!list) return null;
  const matches = opts?.prefix
    ? list.filter((it) => it.id === id || it.id.startsWith(`${id}-`))
    : list.filter((it) => it.id === id);
  if (!matches.length) return null;
  // Best = most real votes; the list is already vote-sorted so ties resolve fairly.
  const item = matches.reduce((best, it) => ((it.votes ?? 0) > (best.votes ?? 0) ? it : best), matches[0]);
  const regionList = list.filter((it) => it.region === item.region);
  const regionRank = regionList.findIndex((it) => it.id === item.id) + 1;
  return {
    itemId: item.id,
    rank: item.rank,
    regionRank,
    regionTotal: regionList.length,
    region: item.region,
    votes: item.votes ?? 0,
    programLabel: item.gender && item.level ? `${item.gender} ${item.level}` : undefined,
  };
}
