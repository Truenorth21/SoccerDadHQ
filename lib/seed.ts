import type { RegionKey } from "./regions";
import type {
  Club,
  Coach,
  ClubReviewScores,
  CoachReviewScores,
  Review,
  Tryout,
} from "./types";

/* ------------------------------------------------------------------ *
 *  Deterministic helpers — stable pseudo-randomness so the seeded
 *  data is identical on every render (no hydration mismatches).
 * ------------------------------------------------------------------ */
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
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}
function pickMany<T>(arr: T[], r: () => number, min: number, max: number): T[] {
  const n = Math.min(arr.length, min + Math.floor(r() * (max - min + 1)));
  const pool = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && pool.length; i++) {
    out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  }
  return out;
}
function score(r: () => number, floor = 3.4): number {
  return Math.round((floor + r() * (5 - floor)) * 10) / 10;
}

const CREST_COLORS = ["#1a4fa0", "#0a1628", "#2a7de1", "#e8a020", "#1d7a4d", "#9b2d2d", "#5a2d82"];

/* ------------------------------------------------------------------ *
 *  Source-of-truth: 50+ real Florida youth soccer clubs.
 * ------------------------------------------------------------------ */
interface RawClub {
  name: string;
  region: RegionKey;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  founded: number;
  topLeagues: string[];
  website: string;
}

const RAW_CLUBS: RawClub[] = [
  // ---- South Florida ----
  { name: "Weston FC", region: "south-florida", city: "Weston", zip: "33327", lat: 26.1003, lng: -80.3998, founded: 1998, topLeagues: ["ECNL", "MLS NEXT"], website: "https://www.westonfc.com" },
  { name: "Inter Miami CF Academy", region: "south-florida", city: "Fort Lauderdale", zip: "33309", lat: 26.1934, lng: -80.1711, founded: 2020, topLeagues: ["MLS NEXT"], website: "https://www.intermiamicf.com" },
  { name: "Kendall Soccer Coalition", region: "south-florida", city: "Miami", zip: "33186", lat: 25.6793, lng: -80.4093, founded: 1995, topLeagues: ["ECNL Regional League", "FSPL"], website: "https://www.kendallsoccer.org" },
  { name: "Sunrise Sting SC", region: "south-florida", city: "Sunrise", zip: "33323", lat: 26.1669, lng: -80.3331, founded: 1989, topLeagues: ["ECNL Regional League"], website: "https://www.sunrisesting.com" },
  { name: "Plantation FC", region: "south-florida", city: "Plantation", zip: "33324", lat: 26.1276, lng: -80.2331, founded: 2001, topLeagues: ["FSPL"], website: "https://www.plantationfc.com" },
  { name: "Coral Springs United", region: "south-florida", city: "Coral Springs", zip: "33065", lat: 26.2712, lng: -80.2706, founded: 1985, topLeagues: ["ECNL Regional League", "FSPL"], website: "https://www.coralspringsunited.com" },
  { name: "South Florida United FC", region: "south-florida", city: "Davie", zip: "33328", lat: 26.0628, lng: -80.2331, founded: 2010, topLeagues: ["MLS NEXT", "ECNL Regional League"], website: "https://www.sfufc.com" },
  { name: "Miami Rush Kendall SC", region: "south-florida", city: "Miami", zip: "33176", lat: 25.6837, lng: -80.3565, founded: 2008, topLeagues: ["ECRL", "FSPL"], website: "https://www.miamirush.com" },
  { name: "Doral Soccer Club", region: "south-florida", city: "Doral", zip: "33178", lat: 25.8195, lng: -80.3553, founded: 2003, topLeagues: ["FSPL"], website: "https://www.doralsc.com" },
  { name: "Aventura Soccer Club", region: "south-florida", city: "Aventura", zip: "33180", lat: 25.9565, lng: -80.1429, founded: 1999, topLeagues: ["FSPL", "ECRL"], website: "https://www.aventurasoccer.org" },

  // ---- Palm Beach / Treasure Coast ----
  { name: "Boca Juniors USA", region: "palm-beach-treasure-coast", city: "Boca Raton", zip: "33433", lat: 26.3494, lng: -80.1289, founded: 2012, topLeagues: ["ECNL", "MLS NEXT"], website: "https://www.bocajuniorsusa.com" },
  { name: "Jupiter United SC", region: "palm-beach-treasure-coast", city: "Jupiter", zip: "33458", lat: 26.9342, lng: -80.0942, founded: 2006, topLeagues: ["ECNL Regional League"], website: "https://www.jupiterunited.com" },
  { name: "PBG Predators FC", region: "palm-beach-treasure-coast", city: "Palm Beach Gardens", zip: "33410", lat: 26.8234, lng: -80.1387, founded: 2002, topLeagues: ["FSPL", "ECRL"], website: "https://www.pbgpredators.com" },
  { name: "Wellington SC", region: "palm-beach-treasure-coast", city: "Wellington", zip: "33414", lat: 26.6618, lng: -80.2684, founded: 1991, topLeagues: ["ECNL Regional League", "FSPL"], website: "https://www.wellingtonsoccer.com" },
  { name: "Treasure Coast United", region: "palm-beach-treasure-coast", city: "Port St. Lucie", zip: "34953", lat: 27.2730, lng: -80.3582, founded: 2009, topLeagues: ["FSPL"], website: "https://www.tcunited.org" },
  { name: "Indian River SC", region: "palm-beach-treasure-coast", city: "Vero Beach", zip: "32960", lat: 27.6386, lng: -80.3973, founded: 1997, topLeagues: ["FSPL"], website: "https://www.indianriversoccer.com" },
  { name: "South Florida Football Academy", region: "palm-beach-treasure-coast", city: "Boynton Beach", zip: "33437", lat: 26.5318, lng: -80.1059, founded: 2014, topLeagues: ["ECRL", "FSPL"], website: "https://www.sffacademy.com" },

  // ---- Southwest Florida ----
  { name: "Naples United FC", region: "southwest-florida", city: "Naples", zip: "34109", lat: 26.2287, lng: -81.7873, founded: 2005, topLeagues: ["ECNL Regional League", "FSPL"], website: "https://www.naplesunited.com" },
  { name: "FC Fort Myers", region: "southwest-florida", city: "Fort Myers", zip: "33907", lat: 26.5629, lng: -81.8723, founded: 2007, topLeagues: ["FSPL"], website: "https://www.fcfortmyers.com" },
  { name: "Cape Coral Cyclones", region: "southwest-florida", city: "Cape Coral", zip: "33904", lat: 26.5629, lng: -81.9495, founded: 2000, topLeagues: ["FSPL"], website: "https://www.capecyclones.com" },
  { name: "Gulf Coast SC", region: "southwest-florida", city: "Bonita Springs", zip: "34135", lat: 26.3398, lng: -81.7787, founded: 2004, topLeagues: ["FSPL", "ECRL"], website: "https://www.gulfcoastsc.com" },
  { name: "Sarasota Bay FC", region: "southwest-florida", city: "Sarasota", zip: "34232", lat: 27.3364, lng: -82.4794, founded: 2015, topLeagues: ["ECNL Regional League", "FSPL"], website: "https://www.sarasotabayfc.com" },
  { name: "IMG Academy", region: "southwest-florida", city: "Bradenton", zip: "34210", lat: 27.4326, lng: -82.5851, founded: 1978, topLeagues: ["MLS NEXT", "ECNL"], website: "https://www.imgacademy.com" },
  { name: "Manatee Soccer Club", region: "southwest-florida", city: "Bradenton", zip: "34203", lat: 27.4799, lng: -82.5290, founded: 1996, topLeagues: ["FSPL"], website: "https://www.manateesoccer.com" },

  // ---- Tampa Bay ----
  { name: "Tampa Bay United", region: "tampa-bay", city: "Tampa", zip: "33647", lat: 28.1199, lng: -82.3573, founded: 1994, topLeagues: ["ECNL", "MLS NEXT"], website: "https://www.tampabayunited.com" },
  { name: "Chargers Soccer Club", region: "tampa-bay", city: "Tampa", zip: "33626", lat: 28.0717, lng: -82.6126, founded: 1986, topLeagues: ["ECNL", "MLS NEXT"], website: "https://www.chargerssc.com" },
  { name: "West Florida Flames", region: "tampa-bay", city: "Tampa", zip: "33625", lat: 28.0772, lng: -82.5751, founded: 1999, topLeagues: ["ECNL Regional League"], website: "https://www.westfloridaflames.com" },
  { name: "Clearwater Chargers", region: "tampa-bay", city: "Clearwater", zip: "33761", lat: 28.0286, lng: -82.7332, founded: 1990, topLeagues: ["ECRL", "FSPL"], website: "https://www.clearwaterchargers.com" },
  { name: "FC Florida", region: "tampa-bay", city: "Brandon", zip: "33511", lat: 27.9378, lng: -82.2859, founded: 2008, topLeagues: ["FSPL", "ECRL"], website: "https://www.fcflorida.us" },
  { name: "Florida Premier FC", region: "tampa-bay", city: "Wesley Chapel", zip: "33544", lat: 28.1958, lng: -82.3409, founded: 2011, topLeagues: ["ECNL Regional League", "FSPL"], website: "https://www.floridapremierfc.com" },
  { name: "Tampa Bay Wave SC", region: "tampa-bay", city: "St. Petersburg", zip: "33710", lat: 27.7912, lng: -82.7332, founded: 1997, topLeagues: ["FSPL"], website: "https://www.tampabaywave.com" },

  // ---- Orlando / Central FL ----
  { name: "Orlando City Youth Soccer", region: "orlando-central", city: "Orlando", zip: "32827", lat: 28.4115, lng: -81.2986, founded: 2015, topLeagues: ["MLS NEXT", "ECNL"], website: "https://www.orlandocitysc.com" },
  { name: "Florida Kraze Krush SC", region: "orlando-central", city: "Lake Mary", zip: "32746", lat: 28.7589, lng: -81.3187, founded: 1998, topLeagues: ["ECNL", "ECNL Regional League"], website: "https://www.krazekrush.com" },
  { name: "Oviedo SC", region: "orlando-central", city: "Oviedo", zip: "32765", lat: 28.6700, lng: -81.2081, founded: 1993, topLeagues: ["FSPL", "ECRL"], website: "https://www.oviedosoccer.com" },
  { name: "Winter Park Soccer Club", region: "orlando-central", city: "Winter Park", zip: "32792", lat: 28.5999, lng: -81.3392, founded: 1989, topLeagues: ["FSPL"], website: "https://www.winterparksoccer.com" },
  { name: "Seminole Soccer Club", region: "orlando-central", city: "Sanford", zip: "32771", lat: 28.8119, lng: -81.2731, founded: 2001, topLeagues: ["FSPL", "ECRL"], website: "https://www.seminolesoccer.com" },
  { name: "South Lake United", region: "orlando-central", city: "Clermont", zip: "34711", lat: 28.5494, lng: -81.7729, founded: 2006, topLeagues: ["FSPL"], website: "https://www.southlakeunited.com" },
  { name: "FC Prime", region: "orlando-central", city: "Orlando", zip: "32835", lat: 28.5167, lng: -81.4737, founded: 2013, topLeagues: ["ECNL Regional League", "FSPL"], website: "https://www.fcprime.com" },

  // ---- Space Coast / Daytona ----
  { name: "Brevard Soccer Alliance", region: "space-coast-daytona", city: "Melbourne", zip: "32940", lat: 28.2335, lng: -80.6962, founded: 2003, topLeagues: ["FSPL", "ECRL"], website: "https://www.brevardsoccer.org" },
  { name: "Space Coast United SC", region: "space-coast-daytona", city: "Cocoa", zip: "32926", lat: 28.3861, lng: -80.7420, founded: 1995, topLeagues: ["FSPL"], website: "https://www.spacecoastunited.com" },
  { name: "Florida Elite Daytona", region: "space-coast-daytona", city: "Daytona Beach", zip: "32117", lat: 29.2519, lng: -81.0581, founded: 2010, topLeagues: ["ECNL Regional League", "FSPL"], website: "https://www.floridaelitesa.com" },

  // ---- Jacksonville / NE Florida ----
  { name: "Florida Elite Soccer Academy", region: "jacksonville-ne", city: "Jacksonville", zip: "32256", lat: 30.2192, lng: -81.5601, founded: 2009, topLeagues: ["ECNL", "MLS NEXT"], website: "https://www.floridaelitesa.com" },
  { name: "Jacksonville FC", region: "jacksonville-ne", city: "Jacksonville", zip: "32218", lat: 30.4521, lng: -81.6612, founded: 2000, topLeagues: ["ECNL Regional League", "FSPL"], website: "https://www.jacksonvillefc.com" },
  { name: "Ponte Vedra SA", region: "jacksonville-ne", city: "Ponte Vedra Beach", zip: "32082", lat: 30.1769, lng: -81.3884, founded: 1997, topLeagues: ["ECRL", "FSPL"], website: "https://www.pontevedrasoccer.com" },
  { name: "Ancient City SC", region: "jacksonville-ne", city: "St. Augustine", zip: "32084", lat: 29.9012, lng: -81.3124, founded: 2004, topLeagues: ["FSPL"], website: "https://www.ancientcitysc.com" },
  { name: "Clay County United", region: "jacksonville-ne", city: "Orange Park", zip: "32073", lat: 30.1660, lng: -81.7065, founded: 2002, topLeagues: ["FSPL", "ECRL"], website: "https://www.claycountyunited.com" },

  // ---- North FL / Gainesville ----
  { name: "Gainesville United SC", region: "north-gainesville", city: "Gainesville", zip: "32607", lat: 29.6516, lng: -82.3735, founded: 1999, topLeagues: ["ECNL Regional League", "FSPL"], website: "https://www.gainesvilleunited.com" },
  { name: "Ocala SC", region: "north-gainesville", city: "Ocala", zip: "34471", lat: 29.1872, lng: -82.1401, founded: 2001, topLeagues: ["FSPL"], website: "https://www.ocalasoccer.com" },

  // ---- Panhandle / Tallahassee ----
  { name: "Tallahassee United SC", region: "panhandle-tallahassee", city: "Tallahassee", zip: "32312", lat: 30.5388, lng: -84.2620, founded: 1996, topLeagues: ["ECNL Regional League", "FSPL"], website: "https://www.tallahasseesoccer.com" },
  { name: "Pensacola FC", region: "panhandle-tallahassee", city: "Pensacola", zip: "32514", lat: 30.5169, lng: -87.2169, founded: 2005, topLeagues: ["FSPL", "ECRL"], website: "https://www.pensacolafc.com" },
  { name: "Emerald Coast FC", region: "panhandle-tallahassee", city: "Panama City", zip: "32405", lat: 30.1995, lng: -85.6602, founded: 2008, topLeagues: ["FSPL"], website: "https://www.emeraldcoastfc.com" },
];

/* ------------------------------------------------------------------ */
const ALL_AGES = ["U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19"];
const SPECIALTY_POOL = [
  "Player development pathway",
  "College recruiting support",
  "Goalkeeper academy",
  "Technical/futsal training",
  "Strength & conditioning",
  "Video analysis",
  "Mental performance",
  "Small-sided development",
];
const REVIEW_AUTHORS = ["Mike R.", "Jessica T.", "Carlos M.", "Amanda P.", "David L.", "Priya S.", "Tom B.", "Maria G.", "Kevin W.", "Sophia C.", "Andre F.", "Nicole H."];
const REVIEW_REL = ["Parent", "Player", "Former Player", "Parent of two players"];

const CLUB_REVIEW_TEMPLATES = [
  {
    title: "Strong development culture",
    body: "Our daughter has grown so much in two seasons here. The coaches genuinely care about long-term development over short-term wins, and the communication with parents has been excellent.",
  },
  {
    title: "Competitive but supportive",
    body: "Top-level competition without the toxic sideline culture you see elsewhere. Training is organized and the directors are responsive. Fees are on the higher side but you get what you pay for.",
  },
  {
    title: "Great fit for a serious player",
    body: "If your kid wants a real pathway — ECNL exposure, college showcases, the works — this is one of the better-run programs in the region. Facilities could use an upgrade though.",
  },
  {
    title: "Good club, depends on the team",
    body: "Experience varies a lot by age group and coach. Our older son's team was fantastic; the younger one's coach turned over twice in a year. Club-wide organization is solid.",
  },
  {
    title: "Welcoming for new families",
    body: "We moved from out of state and the tryout process was smooth and transparent. The travel commitment is real, so go in with eyes open, but the soccer education is first-rate.",
  },
];

const COACH_REVIEW_TEMPLATES = [
  {
    title: "Develops the whole player",
    body: "Coach pushes the kids technically and tactically but also builds their confidence. Plays everyone fairly and is great about explaining the 'why' behind decisions.",
  },
  {
    title: "Demanding in the best way",
    body: "High standards on and off the field. My son improved more in one season than the previous three combined. Communication with parents could be a touch more frequent.",
  },
  {
    title: "Calm and tactically sharp",
    body: "Never loses composure on the sideline, which the players feed off of. Game management and in-game adjustments are clearly a strength.",
  },
  {
    title: "Cares about the kids",
    body: "Beyond soccer, genuinely invested in the players as people. Fair with playing time and honest about where each kid stands and what they need to work on.",
  },
];

function clubReviews(seed: string, count: number): Review[] {
  const r = rng(seed + ":reviews");
  const out: Review[] = [];
  for (let i = 0; i < count; i++) {
    const t = CLUB_REVIEW_TEMPLATES[i % CLUB_REVIEW_TEMPLATES.length];
    const scores: ClubReviewScores = {
      coaching: score(r),
      development: score(r),
      organization: score(r),
      culture: score(r),
      value: score(r, 3.0),
      facilities: score(r, 3.0),
    };
    const overall =
      Math.round(((scores.coaching + scores.development + scores.organization + scores.culture + scores.value + scores.facilities) / 6) * 10) / 10;
    const daysAgo = Math.floor(r() * 540) + 5;
    out.push({
      id: `${seed}-rev-${i}`,
      author: REVIEW_AUTHORS[(hash(seed) + i) % REVIEW_AUTHORS.length],
      relationship: REVIEW_REL[i % REVIEW_REL.length],
      rating: overall,
      scores,
      title: t.title,
      body: t.body,
      created_at: new Date(Date.UTC(2026, 4, 31) - daysAgo * 86400000).toISOString(),
    });
  }
  return out.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

function avgClubScores(reviews: Review[]): ClubReviewScores {
  if (!reviews.length)
    return { coaching: 0, development: 0, organization: 0, culture: 0, value: 0, facilities: 0 };
  const acc = reviews.reduce(
    (a, rev) => {
      const s = rev.scores as ClubReviewScores;
      return {
        coaching: a.coaching + s.coaching,
        development: a.development + s.development,
        organization: a.organization + s.organization,
        culture: a.culture + s.culture,
        value: a.value + s.value,
        facilities: a.facilities + s.facilities,
      };
    },
    { coaching: 0, development: 0, organization: 0, culture: 0, value: 0, facilities: 0 }
  );
  const n = reviews.length;
  const round = (x: number) => Math.round((x / n) * 10) / 10;
  return {
    coaching: round(acc.coaching),
    development: round(acc.development),
    organization: round(acc.organization),
    culture: round(acc.culture),
    value: round(acc.value),
    facilities: round(acc.facilities),
  };
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildClub(raw: RawClub, idx: number): Club {
  const slug = slugify(raw.name);
  const r = rng(slug);
  const reviewCount = 3 + Math.floor(r() * 6);
  const reviews = clubReviews(slug, reviewCount);
  const scores = avgClubScores(reviews);
  const rating =
    Math.round((reviews.reduce((a, rv) => a + rv.rating, 0) / reviews.length) * 10) / 10;

  // Age groups: a contiguous-ish range
  const startIdx = Math.floor(r() * 3);
  const ages = ALL_AGES.slice(startIdx);
  const genders = r() > 0.85 ? ["Boys"] : r() > 0.7 ? ["Girls"] : ["Boys", "Girls"];
  const tryoutsOpen = r() > 0.45;

  // Normalize raw tokens to the canonical LEAGUES set (lib/regions.ts).
  const normalize = (l: string): string => {
    if (l === "ECRL") return "ECNL Regional League";
    if (l === "FSPL") return "Florida State Premier League (FSPL)";
    return l;
  };

  // Gender-appropriate extra pathways so each pyramid is represented in the data.
  const pool: string[] = ["Florida State Premier League (FSPL)", "FYSA Classic", "Recreational"];
  if (genders.includes("Girls")) pool.push("Girls Academy (GA)", "GA Conference", "Development Player League (DPL)");
  if (genders.includes("Boys")) pool.push("USL Academy", "Pre-ECNL");
  pool.push("USYS National League", "USYS National League P.R.O.", "National Premier Leagues (NPL)");

  const extraLeagues = pickMany(pool, r, 1, 3);
  const leagues = Array.from(new Set([...raw.topLeagues.map(normalize), ...extraLeagues]));

  // Monetization tier (demo distribution): ~18% Featured, ~22% Pro, rest Free.
  const planRoll = r();
  const plan: "free" | "pro" | "featured" = planRoll > 0.82 ? "featured" : planRoll > 0.6 ? "pro" : "free";
  const featured = plan === "featured";

  return {
    id: `club-${idx + 1}`,
    slug,
    name: raw.name,
    region: raw.region,
    city: raw.city,
    state: "FL",
    zip: raw.zip,
    lat: raw.lat,
    lng: raw.lng,
    founded: raw.founded,
    description: `${raw.name} is a youth soccer club based in ${raw.city}, Florida, founded in ${raw.founded}. The club fields competitive teams across ${ages.length} age groups and competes in ${raw.topLeagues.join(" and ")}. ${raw.name} focuses on long-term player development, a clear pathway to college and pro opportunities, and a positive team culture for families across the ${raw.region.replace(/-/g, " ")} area.`,
    logo_color: CREST_COLORS[idx % CREST_COLORS.length],
    website: raw.website,
    email: `info@${slug.replace(/-/g, "")}.com`,
    phone: `(${pick(["305", "561", "239", "813", "407", "321", "904", "352", "850"], r)}) ${100 + Math.floor(r() * 899)}-${1000 + Math.floor(r() * 8999)}`,
    instagram: `https://instagram.com/${slug.replace(/-/g, "")}`,
    facebook: `https://facebook.com/${slug.replace(/-/g, "")}`,
    twitter: `https://x.com/${slug.replace(/-/g, "")}`,
    leagues,
    age_groups: ages,
    genders,
    gallery: [`${slug}-1`, `${slug}-2`, `${slug}-3`, `${slug}-4`],
    featured,
    plan,
    tryouts_open: tryoutsOpen,
    tryout_note: tryoutsOpen
      ? `Open tryouts for the 2026–27 season are being held now. Register through the club website to reserve a spot for your age group.`
      : undefined,
    claimed: r() > 0.6,
    verified: r() > 0.5,
    rating,
    review_count: reviewCount,
    scores,
    reviews,
  };
}

export const CLUBS: Club[] = RAW_CLUBS.map(buildClub);

/* ------------------------------------------------------------------ *
 *  Coaches — derived from clubs.
 * ------------------------------------------------------------------ */
const COACH_FIRST = ["James", "Carlos", "Sarah", "Michael", "Ana", "David", "Laura", "Diego", "Emily", "Marco", "Rachel", "Luis", "Jennifer", "Paolo", "Megan", "Andre", "Christine", "Tom"];
const COACH_LAST = ["Rodriguez", "Thompson", "Silva", "Martinez", "Anderson", "Ferreira", "Walsh", "Garcia", "Bennett", "Rossi", "Cole", "Mendez", "Hughes", "Bianchi", "Reed", "Okafor", "Lindgren", "Carver"];
const CERTS = ["USSF A License", "USSF B License", "USSF C License", "USSF D License", "United Soccer Coaches Premier Diploma", "UEFA B License", "NSCAA Advanced National", "Goalkeeping Level 2"];
const COACH_TITLES = ["Director of Coaching", "Technical Director", "Boys ECNL Head Coach", "Girls ECNL Head Coach", "U15 Boys Head Coach", "U17 Girls Head Coach", "Director of Goalkeeping", "Academy Head Coach", "U13 Girls Head Coach", "U16 Boys Head Coach"];

function coachReviews(seed: string, count: number): Review[] {
  const r = rng(seed + ":creviews");
  const out: Review[] = [];
  for (let i = 0; i < count; i++) {
    const t = COACH_REVIEW_TEMPLATES[i % COACH_REVIEW_TEMPLATES.length];
    const scores: CoachReviewScores = {
      communication: score(r),
      development: score(r),
      personality: score(r),
      fairness: score(r),
      game_management: score(r),
      overall_impact: score(r),
    };
    const overall =
      Math.round(((scores.communication + scores.development + scores.personality + scores.fairness + scores.game_management + scores.overall_impact) / 6) * 10) / 10;
    const daysAgo = Math.floor(r() * 400) + 5;
    out.push({
      id: `${seed}-crev-${i}`,
      author: REVIEW_AUTHORS[(hash(seed) + i + 3) % REVIEW_AUTHORS.length],
      relationship: REVIEW_REL[i % REVIEW_REL.length],
      rating: overall,
      scores,
      title: t.title,
      body: t.body,
      created_at: new Date(Date.UTC(2026, 4, 31) - daysAgo * 86400000).toISOString(),
    });
  }
  return out.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

function avgCoachScores(reviews: Review[]): CoachReviewScores {
  const acc = reviews.reduce(
    (a, rev) => {
      const s = rev.scores as CoachReviewScores;
      return {
        communication: a.communication + s.communication,
        development: a.development + s.development,
        personality: a.personality + s.personality,
        fairness: a.fairness + s.fairness,
        game_management: a.game_management + s.game_management,
        overall_impact: a.overall_impact + s.overall_impact,
      };
    },
    { communication: 0, development: 0, personality: 0, fairness: 0, game_management: 0, overall_impact: 0 }
  );
  const n = reviews.length || 1;
  const round = (x: number) => Math.round((x / n) * 10) / 10;
  return {
    communication: round(acc.communication),
    development: round(acc.development),
    personality: round(acc.personality),
    fairness: round(acc.fairness),
    game_management: round(acc.game_management),
    overall_impact: round(acc.overall_impact),
  };
}

// Two coaches per club for the first ~18 clubs, one for the rest → ~70 coaches.
export const COACHES: Coach[] = (() => {
  const out: Coach[] = [];
  let n = 0;
  CLUBS.forEach((club, ci) => {
    const coachesForClub = ci < 18 ? 2 : 1;
    for (let k = 0; k < coachesForClub; k++) {
      const r = rng(`${club.slug}-coach-${k}`);
      const first = pick(COACH_FIRST, r);
      const last = pick(COACH_LAST, r);
      const name = `${first} ${last}`;
      const slug = slugify(`${name}-${club.slug}`);
      const reviewCount = 2 + Math.floor(r() * 5);
      const reviews = coachReviews(slug, reviewCount);
      const scores = avgCoachScores(reviews);
      const rating =
        Math.round((reviews.reduce((a, rv) => a + rv.rating, 0) / reviews.length) * 10) / 10;
      const title = COACH_TITLES[(ci + k) % COACH_TITLES.length];
      const privateTraining = r() > 0.4;
      const cpRoll = r();
      const coachPlan: "free" | "pro" | "featured" = cpRoll > 0.85 ? "featured" : cpRoll > 0.65 ? "pro" : "free";
      out.push({
        id: `coach-${++n}`,
        slug,
        name,
        region: club.region,
        city: club.city,
        club_id: club.id,
        club_name: club.name,
        title,
        bio: `${name} serves as ${title} at ${club.name}. With over ${5 + Math.floor(r() * 18)} years coaching youth soccer in Florida, ${first} specializes in player development and has guided multiple players to college commitments. ${first}'s coaching philosophy centers on technical mastery, game intelligence, and building confident, coachable players.`,
        photo_color: CREST_COLORS[(ci + k) % CREST_COLORS.length],
        certifications: pickMany(CERTS, r, 2, 4),
        specialties: pickMany(SPECIALTY_POOL, r, 2, 4),
        age_groups: club.age_groups.slice(Math.floor(r() * 4)),
        genders: club.genders,
        private_training: privateTraining,
        private_training_note: privateTraining
          ? "Offers private and small-group technical sessions on weekends. Rates and availability on request via the contact form."
          : undefined,
        email: `${slugify(name)}@${club.slug.replace(/-/g, "")}.com`,
        phone: club.phone,
        featured: coachPlan === "featured",
        plan: coachPlan,
        rating,
        review_count: reviewCount,
        scores,
        reviews,
      });
    }
  });
  return out;
})();

/* ------------------------------------------------------------------ *
 *  Tryouts — derived from clubs with tryouts_open.
 * ------------------------------------------------------------------ */
export const TRYOUTS: Tryout[] = CLUBS.filter((c) => c.tryouts_open).map((c, i) => {
  const r = rng(c.slug + "-tryout");
  const daysOut = 3 + Math.floor(r() * 40);
  return {
    id: `tryout-${i + 1}`,
    club_id: c.id,
    club_name: c.name,
    club_slug: c.slug,
    region: c.region,
    city: c.city,
    age_groups: `${c.age_groups[0]}–${c.age_groups[c.age_groups.length - 1]}`,
    gender: c.genders.join(" & "),
    date: new Date(Date.UTC(2026, 4, 31) + daysOut * 86400000).toISOString(),
    note: `${c.genders.join(" & ")} ${c.age_groups[0]}–${c.age_groups[c.age_groups.length - 1]} • ${c.city}, FL`,
  };
});
