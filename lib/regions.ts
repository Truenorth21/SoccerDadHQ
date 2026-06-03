export type RegionKey =
  | "south-florida"
  | "palm-beach-treasure-coast"
  | "southwest-florida"
  | "tampa-bay"
  | "orlando-central"
  | "space-coast-daytona"
  | "jacksonville-ne"
  | "north-gainesville"
  | "panhandle-tallahassee";

export interface Region {
  key: RegionKey;
  name: string;
  short: string;
  description: string;
}

export const REGIONS: Region[] = [
  {
    key: "south-florida",
    name: "South Florida",
    short: "Miami / Broward",
    description: "Miami-Dade & Broward — the deepest, most competitive youth pyramid in the state.",
  },
  {
    key: "palm-beach-treasure-coast",
    name: "Palm Beach / Treasure Coast",
    short: "Palm Beach / TC",
    description: "Palm Beach County up through the Treasure Coast.",
  },
  {
    key: "southwest-florida",
    name: "Southwest Florida",
    short: "Naples / Fort Myers",
    description: "Naples, Fort Myers, Sarasota and the Gulf Coast.",
  },
  {
    key: "tampa-bay",
    name: "Tampa Bay",
    short: "Tampa / St. Pete",
    description: "Tampa, St. Petersburg, Clearwater and the I-4 corridor's west end.",
  },
  {
    key: "orlando-central",
    name: "Orlando / Central FL",
    short: "Orlando",
    description: "Greater Orlando, Seminole, Lake and Osceola counties.",
  },
  {
    key: "space-coast-daytona",
    name: "Space Coast / Daytona",
    short: "Space Coast",
    description: "Brevard County and the Daytona / Volusia coastline.",
  },
  {
    key: "jacksonville-ne",
    name: "Jacksonville / NE Florida",
    short: "Jacksonville",
    description: "Jacksonville, St. Augustine, Ponte Vedra and the First Coast.",
  },
  {
    key: "north-gainesville",
    name: "North FL / Gainesville",
    short: "Gainesville",
    description: "Gainesville, Ocala and North Central Florida.",
  },
  {
    key: "panhandle-tallahassee",
    name: "Panhandle / Tallahassee",
    short: "Panhandle",
    description: "Tallahassee, Pensacola and the Emerald Coast.",
  },
];

export const REGION_MAP: Record<RegionKey, Region> = REGIONS.reduce(
  (acc, r) => ({ ...acc, [r.key]: r }),
  {} as Record<RegionKey, Region>
);

export function regionName(key: string): string {
  return REGION_MAP[key as RegionKey]?.name ?? key;
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
