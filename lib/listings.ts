import type { RegionKey } from "./regions";
import type { Review } from "./types";
import { publicClient } from "./supabase/public";

/* ------------------------------------------------------------------ *
 *  Bespoke directory sections for the "extra" entity types:
 *  Training Centers, Facilities, Tournaments, Camps.
 *  Each is a real claimable profile with its own seed, filters,
 *  review categories and profile facts.
 * ------------------------------------------------------------------ */
export type ListingKind = "training-center" | "facility" | "tournament" | "camp";

export interface Listing {
  id: string;
  slug: string;
  kind: ListingKind;
  name: string;
  region: RegionKey;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  color: string;
  claimed: boolean;
  verified: boolean;
  featured: boolean;
  plan: "free" | "pro" | "featured";
  rating: number;
  review_count: number;
  scores: Record<string, number>;
  reviews: Review[];
  facts: { label: string; value: string }[];
  tags: string[]; // filterable facet values
}

interface Facet {
  key: string;
  label: string;
  options: string[];
}

interface KindConfig {
  kind: ListingKind;
  label: string; // singular
  plural: string;
  path: string;
  navLabel: string;
  blurb: string;
  reviewCats: { key: string; label: string }[];
  facets: Facet[];
}

export const KIND_CONFIG: Record<ListingKind, KindConfig> = {
  "training-center": {
    kind: "training-center",
    label: "Training Center",
    plural: "Training Centers",
    path: "/training-centers",
    navLabel: "Training",
    blurb: "Private & small-group skills academies across Florida.",
    reviewCats: [
      { key: "coaching", label: "Coaching" },
      { key: "development", label: "Development" },
      { key: "value", label: "Value" },
      { key: "communication", label: "Communication" },
      { key: "results", label: "Results" },
      { key: "facilities", label: "Facilities" },
    ],
    facets: [
      { key: "focus", label: "Focus", options: ["Technical", "Goalkeeping", "Speed & Agility", "Finishing", "College Prep"] },
      { key: "format", label: "Format", options: ["Private", "Small group", "Both"] },
    ],
  },
  facility: {
    kind: "facility",
    label: "Facility",
    plural: "Facilities",
    path: "/facilities",
    navLabel: "Facilities",
    blurb: "Fields, complexes and indoor venues where Florida soccer is played.",
    reviewCats: [
      { key: "fields", label: "Fields" },
      { key: "amenities", label: "Amenities" },
      { key: "parking", label: "Parking" },
      { key: "location", label: "Location" },
      { key: "upkeep", label: "Upkeep" },
      { key: "value", label: "Value" },
    ],
    facets: [
      { key: "surface", label: "Surface", options: ["Turf", "Grass", "Both", "Indoor"] },
      { key: "type", label: "Type", options: ["Complex", "Single field", "Indoor arena"] },
    ],
  },
  tournament: {
    kind: "tournament",
    label: "Tournament",
    plural: "Tournaments",
    path: "/tournaments",
    navLabel: "Tournaments",
    blurb: "Showcases, cups and college-recruiting events around the state.",
    reviewCats: [
      { key: "organization", label: "Organization" },
      { key: "competition", label: "Competition" },
      { key: "facilities", label: "Facilities" },
      { key: "value", label: "Value" },
      { key: "communication", label: "Communication" },
      { key: "experience", label: "Experience" },
    ],
    facets: [
      { key: "format", label: "Format", options: ["Showcase", "Cup", "League event"] },
      { key: "level", label: "Level", options: ["Local", "Regional", "National", "College Showcase"] },
    ],
  },
  camp: {
    kind: "camp",
    label: "Camp",
    plural: "Camps",
    path: "/camps",
    navLabel: "Camps",
    blurb: "Day, residential and ID camps to keep players sharp year-round.",
    reviewCats: [
      { key: "coaching", label: "Coaching" },
      { key: "development", label: "Development" },
      { key: "fun", label: "Fun" },
      { key: "value", label: "Value" },
      { key: "organization", label: "Organization" },
      { key: "facilities", label: "Facilities" },
    ],
    facets: [
      { key: "type", label: "Type", options: ["Day", "Residential", "ID camp", "Clinic"] },
      { key: "focus", label: "Focus", options: ["Skills", "Goalkeeping", "College ID", "Position-specific"] },
    ],
  },
};

/* ---------------- deterministic helpers ---------------- */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
function rng(seed: string) {
  let s = hash(seed) || 1;
  return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
}
function pick<T>(a: T[], r: () => number): T {
  return a[Math.floor(r() * a.length)];
}
function score(r: () => number, floor = 3.4): number {
  return Math.round((floor + r() * (5 - floor)) * 10) / 10;
}
export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
const COLORS = ["#1a4fa0", "#0a1628", "#2a7de1", "#1d7a4d", "#9b2d2d", "#5a2d82", "#b8860b"];
const REVIEW_AUTHORS = ["Mike R.", "Jessica T.", "Carlos M.", "Amanda P.", "David L.", "Priya S.", "Tom B.", "Maria G."];
const REVIEW_REL = ["Parent", "Player", "Coach", "Parent of two players"];

/* ---------------- raw seed (name, region, city) ---------------- */
interface Raw {
  name: string;
  region: RegionKey;
  city: string;
  zip: string;
  lat: number;
  lng: number;
}

const RAW: Record<ListingKind, Raw[]> = {
  "training-center": [
    { name: "Modern Elite Training", region: "tampa-bay", city: "Tampa", zip: "33607", lat: 27.96, lng: -82.48 },
    { name: "Next Level Soccer Academy", region: "south-florida", city: "Weston", zip: "33327", lat: 26.1, lng: -80.4 },
    { name: "Footwork First Training", region: "orlando-central", city: "Orlando", zip: "32801", lat: 28.54, lng: -81.38 },
    { name: "Total Touch Soccer", region: "southwest-florida", city: "Naples", zip: "34109", lat: 26.22, lng: -81.79 },
    { name: "Elite Edge Performance", region: "palm-beach-treasure-coast", city: "Boca Raton", zip: "33433", lat: 26.35, lng: -80.12 },
    { name: "First Coast Soccer Lab", region: "jacksonville-ne", city: "Jacksonville", zip: "32256", lat: 30.22, lng: -81.56 },
    { name: "Precision Player Development", region: "space-coast-daytona", city: "Melbourne", zip: "32940", lat: 28.23, lng: -80.69 },
    { name: "Capital City Soccer Training", region: "panhandle-tallahassee", city: "Tallahassee", zip: "32312", lat: 30.53, lng: -84.26 },
    { name: "Gator Soccer Academy", region: "north-gainesville", city: "Gainesville", zip: "32607", lat: 29.65, lng: -82.37 },
    { name: "Sunshine Soccer Skills", region: "south-florida", city: "Miami", zip: "33186", lat: 25.67, lng: -80.4 },
    { name: "Apex Soccer Performance", region: "southwest-florida", city: "Fort Myers", zip: "33907", lat: 26.56, lng: -81.87 },
    { name: "Breakthrough Soccer Training", region: "orlando-central", city: "Lake Mary", zip: "32746", lat: 28.75, lng: -81.31 },
  ],
  facility: [
    { name: "Premier Sports Campus", region: "southwest-florida", city: "Lakewood Ranch", zip: "34211", lat: 27.42, lng: -82.37 },
    { name: "ESPN Wide World of Sports", region: "orlando-central", city: "Orlando", zip: "32830", lat: 28.34, lng: -81.55 },
    { name: "Plantation Central Park", region: "south-florida", city: "Plantation", zip: "33324", lat: 26.12, lng: -80.23 },
    { name: "Seminole Soccer Complex", region: "orlando-central", city: "Sanford", zip: "32771", lat: 28.81, lng: -81.27 },
    { name: "Patch Reef Park", region: "palm-beach-treasure-coast", city: "Boca Raton", zip: "33498", lat: 26.39, lng: -80.18 },
    { name: "Veterans Park Fields", region: "southwest-florida", city: "Naples", zip: "34109", lat: 26.24, lng: -81.77 },
    { name: "Hodges Stadium Fields", region: "jacksonville-ne", city: "Jacksonville", zip: "32224", lat: 30.27, lng: -81.51 },
    { name: "Apalachee Regional Park", region: "panhandle-tallahassee", city: "Tallahassee", zip: "32311", lat: 30.4, lng: -84.2 },
    { name: "Celebration Soccer Complex", region: "orlando-central", city: "Celebration", zip: "34747", lat: 28.32, lng: -81.53 },
    { name: "Tradition Field Complex", region: "palm-beach-treasure-coast", city: "Port St. Lucie", zip: "34987", lat: 27.28, lng: -80.41 },
    { name: "Riverview Sportsplex", region: "tampa-bay", city: "Riverview", zip: "33578", lat: 27.86, lng: -82.33 },
    { name: "Cooper City Sports Complex", region: "south-florida", city: "Cooper City", zip: "33330", lat: 26.05, lng: -80.29 },
  ],
  tournament: [
    { name: "Disney Soccer Showcase", region: "orlando-central", city: "Orlando", zip: "32830", lat: 28.34, lng: -81.55 },
    { name: "Sunshine State Cup", region: "tampa-bay", city: "Tampa", zip: "33607", lat: 27.96, lng: -82.48 },
    { name: "Weston Cup & Showcase", region: "south-florida", city: "Weston", zip: "33327", lat: 26.1, lng: -80.4 },
    { name: "Florida Premier Invitational", region: "tampa-bay", city: "Wesley Chapel", zip: "33544", lat: 28.2, lng: -82.34 },
    { name: "Space Coast Cup", region: "space-coast-daytona", city: "Melbourne", zip: "32940", lat: 28.23, lng: -80.69 },
    { name: "Boca Raton Holiday Classic", region: "palm-beach-treasure-coast", city: "Boca Raton", zip: "33433", lat: 26.35, lng: -80.12 },
    { name: "Jacksonville Cup", region: "jacksonville-ne", city: "Jacksonville", zip: "32218", lat: 30.45, lng: -81.66 },
    { name: "Gulf Coast Classic", region: "southwest-florida", city: "Fort Myers", zip: "33907", lat: 26.56, lng: -81.87 },
    { name: "Tallahassee Cup", region: "panhandle-tallahassee", city: "Tallahassee", zip: "32312", lat: 30.53, lng: -84.26 },
    { name: "Gainesville Spring Kickoff", region: "north-gainesville", city: "Gainesville", zip: "32607", lat: 29.65, lng: -82.37 },
    { name: "Sarasota Showdown", region: "southwest-florida", city: "Sarasota", zip: "34232", lat: 27.33, lng: -82.47 },
    { name: "First Coast Shootout", region: "jacksonville-ne", city: "St. Augustine", zip: "32084", lat: 29.9, lng: -81.31 },
  ],
  camp: [
    { name: "IMG Academy Soccer Camp", region: "southwest-florida", city: "Bradenton", zip: "34210", lat: 27.43, lng: -82.58 },
    { name: "Orlando City Summer Camp", region: "orlando-central", city: "Orlando", zip: "32827", lat: 28.41, lng: -81.29 },
    { name: "Inter Miami Youth Camp", region: "south-florida", city: "Fort Lauderdale", zip: "33309", lat: 26.19, lng: -80.17 },
    { name: "Weston FC Summer Academy", region: "south-florida", city: "Weston", zip: "33327", lat: 26.1, lng: -80.4 },
    { name: "Tampa Bay United ID Camp", region: "tampa-bay", city: "Tampa", zip: "33647", lat: 28.12, lng: -82.36 },
    { name: "Chargers Elite Camp", region: "tampa-bay", city: "Tampa", zip: "33626", lat: 28.07, lng: -82.61 },
    { name: "Florida Kraze Krush Camp", region: "orlando-central", city: "Lake Mary", zip: "32746", lat: 28.75, lng: -81.31 },
    { name: "Naples United Skills Camp", region: "southwest-florida", city: "Naples", zip: "34109", lat: 26.22, lng: -81.79 },
    { name: "Florida Elite Winter Camp", region: "jacksonville-ne", city: "Jacksonville", zip: "32256", lat: 30.22, lng: -81.56 },
    { name: "Brevard Summer Soccer", region: "space-coast-daytona", city: "Melbourne", zip: "32940", lat: 28.23, lng: -80.69 },
    { name: "Capital GK Academy Camp", region: "panhandle-tallahassee", city: "Tallahassee", zip: "32312", lat: 30.53, lng: -84.26 },
    { name: "Gator College ID Camp", region: "north-gainesville", city: "Gainesville", zip: "32607", lat: 29.65, lng: -82.37 },
  ],
};

const AMENITIES = ["Lighted fields", "Covered seating", "Concessions", "Restrooms", "Ample parking", "Pro shop", "Trainer on site"];

function buildReviews(seed: string, cats: { key: string }[], count: number): Review[] {
  const r = rng(seed + ":rev");
  const TEMPLATES = [
    { title: "Worth it", body: "Well run and a genuinely good experience for our family. Would recommend to other soccer parents." },
    { title: "Solid all around", body: "Organized, professional and good value. A couple of small things to improve but overall a thumbs up." },
    { title: "Our kid loved it", body: "Great energy and real development. We'll be back, and we've told our teammates about it." },
    { title: "Good, with caveats", body: "Strong on the things that matter. Communication could be a touch better, but no complaints on quality." },
  ];
  const out: Review[] = [];
  for (let i = 0; i < count; i++) {
    const t = TEMPLATES[i % TEMPLATES.length];
    const scores: Record<string, number> = {};
    cats.forEach((c) => (scores[c.key] = score(r, 3.2)));
    const overall = Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / cats.length) * 10) / 10;
    out.push({
      id: `${seed}-rev-${i}`,
      author: REVIEW_AUTHORS[(hash(seed) + i) % REVIEW_AUTHORS.length],
      relationship: REVIEW_REL[i % REVIEW_REL.length],
      rating: overall,
      scores: scores as never,
      title: t.title,
      body: t.body,
      created_at: new Date(Date.UTC(2026, 5, 1) - (5 + Math.floor(r() * 480)) * 86400000).toISOString(),
    });
  }
  return out.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

function buildFactsAndTags(kind: ListingKind, r: () => number): { facts: { label: string; value: string }[]; tags: string[] } {
  const cfg = KIND_CONFIG[kind];
  const f0 = pick(cfg.facets[0].options, r);
  const f1 = pick(cfg.facets[1].options, r);
  const tags = [f0, f1];

  if (kind === "training-center") {
    return { facts: [{ label: "Focus", value: f0 }, { label: "Format", value: f1 }, { label: "Age groups", value: "U8–U18" }, { label: "Founded", value: String(2008 + Math.floor(r() * 16)) }], tags };
  }
  if (kind === "facility") {
    const fields = 2 + Math.floor(r() * 22);
    const ams = AMENITIES.filter(() => r() > 0.5).slice(0, 4);
    return { facts: [{ label: "Fields", value: `${fields}` }, { label: "Surface", value: f0 }, { label: "Type", value: f1 }, { label: "Amenities", value: ams.join(", ") || "Restrooms, parking" }], tags };
  }
  if (kind === "tournament") {
    const months = ["January", "February", "March", "June", "July", "November", "December"];
    return { facts: [{ label: "Format", value: f0 }, { label: "Level", value: f1 }, { label: "Window", value: `${pick(months, r)} 2026` }, { label: "Age groups", value: "U9–U19" }], tags };
  }
  // camp
  const seasons = ["Summer", "Winter break", "Spring break", "Year-round"];
  return { facts: [{ label: "Type", value: f0 }, { label: "Focus", value: f1 }, { label: "Season", value: pick(seasons, r) }, { label: "Age groups", value: "U8–U18" }], tags };
}

function buildListing(kind: ListingKind, raw: Raw, idx: number): Listing {
  const slug = slugify(raw.name);
  const r = rng(kind + ":" + slug);
  const cfg = KIND_CONFIG[kind];
  // Honest launch: listings start unrated (no fabricated reviews/stars).
  void (3 + Math.floor(r() * 5));
  const reviewCount = 0;
  const reviews: Review[] = [];
  const scores: Record<string, number> = {};
  cfg.reviewCats.forEach((c) => {
    scores[c.key] = 0;
  });
  const rating = 0;
  const planRoll = r();
  const plan: Listing["plan"] = planRoll > 0.82 ? "featured" : planRoll > 0.6 ? "pro" : "free";
  const { facts, tags } = buildFactsAndTags(kind, r);

  return {
    id: `${kind}-${idx + 1}`,
    slug,
    kind,
    name: raw.name,
    region: raw.region,
    city: raw.city,
    zip: raw.zip,
    lat: raw.lat,
    lng: raw.lng,
    description: `${raw.name} is a ${cfg.label.toLowerCase()} based in ${raw.city}, Florida. ${cfg.blurb} It serves youth soccer families across the ${raw.region.replace(/-/g, " ")} area with a focus on quality, development and a positive experience.`,
    // Unclaimed: no fabricated contact (these were auto-generated placeholders).
    website: undefined,
    email: undefined,
    phone: undefined,
    color: COLORS[idx % COLORS.length],
    claimed: false, // unclaimed until a real owner claims the profile
    verified: false, // not "verified" until we've actually verified it
    featured: plan === "featured",
    plan,
    rating,
    review_count: reviewCount,
    scores,
    reviews,
    facts,
    tags,
  };
}

export const LISTINGS: Listing[] = (Object.keys(RAW) as ListingKind[]).flatMap((kind) =>
  RAW[kind].map((raw, i) => buildListing(kind, raw, i))
);

/** Map a Supabase listings row to a Listing (ratings/reviews fold in separately). */
function dbRowToListing(r: Record<string, any>): Listing {
  return {
    id: String(r.id),
    slug: r.slug,
    kind: r.kind as ListingKind,
    name: r.name,
    region: r.region as RegionKey,
    city: r.city ?? "",
    zip: r.zip ?? "",
    lat: r.lat ?? 0,
    lng: r.lng ?? 0,
    description: r.description ?? "",
    website: r.website ?? undefined,
    email: r.email ?? undefined,
    phone: r.phone ?? undefined,
    color: r.color ?? "#1a4fa0",
    claimed: !!r.claimed,
    verified: !!r.verified,
    featured: !!r.featured,
    plan: (r.plan ?? "free") as Listing["plan"],
    rating: 0,
    review_count: 0,
    scores: {},
    reviews: [],
    facts: Array.isArray(r.facts) ? r.facts : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
  };
}

/** Real review aggregates per listing subject_id (cookieless, cache-capped). */
async function listingReviewAggregates(): Promise<Record<string, { count: number; rating: number; scores: Record<string, number> }>> {
  const supabase = publicClient();
  if (!supabase) return {};
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("subject_id, overall_rating, scores")
      .in("subject_type", ["training-center", "facility", "tournament", "camp"]);
    if (error || !data) return {};
    const acc: Record<string, { sum: number; count: number; scoreSums: Record<string, number> }> = {};
    for (const r of data as { subject_id: string; overall_rating: number; scores: Record<string, number> | null }[]) {
      const a = (acc[r.subject_id] ??= { sum: 0, count: 0, scoreSums: {} });
      a.sum += Number(r.overall_rating);
      a.count += 1;
      for (const [k, v] of Object.entries(r.scores ?? {})) a.scoreSums[k] = (a.scoreSums[k] ?? 0) + Number(v);
    }
    const out: Record<string, { count: number; rating: number; scores: Record<string, number> }> = {};
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

/** All listings = seed + real DB listings, merged by kind+slug (DB wins), with real
 *  review ratings folded in. Falls back to seed when Supabase is unconfigured/absent. */
export async function loadListings(): Promise<Listing[]> {
  const supabase = publicClient();
  if (!supabase) return LISTINGS;
  try {
    const { data, error } = await supabase.from("listings").select("*").order("slug");
    const byKey = new Map<string, Listing>();
    for (const l of LISTINGS) byKey.set(`${l.kind}:${l.slug}`, l);
    if (!error && data) for (const r of data as Record<string, any>[]) byKey.set(`${r.kind}:${r.slug}`, dbRowToListing(r));
    const merged = Array.from(byKey.values());
    const agg = await listingReviewAggregates();
    return merged.map((l) => {
      const a = agg[l.id];
      if (!a || a.count === 0) return l;
      return { ...l, rating: a.rating, review_count: a.count, scores: { ...l.scores, ...a.scores } };
    });
  } catch {
    return LISTINGS;
  }
}

export async function getListings(
  kind: ListingKind,
  filters: { q?: string; region?: string; facet?: string; sort?: string } = {}
): Promise<Listing[]> {
  let res = (await loadListings()).filter((l) => l.kind === kind);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    res = res.filter((l) => l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.tags.join(" ").toLowerCase().includes(q));
  }
  if (filters.region) res = res.filter((l) => l.region === filters.region);
  if (filters.facet) res = res.filter((l) => l.tags.includes(filters.facet!));
  if (filters.sort === "rating") res.sort((a, b) => b.rating - a.rating);
  else if (filters.sort === "reviews") res.sort((a, b) => b.review_count - a.review_count);
  else res.sort((a, b) => a.name.localeCompare(b.name));
  return [...res.filter((l) => l.featured), ...res.filter((l) => !l.featured)];
}

const LISTING_OVERRIDE_FIELDS = ["description", "website", "email", "phone", "tags"] as const;

export async function getListingBySlug(kind: ListingKind, slug: string): Promise<Listing | undefined> {
  const listing = (await loadListings()).find((l) => l.kind === kind && l.slug === slug);
  if (!listing) return undefined;
  // Merge the owner's saved edits (whitelisted fields) on top.
  const supabase = publicClient();
  if (!supabase) return listing;
  try {
    const { data } = await supabase.from("profile_overrides").select("data").eq("subject_type", kind).eq("slug", slug).maybeSingle();
    const ov = ((data as { data?: Record<string, unknown> } | null)?.data) ?? {};
    const patch: Record<string, unknown> = {};
    for (const k of LISTING_OVERRIDE_FIELDS) if (ov[k] !== undefined && ov[k] !== null) patch[k] = ov[k];
    return { ...listing, ...patch };
  } catch {
    return listing;
  }
}

export async function getNearbyListings(l: Listing, limit = 4): Promise<Listing[]> {
  return (await loadListings()).filter((x) => x.kind === l.kind && x.id !== l.id && x.region === l.region).slice(0, limit);
}
