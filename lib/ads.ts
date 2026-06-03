export type AdPlacement =
  | "home-banner"
  | "directory-sidebar"
  | "news-infeed"
  | "profile-sidebar"
  | "rankings-sidebar"
  | "newsletter";

export interface Ad {
  id: string;
  advertiser: string;
  headline: string;
  body: string;
  cta: string;
  href: string;
  color: string;
  /** house = our own promo shown when no paid ad is sold for the slot */
  house?: boolean;
  /** affiliate = monetized referral link; shows an "Affiliate" label + disclosure */
  affiliate?: boolean;
  /** optional banner image URL (advertiser artwork) */
  image?: string;
  /** flight window (ISO dates) — outside it the ad isn't shown */
  starts?: string;
  ends?: string;
}

/* Sample paid local-sponsor inventory (the kind of advertisers this site sells to). */
const INVENTORY: Ad[] = [
  {
    id: "ad-photog",
    advertiser: "Sideline Snaps Photography",
    headline: "Game-day photos that pop",
    body: "Action shots & team portraits for Florida clubs and high schools. Book your season package.",
    cta: "See packages",
    href: "/advertise",
    color: "#1d7a4d",
  },
  {
    id: "ad-gear",
    advertiser: "Score Sports Gear",
    headline: "Team kits & training gear",
    body: "Custom uniforms, balls and equipment with bulk club pricing and fast Florida shipping.",
    cta: "Shop team deals",
    href: "/advertise",
    color: "#1a4fa0",
  },
  {
    id: "ad-speed",
    advertiser: "Elite Speed & Agility",
    headline: "Faster on the ball",
    body: "Soccer-specific speed, agility and strength training. Small groups across Central Florida.",
    cta: "Book a session",
    href: "/advertise",
    color: "#9b2d2d",
  },
  {
    id: "ad-tourney",
    advertiser: "Sunshine Tournament Series",
    headline: "Register for the Spring Classic",
    body: "College-showcase tournaments across the state. Early-bird team rates end soon.",
    cta: "Register now",
    href: "/advertise",
    color: "#5a2d82",
  },
  {
    id: "ad-camp",
    advertiser: "First Touch ID Camp",
    headline: "Summer college ID camps",
    body: "Get seen by college coaches. Residential and day camps for U14–U18 boys & girls.",
    cta: "Reserve a spot",
    href: "/advertise",
    color: "#2a7de1",
  },
  {
    id: "ad-recruit",
    advertiser: "RecruitReady",
    headline: "Build your recruiting profile",
    body: "Highlight videos, college lists and outreach tools for serious student-athletes.",
    cta: "Get started",
    href: "/advertise",
    color: "#0a1628",
  },
  {
    id: "ad-gear-affiliate",
    advertiser: "Soccer Gear",
    headline: "Cleats, balls & team kits",
    body: "Shop the latest boots and training gear — fast shipping for Florida families.",
    cta: "Shop now",
    href: "https://www.example.com/?ref=soccerdadhq", // replace with your affiliate link
    color: "#9b2d2d",
    affiliate: true,
  },
];

/* House ads — shown when a slot has no paid sponsor, and always honest about it. */
const HOUSE: Record<AdPlacement, Ad> = {
  "home-banner": {
    id: "house-home",
    advertiser: "SoccerDadHQ",
    headline: "Put your club in front of Florida soccer families",
    body: "Featured placement, profile upgrades and newsletter sponsorships. Reach thousands of parents weekly.",
    cta: "Advertise with us",
    href: "/advertise",
    color: "#1a4fa0",
    house: true,
  },
  "directory-sidebar": {
    id: "house-dir",
    advertiser: "SoccerDadHQ",
    headline: "Reach families searching right now",
    body: "Sponsor this directory and get seen by parents comparing programs in your area.",
    cta: "See ad options",
    href: "/advertise",
    color: "#142844",
    house: true,
  },
  "news-infeed": {
    id: "house-news",
    advertiser: "SoccerDadHQ",
    headline: "Sponsor the news feed",
    body: "Native placement alongside the youth-soccer stories parents read every week.",
    cta: "Advertise",
    href: "/advertise",
    color: "#1d7a4d",
    house: true,
  },
  "profile-sidebar": {
    id: "house-profile",
    advertiser: "SoccerDadHQ",
    headline: "Advertise to local soccer families",
    body: "Your business, shown on the club and school pages parents browse most.",
    cta: "Get local reach",
    href: "/advertise",
    color: "#1a4fa0",
    house: true,
  },
  "rankings-sidebar": {
    id: "house-rank",
    advertiser: "SoccerDadHQ",
    headline: "Sponsor the rankings",
    body: "High-visibility placement on one of the site's most-shared pages.",
    cta: "Advertise",
    href: "/advertise",
    color: "#5a2d82",
    house: true,
  },
  newsletter: {
    id: "house-news-letter",
    advertiser: "SoccerDadHQ",
    headline: "Sponsor The Sideline",
    body: "One sponsor per issue, in front of every subscriber's inbox.",
    cta: "Become a sponsor",
    href: "/advertise",
    color: "#e8a020",
    house: true,
  },
};

/* Self-promos rotate through UNSOLD slots so they're never blank. Weighted so
 *  the conversion drivers (claim, advertise, subscribe) show more often than
 *  the pure content promos. */
const SELF_PROMOS: { weight: number; ad: Ad }[] = [
  { weight: 3, ad: { id: "promo-claim", advertiser: "SoccerDadHQ", headline: "Is this your club?", body: "Claim your profile to respond to reviews, post tryouts and showcase commitments.", cta: "Claim & upgrade", href: "/advertise", color: "#1a4fa0", house: true } },
  { weight: 2, ad: { id: "promo-advertise", advertiser: "SoccerDadHQ", headline: "Advertise to soccer families", body: "Reach thousands of Florida parents weekly with featured placement & sponsorships.", cta: "Advertise with us", href: "/advertise", color: "#0a1628", house: true } },
  { weight: 2, ad: { id: "promo-sideline", advertiser: "The Sideline", headline: "Get the weekly Sideline", body: "Tryout alerts, ranking shifts & recruiting news for your region — free.", cta: "Subscribe free", href: "/#newsletter", color: "#e8a020", house: true } },
  { weight: 1, ad: { id: "promo-rankings", advertiser: "SoccerDadHQ", headline: "Vote in the rankings", body: "Who are Florida's top clubs, coaches and teams? Cast your vote this month.", cta: "See rankings", href: "/rankings", color: "#5a2d82", house: true } },
  { weight: 1, ad: { id: "promo-commits", advertiser: "SoccerDadHQ", headline: "Where do players go?", body: "College, pro & national-team commitments from Florida programs.", cta: "Commitment tracker", href: "/commitments", color: "#1d7a4d", house: true } },
];

/** Weighted filler pool: the slot's contextual house ad once, plus each
 *  self-promo repeated by its weight. */
function fillerPool(house: Ad): Ad[] {
  const pool: Ad[] = [house];
  for (const p of SELF_PROMOS) for (let i = 0; i < p.weight; i++) pool.push(p.ad);
  return pool;
}

export interface AdsConfig {
  inventory: Ad[];
  house: Record<AdPlacement, Ad>;
}

/** Code defaults — used until an admin saves overrides to site_config. */
export const DEFAULT_ADS: AdsConfig = { inventory: INVENTORY, house: HOUSE };

/** Is a sold ad within its flight window right now? (house/self-promos always are.) */
function isActive(ad: Ad, now: number): boolean {
  if (ad.starts && now < Date.parse(ad.starts)) return false;
  if (ad.ends && now > Date.parse(ad.ends)) return false;
  return true;
}

/** Deterministic pick so SSR and client agree. `seed` rotates which creative
 *  shows. Sold (active) inventory fills ~70% of slots; the rest — and any
 *  unsold slot — rotates a self-promo so the space is never blank. Pure. */
export function resolveAd(config: AdsConfig, placement: AdPlacement, seed = 0): Ad {
  const now = Date.now();
  const sold = (config.inventory ?? []).filter((a) => isActive(a, now));
  const house = config.house?.[placement] ?? HOUSE[placement];

  if (sold.length && seed % 10 >= 3) {
    return sold[seed % sold.length];
  }
  // Unsold (or the ~30% house share): weighted self-promo so it's never empty.
  const fillers = fillerPool(house);
  return fillers[seed % fillers.length];
}

/** Convenience for callers without a config (e.g. emails) — uses code defaults. */
export function getAd(placement: AdPlacement, seed = 0): Ad {
  return resolveAd(DEFAULT_ADS, placement, seed);
}

/* ------------------------------------------------------------------ *
 *  Rate card — drives the pre-paid Ad Order Form estimator.
 *  CPM model mirrors a standard banner buy: cheaper per-1,000 at volume,
 *  small premium for tighter geo-targeting.
 * ------------------------------------------------------------------ */
export const AD_RATES = {
  geo: [
    { key: "national", label: "National (USA)" },
    { key: "multi", label: "Regional — 5 to 49 states" },
    { key: "few", label: "Local — 1 to 4 states / Florida only" },
  ] as const,
  // dollars per 1,000 impressions
  cpm: {
    standard: { national: 10, multi: 11, few: 12 }, // 20k–80k impressions
    volume: { national: 8, multi: 9, few: 10 }, // 100k+ impressions
  },
  volumeThreshold: 100_000,
  impressionBlocks: [20_000, 40_000, 80_000, 100_000, 250_000, 500_000],
  minImpressions: 20_000,
  newsletterPerIssue: 350,
  placements: [
    { key: "home-banner", label: "Homepage leaderboard (728×90)", type: "impressions" },
    { key: "directory", label: "Directory sidebar / leaderboard (300×250 · 728×90)", type: "impressions" },
    { key: "news", label: "News feed — native in-feed", type: "impressions" },
    { key: "profile", label: "Club / School profile — local sponsor (300×250)", type: "impressions" },
    { key: "rankings", label: "Rankings page (728×90)", type: "impressions" },
    { key: "newsletter", label: "The Sideline newsletter — issue sponsor", type: "newsletter" },
  ] as const,
};

export interface CpmRates {
  cpmStandard: { national: number; multi: number; few: number };
  cpmVolume: { national: number; multi: number; few: number };
  newsletterPerIssue: number;
}

const DEFAULT_RATES: CpmRates = {
  cpmStandard: AD_RATES.cpm.standard,
  cpmVolume: AD_RATES.cpm.volume,
  newsletterPerIssue: AD_RATES.newsletterPerIssue,
};

export function estimateAdCost(
  opts: {
    placementType: "impressions" | "newsletter";
    impressions: number;
    geo: "national" | "multi" | "few";
    issues: number;
  },
  rates: CpmRates = DEFAULT_RATES
): number {
  if (opts.placementType === "newsletter") {
    return Math.max(1, opts.issues) * rates.newsletterPerIssue;
  }
  const tier = opts.impressions >= AD_RATES.volumeThreshold ? rates.cpmVolume : rates.cpmStandard;
  const rate = tier[opts.geo];
  return Math.round((opts.impressions / 1000) * rate);
}
