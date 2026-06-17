import { cache } from "react";
import { publicClient } from "./supabase/public";
import type { AdSize } from "@/components/AdUnit";

export type { AdSize };

export interface AdPlacement {
  /** Stable key used in code and as the table primary key. */
  slot: string;
  /** Human description of where this renders (shown in the admin table). */
  location: string;
  size: AdSize;
  /** AdSense ad-unit slot id. Empty = not configured → nothing renders. */
  adsense_slot_id: string;
  enabled: boolean;
}

/** AdSense fills each ad space when no direct sponsor is sold for it (tier 2 of
 *  the waterfall in <AdSlot>). Keyed by ad-slot CATEGORY — the same `placement`
 *  values <AdSlot> already uses — so one toggle + slot id covers every position
 *  in that category. DB rows (table `ad_placements`) override slot id / enabled;
 *  these defaults supply the labels and seed the admin table. */
export const AD_PLACEMENTS: AdPlacement[] = [
  { slot: "home-banner", location: "Homepage — hero unit & mid-page banner", size: "leaderboard", adsense_slot_id: "", enabled: false },
  { slot: "directory-sidebar", location: "Directories (clubs, coaches, schools, listings) — leaderboard & sidebar", size: "sidebar", adsense_slot_id: "", enabled: false },
  { slot: "profile-sidebar", location: "Profiles (club, coach, school, listing) — sidebar", size: "sidebar", adsense_slot_id: "", enabled: false },
  { slot: "news-infeed", location: "News — top leaderboard & in-feed", size: "rectangle", adsense_slot_id: "", enabled: false },
  { slot: "rankings-sidebar", location: "Rankings & commitments — leaderboard", size: "leaderboard", adsense_slot_id: "", enabled: false },
];

const VALID_SIZES: AdSize[] = ["leaderboard", "rectangle", "sidebar"];

/** Reads admin overrides from `ad_placements`, merged over the defaults.
 *  Cached per request, so a page with several slots makes one DB round-trip.
 *  Server-only (uses the cookieless public client). */
export const getAdPlacements = cache(async (): Promise<AdPlacement[]> => {
  const supabase = publicClient();
  if (!supabase) return AD_PLACEMENTS;
  try {
    // .order() varies the Data Cache key so admin edits show up (see supabase/public.ts).
    const { data } = await supabase.from("ad_placements").select("*").order("slot");
    const bySlot = new Map((data ?? []).map((r: { slot: string }) => [r.slot, r]));
    return AD_PLACEMENTS.map((d) => {
      const r = bySlot.get(d.slot) as Partial<AdPlacement> | undefined;
      if (!r) return d;
      return {
        ...d,
        location: typeof r.location === "string" && r.location ? r.location : d.location,
        size: VALID_SIZES.includes(r.size as AdSize) ? (r.size as AdSize) : d.size,
        adsense_slot_id: typeof r.adsense_slot_id === "string" ? r.adsense_slot_id : d.adsense_slot_id,
        enabled: Boolean(r.enabled),
      };
    });
  } catch {
    return AD_PLACEMENTS;
  }
});

/** A single placement by slot, or undefined if unknown. */
export async function getAdPlacement(slot: string): Promise<AdPlacement | undefined> {
  return (await getAdPlacements()).find((p) => p.slot === slot);
}

export type AdPlacementClient = Pick<AdPlacement, "enabled" | "adsense_slot_id" | "size">;

/** Placements keyed by slot for client lookup — passed into <AdsProvider> so
 *  <AdSlot> can resolve its category's AdSense config without a per-render DB hit. */
export async function getAdPlacementsMap(): Promise<Record<string, AdPlacementClient>> {
  const list = await getAdPlacements();
  return Object.fromEntries(
    list.map((p) => [p.slot, { enabled: p.enabled, adsense_slot_id: p.adsense_slot_id, size: p.size }])
  );
}
