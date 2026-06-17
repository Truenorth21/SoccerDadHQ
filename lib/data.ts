import { CLUBS, COACHES, TRYOUTS } from "./seed";
import { SCHOOLS } from "./schools";
import { COMMITMENTS } from "./commitments";
import type { Club, ClubReviewScores, Coach, CoachReviewScores, School, SchoolReviewScores, Tryout, Review, Commitment } from "./types";
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
  rating?: string; // minimum star rating, e.g. "4"
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

type ReviewAggregate = { count: number; rating: number; scores: Record<string, number> };

/** Aggregate real reviews (avg overall rating, count, avg per-category scores) for
 *  one subject type, keyed by subject_id. Cookieless + cache-capped so it's safe in
 *  static/ISR pages. Lets the directory + rankings reflect actual parent reviews. */
async function getReviewAggregates(subjectType: string): Promise<Record<string, ReviewAggregate>> {
  const supabase = publicClient();
  if (!supabase) return {};
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("subject_id, overall_rating, scores")
      .eq("subject_type", subjectType);
    if (error || !data) return {};
    const acc: Record<string, { sum: number; count: number; scoreSums: Record<string, number> }> = {};
    for (const r of data as { subject_id: string; overall_rating: number; scores: Record<string, number> | null }[]) {
      const a = (acc[r.subject_id] ??= { sum: 0, count: 0, scoreSums: {} });
      a.sum += Number(r.overall_rating);
      a.count += 1;
      for (const [k, v] of Object.entries(r.scores ?? {})) a.scoreSums[k] = (a.scoreSums[k] ?? 0) + Number(v);
    }
    const out: Record<string, ReviewAggregate> = {};
    for (const [id, a] of Object.entries(acc)) {
      const scores: Record<string, number> = {};
      for (const [k, s] of Object.entries(a.scoreSums)) scores[k] = Math.round((s / a.count) * 10) / 10;
      out[id] = { count: a.count, rating: Math.round((a.sum / a.count) * 10) / 10, scores };
    }
    return out;
  } catch {
    return {};
  }
}

/** Fold review aggregates onto entities by id — sets rating, review_count and
 *  per-category scores. Entities with no reviews are returned unchanged (rating 0). */
function applyReviewAggregates<T extends { id: string; rating: number; review_count: number; scores: object }>(
  items: T[],
  agg: Record<string, ReviewAggregate>,
  emptyScores: object
): T[] {
  return items.map((it) => {
    const a = agg[it.id];
    if (!a || a.count === 0) return it;
    return { ...it, rating: a.rating, review_count: a.count, scores: { ...emptyScores, ...a.scores } };
  });
}

/** All clubs = seeded clubs + real clubs from Supabase, merged by slug (DB wins),
 *  with real review ratings/counts folded in. Falls back to seed when Supabase is
 *  unconfigured. Cookieless read, so it stays safe for static/ISR pages. */
export async function loadClubs(): Promise<Club[]> {
  const supabase = publicClient();
  if (!supabase) return CLUBS;
  try {
    const [clubsRes, agg, ovMap] = await Promise.all([
      supabase.from("clubs").select("*").order("slug"),
      getReviewAggregates("club"),
      fetchOverridesMap("club"),
    ]);
    const { data, error } = clubsRes;
    const bySlug = new Map<string, Club>();
    for (const c of CLUBS) bySlug.set(c.slug, c);
    if (!error && data) for (const r of data as Record<string, any>[]) bySlug.set(r.slug, dbRowToClub(r));
    const withReviews = applyReviewAggregates(Array.from(bySlug.values()), agg, EMPTY_SCORES);
    return applyOverridesMap(withReviews, "club", ovMap);
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
  if (filters.rating) {
    const min = parseFloat(filters.rating);
    if (min > 0) results = results.filter((c) => c.rating >= min);
  }

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

/** Fields an owner is allowed to edit per profile type (everything else —
 *  name, region, rank, votes, plan — is off-limits). Used by both the merge
 *  below and the owner-edit API as the single source of truth. */
export const OVERRIDE_FIELDS: Record<string, string[]> = {
  club: ["description", "website", "email", "phone", "instagram", "facebook", "twitter", "leagues", "age_groups", "genders", "founded", "tryouts_open", "next_tryout_date", "tryout_note"],
  school: ["description", "website", "email", "phone", "mascot", "tryouts_open", "next_tryout_date", "tryout_note"],
  coach: ["bio", "phone", "title", "specialties", "private_training"],
  "training-center": ["description", "website", "email", "phone", "tags"],
  facility: ["description", "website", "email", "phone", "tags"],
  tournament: ["description", "website", "email", "phone", "tags"],
  camp: ["description", "website", "email", "phone", "tags"],
};

/** Read an owner's saved edits for a profile (cookieless, cache-safe). */
export async function getOverride(subjectType: string, slug: string): Promise<Record<string, unknown>> {
  const supabase = publicClient();
  if (!supabase) return {};
  try {
    const { data } = await supabase
      .from("profile_overrides")
      .select("data")
      .eq("subject_type", subjectType)
      .eq("slug", slug)
      .maybeSingle();
    return ((data as { data?: Record<string, unknown> } | null)?.data) ?? {};
  } catch {
    return {};
  }
}

/** Fetch all owner overrides for a type as a slug→data map (one query). Split
 *  out so the loaders can run it in parallel with their other reads. */
export async function fetchOverridesMap(type: string): Promise<Record<string, Record<string, unknown>>> {
  const supabase = publicClient();
  if (!supabase || !OVERRIDE_FIELDS[type]) return {};
  const map: Record<string, Record<string, unknown>> = {};
  try {
    const { data } = await supabase.from("profile_overrides").select("slug, data").eq("subject_type", type);
    for (const r of (data ?? []) as { slug: string; data: Record<string, unknown> }[]) map[r.slug] = r.data ?? {};
  } catch {
    /* table missing → no overrides */
  }
  return map;
}

/** Apply a pre-fetched override map to a directory list, so cards reflect owner
 *  edits. Crucially, `tryouts_open` is REAL-only — the seed flag is ignored and
 *  it's true only when an owner explicitly set it — so the directory badge/filter
 *  matches the homepage ticker. */
export function applyOverridesMap<T extends { slug: string }>(list: T[], type: string, map: Record<string, Record<string, unknown>>): T[] {
  const allow = OVERRIDE_FIELDS[type] ?? [];
  if (!allow.length) return list;
  const gatesTryouts = allow.includes("tryouts_open");
  return list.map((e) => {
    const ov = map[e.slug];
    const patch: Record<string, unknown> = {};
    if (ov) for (const k of allow) if (ov[k] !== undefined && ov[k] !== null) patch[k] = ov[k];
    const out = { ...(e as Record<string, unknown>), ...patch } as T & { tryouts_open?: boolean };
    // Honest tryouts: seed flag never counts — only an explicit owner setting does.
    if (gatesTryouts) out.tryouts_open = ov?.tryouts_open === true;
    return out;
  });
}

/** Merge an owner's whitelisted edits onto an entity. */
export function applyOverride<T>(entity: T, type: string, data: Record<string, unknown>): T {
  const allow = OVERRIDE_FIELDS[type] ?? [];
  const patch: Record<string, unknown> = {};
  for (const k of allow) if (data[k] !== undefined && data[k] !== null) patch[k] = data[k];
  return { ...(entity as Record<string, unknown>), ...patch } as T;
}

export async function getClubBySlug(slug: string): Promise<Club | undefined> {
  const club = (await loadClubs()).find((c) => c.slug === slug);
  if (!club) return undefined;
  return applyOverride(club, "club", await getOverride("club", slug));
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
  rating?: string;
}

const EMPTY_COACH_SCORES: CoachReviewScores = {
  communication: 0, development: 0, personality: 0, fairness: 0, game_management: 0, overall_impact: 0,
};

function dbRowToCoach(r: Record<string, any>): Coach {
  return {
    id: String(r.id),
    slug: r.slug,
    name: r.name,
    region: r.region as RegionKey,
    city: r.city ?? "",
    club_id: r.club_id ?? undefined,
    club_name: r.club_name ?? undefined,
    title: r.title ?? "",
    bio: r.bio ?? "",
    photo_color: r.photo_color ?? "#1a4fa0",
    certifications: r.certifications ?? [],
    specialties: r.specialties ?? [],
    age_groups: r.age_groups ?? [],
    genders: r.genders ?? [],
    private_training: !!r.private_training,
    private_training_note: r.private_training_note ?? undefined,
    email: r.email ?? undefined,
    phone: r.phone ?? undefined,
    featured: !!r.featured,
    plan: (r.plan ?? "free") as Coach["plan"],
    rating: 0,
    review_count: 0,
    scores: { ...EMPTY_COACH_SCORES },
    reviews: [],
  };
}

/** Seeded coaches + real coaches from Supabase, merged by slug (DB wins). */
export async function loadCoaches(): Promise<Coach[]> {
  const supabase = publicClient();
  if (!supabase) return COACHES;
  try {
    const { data, error } = await supabase.from("coaches").select("*").order("slug");
    const bySlug = new Map<string, Coach>();
    for (const c of COACHES) bySlug.set(c.slug, c);
    if (!error && data) for (const r of data as Record<string, any>[]) bySlug.set(r.slug, dbRowToCoach(r));
    const agg = await getReviewAggregates("coach");
    return applyReviewAggregates(Array.from(bySlug.values()), agg, EMPTY_COACH_SCORES);
  } catch {
    return COACHES;
  }
}

export async function getCoaches(filters: CoachFilters = {}): Promise<Coach[]> {
  let results = [...(await loadCoaches())];
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
  if (filters.rating) {
    const min = parseFloat(filters.rating);
    if (min > 0) results = results.filter((c) => c.rating >= min);
  }
  results.sort((a, b) => b.rating - a.rating);
  return [...results.filter((c) => c.featured), ...results.filter((c) => !c.featured)];
}

export async function getCoachBySlug(slug: string): Promise<Coach | undefined> {
  const coach = (await loadCoaches()).find((c) => c.slug === slug);
  if (!coach) return undefined;
  return applyOverride(coach, "coach", await getOverride("coach", slug));
}

export async function getCoachesForClub(clubId: string): Promise<Coach[]> {
  return (await loadCoaches()).filter((c) => c.club_id === clubId);
}

export function getTryouts(limit?: number): Tryout[] {
  const sorted = [...TRYOUTS].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  return limit ? sorted.slice(0, limit) : sorted;
}

/** Only tryouts whose date is still in the future, sorted soonest-first.
 *  Drives the homepage ticker — when this is empty the ticker is hidden. */
interface TryoutOverride {
  tryouts_open?: boolean;
  next_tryout_date?: string;
  tryout_note?: string;
  age_groups?: string[];
  genders?: string[];
}

/** Upcoming tryouts for the homepage ticker / newsletter — built from REAL owner
 *  input: a club OR school the owner marked "tryouts open" with a future
 *  next_tryout_date. The note (location/times) lives on the profile. No
 *  fabricated dates — empty until owners set real ones. */
export async function getActiveTryouts(limit?: number): Promise<Tryout[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  // Keep tryouts dated today or later (date-only values; don't drop a same-day tryout).
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const cutoff = startOfToday.getTime();
  let rows: { subject_type: string; slug: string; data: TryoutOverride }[] = [];
  try {
    const { data } = await supabase
      .from("profile_overrides")
      .select("subject_type, slug, data")
      .in("subject_type", ["club", "school"])
      .order("slug");
    rows = (data ?? []) as typeof rows;
  } catch {
    return [];
  }
  if (!rows.length) return [];
  const hasClub = rows.some((r) => r.subject_type === "club");
  const hasSchool = rows.some((r) => r.subject_type === "school");
  const [clubs, schools] = await Promise.all([
    hasClub ? loadClubs() : Promise.resolve([]),
    hasSchool ? loadSchools() : Promise.resolve([]),
  ]);
  const clubBySlug = new Map(clubs.map((c) => [c.slug, c]));
  const schoolBySlug = new Map(schools.map((s) => [s.slug, s]));
  const out: Tryout[] = [];
  for (const row of rows) {
    const d = row.data || {};
    if (d.tryouts_open === false || !d.next_tryout_date) continue;
    if (+new Date(d.next_tryout_date) < cutoff) continue;
    const isSchool = row.subject_type === "school";
    const ent = isSchool ? schoolBySlug.get(row.slug) : clubBySlug.get(row.slug);
    if (!ent) continue;
    const ages = Array.isArray(d.age_groups) ? d.age_groups : (ent as { age_groups?: string[] }).age_groups ?? [];
    const genders = Array.isArray(d.genders) ? d.genders : (ent as { genders?: string[]; programs?: string[] }).genders ?? (ent as { programs?: string[] }).programs ?? [];
    out.push({
      id: `${row.subject_type}-${row.slug}-${d.next_tryout_date}`,
      club_id: ent.id,
      club_name: ent.name,
      club_slug: row.slug,
      href: `${isSchool ? "/schools" : "/clubs"}/${row.slug}`,
      region: ent.region,
      city: ent.city,
      age_groups: isSchool ? "High school" : ages.length ? `${ages[0]}–${ages[ages.length - 1]}` : "",
      gender: genders.join(" & "),
      date: new Date(d.next_tryout_date).toISOString(),
      note: d.tryout_note || "",
    });
  }
  out.sort((a, b) => +new Date(a.date) - +new Date(b.date));
  return limit ? out.slice(0, limit) : out;
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
  rating?: string;
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
    const [schoolsRes, agg, ovMap] = await Promise.all([
      supabase.from("schools").select("*").order("slug"),
      getReviewAggregates("school"),
      fetchOverridesMap("school"),
    ]);
    const { data, error } = schoolsRes;
    const bySlug = new Map<string, School>();
    for (const s of SCHOOLS) bySlug.set(s.slug, s);
    if (!error && data) for (const r of data as Record<string, any>[]) bySlug.set(r.slug, dbRowToSchool(r));
    const withReviews = applyReviewAggregates(Array.from(bySlug.values()), agg, EMPTY_SCHOOL_SCORES);
    return applyOverridesMap(withReviews, "school", ovMap);
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
  if (filters.rating) {
    const min = parseFloat(filters.rating);
    if (min > 0) results = results.filter((s) => s.rating >= min);
  }

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
  const school = (await loadSchools()).find((s) => s.slug === slug);
  if (!school) return undefined;
  return applyOverride(school, "school", await getOverride("school", slug));
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

/** Cookieless variant of getVoteTallies — safe to call from statically-rendered
 *  pages (homepage, digest, sitemap) without opting them out of ISR caching. */
export async function getVoteTalliesPublic(): Promise<Record<string, number>> {
  const supabase = publicClient();
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
  return latestSnapshotRanksFrom(createClient());
}

/** Cookieless variant — safe for ISR-cached pages (homepage) without forcing dynamic. */
export async function getLatestSnapshotRanksPublic(): Promise<{
  ranks: Record<string, number>;
  hasSnapshot: boolean;
}> {
  return latestSnapshotRanksFrom(publicClient());
}

async function latestSnapshotRanksFrom(
  supabase: ReturnType<typeof createClient> | ReturnType<typeof publicClient>
): Promise<{ ranks: Record<string, number>; hasSnapshot: boolean }> {
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
      owner_reply: (row as { owner_reply?: string }).owner_reply ?? undefined,
      owner_reply_at: (row as { owner_reply_at?: string }).owner_reply_at ?? undefined,
    }));
  } catch {
    return [];
  }
}
