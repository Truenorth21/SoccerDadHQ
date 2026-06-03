import { CLUBS, COACHES } from "./seed";
import { SCHOOLS } from "./schools";
import { LISTINGS, KIND_CONFIG, type ListingKind } from "./listings";
import type { RankingItem } from "./types";

const trends: RankingItem["trend"][] = ["up", "down", "flat", "new", "up", "flat", "down", "up"];

function baseVotes(seed: number, rank: number): number {
  // higher ranks get more votes, with deterministic spread
  return Math.max(8, Math.round(420 - rank * 11 + ((seed * 37) % 60)));
}

// Rank the FULL list — the UI shows the top 10 with a "show all" toggle.
function rankList<T>(
  items: T[],
  toItem: (t: T, rank: number) => Omit<RankingItem, "rank" | "votes" | "trend">
): RankingItem[] {
  return items.map((t, i) => {
    const rank = i + 1;
    const partial = toItem(t, rank);
    return {
      ...partial,
      rank,
      votes: baseVotes(i + 7, rank),
      trend: trends[i % trends.length],
    };
  });
}

// Clubs ranked by rating
export const RANKED_CLUBS: RankingItem[] = rankList(
  [...CLUBS].sort((a, b) => b.rating - a.rating || b.review_count - a.review_count),
  (c) => ({
    id: c.id,
    name: c.name,
    subtitle: `${c.city}, FL • ${c.leagues[0]}`,
    region: c.region,
    league: c.leagues[0],
    href: `/clubs/${c.slug}`,
    color: c.logo_color,
  })
);

// School teams ranked per gender + level — each team votes separately, so a
// school can appear as e.g. "Boys Varsity" and "Girls JV" as distinct entries.
export const RANKED_SCHOOLS: RankingItem[] = (() => {
  const sorted = [...SCHOOLS].sort((a, b) => b.state_titles - a.state_titles || b.rating - a.rating);
  const out: RankingItem[] = [];
  let i = 0;
  for (const s of sorted) {
    // Most programs field a feeder middle-school team only at private/large schools.
    const levels = s.type === "Private" || s.enrollment > 2000 ? ["Varsity", "JV", "Middle School"] : ["Varsity", "JV"];
    for (const gender of s.programs) {
      for (const level of levels) {
        const rank = ++i;
        out.push({
          id: `${s.id}-${gender.toLowerCase()}-${level.toLowerCase().replace(/\s+/g, "-")}`,
          rank,
          name: s.name,
          subtitle: `${gender} ${level} • ${s.mascot} • ${s.city}, FL • ${s.fhsaa_class}`,
          region: s.region,
          href: `/schools/${s.slug}`,
          color: s.logo_color,
          gender,
          level,
          cls: s.fhsaa_class,
          votes: baseVotes(i + 5, rank),
          trend: trends[i % trends.length],
        });
      }
    }
  }
  return out;
})();

export const RANKED_COACHES: RankingItem[] = rankList(
  [...COACHES].sort((a, b) => b.rating - a.rating || b.review_count - a.review_count),
  (c) => ({
    id: c.id,
    name: c.name,
    subtitle: `${c.title} • ${c.club_name}`,
    region: c.region,
    href: `/coaches/${c.slug}`,
    color: c.photo_color,
  })
);

// Rankings for the listing kinds are derived from the listings so each entry
// links to a real, claimable profile.
function listingRank(kind: ListingKind): RankingItem[] {
  return LISTINGS.filter((l) => l.kind === kind)
    .sort((a, b) => b.rating - a.rating || b.review_count - a.review_count)
    .map((l, i) => ({
      id: l.id,
      rank: i + 1,
      name: l.name,
      subtitle: `${l.tags.join(" · ")} • ${l.city}, FL`,
      region: l.region,
      votes: baseVotes(i + 3, i + 1),
      trend: trends[i % trends.length],
      color: l.color,
      href: `${KIND_CONFIG[kind].path}/${l.slug}`,
    }));
}

export const RANKINGS: Record<string, RankingItem[]> = {
  clubs: RANKED_CLUBS,
  schools: RANKED_SCHOOLS,
  coaches: RANKED_COACHES,
  "training-centers": listingRank("training-center"),
  facilities: listingRank("facility"),
  tournaments: listingRank("tournament"),
  camps: listingRank("camp"),
};
