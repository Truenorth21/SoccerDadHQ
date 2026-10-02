import { resolveState } from "./states";

/** Florida's original nine regions (keys predate the national expansion). */
export type FloridaRegionKey =
  | "south-florida"
  | "palm-beach-treasure-coast"
  | "southwest-florida"
  | "tampa-bay"
  | "orlando-central"
  | "space-coast-daytona"
  | "jacksonville-ne"
  | "north-gainesville"
  | "panhandle-tallahassee";

/** Any region key, in any state. Florida keys are bare ("tampa-bay"); every other
 *  state's keys are prefixed with its lowercase code ("tx-dfw") so they stay unique. */
export type RegionKey = string;

export interface Region {
  key: RegionKey;
  state: string; // two-letter state code
  slug: string; // URL segment under /clubs/[state]/[region]
  name: string;
  short: string;
  description: string;
}

type RegionDef = Omit<Region, "state" | "key" | "slug"> & { slug: string };

function defineRegions(state: string, defs: RegionDef[]): Region[] {
  const prefix = state === "FL" ? "" : `${state.toLowerCase()}-`;
  return defs.map((d) => ({ ...d, state, key: `${prefix}${d.slug}` }));
}

/** Florida regions. Still exported as REGIONS because the Florida-only sections
 *  (FHSAA schools, listings, commitments) filter by these. */
export const REGIONS: Region[] = defineRegions("FL", [
  {
    slug: "south-florida",
    name: "South Florida",
    short: "Miami / Broward",
    description: "Miami-Dade & Broward — the deepest, most competitive youth pyramid in the state.",
  },
  {
    slug: "palm-beach-treasure-coast",
    name: "Palm Beach / Treasure Coast",
    short: "Palm Beach / TC",
    description: "Palm Beach County up through the Treasure Coast.",
  },
  {
    slug: "southwest-florida",
    name: "Southwest Florida",
    short: "Naples / Fort Myers",
    description: "Naples, Fort Myers, Sarasota and the Gulf Coast.",
  },
  {
    slug: "tampa-bay",
    name: "Tampa Bay",
    short: "Tampa / St. Pete",
    description: "Tampa, St. Petersburg, Clearwater and the I-4 corridor's west end.",
  },
  {
    slug: "orlando-central",
    name: "Orlando / Central FL",
    short: "Orlando",
    description: "Greater Orlando, Seminole, Lake and Osceola counties.",
  },
  {
    slug: "space-coast-daytona",
    name: "Space Coast / Daytona",
    short: "Space Coast",
    description: "Brevard County and the Daytona / Volusia coastline.",
  },
  {
    slug: "jacksonville-ne",
    name: "Jacksonville / NE Florida",
    short: "Jacksonville",
    description: "Jacksonville, St. Augustine, Ponte Vedra and the First Coast.",
  },
  {
    slug: "north-gainesville",
    name: "North FL / Gainesville",
    short: "Gainesville",
    description: "Gainesville, Ocala and North Central Florida.",
  },
  {
    slug: "panhandle-tallahassee",
    name: "Panhandle / Tallahassee",
    short: "Panhandle",
    description: "Tallahassee, Pensacola and the Emerald Coast.",
  },
]);

/** Predefined regions for the biggest soccer states. States not listed here have
 *  no regions — their directory pages fall back to city / ZIP search. */
const NATIONAL_REGIONS: Region[] = [
  ...defineRegions("TX", [
    { slug: "dfw", name: "DFW", short: "Dallas / Fort Worth", description: "Dallas, Fort Worth, Frisco, Plano and the Metroplex." },
    { slug: "houston", name: "Houston", short: "Houston", description: "Greater Houston, Katy, Sugar Land and The Woodlands." },
    { slug: "austin-san-antonio", name: "Austin/San Antonio", short: "Austin", description: "Austin, Round Rock and the I-35 Hill Country corridor." },
    { slug: "san-antonio", name: "San Antonio", short: "San Antonio", description: "San Antonio, New Braunfels and the Alamo City area." },
    { slug: "west-texas", name: "West Texas", short: "West Texas", description: "El Paso, Lubbock, Midland-Odessa and the Panhandle." },
  ]),
  ...defineRegions("GA", [
    { slug: "atlanta-metro", name: "Atlanta Metro", short: "Atlanta", description: "Atlanta, Gwinnett, Cobb, North Fulton and the metro suburbs." },
    { slug: "north-georgia", name: "North Georgia", short: "North GA", description: "Gainesville, Athens, Rome, Dalton and the North Georgia mountains." },
    { slug: "savannah-coastal", name: "Savannah/Coastal", short: "Savannah", description: "Savannah, Brunswick and the Golden Isles." },
    { slug: "middle-georgia", name: "Middle Georgia", short: "Macon", description: "Macon, Warner Robins, Columbus and Central Georgia." },
  ]),
  ...defineRegions("NC", [
    { slug: "charlotte", name: "Charlotte", short: "Charlotte", description: "Charlotte, Lake Norman, Union and Gaston counties." },
    { slug: "triangle", name: "Triangle/Raleigh-Durham", short: "Triangle", description: "Raleigh, Durham, Cary, Chapel Hill and Wake County." },
    { slug: "triad", name: "Triad/Greensboro", short: "Triad", description: "Greensboro, Winston-Salem and High Point." },
    { slug: "wilmington", name: "Wilmington", short: "Wilmington", description: "Wilmington, Cape Fear and the southeastern coast." },
  ]),
  ...defineRegions("SC", [
    { slug: "charleston", name: "Charleston", short: "Charleston", description: "Charleston, the Lowcountry and the coast." },
    { slug: "columbia", name: "Columbia", short: "Columbia", description: "Columbia, Lexington and the Midlands." },
    { slug: "greenville-upstate", name: "Greenville/Upstate", short: "Upstate", description: "Greenville, Spartanburg, Anderson and the Upstate." },
  ]),
  ...defineRegions("TN", [
    { slug: "nashville", name: "Nashville", short: "Nashville", description: "Nashville, Franklin, Murfreesboro and Middle Tennessee." },
    { slug: "memphis", name: "Memphis", short: "Memphis", description: "Memphis, Germantown, Collierville and West Tennessee." },
    { slug: "knoxville", name: "Knoxville", short: "Knoxville", description: "Knoxville, Maryville, Oak Ridge and East Tennessee." },
    { slug: "chattanooga", name: "Chattanooga", short: "Chattanooga", description: "Chattanooga, Cleveland and the Tennessee Valley." },
  ]),
  ...defineRegions("CA", [
    { slug: "la-socal", name: "LA/SoCal", short: "Los Angeles", description: "Los Angeles, Orange County, the Inland Empire and Southern California." },
    { slug: "bay-area-norcal", name: "Bay Area/NorCal", short: "Bay Area", description: "San Francisco, San Jose, the East Bay and Northern California." },
    { slug: "san-diego", name: "San Diego", short: "San Diego", description: "San Diego County and North County." },
    { slug: "sacramento", name: "Sacramento", short: "Sacramento", description: "Sacramento, Placer County and the Capital region." },
    { slug: "central-valley", name: "Central Valley", short: "Central Valley", description: "Fresno, Modesto, Bakersfield and the Central Valley." },
  ]),
  ...defineRegions("NY", [
    { slug: "nyc-metro", name: "NYC Metro", short: "NYC", description: "The five boroughs and Westchester." },
    { slug: "long-island", name: "Long Island", short: "Long Island", description: "Nassau and Suffolk counties." },
    { slug: "hudson-valley", name: "Hudson Valley", short: "Hudson Valley", description: "Rockland, Orange, Dutchess and the Hudson Valley." },
    { slug: "upstate-ny", name: "Upstate NY", short: "Upstate", description: "Albany, Syracuse, Rochester, Buffalo and Upstate New York." },
  ]),
  ...defineRegions("NJ", [
    { slug: "north-nj", name: "North NJ", short: "North NJ", description: "Bergen, Essex, Morris, Passaic and North Jersey." },
    { slug: "central-nj", name: "Central NJ", short: "Central NJ", description: "Middlesex, Monmouth, Somerset and Mercer counties." },
    { slug: "south-nj", name: "South NJ", short: "South NJ", description: "Camden, Burlington, Gloucester and the Jersey Shore south." },
  ]),
  ...defineRegions("VA", [
    { slug: "northern-va-dc-metro", name: "Northern VA/DC Metro", short: "NoVA", description: "Fairfax, Loudoun, Arlington, Prince William and the DC suburbs." },
    { slug: "richmond", name: "Richmond", short: "Richmond", description: "Richmond, Henrico, Chesterfield and Central Virginia." },
    { slug: "hampton-roads", name: "Hampton Roads", short: "Hampton Roads", description: "Virginia Beach, Norfolk, Chesapeake and the Peninsula." },
    { slug: "shenandoah-valley", name: "Shenandoah Valley", short: "Shenandoah", description: "Harrisonburg, Winchester, Staunton and the Valley." },
  ]),
  ...defineRegions("IL", [
    { slug: "chicagoland", name: "Chicagoland", short: "Chicago", description: "Chicago and the collar counties." },
    { slug: "central-il", name: "Central IL", short: "Central IL", description: "Springfield, Peoria, Bloomington-Normal and Champaign." },
    { slug: "southern-il", name: "Southern IL", short: "Southern IL", description: "Metro East, Carbondale and Southern Illinois." },
  ]),
  ...defineRegions("PA", [
    { slug: "philadelphia", name: "Philadelphia/Suburbs", short: "Philly", description: "Philadelphia, the Main Line, Bucks, Montgomery, Delaware and Chester counties." },
    { slug: "pittsburgh", name: "Pittsburgh/Western PA", short: "Pittsburgh", description: "Pittsburgh, Allegheny County, Erie and Western Pennsylvania." },
    { slug: "central-pa", name: "Central PA", short: "Central PA", description: "Harrisburg, Lancaster, York, Hershey and State College." },
    { slug: "lehigh-valley-ne", name: "Lehigh Valley/NE PA", short: "Lehigh Valley", description: "Allentown, Bethlehem, Reading, Scranton and Wilkes-Barre." },
  ]),
  ...defineRegions("OH", [
    { slug: "columbus", name: "Columbus/Central OH", short: "Columbus", description: "Columbus, Dublin, Westerville and Central Ohio." },
    { slug: "cleveland-ne", name: "Cleveland/NE Ohio", short: "Cleveland", description: "Cleveland, Akron, Canton and Northeast Ohio." },
    { slug: "cincinnati-dayton", name: "Cincinnati/Dayton", short: "Cincinnati", description: "Cincinnati, Dayton and Southwest Ohio." },
    { slug: "toledo-nw", name: "Toledo/NW Ohio", short: "Toledo", description: "Toledo, Findlay and Northwest Ohio." },
  ]),
  ...defineRegions("MD", [
    { slug: "baltimore", name: "Baltimore Metro", short: "Baltimore", description: "Baltimore City and County, Howard, Harford and Carroll counties." },
    { slug: "dc-suburbs", name: "DC Suburbs", short: "MoCo / PG", description: "Montgomery and Prince George's counties and the Maryland side of DC." },
    { slug: "annapolis-southern", name: "Annapolis/Southern MD", short: "Annapolis", description: "Anne Arundel, Calvert, Charles and St. Mary's counties." },
    { slug: "western-md", name: "Frederick/Western MD", short: "Frederick", description: "Frederick, Hagerstown and Western Maryland." },
    { slug: "eastern-shore", name: "Eastern Shore", short: "Eastern Shore", description: "Salisbury, Easton, Ocean City and the Eastern Shore." },
  ]),
  ...defineRegions("WA", [
    { slug: "seattle-eastside", name: "Seattle/Eastside", short: "Seattle", description: "Seattle, Bellevue, Redmond, Issaquah and King County." },
    { slug: "tacoma-south-sound", name: "Tacoma/South Sound", short: "Tacoma", description: "Tacoma, Puyallup, Gig Harbor, Olympia and the South Sound." },
    { slug: "north-sound", name: "North Sound", short: "North Sound", description: "Everett, Snohomish County, Skagit and Bellingham." },
    { slug: "southwest-wa", name: "Vancouver/SW Washington", short: "Vancouver", description: "Vancouver, Clark County and Southwest Washington." },
    { slug: "eastern-wa", name: "Spokane/Eastern WA", short: "Spokane", description: "Spokane, the Tri-Cities, Yakima and Eastern Washington." },
  ]),
  ...defineRegions("CO", [
    { slug: "denver-metro", name: "Denver Metro", short: "Denver", description: "Denver, Aurora, Littleton, Centennial and the metro suburbs." },
    { slug: "boulder-northern", name: "Boulder/Northern CO", short: "Northern CO", description: "Boulder, Longmont, Fort Collins, Loveland and Greeley." },
    { slug: "colorado-springs", name: "Colorado Springs/Southern CO", short: "Colorado Springs", description: "Colorado Springs, Pueblo and Southern Colorado." },
    { slug: "western-slope", name: "Western Slope/Mountains", short: "Western Slope", description: "Grand Junction, Durango and the mountain towns." },
  ]),
  ...defineRegions("AZ", [
    { slug: "phoenix-west", name: "Phoenix/West Valley", short: "Phoenix", description: "Phoenix, Glendale, Peoria, Surprise and the West Valley." },
    { slug: "east-valley", name: "East Valley/Scottsdale", short: "East Valley", description: "Scottsdale, Tempe, Mesa, Chandler, Gilbert and Queen Creek." },
    { slug: "tucson-southern", name: "Tucson/Southern AZ", short: "Tucson", description: "Tucson, Marana, Sierra Vista and Yuma." },
    { slug: "northern-az", name: "Northern AZ", short: "Northern AZ", description: "Flagstaff, Prescott and Northern Arizona." },
  ]),
  ...defineRegions("MA", [
    { slug: "boston-metro", name: "Boston Metro", short: "Boston", description: "Boston, Newton, Lexington and the inner suburbs." },
    { slug: "north-shore-merrimack", name: "North Shore/Merrimack Valley", short: "North Shore", description: "The North Shore, Lowell, Andover and the Merrimack Valley." },
    { slug: "south-shore-cape", name: "South Shore/Cape Cod", short: "South Shore", description: "Foxborough, the South Shore, the South Coast and Cape Cod." },
    { slug: "central-ma", name: "Central MA", short: "Worcester", description: "Worcester and Central Massachusetts." },
    { slug: "western-ma", name: "Western MA", short: "Western MA", description: "Springfield, the Pioneer Valley and the Berkshires." },
  ]),
];

/** Every region in every state. */
export const ALL_REGIONS: Region[] = [...REGIONS, ...NATIONAL_REGIONS];

/** Regions for one state (empty when the state has no predefined regions). */
export function regionsForState(state: string | null | undefined): Region[] {
  if (!state) return [];
  const code = state.toUpperCase();
  return ALL_REGIONS.filter((r) => r.state === code);
}

/** Find a region by its state + URL slug (for /clubs/[state]/[region]). */
export function regionBySlug(state: string, slug: string): Region | undefined {
  const code = state.toUpperCase();
  return ALL_REGIONS.find((r) => r.state === code && r.slug === slug);
}

/** State codes that have predefined regions. */
export const STATES_WITH_REGIONS: string[] = Array.from(new Set(ALL_REGIONS.map((r) => r.state)));

export const REGION_MAP: Record<RegionKey, Region> = ALL_REGIONS.reduce(
  (acc, r) => ({ ...acc, [r.key]: r }),
  {} as Record<RegionKey, Region>
);

export function regionName(key: string): string {
  return REGION_MAP[key]?.name ?? key;
}

/** The state a region belongs to, or undefined for unknown keys. */
export function regionState(key: string): string | undefined {
  return REGION_MAP[key]?.state;
}

// Organized by competitive pyramid. These tokens are the single source of
// truth — club seed data and the directory filter both use them verbatim.
export const LEAGUES = [
  // ECNL pyramid
  "ECNL",
  "ECNL Regional League",
  "Pre-ECNL",
  // Girls Academy pyramid
  "Girls Academy (GA)",
  "GA Conference",
  // Boys elite
  "MLS NEXT",
  "USL Academy",
  // US Youth Soccer National League pyramid
  "USYS National League",
  "USYS National League P.R.O.",
  // US Club Soccer
  "National Premier Leagues (NPL)",
  "Development Player League (DPL)",
  // Florida state leagues
  "Florida State Premier League (FSPL)",
  "FYSA Classic",
  // Recreational
  "Recreational",
] as const;

// Convenience groupings for the leagues explainer in the UI.
export const LEAGUE_GROUPS: { label: string; leagues: string[] }[] = [
  { label: "ECNL pyramid", leagues: ["ECNL", "ECNL Regional League", "Pre-ECNL"] },
  { label: "Girls Academy pyramid", leagues: ["Girls Academy (GA)", "GA Conference"] },
  { label: "Boys elite", leagues: ["MLS NEXT", "USL Academy"] },
  { label: "National League", leagues: ["USYS National League", "USYS National League P.R.O."] },
  { label: "US Club Soccer", leagues: ["National Premier Leagues (NPL)", "Development Player League (DPL)"] },
  { label: "Florida state", leagues: ["Florida State Premier League (FSPL)", "FYSA Classic"] },
  { label: "Recreational", leagues: ["Recreational"] },
];

export const AGE_GROUPS = [
  "U6",
  "U8",
  "U9",
  "U10",
  "U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
  "U17",
  "U18",
  "U19",
] as const;

export const GENDERS = ["Boys", "Girls", "Coed"] as const;

export const CLUB_REVIEW_CATEGORIES = [
  { key: "coaching", label: "Coaching" },
  { key: "development", label: "Development" },
  { key: "organization", label: "Organization" },
  { key: "culture", label: "Culture" },
  { key: "value", label: "Value" },
  { key: "facilities", label: "Facilities" },
] as const;

export const SCHOOL_REVIEW_CATEGORIES = [
  { key: "coaching", label: "Coaching" },
  { key: "development", label: "Development" },
  { key: "culture", label: "Team Culture" },
  { key: "competitiveness", label: "Competitiveness" },
  { key: "academics", label: "Academics" },
  { key: "facilities", label: "Facilities" },
] as const;

export const FHSAA_CLASSES = [
  "Class 1A",
  "Class 2A",
  "Class 3A",
  "Class 4A",
  "Class 5A",
  "Class 6A",
  "Class 7A",
] as const;

export const SCHOOL_TYPES = ["Public", "Private"] as const;

export const TEAM_LEVELS = ["Varsity", "JV", "Middle School"] as const;

export const COMMITMENT_TYPES = ["College", "Pro", "National Team"] as const;
export const NCAA_DIVISIONS = ["NCAA D1", "NCAA D2", "NCAA D3", "NAIA", "JUCO"] as const;
export const PLAYER_POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"] as const;
export const GRAD_YEARS = [2024, 2025, 2026, 2027, 2028] as const;

export const COACH_REVIEW_CATEGORIES = [
  { key: "communication", label: "Communication" },
  { key: "development", label: "Development" },
  { key: "personality", label: "Personality" },
  { key: "fairness", label: "Fairness" },
  { key: "game_management", label: "Game Management" },
  { key: "overall_impact", label: "Overall Impact" },
] as const;

export const RANKING_CATEGORIES = [
  { key: "clubs", label: "Clubs" },
  { key: "schools", label: "Schools" },
  { key: "coaches", label: "Coaches" },
  { key: "training-centers", label: "Training Centers" },
  { key: "facilities", label: "Facilities" },
  { key: "tournaments", label: "Tournaments" },
  { key: "camps", label: "Camps" },
] as const;

/** Resolve loose state + region input (admin forms, CSV imports) to a valid pair.
 *  Region may be a key ("tx-dfw") or a name ("DFW"); state may be a code, slug or
 *  name. Either one can imply the other; a region is optional for any state.
 */
export function resolveLocation(
  stateInput: string | null | undefined,
  regionInput: string | null | undefined
): { state: string; region: string | null } | { error: string } {
  const st = (stateInput ?? "").trim();
  const rg = (regionInput ?? "").trim();
  const state = st ? resolveState(st) : undefined;
  if (st && !state) return { error: `unknown state "${st}"` };
  if (!rg) {
    if (!state) return { error: "a state or region is required" };
    return { state: state.code, region: null };
  }
  const pool = state ? regionsForState(state.code) : ALL_REGIONS;
  const region =
    REGION_MAP[rg] ?? pool.find((r) => r.name.toLowerCase() === rg.toLowerCase() || r.slug === rg.toLowerCase());
  if (!region) return { error: `unknown region "${rg}"${state ? ` for ${state.name}` : ""}` };
  if (state && region.state !== state.code) return { error: `region "${rg}" is not in ${state.name}` };
  return { state: region.state, region: region.key };
}
