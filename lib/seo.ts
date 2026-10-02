import type { Metadata } from "next";
import type { UsState } from "./states";
import type { Region } from "./regions";
import { SITE_URL } from "./utils";

/* ------------------------------------------------------------------ *
 *  Titles + descriptions for the programmatic state / region SEO pages.
 *  One place so the H1s, <title>s and sitemap stay in sync.
 * ------------------------------------------------------------------ */

export const seoCopy = {
  clubsState: (s: UsState) => ({
    title: `Best Youth Soccer Clubs in ${s.name}`,
    description: `Compare the best youth soccer clubs in ${s.name} — ECNL, MLS NEXT, Girls Academy and competitive programs. Read parent reviews, check leagues and age groups, and find open tryouts.`,
    path: `/clubs/${s.slug}`,
  }),
  clubsRegion: (s: UsState, r: Region) => ({
    title: `Youth Soccer Clubs in ${r.name}, ${s.name}`,
    description: `Youth soccer clubs in ${r.name}, ${s.name}: ${r.description} Compare leagues, age groups and parent reviews, and find open tryouts near you.`,
    path: `/clubs/${s.slug}/${r.slug}`,
  }),
  coachesState: (s: UsState) => ({
    title: `Top Youth Soccer Coaches in ${s.name}`,
    description: `Find and review the top youth soccer coaches and private trainers in ${s.name}. See certifications, specialties, club affiliations and parent reviews.`,
    path: `/coaches/${s.slug}`,
  }),
  rankingsState: (s: UsState) => ({
    title: `${s.name} Youth Soccer Rankings`,
    description: `Community-voted ${s.name} youth soccer rankings for clubs and coaches. Vote monthly and see which programs families in ${s.name} recommend most.`,
    path: `/rankings/${s.slug}`,
  }),
  tryoutsState: (s: UsState) => ({
    title: `Youth Soccer Tryouts in ${s.name}`,
    description: `Upcoming youth soccer tryouts in ${s.name}. See which clubs have tryouts open, dates posted by the clubs themselves, and get tryout alerts by email.`,
    path: `/tryouts/${s.slug}`,
  }),
};

/** Build page Metadata (title, description, canonical, Open Graph) from SEO copy. */
export function seoMetadata(copy: { title: string; description: string; path: string }): Metadata {
  const url = `${SITE_URL}${copy.path}`;
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: url },
    openGraph: { title: copy.title, description: copy.description, url, type: "website" },
    twitter: { card: "summary_large_image", title: copy.title, description: copy.description },
  };
}
