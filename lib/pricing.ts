import { createClient } from "./supabase/server";
import { AD_RATES } from "./ads";

export interface ProfileTier {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  cta: string;
  href: string;
  highlight: boolean;
  features: string[];
}
export interface PartnerTier {
  name: string;
  price: string;
  cadence: string;
  highlight: boolean;
  features: string[];
}
export interface AdPackage {
  name: string;
  desc: string;
  price: string;
}
export interface AdRates {
  cpmStandard: { national: number; multi: number; few: number };
  cpmVolume: { national: number; multi: number; few: number };
  newsletterPerIssue: number;
}
/** Per-entity-type annual prices for the two paid tiers (admin-editable). */
export interface ClaimPlan {
  label: string;
  claim: number; // basic paid claim, annual USD
  featured: number; // premium tier, annual USD
}
export type ClaimTierKey = "free" | "claim" | "featured";

/** Shared tier definitions (names + what each includes). Code-level copy;
 *  prices live per-type in claimPlans so admins control the money in one place. */
export const CLAIM_TIERS: { key: ClaimTierKey; name: string; tagline: string; features: string[] }[] = [
  {
    key: "free",
    name: "Free listing",
    tagline: "Be found",
    features: ["Listed in the directory", "Real parent reviews & rating shown", "Appears in search & rankings"],
  },
  {
    key: "claim",
    name: "Claim",
    tagline: "Manage your profile",
    features: [
      "Everything in Free, plus:",
      "“Managed by owner” badge on your profile",
      "Edit your info, links & upload a logo",
      "Post tryout dates — shown in the homepage ticker",
      "Respond to every review",
      "Announce college, pro & national-team commitments",
      "Ad-free profile",
      "Owner dashboard: profile views, family messages & monthly rank trend",
    ],
  },
];
export interface PromoCode {
  code: string;
  kind: "percent" | "amount";
  value: number;
  note?: string;
  expires?: string;
  active: boolean;
}
export interface ReferralConfig {
  enabled: boolean;
  refereeDiscount: number; // $ off for the new claimer who used a code
  referrerReward: number; // $ credit to the referrer when the referee pays
  blurb: string;
}

export interface PricingConfig {
  profileTiers: ProfileTier[];
  partnerTiers: PartnerTier[];
  adPackages: AdPackage[];
  adRates: AdRates;
  claimPlans: Record<string, ClaimPlan>;
  promos: PromoCode[];
  referral: ReferralConfig;
  /** Temporary flat-fee promo: when enabled, every paid type is priced at
   *  `price`, except types in `exceptTypes` (which keep their own rate) and
   *  any type whose base price is $0 (e.g. public facilities stay free). */
  flatPromo?: { enabled: boolean; price: number; exceptTypes: string[] };
}

export const DEFAULT_PRICING: PricingConfig = {
  profileTiers: [
    {
      name: "Free",
      price: "$0",
      cadence: "forever",
      tagline: "Your basic listing",
      cta: "Claim for free",
      href: "/clubs",
      highlight: false,
      features: [
        "Standard directory listing",
        "Core info: leagues, age groups, location",
        "Reviews & community rating shown",
        "Appears in search & rankings",
      ],
    },
    {
      name: "Pro",
      price: "$29",
      cadence: "/mo",
      tagline: "Manage your reputation",
      cta: "Start Pro",
      href: "/advertise#contact",
      highlight: true,
      features: [
        "Everything in Free, plus:",
        "Verified ✓ badge for trust",
        "Respond to every review publicly",
        "Photo & video gallery + logo upload",
        "Full description, links & social",
        "Post tryouts & events to the alert ticker",
        "Announce college, pro & national-team commitments",
        "Lead-capture “Request info” button",
        "Profile-views & search analytics",
      ],
    },
    {
      name: "Featured",
      price: "$79",
      cadence: "/mo",
      tagline: "Top of the list",
      cta: "Go Featured",
      href: "/advertise#contact",
      highlight: false,
      features: [
        "Everything in Pro, plus:",
        "★ Featured placement — pinned atop the directory",
        "Featured badge & highlight ring",
        "Priority slot in search results",
        "Ad-free profile (no competitor ads)",
        "Homepage & region spotlight rotation",
        "Monthly performance report",
      ],
    },
  ],
  partnerTiers: [
    {
      name: "Gold",
      price: "$3,000",
      cadence: "/year",
      highlight: false,
      features: [
        "$2,500 advertising credit (banner + newsletter)",
        "Pro profile included — verified, gallery, review responses",
        "Featured placement on your directory",
        "Up to 3 featured tournament / event listings",
        "Priority logo placement across the site",
        "4 newsletter brand inclusions",
        "Unlimited commitment announcements",
        "Editorial profile review",
        "Monthly performance report — real impressions & clicks",
      ],
    },
    {
      name: "Platinum",
      price: "$6,000",
      cadence: "/year",
      highlight: true,
      features: [
        "Everything in Gold, plus:",
        "$5,000 advertising credit",
        "Featured profile with priority placement",
        "Up to 5 featured tournament / event listings",
        "Top-priority, site-wide logo placement",
        "8 newsletter brand inclusions + 1 sole-sponsor issue",
        "Staff-written feature article",
        "Homepage & region spotlight rotation",
        "Monthly performance report",
      ],
    },
  ],
  adPackages: [
    { name: "Homepage banner", desc: "Sole sponsor of the homepage banner slot for the month.", price: "from $400/mo" },
    { name: "Directory sponsorship", desc: "Own the sidebar slot on Clubs, Schools or Coaches — in front of parents comparing programs.", price: "from $250/mo" },
    { name: "News in-feed", desc: "A native slot inside the news feed parents read each week.", price: "from $200/mo" },
    { name: "Profile local sponsor", desc: "Your business featured on the club & school pages in your area.", price: "from $150/mo" },
    { name: "Rankings sponsor", desc: "Sponsor the slot on one of the most-shared pages on the site.", price: "from $300/mo" },
    { name: "The Sideline newsletter", desc: "Sole sponsor of a weekly issue, in every subscriber inbox.", price: "from $350/issue" },
  ],
  adRates: {
    cpmStandard: { ...AD_RATES.cpm.standard },
    cpmVolume: { ...AD_RATES.cpm.volume },
    newsletterPerIssue: AD_RATES.newsletterPerIssue,
  },
  // Annual claim price per entity type (basic listing stays free; claiming is paid).
  claimPlans: {
    // Per-type annual rates (admin-editable in /admin/pricing). Two tiers only:
    // Free (unclaimed) + Claim. `featured` mirrors `claim` for back-compat.
    // Facilities are $0 — free for public city/county/state facilities (the claim
    // form requires confirming that). All values editable by admin.
    club: { label: "Club", claim: 199.99, featured: 199.99 },
    school: { label: "High School", claim: 99.99, featured: 99.99 },
    coach: { label: "Coach", claim: 49.99, featured: 49.99 },
    "training-center": { label: "Training Center", claim: 249.99, featured: 249.99 },
    facility: { label: "Facility", claim: 0, featured: 0 },
    tournament: { label: "Tournament", claim: 299.99, featured: 299.99 },
    camp: { label: "Camp", claim: 199.99, featured: 199.99 },
  },
  // Off by default; admin flips on for a "$99 for everyone except coaches" sale.
  flatPromo: { enabled: false, price: 99, exceptTypes: ["coach"] },
  promos: [
    { code: "LAUNCH50", kind: "percent", value: 50, note: "Launch — 50% off year one", active: true },
    { code: "SAVE25", kind: "amount", value: 25, note: "$25 off", active: true },
  ],
  referral: {
    enabled: true,
    refereeDiscount: 25,
    referrerReward: 25,
    blurb: "Refer another program — when they claim, you both get $25.",
  },
};

/** Look up the per-type plan (label + both tier prices). */
export function claimPlanFor(cfg: PricingConfig, type: string): ClaimPlan {
  return cfg.claimPlans[type] ?? { label: "Profile", claim: 199, featured: 399 };
}

/** Annual price for a given entity type. Applies the flat-fee promo when active:
 *  every paid type is priced at the flat rate, except `exceptTypes` (e.g. coaches
 *  keep their lower rate) and free types (base $0, e.g. public facilities). */
export function claimPriceFor(cfg: PricingConfig, type: string, tier: "claim" | "featured" = "claim"): number {
  const plan = claimPlanFor(cfg, type);
  const base = tier === "featured" ? plan.featured : plan.claim;
  const fp = cfg.flatPromo;
  if (fp?.enabled && base > 0 && !(fp.exceptTypes ?? []).includes(type)) return fp.price;
  return base;
}

/** Validate a promo code against config; returns the $ discount on a given price. */
export function applyPromo(cfg: PricingConfig, code: string, price: number): { ok: boolean; discount: number; note?: string } {
  const c = (code || "").trim().toUpperCase();
  const promo = cfg.promos.find((p) => p.active && p.code.toUpperCase() === c);
  if (!promo) return { ok: false, discount: 0 };
  if (promo.expires && Date.now() > Date.parse(promo.expires)) return { ok: false, discount: 0 };
  const discount = promo.kind === "percent" ? Math.round((price * promo.value) / 100) : Math.min(price, promo.value);
  return { ok: true, discount, note: promo.note };
}

/** Reads admin-edited pricing from site_config (key='pricing'), falling back to
 *  the code defaults. Public-readable, so any page can call it. */
export async function getPricing(): Promise<PricingConfig> {
  const supabase = createClient();
  if (!supabase) return DEFAULT_PRICING;
  try {
    const { data } = await supabase.from("site_config").select("value").eq("key", "pricing").single();
    if (data?.value) return { ...DEFAULT_PRICING, ...(data.value as Partial<PricingConfig>) };
    return DEFAULT_PRICING;
  } catch {
    return DEFAULT_PRICING;
  }
}
