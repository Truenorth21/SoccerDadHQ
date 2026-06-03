import type { RegionKey } from "./regions";
import type { School, SchoolReviewScores, Review } from "./types";

/* Deterministic helpers (kept local to avoid coupling with the club seed). */
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
function score(r: () => number, floor = 3.4): number {
  return Math.round((floor + r() * (5 - floor)) * 10) / 10;
}
export function slugifySchool(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const CREST_COLORS = ["#1a4fa0", "#0a1628", "#2a7de1", "#1d7a4d", "#9b2d2d", "#5a2d82", "#b8860b"];

interface RawSchool {
  name: string;
  region: RegionKey;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  type: "Public" | "Private";
  cls: string;
  mascot: string;
  stateTitles: number;
}

/* Real Florida high schools with notable soccer programs. */
const RAW_SCHOOLS: RawSchool[] = [
  // South Florida
  { name: "American Heritage School", region: "south-florida", city: "Plantation", zip: "33324", lat: 26.1276, lng: -80.2331, type: "Private", cls: "Class 5A", mascot: "Patriots", stateTitles: 4 },
  { name: "St. Thomas Aquinas High School", region: "south-florida", city: "Fort Lauderdale", zip: "33312", lat: 26.1066, lng: -80.1631, type: "Private", cls: "Class 6A", mascot: "Raiders", stateTitles: 3 },
  { name: "Gulliver Preparatory School", region: "south-florida", city: "Miami", zip: "33156", lat: 25.6695, lng: -80.2861, type: "Private", cls: "Class 4A", mascot: "Raiders", stateTitles: 2 },
  { name: "Belen Jesuit Preparatory", region: "south-florida", city: "Miami", zip: "33185", lat: 25.7459, lng: -80.4109, type: "Private", cls: "Class 6A", mascot: "Wolverines", stateTitles: 5 },
  { name: "Cardinal Gibbons High School", region: "south-florida", city: "Fort Lauderdale", zip: "33308", lat: 26.1834, lng: -80.1062, type: "Private", cls: "Class 4A", mascot: "Chiefs", stateTitles: 1 },

  // Palm Beach / Treasure Coast
  { name: "Jupiter High School", region: "palm-beach-treasure-coast", city: "Jupiter", zip: "33458", lat: 26.9342, lng: -80.0942, type: "Public", cls: "Class 7A", mascot: "Warriors", stateTitles: 1 },
  { name: "The Benjamin School", region: "palm-beach-treasure-coast", city: "Palm Beach Gardens", zip: "33418", lat: 26.8767, lng: -80.1417, type: "Private", cls: "Class 3A", mascot: "Buccaneers", stateTitles: 2 },
  { name: "Vero Beach High School", region: "palm-beach-treasure-coast", city: "Vero Beach", zip: "32960", lat: 27.6386, lng: -80.3973, type: "Public", cls: "Class 7A", mascot: "Fighting Indians", stateTitles: 0 },
  { name: "Oxbridge Academy", region: "palm-beach-treasure-coast", city: "West Palm Beach", zip: "33409", lat: 26.7261, lng: -80.0921, type: "Private", cls: "Class 3A", mascot: "ThunderWolves", stateTitles: 0 },

  // Southwest Florida
  { name: "Naples High School", region: "southwest-florida", city: "Naples", zip: "34102", lat: 26.1559, lng: -81.7942, type: "Public", cls: "Class 5A", mascot: "Golden Eagles", stateTitles: 1 },
  { name: "Gulf Coast High School", region: "southwest-florida", city: "Naples", zip: "34119", lat: 26.2745, lng: -81.7170, type: "Public", cls: "Class 6A", mascot: "Sharks", stateTitles: 0 },
  { name: "Fort Myers High School", region: "southwest-florida", city: "Fort Myers", zip: "33901", lat: 26.6244, lng: -81.8723, type: "Public", cls: "Class 5A", mascot: "Green Wave", stateTitles: 1 },
  { name: "Canterbury School", region: "southwest-florida", city: "Fort Myers", zip: "33919", lat: 26.5497, lng: -81.8959, type: "Private", cls: "Class 2A", mascot: "Cougars", stateTitles: 0 },

  // Tampa Bay
  { name: "Jesuit High School", region: "tampa-bay", city: "Tampa", zip: "33614", lat: 27.9911, lng: -82.4882, type: "Private", cls: "Class 5A", mascot: "Tigers", stateTitles: 3 },
  { name: "Tampa Catholic High School", region: "tampa-bay", city: "Tampa", zip: "33607", lat: 27.9659, lng: -82.4823, type: "Private", cls: "Class 3A", mascot: "Crusaders", stateTitles: 1 },
  { name: "Plant High School", region: "tampa-bay", city: "Tampa", zip: "33629", lat: 27.9270, lng: -82.5076, type: "Public", cls: "Class 7A", mascot: "Panthers", stateTitles: 2 },
  { name: "Berkeley Preparatory School", region: "tampa-bay", city: "Tampa", zip: "33615", lat: 28.0119, lng: -82.5851, type: "Private", cls: "Class 4A", mascot: "Buccaneers", stateTitles: 1 },

  // Orlando / Central
  { name: "Lake Highland Preparatory", region: "orlando-central", city: "Orlando", zip: "32803", lat: 28.5601, lng: -81.3656, type: "Private", cls: "Class 4A", mascot: "Highlanders", stateTitles: 6 },
  { name: "Bishop Moore Catholic", region: "orlando-central", city: "Orlando", zip: "32804", lat: 28.5740, lng: -81.3920, type: "Private", cls: "Class 4A", mascot: "Hornets", stateTitles: 3 },
  { name: "Winter Park High School", region: "orlando-central", city: "Winter Park", zip: "32792", lat: 28.5999, lng: -81.3392, type: "Public", cls: "Class 7A", mascot: "Wildcats", stateTitles: 1 },
  { name: "Lake Mary High School", region: "orlando-central", city: "Lake Mary", zip: "32746", lat: 28.7589, lng: -81.3187, type: "Public", cls: "Class 7A", mascot: "Rams", stateTitles: 2 },
  { name: "Hagerty High School", region: "orlando-central", city: "Oviedo", zip: "32765", lat: 28.6700, lng: -81.2081, type: "Public", cls: "Class 6A", mascot: "Huskies", stateTitles: 0 },

  // Space Coast / Daytona
  { name: "Melbourne High School", region: "space-coast-daytona", city: "Melbourne", zip: "32901", lat: 28.0836, lng: -80.6081, type: "Public", cls: "Class 6A", mascot: "Bulldogs", stateTitles: 1 },
  { name: "Viera High School", region: "space-coast-daytona", city: "Viera", zip: "32940", lat: 28.2569, lng: -80.7290, type: "Public", cls: "Class 6A", mascot: "Hawks", stateTitles: 0 },
  { name: "Spruce Creek High School", region: "space-coast-daytona", city: "Port Orange", zip: "32127", lat: 29.0610, lng: -80.9959, type: "Public", cls: "Class 7A", mascot: "Hawks", stateTitles: 1 },

  // Jacksonville / NE
  { name: "The Bolles School", region: "jacksonville-ne", city: "Jacksonville", zip: "32217", lat: 30.2497, lng: -81.6334, type: "Private", cls: "Class 4A", mascot: "Bulldogs", stateTitles: 4 },
  { name: "Episcopal School of Jacksonville", region: "jacksonville-ne", city: "Jacksonville", zip: "32207", lat: 30.3083, lng: -81.6359, type: "Private", cls: "Class 3A", mascot: "Eagles", stateTitles: 2 },
  { name: "Bishop Kenny High School", region: "jacksonville-ne", city: "Jacksonville", zip: "32207", lat: 30.3019, lng: -81.6390, type: "Private", cls: "Class 5A", mascot: "Crusaders", stateTitles: 2 },
  { name: "Ponte Vedra High School", region: "jacksonville-ne", city: "Ponte Vedra Beach", zip: "32081", lat: 30.0913, lng: -81.4126, type: "Public", cls: "Class 5A", mascot: "Sharks", stateTitles: 1 },
  { name: "Creekside High School", region: "jacksonville-ne", city: "Saint Johns", zip: "32259", lat: 30.0852, lng: -81.5418, type: "Public", cls: "Class 6A", mascot: "Knights", stateTitles: 1 },

  // North / Gainesville
  { name: "Buchholz High School", region: "north-gainesville", city: "Gainesville", zip: "32606", lat: 29.6989, lng: -82.4382, type: "Public", cls: "Class 7A", mascot: "Bobcats", stateTitles: 1 },
  { name: "Gainesville High School", region: "north-gainesville", city: "Gainesville", zip: "32605", lat: 29.6755, lng: -82.3501, type: "Public", cls: "Class 6A", mascot: "Hurricanes", stateTitles: 0 },
  { name: "Oak Hall School", region: "north-gainesville", city: "Gainesville", zip: "32607", lat: 29.6516, lng: -82.4135, type: "Private", cls: "Class 2A", mascot: "Eagles", stateTitles: 1 },

  // Panhandle / Tallahassee
  { name: "Leon High School", region: "panhandle-tallahassee", city: "Tallahassee", zip: "32303", lat: 30.4596, lng: -84.2877, type: "Public", cls: "Class 6A", mascot: "Lions", stateTitles: 2 },
  { name: "Maclay School", region: "panhandle-tallahassee", city: "Tallahassee", zip: "32312", lat: 30.5388, lng: -84.2620, type: "Private", cls: "Class 2A", mascot: "Marauders", stateTitles: 3 },
  { name: "Lincoln High School", region: "panhandle-tallahassee", city: "Tallahassee", zip: "32311", lat: 30.4404, lng: -84.2230, type: "Public", cls: "Class 6A", mascot: "Trojans", stateTitles: 1 },
  { name: "Gulf Breeze High School", region: "panhandle-tallahassee", city: "Gulf Breeze", zip: "32563", lat: 30.3735, lng: -87.1003, type: "Public", cls: "Class 5A", mascot: "Dolphins", stateTitles: 0 },
];

const COACH_FIRST = ["Mark", "Tony", "Sandra", "Greg", "Maria", "Paul", "Dana", "Hector", "Lauren", "Sergio", "Beth", "Will", "Karen", "Rob", "Elena"];
const COACH_LAST = ["Sullivan", "Vega", "Whitfield", "Moreno", "Hayes", "Castillo", "Park", "Delgado", "Foster", "Romano", "Boyd", "Nguyen", "Sharp", "Adkins", "Pope"];

const REVIEW_AUTHORS = ["Mike R.", "Jessica T.", "Carlos M.", "Amanda P.", "David L.", "Priya S.", "Tom B.", "Maria G.", "Kevin W.", "Sophia C."];
const REVIEW_REL = ["Parent", "Player", "Alum", "Parent of two players"];

const SCHOOL_REVIEW_TEMPLATES = [
  { title: "Strong program, great coach", body: "The soccer program is well run and the coaching staff genuinely develops players. Balancing athletics with the academic load is demanding but the school supports it." },
  { title: "Competitive and well organized", body: "Consistently competitive in our district and the team culture is excellent. Tryouts are fair and the varsity coach communicates clearly with families." },
  { title: "Academics first, soccer close behind", body: "If you want a place that takes both the classroom and the pitch seriously, this is it. Facilities are solid and the booster support is strong." },
  { title: "Good fit for a serious student-athlete", body: "Real pathway for players who also want a strong academic environment. The program has sent several kids on to college soccer." },
  { title: "Team culture stands out", body: "Coaches build a positive, accountable culture. Playing time is earned and the program develops the whole player, not just the starters." },
];

function schoolReviews(seed: string, count: number): Review[] {
  const r = rng(seed + ":sreviews");
  const out: Review[] = [];
  for (let i = 0; i < count; i++) {
    const t = SCHOOL_REVIEW_TEMPLATES[i % SCHOOL_REVIEW_TEMPLATES.length];
    const scores: SchoolReviewScores = {
      coaching: score(r),
      development: score(r),
      culture: score(r),
      competitiveness: score(r),
      academics: score(r, 3.6),
      facilities: score(r, 3.0),
    };
    const overall =
      Math.round(((scores.coaching + scores.development + scores.culture + scores.competitiveness + scores.academics + scores.facilities) / 6) * 10) / 10;
    const daysAgo = Math.floor(r() * 500) + 5;
    out.push({
      id: `${seed}-srev-${i}`,
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

function avgSchoolScores(reviews: Review[]): SchoolReviewScores {
  const acc = reviews.reduce(
    (a, rev) => {
      const s = rev.scores as SchoolReviewScores;
      return {
        coaching: a.coaching + s.coaching,
        development: a.development + s.development,
        culture: a.culture + s.culture,
        competitiveness: a.competitiveness + s.competitiveness,
        academics: a.academics + s.academics,
        facilities: a.facilities + s.facilities,
      };
    },
    { coaching: 0, development: 0, culture: 0, competitiveness: 0, academics: 0, facilities: 0 }
  );
  const n = reviews.length || 1;
  const round = (x: number) => Math.round((x / n) * 10) / 10;
  return {
    coaching: round(acc.coaching),
    development: round(acc.development),
    culture: round(acc.culture),
    competitiveness: round(acc.competitiveness),
    academics: round(acc.academics),
    facilities: round(acc.facilities),
  };
}

function buildSchool(raw: RawSchool, idx: number): School {
  const slug = slugifySchool(raw.name);
  const r = rng(slug);
  const reviewCount = 3 + Math.floor(r() * 5);
  const reviews = schoolReviews(slug, reviewCount);
  const scores = avgSchoolScores(reviews);
  const rating =
    Math.round((reviews.reduce((a, rv) => a + rv.rating, 0) / reviews.length) * 10) / 10;

  const programs = r() > 0.92 ? ["Boys"] : r() > 0.85 ? ["Girls"] : ["Boys", "Girls"];
  const lastTitle = raw.stateTitles > 0 ? 2009 + Math.floor(r() * 16) : undefined;
  const planRoll = r();
  const plan: "free" | "pro" | "featured" = planRoll > 0.82 ? "featured" : planRoll > 0.6 ? "pro" : "free";

  return {
    id: `school-${idx + 1}`,
    slug,
    name: raw.name,
    region: raw.region,
    city: raw.city,
    state: "FL",
    zip: raw.zip,
    lat: raw.lat,
    lng: raw.lng,
    type: raw.type,
    fhsaa_class: raw.cls,
    district: `District ${1 + Math.floor(r() * 16)}`,
    mascot: raw.mascot,
    colors: [CREST_COLORS[idx % CREST_COLORS.length], "#e8a020"],
    logo_color: CREST_COLORS[idx % CREST_COLORS.length],
    programs,
    head_coach_boys: programs.includes("Boys") ? `${pick(COACH_FIRST, r)} ${pick(COACH_LAST, r)}` : undefined,
    head_coach_girls: programs.includes("Girls") ? `${pick(COACH_FIRST, r)} ${pick(COACH_LAST, r)}` : undefined,
    state_titles: raw.stateTitles,
    last_title: lastTitle,
    district_titles: raw.stateTitles * 2 + Math.floor(r() * 6),
    enrollment: 700 + Math.floor(r() * 2600),
    description: `${raw.name} (${raw.mascot}) is a${raw.type === "Private" ? " private" : " public"} ${raw.cls} high school in ${raw.city}, Florida, with ${programs.join(" and ")} soccer competing under the FHSAA. ${raw.stateTitles > 0 ? `The program has captured ${raw.stateTitles} state championship${raw.stateTitles === 1 ? "" : "s"} and is a perennial contender in its district.` : "The program is a competitive member of its district and a steady developer of college-bound players."} ${raw.name} blends a demanding academic environment with a serious commitment to soccer.`,
    website: `https://www.${slug.replace(/-/g, "")}.org`,
    featured: plan === "featured",
    plan,
    rating,
    review_count: reviewCount,
    scores,
    reviews,
  };
}

export const SCHOOLS: School[] = RAW_SCHOOLS.map(buildSchool);
