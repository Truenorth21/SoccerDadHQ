import { publicClient } from "./supabase/public";
import { DEFAULT_ADS, type AdsConfig } from "./ads";

/** Reads admin-edited ad inventory + house ads from site_config (key='ads'),
 *  falling back to the code defaults. Server-only. */
export async function getAdsConfig(): Promise<AdsConfig> {
  const supabase = publicClient();
  if (!supabase) return DEFAULT_ADS;
  try {
    const { data } = await supabase.from("site_config").select("value").eq("key", "ads").single();
    const v = data?.value as Partial<AdsConfig> | undefined;
    if (!v) return DEFAULT_ADS;
    return {
      // Respect an explicitly-saved inventory even when empty — clearing all
      // sponsors must stick (an empty list lets AdSense fill the waterfall).
      // Only fall back to the demo defaults when no inventory was ever saved.
      inventory: Array.isArray(v.inventory) ? v.inventory : DEFAULT_ADS.inventory,
      house: { ...DEFAULT_ADS.house, ...(v.house ?? {}) },
    };
  } catch {
    return DEFAULT_ADS;
  }
}
