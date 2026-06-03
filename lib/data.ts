import { CLUBS, COACHES, TRYOUTS } from "./seed";
import { SCHOOLS } from "./schools";
import { COMMITMENTS } from "./commitments";
import type { Club, Coach, School, Tryout, Review, Commitment } from "./types";
import type { RegionKey } from "./regions";
import { createClient } from "./supabase/server";

/* ------------------------------------------------------------------ *
 *  Directory reference data (clubs, coaches, tryouts) ships embedded
 *  in the app so the site is fully functional with zero config.
 *  User-generated content (reviews, votes, newsletter) lives in
 *  Supabase and is merged in when configured.
 * ------------------------------------------------------------------ */

export interface ClubFilters {
  q?: string;
  region?: string;
  league?: string;
  gender?: string;
  age?: string;
  zip?: string;
  radius?: string; // miles
  tryouts?: string; // "1" to filter open
  sort?: string;
}

/* Haversine distance in miles between two lat/lng points. */
function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* Rough ZIP → lat/lng for the radius filter. Matches against known club &
 *  school ZIPs (exact, then 3-digit sectional-center prefix), else null. */
function zipCenter(zip: string): { lat: number; lng: number } | null {
  const places: { zip: string; lat: number; lng: number }[] = [...CLUBS, ...SCHOOLS];
  const exact = places.find((p) => p.zip === zip);
  if (exact) return { lat: exact.lat, lng: exact.lng };
  const prefix = zip.slice(0, 3);
  const near = places.find((p) => p.zip.slice(0, 3) === prefix);
  if (near) return { lat: near.lat, lng: near.lng };
  return null;
}

export function getClubs(filters: ClubFilters = {}): (Club & { distance?: number })[] {
  let results: (Club & { distance?: number })[] = [...CLUBS];

  if (filters.q) {
    const q = filters.q.toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.leagues.some((l) => l.toLowerCase().includes(q))
    );
  }
  if (filters.region) results = results.filter((c) => c.region === filters.region);
  if (filters.league) results = results.filter((c) => c.leagues.includes(filters.league!));
  if (filters.gender) results = results.filter((c) => c.genders.includes(filters.gender!));
  if (filters.age) results = results.filter((c) => c.age_groups.includes(filters.age!));
  if (filters.tryouts === "1") results = results.filter((c) => c.tryouts_open);

  if (filters.zip && /^\d{5}$/.test(filters.zip)) {
    const center = zipCenter(filters.zip);
    if (center) {
      const radius = filters.radius ? parseInt(filters.radius, 10) : 50;
      results = results
        .map((c) => ({
          ...c,
          distance: distanceMiles(center.lat, center.lng, c.lat, c.lng),
        }))
        .filter((c) => (c.distance ?? Infinity) <= radius);
    }
  }

  switch (filters.sort) {
    case "rating":
      results.sort((a, b) => b.rating - a.rating);
      break;
    case "reviews":
      results.sort((a, b) => b.review_count - a.review_count);
      break;
    case "distance":
      if (filters.zip) results.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      break;
    case "name":
    default:
      if (filters.sort !== "distance")
        results.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Featured (paid) listings pinned to the top — except when sorting by distance.
  if (filters.sort !== "distance") {
    results = [...results.filter((c) => c.featured), ...results.filter((c) => !c.featured)];
  }

  return results;
}

export function getClubBySlug(slug: string): Club | undefined {
  return CLUBS.find((c) => c.slug === slug);
}

export function getNearbyClubs(club: Club, limit = 4): (Club & { distance: number })[] {
  return CLUBS.filter((c) => c.id !== club.id)
    .map((c) => ({ ...c, distance: distanceMiles(club.lat, club.lng, c.lat, c.lng) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

export interface CoachFilters {
  q?: string;
  region?: string;
  gender?: string;
  age?: string;
  private?: string;
}

export function getCoaches(filters: CoachFilters = {}): Coach[] {
  let results = [...COACHES];
  if (filters.q) {
    const q = filters.q.toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.club_name ?? "").toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.specialties.some((s) => s.toLowerCase().includes(q))
    );
  }
  if (filters.region) results = results.filter((c) => c.region === filters.region);
  if (filters.gender) results = results.filter((c) => c.genders.includes(filters.gender!));
  if (filters.age) results = results.filter((c) => c.age_groups.includes(filters.age!));
  if (filters.private === "1") results = results.filter((c) => c.private_training);
  results.sort((a, b) => b.rating - a.rating);
  return [...results.filter((c) => c.featured), ...results.filter((c) => !c.featured)];
}

export function getCoachBySlug(slug: string): Coach | undefined {
  return COACHES.find((c) => c.slug === slug);
}

export function getCoachesForClub(clubId: string): Coach[] {
  return COACHES.filter((c) => c.club_id === clubId);
}

export function getTryouts(limit?: number): Tryout[] {
  const sorted = [...TRYOUTS].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  return limit ? sorted.slice(0, limit) : sorted;
}

/** Only tryouts whose date is still in the future, sorted soonest-first.
 *  Drives the homepage ticker — when this is empty the ticker is hidden. */
export function getActiveTryouts(limit?: number): Tryout[] {
  const now = Date.now();
  const upcoming = [...TRYOUTS]
    .filter((t) => +new Date(t.date) > now)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  return limit ? upcoming.slice(0, limit) : upcoming;
}

export function getFeaturedClubs(limit = 6): Club[] {
  return [...CLUBS].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

/* ------------------------------------------------------------------ *
 *  Schools (FHSAA high school soccer programs)
 * ------------------------------------------------------------------ */
export interface SchoolFilters {
  q?: string;
  region?: string;
  type?: string;
  cls?: string;
  gender?: string;
  zip?: string;
  radius?: string;
  sort?: string;
}

export function getSchools(filters: SchoolFilters = {}): (School & { distance?: number })[] {
  let results: (School & { distance?: number })[] = [...SCHOOLS];
  if (filters.q) {
    const q = filters.q.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.mascot.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }
  if (filters.region) results = results.filter((s) => s.region === filters.region);
  if (filters.type) results = results.filter((s) => s.type === filters.type);
  if (filters.cls) results = results.filter((s) => s.fhsaa_class === filters.cls);
  if (filters.gender) results = results.filter((s) => s.programs.includes(filters.gender!));

  if (filters.zip && /^\d{5}$/.test(filters.zip)) {
    const center = zipCenter(filters.zip);
    if (center) {
      const radius = filters.radius ? parseInt(filters.radius, 10) : 50;
      results = results
        .map((s) => ({ ...s, distance: distanceMiles(center.lat, center.lng, s.lat, s.lng) }))
        .filter((s) => (s.distance ?? Infinity) <= radius);
    }
  }

  switch (filters.sort) {
    case "rating":
      results.sort((a, b) => b.rating - a.rating);
      break;
    case "titles":
      results.sort((a, b) => b.state_titles - a.state_titles || b.rating - a.rating);
      break;
    case "reviews":
      results.sort((a, b) => b.review_count - a.review_count);
      break;
    case "distance":
      if (filters.zip) results.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      break;
    case "name":
    default:
      if (filters.sort !== "distance") results.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (filters.sort !== "distance") {
    results = [...results.filter((s) => s.featured), ...results.filter((s) => !s.featured)];
  }
  return results;
}

export function getSchoolBySlug(slug: string): School | undefined {
  return SCHOOLS.find((s) => s.slug === slug);
}

export function getNearbySchools(school: School, limit = 4): (School & { distance: number })[] {
  return SCHOOLS.filter((s) => s.id !== school.id)
    .map((s) => ({ ...s, distance: distanceMiles(school.lat, school.lng, s.lat, s.lng) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

export function getFeaturedSchools(limit = 6): School[] {
  return [...SCHOOLS].sort((a, b) => b.state_titles - a.state_titles || b.rating - a.rating).slice(0, limit);
}

/* ------------------------------------------------------------------ *
 *  Commitments (paid-profile showcase + public tracker)
 * ------------------------------------------------------------------ */
export interface CommitmentFilters {
  q?: string;
  region?: string;
  gender?: string;
  year?: string;
  dest?: string; // College | Pro | National Team
}

export function getCommitments(filters: CommitmentFilters = {}): Commitment[] {
  let results = [...COMMITMENTS];
  if (filters.q) {
    const q = filters.q.toLowerCase();
    results = results.filter(
      (c) =>
        c.player_name.toLowerCase().includes(q) ||
        c.destination.toLowerCase().includes(q) ||
        (c.club_name ?? "").toLowerCase().includes(q) ||
        (c.school_name ?? "").toLowerCase().includes(q)
    );
  }
  if (filters.region) results = results.filter((c) => c.region === filters.region);
  if (filters.gender) results = results.filter((c) => c.gender === filters.gender);
  if (filters.year) results = results.filter((c) => String(c.grad_year) === filters.year);
  if (filters.dest) results = results.filter((c) => c.dest_type === filters.dest);
  return results;
}

export function getCommitmentsForClub(clubId: string): Commitment[] {
  return COMMITMENTS.filter((c) => c.club_id === clubId);
}

export function getCommitmentsForSchool(schoolId: string): Commitment[] {
  return COMMITMENTS.filter((c) => c.school_id === schoolId);
}

export function getRecentCommitments(limit = 8): Commitment[] {
  return COMMITMENTS.slice(0, limit);
}

/* ------------------------------------------------------------------ *
 *  Supabase-backed reviews merged in on profile pages.
 * ------------------------------------------------------------------ */
/** Live community vote counts for the current month, keyed by item id.
 *  Empty when Supabase isn't configured (board falls back to seed baseline). */
export async function getVoteTallies(): Promise<Record<string, number>> {
  const supabase = createClient();
  if (!supabase) return {};
  const period = new Date().toISOString().slice(0, 7);
  try {
    const { data, error } = await supabase
      .from("vote_tallies")
      .select("item_id, votes, period")
      .eq("period", period);
    if (error || !data) return {};
    const map: Record<string, number> = {};
    for (const row of data as { item_id: string; votes: number }[]) {
      map[row.item_id] = Number(row.votes);
    }
    return map;
  } catch {
    return {};
  }
}

/** Most recent end-of-month standings, keyed by item id → its rank that month.
 *  Drives real trend arrows. Empty (and hasSnapshot=false) until a snapshot exists. */
export async function getLatestSnapshotRanks(): Promise<{
  ranks: Record<string, number>;
  hasSnapshot: boolean;
}> {
  const supabase = createClient();
  if (!supabase) return { ranks: {}, hasSnapshot: false };
  try {
    const { data, error } = await supabase
      .from("ranking_snapshots")
      .select("item_id, rank, period")
      .order("period", { ascending: false });
    const rows = (data ?? []) as { item_id: string; rank: number; period: string }[];
    if (error || rows.length === 0) return { ranks: {}, hasSnapshot: false };
    const latestPeriod = rows[0].period;
    const ranks: Record<string, number> = {};
    for (const row of rows) {
      if (row.period === latestPeriod) ranks[row.item_id] = row.rank;
    }
    return { ranks, hasSnapshot: true };
  } catch {
    return { ranks: {}, hasSnapshot: false };
  }
}

export async function getSupabaseReviews(
  subjectType: string,
  subjectId: string
): Promise<Review[]> {
  const supabase = createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("subject_type", subjectType)
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    type ReviewRow = {
      id: string;
      author_name?: string;
      relationship?: string;
      overall_rating: number;
      scores: Review["scores"];
      title: string;
      body: string;
      created_at: string;
    };
    return (data as ReviewRow[]).map((row) => ({
      id: row.id,
      author: row.author_name ?? "Anonymous",
      relationship: row.relationship ?? undefined,
      rating: row.overall_rating,
      scores: row.scores,
      title: row.title,
      body: row.body,
      created_at: row.created_at,
    }));
  } catch {
    return [];
  }
}
