import { CLUBS, COACHES, TRYOUTS } from "./seed";
import { SCHOOLS } from "./schools";
import { COMMITMENTS } from "./commitments";
import type { Club, ClubReviewScores, Coach, School, SchoolReviewScores, Tryout, Review, Commitment } from "./types";
import type { RegionKey } from "./regions";
import { createClient } from "./supabase/server";
import { publicClient } from "./supabase/public";

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

const EMPTY_SCORES: ClubReviewScores = {
  coaching: 0, development: 0, organization: 0, culture: 0, value: 0, facilities: 0,
};

/* Map a Supabase `clubs` row to the Club shape the UI expects. Ratings/reviews
 *  start empty — a real new club's rating comes from real reviews over time. */
function dbRowToClub(r: Record<string, any>): Club {
  return {
    id: String(r.id),
    slug: r.slug,
    name: r.name,
    region: r.region as RegionKey,
    city: r.city,
    state: r.state ?? "FL",
    zip: r.zip ?? "",
    lat: r.lat ?? 0,
    lng: r.lng ?? 0,
    founded: r.founded ?? undefined,
    description: r.description ?? "",
    logo_color: r.logo_color ?? "#1a4fa0",
    website: r.website ?? undefined,
    email: r.email ?? undefined,
    phone: r.phone ?? undefined,
    instagram: r.instagram ?? undefined,
    facebook: r.facebook ?? undefined,
    twitter: r.twitter ?? undefined,
    leagues: r.leagues ?? [],
    age_groups: r.age_groups ?? [],
    genders: r.genders ?? [],
    gallery: [],
    tryouts_open: !!r.tryouts_open,
    tryout_note: r.tryout_note ?? undefined,
    claimed: !!r.claimed,
    verified: !!r.verified,
    featured: !!r.featured,
    plan: (r.plan ?? "free") as Club["plan"],
    rating: 0,
    review_count: 0,
    scores: { ...EMPTY_SCORES },
    reviews: [],
  };
}

/** All clubs = seeded clubs + real clubs from Supabase, merged by slug (DB wins).
 *  Falls back to seed when Supabase is unconfigured/empty. Cookieless read, so
 *  it stays safe for static/ISR pages. */
export async function loadClubs(): Promise<Club[]> {
  const supabase = publicClient();
  if (!supabase) return CLUBS;
  try {
    const { data, error } = await supabase.from("clubs").select("*");
    if (error || !data || data.length === 0) return CLUBS;
    const bySlug = new Map<string, Club>();
    for (const c of CLUBS) bySlug.set(c.slug, c);
    for (const r of data as Record<string, any>[]) bySlug.set(r.slug, dbRowToClub(r));
    return Array.from(bySlug.values());
  } catch {
    return CLUBS;
  }
}

export async function getClubs(filters: ClubFilters = {}): Promise<(Club & { distance?: number })[]> {
  let results: (Club & { distance?: number })[] = [...(await loadClubs())];

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

export async function getClubBySlug(slug: string): Promise<Club | undefined> {
  return (await loadClubs()).find((c) => c.slug === slug);
}

export async function getNearbyClubs(club: Club, limit = 4): Promise<(Club & { distance: number })[]> {
  return (await loadClubs())
    .filter((c) => c.id !== club.id)
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

export async function getFeaturedClubs(limit = 6): Promise<Club[]> {
  return [...(await loadClubs())].sort((a, b) => b.rating - a.rating).slice(0, limit);
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

const EMPTY_SCHOOL_SCORES: SchoolReviewScores = {
  coaching: 0, development: 0, culture: 0, competitiveness: 0, academics: 0, facilities: 0,
};

function dbRowToSchool(r: Record<string, any>): School {
  return {
    id: String(r.id),
    slug: r.slug,
    name: r.name,
    region: r.region as RegionKey,
    city: r.city,
    state: r.state ?? "FL",
    zip: r.zip ?? "",
    lat: r.lat ?? 0,
    lng: r.lng ?? 0,
    type: r.type === "Private" ? "Private" : "Public",
    fhsaa_class: r.fhsaa_class ?? "",
    district: r.district ?? "",
    mascot: r.mascot ?? "",
    colors: r.colors ?? [],
    logo_color: r.logo_color ?? "#1a4fa0",
    programs: r.programs ?? [],
    head_coach_boys: r.head_coach_boys ?? undefined,
    head_coach_girls: r.head_coach_girls ?? undefined,
    state_titles: r.state_titles ?? 0,
    last_title: r.last_title ?? undefined,
    district_titles: r.district_titles ?? 0,
    enrollment: r.enrollment ?? 0,
    description: r.description ?? "",
    website: r.website ?? undefined,
    featured: !!r.featured,
    plan: (r.plan ?? "free") as School["plan"],
    rating: 0,
    review_count: 0,
    scores: { ...EMPTY_SCHOOL_SCORES },
    reviews: [],
  };
}

/** Seeded schools + real schools from Supabase, merged by slug (DB wins). */
export async function loadSchools(): Promise<School[]> {
  const supabase = publicClient();
  if (!supabase) return SCHOOLS;
  try {
    const { data, error } = await supabase.from("schools").select("*");
    if (error || !data || data.length === 0) return SCHOOLS;
    const bySlug = new Map<string, School>();
    for (const s of SCHOOLS) bySlug.set(s.slug, s);
    for (const r of data as Record<string, any>[]) bySlug.set(r.slug, dbRowToSchool(r));
    return Array.from(bySlug.values());
  } catch {
    return SCHOOLS;
  }
}

export async function getSchools(filters: SchoolFilters = {}): Promise<(School & { distance?: number })[]> {
  let results: (School & { distance?: number })[] = [...(await loadSchools())];
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

export async function getSchoolBySlug(slug: string): Promise<School | undefined> {
  return (await loadSchools()).find((s) => s.slug === slug);
}

export async function getNearbySchools(school: School, limit = 4): Promise<(School & { distance: number })[]> {
  return (await loadSchools())
    .filter((s) => s.id !== school.id)
    .map((s) => ({ ...s, distance: distanceMiles(school.lat, school.lng, s.lat, s.lng) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

export async function getFeaturedSchools(limit = 6): Promise<School[]> {
  return [...(await loadSchools())].sort((a, b) => b.state_titles - a.state_titles || b.rating - a.rating).slice(0, limit);
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
